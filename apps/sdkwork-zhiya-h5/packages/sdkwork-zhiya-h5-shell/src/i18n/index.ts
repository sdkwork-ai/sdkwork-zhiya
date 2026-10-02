/**
 * i18n fragments for the shell package (I18N_SPEC.md §6 layout).
 */

import enUsNavigation from './en-US/zhiya/shell/navigation.json';
import zhCnNavigation from './zh-CN/zhiya/shell/navigation.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-h5-core';

export const shellI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { shell: zhCnNavigation } },
  'en-US': { zhiya: { shell: enUsNavigation } },
};
