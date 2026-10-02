import { defineZhiyaRoutes } from '@sdkwork/zhiya-pc-core';

import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-pc-core';

/**
 * Route contributions of the activity capability: 活动中心 tab, 详情, 报名,
 * 支付, 报名成功, 体验包列表/详情 (PRD §7–§12).
 */
export const activityRouteContributions = defineZhiyaRoutes([
  {
    id: 'app.zhiya.activity.root',
    path: '/activity',
    titleKey: 'zhiya.activity.root.title',
    capability: 'activity',
    tab: 'activity',
  },
  {
    id: 'app.zhiya.activity.detail',
    path: '/activity/detail/:activityId',
    titleKey: 'zhiya.activity.detail.title',
    capability: 'activity',
    tab: null,
  },
  {
    id: 'app.zhiya.activity.register',
    path: '/activity/register/:activityId',
    titleKey: 'zhiya.activity.register.title',
    capability: 'activity',
    tab: null,
  },
  {
    id: 'app.zhiya.activity.pay',
    path: '/activity/pay/:orderId',
    titleKey: 'zhiya.activity.pay.title',
    capability: 'activity',
    tab: null,
  },
  {
    id: 'app.zhiya.activity.success',
    path: '/activity/success/:orderId',
    titleKey: 'zhiya.activity.success.title',
    capability: 'activity',
    tab: null,
  },
  {
    id: 'app.zhiya.activity.packages',
    path: '/activity/packages',
    titleKey: 'zhiya.activity.packages.title',
    capability: 'activity',
    tab: null,
  },
  {
    id: 'app.zhiya.activity.package',
    path: '/activity/package/:packageId',
    titleKey: 'zhiya.activity.package.title',
    capability: 'activity',
    tab: null,
  },
] satisfies readonly ZhiyaRouteIdentity[]);
