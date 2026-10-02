/**
 * Mock OrderPort — the transactional core of the P0 loop (PRD §9/§29/§30).
 *
 * Registration runs all PRD §9.2 checks (age fit, quota, duplicate, time
 * conflict, enrollment window) and throws typed `RegistrationError`s. Order
 * status shown to users is derived from the raw status + activity time +
 * check-in/review progress (PRD §29), so the org-side check-in and completion
 * flow automatically move C-end orders through 待参加 → 进行中 → 待评价.
 */

import type { OrderDraftRef, OrderPort } from './ports.js';
import { RegistrationError } from './ports.js';
import type { Order, OrderItem, OrderView, UserCoupon } from './types.js';
import { applyEnrollmentDelta } from './state.js';
import type { ZhiyaMockState } from './state.js';
import { ageOf } from './familyClient.js';
import { withDerivedStatus } from './orderStatus.js';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeVoucherCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = 'ZY';
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

export interface MockOrderClientDeps {
  /** Whether the acting profile counts as a new user (新人券, PRD §17). */
  isNewUser?: () => boolean;
}

export function createMockOrderClient(state: ZhiyaMockState, deps: MockOrderClientDeps = {}): OrderPort {
  const isNewUser = deps.isNewUser ?? (() => state.orders.length === 0);

  function couponApplies(
    coupon: UserCoupon,
    ref: OrderDraftRef,
    amount: number,
    orgId?: string,
  ): boolean {
    if (coupon.state !== 'unused') {
      return false;
    }
    if (coupon.expireAt <= state.now().toISOString()) {
      return false;
    }
    switch (coupon.scope) {
      case 'platform':
        break;
      case 'org':
        if (coupon.orgId === undefined || coupon.orgId !== orgId) {
          return false;
        }
        break;
      case 'activity':
        if (ref.kind !== 'activity' || coupon.activityId !== ref.id) {
          return false;
        }
        break;
      case 'package':
        if (ref.kind !== 'package' || coupon.packageId !== ref.id) {
          return false;
        }
        break;
    }
    if (coupon.minSpend > amount) {
      return false;
    }
    if (coupon.templateId === 'tpl-newbie' && !isNewUser()) {
      return false;
    }
    return true;
  }

  function computeDiscount(coupon: UserCoupon | null, amount: number): number {
    if (coupon === null) {
      return 0;
    }
    return Math.min(coupon.amountOff, amount);
  }

  async function resolveCouponForDraft(
    couponId: string | undefined,
    ref: OrderDraftRef,
    amount: number,
    orgId: string,
  ): Promise<{ coupon: UserCoupon | null; discount: number }> {
    if (couponId === undefined) {
      return { coupon: null, discount: 0 };
    }
    const coupon = state.coupons.find((entry) => entry.id === couponId);
    if (coupon === undefined || !couponApplies(coupon, ref, amount, orgId)) {
      throw new RegistrationError('coupon-invalid', `coupon not applicable: ${String(couponId)}`);
    }
    return { coupon, discount: computeDiscount(coupon, amount) };
  }

  return {
    async previewRegistration(draft) {
      const activity = state.findActivity(draft.activityId);
      if (activity === null) {
        throw new RegistrationError('activity-not-found', `activity not found: ${draft.activityId}`);
      }
      const session = activity.sessions.find((entry) => entry.id === draft.sessionId);
      if (session === undefined) {
        throw new RegistrationError('session-not-found', `session not found: ${draft.sessionId}`);
      }
      const { coupon, discount } = await resolveCouponForDraft(
        draft.couponId,
        { kind: 'activity', id: activity.id },
        activity.price,
        activity.orgId,
      );
      return {
        amount: activity.price,
        discount,
        payable: activity.price - discount,
        coupon,
      };
    },

    async createRegistrationOrder(draft) {
      const activity = state.findActivity(draft.activityId);
      if (activity === null) {
        throw new RegistrationError('activity-not-found', `activity not found: ${draft.activityId}`);
      }
      const session = activity.sessions.find((entry) => entry.id === draft.sessionId);
      if (session === undefined) {
        throw new RegistrationError('session-not-found', `session not found: ${draft.sessionId}`);
      }
      const child = state.family?.children.find((entry) => entry.id === draft.childId);
      if (child === undefined || child === null) {
        throw new RegistrationError('child-not-found', `child not found: ${draft.childId}`);
      }
      const now = state.now();
      if (activity.status !== 'published' || new Date(activity.startTime).getTime() <= now.getTime()) {
        throw new RegistrationError('not-open', `activity not open: ${activity.id}`);
      }
      if (activity.enrolled >= activity.quota) {
        throw new RegistrationError('sold-out', `activity sold out: ${activity.id}`);
      }
      if (session.enrolled >= session.quota) {
        throw new RegistrationError('sold-out', `session sold out: ${session.id}`);
      }
      const childAge = ageOf(child, now);
      if (childAge < activity.ageMin || childAge > activity.ageMax) {
        throw new RegistrationError('age-not-fit', `child age ${childAge} outside [${activity.ageMin}, ${activity.ageMax}]`);
      }
      const duplicate = state.orders.find(
        (order) =>
          order.type === 'activity' &&
          (order.status === 'paid' || order.status === 'pending-payment') &&
          order.items.some(
            (item) => item.activityId === activity.id && (item.childId === undefined || item.childId === child.id),
          ),
      );
      if (duplicate !== undefined) {
        throw new RegistrationError('duplicate', `duplicate registration: ${activity.id}/${child.id}`);
      }
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);
      const conflict = state.orders.find((order) => {
        if (order.type !== 'activity' || (order.status !== 'paid' && order.status !== 'pending-payment')) {
          return false;
        }
        return order.items.some((item) => {
          if (item.childId !== child.id) {
            return false;
          }
          const other = state.findActivity(item.activityId ?? '');
          const otherSession = other?.sessions.find((entry) => entry.id === item.sessionId);
          if (other === null || other === undefined || otherSession === undefined) {
            return false;
          }
          return rangesOverlap(sessionStart, sessionEnd, new Date(otherSession.startTime), new Date(otherSession.endTime));
        });
      });
      if (conflict !== undefined) {
        throw new RegistrationError('time-conflict', `time conflict with order ${conflict.id}`);
      }

      const item = buildItem(activity, session.id, child.id, child.nickname);
      const { coupon, discount } = await resolveCouponForDraft(
        draft.couponId,
        { kind: 'activity', id: activity.id },
        activity.price,
        activity.orgId,
      );

      const order: Order = {
        id: makeId('ord'),
        type: 'activity',
        status: 'pending-payment',
        items: [item],
        amount: activity.price,
        discount,
        payable: activity.price - discount,
        couponId: coupon?.id,
        checkInState: 'none',
        orgCompleted: false,
        createdAt: now.toISOString(),
        contactPhone: '138****8000',
      };
      state.orders.unshift(order);
      state.persist();
      state.notify({
        category: 'registration',
        title: '报名订单已创建',
        body: `「${activity.title}」订单已创建，请尽快完成支付。`,
        orderId: order.id,
      });
      return withDerivedStatus(state, order);
    },

    async createPackageOrder(packageId, couponId) {
      const pkg = state.packages.find((entry) => entry.id === packageId);
      if (pkg === undefined) {
        throw new RegistrationError('activity-not-found', `package not found: ${packageId}`);
      }
      const now = state.now();
      const placeholderItem: OrderItem = {
        id: makeId('item'),
        orderType: 'package',
        packageId: pkg.id,
        title: pkg.title,
        emoji: pkg.emoji,
        orgId: 'platform',
        orgName: '知鸭平台',
        price: pkg.price,
      };
      const { coupon, discount } = await resolveCouponForDraft(
        couponId,
        { kind: 'package', id: pkg.id },
        pkg.price,
        'platform',
      );
      const order: Order = {
        id: makeId('ord'),
        type: 'package',
        status: 'pending-payment',
        items: [placeholderItem],
        amount: pkg.price,
        discount,
        payable: pkg.price - discount,
        couponId: coupon?.id,
        checkInState: 'none',
        orgCompleted: false,
        createdAt: now.toISOString(),
        contactPhone: '138****8000',
      };
      state.orders.unshift(order);
      state.persist();
      state.notify({
        category: 'registration',
        title: '体验包订单已创建',
        body: `「${pkg.title}」订单已创建，请尽快完成支付。`,
        orderId: order.id,
      });
      return withDerivedStatus(state, order);
    },

    async payOrder(orderId, method) {
      const order = requireOrder(orderId);
      if (order.status !== 'pending-payment') {
        throw new RegistrationError('not-open', `order not payable: ${orderId}`);
      }
      const now = state.now();
      order.status = 'paid';
      order.payMethod = method;
      order.paidAt = now.toISOString();
      if (order.couponId !== undefined) {
        const coupon = state.coupons.find((entry) => entry.id === order.couponId);
        if (coupon !== undefined) {
          coupon.state = 'used';
          coupon.usedByOrderId = order.id;
        }
      }
      if (order.type === 'activity') {
        const item = order.items[0];
        if (item !== undefined) {
          applyEnrollmentDelta(state, item.activityId ?? '', item.sessionId ?? '', +1);
        }
        order.voucherCode = makeVoucherCode();
        state.notify({
          category: 'payment',
          title: '支付成功',
          body: `「${item?.title ?? '活动'}」报名成功，凭证码 ${order.voucherCode}。`,
          orderId: order.id,
        });
      } else {
        state.notify({
          category: 'payment',
          title: '支付成功',
          body: `「${order.items[0]?.title ?? '体验包'}」购买成功，可在我的订单中使用。`,
          orderId: order.id,
        });
      }
      state.persist();
      return withDerivedStatus(state, order) satisfies OrderView;
    },

    async cancelOrder(orderId) {
      const order = requireOrder(orderId);
      if (order.status !== 'pending-payment') {
        throw new RegistrationError('not-open', `order not cancellable: ${orderId}`);
      }
      order.status = 'cancelled';
      state.persist();
      state.notify({
        category: 'refund',
        title: '订单已取消',
        body: `订单 ${order.id} 已取消。`,
        orderId: order.id,
      });
      return withDerivedStatus(state, order) satisfies OrderView;
    },

    async refundOrder(orderId) {
      const order = requireOrder(orderId);
      if (order.status !== 'paid') {
        throw new RegistrationError('not-open', `order not refundable: ${orderId}`);
      }
      if (order.type === 'activity' && order.checkInState === 'checked-in') {
        throw new RegistrationError('not-open', `already checked in: ${orderId}`);
      }
      const now = state.now();
      if (order.type === 'activity') {
        const item = order.items[0];
        if (item !== undefined) {
          applyEnrollmentDelta(state, item.activityId ?? '', item.sessionId ?? '', -1);
        }
      }
      order.status = 'refunded';
      order.refundedAt = now.toISOString();
      state.persist();
      state.notify({
        category: 'refund',
        title: '退款成功',
        body: `订单 ${order.id} 已退款 ¥${order.payable.toFixed(2)}，预计 1-3 个工作日到账。`,
        orderId: order.id,
      });
      return withDerivedStatus(state, order) satisfies OrderView;
    },

    async getOrder(orderId) {
      const order = state.orders.find((entry) => entry.id === orderId);
      return order !== undefined ? withDerivedStatus(state, order) : null;
    },

    async listOrders(filter) {
      const derived = state.orders.map((order) => withDerivedStatus(state, order));
      return derived.filter((order) => {
        if (filter?.type !== undefined && order.type !== filter.type) {
          return false;
        }
        const status = filter?.status;
        if (status === undefined || status === 'all') {
          return true;
        }
        return order.status === status;
      });
    },

    async listApplicableCoupons(ref, amount, options) {
      return state.coupons
        .filter((coupon) => couponApplies(coupon, ref, amount, options?.orgId))
        .sort((left, right) => right.amountOff - left.amountOff);
    },
  };

  function requireOrder(orderId: string): Order {
    const order = state.orders.find((entry) => entry.id === orderId);
    if (order === undefined) {
      throw new RegistrationError('activity-not-found', `order not found: ${orderId}`);
    }
    return order;
  }
}

function buildItem(
  activity: NonNullable<ReturnType<ZhiyaMockState['findActivity']>>,
  sessionId: string,
  childId?: string,
  childName?: string,
): OrderItem {
  const item: OrderItem = {
    id: makeId('item'),
    orderType: 'activity',
    activityId: activity.id,
    sessionId,
    title: activity.title,
    emoji: activity.emoji,
    orgId: activity.orgId,
    orgName: activity.orgName,
    price: activity.price,
  };
  if (childId !== undefined) item.childId = childId;
  if (childName !== undefined) item.childName = childName;
  return item;
}
