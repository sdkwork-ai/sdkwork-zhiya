/**
 * Runtime SDK client registry. Implementations are registered exactly once at
 * app bootstrap; screens and hooks read them through the typed accessors.
 * This keeps the UI → service → injected-client flow mandatory
 * (FRONTEND_CODE_SPEC.md §2) without hard-wiring mock clients into components.
 */

import type { ZhiyaPortMap, ZhiyaPortName } from './ports.js';

const registry = new Map<ZhiyaPortName, unknown>();

export function registerZhiyaClient<K extends ZhiyaPortName>(
  name: K,
  implementation: ZhiyaPortMap[K],
): void {
  if (registry.has(name)) {
    throw new Error(`zhiya client already registered: ${name}`);
  }
  registry.set(name, implementation);
}

export function getZhiyaClient<K extends ZhiyaPortName>(name: K): ZhiyaPortMap[K] {
  const implementation = registry.get(name);
  if (!implementation) {
    throw new Error(
      `zhiya client not registered: ${name}. Register it in src/bootstrap/sdkClients.ts before rendering screens.`,
    );
  }
  return implementation as ZhiyaPortMap[K];
}

/** Test-only: reset all registrations. */
export function resetZhiyaClients(): void {
  registry.clear();
}

export function hasZhiyaClient(name: ZhiyaPortName): boolean {
  return registry.has(name);
}
