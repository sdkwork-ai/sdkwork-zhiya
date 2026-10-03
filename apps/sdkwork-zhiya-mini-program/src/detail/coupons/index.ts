// 优惠券中心 (PRD §17): 领券 + 我的券 (未使用/已使用/已过期).
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type CouponTab = Parameters<PageApi['profile']['coupons']>[0];
type Coupons = Awaited<ReturnType<PageApi['profile']['coupons']>>;
type IdTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>;

const TABS: readonly { id: CouponTab; label: string }[] = [
  { id: 'claimable', label: '可领取' },
  { id: 'unused', label: '未使用' },
  { id: 'used', label: '已使用' },
  { id: 'expired', label: '已过期' },
];

Page({
  data: { tabs: TABS, tab: 'claimable' as CouponTab, coupons: [] as Coupons, loading: true },

  onLoad() {
    this.refresh('claimable');
  },

  async refresh(tab: CouponTab) {
    this.setData({ loading: true, tab });
    const coupons = await appApi.profile.coupons(tab);
    this.setData({ coupons, loading: false });
  },

  onTab(event: IdTapEvent) {
    this.refresh(event.currentTarget.dataset.id as CouponTab);
  },

  async onClaim(event: IdTapEvent) {
    const message = await appApi.profile.claimCoupon(event.currentTarget.dataset.id);
    wx.showToast({ title: message, icon: 'none' });
    this.refresh('claimable');
  },
});
