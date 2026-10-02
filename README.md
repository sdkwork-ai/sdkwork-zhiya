# Zhiya｜知鸭

repository-kind: application

AI 时代的家庭教育与活动服务平台。品牌主张：**知孩子，也知教育。** 连接家庭、
孩子、教育机构、课程、活动与教育消费的 AI 原生平台（PRD §1）。

## Scope

This repository owns the `zhiya` bounded context: the Zhiya family-education
activity platform product surface — family/child profiles, activity discovery
(list/detail/search), the registration → payment → check-in → review loop,
coupons, unified orders, the message center, the 问知鸭 AI assistant
(Q&A + activity search + recommendations + experience plans), a browse-only
mall, and an embedded org (机构) workspace for activity CRUD, registration
management, and voucher check-in.

Out of scope for the current milestone: IAM/identity services, real payment
acquiring, IM transport, LLM inference gateways, the standalone platform admin
console, and experience-package benefit settlement. The current milestone is
the standalone H5 surface with mock-backed services behind typed ports;
platform wiring lands with the `cloud` profile in the next phase.

## Application Identity

- Application code: `zhiya`
- Repository: `sdkwork-zhiya`
- Primary surface: `apps/sdkwork-zhiya-h5/` (mobile-first H5)
- Bottom navigation: 首页 (Home) ｜ 活动 (Activities) ｜ AI ｜ 商城 (Mall) ｜ 我的 (Profile)

## Standard Layout

| Directory | Purpose |
| --- | --- |
| `apps/` | Application roots: `sdkwork-zhiya-common` (shared contracts/ports/service hub), `sdkwork-zhiya-h5` (primary mobile-first H5, including the embedded org workspace). |
| `apis/` | API contracts (reserved; inactive). |
| `sdks/` | SDK families (reserved; inactive). |
| `crates/` | Generated API assembly scaffold (reserved; inactive). |
| `etc/` | Deployable-root source config index. |
| `deployments/` | Deployment descriptors (reserved; inactive). |
| `scripts/` | Thin command entrypoints. |
| `docs/` | Canon documentation. |
| `tests/` | Cross-package verification (reserved; inactive). |
| `specs/` | Repository machine contracts. |
| `bin/` | Operator entrypoints (reserved; inactive). |
| `examples/` | Examples (reserved; inactive). |
| `tools/` | Repository-local tooling (reserved; inactive). |
| `plugins/` | Application plugins (reserved; inactive). |

Intentionally absent standard directories: `database/` (no owned persistence —
mock services persist user state to localStorage), `jobs/` (no owned scheduled
jobs yet), `generated/` (no generated composition output yet). These become
fully owned when the corresponding capability is introduced.

## Canonical Names

- Domain: `zhiya`
- H5 app root: `apps/sdkwork-zhiya-h5/`
- H5 packages: `sdkwork-zhiya-h5-core`, `sdkwork-zhiya-h5-commons`, `sdkwork-zhiya-h5-shell`, `sdkwork-zhiya-h5-<capability>`
- Shared (cross-surface): `sdkwork-zhiya-route-core`, `sdkwork-zhiya-intent-core`, `sdkwork-zhiya-service-core` under `apps/sdkwork-zhiya-common/packages/`

## Documentation Canon

- [docs/README.md](docs/README.md) — documentation index
- [docs/product/prd/PRD.md](docs/product/prd/PRD.md) — product Canon entry
- [docs/architecture/tech/TECH_ARCHITECTURE.md](docs/architecture/tech/TECH_ARCHITECTURE.md) — technical architecture Canon entry

## Application Roots

See [apps/README.md](apps/README.md) for the governed application root index.

## Standards

Behavior follows the global standards at [../sdkwork-specs/README.md](../sdkwork-specs/README.md).
Agent execution starts at [AGENTS.md](AGENTS.md). Key specs: `SDKWORK_WORKSPACE_SPEC.md`,
`REPOSITORY_BASELINE_SPEC.md`, `APP_H5_ARCHITECTURE_SPEC.md`, `APP_MOBILE_REACT_UI_SPEC.md`,
`COMPONENT_SPEC.md`, `PNPM_SCRIPT_SPEC.md`, `PNPM_WORKSPACE_DEPENDENCY_SPEC.md`,
`THEME_DARKMODE_SPEC.md`, `I18N_SPEC.md`, `TEST_SPEC.md`.

## Local Development

```bash
pnpm install
pnpm dev            # standalone development (delegates to dev:standalone, port 3300)
pnpm test           # vitest
pnpm typecheck      # tsc --noEmit across packages
pnpm build:h5:dev   # browser build -> dist/standalone/dev
```
