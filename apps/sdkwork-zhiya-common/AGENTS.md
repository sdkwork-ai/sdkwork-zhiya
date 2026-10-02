# Repository Guidelines (sdkwork-zhiya-common)

Shared cross-surface package family for `sdkwork-zhiya`. Behavior follows the
repository-root `AGENTS.md` and `../sdkwork-specs/README.md`; this file only
adds family-local rules.

- Packages are source-only: `main`/`types`/`exports` point at `./src/index.ts`;
  no build step, no `dist/`.
- Zero UI dependencies: no React, no DOM globals in `src/` (Node test
  environment only). Types portable across client surfaces.
- `src/index.ts` is the only public export boundary per package.
- Cross-package imports use exact package names (`workspace:*`), never
  relative `src/` paths.
- Domain rules (registration checks, order status derivation, coupon math,
  intent recognition) live here — not in client surfaces.

Verification: `pnpm --filter "@sdkwork/zhiya-*" typecheck && pnpm --filter "@sdkwork/zhiya-*" test`
