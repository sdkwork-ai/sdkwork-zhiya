import { defineZhiyaRoutes } from '@sdkwork/zhiya-h5-core';

import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-h5-core';

/** Route contributions of the org workspace capability (PRD §22). */
export const orgRouteContributions = defineZhiyaRoutes([
  { id: 'app.zhiya.org.workspace', path: '/org/workspace', titleKey: 'zhiya.org.workspace.title', capability: 'org', tab: null },
  { id: 'app.zhiya.org.activities', path: '/org/activities', titleKey: 'zhiya.org.activities.title', capability: 'org', tab: null },
  { id: 'app.zhiya.org.activity-edit', path: '/org/activities/:activityId', titleKey: 'zhiya.org.activity-edit.title', capability: 'org', tab: null },
  { id: 'app.zhiya.org.registrations', path: '/org/registrations', titleKey: 'zhiya.org.registrations.title', capability: 'org', tab: null },
] satisfies readonly ZhiyaRouteIdentity[]);
