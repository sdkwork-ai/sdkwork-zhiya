# etc/ — Mini-Program Source Configuration

`SOURCE_CONFIG_SPEC.md` source configuration index for
`sdkwork-zhiya-mini-program`: `sdkwork.deployment.config.json` maps each
standalone profile to its `config/mini-program/runtime-env.<profileId>.json`
identity source, consumed by `scripts/build-runtime.mjs` at bundle time. No
secrets; identity only.
