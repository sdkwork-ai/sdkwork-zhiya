import { describe, expect, it } from 'vitest';

import { createZhiyaServiceHub, RegistrationError } from '../src/index.js';

/** Fixed clock: everything in the seed catalog is upcoming relative to it. */
const NOW = new Date('2026-10-02T10:00:00+08:00');

function childInput() {
  return {
    nickname: '小鸭',
    gender: 'boy' as const,
    birthDate: '2018-05-01', // 8 years old at NOW
    interests: ['programming' as const],
    stage: 'primary-low' as const,
  };
}

async function arrange() {
  const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
  const child = await hub.family.addChild(childInput());
  const activities = await hub.activity.listActivities();
  const trial = activities.find((activity) => activity.id === 'act-101');
  if (trial === undefined) {
    throw new Error('seed act-101 missing');
  }
  return { hub, child, trial, session: trial.sessions[0]! };
}

describe('zhiya registration order flow (PRD §9)', () => {
  it('creates_pays_and_derives_upcoming_status_with_a_voucher', async () => {
    const { hub, child, trial, session } = await arrange();
    const order = await hub.order.createRegistrationOrder({
      activityId: trial.id,
      sessionId: session!.id,
      childId: child.id,
    });
    expect(order.status).toBe('pending-payment');
    const paid = await hub.order.payOrder(order.id, 'wechat');
    expect(paid.status).toBe('upcoming');
    expect(paid.voucherCode).toMatch(/^ZY[A-Z0-9]{6}$/u);
    const orders = await hub.order.listOrders();
    expect(orders).toHaveLength(1);
  });

  it('rejects_a_child_outside_the_activity_age_range', async () => {
    const { hub, trial, session } = await arrange();
    const young = await hub.family.addChild({ ...childInput(), birthDate: '2021-05-01' });
    await expect(
      hub.order.createRegistrationOrder({ activityId: trial.id, sessionId: session!.id, childId: young.id }),
    ).rejects.toMatchObject({ code: 'age-not-fit' satisfies RegistrationError['code'] });
  });

  it('rejects_duplicate_registration_for_the_same_child', async () => {
    const { hub, child, trial, session } = await arrange();
    const draft = { activityId: trial.id, sessionId: session!.id, childId: child.id };
    const order = await hub.order.createRegistrationOrder(draft);
    await hub.order.payOrder(order.id, 'alipay');
    await expect(hub.order.createRegistrationOrder(draft)).rejects.toMatchObject({ code: 'duplicate' });
  });

  it('rejects_time_conflicts_across_activities_for_the_same_child', async () => {
    const { hub, child, trial, session } = await arrange();
    const order = await hub.order.createRegistrationOrder({
      activityId: trial.id,
      sessionId: session!.id,
      childId: child.id,
    });
    await hub.order.payOrder(order.id, 'wechat');

    // Org publishes an overlapping activity on the exact same slot.
    const overlapping = await hub.org.createActivity(
      {
        title: '冲突活动',
        subtitle: '冲突活动',
        category: 'training',
        mode: 'offline',
        ageMin: 5,
        ageMax: 12,
        startTime: session!.startTime,
        endTime: session!.endTime,
        address: '北京市海淀区某街道 1 号',
        price: 10,
        originalPrice: 20,
        quota: 5,
        introduction: '与 act-101 场次完全重叠',
        notice: '',
        tags: ['thinking'],
      },
      true,
    );
    await expect(
      hub.order.createRegistrationOrder({
        activityId: overlapping.id,
        sessionId: overlapping.sessions[0]!.id,
        childId: child.id,
      }),
    ).rejects.toMatchObject({ code: 'time-conflict' satisfies RegistrationError['code'] });
  });

  it('moves_paid_orders_to_pending_review_once_the_activity_ends', async () => {
    const { hub, child, trial, session } = await arrange();
    const order = await hub.order.createRegistrationOrder({
      activityId: trial.id,
      sessionId: session!.id,
      childId: child.id,
    });
    await hub.order.payOrder(order.id, 'wechat');

    const endTime = new Date(trial.endTime);
    const afterEnd = new Date(endTime.getTime() + 60_000);
    hub.state.now = () => afterEnd;
    const orders = await hub.order.listOrders({ status: 'pending-review' });
    expect(orders.map((entry) => entry.id)).toContain(order.id);
  });
});
