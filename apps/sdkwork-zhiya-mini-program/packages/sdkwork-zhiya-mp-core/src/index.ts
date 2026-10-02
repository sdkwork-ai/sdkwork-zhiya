/**
 * Typed host-adapter boundary for the Zhiya WeChat mini-program
 * (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md): capability packages never call
 * `wx.*` — the platform bridge is bound once here and consumed through this
 * port. Also owns the runtime config binding and one-time client bootstrap.
 */

import {
  createZhiyaServiceHub,
  registerZhiyaClient,
  resetZhiyaClients,
} from '@sdkwork/zhiya-service-core';

/** Platform actions the packages may request, never implement. */
export interface MiniProgramHostPort {
  navigateTo(url: string): void;
  switchTab(url: string): void;
  showToast(title: string): void;
}

let host: MiniProgramHostPort | null = null;

export function bindMiniProgramHost(port: MiniProgramHostPort): void {
  host = port;
}

export function getMiniProgramHost(): MiniProgramHostPort {
  if (host === null) {
    throw new Error('mini-program host not bound; call bindMiniProgramHost in src/bootstrap/runtime.ts');
  }
  return host;
}

/** Runtime identity injected by scripts/build-runtime.mjs (ENVIRONMENT_SPEC §5.1). */
export interface MiniProgramRuntimeConfig {
  environment: string;
  deploymentProfile: string;
  profileId: string;
  runtimeTarget: 'mini-program';
  appApiBaseUrl: string;
  sdkBaseUrl: string;
}

let runtimeConfig: MiniProgramRuntimeConfig | null = null;

export function bindRuntimeConfig(config: MiniProgramRuntimeConfig): void {
  runtimeConfig = config;
}

export function getRuntimeConfig(): MiniProgramRuntimeConfig {
  if (runtimeConfig === null) {
    throw new Error('mini-program runtime config not bound');
  }
  return runtimeConfig;
}

/**
 * One-time mock client bootstrap (Phase 1 standalone). Phase 2 swaps the hub
 * for generated platform SDK clients behind the same ports.
 */
export function bootstrapZhiyaClients(): void {
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
