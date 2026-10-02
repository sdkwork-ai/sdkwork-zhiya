/**
 * i18n fragments for the trade capability (I18N_SPEC.md §6 layout).
 */

import enUsScreens from './en-US/zhiya/trade/screens.json';
import zhCnScreens from './zh-CN/zhiya/trade/screens.json';

import type { ZhiyaLocaleResources } from '@sdkwork/zhiya-pc-core';

export const tradeI18nResources: ZhiyaLocaleResources = {
  'zh-CN': { zhiya: { trade: zhCnScreens } },
  'en-US': { zhiya: { trade: enUsScreens } },
};
