/**
 * Profile capability view-models for the WeChat surface (PRD §20/§42):
 * family/children management, coupons, and the message center.
 */

import { getZhiyaClient } from '@sdkwork/zhiya-service-core';

import {
  CHILD_STAGE_LABELS,
  COUPON_SCOPE_LABELS,
  COUPON_STATE_LABELS,
  EDUCATION_TAG_LABELS,
  MESSAGE_CATEGORY_LABELS,
} from '@sdkwork/zhiya-mp-commons';

export interface ChildView {
  id: string;
  emoji: string;
  nickname: string;
  stageLabel: string;
  interestsLabel: string;
}

/** Children of the current family (PRD §42). */
export async function listChildren(): Promise<ChildView[]> {
  const family = getZhiyaClient('family');
  const children = await family.listChildren();
  return children.map((child) => ({
    id: child.id,
    emoji: child.emoji,
    nickname: child.nickname,
    stageLabel: CHILD_STAGE_LABELS[child.stage] ?? child.stage,
    interestsLabel: child.interests
      .map((tag) => EDUCATION_TAG_LABELS[tag] ?? tag)
      .join(' / '),
  }));
}

export interface ChildInputView {
  nickname: string;
  gender: 'boy' | 'girl' | 'secret';
  birthDate: string;
  stage: string;
  interests: string[];
}

/** Add or update a child; returns a zh result message. */
export async function saveChild(childId: string | null, input: ChildInputView): Promise<string> {
  const family = getZhiyaClient('family');
  const payload = {
    nickname: input.nickname,
    gender: input.gender,
    birthDate: input.birthDate,
    stage: input.stage as never,
    interests: input.interests as never[],
    notes: undefined,
  };
  try {
    if (childId === null) {
      await family.addChild(payload);
      return '孩子资料已保存';
    }
    await family.updateChild(childId, payload);
    return '孩子资料已更新';
  } catch {
    return '保存失败，请检查填写内容';
  }
}

/** Remove a child. */
export async function removeChild(childId: string): Promise<void> {
  const family = getZhiyaClient('family');
  await family.removeChild(childId);
}

export interface CouponView {
  id: string;
  title: string;
  faceLabel: string;
  scopeLabel: string;
  stateLabel: string | null;
}

/** Coupon center: claimable templates or my coupons by state (PRD §17). */
export async function loadCoupons(tab: 'claimable' | 'unused' | 'used' | 'expired'): Promise<CouponView[]> {
  const coupon = getZhiyaClient('coupon');
  if (tab === 'claimable') {
    const templates = await coupon.listClaimable();
    return templates.map((template) => ({
      id: template.id,
      title: template.title,
      faceLabel: `¥${template.amountOff}${template.minSpend > 0 ? ` 满${template.minSpend}` : ''}`,
      scopeLabel: COUPON_SCOPE_LABELS[template.scope] ?? template.scope,
      stateLabel: null,
    }));
  }
  const mine = await coupon.listMyCoupons(tab as never);
  return mine.map((entry) => ({
    id: entry.id,
    title: entry.title,
    faceLabel: `¥${entry.amountOff}${entry.minSpend > 0 ? ` 满${entry.minSpend}` : ''}`,
    scopeLabel: COUPON_SCOPE_LABELS[entry.scope] ?? entry.scope,
    stateLabel: COUPON_STATE_LABELS[entry.state] ?? entry.state,
  }));
}

/** Claim a coupon; returns a zh result message. */
export async function claimCoupon(templateId: string): Promise<string> {
  const coupon = getZhiyaClient('coupon');
  try {
    const claimed = await coupon.claim(templateId);
    return `「${claimed.title}」已到账`;
  } catch {
    return '领取失败，可能已领取过';
  }
}

export interface MessageView {
  id: string;
  title: string;
  body: string;
  categoryLabel: string;
  timeLabel: string;
  read: boolean;
}

/** Message center list (PRD §18). */
export async function loadMessages(category?: string): Promise<MessageView[]> {
  const message = getZhiyaClient('message');
  const list = await message.listMessages(
    category === undefined || category === 'all' ? undefined : (category as never),
  );
  return list.map((entry) => ({
    id: entry.id,
    title: entry.title,
    body: entry.body,
    categoryLabel: MESSAGE_CATEGORY_LABELS[entry.category] ?? entry.category,
    timeLabel: entry.createdAt.slice(5, 16).replace('T', ' '),
    read: entry.read,
  }));
}

/** Mark all messages read in a category. */
export async function markAllMessagesRead(category?: string): Promise<void> {
  const message = getZhiyaClient('message');
  await message.markAllRead(category === undefined || category === 'all' ? undefined : (category as never));
}
