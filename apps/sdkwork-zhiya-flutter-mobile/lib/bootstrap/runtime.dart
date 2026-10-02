/// One-time app bootstrap (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC): environment
/// identity, host adapters, and the mock client family. Phase 2 swaps the
/// client family for generated SDK clients at this single seam.
library;

import 'environment.dart';
import 'host_adapters.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

class ZhiyaBootstrap {
  ZhiyaBootstrap._();

  static ZhiyaRuntimeEnvironment environment = ZhiyaRuntimeEnvironment.fallback;

  static void bootstrap() {
    environment = ZhiyaRuntimeEnvironment.fromDefines();
    HostAdapters.instance = HostAdapters();
    ZhiyaRuntime.instance = ZhiyaRuntime();
  }

  /// Mock session: the demo family is signed in immediately (PRD §3.1 P0
  /// 登录 lands with IAM in Phase 2). Family/children state lives in the
  /// client, so 「ensureSession」 also seeds nothing — registration prompts
  /// the parent to add a child first.
  static void ensureSession() {}
}
