/// SDK client composition (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC): Phase 1
/// exposes the mock family; Phase 2 swaps individual clients for generated
/// app SDK clients behind identical accessors.
library;

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

class ZhiyaSdkClients {
  const ZhiyaSdkClients(this.client);

  final MockZhiyaClient client;

  static ZhiyaSdkClients mock() => ZhiyaSdkClients(ZhiyaRuntime.instance.client);
}
