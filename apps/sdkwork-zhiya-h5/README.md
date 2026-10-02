# Zhiya H5 Application Root

`apps/sdkwork-zhiya-h5/` — the primary mobile-first H5 surface of Zhiya
(知鸭), an AI-native family education and activity platform (PRD §4/§5).

## Five tabs (PRD §5)

首页 Home ｜ 活动 Activities ｜ AI (问知鸭) ｜ 商城 Mall ｜ 我的 Profile

## Package family

| Package | Role |
| --- | --- |
| `packages/sdkwork-zhiya-h5-core` | Composition seam: runtime env, i18n factory, theme, session, badges, shared-contract shims. |
| `packages/sdkwork-zhiya-h5-commons` | Shared leaf components (cards, ScreenState, Price, VoucherQr) + `useAsyncData` + format utils. |
| `sdkwork-zhiya-h5-shell` | MobileLayout + five-tab TabBar. |
| `sdkwork-zhiya-h5-home` / `-activity` / `-ai` / `-mall` / `-trade` / `-profile` / `-org` | Capability packages: screens/services/state/i18n/routes. |

## Milestone scope

Standalone, mock-backed (services in `@sdkwork/zhiya-service-core`): the
P0 loop (家庭 → 活动发现 → 报名 → 支付 → 核销 → 评价, plus 优惠券/消息/机构工作台)
runs fully on-device. Platform SDK wiring lands with the `cloud` profile.

## Layout

Standard H5 root (`APP_H5_ARCHITECTURE_SPEC.md` §2): thin `src/` (bootstrap +
AuthGate + shell shim), `packages/`, `etc/browser/` runtime sources,
`config/`, `specs/`, `tests/` (executable architecture contracts), root
manifests (`sdkwork.app.config.json`, `vite.config.ts`).

## Local development

```bash
pnpm install            # from the repository root
pnpm dev                # Vite on http://127.0.0.1:3300 (mode standalone.development)
pnpm --filter sdkwork-zhiya-h5 test      # vitest (architecture + route contracts)
pnpm --filter sdkwork-zhiya-h5 typecheck  # tsc --noEmit
pnpm build:h5:dev       # canonical build -> dist/standalone/dev
```

Demo login: any 11-digit phone number + any 6-digit code (mock session).
