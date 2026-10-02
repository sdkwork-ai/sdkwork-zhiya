# Zhiya MP Core

`@sdkwork/sdkwork-zhiya-mp-core` — Typed host-adapter boundary (`MiniProgramHostPort`), runtime-config binding, and the one-time mock client bootstrap. The only package allowed to know about `wx.*` consumers — implementations stay in `src/bootstrap/runtime.ts`.

Layer role: `frontend-core` (COMPONENT_SPEC.md / MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md §3).
