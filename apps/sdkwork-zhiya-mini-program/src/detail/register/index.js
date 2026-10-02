// 确认报名 (PRD §9): 选儿童 → 选场次 → 选优惠券 → 提交订单.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { pickers: null, childId: '', sessionId: '', couponId: '', submitting: false },

  onLoad(query) {
    this.refresh(query.id);
  },

  async refresh(id) {
    const pickers = await appApi.activity.registerPickers(id);
    if (pickers === null) {
      return;
    }
    this.setData({
      pickers,
      childId: pickers.children.length > 0 ? pickers.children[0].id : '',
      sessionId: pickers.sessions.length > 0 ? pickers.sessions[0].id : '',
    });
  },

  onChild(event) { this.setData({ childId: event.currentTarget.dataset.id }); },
  onSession(event) { this.setData({ sessionId: event.currentTarget.dataset.id }); },
  onCoupon(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ couponId: this.data.couponId === id ? '' : id });
  },

  async onSubmit() {
    const { pickers, childId, sessionId, couponId, submitting } = this.data;
    if (!pickers || submitting) {
      return;
    }
    if (!childId) {
      wx.showToast({ title: '请先到「我的家庭」添加孩子', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    const result = await appApi.activity.createOrder({
      activityId: pickers.activity.id,
      sessionId,
      childId,
      couponId: couponId || undefined,
    });
    this.setData({ submitting: false });
    if (result.ok && result.orderId) {
      wx.redirectTo({ url: `/detail/pay/index?orderId=${result.orderId}` });
    } else {
      wx.showToast({ title: result.error || '下单失败', icon: 'none' });
    }
  },

  goFamily() {
    wx.navigateTo({ url: '/detail/family/index' });
  },
});
