/**
 * Runtime environment bootstrap. The canonical browser build materializes
 * `/runtime-env.json` from `etc/browser/` before Vite runs; this loader reads
 * it once and falls back to standalone.development for raw dev servers.
 */

import {
  FALLBACK_RUNTIME_ENVIRONMENT,
  loadRuntimeEnvironment,
  type ZhiyaRuntimeEnvironment,
} from '@sdkwork/zhiya-h5-core';

let cached: ZhiyaRuntimeEnvironment | null = null;

export async function bootstrapEnvironment(): Promise<ZhiyaRuntimeEnvironment> {
  if (cached !== null) {
    return cached;
  }
  cached = await loadRuntimeEnvironment();
  if (cached !== FALLBACK_RUNTIME_ENVIRONMENT) {
    // eslint-disable-next-line no-console
    console.info(`[zhiya] runtime profile ${cached.profileId} (${cached.browserOriginMode})`);
  }
  return cached;
}

export function currentRuntimeEnvironment(): ZhiyaRuntimeEnvironment {
  return cached ?? FALLBACK_RUNTIME_ENVIRONMENT;
}
