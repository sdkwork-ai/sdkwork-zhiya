import { describe, expect, it } from 'vitest';

import { createZhiyaServiceHub } from '../src/index.js';

const NOW = new Date('2026-10-02T10:00:00+08:00');

describe('zhiya platform admin governance (PRD §25)', () => {
  it('reports_platform_stats_from_live_state', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    const stats = await hub.admin.platformStats();
    expect(stats.totalOrgs).toBe(6);
    expect(stats.totalActivities).toBeGreaterThanOrEqual(12);
    expect(stats.paidOrders).toBe(0);
    expect(stats.gmv).toBe(0);
  });

  it('takes_an_activity_offline_and_republishes_it', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    const offline = await hub.admin.setActivityStatus('act-101', 'offline');
    expect(offline.status).toBe('offline');
    // C-end listing hides offline activities immediately.
    const listed = await hub.activity.listActivities();
    expect(listed.map((activity) => activity.id)).not.toContain('act-101');
    const republished = await hub.admin.setActivityStatus('act-101', 'published');
    expect(republished.status).toBe('published');
  });

  it('suspends_an_org_which_hides_its_activities_from_the_c_end', async () => {
    const hub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    const suspended = await hub.admin.setOrgStatus('org-2', 'suspended');
    expect(suspended.status).toBe('suspended');
    const listed = await hub.activity.listActivities();
    expect(listed.filter((activity) => activity.orgId === 'org-2')).toEqual([]);
    const restored = await hub.admin.setOrgStatus('org-2', 'normal');
    expect(restored.status).toBe('normal');
    const relisted = await hub.activity.listActivities();
    expect(relisted.some((activity) => activity.orgId === 'org-2')).toBe(true);
  });

  it('applies_activity_status_overrides_when_hydrating_a_fresh_hub', async () => {
    const seedHub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    await seedHub.admin.setActivityStatus('act-101', 'offline');
    // Simulate a reload: a fresh hub over the SAME persisted store — use the
    // recorded overrides from the seed hub's state to hydrate a new catalog.
    const overrides = seedHub.state.activityStatuses;
    const reloadedHub = createZhiyaServiceHub({ storage: null, now: () => NOW });
    reloadedHub.state.activityStatuses = overrides;
    const { hydrateEnrollmentOverrides } = await import('../src/index.js');
    hydrateEnrollmentOverrides(reloadedHub.state);
    expect((await reloadedHub.activity.getActivity('act-101'))?.status).toBe('offline');
  });
});
