import { describe, expect, it } from 'vitest';

import { createZhiyaServiceHub } from '../src/index.js';

const NOW = new Date('2026-10-02T10:00:00+08:00');

describe('zhiya coupons (PRD §17) and order interplay', () => {
  it('claims_coupons_and_applies_the_best_applicable_one_at_preview', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    const claimable = await hub.coupon.listClaimable();
    // New user: the newbie coupon is claimable.
    expect(claimable.some((template) => template.id === 'tpl-newbie')).toBe(true);
    await hub.coupon.claim('tpl-newbie');
    await hub.coupon.claim('tpl-act-103-5');

    const activity = (await hub.activity.listActivities()).find((entry) => entry.id === 'act-103')!;
    const applicable = await hub.order.listApplicableCoupons(
      { kind: 'activity', id: activity.id },
      activity.price,
      { orgId: activity.orgId },
    );
    expect(applicable.map((coupon) => coupon.templateId)).toContain('tpl-newbie');
    expect(applicable.map((coupon) => coupon.templateId)).toContain('tpl-act-103-5');

    const preview = await hub.order.previewRegistration({
      activityId: activity.id,
      sessionId: activity.sessions[0]!.id,
      childId: 'missing',
      couponId: applicable[0]!.id,
    });
    expect(preview.amount).toBe(29.9);
    expect(preview.discount).toBe(10);
    expect(preview.payable).toBeCloseTo(19.9, 5);
  });

  it('hides_newbie_coupons_after_the_first_paid_order', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    await hub.coupon.claim('tpl-newbie');
    const child = await hub.family.addChild({
      nickname: '小鸭',
      gender: 'girl',
      birthDate: '2019-05-01',
      interests: ['art'],
      stage: 'kindergarten',
    });
    const activity = (await hub.activity.listActivities()).find((entry) => entry.id === 'act-104')!;
    const order = await hub.order.createRegistrationOrder({
      activityId: activity.id,
      sessionId: activity.sessions[0]!.id,
      childId: child.id,
    });
    await hub.order.payOrder(order.id, 'wechat');
    const claimable = await hub.coupon.listClaimable();
    expect(claimable.some((template) => template.id === 'tpl-newbie')).toBe(false);
  });

  it('marks_the_coupon_used_on_payment_and_rejects_reuse', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    const coupon = await hub.coupon.claim('tpl-org-1-20');
    const child = await hub.family.addChild({
      nickname: '小鸭',
      gender: 'boy',
      birthDate: '2018-05-01',
      interests: ['programming'],
      stage: 'primary-low',
    });
    const activity = (await hub.activity.listActivities()).find((entry) => entry.id === 'act-101')!;
    const order = await hub.order.createRegistrationOrder({
      activityId: activity.id,
      sessionId: activity.sessions[0]!.id,
      childId: child.id,
      couponId: coupon.id,
    });
    // Discount is capped at the order amount (¥19 < ¥20 coupon).
    expect(order.discount).toBe(19);
    await hub.order.payOrder(order.id, 'alipay');
    const mine = await hub.coupon.listMyCoupons('used');
    expect(mine.map((entry) => entry.id)).toContain(coupon.id);
    // A second registration (different org-1 activity) cannot reuse the spent coupon.
    const other = (await hub.activity.listActivities()).find((entry) => entry.id === 'act-111')!;
    await expect(
      hub.order.createRegistrationOrder({
        activityId: other.id,
        sessionId: other.sessions[0]!.id,
        childId: child.id,
        couponId: coupon.id,
      }),
    ).rejects.toMatchObject({ code: 'coupon-invalid' });
  });
});
