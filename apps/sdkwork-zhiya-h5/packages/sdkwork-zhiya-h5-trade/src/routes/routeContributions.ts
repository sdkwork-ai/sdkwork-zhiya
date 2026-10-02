import { defineZhiyaRoutes } from '@sdkwork/zhiya-h5-core';

import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-h5-core';

/** Route contributions of the trade capability (PRD §29/§21). */
export const tradeRouteContributions = defineZhiyaRoutes([
  {
    id: 'app.zhiya.trade.orders',
    path: '/trade/orders',
    titleKey: 'zhiya.trade.orders.title',
    capability: 'trade',
    tab: null,
  },
  {
    id: 'app.zhiya.trade.order-detail',
    path: '/trade/orders/:orderId',
    titleKey: 'zhiya.trade.detail.title',
    capability: 'trade',
    tab: null,
  },
  {
    id: 'app.zhiya.trade.review',
    path: '/trade/orders/:orderId/review',
    titleKey: 'zhiya.trade.review.title',
    capability: 'trade',
    tab: null,
  },
  {
    id: 'app.zhiya.trade.benefits',
    path: '/trade/orders/:orderId/benefits',
    titleKey: 'zhiya.trade.benefits.title',
    capability: 'trade',
    tab: null,
  },
] satisfies readonly ZhiyaRouteIdentity[]);
