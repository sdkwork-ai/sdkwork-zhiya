# @sdkwork/zhiya-route-core

Cross-surface route identity contract for `sdkwork-zhiya`
(APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md).

- Route ids: `app.zhiya.<capability>.<screen>`; title keys: `zhiya.<capability>.<screen>.title`.
- Five-tab vocabulary (PRD §5): 首页 home | 活动 activity | AI | 商城 mall | 我的 profile.
- `composeZhiyaRouteTable` fails fast on contract violations; the H5 app root
  composes once at bootstrap and the route-alignment test re-asserts it.

Verification: `pnpm --filter @sdkwork/zhiya-route-core test`
