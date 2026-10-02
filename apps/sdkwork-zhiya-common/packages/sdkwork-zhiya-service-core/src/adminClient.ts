/**
 * Mock AdminPort — platform governance (PRD §25/§44 P0 平台后台, PC-only UI).
 * Platform statistics derive from the live mock state; org and activity
 * governance mutate shared state so C-end surfaces reflect decisions
 * immediately (org suspension hides its activities from listing).
 */

import type { AdminPort } from './ports.js';
import type { OrgStatus } from './types.js';
import type { Activity, Org, OrgAdminView } from './types.js';
import type { ZhiyaMockState } from './state.js';

export function createMockAdminClient(state: ZhiyaMockState): AdminPort {
  function orgViews(): OrgAdminView[] {
    return state.orgs.map((org) => ({
      ...org,
      status: state.orgStatuses[org.id] ?? 'normal',
      activityCount: state.allActivities().filter((activity) => activity.orgId === org.id).length,
    }));
  }

  function setOrgStatus(orgId: string, status: OrgStatus): OrgAdminView {
    const org = state.orgs.find((entry) => entry.id === orgId);
    if (org === undefined) {
      throw new Error(`org not found: ${orgId}`);
    }
    state.orgStatuses[orgId] = status;
    state.persist();
    const view = orgViews().find((entry) => entry.id === orgId);
    if (view === undefined) {
      throw new Error(`org view missing: ${orgId}`);
    }
    return view;
  }

  function setActivityStatus(activityId: string, status: 'published' | 'offline'): Activity {
    const activity = state.findActivity(activityId);
    if (activity === null) {
      throw new Error(`activity not found: ${activityId}`);
    }
    activity.status = status;
    // Seed-activity status changes must survive reloads (the catalog rebuilds
    // from seeds on every boot) — persist as an override, re-applied in
    // hydrateEnrollmentOverrides' pass.
    state.activityStatuses[activityId] = status;
    state.persist();
    return activity;
  }

  return {
    async platformStats() {
      const now = state.now();
      const paidOrders = state.orders.filter((order) => order.status === 'paid');
      const refunded = state.orders.filter((order) => order.status === 'refunded');
      return {
        totalFamilies: state.family === null ? 0 : 1,
        totalChildren: state.family?.children.length ?? 0,
        totalOrgs: state.orgs.length,
        suspendedOrgs: Object.values(state.orgStatuses).filter((status) => status === 'suspended').length,
        totalActivities: state.allActivities().length,
        offlineActivities: state.allActivities().filter((activity) => activity.status === 'offline').length,
        totalOrders: state.orders.length,
        paidOrders: paidOrders.length,
        gmv: paidOrders.reduce((sum, order) => sum + order.payable, 0),
        refundAmount: refunded.reduce((sum, order) => sum + order.payable, 0),
        checkInCount: state.orders.filter((order) => order.checkInState === 'checked-in').length,
        reviewCount: state.reviews.length,
        computedAt: now.toISOString(),
      };
    },
    async listOrgs() {
      return orgViews();
    },
    async setOrgStatus(orgId, status) {
      return setOrgStatus(orgId, status);
    },
    async listAllActivities() {
      return state.allActivities().filter((activity) => !activity.orgCreated || activity.status !== 'draft');
    },
    async setActivityStatus(activityId, status) {
      return setActivityStatus(activityId, status);
    },
  };
}

export type { Org };
