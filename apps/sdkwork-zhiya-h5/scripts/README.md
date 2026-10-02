# scripts/ — App-Root Scripts

Thin entrypoints owned by the `sdkwork-zhiya-h5` app root. The canonical
lifecycle commands delegate to the repository dispatcher
(`scripts/sdkwork-command.mjs` at the repo root, `PNPM_SCRIPT_SPEC.md` §9);
browser builds delegate to `../../../sdkwork-specs/tools/build-browser-client.mjs`
via the `build:<environment>` scripts in `package.json`. No app-root-local
scripts yet.
