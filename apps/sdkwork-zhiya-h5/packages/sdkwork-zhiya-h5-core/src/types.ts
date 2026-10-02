/**
 * Type seam of `@sdkwork/zhiya-h5-core`: view-surface re-exports of the shared
 * contracts (route-core, intent-core vocabulary, service-core ports & model).
 * Capability packages import from here so they never depend on the common
 * packages directly (cross-surface seam rule).
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
  ChildInput,
  ChildStage,
  ChildGender,
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
  OrderRawStatus,
  OrderStatus,
  OrderType,
  OrderView,
  Org,
  OrgActivityInput,
  OrgAdminView,
  OrgStatus,
  OrgRegistrationView,
  OrgWorkspaceStats,
  PlatformStats,
  Review,
  UserCoupon,
} from '@sdkwork/zhiya-service-core';

export type {
  ActivityCategory,
  ActivityMode,
} from '@sdkwork/zhiya-intent-core';

export type { TabId } from '@sdkwork/zhiya-route-core';
export type {
  RegistrationDraft,
  RegistrationErrorCode,
} from '@sdkwork/zhiya-service-core';

export {
  ACTIVITY_CATEGORIES,
  CHILD_STAGES,
  GOODS_CATEGORIES,
  MESSAGE_CATEGORIES,
} from '@sdkwork/zhiya-service-core';
