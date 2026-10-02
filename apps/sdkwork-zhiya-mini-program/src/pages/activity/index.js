// 活动 tab (PRD §7): 分类 chips + 活动列表.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { tabs: [], category: 'all', keyword: '', list: [], loading: true },

  onLoad() {
    this.setData({ tabs: appApi.shell.categoryTabs });
    this.refresh('all');
  },

  async refresh(category, keyword = this.data.keyword) {
    this.setData({ loading: true, category });
    const list = await appApi.activity.list(category, keyword || undefined);
    this.setData({ list, loading: false });
  },

  onKeyword(event) {
    this.setData({ keyword: event.detail.value });
  },

  onSearch() {
    this.refresh(this.data.category, this.data.keyword);
  },

  onCategory(event) {
    this.refresh(event.currentTarget.dataset.id);
  },

  goDetail(event) {
    wx.navigateTo({ url: `/detail/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  },
});
