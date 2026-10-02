// 收银台 (PRD §9.1 支付): mock 支付.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { order: null, method: 'wechat', paying: false },

  onLoad(query) {
    this.refresh(query.orderId);
  },

  async refresh(orderId) {
    const order = await appApi.trade.order(orderId);
    this.setData({ order });
  },

  onMethod(event) {
    this.setData({ method: event.currentTarget.dataset.method });
  },

  async onPay() {
    const { order, method, paying } = this.data;
    if (!order || paying) {
      return;
    }
    this.setData({ paying: true });
    const ok = await appApi.activity.pay(order.id, method);
    this.setData({ paying: false });
    if (ok) {
      wx.showToast({ title: '支付成功', icon: 'success' });
      wx.redirectTo({ url: `/detail/orders/index?status=upcoming` });
    } else {
      wx.showToast({ title: '支付失败，请重试', icon: 'none' });
    }
  },
});
