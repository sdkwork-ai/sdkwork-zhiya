import { describe, expect, it } from 'vitest';

import { validateZhiyaRouteTable } from '@sdkwork/zhiya-h5-core';

import { profileRouteContributions } from '../src/routes/routeContributions.js';

describe('zhiya profile route contributions', () => {
  it('declares_the_profile_tab_root_and_all_sub_screens', () => {
    expect(profileRouteContributions).toHaveLength(10);
    expect(profileRouteContributions[0]).toMatchObject({ path: '/profile', tab: 'profile' });
    expect(
      validateZhiyaRouteTable(profileRouteContributions).filter((issue) => !issue.routeId.startsWith('tab:')),
    ).toEqual([]);
  });
});
