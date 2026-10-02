/**
 * Route alignment guard: every composed route identity must be mounted in App
 * with an element, and the composition contract must hold. Path strings stay
 * presentation-only.
 */

import { describe, expect, it } from 'vitest';

import { validateZhiyaRouteTable, ZHIYA_TABS } from '@sdkwork/zhiya-h5-core';

import { listZhiyaRouteIdentities, zhiyaRouteElements, zhiyaRouteTable } from '../src/bootstrap/routes.js';

describe('zhiya route table', () => {
  it('passes_the_canonical_route_composition_contract', () => {
    expect(validateZhiyaRouteTable(zhiyaRouteTable)).toEqual([]);
  });

  it('mounts_exactly_one_route_element_for_every_identity', () => {
    const identities = listZhiyaRouteIdentities();
    for (const id of identities) {
      expect(zhiyaRouteElements[id], `missing element for ${id}`).toBeDefined();
    }
    expect(Object.keys(zhiyaRouteElements).sort()).toEqual([...identities].sort());
  });

  it('owns_exactly_five_tab_roots_matching_the_bottom_navigation', () => {
    const tabRoots = zhiyaRouteTable.filter((route) => route.tab !== null);
    expect(tabRoots.map((route) => route.tab)).toEqual(ZHIYA_TABS.map((tab) => tab.id));
    expect(tabRoots.map((route) => route.path)).toEqual(ZHIYA_TABS.map((tab) => tab.path));
  });

  it('declares_home_as_the_default_tab_root', () => {
    const homeRoot = zhiyaRouteTable.find((route) => route.tab === 'home');
    expect(homeRoot?.path).toBe('/home');
  });

  it('uses_only_zhiya_capability_tokens_in_route_ids', () => {
    for (const route of zhiyaRouteTable) {
      expect(route.id).toMatch(/^app\.zhiya\.[a-z0-9-]+\.[a-z0-9-]+$/u);
      expect(route.capability).toBe(route.id.split('.')[2]);
    }
  });
});
