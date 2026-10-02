// 我的订单 (PRD §29): 状态 tabs + 操作（去支付/取消/退款/去评价）.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { tabs: [], status: 'all', orders: [], loading: true },

  onLoad(query) {
    this.setData({ tabs: appApi.shell.orderStatusTabs });
    this.refresh(query.status || 'all');
  },

  async refresh(status) {
    this.setData({ loading: true, status });
    const orders = await appApi.trade.orders(status);
    this.setData({ orders, loading: false });
  },

  onStatus(event) {
    this.refresh(event.currentTarget.dataset.id);
  },

  async onAction(event) {
    const { id, action } = event.currentTarget.dataset;
    const message = await appApi.trade.action(id, action);
    wx.showToast({ title: message, icon: 'none' });
    this.refresh(this.data.status);
  },

  goReview(event) {
    wx.navigateTo({ url: `/detail/review/index?orderId=${event.currentTarget.dataset.id}` });
  },

  goPay(event) {
    wx.redirectTo({ url: `/detail/pay/index?orderId=${event.currentTarget.dataset.id}` });
  },

  goBenefits(event) {
    wx.navigateTo({ url: `/detail/benefits/index?orderId=${event.currentTarget.dataset.id}` });
  },
});
