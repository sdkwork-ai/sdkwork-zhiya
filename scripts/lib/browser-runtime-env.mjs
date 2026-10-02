// Contract library (BROWSER_RUNTIME_ENV_SPEC): re-exports the canonical
// browser runtime-env tooling so every zhiya browser surface resolves base
// URLs through one implementation. The h5/pc app roots materialize
// /runtime-env.json per build via the canonical build runner and read it at
// runtime through @sdkwork/sdk-common resolveBaseUrl.
export { readRuntimeEnv, resolveBaseUrl, DEFAULT_RUNTIME_ENV } from '../../sdkwork-specs/tools/browser-runtime-env.mjs';
