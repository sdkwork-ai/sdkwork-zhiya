/**
 * Mock CheckInPort — org-side voucher verification (PRD §11/§22.4).
 * Voucher codes map 1:1 to paid activity orders; verifying flips the order to
 * 已签到, which the order client derives to 进行中 on the C-end.
 */

import type { CheckInPort } from './ports.js';
import type { OrgRegistrationView } from './types.js';
import type { ZhiyaMockState } from './state.js';
import { deriveOrderStatus } from './orderStatus.js';

export type VerifyVoucherErrorCode = 'voucher-not-found' | 'voucher-not-paid' | 'voucher-already-used';

export class VerifyVoucherError extends Error {
  readonly code: VerifyVoucherErrorCode;
  constructor(code: VerifyVoucherErrorCode, message: string) {
    super(message);
    this.name = 'VerifyVoucherError';
    this.code = code;
  }
}

export function createMockCheckInClient(state: ZhiyaMockState): CheckInPort {
  function toView(orderId: string): OrgRegistrationView | null {
    const order = state.orders.find((entry) => entry.id === orderId);
    if (order === undefined || order.type !== 'activity') {
      return null;
    }
    const item = order.items[0];
    if (item?.activityId === undefined || item.sessionId === undefined) {
      return null;
    }
    const activity = state.findActivity(item.activityId);
    if (activity === null) {
      return null;
    }
    const session = activity.sessions.find((entry) => entry.id === item.sessionId);
    return {
      orderId: order.id,
      activityId: activity.id,
      activityTitle: activity.title,
      sessionId: item.sessionId,
      sessionLabel: session?.label ?? '',
      childName: item.childName ?? '',
      parentPhone: order.contactPhone,
      voucherCode: order.voucherCode ?? '',
      status: deriveOrderStatus(state, order),
      checkInState: order.checkInState,
      createdAt: order.createdAt,
    };
  }

  return {
    async listOrgRegistrations(filter) {
      const views = state.orders
        .map((order) => toView(order.id))
        .filter((view): view is OrgRegistrationView => view !== null)
        .filter((view) => view.voucherCode.length > 0)
        .filter((view) => filter?.activityId === undefined || view.activityId === filter.activityId)
        .filter((view) => (filter?.pendingOnly === true ? view.checkInState === 'none' && view.status !== 'refunded' && view.status !== 'cancelled' : true))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      return views;
    },
    async verifyVoucher(code) {
      const normalized = code.trim().toUpperCase();
      if (normalized.length === 0) {
        throw new VerifyVoucherError('voucher-not-found', 'empty voucher code');
      }
      const order = state.orders.find(
        (entry) => entry.type === 'activity' && (entry.voucherCode ?? '').toUpperCase() === normalized,
      );
      if (order === undefined) {
        throw new VerifyVoucherError('voucher-not-found', `voucher not found: ${normalized}`);
      }
      if (order.status !== 'paid') {
        throw new VerifyVoucherError('voucher-not-paid', `order not paid: ${order.id}`);
      }
      if (order.checkInState === 'checked-in') {
        throw new VerifyVoucherError('voucher-already-used', `voucher already used: ${normalized}`);
      }
      order.checkInState = 'checked-in';
      state.persist();
      const view = toView(order.id);
      if (view === null) {
        throw new VerifyVoucherError('voucher-not-found', `registration view missing: ${order.id}`);
      }
      state.notify({
        category: 'activity',
        title: '签到成功',
        body: `「${view.activityTitle}」已签到，祝玩得开心！`,
        orderId: order.id,
      });
      return view;
    },
    async completeActivity(activityId) {
      let completed = 0;
      for (const order of state.orders) {
        if (order.type !== 'activity' || order.status !== 'paid' || order.orgCompleted) {
          continue;
        }
        const item = order.items[0];
        if (item?.activityId !== activityId) {
          continue;
        }
        order.orgCompleted = true;
        completed += 1;
        state.notify({
          category: 'activity',
          title: '活动已结束',
          body: `「${item.title}」已结束，去给它打个分吧！`,
          orderId: order.id,
        });
      }
      if (completed > 0) {
        state.persist();
      }
      return completed;
    },
  };
}
