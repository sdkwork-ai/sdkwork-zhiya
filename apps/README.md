# Applications

Governed directory index for application roots of `sdkwork-zhiya`
(`SDKWORK_WORKSPACE_SPEC.md`, `APPLICATION_SPEC.md`). The repository root is
not an app surface.

| Application root | Surface role | Runnable | Purpose | README |
| --- | --- | --- | --- | --- |
| `sdkwork-zhiya-common/` | shared-package-family | no | Cross-surface contracts and services: route identity, AI intent recognition, domain model, SDK ports, mock service hub. | [README](sdkwork-zhiya-common/README.md) |
| `sdkwork-zhiya-h5/` | primary-h5 (mobile-first) | yes | Primary C-end surface: 首页 / 活动 / AI / 商城 / 我的 five-tab app with the registration → payment → check-in → review loop, plus the embedded org (机构) workspace. | [README](sdkwork-zhiya-h5/README.md) |

Shared logic flows only through `sdkwork-zhiya-common`; application roots must
not import each other's UI or internals. New application roots (PC console,
mini-program, platform admin) are registered here when introduced.

Verification: `node ../sdkwork-specs/tools/check-apps-directory-index.mjs --root .`
