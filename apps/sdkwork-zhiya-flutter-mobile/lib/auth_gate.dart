import 'package:flutter/material.dart';

import 'bootstrap/runtime.dart';

/// Session gate (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC bootstrap): the mock
/// milestone signs in the demo family immediately; Phase 2 replaces the body
/// with the IAM login flow — the gate stays.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    ZhiyaBootstrap.ensureSession();
    return child;
  }
}
