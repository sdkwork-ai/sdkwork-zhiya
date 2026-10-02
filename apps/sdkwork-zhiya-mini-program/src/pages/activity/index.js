// 活动 tab (PRD §7): 分类 chips + 活动列表.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { tabs: [], category: 'all', list: [], loading: true },

  onLoad() {
    this.setData({ tabs: appApi.shell.categoryTabs });
    this.refresh('all');
  },

  async refresh(category) {
    this.setData({ loading: true, category });
    const list = await appApi.activity.list(category);
    this.setData({ list, loading: false });
  },

  onCategory(event) {
    this.refresh(event.currentTarget.dataset.id);
  },

  goDetail(event) {
    wx.navigateTo({ url: `/detail/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  },
});
