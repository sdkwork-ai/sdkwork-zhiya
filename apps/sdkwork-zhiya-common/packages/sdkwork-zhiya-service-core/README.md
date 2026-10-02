# @sdkwork/zhiya-service-core

Zhiya domain model (PRD §39–§42), SDK ports, client registry, and the mock
service hub for the standalone milestone. `createZhiyaServiceHub(options)`
builds all eleven port implementations (family/activity/package/mall/order/
coupon/review/checkin/message/ai/org) over one shared state with injectable
`storage`/`now`, so apps persist to localStorage while tests run
deterministically with `storage: null`.

Business rules implemented here (not in UI): PRD §9.2 registration checks
(age fit, quota, duplicate, time conflict), PRD §29 order status derivation,
PRD §11 check-in lifecycle, PRD §17 coupon scopes/thresholds.

Verification: `pnpm --filter @sdkwork/zhiya-service-core test`
