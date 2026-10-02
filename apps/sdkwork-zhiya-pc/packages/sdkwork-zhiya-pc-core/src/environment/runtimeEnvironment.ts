/**
 * Browser runtime environment (SOURCE_CONFIG_SPEC.md, ENVIRONMENT_SPEC §5.1).
 * The deploy-time `/runtime-env.json` document is materialized per build by
 * the canonical build runner; this loader parses and validates its identity.
 */

export interface ZhiyaRuntimeEnvironment {
  environment: string;
  deploymentProfile: string;
  profileId: string;
  runtimeTarget: 'browser';
  browserOriginMode: 'same-origin' | 'cross-origin';
}

export const FALLBACK_RUNTIME_ENVIRONMENT: ZhiyaRuntimeEnvironment = {
  environment: 'development',
  deploymentProfile: 'standalone',
  profileId: 'standalone.development',
  runtimeTarget: 'browser',
  browserOriginMode: 'same-origin',
};

function isRuntimeEnvironment(value: unknown): value is ZhiyaRuntimeEnvironment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.environment === 'string' &&
    typeof candidate.deploymentProfile === 'string' &&
    typeof candidate.profileId === 'string' &&
    candidate.runtimeTarget === 'browser' &&
    (candidate.browserOriginMode === 'same-origin' || candidate.browserOriginMode === 'cross-origin')
  );
}

/**
 * Load `/runtime-env.json`; falls back to standalone.development when the
 * document is absent (raw `vite` dev server without materialization).
 */
export async function loadRuntimeEnvironment(): Promise<ZhiyaRuntimeEnvironment> {
  if (typeof fetch !== 'function') {
    return FALLBACK_RUNTIME_ENVIRONMENT;
  }
  try {
    const response = await fetch('/runtime-env.json', { cache: 'no-store' });
    if (!response.ok) {
      return FALLBACK_RUNTIME_ENVIRONMENT;
    }
    const value: unknown = await response.json();
    return isRuntimeEnvironment(value) ? value : FALLBACK_RUNTIME_ENVIRONMENT;
  } catch {
    return FALLBACK_RUNTIME_ENVIRONMENT;
  }
}
