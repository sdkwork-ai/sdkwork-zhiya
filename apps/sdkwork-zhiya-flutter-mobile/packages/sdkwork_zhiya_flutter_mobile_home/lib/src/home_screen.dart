import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 首页 tab (PRD §6/§45): AI entry banner, 附近热门活动, 热门体验包.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final client = ZhiyaRuntime.instance.client;
    return Scaffold(
      appBar: AppBar(title: const Text('知鸭')),
      body: FutureBuilder<List<ZhiyaActivity>>(
        future: Future.value(client.listHomeRecommendations()),
        builder: (context, snapshot) {
          final state = snapshot.hasData ? 'success' : (snapshot.hasError ? 'error' : 'loading');
          final activities = snapshot.data ?? const <ZhiyaActivity>[];
          return ScreenStateView(
            state: state,
            child: ListView(
              children: [
                Card(
                  margin: const EdgeInsets.all(12),
                  color: Theme.of(context).colorScheme.primaryContainer,
                  child: ListTile(
                    leading: const Text('🦆', style: TextStyle(fontSize: 28)),
                    title: const Text('问问知鸭', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('孩子适合体验什么？让我来帮你'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => DefaultTabController.maybeOf(context) == null
                        ? null
                        : null,
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Text('附近热门活动', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
                ),
                for (final activity in activities.take(6))
                  ZhiyaTile(
                    emoji: activity.emoji,
                    title: activity.title,
                    subtitle:
                        '${activity.orgName} · ${kCategoryLabels[activity.category] ?? activity.category}\n${formatStart(activity.startTime)} · ${quotaLabel(activity.quota, activity.enrolled)}',
                    trailing: formatPrice(activity.price),
                    onTap: () => Navigator.of(context)
                        .pushNamed('app.zhiya.activity.detail', arguments: {'activityId': activity.id}),
                  ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Text('热门体验包', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
                ),
                for (final pkg in client.listHotPackages())
                  ZhiyaTile(
                    emoji: pkg.emoji,
                    title: pkg.title,
                    subtitle: '含${pkg.activityIds.length}个活动 · ${pkg.purchasedCount}人已购买',
                    trailing: formatPrice(pkg.price),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
