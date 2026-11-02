import 'package:flutter/material.dart';

/// Phone-first bottom navigation shell (PRD §5): 首页 | 活动 | AI | 商城 |
/// 我的. Detail screens push on top via named routes.
class ZhiyaShell extends StatelessWidget {
  const ZhiyaShell({
    super.key,
    required this.destinations,
    required this.currentIndex,
    required this.onDestinationSelected,
    required this.child,
  });

  /// One entry per tab root: (label, outline icon, filled icon). The filled
  /// glyph marks the selected destination and the outline glyph the rest
  /// (tab icon-state norm in ICON_SPEC.md section 3.2).
  final List<(String, IconData, IconData)> destinations;
  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: onDestinationSelected,
        destinations: [
          for (final (label, icon, selectedIcon) in destinations)
            NavigationDestination(
              icon: Icon(icon),
              selectedIcon: Icon(selectedIcon),
              label: label,
            ),
        ],
      ),
    );
  }
}
