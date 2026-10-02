import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 活动 tab (PRD §7): category chips + filtered activity list.
class ActivityListScreen extends StatelessWidget {
  const ActivityListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final client = ZhiyaRuntime.instance.client;
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('活动'),
          bottom: TabBar(
            isScrollable: true,
            tabs: const [
              Tab(text: '全部'),
              Tab(text: '体验课'),
              Tab(text: '亲子活动'),
              Tab(text: '免费'),
            ],
            onTap: (_) {},
          ),
        ),
        body: TabBarView(
          children: [
            _ActivityGrid(client: client, category: null, freeOnly: false),
            _ActivityGrid(client: client, category: 'trial', freeOnly: false),
            _ActivityGrid(client: client, category: 'parent-child', freeOnly: false),
            _ActivityGrid(client: client, category: null, freeOnly: true),
          ],
        ),
      ),
    );
  }
}

class _ActivityGrid extends StatelessWidget {
  const _ActivityGrid({required this.client, required this.category, required this.freeOnly});

  final MockZhiyaClient client;
  final String? category;
  final bool freeOnly;

  @override
  Widget build(BuildContext context) {
    final activities = client.listActivities(category: category, freeOnly: freeOnly);
    if (activities.isEmpty) {
      return const ScreenStateView(state: 'empty', child: SizedBox());
    }
    return ListView(
      children: [
        for (final activity in activities)
          ZhiyaTile(
            emoji: activity.emoji,
            title: activity.title,
            subtitle:
                '${activity.orgName} · ${kCategoryLabels[activity.category] ?? activity.category}\n${formatStart(activity.startTime)} · ${quotaLabel(activity.quota, activity.enrolled)}',
            trailing: formatPrice(activity.price),
            onTap: () => Navigator.of(context)
                .pushNamed('app.zhiya.activity.detail', arguments: {'activityId': activity.id}),
          ),
      ],
    );
  }
}
