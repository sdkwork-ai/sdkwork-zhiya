# UI Architecture Manifest (summary)

Authority: `../../../sdkwork-specs/UI_ARCHITECTURE_SPEC.md`.

| Field | Value |
| --- | --- |
| Application | `sdkwork-zhiya-h5` (domain `zhiya`, surface `app`) |
| Primary architecture | Mobile-first H5 (`APP_H5_ARCHITECTURE_SPEC.md`), React 19 + Vite 8 + Tailwind v4 |
| Navigation | Five bottom tabs: 首页 `/home` · 活动 `/activity` · AI `/ai` · 商城 `/mall` · 我的 `/profile` (PRD §5) |
| Route ids | `app.zhiya.<capability>.<screen>` (composed in `src/bootstrap/routes.ts`) |
| State | Zustand for cross-package (session/badges/settings); local state elsewhere |
| Theming | Single Tailwind bootstrap in `src/index.css`; `data-sdk-color-mode` + `.dark`; semantic tokens (`--sdk-color-*`) |
| i18n | i18next, per-package fragments, locales zh-CN (default) + en-US, key prefix `zhiya.*` |
| Services | Ports + registry in `@sdkwork/zhiya-service-core`; mock hub registered once in `src/bootstrap/sdkClients.ts` |
| Surfaces planned | PC console / mini-program / platform admin console are future application roots, not part of this root |
