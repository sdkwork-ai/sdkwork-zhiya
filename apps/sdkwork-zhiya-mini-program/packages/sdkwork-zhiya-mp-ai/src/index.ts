/**
 * 问知鸭 AI capability for the WeChat surface (PRD §14): one-turn chat with
 * recommendation cards and the budget experience plan, rendered by pages/ai.
 */

import { getZhiyaClient } from '@sdkwork/zhiya-service-core';

import { formatPrice } from '@sdkwork/zhiya-mp-commons';
import { toActivityCardView, type ActivityCardView } from '@sdkwork/zhiya-mp-home';

/** zh-CN copy for the service-layer reply keys (fallback = raw key). */
export const REPLY_TEXT: Record<string, string> = {
  'zhiya.ai.reply.recommend': '结合你的需求，为你挑了这些活动：',
  'zhiya.ai.reply.found': '在知鸭上找到这些相关的活动：',
  'zhiya.ai.reply.fallback': '这个问题有点超出我的活动库啦，先看看热门活动吧：',
  'zhiya.ai.reply.plan': '好的！按你的预算为你安排了体验计划：',
  'zhiya.ai.error': '哎呀，网络开小差了，稍后再试试～',
};

export interface AiPlanWeekView {
  weekIndex: number;
  activityId: string;
  title: string;
  priceLabel: string;
}

export interface AiTurnView {
  role: 'user' | 'assistant';
  text: string;
  recommendations?: ActivityCardView[];
  plan?: { totalLabel: string; weeks: AiPlanWeekView[] };
}

export const AI_SUGGESTIONS: readonly string[] = [
  '8岁孩子适合学什么？',
  '周末有什么亲子活动？',
  '想让孩子体验编程，有什么课程？',
  '预算100元，帮我安排一个周末体验计划。',
];

/** One 问知鸭 turn: intent → recommendations/plan → zh view model (PRD §14.1). */
export async function sendAiTurn(text: string, categoryLabels: Record<string, string>): Promise<AiTurnView> {
  const ai = getZhiyaClient('ai');
  try {
    const reply = await ai.ask(text);
    const text2 = REPLY_TEXT[reply.messageKey] ?? reply.messageKey;
    const recommendations = reply.activities.map((activity) =>
      toActivityCardView(activity, categoryLabels[activity.category] ?? activity.category),
    );
    if (reply.plan !== undefined) {
      return {
        role: 'assistant',
        text: `${text2}（共 ${reply.plan.totalCost} 元）`,
        recommendations,
        plan: {
          totalLabel: `合计 ¥${reply.plan.totalCost}`,
          weeks: reply.plan.weeks.map((week) => ({
            weekIndex: week.weekIndex,
            activityId: week.activityId,
            title: week.title,
            priceLabel: formatPrice(week.price),
          })),
        },
      };
    }
    return { role: 'assistant', text: text2, recommendations };
  } catch {
    return { role: 'assistant', text: REPLY_TEXT['zhiya.ai.error'] ?? '出了点问题，请重试' };
  }
}
