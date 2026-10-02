/**
 * Order status derivation (PRD §29 订单状态 + §11 核销状态). Shared by the
 * order client (C-end lists) and the check-in client (org console) so both
 * sides always agree on where an order stands.
 */

import type { Order, OrderStatus, OrderView } from './types.js';
import type { ZhiyaMockState } from './state.js';

/**
 * Derive the user-visible status from the raw status + activity schedule +
 * check-in/review progress:
 *   paid + review                → completed
 *   paid + orgCompleted/ended    → pending-review
 *   paid + checked-in/started    → ongoing
 *   paid                         → upcoming
 * pending-payment/cancelled/refunded pass through.
 */
export function deriveOrderStatus(state: ZhiyaMockState, order: Order): OrderStatus {
  if (order.status !== 'paid') {
    return order.status;
  }
  if (order.reviewId !== undefined) {
    return 'completed';
  }
  if (order.type === 'package') {
    return 'upcoming';
  }
  const item = order.items[0];
  const activity = state.findActivity(item?.activityId ?? '');
  if (activity === null) {
    return 'upcoming';
  }
  const now = state.now().getTime();
  if (order.orgCompleted || new Date(activity.endTime).getTime() <= now) {
    return 'pending-review';
  }
  const session = activity.sessions.find((entry) => entry.id === item?.sessionId);
  const start = new Date(session?.startTime ?? activity.startTime).getTime();
  if (order.checkInState === 'checked-in' || start <= now) {
    return 'ongoing';
  }
  return 'upcoming';
}

/** Copy of an order with the derived status applied (never mutates the store). */
export function withDerivedStatus(state: ZhiyaMockState, order: Order): OrderView {
  const derived = deriveOrderStatus(state, order);
  return { ...order, status: derived } as OrderView;
}
