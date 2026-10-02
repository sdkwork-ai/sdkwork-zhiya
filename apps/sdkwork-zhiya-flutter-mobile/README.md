# Zhiya Flutter Mobile (知鸭)

Flutter mobile client (iOS/Android) of Zhiya (知鸭), the AI-native family
education and activity platform. Five bottom tabs map 1:1 to the cross-surface
tabs (首页 Home ｜ 活动 Activities ｜ AI 问知鸭 ｜ 商城 Mall ｜ 我的 Profile);
the Dart domain model mirrors the shared TS service contracts and is pinned by
the route-alignment and order-flow tests.

## Layout

- `lib/` — thin: `main.dart` → `bootstrap/runtime.dart` (environment, host
  adapters, mock client family) → `app.dart` (five-tab shell + detail routes).
- `packages/sdkwork_zhiya_flutter_mobile_*` — snake_case Dart packages: core
  (route table / domain / intent / mock runtime), commons, shell, and one
  capability package per tab (`-home`, `-activity`, `-ai`, `-mall`,
  `-trade`, `-profile`). The org workspace lives on PC/H5.
- `env/` — dart-define identity files per deployment profile; `etc/` — the
  deployment index.
- `test/` — route alignment, intent recognizer, order flow (PRD §9 checks),
  and shell widget tests.

## Commands

```bash
flutter pub get
flutter analyze   # no issues found
flutter test      # route/intent/order-flow/shell suites
```

Release (packaging milestone): `flutter build apk` / `flutter build appbundle`
/ `flutter build ipa` with `--dart-define-from-file env/sdkwork.<profileId>.json`.

## Standards

Agent entrypoint: `AGENTS.md`. Canonical specs:
`FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md`, `APP_FLUTTER_UI_SPEC.md`,
`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`, `DART_CODE_SPEC.md`.
