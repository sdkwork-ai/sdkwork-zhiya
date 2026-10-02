# tests/ (app root)

Cross-package verification for the H5 surface (`TEST_SPEC.md` §2.4.2).
Per-package unit tests live in each package's own `tests/`.

| Test | Contract |
| --- | --- |
| `h5-architecture.test.ts` | Executable APP_H5_ARCHITECTURE_SPEC §2: required dirs, thin root `src/`, package naming, strict tsconfig, profile build contract, theme contract, secret-free runtime env. |
| `route-alignment.test.ts` | Route table ↔ lazy element map sync, five-tab contract, id/capability format. |
| `ui-states.test.tsx` | Mandatory five UI states, activity card content contract (PRD §7.3), HomeScreen smoke render. |
| `setup/test-runtime.ts` | Shared boot: merged i18n + fresh mock hub clients with in-memory storage. |

Run: `pnpm --filter sdkwork-zhiya-h5 test`
