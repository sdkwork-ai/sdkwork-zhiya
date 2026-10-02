/**
 * Shared mock state for the standalone service hub. Seed catalog data is
 * in-memory (rebuilt relative to the injected clock each boot); user-mutable
 * state (family, orders, coupons, reviews, favorites, messages, org-created
 * activities, enrollment deltas) persists to injectable storage so the app
 * survives refreshes while tests stay deterministic with `storage: null`.
 */

import type {
  Activity,
  CouponTemplate,
  ExperiencePackage,
  Family,
  Goods,
  Message,
  Order,
  Org,
  Review,
  UserCoupon,
} from './types.js';
import type { SeedContext } from './seeds.js';
import { buildSeedCatalog, buildWelcomeMessage } from './seeds.js';

export interface KVStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function defaultStorage(): KVStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export interface MockStateOptions {
  storage?: KVStorage | null;
  now?: () => Date;
}

const KEYS = {
  family: 'zhiya.family',
  orders: 'zhiya.orders',
  coupons: 'zhiya.coupons',
  reviews: 'zhiya.reviews',
  favorites: 'zhiya.favorites',
  goodsFavorites: 'zhiya.goods-favorites',
  messages: 'zhiya.messages',
  enrolled: 'zhiya.enrolled-overrides',
  orgActivities: 'zhiya.org-activities',
  orgStatuses: 'zhiya.org-statuses',
  activityStatuses: 'zhiya.activity-status-overrides',
} as const;

