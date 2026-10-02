# Zhiya Mini Program (知鸭小程序)

Native WeChat mini-program client of Zhiya (知鸭). Five tabBar pages map 1:1 to
the cross-surface tabs (首页 Home ｜ 活动 Activities ｜ AI 问知鸭 ｜ 商城 Mall ｜
我的 Profile); the C-end flow (活动详情、报名、收银台、订单、评价、家庭、消息)
ships in the `detail` subpackage.

## Layout

- `packages/sdkwork-zhiya-mp-*` — TypeScript capability packages consuming the
  shared common service family (`@sdkwork/zhiya-service-core` et al.). `wx.*`
  is touched only in `src/bootstrap/runtime.ts` through a typed host adapter.
- `src/pages/` + `src/detail/` — native pages projected from the route
  identities; `src/app.json` declares tabBar + subpackage.
- `src/runtime/` — committed esbuild bundle of the bootstrap runtime (CJS,
  platform neutral) built by `scripts/build-runtime.mjs`.

## Commands

```bash
pnpm install                  # from the repository root
pnpm --filter sdkwork-zhiya-mini-program typecheck
pnpm --filter sdkwork-zhiya-mini-program test     # surface contract tests (node --test)
pnpm --filter sdkwork-zhiya-mini-program build    # bundle runtime for standalone.development
```

Then open the WeChat DevTools with `miniprogramRoot=src/` (see
`project.config.json`).

## Standards

Agent entrypoint: `AGENTS.md`. Canonical specs:
`MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md`, `APP_MINI_PROGRAM_UI_SPEC.md`,
`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
