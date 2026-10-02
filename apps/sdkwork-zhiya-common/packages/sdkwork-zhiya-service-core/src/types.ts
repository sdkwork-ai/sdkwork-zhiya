/**
 * Zhiya domain model (PRD §39–§42 core data objects, standalone mock
 * milestone). Shapes are the Phase-2 seam: generated platform SDK DTOs must
 * map onto these view models without touching UI code. Vocabulary (activity
 * categories/modes, education tags) is re-exported from `intent-core` so the
 * whole workspace shares one definition.
 */

import type { ActivityCategory, ActivityMode, EducationTag } from '@sdkwork/zhiya-intent-core';

export type {
  ActivityCategory,
  ActivityMode,
  EducationTag,
} from '@sdkwork/zhiya-intent-core';

/** Governance status of an org, set by the platform admin (PRD §25.3). */
export type OrgStatus = 'normal' | 'suspended';

/** Education organization (PRD §3.3). */
export interface Org {
  id: string;
  name: string;
  /** Emoji stand-in for the logo (mock milestone has no media pipeline). */
  logo: string;
  summary: string;
  /** City · district label, e.g. `北京·海淀`. */
  district: string;
  /** Aggregated review rating, 0–5. */
  rating: number;
}

/** One bookable occurrence of an activity (PRD §9.1 场次). */
export interface ActivitySession {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  quota: number;
  enrolled: number;
}

export type ActivityStatus = 'draft' | 'published' | 'offline';

/** Education activity (PRD §8, §40). */
export interface Activity {
  id: string;
  orgId: string;
  orgName: string;
  category: ActivityCategory;
  mode: ActivityMode;
  title: string;
  subtitle: string;
  /** Emoji stand-in for the cover image. */
  emoji: string;
  ageMin: number;
  ageMax: number;
  startTime: string;
  endTime: string;
  address: string;
  onlineLink?: string | undefined;
  price: number;
  originalPrice: number;
  quota: number;
  enrolled: number;
  tags: EducationTag[];
  introduction: string;
  notice: string;
  status: ActivityStatus;
  /** True for activities created through the org workspace (persisted). */
  orgCreated: boolean;
  sessions: ActivitySession[];
  createdAt: string;
}

/** Multi-org trial experience package (PRD §12.2/§41). */
export interface ExperiencePackage {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  ageMin: number;
  ageMax: number;
  price: number;
  originalPrice: number;
  validDays: number;
  purchasedCount: number;
  activityIds: string[];
}

/** Mall goods category taxonomy (PRD §16.1). */
export type GoodsCategory =
  | 'stationery'
  | 'books'
  | 'painting'
  | 'science'
  | 'programming'
  | 'robotics'
  | 'teaching-aids'
  | 'supplies';

export const GOODS_CATEGORIES: readonly GoodsCategory[] = [
  'stationery',
  'books',
  'painting',
  'science',
  'programming',
  'robotics',
  'teaching-aids',
  'supplies',
];

/** Mall goods item (PRD §16, browse-only in this milestone). */
export interface Goods {
  id: string;
  title: string;
  emoji: string;
  category: GoodsCategory;
  price: number;
  originalPrice: number;
  summary: string;
  detail: string;
  spec: string;
  sales: number;
}

/** Education stage of a child (PRD §3.2). */
export type ChildStage = 'kindergarten' | 'primary-low' | 'primary-high' | 'junior' | 'senior';

export const CHILD_STAGES: readonly ChildStage[] = [
  'kindergarten',
  'primary-low',
  'primary-high',
  'junior',
  'senior',
];

export type ChildGender = 'boy' | 'girl' | 'secret';

/** Child family member (PRD §3.2, §15, §42). */
export interface Child {
  id: string;
  nickname: string;
  /** Emoji avatar stand-in. */
  emoji: string;
  gender: ChildGender;
  /** ISO date `yyyy-MM-dd`. */
  birthDate: string;
  interests: EducationTag[];
  stage: ChildStage;
  notes?: string | undefined;
}

export interface ChildInput {
  nickname: string;
  emoji?: string | undefined;
  gender: ChildGender;
  birthDate: string;
  interests: EducationTag[];
  stage: ChildStage;
  notes?: string | undefined;
}

/** Family aggregate (PRD §42). */
export interface Family {
  id: string;
  name: string;
  children: Child[];
}

/** Coupon scope (PRD §17). */
export type CouponScope = 'platform' | 'org' | 'activity' | 'package';

/** Claimable coupon template. */
export interface CouponTemplate {
  id: string;
  title: string;
  scope: CouponScope;
  orgId?: string | undefined;
  activityId?: string | undefined;
  packageId?: string | undefined;
  amountOff: number;
  minSpend: number;
  validDays: number;
  total: number;
  claimed: number;
  newbieOnly: boolean;
}

export type CouponState = 'unused' | 'used' | 'expired';

/** Claimed coupon owned by the current family. */
export interface UserCoupon {
  id: string;
  templateId: string;
  title: string;
  scope: CouponScope;
  orgId?: string | undefined;
  activityId?: string | undefined;
  packageId?: string | undefined;
  amountOff: number;
  minSpend: number;
  claimedAt: string;
  expireAt: string;
  state: CouponState;
  usedByOrderId?: string | undefined;
}

