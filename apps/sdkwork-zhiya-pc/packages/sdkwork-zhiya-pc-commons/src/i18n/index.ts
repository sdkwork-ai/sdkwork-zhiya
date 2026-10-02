/**
 * i18n fragments for the commons package (I18N_SPEC.md §6 layout:
 * `src/i18n/<locale>/<domain>/<capability>/<fragment>.json`).
 */

import enUsCommons from './en-US/zhiya/commons/commons.json';
import zhCnCommons from './zh-CN/zhiya/commons/commons.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-pc-core';

export const commonsI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { commons: zhCnCommons } },
  'en-US': { zhiya: { commons: enUsCommons } },
};
