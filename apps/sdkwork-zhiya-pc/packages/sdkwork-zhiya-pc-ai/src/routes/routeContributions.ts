import { defineZhiyaRoutes } from '@sdkwork/zhiya-pc-core';

import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-pc-core';

/** Route contributions of the AI capability: the 问知鸭 tab root (PRD §14). */
export const aiRouteContributions = defineZhiyaRoutes([
  {
    id: 'app.zhiya.ai.root',
    path: '/ai',
    titleKey: 'zhiya.ai.root.title',
    capability: 'ai',
    tab: 'ai',
  },
] satisfies readonly ZhiyaRouteIdentity[]);
