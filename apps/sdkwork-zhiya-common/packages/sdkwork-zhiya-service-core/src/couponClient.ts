/**
 * Mock CouponPort (PRD §17). Claiming enforces stock and newbie rules;
 * usage happens through the order flow (coupons flip to `used` on payment).
 */

import type { CouponPort } from './ports.js';
import type { CouponState, CouponTemplate, UserCoupon } from './types.js';
import type { ZhiyaMockState } from './state.js';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMockCouponClient(state: ZhiyaMockState, deps: { isNewUser?: () => boolean } = {}): CouponPort {
  const isNewUser = deps.isNewUser ?? (() => state.orders.length === 0);

  function toUserCoupon(template: CouponTemplate, now: Date): UserCoupon {
    const expire = new Date(now.getTime() + template.validDays * 86_400_000);
    const coupon: UserCoupon = {
      id: makeId('cpn'),
      templateId: template.id,
      title: template.title,
      scope: template.scope,
      amountOff: template.amountOff,
      minSpend: template.minSpend,
      claimedAt: now.toISOString(),
      expireAt: expire.toISOString(),
      state: 'unused',
    };
    if (template.orgId !== undefined) coupon.orgId = template.orgId;
    if (template.activityId !== undefined) coupon.activityId = template.activityId;
    if (template.packageId !== undefined) coupon.packageId = template.packageId;
    return coupon;
  }

  return {
    async listClaimable() {
      const claimedTemplateIds = new Set(state.coupons.filter((coupon) => coupon.state === 'unused').map((coupon) => coupon.templateId));
      return state.couponTemplates.filter((template) => {
        if (template.claimed >= template.total) {
          return false;
        }
        if (template.newbieOnly && !isNewUser()) {
          return false;
        }
        // Hide templates the family already holds unused.
        return !claimedTemplateIds.has(template.id);
      });
    },
    async listMyCoupons(couponState) {
      const now = state.now().toISOString();
      for (const coupon of state.coupons) {
        if (coupon.state === 'unused' && coupon.expireAt <= now) {
          coupon.state = 'expired';
        }
      }
      const all = [...state.coupons].sort((left, right) => right.claimedAt.localeCompare(left.claimedAt));
      return couponState === undefined ? all : all.filter((coupon) => coupon.state === couponState);
    },
    async claim(templateId) {
      const template = state.couponTemplates.find((entry) => entry.id === templateId);
      if (template === undefined) {
        throw new Error(`coupon template not found: ${templateId}`);
      }
      if (template.claimed >= template.total) {
        throw new Error(`coupon sold out: ${templateId}`);
      }
      if (template.newbieOnly && !isNewUser()) {
        throw new Error(`coupon is newbie-only: ${templateId}`);
      }
      const alreadyHeld = state.coupons.some(
        (coupon) => coupon.templateId === templateId && coupon.state === 'unused',
      );
      if (alreadyHeld) {
        throw new Error(`coupon already claimed: ${templateId}`);
      }
      const coupon = toUserCoupon(template, state.now());
      template.claimed += 1;
      state.coupons.unshift(coupon);
      state.persist();
      state.notify({
        category: 'coupon',
        title: '优惠券到账',
        body: `「${template.title}」已放入你的卡包，报名时可直接抵扣。`,
      });
      return coupon;
    },
  };
}

export type { CouponState };
