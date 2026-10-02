// 优惠券中心 (PRD §17): 领券 + 我的券 (未使用/已使用/已过期).
const { appApi } = require('../../runtime/app.js');

const TABS = [
  { id: 'claimable', label: '可领取' },
  { id: 'unused', label: '未使用' },
  { id: 'used', label: '已使用' },
  { id: 'expired', label: '已过期' },
];

Page({
  data: { tabs: TABS, tab: 'claimable', coupons: [], loading: true },

  onLoad() {
    this.refresh('claimable');
  },

  async refresh(tab) {
    this.setData({ loading: true, tab });
    const coupons = await appApi.profile.coupons(tab);
    this.setData({ coupons, loading: false });
  },

  onTab(event) {
    this.refresh(event.currentTarget.dataset.id);
  },

  async onClaim(event) {
    const message = await appApi.profile.claimCoupon(event.currentTarget.dataset.id);
    wx.showToast({ title: message, icon: 'none' });
    this.refresh('claimable');
  },
});
