/**
 * Public export boundary of `@sdkwork/zhiya-pc-core`
 * (TYPESCRIPT_CODE_SPEC.md §8: this file is the package's only public surface).
 */

export type {
  ActivityCategory,
  ActivityMode,
  Activity,
  ActivitySession,
  ActivityStatus,
  AiPlan,
  AiReply,
  CheckInState,
  Child,
  ChildGender,
  ChildInput,
  ChildStage,
  CouponScope,
  CouponState,
  CouponTemplate,
  EducationTag,
  ExperiencePackage,
  Family,
  Goods,
  GoodsCategory,
  Message,
  MessageCategory,
  Order,
  OrderItem,
  OrderStatus,
  OrderView,
  OrderType,
  Org,
  OrgActivityInput,
  OrgAdminView,
  OrgStatus,
  OrgRegistrationView,
  OrgWorkspaceStats,
  PlatformStats,
  RegistrationDraft,
  RegistrationErrorCode,
  Review,
  TabId,
  UserCoupon,
} from './types.js';

export {
  ACTIVITY_CATEGORIES,
  CHILD_STAGES,
  GOODS_CATEGORIES,
  MESSAGE_CATEGORIES,
} from './types.js';

export { RegistrationError } from './sdk/ports.js';
export { VerifyVoucherError, createZhiyaServiceHub } from '@sdkwork/zhiya-service-core';
export type { ZhiyaServiceHub } from '@sdkwork/zhiya-service-core';

export type {
  AdminPort,
  ActivityPort,
  ActivityQuery,
  AiPort,
  CheckInPort,
  CouponPort,
  FamilyPort,
  MallPort,
  MessagePort,
  OrderDraftRef,
  OrderPort,
  OrderPreview,
  OrgPort,
  PackagePort,
  ReviewPort,
} from './sdk/ports.js';
export {
  getZhiyaClient,
  hasZhiyaClient,
  registerZhiyaClient,
  resetZhiyaClients,
} from './sdk/inventory.js';

export type { ZhiyaRouteIdentity, ZhiyaRouteIssue } from './routes/identity.js';
export {
  composeZhiyaRouteTable,
  defineZhiyaRoutes,
  findTabRoute,
  routeIdentitiesForTest,
  validateZhiyaRouteTable,
} from './routes/identity.js';
export { ZHIYA_TABS, type TabDefinition } from './routes/tabs.js';

export type { SessionUser } from './session/authState.js';
export { useSessionStore } from './session/authState.js';

export { useTabBadgeStore } from './state/badgeStore.js';

export type { ColorMode } from './theme/colorMode.js';
export {
  COLOR_MODE_STORAGE_KEY,
  applyColorMode,
  readAppliedColorMode,
  readStoredColorMode,
  toggleColorMode,
} from './theme/colorMode.js';

export type { ZhiyaLocale, ZhiyaLocaleResources } from './i18n/runtime.js';
export {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  ZHIYA_LOCALES,
  changeZhiyaLocale,
  createZhiyaI18n,
  getZhiyaI18n,
  mergeZhiyaResources,
  persistLocale,
  readStoredLocale,
} from './i18n/runtime.js';

export type { ZhiyaRuntimeEnvironment } from './environment/runtimeEnvironment.js';
export {
  FALLBACK_RUNTIME_ENVIRONMENT,
  loadRuntimeEnvironment,
} from './environment/runtimeEnvironment.js';
