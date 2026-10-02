/**
 * Tab + page projection inputs for the native WeChat surface
 * (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md): the five cross-surface tab roots
 * (PRD §5) projected to physical page paths; alignment is enforced by the
 * surface contract test.
 */

import { ZHIYA_TABS } from '@sdkwork/zhiya-route-core';

/** zh-CN tab labels in PRD order: 首页 | 活动 | AI | 商城 | 我的. */
export const TAB_LABELS: Record<string, string> = {
  home: '首页',
  activity: '活动',
  ai: 'AI',
  mall: '商城',
  profile: '我的',
};

/** Physical tab page paths (`pages/<tab>/index`). */
export const TAB_PAGE_PATHS: readonly string[] = ZHIYA_TABS.map((tab) => `pages/${tab.id}/index`);

/** Navigation bar titles for every declared page (tabs + detail subpackage). */
export const PAGE_TITLES: Record<string, string> = {
  'pages/login/index': '登录知鸭',
  'pages/home/index': '知鸭',
  'pages/activity/index': '活动',
  'pages/ai/index': '问知鸭',
  'pages/mall/index': '商城',
  'pages/profile/index': '我的',
  'detail/activity-detail/index': '活动详情',
  'detail/register/index': '确认报名',
  'detail/pay/index': '收银台',
  'detail/orders/index': '我的订单',
  'detail/review/index': '评价活动',
  'detail/family/index': '我的家庭',
  'detail/messages/index': '消息中心',
  'detail/coupons/index': '优惠券',
  'detail/package-detail/index': '体验包详情',
};

/** zh-CN labels for shared domain vocabularies (order status per PRD §29). */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  'pending-payment': '待支付',
  upcoming: '待参加',
  ongoing: '进行中',
  'pending-review': '待评价',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export const CATEGORY_LABELS: Record<string, string> = {
  trial: '体验课',
  'online-course': '线上课程',
  'open-course': '公开课',
  'parent-child': '亲子活动',
  'study-tour': '研学',
  'summer-camp': '夏令营',
  'winter-camp': '冬令营',
  competition: '比赛',
  exhibition: '展览',
  training: '训练营',
  other: '其他',
};
