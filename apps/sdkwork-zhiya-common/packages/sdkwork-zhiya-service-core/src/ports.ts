/**
 * SDK client ports (APP_H5_ARCHITECTURE_SPEC.md §1, FRONTEND_CODE_SPEC.md §2).
 *
 * The mock service hub implements these ports; implementations are registered
 * once at app bootstrap (`src/bootstrap/sdkClients.ts`). Consumers depend only
 * on the interfaces — UI components never construct clients directly. Phase 2
 * swaps mock implementations for generated platform SDK clients; ports stay.
 */

import type { ActivityCategory, ActivityMode } from '@sdkwork/zhiya-intent-core';

import type {
  Activity,
  ActivityStatus,
  AiReply,
  CheckInState,
  Child,
  ChildInput,
  CouponState,
  CouponTemplate,
  ExperiencePackage,
  BenefitBooking,
  Family,
  Goods,
  GoodsCategory,
  Message,
  MessageCategory,
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

/** Re-exported so capability packages can type query inputs without a direct intent-core dependency. */
export type { ActivityCategory, ActivityMode };

export interface ActivityQuery {
  category?: ActivityCategory | undefined;
  mode?: ActivityMode | undefined;
  freeOnly?: boolean | undefined;
  /** Only activities whose age range covers this child age. */
  childAge?: number | undefined;
  keyword?: string | undefined;
}

export interface FamilyPort {
  getFamily(): Promise<Family | null>;
  ensureFamily(name?: string): Promise<Family>;
  listChildren(): Promise<Child[]>;
  getChild(childId: string): Promise<Child | null>;
  addChild(input: ChildInput): Promise<Child>;
  updateChild(childId: string, patch: Partial<ChildInput>): Promise<Child>;
  removeChild(childId: string): Promise<void>;
}

export interface ActivityPort {
  listActivities(query?: ActivityQuery | undefined): Promise<Activity[]>;
  getActivity(activityId: string): Promise<Activity | null>;
  /** 首页推荐 (PRD §6.2): published, upcoming, ranked by heat then recency. */
  listHomeRecommendations(): Promise<Activity[]>;
  /** Org directory for discovery/search (PRD §32 搜索对象: 机构). */
  listOrgs(keyword?: string | undefined): Promise<Org[]>;
  listFavoriteActivities(): Promise<Activity[]>;
  /** Toggles; returns the new favorite state. */
  toggleFavorite(activityId: string): Promise<boolean>;
}

export interface PackagePort {
  listPackages(): Promise<ExperiencePackage[]>;
  getPackage(packageId: string): Promise<ExperiencePackage | null>;
  /** 热门体验包 (PRD §6.2). */
  listHotPackages(): Promise<ExperiencePackage[]>;
}

export interface MallPort {
  listGoods(category?: GoodsCategory | undefined, keyword?: string | undefined): Promise<Goods[]>;
  getGoods(goodsId: string): Promise<Goods | null>;
  listFavoriteGoods(): Promise<Goods[]>;
  toggleFavoriteGoods(goodsId: string): Promise<boolean>;
}

/** Draft for one activity registration (PRD §9: child + session + coupon). */
export interface RegistrationDraft {
  activityId: string;
  sessionId: string;
  childId: string;
  couponId?: string | undefined;
}

export interface OrderDraftRef {
  kind: 'activity' | 'package';
  id: string;
}

export interface OrderPreview {
  amount: number;
  discount: number;
  payable: number;
  coupon: UserCoupon | null;
}

/** Typed rejection reasons of `createRegistrationOrder` (PRD §9.2 checks). */
export type RegistrationErrorCode =
  | 'activity-not-found'
  | 'session-not-found'
  | 'child-not-found'
  | 'not-open'
  | 'age-not-fit'
  | 'sold-out'
  | 'duplicate'
  | 'time-conflict'
  | 'coupon-invalid';

/** Typed error thrown at the port boundary; UI maps `code` → i18n copy. */
export class RegistrationError extends Error {
  readonly code: RegistrationErrorCode;
  constructor(code: RegistrationErrorCode, message: string) {
    super(message);
    this.name = 'RegistrationError';
    this.code = code;
  }
}

export interface PackageBenefitView {
  activityId: string;
  title: string;
  emoji: string;
  orgName: string;
  category: ActivityCategory;
  mode: ActivityMode;
  ageMin: number;
  ageMax: number;
  price: number;
  booked: boolean;
  bookingId?: string | undefined;
  voucherCode?: string | undefined;
  checkInState?: CheckInState | undefined;
}

export interface PayMethod {
  method: 'wechat' | 'alipay';
}

export interface OrderPort {
  /** Price breakdown for the confirm step (coupon applied when valid). */
  previewRegistration(draft: RegistrationDraft): Promise<OrderPreview>;
  /** Runs all PRD §9.2 checks; throws `RegistrationError` on rejection. */
  createRegistrationOrder(draft: RegistrationDraft): Promise<OrderView>;
  createPackageOrder(packageId: string, couponId?: string | undefined): Promise<OrderView>;
  payOrder(orderId: string, method: PayMethod['method']): Promise<OrderView>;
  cancelOrder(orderId: string): Promise<OrderView>;
  /** 未核销退款 (PRD §30): mock approves instantly. */
  refundOrder(orderId: string): Promise<OrderView>;
  getOrder(orderId: string): Promise<OrderView | null>;
  /** Orders with derived status (PRD §29). */
  listOrders(filter?: { status?: OrderStatus | 'all' | undefined; type?: OrderType | undefined }): Promise<OrderView[]>;
  /** Coupons usable for a draft, best discount first (PRD §17/§9.1). */
  listApplicableCoupons(
    ref: OrderDraftRef,
    amount: number,
    options?: { childAge?: number | undefined; orgId?: string | undefined },
  ): Promise<UserCoupon[]>;
  /** 体验包权益视图：包内每个活动的已约/可约状态 (PRD §12.4). */
  listPackageBenefits(orderId: string): Promise<PackageBenefitView[]>;
  /** 预约一个权益：校验包归属/适龄/名额/重复/时间冲突，成功即出凭证 (PRD §12.4). */
  bookPackageBenefit(input: {
    orderId: string;
    activityId: string;
    sessionId: string;
    childId: string;
  }): Promise<BenefitBooking>;
}

export interface CouponPort {
  listClaimable(): Promise<CouponTemplate[]>;
  listMyCoupons(state?: CouponState | undefined): Promise<UserCoupon[]>;
  claim(templateId: string): Promise<UserCoupon>;
}

export interface ReviewInput {
  orderId: string;
  overall: number;
  experience: number;
  teacher: number;
  environment: number;
  service: number;
  recommend: boolean;
  content: string;
  authorName: string;
}

export interface ReviewPort {
  submitReview(input: ReviewInput): Promise<Review>;
  listByActivity(activityId: string): Promise<Review[]>;
  getByOrder(orderId: string): Promise<Review | null>;
}

export interface CheckInPort {
  /** Org registration table (PRD §22.4), derived from paid activity orders. */
  listOrgRegistrations(filter?: {
    activityId?: string | undefined;
    pendingOnly?: boolean | undefined;
  }): Promise<OrgRegistrationView[]>;
  /** 核销: verify a voucher code, mark 已签到 (PRD §11). */
  verifyVoucher(code: string): Promise<OrgRegistrationView>;
  /** 活动结束确认 (PRD §11): returns how many orders moved to 待评价. */
  completeActivity(activityId: string): Promise<number>;
}

export interface MessagePort {
  listMessages(category?: MessageCategory | 'all' | undefined): Promise<Message[]>;
  unreadCount(): Promise<number>;
  markRead(messageId: string): Promise<void>;
  markAllRead(category?: MessageCategory | 'all' | undefined): Promise<void>;
}

export interface AiPort {
  /** 问知鸭 one-turn answer: understanding → search → recommendation (PRD §14.1). */
  ask(query: string): Promise<AiReply>;
  /** AI activity search: intent-recognized, ranked activities (PRD §50). */
  search(query: string): Promise<Activity[]>;
}

export interface OrgPort {
  getMyOrg(): Promise<Org>;
  getWorkspaceStats(): Promise<OrgWorkspaceStats>;
  listOrgActivities(status?: ActivityStatus | undefined): Promise<Activity[]>;
  createActivity(input: OrgActivityInput, publish: boolean): Promise<Activity>;
  updateActivity(activityId: string, input: OrgActivityInput): Promise<Activity>;
  publishActivity(activityId: string): Promise<Activity>;
  offlineActivity(activityId: string): Promise<Activity>;
  deleteActivity(activityId: string): Promise<void>;
}

/** Platform admin governance port (PRD §25; PC-only UI in this milestone). */
export interface AdminPort {
  platformStats(): Promise<PlatformStats>;
  listOrgs(): Promise<OrgAdminView[]>;
  /** 暂停/恢复一家机构；暂停后其活动不再进入 C 端列表。 */
  setOrgStatus(orgId: string, status: OrgStatus): Promise<OrgAdminView>;
  listAllActivities(): Promise<Activity[]>;
  setActivityStatus(activityId: string, status: 'published' | 'offline'): Promise<Activity>;
}

/** Port registry keys. */
export type ZhiyaPortMap = {
  admin: AdminPort;
  family: FamilyPort;
  activity: ActivityPort;
  package: PackagePort;
  mall: MallPort;
  order: OrderPort;
  coupon: CouponPort;
  review: ReviewPort;
  checkin: CheckInPort;
  message: MessagePort;
  ai: AiPort;
  org: OrgPort;
};

export type ZhiyaPortName = keyof ZhiyaPortMap;
