// 活动 tab (PRD §7): 分类 chips + 活动列表.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type ActivityList = Awaited<ReturnType<PageApi['activity']['list']>>;
type IdTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>;

Page({
  data: {
    tabs: [] as PageApi['shell']['categoryTabs'],
    category: 'all',
    keyword: '',
    list: [] as ActivityList,
    loading: true,
  },

  onLoad() {
    this.setData({ tabs: appApi.shell.categoryTabs });
    this.refresh('all');
  },

  async refresh(category: string, keyword?: string) {
    const nextKeyword = keyword ?? this.data.keyword;
    this.setData({ loading: true, category });
    const list = await appApi.activity.list(category, nextKeyword || undefined);
    this.setData({ list, loading: false });
  },

  onKeyword(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ keyword: event.detail.value });
  },

  onSearch() {
    this.refresh(this.data.category, this.data.keyword);
  },

  onCategory(event: IdTapEvent) {
    this.refresh(event.currentTarget.dataset.id);
  },

  goDetail(event: IdTapEvent) {
    wx.navigateTo({ url: `/detail/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  },
});
