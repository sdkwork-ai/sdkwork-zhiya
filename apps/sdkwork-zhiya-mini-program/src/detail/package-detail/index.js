// 体验包详情 (PRD §12.2/§12.3): 包含活动 + 购买须知 + 立即购买.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { detail: null, buying: false },

  onLoad(query) {
    this.refresh(query.id);
  },

  async refresh(id) {
    const detail = await appApi.activity.packageDetail(id);
    this.setData({ detail });
  },

  goActivity(event) {
    wx.navigateTo({ url: `/detail/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  },

  async onBuy() {
    const { detail, buying } = this.data;
    if (!detail || buying) {
      return;
    }
    this.setData({ buying: true });
    const result = await appApi.activity.buyPackage(detail.id);
    this.setData({ buying: false });
    if (result.ok && result.orderId) {
      wx.redirectTo({ url: `/detail/pay/index?orderId=${result.orderId}` });
    } else {
      wx.showToast({ title: result.error || '下单失败', icon: 'none' });
    }
  },
});
