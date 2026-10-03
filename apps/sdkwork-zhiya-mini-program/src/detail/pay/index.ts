// 收银台 (PRD §9.1 支付): mock 支付.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type OrderDetail = NonNullable<Awaited<ReturnType<PageApi['trade']['order']>>>;
type PayMethod = Parameters<PageApi['activity']['pay']>[1];
type MethodTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { method: PayMethod }>;

Page({
  data: { order: null as OrderDetail | null, method: 'wechat' as PayMethod, paying: false },

  onLoad(query) {
    this.refresh(query.orderId ?? '');
  },

  async refresh(orderId: string) {
    const order = await appApi.trade.order(orderId);
    this.setData({ order });
  },

  onMethod(event: MethodTapEvent) {
    this.setData({ method: event.currentTarget.dataset.method });
  },

  async onPay() {
    const { order, method, paying } = this.data;
    if (!order || paying) {
      return;
    }
    this.setData({ paying: true });
    const ok = await appApi.activity.pay(order.id, method);
    this.setData({ paying: false });
    if (ok) {
      wx.showToast({ title: '支付成功', icon: 'success' });
      wx.redirectTo({ url: `/detail/orders/index?status=upcoming` });
    } else {
      wx.showToast({ title: '支付失败，请重试', icon: 'none' });
    }
  },
});
