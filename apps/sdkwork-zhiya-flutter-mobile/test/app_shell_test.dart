// Widget test: the five-tab shell renders the cross-surface tabs (PRD §5).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_zhiya_flutter_mobile_shell/sdkwork_zhiya_flutter_mobile_shell.dart';

void main() {
  testWidgets('shell_renders_five_cross_surface_tabs', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: ZhiyaShell(
          destinations: const [
            ('首页', Icons.home_outlined, Icons.home),
            ('活动', Icons.event_outlined, Icons.event),
            ('AI', Icons.emoji_nature_outlined, Icons.emoji_nature),
            ('商城', Icons.shopping_bag_outlined, Icons.shopping_bag),
            ('我的', Icons.person_outline, Icons.person),
          ],
          currentIndex: 0,
          onDestinationSelected: (_) {},
          child: const SizedBox(),
        ),
      ),
    );
    await tester.pump();
    for (final label in ['首页', '活动', 'AI', '商城', '我的']) {
      expect(find.text(label), findsWidgets);
    }

    final destinations = tester
        .widgetList<NavigationDestination>(find.byType(NavigationDestination))
        .toList();
    expect(destinations, hasLength(5));
    expect((destinations[0].icon as Icon).icon, Icons.home_outlined);
    expect((destinations[0].selectedIcon as Icon).icon, Icons.home);
    expect((destinations[1].icon as Icon).icon, Icons.event_outlined);
    expect((destinations[1].selectedIcon as Icon).icon, Icons.event);
    expect((destinations[2].icon as Icon).icon, Icons.emoji_nature_outlined);
    expect((destinations[2].selectedIcon as Icon).icon, Icons.emoji_nature);
    expect((destinations[3].icon as Icon).icon, Icons.shopping_bag_outlined);
    expect((destinations[3].selectedIcon as Icon).icon, Icons.shopping_bag);
    expect((destinations[4].icon as Icon).icon, Icons.person_outline);
    expect((destinations[4].selectedIcon as Icon).icon, Icons.person);
  });
}