function readJson<T>(storage: KVStorage | null, key: string): T | null {
  if (storage === null) {
    return null;
  }
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(storage: KVStorage | null, key: string, value: unknown): void {
  if (storage === null) {
    return;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full/unavailable — in-memory state still works */
  }
}

interface EnrolledOverrides {
  activity: Record<string, number>;
  session: Record<string, number>;
}

export interface ZhiyaMockState {
  now: () => Date;
  storage: KVStorage | null;
  /* seed catalog (in-memory) */
  orgs: Org[];
  activities: Activity[];
  packages: ExperiencePackage[];
  goods: Goods[];
  couponTemplates: CouponTemplate[];
  /* user-mutable state (persisted) */
  family: Family | null;
  orders: Order[];
  coupons: UserCoupon[];
  reviews: Review[];
  favorites: string[];
  goodsFavorites: string[];
  messages: Message[];
  enrolled: EnrolledOverrides;
  orgActivities: Activity[];
  orgStatuses: Record<string, 'normal' | 'suspended'>;
  activityStatuses: Record<string, 'published' | 'offline'>;
  /* helpers shared by clients */
  persist: () => void;
  notify: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => Message;
  findActivity: (activityId: string) => Activity | null;
  allActivities: () => Activity[];
}

export function createZhiyaMockState(options: MockStateOptions = {}): ZhiyaMockState {
  const storage = options.storage === undefined ? defaultStorage() : options.storage;
  const now = options.now ?? (() => new Date());
  const context: SeedContext = { now };
  const seeds = buildSeedCatalog(context);

  const family = readJson<Family>(storage, KEYS.family);
  const orders = readJson<Order[]>(storage, KEYS.orders) ?? [];
  const coupons = readJson<UserCoupon[]>(storage, KEYS.coupons) ?? [];
  const reviews = readJson<Review[]>(storage, KEYS.reviews) ?? [];
  const favorites = readJson<string[]>(storage, KEYS.favorites) ?? [];
  const goodsFavorites = readJson<string[]>(storage, KEYS.goodsFavorites) ?? [];
  const messages = readJson<Message[]>(storage, KEYS.messages) ?? [buildWelcomeMessage(now())];
  const enrolled =
    readJson<EnrolledOverrides>(storage, KEYS.enrolled) ?? { activity: {}, session: {} };
  const orgActivities = readJson<Activity[]>(storage, KEYS.orgActivities) ?? [];
  const orgStatuses =
    readJson<Record<string, 'normal' | 'suspended'>>(storage, KEYS.orgStatuses) ?? {};
  const activityStatuses =
    readJson<Record<string, 'published' | 'offline'>>(storage, KEYS.activityStatuses) ?? {};

  const state: ZhiyaMockState = {
    now,
    storage,
    orgs: seeds.orgs,
    activities: seeds.activities,
    packages: seeds.packages,
    goods: seeds.goods,
    couponTemplates: seeds.couponTemplates,
    family,
    orders,
    coupons,
    reviews,
    favorites,
    goodsFavorites,
    messages,
    enrolled,
    orgActivities,
    orgStatuses,
    activityStatuses,
    persist() {
      writeJson(storage, KEYS.family, state.family);
      writeJson(storage, KEYS.orders, state.orders);
      writeJson(storage, KEYS.coupons, state.coupons);
      writeJson(storage, KEYS.reviews, state.reviews);
      writeJson(storage, KEYS.favorites, state.favorites);
      writeJson(storage, KEYS.goodsFavorites, state.goodsFavorites);
      writeJson(storage, KEYS.messages, state.messages);
      writeJson(storage, KEYS.enrolled, state.enrolled);
      writeJson(storage, KEYS.orgActivities, state.orgActivities);
      writeJson(storage, KEYS.orgStatuses, state.orgStatuses);
      writeJson(storage, KEYS.activityStatuses, state.activityStatuses);
    },
    notify(partial) {
      const message: Message = {
        ...partial,
        id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now().toISOString(),
        read: false,
      };
      state.messages.unshift(message);
      return message;
    },
    findActivity(activityId) {
      return (
        state.activities.find((activity) => activity.id === activityId) ??
        state.orgActivities.find((activity) => activity.id === activityId) ??
        null
      );
    },
    allActivities() {
      return [...state.activities, ...state.orgActivities];
    },
  };
  return state;
}

/** Apply an enrollment delta to the in-memory catalog (persisted as overrides). */
export function applyEnrollmentDelta(
  state: ZhiyaMockState,
  activityId: string,
  sessionId: string,
  delta: number,
): void {
  const activity = state.findActivity(activityId);
  if (activity !== null) {
    activity.enrolled = Math.max(0, activity.enrolled + delta);
    state.enrolled.activity[activityId] = (state.enrolled.activity[activityId] ?? 0) + delta;
  }
  const target = activity?.sessions.find((session) => session.id === sessionId);
  if (target !== undefined) {
    target.enrolled = Math.max(0, target.enrolled + delta);
    state.enrolled.session[sessionId] = (state.enrolled.session[sessionId] ?? 0) + delta;
  }
}

/**
 * Re-apply persisted enrollment overrides onto the fresh in-memory seed
 * catalog after a reload (the catalog itself is regenerated each boot).
 */
export function hydrateEnrollmentOverrides(state: ZhiyaMockState): void {
  for (const activity of state.allActivities()) {
    const delta = state.enrolled.activity[activity.id];
    if (delta !== undefined && delta !== 0) {
      activity.enrolled = Math.max(0, activity.enrolled + delta);
    }
    // Re-apply admin take-down/republish overrides (survive reloads).
    const statusOverride = state.activityStatuses[activity.id];
    if (statusOverride !== undefined) {
      activity.status = statusOverride;
    }
    for (const session of activity.sessions) {
      const sessionDelta = state.enrolled.session[session.id];
      if (sessionDelta !== undefined && sessionDelta !== 0) {
        session.enrolled = Math.max(0, session.enrolled + sessionDelta);
      }
    }
  }
}

/** Remove stored user state (settings → 清除本地数据). */
export function clearZhiyaMockState(state: ZhiyaMockState): void {
  state.family = null;
  state.orders = [];
  state.coupons = [];
  state.reviews = [];
  state.favorites = [];
  state.goodsFavorites = [];
  state.messages = [buildWelcomeMessage(state.now())];
  state.enrolled = { activity: {}, session: {} };
  state.orgActivities = [];
  state.orgStatuses = {};
  state.activityStatuses = {};
  state.persist();
}
