import { describe, expect, it } from 'vitest';

import { createZhiyaServiceHub, VerifyVoucherError } from '../src/index.js';

const NOW = new Date('2026-10-02T10:00:00+08:00');

async function arrange() {
  const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
  const child = await hub.family.addChild({
    nickname: '小鸭',
    gender: 'boy',
    birthDate: '2018-05-01',
    interests: ['science'],
    stage: 'primary-low',
  });
  const activity = (await hub.activity.listActivities()).find((entry) => entry.id === 'act-103')!;
  const order = await hub.order.createRegistrationOrder({
    activityId: activity.id,
    sessionId: activity.sessions[0]!.id,
    childId: child.id,
  });
  const paid = await hub.order.payOrder(order.id, 'wechat');
  return { hub, child, activity, paid };
}

describe('zhiya check-in flow (PRD §11, §22.4)', () => {
  it('verifies_a_voucher_and_marks_the_order_checked_in', async () => {
    const { hub, paid } = await arrange();
    const view = await hub.checkin.verifyVoucher(paid.voucherCode!);
    expect(view.checkInState).toBe('checked-in');
    const orders = await hub.order.listOrders({ status: 'ongoing' });
    expect(orders.map((entry) => entry.id)).toContain(paid.id);
  });

  it('rejects_unknown_and_reused_vouchers', async () => {
    const { hub, paid } = await arrange();
    await expect(hub.checkin.verifyVoucher('ZY000000')).rejects.toMatchObject({
      code: 'voucher-not-found' satisfies VerifyVoucherError['code'],
    });
    await hub.checkin.verifyVoucher(paid.voucherCode!);
    await expect(hub.checkin.verifyVoucher(paid.voucherCode!)).rejects.toMatchObject({
      code: 'voucher-already-used' satisfies VerifyVoucherError['code'],
    });
  });

  it('completing_the_activity_moves_paid_orders_to_pending_review', async () => {
    const { hub, activity, paid } = await arrange();
    const completed = await hub.checkin.completeActivity(activity.id);
    expect(completed).toBe(1);
    const orders = await hub.order.listOrders({ status: 'pending-review' });
    expect(orders.map((entry) => entry.id)).toContain(paid.id);
  });

  it('supports_a_full_loop_checkin_complete_review_completed', async () => {
    const { hub, activity, paid, child } = await arrange();
    await hub.checkin.verifyVoucher(paid.voucherCode!);
    await hub.checkin.completeActivity(activity.id);
    const review = await hub.review.submitReview({
      orderId: paid.id,
      overall: 5,
      experience: 5,
      teacher: 4,
      environment: 5,
      service: 5,
      recommend: true,
      content: '孩子做实验特别投入，下期还报！',
      authorName: '鸭妈妈',
    });
    expect(review.id).toBeTruthy();
    const orders = await hub.order.listOrders({ status: 'completed' });
    expect(orders.map((entry) => entry.id)).toContain(paid.id);
    const reviews = await hub.review.listByActivity(activity.id);
    expect(reviews).toHaveLength(1);
    expect(reviews[0]!.childName).toBe(child.nickname);
  });
});
