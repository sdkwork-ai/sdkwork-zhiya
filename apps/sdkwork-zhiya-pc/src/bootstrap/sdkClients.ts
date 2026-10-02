/**
 * SDK client bootstrap: builds the standalone mock service hub once and
 * registers every port implementation into the typed registry. UI code reads
 * clients only through `getZhiyaClient` (FRONTEND_CODE_SPEC.md §2); Phase 2
 * replaces individual mock clients with generated platform SDK clients here.
 */

import {
  createZhiyaServiceHub,
  registerZhiyaClient,
  resetZhiyaClients,
} from '@sdkwork/zhiya-pc-core';

let booted = false;

export function bootstrapSdkClients(): void {
  if (booted) {
    return;
  }
  booted = true;
  const hub = createZhiyaServiceHub();
  resetZhiyaClients();
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
}
