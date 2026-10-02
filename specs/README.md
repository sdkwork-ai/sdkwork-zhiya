# specs/ — Repository Machine Contracts

Machine-readable contracts for `sdkwork-zhiya`
(`COMPONENT_SPEC.md`, `SDKWORK_DEPLOY_SPEC.md`, `ENVIRONMENT_SPEC.md`).

| File | Kind | Purpose |
| --- | --- | --- |
| `component.spec.json` | `sdkwork.component.spec` | Workspace component manifest (runtime-composition layer role). |
| `domain.yaml` | domain declaration | Bounded context, capabilities, naming namespaces for `zhiya`. |
| `topology.spec.json` | `sdkwork.app.topology` | Deployment profile vocabulary, profile files, dev orchestration. |

Application roots and authored packages own their own `specs/component.spec.json`
(see `apps/sdkwork-zhiya-common/specs/` and `apps/sdkwork-zhiya-h5/specs/`).

Verification: `node ../sdkwork-specs/tools/check-component-port-bindings.mjs --root .`
