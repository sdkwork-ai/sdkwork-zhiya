/// Shared leaf widgets for the Zhiya Flutter surface (APP_FLUTTER_UI_SPEC):
/// the mandatory screen states rendered as one reusable container.
library;

import 'package:flutter/material.dart';

/// The mandatory UI states (FRONTEND_CODE_SPEC §11) as a Flutter container.
class ScreenStateView extends StatelessWidget {
  const ScreenStateView({
    super.key,
    required this.state,
    required this.child,
    this.onRetry,
  });

  /// `loading | empty | error | success`.
  final String state;
  final Widget child;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    switch (state) {
      case 'success':
        return child;
      case 'loading':
        return const Center(child: CircularProgressIndicator());
      case 'error':
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('出错了，请重试'),
              if (onRetry != null)
                TextButton(onPressed: onRetry, child: const Text('重试')),
            ],
          ),
        );
      default:
        return const Center(child: Text('这里还空空如也 🦆'));
    }
  }
}

/// Card-like list tile used across screens.
class ZhiyaTile extends StatelessWidget {
  const ZhiyaTile({
    super.key,
    required this.emoji,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.onTap,
  });

  final String emoji;
  final String title;
  final String subtitle;
  final String? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListTile(
        onTap: onTap,
        leading: Text(emoji, style: const TextStyle(fontSize: 26)),
        title: Text(title, maxLines: 2, overflow: TextOverflow.ellipsis),
        subtitle: Text(subtitle, maxLines: 2, overflow: TextOverflow.ellipsis),
        trailing: trailing == null ? null : Text(trailing!, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w600)),
      ),
    );
  }
}
