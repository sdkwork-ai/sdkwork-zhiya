# Zhiya PC Admin Platform

`@sdkwork/zhiya-pc-admin-platform` — the platform admin capability
(PRD §25 平台后台, P0): platform KPI dashboard, org governance
(suspend/restore), and activity governance (take offline/republish). This is
a PC-surface-specific workflow; its routes (`app.zhiya.admin.*`) are a
documented PC superset of the common cross-surface route set.

Layer role: `frontend-feature` (admin family per
`APP_PC_ARCHITECTURE_SPEC.md` / `PERMISSION_STANDARD_SPEC.md`).

Verification: `pnpm --filter @sdkwork/zhiya-pc-admin-platform typecheck && pnpm --filter @sdkwork/zhiya-pc-admin-platform test`
