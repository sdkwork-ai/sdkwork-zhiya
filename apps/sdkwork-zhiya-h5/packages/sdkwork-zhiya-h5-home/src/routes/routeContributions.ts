import { defineZhiyaRoutes } from '@sdkwork/zhiya-h5-core';

import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-h5-core';

/**
 * Route contributions of the home capability (APP_H5_ARCHITECTURE_SPEC.md
 * §11). The home root owns the 首页 tab.
 */
export const homeRouteContributions = defineZhiyaRoutes([
  {
    id: 'app.zhiya.home.root',
    path: '/home',
    titleKey: 'zhiya.home.root.title',
    capability: 'home',
    tab: 'home',
  },
  {
    id: 'app.zhiya.home.search',
    path: '/home/search',
    titleKey: 'zhiya.home.search.title',
    capability: 'home',
    tab: null,
  },
] satisfies readonly ZhiyaRouteIdentity[]);
