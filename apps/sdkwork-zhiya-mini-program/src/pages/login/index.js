// 登录 (PRD §3.1, P0): mock 手机号+验证码登录（Phase 2 换 IAM）。
Page({
  data: { phone: '', code: '', error: '', submitting: false },

  onLoad() {
    // 返回用户：已有会话时直接进入首页，不重复登录。
    if (wx.getStorageSync('zhiya.session')) {
      wx.switchTab({ url: '/pages/home/index' });
    }
  },

  onPhone(event) {
    this.setData({ phone: event.detail.value });
  },

  onCode(event) {
    this.setData({ code: event.detail.value });
  },

  onSubmit() {
    const phone = this.data.phone.trim();
    const code = this.data.code.trim();
    if (!/^1\d{10}$/u.test(phone)) {
      this.setData({ error: '请输入正确的 11 位手机号' });
      return;
    }
    if (!/^\d{4,6}$/u.test(code)) {
      this.setData({ error: '请输入 6 位验证码' });
      return;
    }
    this.setData({ error: '', submitting: true });
    wx.setStorageSync('zhiya.session', { phone, nickname: '鸭家长' + phone.slice(-4) });
    wx.switchTab({ url: '/pages/home/index' });
  },
});
