/**
 * i18n fragments for the platform admin capability (I18N_SPEC.md §6 layout).
 */

import enUsScreens from './en-US/zhiya/admin/screens.json';
import zhCnScreens from './zh-CN/zhiya/admin/screens.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-pc-core';

export const adminI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { admin: zhCnScreens } },
  'en-US': { zhiya: { admin: enUsScreens } },
};
