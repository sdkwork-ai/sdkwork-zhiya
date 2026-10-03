// 体验包详情 (PRD §12.2/§12.3): 包含活动 + 购买须知 + 立即购买.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type PackageDetail = NonNullable<Awaited<ReturnType<PageApi['activity']['packageDetail']>>>;
type IdTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>;

Page({
  data: { detail: null as PackageDetail | null, buying: false },

  onLoad(query) {
    this.refresh(query.id ?? '');
  },

  async refresh(id: string) {
    const detail = await appApi.activity.packageDetail(id);
    this.setData({ detail });
  },

  goActivity(event: IdTapEvent) {
    wx.navigateTo({ url: `/detail/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  },

  async onBuy() {
    const { detail, buying } = this.data;
    if (!detail || buying) {
      return;
    }
    this.setData({ buying: true });
    const result = await appApi.activity.buyPackage(detail.id);
    this.setData({ buying: false });
    if (result.ok && result.orderId) {
      wx.redirectTo({ url: `/detail/pay/index?orderId=${result.orderId}` });
    } else {
      wx.showToast({ title: result.error || '下单失败', icon: 'none' });
    }
  },
});
