// 活动详情 (PRD §8): 信息 + 内容 + 机构 + 立即报名.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type ActivityDetail = Awaited<ReturnType<PageApi['activity']['detail']>>;

Page({
  data: { detail: null as ActivityDetail | null },

  onLoad(query) {
    this.refresh(query.id ?? '');
  },

  async refresh(id: string) {
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
