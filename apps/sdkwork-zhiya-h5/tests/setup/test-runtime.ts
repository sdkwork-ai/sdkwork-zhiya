/**
 * Shared test runtime: registers the mock hub clients with deterministic
 * in-memory storage and creates the i18n instance from the same merged
 * resources as the app.
 */

import {
  createZhiyaServiceHub,
  createZhiyaI18n,
  mergeZhiyaResources,
  registerZhiyaClient,
  resetZhiyaClients,
} from '@sdkwork/zhiya-h5-core';
import { commonsI18nResources } from '@sdkwork/zhiya-h5-commons';
import { shellI18nResources } from '@sdkwork/zhiya-h5-shell';
import { homeI18nResources } from '@sdkwork/zhiya-h5-home';
import { activityI18nResources } from '@sdkwork/zhiya-h5-activity';
import { aiI18nResources } from '@sdkwork/zhiya-h5-ai';
import { mallI18nResources } from '@sdkwork/zhiya-h5-mall';
import { tradeI18nResources } from '@sdkwork/zhiya-h5-trade';
import { profileI18nResources } from '@sdkwork/zhiya-h5-profile';
import { orgI18nResources } from '@sdkwork/zhiya-h5-org';

let booted = false;

export function bootTestRuntime(): void {
  if (booted) {
    return;
  }
  booted = true;
  createZhiyaI18n(
    mergeZhiyaResources(
      commonsI18nResources,
      shellI18nResources,
      homeI18nResources,
      activityI18nResources,
      aiI18nResources,
      mallI18nResources,
      tradeI18nResources,
      profileI18nResources,
      orgI18nResources,
    ),
    'zh-CN',
  );
}

/** Fresh hub with in-memory storage registered under every port name. */
export function registerFreshMockClients(): void {
  resetZhiyaClients();
  const hub = createZhiyaServiceHub({ storage: null });
  registerZhiyaClient('family', hub.family);
  registerZhiyaClient('activity', hub.activity);
  registerZhiyaClient('package', hub.package);
  registerZhiyaClient('mall', hub.mall);
  registerZhiyaClient('order', hub.order);
  registerZhiyaClient('coupon', hub.coupon);
  registerZhiyaClient('review', hub.review);
  registerZhiyaClient('checkin', hub.checkin);
  registerZhiyaClient('message', hub.message);
  registerZhiyaClient('ai', hub.ai);
  registerZhiyaClient('org', hub.org);
  registerZhiyaClient('admin', hub.admin);
}
