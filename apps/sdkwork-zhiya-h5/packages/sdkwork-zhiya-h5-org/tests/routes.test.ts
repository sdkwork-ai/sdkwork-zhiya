import { describe, expect, it } from 'vitest';

import { validateZhiyaRouteTable } from '@sdkwork/zhiya-h5-core';

import { orgRouteContributions } from '../src/routes/routeContributions.js';

describe('zhiya org route contributions', () => {
  it('declares_workspace_activities_edit_and_registrations_routes', () => {
    expect(orgRouteContributions.map((route) => route.id)).toEqual([
      'app.zhiya.org.workspace',
      'app.zhiya.org.activities',
      'app.zhiya.org.activity-edit',
      'app.zhiya.org.registrations',
    ]);
    expect(orgRouteContributions.every((route) => route.tab === null)).toBe(true);
    expect(
      validateZhiyaRouteTable(orgRouteContributions).filter((issue) => !issue.routeId.startsWith('tab:')),
    ).toEqual([]);
  });
});
