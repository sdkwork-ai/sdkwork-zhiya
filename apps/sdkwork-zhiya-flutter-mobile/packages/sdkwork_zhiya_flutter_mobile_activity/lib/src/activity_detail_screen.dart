import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 活动详情 (PRD §8): info, content, org, reviews, register CTA.
class ActivityDetailScreen extends StatelessWidget {
  const ActivityDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;
    final activityId = args is Map ? (args['activityId'] as String? ?? '') : '';
    final client = ZhiyaRuntime.instance.client;
    final activity = client.getActivity(activityId);
    if (activity == null) {
      return const Scaffold(body: Center(child: Text('活动不存在或已下架')));
    }
    final reviews = client.listReviewsByActivity(activity.id);
    return Scaffold(
      appBar: AppBar(title: Text(activity.title, maxLines: 1, overflow: TextOverflow.ellipsis)),
      body: ListView(
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Text(activity.emoji, style: const TextStyle(fontSize: 64)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: Text(activity.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                ),
                Text(formatPrice(activity.price), style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.primary)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(activity.subtitle),
                const SizedBox(height: 8),
                Text('${formatStart(activity.startTime)} ~ ${formatStart(activity.endTime)}'),
                const SizedBox(height: 4),
                Text('地点：${activity.address}'),
                const SizedBox(height: 4),
                Text('适合 ${activity.ageMin}-${activity.ageMax} 岁孩子 · ${quotaLabel(activity.quota, activity.enrolled)}'),
                const SizedBox(height: 4),
                Text('主办：${activity.orgName}'),
              ],
            ),
          ),
          const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('活动介绍', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
          Padding(padding: const EdgeInsets.all(16), child: Text(activity.introduction)),
          const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('活动须知', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
          Padding(padding: const EdgeInsets.all(16), child: Text(activity.notice)),
          if (reviews.isNotEmpty) ...[
            const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('用户评价', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
            for (final review in reviews.take(5))
              ListTile(
                title: Text('${review.authorName}  ${'★' * review.overall}'),
                subtitle: Text(review.content, maxLines: 2, overflow: TextOverflow.ellipsis),
              ),
          ],
          const SizedBox(height: 80),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: activity.remaining == 0 ? null : () {
              Navigator.of(context).pushNamed('app.zhiya.activity.register', arguments: {'activityId': activity.id});
            },
            child: Text(activity.remaining == 0 ? '已满员' : '立即报名'),
          ),
        ),
      ),
    );
  }
}
