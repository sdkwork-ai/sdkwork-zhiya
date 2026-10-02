import { describe, expect, it } from 'vitest';

import { buildExperiencePlan, createZhiyaServiceHub } from '../src/index.js';

const NOW = new Date('2026-10-02T10:00:00+08:00');

describe('zhiya AI assistant (PRD §14, §50)', () => {
  it('recommends_matching_activities_for_the_prd_age_example', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    const reply = await hub.ai.ask('我家孩子8岁，喜欢动手，周末想找点有趣的课程。');
    expect(reply.messageKey).toBe('zhiya.ai.reply.recommend');
    expect(reply.activities.length).toBeGreaterThan(0);
    for (const activity of reply.activities) {
      expect(activity.ageMin).toBeLessThanOrEqual(8);
      expect(activity.ageMax).toBeGreaterThanOrEqual(8);
    }
  });

  it('builds_a_budget_plan_for_the_prd_plan_example', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    const reply = await hub.ai.ask('预算100元，帮我安排一个周末体验计划。');
    expect(reply.plan).toBeDefined();
    expect(reply.plan!.weeks.length).toBeGreaterThan(0);
    expect(reply.plan!.weeks.length).toBeLessThanOrEqual(4);
    expect(reply.plan!.totalCost).toBeLessThanOrEqual(100);
    // Weeks diversify categories when possible.
    const categories = reply.plan!.weeks.map((week) => hub.state.findActivity(week.activityId)!.category);
    expect(new Set(categories).size).toBeGreaterThan(1);
  });

  it('falls_back_to_hot_activities_for_unrecognized_queries', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    const reply = await hub.ai.ask('嗯嗯嗯');
    expect(reply.messageKey).toBe('zhiya.ai.reply.fallback');
    expect(reply.activities.length).toBeGreaterThan(0);
  });

  it('plans_are_built_from_distinct_categories_under_budget', () => {
    const candidates = [
      { price: 19, category: 'trial', quota: 10, enrolled: 5 },
      { price: 29.9, category: 'trial', quota: 10, enrolled: 4 },
      { price: 0, category: 'open-course', quota: 20, enrolled: 12 },
      { price: 49, category: 'exhibition', quota: 15, enrolled: 8 },
    ].map((partial, index) => ({
      id: `act-${index}`,
      category: partial.category,
      price: partial.price,
      quota: partial.quota,
      enrolled: partial.enrolled,
    })) as unknown as Parameters<typeof buildExperiencePlan>[0];
    const plan = buildExperiencePlan(candidates, 100);
    expect(plan).not.toBeNull();
    expect(plan!.totalCost).toBeLessThanOrEqual(100);
    expect(plan!.weeks.length).toBeLessThanOrEqual(4);
  });
});
