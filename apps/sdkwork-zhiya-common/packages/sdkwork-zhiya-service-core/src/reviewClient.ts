/**
 * Mock ReviewPort (PRD §21). Reviews persist; the org cannot modify them.
 * Submitting is only allowed for orders in 待评价 (derived), which closes the
 * loop: review → order 已完成.
 */

import type { ReviewPort } from './ports.js';
import type { Review } from './types.js';
import type { ZhiyaMockState } from './state.js';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMockReviewClient(state: ZhiyaMockState): ReviewPort {
  return {
    async submitReview(input) {
      const order = state.orders.find((entry) => entry.id === input.orderId);
      if (order === undefined) {
        throw new Error(`order not found: ${input.orderId}`);
      }
      if (order.status !== 'paid' || order.reviewId !== undefined) {
        throw new Error(`order not reviewable: ${input.orderId}`);
      }
      const item = order.items[0];
      if (item?.activityId === undefined) {
        throw new Error(`order has no activity: ${input.orderId}`);
      }
      const activity = state.findActivity(item.activityId);
      const ended = order.orgCompleted || (activity !== null && new Date(activity.endTime).getTime() <= state.now().getTime());
      if (!ended) {
        throw new Error(`activity not finished: ${String(item.activityId)}`);
      }
      const review: Review = {
        id: makeId('rev'),
        orderId: order.id,
        activityId: item.activityId,
        authorName: input.authorName,
        childName: item.childName,
        overall: clampScore(input.overall),
        experience: clampScore(input.experience),
        teacher: clampScore(input.teacher),
        environment: clampScore(input.environment),
        service: clampScore(input.service),
        recommend: input.recommend,
        content: input.content,
        createdAt: state.now().toISOString(),
      };
      state.reviews.unshift(review);
      order.reviewId = review.id;
      state.persist();
      state.notify({
        category: 'activity',
        title: '评价成功',
        body: `感谢你对「${item.title}」的评价，成长记录又多了一笔！`,
        orderId: order.id,
      });
      return review;
    },
    async listByActivity(activityId) {
      return state.reviews
        .filter((review) => review.activityId === activityId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },
    async getByOrder(orderId) {
      return state.reviews.find((review) => review.orderId === orderId) ?? null;
    },
  };
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 5;
  }
  return Math.min(5, Math.max(1, Math.round(value)));
}
