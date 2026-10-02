/**
 * Public export boundary of `@sdkwork/zhiya-service-core` — the shared Zhiya
 * domain model, SDK ports, client registry, and the mock service hub
 * (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md: contracts and service ports live
 * in the common family; UI stays in the surfaces).
 */

export type {
  Activity,
  ActivitySession,
  ActivityStatus,
  AiPlan,
  AiPlanWeek,
  AiReply,
  CheckInState,
  Child,
  ChildGender,
  ChildInput,
  ChildStage,
  CouponScope,
  CouponState,
  CouponTemplate,
  ExperiencePackage,
  Family,
  Goods,
  GoodsCategory,
  Message,
  MessageCategory,
  Order,
  OrderItem,
  OrderRawStatus,
  OrderStatus,
  OrderType,
  OrderView,
  Org,
  OrgActivityInput,
  OrgAdminView,
  OrgRegistrationView,
  OrgStatus,
  OrgWorkspaceStats,
  PlatformStats,
  Review,
  UserCoupon,
} from './types.js';
export { CHILD_STAGES, GOODS_CATEGORIES, MESSAGE_CATEGORIES } from './types.js';

export type { ActivityCategory, ActivityMode, EducationTag } from '@sdkwork/zhiya-intent-core';
export { ACTIVITY_CATEGORIES } from '@sdkwork/zhiya-intent-core';

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
  PayMethod,
  RegistrationDraft,
  RegistrationErrorCode,
  ReviewInput,
  ReviewPort,
  ZhiyaPortMap,
  ZhiyaPortName,
} from './ports.js';
export { RegistrationError } from './ports.js';

export {
  getZhiyaClient,
  hasZhiyaClient,
  registerZhiyaClient,
  resetZhiyaClients,
} from './inventory.js';

export type { MockStateOptions, ZhiyaMockState } from './state.js';
export { clearZhiyaMockState, createZhiyaMockState, hydrateEnrollmentOverrides } from './state.js';

export type { ZhiyaServiceHub } from './hub.js';
export { createZhiyaServiceHub } from './hub.js';

export { createMockAdminClient } from './adminClient.js';
export { ageOf } from './familyClient.js';
export { deriveOrderStatus, withDerivedStatus } from './orderStatus.js';
export { VerifyVoucherError, type VerifyVoucherErrorCode } from './checkinClient.js';
export { buildExperiencePlan } from './aiClient.js';
