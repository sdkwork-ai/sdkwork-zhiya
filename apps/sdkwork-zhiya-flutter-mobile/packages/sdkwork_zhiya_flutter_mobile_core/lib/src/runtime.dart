/// Runtime singleton for the Zhiya Flutter surface: one mock client family per
/// session (Phase 1) — Phase 2 swaps it for generated SDK clients behind the
/// same accessors (`FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md` bootstrap rules).
library;

import 'mock_client.dart';

class ZhiyaRuntime {
  ZhiyaRuntime();

  final MockZhiyaClient client = MockZhiyaClient();

  static ZhiyaRuntime instance = ZhiyaRuntime();

  /// Test-only: replace the singleton with a fresh runtime.
  static void resetForTests() {
    instance = ZhiyaRuntime();
  }
}
