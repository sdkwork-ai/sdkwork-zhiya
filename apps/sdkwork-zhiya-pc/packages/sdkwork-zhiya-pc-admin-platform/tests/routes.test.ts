import { describe, expect, it } from 'vitest';

import { validateZhiyaRouteTable } from '@sdkwork/zhiya-pc-core';

import { adminRouteContributions } from '../src/routes/routeContributions.js';

describe('zhiya admin route contributions', () => {
  it('declares_the_pc_only_admin_dashboard_route', () => {
    expect(adminRouteContributions.map((route) => route.id)).toEqual(['app.zhiya.admin.dashboard']);
    expect(adminRouteContributions.every((route) => route.tab === null)).toBe(true);
    expect(
      validateZhiyaRouteTable(adminRouteContributions).filter((issue) => !issue.routeId.startsWith('tab:')),
    ).toEqual([]);
  });
});
