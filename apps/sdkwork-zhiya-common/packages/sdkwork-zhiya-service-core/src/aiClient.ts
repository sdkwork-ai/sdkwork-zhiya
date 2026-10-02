/**
 * Mock AiPort — 问知鸭 (PRD §14/§50). One-turn rule-based assistant over the
 * live activity catalog: intent recognition (`intent-core`) → structured
 * filtering → ranked recommendations or a 4-week budget plan. Copy stays as
 * i18n keys + params so surfaces render localized text; the data is real.
 */

import { isEmptyIntent, recognizeActivityIntent } from '@sdkwork/zhiya-intent-core';
import type { ActivityIntent } from '@sdkwork/zhiya-intent-core';

import type { AiPort } from './ports.js';
import type { Activity, AiPlan, AiReply } from './types.js';
import type { ZhiyaMockState } from './state.js';

const FOLLOW_UPS = [
  '8岁孩子适合学什么？',
  '周末有什么亲子活动？',
  '想让孩子体验编程，有什么课程？',
  '预算100元，帮我安排一个周末体验计划。',
] as const;

function makeId(): string {
  return `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function matchesIntent(activity: Activity, intent: ActivityIntent, now: Date): boolean {
  if (activity.status !== 'published') {
    return false;
  }
  if (new Date(activity.endTime).getTime() <= now.getTime()) {
    return false;
  }
  if (intent.age !== undefined && (intent.age < activity.ageMin || intent.age > activity.ageMax)) {
    return false;
  }
  if (intent.categories.length > 0 && !intent.categories.includes(activity.category)) {
    return false;
  }
  if (intent.tags.length > 0 && !intent.tags.some((tag) => activity.tags.includes(tag))) {
    return false;
  }
  if (intent.mode !== undefined && activity.mode !== intent.mode) {
    return false;
  }
  if (intent.freeOnly && activity.price !== 0) {
    return false;
  }
  if (intent.time !== undefined) {
    const starts = [activity.startTime, ...activity.sessions.map((session) => session.startTime)];
    if (intent.time === 'weekend') {
      const weekend = starts.some((start) => {
        const day = new Date(start).getDay();
        return day === 0 || day === 6;
      });
      if (!weekend) {
        return false;
      }
    } else if (intent.time === 'today') {
      const dayEnd = new Date(now);
      dayEnd.setHours(23, 59, 59, 999);
      const within = starts.some((start) => new Date(start).getTime() <= dayEnd.getTime() + 86_400_000);
      if (!within) {
        return false;
      }
    }
  }
  // Keywords are a soft signal: enforced only when no structured constraint
  // was recognized, so "8岁…喜欢动手" is not killed by prose leftovers.
  const hasStructured =
    intent.age !== undefined ||
    intent.budgetMax !== undefined ||
    intent.categories.length > 0 ||
    intent.tags.length > 0 ||
    intent.mode !== undefined ||
    intent.freeOnly ||
    intent.time !== undefined;
  if (intent.keywords.length > 0 && !hasStructured) {
    const haystack = `${activity.title} ${activity.subtitle} ${activity.orgName} ${activity.introduction}`.toLowerCase();
    const matched = intent.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    if (!matched) {
      return false;
    }
  }
  return true;
}

function heatOf(activity: Activity): number {
  return activity.enrolled / Math.max(activity.quota, 1);
}

/** Build a ≤4-week plan from candidates under the budget, diversifying categories (PRD §14.2). */
export function buildExperiencePlan(
  candidates: readonly Activity[],
  budgetMax: number,
): AiPlan | null {
  const budget = budgetMax > 0 ? budgetMax : 300;
  const affordable = candidates
    .filter((activity) => activity.price <= budget)
    .sort((left, right) => heatOf(right) - heatOf(left));
  const chosen: Activity[] = [];
  const usedCategories = new Set<string>();
  let totalCost = 0;
  for (const activity of affordable) {
    if (chosen.length >= 4) {
      break;
    }
    if (usedCategories.has(activity.category) && chosen.length < affordable.length) {
      continue;
    }
    if (totalCost + activity.price > budget) {
      continue;
    }
    chosen.push(activity);
    usedCategories.add(activity.category);
    totalCost += activity.price;
  }
  if (chosen.length === 0) {
    return null;
  }
  return {
    totalBudget: budget,
    totalCost,
    weeks: chosen.map((activity, index) => ({
      weekIndex: index + 1,
      activityId: activity.id,
      title: activity.title,
      price: activity.price,
    })),
  };
}

export function createMockAiClient(state: ZhiyaMockState): AiPort {
  function searchActivities(query: string): { activities: Activity[]; intent: ActivityIntent } {
    const intent = recognizeActivityIntent(query);
    const now = state.now();
    const activities = state
      .allActivities()
      .filter((activity) => matchesIntent(activity, intent, now))
      .sort((left, right) => heatOf(right) - heatOf(left));
    return { activities, intent };
  }

  return {
    async search(query) {
      return searchActivities(query).activities.slice(0, 6);
    },
    async ask(query): Promise<AiReply> {
      const { activities, intent } = searchActivities(query);
      const now = state.now();
      const followUps: string[] = [...FOLLOW_UPS];

      if (intent.wantsPlan) {
        const plan = buildExperiencePlan(activities, intent.budgetMax ?? 300);
        if (plan !== null) {
          const params: Record<string, string | number> = { count: plan.weeks.length, budget: plan.totalCost };
          return {
            id: makeId(),
            messageKey: 'zhiya.ai.reply.plan',
            params,
            activities: plan.weeks
              .map((week) => state.findActivity(week.activityId))
              .filter((activity): activity is Activity => activity !== null),
            plan,
            followUps,
          };
        }
      }

      if (activities.length > 0) {
        const structured = !isEmptyIntent(intent);
        const params: Record<string, string | number> = { count: activities.length };
        if (intent.age !== undefined) {
          params.age = intent.age;
        }
        if (intent.budgetMax !== undefined) {
          params.budget = intent.budgetMax;
        }
        return {
          id: makeId(),
          messageKey: structured ? 'zhiya.ai.reply.recommend' : 'zhiya.ai.reply.found',
          params,
          activities: activities.slice(0, 4),
          followUps,
        };
      }

      return {
        id: makeId(),
        messageKey: 'zhiya.ai.reply.fallback',
        params: {},
        activities: state
          .allActivities()
          .filter((activity) => activity.status === 'published' && new Date(activity.endTime).getTime() > now.getTime())
          .sort((left, right) => heatOf(right) - heatOf(left))
          .slice(0, 3),
        followUps,
      };
    },
  };
}
