# Zhiya PC Core

`@sdkwork/sdkwork-zhiya-pc-core` — Composition seam of the H5 surface: runtime environment, i18n factory, theme color mode, session store, tab badges, and re-export shims for the shared route/service contracts. Capability packages depend on this package, not on `sdkwork-zhiya-common` directly.

Layer role: `frontend-core` (COMPONENT_SPEC.md).

Verification: `pnpm --filter @sdkwork/sdkwork-zhiya-pc-core typecheck && pnpm --filter @sdkwork/sdkwork-zhiya-pc-core test`
