# etc/ — PC App-Root Source Configuration

Deployable-root source configuration for `sdkwork-zhiya-pc`
(`SOURCE_CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md` §5.1). Browser runtime-env
sources live at `etc/browser/runtime-env.<deploymentProfile>.<environment>.json`
and are materialized to `public/runtime-env.json` per build by the canonical
build runner. No secrets; identity only.

Verification: `node ../../../sdkwork-specs/tools/check-source-config-standard.mjs --root . --enforce-profile-identity`
