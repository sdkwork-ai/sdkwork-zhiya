import { describe, expect, it } from 'vitest';

import { ZHIYA_TABS } from '@sdkwork/zhiya-pc-core';

import { cx } from '../src/navigation/navStyles.js';

describe('zhiya desktop shell', () => {
  it('renders_navigation_from_the_five_cross_surface_tabs', () => {
    expect(ZHIYA_TABS.map((tab) => tab.id)).toEqual(['home', 'activity', 'ai', 'mall', 'profile']);
    expect(cx('a', false, undefined, 'b')).toBe('a b');
  });
});
