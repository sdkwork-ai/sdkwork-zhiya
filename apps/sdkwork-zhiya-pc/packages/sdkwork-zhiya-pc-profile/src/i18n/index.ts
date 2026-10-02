/**
 * i18n fragments for the profile capability (I18N_SPEC.md §6 layout).
 */

import enUsScreens from './en-US/zhiya/profile/screens.json';
import zhCnScreens from './zh-CN/zhiya/profile/screens.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-pc-core';

export const profileI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { profile: zhCnScreens } },
  'en-US': { zhiya: { profile: enUsScreens } },
};
