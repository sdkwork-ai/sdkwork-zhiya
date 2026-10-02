/**
 * Mock OrgPort — the embedded org workspace backend (PRD §22). Every mock
 * profile owns the seeded demo org; org-created activities join the shared
 * catalog so the C-end sees them immediately (REQ-2026-0004).
 */

import type { OrgPort } from './ports.js';
import type { Activity, ActivityStatus, Org, OrgActivityInput } from './types.js';
import type { ZhiyaMockState } from './state.js';
import { deriveOrderStatus } from './orderStatus.js';

const MY_ORG_ID = 'org-1';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMockOrgClient(state: ZhiyaMockState): OrgPort {
  function myOrg(): Org {
    const org = state.orgs.find((entry) => entry.id === MY_ORG_ID);
    if (org === undefined) {
      throw new Error(`org not found: ${MY_ORG_ID}`);
    }
    return org;
  }

  function orgActivities(): Activity[] {
    return state.orgActivities.filter((activity) => activity.orgId === MY_ORG_ID);
  }

  function buildSession(input: OrgActivityInput, activityId: string): Activity['sessions'] {
    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    return [
      {
        id: `${activityId}-s1`,
        label: `${start.getMonth() + 1}月${start.getDate()}日 ${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} 场`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        quota: input.quota,
        enrolled: 0,
      },
    ].slice(0, end.getTime() > start.getTime() ? 1 : 1);
  }

  function toActivity(input: OrgActivityInput, status: ActivityStatus, now: Date): Activity {
    const id = makeId('act');
    return {
      id,
      orgId: MY_ORG_ID,
      orgName: myOrg().name,
      category: input.category,
      mode: input.mode,
      title: input.title,
      subtitle: input.subtitle,
      emoji: input.emoji ?? '📌',
      ageMin: input.ageMin,
      ageMax: input.ageMax,
      startTime: new Date(input.startTime).toISOString(),
      endTime: new Date(input.endTime).toISOString(),
      address: input.address,
      onlineLink: input.onlineLink,
      price: input.price,
      originalPrice: input.originalPrice,
      quota: input.quota,
      enrolled: 0,
      tags: [...input.tags],
      introduction: input.introduction,
      notice: input.notice,
      status,
      orgCreated: true,
      sessions: buildSession(input, id),
      createdAt: now.toISOString(),
    };
  }

  return {
    async getMyOrg() {
      return myOrg();
    },
    async getWorkspaceStats() {
      const now = state.now();
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const myActivities = state.allActivities().filter((activity) => activity.orgId === MY_ORG_ID);
      const published = myActivities.filter((activity) => activity.status === 'published');
      const registrations = state.orders.filter(
        (order) =>
          order.type === 'activity' &&
          (order.status === 'paid' || order.status === 'refunded') &&
          order.items.some((item) => item.activityId !== undefined && published.some((activity) => activity.id === item.activityId)),
      );
      const todayRegistrations = registrations.filter((order) => (order.paidAt ?? order.createdAt) >= dayStart.toISOString()).length;
      const pendingCheckIns = registrations.filter(
        (order) => order.status === 'paid' && order.checkInState === 'none',
      ).length;
      const salesToday = registrations
        .filter((order) => order.status === 'paid' && (order.paidAt ?? '') >= dayStart.toISOString())
        .reduce((sum, order) => sum + order.payable, 0);
      const completed = registrations.filter((order) => deriveOrderStatus(state, order) === 'completed').length;
      const completionRate = registrations.length === 0 ? 0 : completed / registrations.length;
      return {
        todayRegistrations,
        pendingCheckIns,
        salesToday,
        publishedActivities: published.length,
        totalRegistrations: registrations.length,
        completionRate,
        rating: myOrg().rating,
      };
    },
    async listOrgActivities(status) {
      const mine = orgActivities().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      return status === undefined ? mine : mine.filter((activity) => activity.status === status);
    },
    async createActivity(input, publish) {
      const activity = toActivity(input, publish ? 'published' : 'draft', state.now());
      state.orgActivities.unshift(activity);
      state.persist();
      return activity;
    },
    async updateActivity(activityId, input) {
      const activity = state.orgActivities.find((entry) => entry.id === activityId);
      if (activity === undefined) {
        throw new Error(`org activity not found: ${activityId}`);
      }
      activity.title = input.title;
      activity.subtitle = input.subtitle;
      activity.category = input.category;
      activity.mode = input.mode;
      if (input.emoji !== undefined) activity.emoji = input.emoji;
      activity.ageMin = input.ageMin;
      activity.ageMax = input.ageMax;
      activity.startTime = new Date(input.startTime).toISOString();
      activity.endTime = new Date(input.endTime).toISOString();
      activity.address = input.address;
      activity.onlineLink = input.onlineLink;
      activity.price = input.price;
      activity.originalPrice = input.originalPrice;
      activity.quota = input.quota;
      activity.introduction = input.introduction;
      activity.notice = input.notice;
      activity.tags = [...input.tags];
      const session = activity.sessions[0];
      if (session !== undefined) {
        session.startTime = activity.startTime;
        session.endTime = activity.endTime;
        session.quota = input.quota;
      }
      state.persist();
      return activity;
    },
    async publishActivity(activityId) {
      const activity = state.orgActivities.find((entry) => entry.id === activityId);
      if (activity === undefined) {
        throw new Error(`org activity not found: ${activityId}`);
      }
      activity.status = 'published';
      state.persist();
      return activity;
    },
    async offlineActivity(activityId) {
      const activity = state.orgActivities.find((entry) => entry.id === activityId);
      if (activity === undefined) {
        throw new Error(`org activity not found: ${activityId}`);
      }
      activity.status = 'offline';
      state.persist();
      return activity;
    },
    async deleteActivity(activityId) {
      state.orgActivities = state.orgActivities.filter((entry) => entry.id !== activityId);
      state.persist();
    },
  };
}
