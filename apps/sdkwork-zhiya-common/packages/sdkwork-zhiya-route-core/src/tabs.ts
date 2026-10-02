/**
 * Bottom navigation contract: exactly five tabs, 首页 first
 * (PRD §5/§45: 首页｜活动｜AI｜商城｜我的).
 */

import type { TabId } from './types.js';

export interface TabDefinition {
  id: TabId;
  /** Tab root route path. */
  path: string;
  /** i18n key of the tab label. */
  titleKey: string;
}

export const ZHIYA_TABS: readonly TabDefinition[] = [
  { id: 'home', path: '/home', titleKey: 'zhiya.shell.tab.home' },
  { id: 'activity', path: '/activity', titleKey: 'zhiya.shell.tab.activity' },
  { id: 'ai', path: '/ai', titleKey: 'zhiya.shell.tab.ai' },
  { id: 'mall', path: '/mall', titleKey: 'zhiya.shell.tab.mall' },
  { id: 'profile', path: '/profile', titleKey: 'zhiya.shell.tab.profile' },
] as const;
