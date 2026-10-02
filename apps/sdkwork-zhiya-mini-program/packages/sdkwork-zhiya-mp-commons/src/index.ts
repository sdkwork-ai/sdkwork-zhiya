/**
 * Domain-neutral view-model helpers for the WeChat surface (mp-commons).
 * No `wx.*`, no `Page()`/`Component()` — pure functions and zh label maps.
 */

/** Format an activity/session ISO start as `M/D HH:mm`. */
export function formatStart(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const pad = (input: number): string => String(input).padStart(2, '0');
  return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Price display: `¥19` / `¥29.9`; zero renders the free label. */
export function formatPrice(value: number): string {
  if (value === 0) {
    return '免费';
  }
  return `¥${Number.isInteger(value) ? value : value.toFixed(value * 10 % 1 === 0 ? 1 : 2)}`;
}

/** Remaining-quota sentence (PRD §7.3 activity card). */
export function quotaLabel(quota: number, enrolled: number): string {
  const remaining = Math.max(quota - enrolled, 0);
  return remaining === 0 ? '已满员' : `仅剩${remaining}个名额`;
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Coupon scope labels (PRD §17). */
export const COUPON_SCOPE_LABELS: Record<string, string> = {
  platform: '平台券',
  org: '商家券',
  activity: '活动券',
  package: '体验包券',
};

/** Coupon state labels. */
export const COUPON_STATE_LABELS: Record<string, string> = {
  unused: '未使用',
  used: '已使用',
  expired: '已过期',
};

/** Message category labels (PRD §18). */
export const MESSAGE_CATEGORY_LABELS: Record<string, string> = {
  system: '系统通知',
  activity: '活动通知',
  registration: '报名通知',
  payment: '支付通知',
  refund: '退款通知',
  coupon: '优惠通知',
  ai: 'AI通知',
};

/** Child stage labels (PRD §3.2). */
export const CHILD_STAGE_LABELS: Record<string, string> = {
  kindergarten: '幼儿园',
  'primary-low': '小学低年级',
  'primary-high': '小学高年级',
  junior: '初中',
  senior: '高中',
};

export const EDUCATION_TAG_LABELS: Record<string, string> = {
  programming: '编程',
  robotics: '机器人',
  science: '科学',
  art: '美术',
  music: '音乐',
  english: '英语',
  sports: '体育',
  thinking: '思维',
  drama: '戏剧',
  nature: '自然',
};
