# etc/ — H5 App-Root Source Configuration

Deployable-root source configuration for `sdkwork-zhiya-h5`
(`SOURCE_CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md` §5.1).

| Path | Purpose |
| --- | --- |
| `sdkwork.deployment.config.json` | Component deployment index (`kind: sdkwork.component-deployment`); maps profiles to browser runtime sources and materialization output. |
| `browser/runtime-env.<deploymentProfile>.<environment>.json` | One identity document per supported profile (standalone × development/test/staging/production), materialized to `public/runtime-env.json` at build time by the canonical build runner. |

No secrets live here; identity only (`environment`, `deploymentProfile`,
`profileId`, `runtimeTarget`, `browserOriginMode`, base URLs).

Verification: `node ../../../sdkwork-specs/tools/check-source-config-standard.mjs --root . --enforce-profile-identity`
