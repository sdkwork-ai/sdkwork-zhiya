/**
 * i18n fragments for the mall capability (I18N_SPEC.md §6 layout).
 */

import enUsScreens from './en-US/zhiya/mall/screens.json';
import zhCnScreens from './zh-CN/zhiya/mall/screens.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-h5-core';

export const mallI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { mall: zhCnScreens } },
  'en-US': { zhiya: { mall: enUsScreens } },
};
