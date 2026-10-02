/**
 * i18n fragments for the activity capability (I18N_SPEC.md §6 layout).
 */

import enUsScreens from './en-US/zhiya/activity/screens.json';
import zhCnScreens from './zh-CN/zhiya/activity/screens.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-pc-core';

export const activityI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { activity: zhCnScreens } },
  'en-US': { zhiya: { activity: enUsScreens } },
};