/** Unified order type (PRD §29; goods orders are a P1 capability). */
export type OrderType = 'activity' | 'package';

/** Stored order status before derivation (check-in/review are derived). */
export type OrderRawStatus = 'pending-payment' | 'paid' | 'cancelled' | 'refunded';

export type CheckInState = 'none' | 'checked-in';

/**
 * Derived order status shown to users (PRD §29 订单状态, §11 核销状态):
 * 待支付/待参加/进行中/待评价/已完成/已取消/已退款.
 */
export type OrderStatus =
  | 'pending-payment'
  | 'upcoming'
  | 'ongoing'
  | 'pending-review'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  orderType: OrderType;
  activityId?: string | undefined;
  sessionId?: string | undefined;
  packageId?: string | undefined;
  title: string;
  emoji: string;
  orgId: string;
  orgName: string;
  price: number;
  /** Child attending, for activity orders (PRD §9.2 报名人). */
  childId?: string | undefined;
  childName?: string | undefined;
}

/** Order as surfaced to clients: raw status replaced by the derived status (PRD §29). */
export type OrderView = Omit<Order, 'status'> & { status: OrderStatus };

/** Unified order (PRD §29). */
export interface Order {
  id: string;
  type: OrderType;
  status: OrderRawStatus;
  items: OrderItem[];
  /** Sum of item prices. */
  amount: number;
  /** Coupon discount applied. */
  discount: number;
  /** Amount actually payable/paid. */
  payable: number;
  couponId?: string | undefined;
  payMethod?: 'wechat' | 'alipay' | undefined;
  /** Voucher code for offline activity orders (PRD §9.3/§11 QR 凭证). */
  voucherCode?: string | undefined;
  checkInState: CheckInState;
  /** 活动结束确认 done by the org (PRD §11). */
  orgCompleted: boolean;
  reviewId?: string | undefined;
  createdAt: string;
  paidAt?: string | undefined;
  refundedAt?: string | undefined;
  contactPhone: string;
}

/** Activity review (PRD §21). */
export interface Review {
  id: string;
  orderId: string;
  activityId: string;
  authorName: string;
  childName?: string | undefined;
  overall: number;
  experience: number;
  teacher: number;
  environment: number;
  service: number;
  recommend: boolean;
  content: string;
  createdAt: string;
}

/** Message center category (PRD §18). */
export type MessageCategory =
  | 'system'
  | 'activity'
  | 'registration'
  | 'payment'
  | 'refund'
  | 'coupon'
  | 'ai';

export const MESSAGE_CATEGORIES: readonly MessageCategory[] = [
  'system',
  'activity',
  'registration',
  'payment',
  'refund',
  'coupon',
  'ai',
];

export interface Message {
  id: string;
  category: MessageCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  orderId?: string | undefined;
}

/** Org workspace KPI block (PRD §22.1). */
export interface OrgWorkspaceStats {
  todayRegistrations: number;
  pendingCheckIns: number;
  salesToday: number;
  publishedActivities: number;
  totalRegistrations: number;
  completionRate: number;
  rating: number;
}

/** Registration row in the org console (PRD §22.4). */
export interface OrgRegistrationView {
  orderId: string;
  activityId: string;
  activityTitle: string;
  sessionId: string;
  sessionLabel: string;
  childName: string;
  parentPhone: string;
  voucherCode: string;
  status: OrderStatus;
  checkInState: CheckInState;
  createdAt: string;
}

/** Draft input for org activity create/update (PRD §22.2). */
export interface OrgActivityInput {
  title: string;
  subtitle: string;
  category: ActivityCategory;
  mode: ActivityMode;
  emoji?: string | undefined;
  ageMin: number;
  ageMax: number;
  startTime: string;
  endTime: string;
  address: string;
  onlineLink?: string | undefined;
  price: number;
  originalPrice: number;
  quota: number;
  introduction: string;
  notice: string;
  tags: EducationTag[];
}

/** Org row in the platform admin console (PRD §25.3). */
export interface OrgAdminView extends Org {
  status: OrgStatus;
  activityCount: number;
}

/** Platform-wide KPI block (PRD §25.1). */
export interface PlatformStats {
  totalFamilies: number;
  totalChildren: number;
  totalOrgs: number;
  suspendedOrgs: number;
  totalActivities: number;
  offlineActivities: number;
  totalOrders: number;
  paidOrders: number;
  gmv: number;
  refundAmount: number;
  checkInCount: number;
  reviewCount: number;
  computedAt: string;
}

/** AI structured reply (PRD §14). Copy is i18n-keyed; data is real. */
export interface AiPlanWeek {
  weekIndex: number;
  activityId: string;
  title: string;
  price: number;
}

export interface AiPlan {
  totalBudget: number;
  totalCost: number;
  weeks: AiPlanWeek[];
}

export interface AiReply {
  id: string;
  /** i18n key under `zhiya.ai.reply.*` describing the outcome. */
  messageKey: string;
  params: Record<string, string | number>;
  /** Recommended activities, already filtered/ordered. */
  activities: Activity[];
  /** Weekly experience plan when the query asked for one (PRD §14.2). */
  plan?: AiPlan | undefined;
  /** Follow-up query suggestions (raw strings the user can tap). */
  followUps: string[];
}
