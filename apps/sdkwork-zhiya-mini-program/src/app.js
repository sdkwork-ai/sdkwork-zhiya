// Zhiya 知鸭 mini-program application entry (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md).
const { appApi } = require('./runtime/app.js');

// eslint-disable-next-line no-unused-vars
const runtime = appApi; // typed runtime bound in bootstrap/runtime.ts

App({
  onLaunch() {
    console.log('[zhiya] mini-program launched');
    // 登录门禁 (PRD §3.1 P0): 无会话时进入登录页（mock：任意手机号+6位验证码）。
    const session = wx.getStorageSync('zhiya.session');
    if (!session) {
      wx.reLaunch({ url: '/pages/login/index' });
    }
  },
  globalData: {
    appApi,
  },
});
