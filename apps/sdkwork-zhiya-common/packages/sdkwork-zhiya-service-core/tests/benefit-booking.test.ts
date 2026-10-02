import { describe, expect, it } from 'vitest';

import { createZhiyaServiceHub } from '../src/index.js';

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
  const order = await hub.order.createPackageOrder('pkg-201');
  const paid = await hub.order.payOrder(order.id, 'wechat');
  return { hub, child, paid };
}

describe('zhiya package benefit booking (PRD §12.4/§38.2)', () => {
  it('lists_one_benefit_per_included_activity_all_unbooked_after_purchase', async () => {
    const { hub, paid } = await arrange();
    const benefits = await hub.order.listPackageBenefits(paid.id);
    expect(benefits).toHaveLength(4);
    expect(benefits.every((benefit) => !benefit.booked)).toBe(true);
  });

  it('books_a_benefit_issues_a_voucher_and_updates_quota', async () => {
    const { hub, child, paid } = await arrange();
    const activityId = 'act-101';
    const enrolledBefore = (await hub.activity.getActivity(activityId))!.enrolled;
    const booking = await hub.order.bookPackageBenefit({
      orderId: paid.id,
      activityId,
      sessionId: 'act-101-s1',
      childId: child.id,
    });
    expect(booking.voucherCode).toMatch(/^ZY[A-Z0-9]{6}$/u);
    expect(booking.status).toBe('booked');
    const after = await hub.activity.getActivity(activityId);
    expect(after!.enrolled).toBe(enrolledBefore + 1);

    const benefits = await hub.order.listPackageBenefits(paid.id);
    const booked = benefits.find((benefit) => benefit.activityId === activityId);
    expect(booked?.booked).toBe(true);
    expect(booked?.voucherCode).toBe(booking.voucherCode);
  });

  it('rejects_duplicate_booking_age_mismatch_and_out_of_package_activities', async () => {
    const { hub, child, paid } = await arrange();
    const input = { orderId: paid.id, activityId: 'act-101', sessionId: 'act-101-s1', childId: child.id };
    await hub.order.bookPackageBenefit(input);
    await expect(hub.order.bookPackageBenefit(input)).rejects.toThrow(/already booked/);

    // 年龄不符（3 岁孩子 vs act-101 6-12 岁）
    const young = await hub.family.addChild({
      nickname: '小小鸭',
      gender: 'girl',
      birthDate: '2024-05-01',
      interests: [],
      stage: 'kindergarten',
    });
    await expect(
      hub.order.bookPackageBenefit({ ...input, childId: young.id }),
    ).rejects.toThrow(/outside/);

    // 不在包内
    await expect(
      hub.order.bookPackageBenefit({ orderId: paid.id, activityId: 'act-107', sessionId: 'act-107-s1', childId: child.id }),
    ).rejects.toThrow(/not in package/);
  });

  it('benefit_vouchers_verify_through_the_org_checkin_flow', async () => {
    const { hub, child, paid } = await arrange();
    const booking = await hub.order.bookPackageBenefit({
      orderId: paid.id,
      activityId: 'act-103',
      sessionId: 'act-103-s1',
      childId: child.id,
    });
    const view = await hub.checkin.verifyVoucher(booking.voucherCode);
    expect(view.checkInState).toBe('checked-in');
    expect(view.childName).toBe(child.nickname);
    await expect(hub.checkin.verifyVoucher(booking.voucherCode)).rejects.toMatchObject({
      code: 'voucher-already-used',
    });
  });
});
