/**
 * Trade capability view-models for the WeChat surface (PRD §29/§21): unified
 * orders with status tabs, status actions, and the review form.
 */

import { getZhiyaClient } from '@sdkwork/zhiya-service-core';

import { formatPrice } from '@sdkwork/zhiya-mp-commons';
import { ORDER_STATUS_LABELS } from '@sdkwork/zhiya-mp-shell';

export const ORDER_STATUS_TABS: readonly { id: string; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'pending-payment', label: '待支付' },
  { id: 'upcoming', label: '待参加' },
  { id: 'pending-review', label: '待评价' },
  { id: 'completed', label: '已完成' },
  { id: 'refunded', label: '已退款' },
];

export interface OrderCardView {
  id: string;
  emoji: string;
  title: string;
  statusLabel: string;
  status: string;
  payableLabel: string;
  childName: string | null;
  createdAtLabel: string;
}

/** List orders with derived status (PRD §29). */
export async function listOrders(status?: string): Promise<OrderCardView[]> {
  const order = getZhiyaClient('order');
  const list = await order.listOrders({
    status: status === undefined || status === 'all' ? undefined : (status as never),
  });
  return list.map((entry) => {
    const item = entry.items[0];
    return {
      id: entry.id,
      emoji: item?.emoji ?? '📦',
      title: item?.title ?? '',
      status: entry.status,
      statusLabel: ORDER_STATUS_LABELS[entry.status] ?? entry.status,
      payableLabel: formatPrice(entry.payable),
      childName: item?.childName ?? null,
      createdAtLabel: entry.createdAt.slice(5, 16).replace('T', ' '),
    };
  });
}

export interface OrderDetailView extends OrderCardView {
  amountLabel: string;
  discountLabel: string | null;
  voucherCode: string | null;
  checkInLabel: string | null;
}

/** Order detail with voucher when applicable (PRD §9.3/§11). */
export async function loadOrderDetail(orderId: string): Promise<OrderDetailView | null> {
  const order = getZhiyaClient('order');
  const entry = await order.getOrder(orderId);
  if (entry === null) {
    return null;
  }
  const item = entry.items[0];
  return {
    id: entry.id,
    emoji: item?.emoji ?? '📦',
    title: item?.title ?? '',
    status: entry.status,
    statusLabel: ORDER_STATUS_LABELS[entry.status] ?? entry.status,
    payableLabel: formatPrice(entry.payable),
    childName: item?.childName ?? null,
    createdAtLabel: entry.createdAt.slice(0, 16).replace('T', ' '),
    amountLabel: formatPrice(entry.amount),
    discountLabel: entry.discount > 0 ? `-¥${entry.discount}` : null,
    voucherCode: entry.voucherCode ?? null,
    checkInLabel:
      entry.type === 'activity' && entry.voucherCode !== undefined && entry.status !== 'pending-payment'
        ? entry.checkInState === 'checked-in'
          ? '已签到'
          : '待核销'
        : null,
  };
}

/** Status actions; returns a zh result message for the toast. */
export async function runOrderAction(orderId: string, action: 'pay' | 'cancel' | 'refund'): Promise<string> {
  const order = getZhiyaClient('order');
  try {
    if (action === 'pay') {
      await order.payOrder(orderId, 'wechat');
      return '支付成功';
    }
    if (action === 'cancel') {
      await order.cancelOrder(orderId);
      return '订单已取消';
    }
    await order.refundOrder(orderId);
    return '退款成功，预计 1-3 个工作日到账';
  } catch {
    return '操作失败，请稍后重试';
  }
}

export interface ReviewScores {
  overall: number;
  experience: number;
  teacher: number;
  environment: number;
  service: number;
  recommend: boolean;
  content: string;
}

/** Submit the activity review (PRD §21); returns a zh result message. */
export async function submitReview(orderId: string, scores: ReviewScores): Promise<string> {
  const review = getZhiyaClient('review');
  try {
    await review.submitReview({
      orderId,
      overall: scores.overall,
      experience: scores.experience,
      teacher: scores.teacher,
      environment: scores.environment,
      service: scores.service,
      recommend: scores.recommend,
      content: scores.content,
      authorName: '鸭家长',
    });
    return '评价成功，感谢分享！';
  } catch {
    return '该订单暂不可评价';
  }
}
