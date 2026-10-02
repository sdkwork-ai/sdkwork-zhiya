# zhiya Technical Architecture

Status: active
Owner: sdkwork-zhiya team
Updated: 2026-10-02
Specs: ARCHITECTURE_DECISION_SPEC.md, DOCUMENTATION_SPEC.md, APP_H5_ARCHITECTURE_SPEC.md, APP_MOBILE_REACT_UI_SPEC.md, THEME_DARKMODE_SPEC.md, I18N_SPEC.md, TEST_SPEC.md

## Document Map

- Add `TECH-<topic>.md` shards in this directory when the architecture grows beyond one reviewable screen.

## 1. Overview

Zhiya (知鸭) ships one primary client surface for the P0 milestone: a
mobile-first H5 application (`apps/sdkwork-zhiya-h5`) with five bottom tabs —
首页 Home ｜ 活动 Activities ｜ AI ｜ 商城 Mall ｜ 我的 Profile (PRD §5). The
C-end loop (家庭 → 孩子 → 活动发现 → 报名 → 支付 → 签到 → 评价 → 优惠券) plus a
lightweight embedded org (机构) workspace are implemented against mock-backed
services; the platform admin console (平台运营后台) and cloud platform wiring
are later milestones (PRD §44/§50).

Data flow is strictly **UI → hook → service port → injected client**. Screens
never construct clients or HTTP; the app root registers mock client
implementations once at bootstrap.

## 2. Technology Choices

| Concern | Choice | Notes |
| --- | --- | --- |
| Language | TypeScript strict family, `verbatimModuleSyntax`, relative imports end in `.js`. | `TYPESCRIPT_CODE_SPEC.md` |
| UI | React 19 + react-router-dom v7 (`BrowserRouter`, `Routes`, `NavLink`, `Outlet`, `useSearchParams`). | |
| Build | Vite 8; mode = `<deploymentProfile>.<environment>`; `build.outDir = dist/<profile>/<envAlias>/` via `browser-dist-layout.mjs`. | `PNPM_SCRIPT_SPEC.md` §4.2 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), CSS-first theme in `src/index.css`, three-layer tokens (`--sdk-ref-*` → `--sdk-color-*` → `--sdk-comp-*`), `data-sdk-color-mode` + `.dark`, inline anti-flash script. | `THEME_DARKMODE_SPEC.md` v2 |
| State | Zustand for cross-package state (session, tab badges, settings); local `useState` elsewhere. | |
| i18n | i18next + react-i18next; per-package fragments at `src/i18n/<locale>/zhiya/<capability>/*.json`, deep-merged at bootstrap; `zhiya.*` key prefixes; locales zh-CN (default) + en-US. | `I18N_SPEC.md` |
| Tests | Vitest + @testing-library/react; behavior-sentence test names; mock services with injected in-memory storage. | `TEST_SPEC.md` |
| Icons | lucide-react. | |
| Packages | pnpm workspace, `workspace:*` internal deps, `catalog:` third-party pins. | `PNPM_WORKSPACE_DEPENDENCY_SPEC.md` |

## 3. Package Topology

```text
apps/sdkwork-zhiya-common/packages/          (shared cross-surface family, zero UI deps)
  sdkwork-zhiya-route-core     route identity contract + five-tab vocabulary
  sdkwork-zhiya-intent-core    AI natural-language intent recognizer (zh-CN)
  sdkwork-zhiya-service-core   domain model, ports, mock service hub

apps/sdkwork-zhiya-h5/packages/
  sdkwork-zhiya-h5-core        composition seam: runtime env, i18n factory, theme, session, badges, shims
  sdkwork-zhiya-h5-commons     shared leaf components (ScreenState, cards, price, QR) + hooks/format
  sdkwork-zhiya-h5-shell       MobileLayout + five-tab TabBar
  sdkwork-zhiya-h5-home        首页 (tab) + global search
  sdkwork-zhiya-h5-activity    活动列表/详情/报名/支付/报名成功
  sdkwork-zhiya-h5-ai          问知鸭 chat (问答 + 活动搜索 + 推荐 + 体验计划)
  sdkwork-zhiya-h5-mall        商城 browse (goods list/detail, P1 purchase)
  sdkwork-zhiya-h5-trade       订单列表/详情/评价
  sdkwork-zhiya-h5-profile     我的 (家庭/儿童、我的活动、优惠券、收藏、消息、设置)
  sdkwork-zhiya-h5-org         机构工作台 (活动 CRUD、报名管理、核销)
```

Dependency direction (no cycles): `common family` → `h5-core`/`h5-commons` →
`h5-shell` → capability packages → app root `src/`. Cross-package imports go
through package root exports only (`src/index.ts`), never deep `src/` paths.

## 4. Directory Layout

H5 root follows `APP_H5_ARCHITECTURE_SPEC.md` §2: thin root `src/`
(`main.tsx`, `App.tsx`, `AuthGate.tsx`, `index.css`, `bootstrap/`, `shell/`
shim), `packages/`, `etc/browser/` runtime-env sources, `config/browser|host`,
`specs/`, `tests/` (executable architecture contracts).

Route ids follow `app.zhiya.<capability>.<screen>`; tab roots: `/home`,
`/activity`, `/ai`, `/mall`, `/profile`. The route table is composed from
capability contributions in `src/bootstrap/routes.ts` and validated by
`route-core` at runtime plus a route-alignment test.

## 5. Service & Mock Policy (Phase 1)

No HTTP contracts are owned in this milestone. `service-core` defines typed
ports (`family`, `activity`, `package`, `mall`, `order`, `coupon`, `review`,
`checkin`, `message`, `ai`, `org`) and one mock service hub over in-memory
seed data + localStorage-persisted user state (family/children, orders,
coupons, reviews, favorites, messages, org-created activities). Clients take
injectable `storage`/`now` so tests run fully deterministic. Phase 2 replaces
the hub with generated platform SDK clients behind identical ports.

Registration business rules (PRD §9.2) live in the order client: age fit,
quota, duplicate registration, time conflict, enrollment window. Order status
derivation follows PRD §29/§11 (待支付/待参加/进行中/待评价/已完成/已取消/已退款;
核销状态 待核销/已签到/已完成/已过期/已取消).

## 6. Security & Privacy

No secrets in source or `etc/`; the standalone milestone stores only mock
session state in localStorage. Child data (PRD §15) stays on-device; the AI
assistant reads only locally authorized family data. Tokens/IAM integration is
a Phase 2 seam (`AuthGate` + session store shape are the contract).

## 7. Deployment

Single deployable surface `apps/sdkwork-zhiya-h5`, deployment profile
`standalone` × {development, test, staging, production} (`specs/topology.spec.json`).
Build via the canonical browser build runner (`build-browser-client.mjs`) which
materializes `public/runtime-env.json` from `etc/browser/` and emits
`dist/<profile>/<envAlias>/`. Dev server: port 3300, mode
`standalone.development`.

## 8. Verification

```bash
pnpm install
pnpm typecheck        # tsc --noEmit across all packages
pnpm test             # vitest across all packages
pnpm build:h5:dev     # canonical browser build -> dist/standalone/dev
pnpm check            # + sdkwork-specs standards audits
```

Architecture contracts are executable: `tests/h5-architecture.test.ts` (root
layout, package naming, strict tsconfig, build contract, theme contract) and
`tests/route-alignment.test.ts` (route table ↔ elements sync) run as part of
`pnpm test`.
