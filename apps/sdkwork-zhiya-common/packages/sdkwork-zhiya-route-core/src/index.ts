/**
 * Public export boundary of `@sdkwork/zhiya-route-core` — the cross-surface
 * route identity contract (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md).
 */

export type { TabId } from './types.js';

export type { TabDefinition } from './tabs.js';
export { ZHIYA_TABS } from './tabs.js';

export type { ZhiyaRouteIdentity, ZhiyaRouteIssue } from './routes.js';
export {
  composeZhiyaRouteTable,
  defineZhiyaRoutes,
  findTabRoute,
  routeIdentitiesForTest,
  validateZhiyaRouteTable,
} from './routes.js';
