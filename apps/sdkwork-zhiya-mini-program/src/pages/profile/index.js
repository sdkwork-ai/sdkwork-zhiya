// 我的 tab (PRD §20): 家庭、订单、优惠券、消息入口.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { entries: [] },

  onLoad() {
    this.setData({
      entries: [
        { key: 'family', glyph: '👶', title: '我的家庭', desc: '管理孩子资料', url: '/detail/family/index' },
        { key: 'orders', glyph: '📋', title: '我的订单', desc: '报名 / 体验包 / 退款', url: '/detail/orders/index' },
        { key: 'coupons', glyph: '🎟️', title: '优惠券', desc: '领券中心 / 我的卡包', url: '/detail/coupons/index' },
        { key: 'messages', glyph: '🔔', title: '消息中心', desc: '报名、支付、优惠通知', url: '/detail/messages/index' },
      ],
    });
  },

  go(event) {
    wx.navigateTo({ url: event.currentTarget.dataset.url });
  },

  goActivity() {
    wx.switchTab({ url: '/pages/activity/index' });
  },
});
