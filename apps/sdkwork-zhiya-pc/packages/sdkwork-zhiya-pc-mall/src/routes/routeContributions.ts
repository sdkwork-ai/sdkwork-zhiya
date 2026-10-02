import { defineZhiyaRoutes } from '@sdkwork/zhiya-pc-core';

import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-pc-core';

/** Route contributions of the mall capability: 商城 tab + goods detail (PRD §16). */
export const mallRouteContributions = defineZhiyaRoutes([
  {
    id: 'app.zhiya.mall.root',
    path: '/mall',
    titleKey: 'zhiya.mall.root.title',
    capability: 'mall',
    tab: 'mall',
  },
  {
    id: 'app.zhiya.mall.goods',
    path: '/mall/goods/:goodsId',
    titleKey: 'zhiya.mall.goods.title',
    capability: 'mall',
    tab: null,
  },
] satisfies readonly ZhiyaRouteIdentity[]);
