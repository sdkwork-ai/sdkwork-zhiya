/**
 * i18n fragments for the AI capability (I18N_SPEC.md §6 layout).
 */

import enUsScreens from './en-US/zhiya/ai/screens.json';
import zhCnScreens from './zh-CN/zhiya/ai/screens.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-h5-core';

export const aiI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { ai: zhCnScreens } },
  'en-US': { zhiya: { ai: enUsScreens } },
};
