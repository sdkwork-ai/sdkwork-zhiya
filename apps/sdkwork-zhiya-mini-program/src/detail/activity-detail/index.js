// 活动详情 (PRD §8): 信息 + 内容 + 机构 + 立即报名.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { detail: null },

  onLoad(query) {
    this.refresh(query.id);
  },

  async refresh(id) {
    const detail = await appApi.activity.detail(id);
    this.setData({ detail });
  },

  goRegister() {
    const { detail } = this.data;
    if (!detail || detail.remaining === 0) {
      return;
    }
    wx.navigateTo({ url: `/detail/register/index?id=${detail.id}` });
  },
});
