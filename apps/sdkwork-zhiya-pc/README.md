# Zhiya PC (知鸭)

Desktop-class PC surface of Zhiya (知鸭), the AI-native family education and
activity platform. Five navigation-rail destinations: 首页 (Home) ｜ 活动
(Activities) ｜ AI (问知鸭) ｜ 商城 (Mall) ｜ 我的 (Profile), plus the org
(机构) workspace for merchants.

## Layout

- `src/` — thin root: `main.tsx`, `App.tsx`, `AuthGate.tsx`, `index.css`
  (theme bootstrap), `bootstrap/` (environment, SDK clients, routes),
  `shell/` (ownership shim).
- `packages/` — `sdkwork-zhiya-pc-core` (composition root), `-commons`,
  `-shell` (desktop navigation rail), and one capability package per domain
  (`-home`, `-activity`, `-ai`, `-mall`, `-trade`, `-profile`, `-org`).
- `etc/` — source config index + standalone browser runtime-env profiles.
- `bin/` — desktop packaging entrypoints (packaging milestone).
- `tests/` — PC architecture contract + route alignment tests.

Route ids and i18n keys are the same cross-surface contract as the H5 surface
(`app.zhiya.<capability>.<screen>`, `zhiya.*`).

## Commands

```bash
pnpm --filter sdkwork-zhiya-pc dev        # Vite on http://127.0.0.1:3400
pnpm --filter sdkwork-zhiya-pc test       # vitest
pnpm --filter sdkwork-zhiya-pc typecheck  # tsc --noEmit
pnpm build:pc:dev                         # canonical build -> dist/standalone/dev
```

## Standards

Agent entrypoint: `AGENTS.md`. Canonical specs:
`../../../sdkwork-specs/APP_PC_ARCHITECTURE_SPEC.md`,
`../../../sdkwork-specs/APP_PC_REACT_UI_SPEC.md`,
`../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
