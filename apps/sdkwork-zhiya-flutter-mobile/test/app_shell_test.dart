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
            ('首页', Icons.home),
            ('活动', Icons.event),
            ('AI', Icons.emoji_nature),
            ('商城', Icons.shopping_bag),
            ('我的', Icons.person),
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
  });
}
