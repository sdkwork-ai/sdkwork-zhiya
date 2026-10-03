// 我的订单 (PRD §29): 状态 tabs + 操作（去支付/取消/退款/去评价）.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type OrderList = Awaited<ReturnType<PageApi['trade']['orders']>>;
type OrderAction = Parameters<PageApi['trade']['action']>[1];
type IdTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>;
type ActionTapEvent = WechatMiniprogram.CustomEvent<
  Record<string, never>,
  Record<string, never>,
  { id: string; action: OrderAction }
>;

Page({
  data: { tabs: [] as PageApi['shell']['orderStatusTabs'], status: 'all', orders: [] as OrderList, loading: true },

  onLoad(query) {
    this.setData({ tabs: appApi.shell.orderStatusTabs });
    this.refresh(query.status ?? 'all');
  },

  async refresh(status: string) {
    this.setData({ loading: true, status });
    const orders = await appApi.trade.orders(status);
    this.setData({ orders, loading: false });
  },

  onStatus(event: IdTapEvent) {
    this.refresh(event.currentTarget.dataset.id);
  },

  async onAction(event: ActionTapEvent) {
    const { id, action } = event.currentTarget.dataset;
    const message = await appApi.trade.action(id, action);
    wx.showToast({ title: message, icon: 'none' });
    this.refresh(this.data.status);
  },

  goReview(event: IdTapEvent) {
    wx.navigateTo({ url: `/detail/review/index?orderId=${event.currentTarget.dataset.id}` });
  },

  goPay(event: IdTapEvent) {
    wx.redirectTo({ url: `/detail/pay/index?orderId=${event.currentTarget.dataset.id}` });
  },

  goBenefits(event: IdTapEvent) {
    wx.navigateTo({ url: `/detail/benefits/index?orderId=${event.currentTarget.dataset.id}` });
  },
});
