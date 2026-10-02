import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 登录 (PRD §3.1 P0): mock 手机号+验证码登录（Phase 2 换 IAM）。
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.onSignedIn});

  final VoidCallback onSignedIn;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phone = TextEditingController();
  final TextEditingController _code = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _phone.dispose();
    _code.dispose();
    super.dispose();
  }

  void _submit() {
    final phone = _phone.text.trim();
    final code = _code.text.trim();
    if (!RegExp(r'^1\d{10}$').hasMatch(phone)) {
      setState(() => _error = '请输入正确的 11 位手机号');
      return;
    }
    if (!RegExp(r'^\d{4,6}$').hasMatch(code)) {
      setState(() => _error = '请输入 6 位验证码');
      return;
    }
    setState(() => _error = null);
    ZhiyaAuthStore.instance.signIn(phone: phone, code: code);
    widget.onSignedIn();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('🦆', style: TextStyle(fontSize: 64)),
              const SizedBox(height: 8),
              const Text('登录知鸭', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600)),
              const Text('知孩子，也知教育', style: TextStyle(color: Color(0xFF71717A))),
              const SizedBox(height: 32),
              TextField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                maxLength: 11,
                decoration: const InputDecoration(labelText: '手机号', counterText: '', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _code,
                keyboardType: TextInputType.number,
                maxLength: 6,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: '验证码',
                  counterText: '',
                  border: OutlineInputBorder(),
                ),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12)),
                ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton(onPressed: _submit, child: const Text('登录 / 注册')),
              ),
              const SizedBox(height: 8),
              const Text(
                '演示环境：输入任意手机号 + 任意 6 位验证码即可登录',
                style: TextStyle(fontSize: 11, color: Color(0xFFA1A1AA)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
