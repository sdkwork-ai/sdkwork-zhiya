/**
 * i18n fragments for the home capability (I18N_SPEC.md §6 layout).
 */

import enUsScreens from './en-US/zhiya/home/screens.json';
import zhCnScreens from './zh-CN/zhiya/home/screens.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-pc-core';

export const homeI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { home: zhCnScreens } },
  'en-US': { zhiya: { home: enUsScreens } },
};
