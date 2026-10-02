# specs/ — H5 App-Root Machine Contracts

| File | Kind | Purpose |
| --- | --- | --- |
| `component.spec.json` | `sdkwork.component.spec` | H5 app-root component manifest (`h5-app-root`, runtime-composition layer role, full route manifest). |

Capability packages own their own `specs/component.spec.json` under
`packages/sdkwork-zhiya-h5-*/specs/`.

Verification: `node ../../../sdkwork-specs/tools/check-component-port-bindings.mjs --root .`
