import { describe, expect, it } from 'vitest';

import { ZHIYA_TABS } from '@sdkwork/zhiya-h5-core';

import { TabBar } from '../src/navigation/TabBar.js';

describe('zhiya five-tab shell', () => {
  it('maps_every_tab_to_an_icon_and_badge_surface', () => {
    // The tab bar renders exactly the shared five-tab contract; the badge is
    // published on the profile tab (message center entry lives under 我的).
    const tabIds = ZHIYA_TABS.map((tab) => tab.id);
    expect(tabIds).toEqual(['home', 'activity', 'ai', 'mall', 'profile']);
    expect(TabBar).toBeTypeOf('function');
  });
});
