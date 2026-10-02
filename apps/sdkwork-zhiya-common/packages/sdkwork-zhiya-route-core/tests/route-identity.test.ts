import { describe, expect, it } from 'vitest';

import {
  composeZhiyaRouteTable,
  defineZhiyaRoutes,
  validateZhiyaRouteTable,
  ZHIYA_TABS,
} from '../src/index.js';

const fullTable = defineZhiyaRoutes([
  { id: 'app.zhiya.home.root', path: '/home', titleKey: 'zhiya.home.root.title', capability: 'home', tab: 'home' },
  { id: 'app.zhiya.activity.root', path: '/activity', titleKey: 'zhiya.activity.root.title', capability: 'activity', tab: 'activity' },
  { id: 'app.zhiya.ai.root', path: '/ai', titleKey: 'zhiya.ai.root.title', capability: 'ai', tab: 'ai' },
  { id: 'app.zhiya.mall.root', path: '/mall', titleKey: 'zhiya.mall.root.title', capability: 'mall', tab: 'mall' },
  { id: 'app.zhiya.profile.root', path: '/profile', titleKey: 'zhiya.profile.root.title', capability: 'profile', tab: 'profile' },
]);

describe('zhiya route identity contract', () => {
  it('accepts_the_five_tab_roots_in_prd_order', () => {
    expect(validateZhiyaRouteTable(fullTable)).toEqual([]);
    expect(composeZhiyaRouteTable([fullTable]).map((route) => route.tab)).toEqual([
      'home',
      'activity',
      'ai',
      'mall',
      'profile',
    ]);
  });

  it('rejects_duplicate_paths_and_ids', () => {
    const duplicated = defineZhiyaRoutes([
      ...fullTable,
      { id: 'app.zhiya.home.root', path: '/other', titleKey: 'zhiya.home.root.title', capability: 'home', tab: null },
      { id: 'app.zhiya.mall.root', path: '/mall', titleKey: 'zhiya.mall.root.title', capability: 'mall', tab: null },
    ]);
    const issues = validateZhiyaRouteTable(duplicated);
    expect(issues.some((issue) => issue.issue.includes('duplicate route id'))).toBe(true);
    expect(issues.some((issue) => issue.issue.includes('duplicate route path'))).toBe(true);
  });

  it('requires_every_tab_to_own_a_root_route', () => {
    const missing = fullTable.filter((route) => route.tab !== 'ai');
    const issues = validateZhiyaRouteTable(missing);
    expect(issues).toContainEqual({ routeId: 'tab:ai', issue: 'bottom tab ai has no root route' });
  });

  it('enforces_the_zhiya_id_and_title_key_patterns', () => {
    const bad = defineZhiyaRoutes([
      { id: 'app.whatseek.chat.home', path: '/x', titleKey: 'whatseek.chat.home.title', capability: 'x', tab: null },
    ]);
    const issues = validateZhiyaRouteTable([...fullTable, ...bad]);
    expect(issues.some((issue) => issue.issue.includes('route id must match'))).toBe(true);
    expect(issues.some((issue) => issue.issue.includes('titleKey must match'))).toBe(true);
  });

  it('exposes_tab_paths_matching_the_bottom_navigation_contract', () => {
    expect(ZHIYA_TABS.map((tab) => tab.path)).toEqual(['/home', '/activity', '/ai', '/mall', '/profile']);
  });
});
