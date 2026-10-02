# tests/ (PC app root)

Cross-package verification for the PC surface (`TEST_SPEC.md` §2.4.2).

| Test | Contract |
| --- | --- |
| `pc-architecture.test.ts` | Executable APP_PC_ARCHITECTURE_SPEC: required dirs, thin root `src/`, package naming, strict tsconfig, profile build contract, theme contract, secret-free runtime env. |
| `route-alignment.test.ts` | Route table ↔ lazy element map sync, five-tab contract, cross-surface route id alignment. |

Per-package unit tests live in each package's own `tests/`.
Run: `pnpm --filter sdkwork-zhiya-pc test`
