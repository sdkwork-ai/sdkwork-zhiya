/// Typed platform adapter ports (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC):
/// feature code never touches plugin classes or method channels directly —
/// implementations register here and features consume the interfaces.
library;

import 'package:flutter/services.dart';

/// Clipboard capability shared by voucher-code copy actions.
abstract interface class ClipboardPort {
  Future<void> copy(String text);
}

class SystemClipboardPort implements ClipboardPort {
  const SystemClipboardPort();

  @override
  Future<void> copy(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
  }
}

/// Share capability; the Phase-1 milestone ships a no-op implementation.
abstract interface class SharePort {
  Future<void> share(String title, String text);
}

class NoopSharePort implements SharePort {
  const NoopSharePort();

  @override
  Future<void> share(String title, String text) async {}
}

/// Adapter registry bound once in `bootstrap/runtime.dart`.
class HostAdapters {
  HostAdapters({ClipboardPort? clipboard, SharePort? share})
      : clipboard = clipboard ?? const SystemClipboardPort(),
        share = share ?? const NoopSharePort();

  final ClipboardPort clipboard;
  final SharePort share;

  static HostAdapters instance = HostAdapters();
}
