// 消息中心 (PRD §18): 分类通知 + 全部已读.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type Messages = Awaited<ReturnType<PageApi['profile']['messages']>>;
type IdTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>;

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'registration', label: '报名' },
  { id: 'payment', label: '支付' },
  { id: 'refund', label: '退款' },
  { id: 'coupon', label: '优惠' },
  { id: 'activity', label: '活动' },
  { id: 'system', label: '系统' },
];

Page({
  data: { categories: CATEGORIES, category: 'all', messages: [] as Messages, loading: true },

  onLoad() {
    this.refresh('all');
  },

  async refresh(category: string) {
    this.setData({ loading: true, category });
    const messages = await appApi.profile.messages(category);
    this.setData({ messages, loading: false });
  },

  onCategory(event: IdTapEvent) {
    this.refresh(event.currentTarget.dataset.id);
  },

  async onMarkAll() {
    await appApi.profile.markAllRead(this.data.category);
    wx.showToast({ title: '已全部标记已读', icon: 'none' });
    this.refresh(this.data.category);
  },
});
