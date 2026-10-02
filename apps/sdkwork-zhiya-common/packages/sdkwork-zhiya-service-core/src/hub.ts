/**
 * Mock service hub (Phase 1, standalone). One factory builds all eleven port
 * implementations over a single shared mock state, wiring the internal
 * dependencies (orders notify the message center, AI reads the live catalog).
 * The app bootstrap registers each returned client into the port registry;
 * Phase 2 swaps individual clients for generated SDK implementations.
 */

import type {
  AdminPort,
  AiPort,
  ActivityPort,
  CheckInPort,
  CouponPort,
  FamilyPort,
  MallPort,
  MessagePort,
  OrderPort,
  OrgPort,
  PackagePort,
  ReviewPort,
  ZhiyaPortMap,
} from './ports.js';
import { createZhiyaMockState, hydrateEnrollmentOverrides } from './state.js';
import type { MockStateOptions, ZhiyaMockState } from './state.js';
import { createMockFamilyClient } from './familyClient.js';
import { createMockActivityClient } from './activityClient.js';
import { createMockPackageClient } from './packageClient.js';
import { createMockMallClient } from './mallClient.js';
import { createMockOrderClient } from './orderClient.js';
import { createMockCouponClient } from './couponClient.js';
import { createMockReviewClient } from './reviewClient.js';
import { createMockCheckInClient } from './checkinClient.js';
import { createMockMessageClient } from './messageClient.js';
import { createMockAiClient } from './aiClient.js';
import { createMockOrgClient } from './orgClient.js';
import { createMockAdminClient } from './adminClient.js';

export interface ZhiyaServiceHub extends ZhiyaPortMap {
  /** Shared mock state (tests use it to arrange/act/assert). */
  state: ZhiyaMockState;
}

export function createZhiyaServiceHub(options: MockStateOptions = {}): ZhiyaServiceHub {
  const state = createZhiyaMockState(options);
  hydrateEnrollmentOverrides(state);

  const family: FamilyPort = createMockFamilyClient(state);
  const activity: ActivityPort = createMockActivityClient(state);
  const pkg: PackagePort = createMockPackageClient(state);
  const mall: MallPort = createMockMallClient(state);
  const order: OrderPort = createMockOrderClient(state, {
    isNewUser: () => state.orders.filter((entry) => entry.status === 'paid').length === 0,
  });
  const coupon: CouponPort = createMockCouponClient(state, {
    isNewUser: () => state.orders.filter((entry) => entry.status === 'paid').length === 0,
  });
  const review: ReviewPort = createMockReviewClient(state);
  const checkin: CheckInPort = createMockCheckInClient(state);
  const message: MessagePort = createMockMessageClient(state);
  const ai: AiPort = createMockAiClient(state);
  const org: OrgPort = createMockOrgClient(state);
  const admin: AdminPort = createMockAdminClient(state);

  return { state, family, activity, package: pkg, mall, order, coupon, review, checkin, message, ai, org, admin };
}
