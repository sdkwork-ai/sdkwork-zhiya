/**
 * Activity capability view-models for the WeChat surface (PRD §7–§9):
 * category list, detail, and the registration → order flow used by the
 * pages/activity tab and the detail subpackage.
 */

import { getZhiyaClient, RegistrationError } from '@sdkwork/zhiya-service-core';
import type { Activity, UserCoupon } from '@sdkwork/zhiya-service-core';

import { formatPrice, formatStart, quotaLabel } from '@sdkwork/zhiya-mp-commons';
import { toActivityCardView } from '@sdkwork/zhiya-mp-home';

export { toActivityCardView };
export type { ActivityCardView } from '@sdkwork/zhiya-mp-home';

/** List published activities, optionally filtered by category token. */
export async function listActivities(
  categoryLabels: Record<string, string>,
  category?: string,
): Promise<ReturnType<typeof toActivityCardView>[]> {
  const activity = getZhiyaClient('activity');
  const list = await activity.listActivities({
    category: category === undefined || category === 'all' ? undefined : (category as never),
  });
  return list.map((entry) => toActivityCardView(entry, categoryLabels[entry.category] ?? entry.category));
}

export interface ActivityDetailView {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  orgName: string;
  categoryLabel: string;
  priceLabel: string;
  originalLabel: string | null;
  startLabel: string;
  endLabel: string;
  address: string;
  ageLabel: string;
  quotaLabel: string;
  introduction: string;
  notice: string;
  remaining: number;
  ratingLabel: string | null;
  reviews: { id: string; authorName: string; stars: string; content: string }[];
}

/** Load the activity detail view (PRD §8). */
export async function loadActivityDetail(
  activityId: string,
  categoryLabel: string,
): Promise<ActivityDetailView | null> {
  const activityClient = getZhiyaClient('activity');
  const reviewClient = getZhiyaClient('review');
  const activity = await activityClient.getActivity(activityId);
  if (activity === null) {
    return null;
  }
  const reviews = await reviewClient.listByActivity(activityId);
  const rating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.overall, 0) / reviews.length : null;
  return {
    id: activity.id,
    emoji: activity.emoji,
    title: activity.title,
    subtitle: activity.subtitle,
    orgName: activity.orgName,
    categoryLabel,
    priceLabel: formatPrice(activity.price),
    originalLabel: activity.originalPrice > activity.price ? `¥${activity.originalPrice}` : null,
    startLabel: formatStart(activity.startTime),
    endLabel: formatStart(activity.endTime),
    address: activity.address,
    ageLabel: `适合 ${activity.ageMin}-${activity.ageMax} 岁孩子`,
    quotaLabel: quotaLabel(activity.quota, activity.enrolled),
    introduction: activity.introduction,
    notice: activity.notice,
    remaining: Math.max(activity.quota - activity.enrolled, 0),
    ratingLabel: rating !== null ? `${rating.toFixed(1)} 分 · ${reviews.length}条评价` : null,
    reviews: reviews.slice(0, 5).map((review) => ({
      id: review.id,
      authorName: review.authorName,
      stars: '★'.repeat(review.overall),
      content: review.content,
    })),
  };
}

export interface RegisterPickers {
  activity: { id: string; title: string; priceLabel: string };
  children: { id: string; nickname: string }[];
  sessions: { id: string; label: string; remaining: number }[];
  coupons: { id: string; title: string; discountLabel: string }[];
}

/** Registration pickers: children + sessions + applicable coupons (PRD §9.1). */
export async function loadRegisterPickers(activityId: string): Promise<RegisterPickers | null> {
  const activityClient = getZhiyaClient('activity');
  const familyClient = getZhiyaClient('family');
  const orderClient = getZhiyaClient('order');
  const activity = await activityClient.getActivity(activityId);
  if (activity === null) {
    return null;
  }
  const [children, coupons] = await Promise.all([
    familyClient.listChildren(),
    orderClient.listApplicableCoupons({ kind: 'activity', id: activityId }, activity.price, {
      orgId: activity.orgId,
    }),
  ]);
  return {
    activity: { id: activity.id, title: activity.title, priceLabel: formatPrice(activity.price) },
    children: children.map((child) => ({ id: child.id, nickname: child.nickname })),
    sessions: activity.sessions.map((session) => ({
      id: session.id,
      label: `${session.label} · ${formatStart(session.startTime)}`,
      remaining: Math.max(session.quota - session.enrolled, 0),
    })),
    coupons: coupons.map((coupon: UserCoupon) => ({
      id: coupon.id,
      title: coupon.title,
      discountLabel: `-¥${coupon.amountOff}`,
    })),
  };
}

