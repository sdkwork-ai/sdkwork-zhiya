// 商城 tab (PRD §16, 浏览): 分类 + 商品列表.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { tabs: [], category: 'all', goods: [], loading: true },

  onLoad() {
    this.setData({ tabs: appApi.shell.goodsCategoryTabs });
    this.refresh('all');
  },

  async refresh(category) {
    this.setData({ loading: true, category });
    const goods = await appApi.mall.goods(category);
    this.setData({ goods, loading: false });
  },

  onCategory(event) {
    this.refresh(event.currentTarget.dataset.id);
  },

  async onFavorite(event) {
    const id = event.currentTarget.dataset.id;
    await appApi.mall.toggleFavorite(id);
    wx.showToast({ title: '已更新收藏', icon: 'none' });
  },
});
