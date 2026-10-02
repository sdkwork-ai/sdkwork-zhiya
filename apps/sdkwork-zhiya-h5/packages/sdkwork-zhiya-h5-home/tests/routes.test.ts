import { describe, expect, it } from 'vitest';

import { validateZhiyaRouteTable } from '@sdkwork/zhiya-h5-core';

import { homeRouteContributions } from '../src/routes/routeContributions.js';

describe('zhiya home route contributions', () => {
  it('declares_the_home_tab_root_and_search_screen', () => {
    expect(homeRouteContributions.map((route) => route.id)).toEqual([
      'app.zhiya.home.root',
      'app.zhiya.home.search',
    ]);
    expect(homeRouteContributions[0]).toMatchObject({ path: '/home', tab: 'home' });
    expect(validateZhiyaRouteTable(homeRouteContributions).filter((issue) => !issue.routeId.startsWith('tab:'))).toEqual([]);
  });
});