export type RegisterErrorCode =
  | 'age-not-fit'
  | 'sold-out'
  | 'duplicate'
  | 'time-conflict'
  | 'child-not-found'
  | 'coupon-invalid'
  | 'not-open';

const ERROR_MESSAGES: Record<RegisterErrorCode, string> = {
  'age-not-fit': '孩子年龄不在活动适龄范围内',
  'sold-out': '来晚一步，名额已被抢光',
  duplicate: '该孩子已报名此活动，无需重复报名',
  'time-conflict': '与已报名活动时间冲突，请调整场次',
  'child-not-found': '请选择参加的孩子',
  'coupon-invalid': '优惠券不可用，请重新选择',
  'not-open': '活动当前不可报名',
};

export interface CreateOrderResult {
  ok: boolean;
  orderId?: string;
  error?: string;
}

/** Create the registration order; typed rejection reasons → zh copy (PRD §9.2). */
export async function createRegistrationOrder(input: {
  activityId: string;
  sessionId: string;
  childId: string;
  couponId?: string;
}): Promise<CreateOrderResult> {
  const orderClient = getZhiyaClient('order');
  try {
    const order = await orderClient.createRegistrationOrder({
      activityId: input.activityId,
      sessionId: input.sessionId,
      childId: input.childId,
      couponId: input.couponId,
    });
    return { ok: true, orderId: order.id };
  } catch (caught) {
    if (caught instanceof RegistrationError) {
      return { ok: false, error: ERROR_MESSAGES[caught.code as RegisterErrorCode] ?? ERROR_MESSAGES['not-open'] };
    }
    return { ok: false, error: ERROR_MESSAGES['not-open'] };
  }
}

/** Mock pay (PRD §9.1 支付). */
export async function payOrder(orderId: string, method: 'wechat' | 'alipay'): Promise<boolean> {
  const orderClient = getZhiyaClient('order');
  try {
    await orderClient.payOrder(orderId, method);
    return true;
  } catch {
    return false;
  }
}

export interface PackageDetailView {
  id: string;
  emoji: string;
  title: string;
  summary: string;
  priceLabel: string;
  originalLabel: string | null;
  validDaysLabel: string;
  purchasedLabel: string;
  includedActivities: ReturnType<typeof toActivityCardView>[];
}

/** 体验包详情 (PRD §12.2/§12.3). */
export async function loadPackageDetail(
  packageId: string,
  categoryLabels: Record<string, string>,
): Promise<PackageDetailView | null> {
  const pkgClient = getZhiyaClient('package');
  const activityClient = getZhiyaClient('activity');
  const pkg = await pkgClient.getPackage(packageId);
  if (pkg === null) {
    return null;
  }
  const activities = (await Promise.all(pkg.activityIds.map((id) => activityClient.getActivity(id))))
    .filter((activity): activity is NonNullable<typeof activity> => activity !== null);
  return {
    id: pkg.id,
    emoji: pkg.emoji,
    title: pkg.title,
    summary: pkg.summary,
    priceLabel: formatPrice(pkg.price),
    originalLabel: pkg.originalPrice > pkg.price ? `¥${pkg.originalPrice}` : null,
    validDaysLabel: `有效期 ${pkg.validDays} 天`,
    purchasedLabel: `${pkg.purchasedCount}人已购买`,
    includedActivities: activities.map((activity) => toActivityCardView(activity, categoryLabels[activity.category] ?? activity.category)),
  };
}

export interface PackageBuyResult {
  ok: boolean;
  orderId?: string;
  error?: string;
}

/** 购买体验包：自动套用最优体验包券后下单 (PRD §12/§29). */
export async function createPackageOrder(packageId: string): Promise<PackageBuyResult> {
  const pkgClient = getZhiyaClient('package');
  const orderClient = getZhiyaClient('order');
  const pkg = await pkgClient.getPackage(packageId);
  if (pkg === null) {
    return { ok: false, error: '体验包不存在' };
  }
  try {
    const applicable = await orderClient.listApplicableCoupons({ kind: 'package', id: packageId }, pkg.price);
    const order = await orderClient.createPackageOrder(packageId, applicable[0]?.id);
    return { ok: true, orderId: order.id };
  } catch (caught) {
    if (caught instanceof RegistrationError && caught.code === 'coupon-invalid') {
      return { ok: false, error: '优惠券不可用' };
    }
    return { ok: false, error: '下单失败，请稍后重试' };
  }
}

/** Activity-level seed used by pages/activity (category chips + list). */
export const ACTIVITY_CATEGORY_TABS: readonly { id: string; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'trial', label: '体验课' },
  { id: 'online-course', label: '线上课' },
  { id: 'parent-child', label: '亲子' },
  { id: 'study-tour', label: '研学' },
  { id: 'competition', label: '比赛' },
  { id: 'exhibition', label: '展览' },
];

export type { Activity };
