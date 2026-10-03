// 商城 tab (PRD §16, 浏览): 分类 + 商品列表.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type GoodsList = Awaited<ReturnType<PageApi['mall']['goods']>>;
type IdTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>;

Page({
  data: { tabs: [] as PageApi['shell']['goodsCategoryTabs'], category: 'all', goods: [] as GoodsList, loading: true },

  onLoad() {
    this.setData({ tabs: appApi.shell.goodsCategoryTabs });
    this.refresh('all');
  },

  async refresh(category: string) {
    this.setData({ loading: true, category });
    const goods = await appApi.mall.goods(category);
    this.setData({ goods, loading: false });
  },

  onCategory(event: IdTapEvent) {
    this.refresh(event.currentTarget.dataset.id);
  },

  async onFavorite(event: IdTapEvent) {
    const id = event.currentTarget.dataset.id;
    await appApi.mall.toggleFavorite(id);
    wx.showToast({ title: '已更新收藏', icon: 'none' });
  },
});
