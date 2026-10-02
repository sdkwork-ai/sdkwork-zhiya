import { describe, expect, it } from 'vitest';

import { ZHIYA_TABS, validateZhiyaRouteTable } from '@sdkwork/zhiya-pc-core';

import { activityRouteContributions } from '../src/routes/routeContributions.js';

describe('zhiya activity route contributions', () => {
  it('declares_the_activity_tab_root_and_the_registration_flow_screens', () => {
    expect(activityRouteContributions.map((route) => route.id)).toEqual([
      'app.zhiya.activity.root',
      'app.zhiya.activity.detail',
      'app.zhiya.activity.register',
      'app.zhiya.activity.pay',
      'app.zhiya.activity.success',
      'app.zhiya.activity.packages',
      'app.zhiya.activity.package',
    ]);
    const root = activityRouteContributions[0]!;
    expect(root.path).toBe('/activity');
    expect(root.tab).toBe(ZHIYA_TABS[1]!.id);
  });

  it('stays_unique_outside_the_tab_contract', () => {
    const issues = validateZhiyaRouteTable(activityRouteContributions);
    expect(issues.filter((issue) => !issue.routeId.startsWith('tab:'))).toEqual([]);
  });
});
