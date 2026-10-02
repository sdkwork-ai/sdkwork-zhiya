# scripts/ — Thin Command Entrypoints

Thin command entrypoints for `sdkwork-zhiya` (`PNPM_SCRIPT_SPEC.md` §9,
`CODE_STYLE_SPEC.md` §7). Root `package.json` lifecycle verbs delegate to
`scripts/sdkwork-command.mjs`; it forwards to pnpm filters and the canonical
`sdkwork-specs` check tools and owns no business logic.

| Command | Effect |
| --- | --- |
| `pnpm dev` / `dev:standalone` | Vite dev server for `sdkwork-zhiya-h5` on port 3300 (mode `standalone.development`). |
| `pnpm build` | `build:h5:dev` via the canonical browser build runner. |
| `pnpm test` | `vitest run` in every package that owns tests. |
| `pnpm typecheck` | `tsc --noEmit` in every package. |
| `pnpm check` | Typecheck + `sdkwork-specs` standards audits (pnpm scripts, docs, agents, baseline, workspace layout, source config, app manifest, component ports, tailwind, i18n). |
| `pnpm verify` | typecheck → test → `build:h5:prod`. |
| `pnpm clean` | Remove per-package build output. |
