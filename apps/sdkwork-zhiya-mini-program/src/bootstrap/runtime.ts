/**
 * Mini-program bootstrap runtime — the ONLY module in this surface that
 * touches `wx.*` (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md host-adapter rule).
 * esbuild bundles this entry (with the whole workspace TS graph) into the
 * committed `src/runtime/app.js` CommonJS bundle consumed by native pages.
 */

import {
  bindMiniProgramHost,
  bindRuntimeConfig,
  bootstrapZhiyaClients,
  type MiniProgramRuntimeConfig,
} from '@sdkwork/zhiya-mp-core';

import {
  CATEGORY_LABELS,
  PAGE_TITLES,
  TAB_LABELS,
  TAB_PAGE_PATHS,
} from '@sdkwork/zhiya-mp-shell';

import {
  ACTIVITY_CATEGORY_TABS,
  bookBenefit,
  loadPackageBenefits,
  createPackageOrder,
  createRegistrationOrder,
  listActivities,
  loadActivityDetail,
  loadPackageDetail,
  loadRegisterPickers,
  payOrder,
  type PackageDetailView,
  type RegisterPickers,
} from '@sdkwork/zhiya-mp-activity';

import { loadHomeOverview } from '@sdkwork/zhiya-mp-home';

import { AI_SUGGESTIONS, sendAiTurn, type AiTurnView } from '@sdkwork/zhiya-mp-ai';

import { GOODS_CATEGORY_TABS, listGoods, loadGoodsDetail, toggleGoodsFavorite, type GoodsDetailView } from '@sdkwork/zhiya-mp-mall';

import {
  listOrders,
  loadOrderDetail,
  runOrderAction,
  submitReview,
  ORDER_STATUS_TABS,
  type OrderCardView,
  type OrderDetailView,
  type ReviewScores,
} from '@sdkwork/zhiya-mp-trade';

import {
  claimCoupon,
  listChildren,
  loadCoupons,
  loadMessages,
  markAllMessagesRead,
  removeChild,
  saveChild,
  type ChildInputView,
  type ChildView,
  type CouponView,
  type MessageView,
} from '@sdkwork/zhiya-mp-profile';

declare const __SDKWORK_RUNTIME_ENV__: MiniProgramRuntimeConfig;

/** The typed API surface native pages consume through `require('.../runtime/app.js')`. */
export interface PageApi {
  shell: {
    tabs: readonly string[];
    labels: Record<string, string>;
    titles: Record<string, string>;
    categoryTabs: readonly { id: string; label: string }[];
    goodsCategoryTabs: readonly { id: string; label: string }[];
    orderStatusTabs: readonly { id: string; label: string }[];
  };
  home: { overview(): ReturnType<typeof loadHomeOverview> };
  activity: {
    list(category?: string, keyword?: string): ReturnType<typeof listActivities>;
    detail(id: string): ReturnType<typeof loadActivityDetail>;
    registerPickers(id: string): Promise<RegisterPickers | null>;
    packageDetail(id: string): Promise<PackageDetailView | null>;
    packageBenefits(orderId: string): ReturnType<typeof loadPackageBenefits>;
    bookBenefit(input: { orderId: string; activityId: string; sessionId: string; childId: string }): ReturnType<typeof bookBenefit>;
    buyPackage(packageId: string): ReturnType<typeof createPackageOrder>;
    createOrder(input: { activityId: string; sessionId: string; childId: string; couponId?: string }): ReturnType<
      typeof createRegistrationOrder
    >;
    pay(orderId: string, method: 'wechat' | 'alipay'): Promise<boolean>;
  };
  ai: { suggestions: readonly string[]; send(text: string): Promise<AiTurnView> };
  mall: {
    goods(category?: string): ReturnType<typeof listGoods>;
    detail(id: string): Promise<GoodsDetailView | null>;
    toggleFavorite(id: string): Promise<boolean>;
  };
  trade: {
    orders(status?: string): ReturnType<typeof listOrders>;
    order(id: string): Promise<OrderDetailView | null>;
    action(id: string, action: 'pay' | 'cancel' | 'refund'): Promise<string>;
    submitReview(orderId: string, scores: ReviewScores): Promise<string>;
  };
  profile: {
    children(): ReturnType<typeof listChildren>;
    saveChild(childId: string | null, input: ChildInputView): Promise<string>;
    removeChild(id: string): Promise<void>;
    coupons(tab: 'claimable' | 'unused' | 'used' | 'expired'): ReturnType<typeof loadCoupons>;
    claimCoupon(templateId: string): Promise<string>;
    messages(category?: string): ReturnType<typeof loadMessages>;
    markAllRead(category?: string): Promise<void>;
  };
}

function bindWxHost(): void {
  bindMiniProgramHost({
    navigateTo(url) {
      wx.navigateTo({ url });
    },
    switchTab(url) {
      wx.switchTab({ url });
    },
    showToast(title) {
      wx.showToast({ title, icon: 'none' });
    },
  });
}

export function bootstrapRuntime(): PageApi {
  bindRuntimeConfig(__SDKWORK_RUNTIME_ENV__);
  bindWxHost();
  bootstrapZhiyaClients();
  return {
    shell: {
      tabs: TAB_PAGE_PATHS,
      labels: { ...TAB_LABELS },
      titles: { ...PAGE_TITLES },
      categoryTabs: ACTIVITY_CATEGORY_TABS,
      goodsCategoryTabs: GOODS_CATEGORY_TABS,
      orderStatusTabs: ORDER_STATUS_TABS,
    },
    home: {
      overview: () => loadHomeOverview(CATEGORY_LABELS),
    },
    activity: {
      list: (category, keyword) => listActivities(CATEGORY_LABELS, category, keyword),
      detail: (id) => loadActivityDetail(id, ''),
      registerPickers: (id) => loadRegisterPickers(id),
      packageDetail: (id) => loadPackageDetail(id, CATEGORY_LABELS),
      packageBenefits: (orderId) => loadPackageBenefits(orderId, CATEGORY_LABELS),
      bookBenefit: (input) => bookBenefit(input),
      buyPackage: (packageId) => createPackageOrder(packageId),
      createOrder: (input) => createRegistrationOrder(input),
      pay: (orderId, method) => payOrder(orderId, method),
    },
    ai: {
      suggestions: AI_SUGGESTIONS,
      send: (text) => sendAiTurn(text, CATEGORY_LABELS),
    },
    mall: {
      goods: (category) => listGoods(category),
      detail: (id) => loadGoodsDetail(id),
      toggleFavorite: (id) => toggleGoodsFavorite(id),
    },
    trade: {
      orders: (status) => listOrders(status),
      order: (id) => loadOrderDetail(id),
      action: (id, action) => runOrderAction(id, action),
      submitReview: (orderId, scores) => submitReview(orderId, scores),
    },
    profile: {
      children: () => listChildren(),
      saveChild: (childId, input) => saveChild(childId, input),
      removeChild: (id) => removeChild(id),
      coupons: (tab) => loadCoupons(tab),
      claimCoupon: (templateId) => claimCoupon(templateId),
      messages: (category) => loadMessages(category),
      markAllRead: (category) => markAllMessagesRead(category),
    },
  };
}

const appApi: PageApi = bootstrapRuntime();
export { appApi };
