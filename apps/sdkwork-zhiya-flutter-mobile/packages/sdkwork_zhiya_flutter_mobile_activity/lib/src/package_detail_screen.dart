import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 体验包详情 (PRD §12.2/§12.3): included activities, rules, buy CTA.
/// Buying creates the package order and mock-pays it in one step, then lands
/// on the orders screen (benefit booking lands with the P1 milestone).
class PackageDetailScreen extends StatelessWidget {
  const PackageDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;
    final packageId = args is Map ? (args['packageId'] as String? ?? '') : '';
    final client = ZhiyaRuntime.instance.client;
    final pkg = client.listHotPackages().where((entry) => entry.id == packageId).firstOrNull;
    if (pkg == null) {
      return const Scaffold(body: Center(child: Text('体验包不存在')));
    }
    return Scaffold(
      appBar: AppBar(title: Text(pkg.title, maxLines: 1, overflow: TextOverflow.ellipsis)),
      body: ListView(
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Text(pkg.emoji, style: const TextStyle(fontSize: 64)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(child: Text(pkg.summary)),
                Text(
                  formatPrice(pkg.price),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text('${pkg.purchasedCount}人已购买'),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('包含的活动', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
          for (final activityId in pkg.activityIds)
            () {
              final activity = client.getActivity(activityId);
              if (activity == null) {
                return const SizedBox.shrink();
              }
              return ZhiyaTile(
                emoji: activity.emoji,
                title: activity.title,
                subtitle:
                    '${activity.orgName} · ${kCategoryLabels[activity.category] ?? activity.category}\n${formatStart(activity.startTime)} · ${quotaLabel(activity.quota, activity.enrolled)}',
                trailing: formatPrice(activity.price),
                onTap: () => Navigator.of(context)
                    .pushNamed('app.zhiya.activity.detail', arguments: {'activityId': activity.id}),
              );
            }(),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              '购买须知：体验包购买后在有效期内可用；每个活动需单独预约场次，到场出示凭证核销；未核销的权益支持按规则退款。',
              style: TextStyle(fontSize: 12, color: Color(0xFF71717A), height: 1.6),
            ),
          ),
          const SizedBox(height: 72),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: () {
              final order = client.createPackageOrder(packageId);
              final paid = client.payOrder(order.id);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('购买成功！订单 ${paid.id}')),
              );
              Navigator.of(context).pushReplacementNamed('app.zhiya.trade.orders');
            },
            child: Text('${formatPrice(pkg.price)} 立即购买'),
          ),
        ),
      ),
    );
  }
}
