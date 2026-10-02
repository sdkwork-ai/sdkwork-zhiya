import { describe, expect, it } from 'vitest';

import { ZHIYA_TABS, composeZhiyaRouteTable, defineZhiyaRoutes } from '../src/index.js';

describe('zhiya h5 core seams', () => {
  it('re-exports_the_five_tab_route_contract', () => {
    expect(ZHIYA_TABS.map((tab) => tab.id)).toEqual(['home', 'activity', 'ai', 'mall', 'profile']);
  });

  it('composes_capability_route_contributions_fail_fast', () => {
    const contributions = defineZhiyaRoutes([
      { id: 'app.zhiya.home.root', path: '/home', titleKey: 'zhiya.home.root.title', capability: 'home', tab: 'home' },
    ]);
    expect(() =>
      composeZhiyaRouteTable([contributions]),
    ).toThrowError(/bottom tab/);
  });
});
