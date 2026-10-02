import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 活动 tab (PRD §7/§32): keyword search + category tabs + filtered list.
class ActivityListScreen extends StatefulWidget {
  const ActivityListScreen({super.key});

  @override
  State<ActivityListScreen> createState() => _ActivityListScreenState();
}

class _ActivityListScreenState extends State<ActivityListScreen> {
  String _keyword = '';

  @override
  Widget build(BuildContext context) {
    return _ActivityListView(
      keyword: _keyword,
      onKeywordChanged: (value) => setState(() => _keyword = value),
    );
  }
}

class _ActivityListView extends StatelessWidget {
  const _ActivityListView({required this.keyword, required this.onKeywordChanged});

  final String keyword;
  final ValueChanged<String> onKeywordChanged;

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
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
              child: TextField(
                onChanged: onKeywordChanged,
                onSubmitted: onKeywordChanged,
                decoration: const InputDecoration(
                  hintText: '搜活动、机构',
                  isDense: true,
                  prefixIcon: Icon(Icons.search),
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _ActivityGrid(client: client, category: null, freeOnly: false, keyword: keyword),
                  _ActivityGrid(client: client, category: 'trial', freeOnly: false, keyword: keyword),
                  _ActivityGrid(client: client, category: 'parent-child', freeOnly: false, keyword: keyword),
                  _ActivityGrid(client: client, category: null, freeOnly: true, keyword: keyword),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityGrid extends StatelessWidget {
  const _ActivityGrid({
    required this.client,
    required this.category,
    required this.freeOnly,
    this.keyword,
  });

  final MockZhiyaClient client;
  final String? category;
  final bool freeOnly;
  final String? keyword;

  @override
  Widget build(BuildContext context) {
    final activities =
        client.listActivities(category: category, freeOnly: freeOnly, keyword: keyword);
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
