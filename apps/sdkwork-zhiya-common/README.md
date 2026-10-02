# sdkwork-zhiya-common

repository-kind: shared-package-family

Shared cross-surface family for `sdkwork-zhiya`: contracts and services with
zero UI dependencies. Client surfaces re-export these through their `h5-core`
seam; they never import each other's UI.

| Package | npm name | Purpose |
| --- | --- | --- |
| `packages/sdkwork-zhiya-route-core` | `@sdkwork/zhiya-route-core` | Route identity contract (`app.zhiya.<capability>.<screen>`), five-tab vocabulary, composition validation. |
| `packages/sdkwork-zhiya-intent-core` | `@sdkwork/zhiya-intent-core` | Rule-based natural-language intent recognizer for activity search (PRD §14/§32): age, category, budget, time, free/paid. |
| `packages/sdkwork-zhiya-service-core` | `@sdkwork/zhiya-service-core` | Zhiya domain model, SDK ports, client registry, and the mock service hub (family/children, activities, packages, mall, orders, coupons, reviews, check-in, messages, AI, org). |

Shared logic flows only through this family (`apps/README.md`). Packages are
source-only (`main`/`exports` → `./src/index.ts`); no build step.

Verification: `pnpm --filter "@sdkwork/zhiya-*" typecheck && pnpm --filter "@sdkwork/zhiya-*" test`
