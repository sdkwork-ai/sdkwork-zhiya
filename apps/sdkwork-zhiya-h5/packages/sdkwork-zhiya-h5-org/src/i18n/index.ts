/**
 * i18n fragments for the org workspace capability (I18N_SPEC.md §6 layout).
 */

import enUsScreens from './en-US/zhiya/org/screens.json';
import zhCnScreens from './zh-CN/zhiya/org/screens.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-h5-core';

export const orgI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { org: zhCnScreens } },
  'en-US': { zhiya: { org: enUsScreens } },
};
