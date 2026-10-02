# etc/ — Deployable-Root Source Configuration Index

Source configuration index for `sdkwork-zhiya`
(`SOURCE_CONFIG_SPEC.md`, `APPLICATION_DEPLOY_LAYOUT_SPEC.md`).

## Contents

| Path | Purpose |
| --- | --- |
| `sdkwork.deployment.config.json` | Deployment profile index (references, no values). |
| `topology/<deploymentProfile>.<environment>.env` | Per-profile identity: `SDKWORK_*` + app-scoped `SDKWORK_ZHIYA_*` keys. |

The independently deployable surface is the H5 app root; it owns its own
browser runtime sources at `apps/sdkwork-zhiya-h5/etc/`
(`kind: sdkwork.component-deployment`), which materialize
`public/runtime-env.json` per build.

## Supported profile matrix

`standalone` × {development, test, staging, production}
(declared in `../specs/topology.spec.json`; `cloud` is intentionally absent —
the standalone milestone has no platform wiring yet).

## Rules

- Committed `etc/` files carry no secrets — paths and placeholders only.
  Local overrides live in ignored `etc/**/*.local.*` files and `etc/secrets/`.
- Schema authority: `../sdkwork-specs/schemas/sdkwork.deploy.schema.v2.json`.
- Validation: `node ../sdkwork-specs/tools/check-source-config-standard.mjs --root apps/sdkwork-zhiya-h5 --enforce-profile-identity`
