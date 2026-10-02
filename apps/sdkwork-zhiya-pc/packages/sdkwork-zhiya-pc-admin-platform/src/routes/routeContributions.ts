import { defineZhiyaRoutes } from '@sdkwork/zhiya-pc-core';

import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-pc-core';

/**
 * Route contributions of the platform admin capability (PRD §25). Admin is a
 * PC-surface-specific workflow: these routes exist on the PC surface only and
 * are deliberately excluded from the H5/Flutter common route set (the
 * cross-surface alignment gate asserts the common set stays equal and allows
 * `app.zhiya.admin.*` as a PC superset).
 */
export const adminRouteContributions = defineZhiyaRoutes([
  {
    id: 'app.zhiya.admin.dashboard',
    path: '/admin/dashboard',
    titleKey: 'zhiya.admin.dashboard.title',
    capability: 'admin',
    tab: null,
  },
] satisfies readonly ZhiyaRouteIdentity[]);
