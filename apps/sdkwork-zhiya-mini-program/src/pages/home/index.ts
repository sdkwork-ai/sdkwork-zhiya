// 首页 tab (PRD §6/§45): 问问知鸭入口 + 快捷入口 + 推荐活动 + 热门体验包.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type HomeOverview = Awaited<ReturnType<PageApi['home']['overview']>>;
type IdTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>;

Page({
  data: { overview: null as HomeOverview | null, loading: true },

  onLoad() {
    this.refresh();
  },

  async refresh() {
    this.setData({ loading: true });
    const overview = await appApi.home.overview();
    this.setData({ overview, loading: false });
  },

  goAi() {
    appApi.shell; // tab page — switch within the tab bar
    wx.switchTab({ url: '/pages/ai/index' });
  },

  goActivity() {
    wx.switchTab({ url: '/pages/activity/index' });
  },

  goDetail(event: IdTapEvent) {
    wx.navigateTo({ url: `/detail/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  },

  goPackage(event: IdTapEvent) {
    wx.navigateTo({ url: `/detail/package-detail/index?id=${event.currentTarget.dataset.id}` });
  },
});
