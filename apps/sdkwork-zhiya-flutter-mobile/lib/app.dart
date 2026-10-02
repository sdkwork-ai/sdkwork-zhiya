import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_activity/sdkwork_zhiya_flutter_mobile_activity.dart';
import 'package:sdkwork_zhiya_flutter_mobile_ai/sdkwork_zhiya_flutter_mobile_ai.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';
import 'package:sdkwork_zhiya_flutter_mobile_home/sdkwork_zhiya_flutter_mobile_home.dart';
import 'package:sdkwork_zhiya_flutter_mobile_mall/sdkwork_zhiya_flutter_mobile_mall.dart';
import 'package:sdkwork_zhiya_flutter_mobile_profile/sdkwork_zhiya_flutter_mobile_profile.dart';
import 'package:sdkwork_zhiya_flutter_mobile_shell/sdkwork_zhiya_flutter_mobile_shell.dart';

import 'auth_gate.dart';
import 'bootstrap/routes.dart';

/// Root application widget (PRD §5): five bottom tabs, 首页 first. Detail
/// routes are composed in `bootstrap/routes.dart` — single route owner.
class ZhiyaApp extends StatefulWidget {
  const ZhiyaApp({super.key});

  @override
  State<ZhiyaApp> createState() => _ZhiyaAppState();
}

class _ZhiyaAppState extends State<ZhiyaApp> {
  int _currentIndex = 0;

  static const List<(String, IconData)> _destinations = [
    ('首页', Icons.home),
    ('活动', Icons.event),
    ('AI', Icons.emoji_nature),
    ('商城', Icons.shopping_bag),
    ('我的', Icons.person),
  ];

  static const Map<String, WidgetBuilder> _tabBuilders = {
    'app.zhiya.home.root': _buildHome,
    'app.zhiya.activity.root': _buildActivity,
    'app.zhiya.ai.root': _buildAi,
    'app.zhiya.mall.root': _buildMall,
    'app.zhiya.profile.root': _buildProfile,
  };

  static Widget _buildHome(BuildContext context) => const HomeScreen();
  static Widget _buildActivity(BuildContext context) => const ActivityListScreen();
  static Widget _buildAi(BuildContext context) => const AiScreen();
  static Widget _buildMall(BuildContext context) => const MallScreen();
  static Widget _buildProfile(BuildContext context) => const ProfileScreen();

  Route<dynamic>? _onGenerateRoute(RouteSettings settings) {
    final builder = zhiyaDetailRoutes()[settings.name];
    if (builder == null) {
      return null;
    }
    return MaterialPageRoute<void>(settings: settings, builder: builder);
  }

  @override
  Widget build(BuildContext context) {
    return AuthGate(
      child: MaterialApp(
        title: '知鸭 Zhiya',
        theme: ThemeData(colorSchemeSeed: const Color(0xFFD97706), useMaterial3: true),
        onGenerateRoute: _onGenerateRoute,
        home: ZhiyaShell(
          destinations: _destinations,
          currentIndex: _currentIndex,
          onDestinationSelected: (index) => setState(() => _currentIndex = index),
          child: IndexedStack(
            index: _currentIndex,
            children: [
              for (final route in kTabRootRoutes) _tabBuilders[route.id]!(context),
            ],
          ),
        ),
      ),
    );
  }
}
