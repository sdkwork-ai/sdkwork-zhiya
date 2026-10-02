import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';
import 'package:sdkwork_zhiya_flutter_mobile_shell/sdkwork_zhiya_flutter_mobile_shell.dart';

/// Session gate (PRD §3.1 P0 登录): renders the mock sign-in screen until a
/// session exists. The standalone milestone authenticates against the mock
/// auth store (phone + code, any code passes); Phase 2 replaces the body with
/// the IAM login integration — the gate stays.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key, required this.child});

  final Widget child;

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  Widget build(BuildContext context) {
    final signedIn = ZhiyaAuthStore.instance.isSignedIn;
    if (!signedIn) {
      return MaterialApp(
        title: '知鸭 Zhiya',
        theme: ThemeData(colorSchemeSeed: const Color(0xFFD97706), useMaterial3: true),
        home: LoginScreen(onSignedIn: () => setState(() {})),
      );
    }
    return widget.child;
  }
}
