import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 我的订单 (PRD §29): status tabs + actions (pay/cancel/refund/review).
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  String _status = 'all';

  @override
  Widget build(BuildContext context) {
    final client = ZhiyaRuntime.instance.client;
    final orders = client.listOrders(status: _status);
    return Scaffold(
      appBar: AppBar(
        title: const Text('我的订单'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              children: [
                for (final tab in const [
                  ('all', '全部'),
                  ('pending-payment', '待支付'),
                  ('upcoming', '待参加'),
                  ('pending-review', '待评价'),
                  ('completed', '已完成'),
                  ('refunded', '已退款'),
                ])
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(tab.$2),
                      selected: _status == tab.$1,
                      onSelected: (_) => setState(() => _status = tab.$1),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
      body: orders.isEmpty
          ? const Center(child: Text('这里还空空如也 🦆'))
          : RefreshIndicator(
              onRefresh: () async => setState(() {}),
              child: ListView(
                children: [
                  for (final view in orders)
                    Card(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(view.order.items.first.emoji, style: const TextStyle(fontSize: 22)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    view.order.items.first.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.w600),
                                  ),
                                ),
                                Text(
                                  view.status.zhLabel,
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '实付 ¥${view.order.payable.toStringAsFixed(view.order.payable % 1 == 0 ? 0 : 2)}'
                              '${view.order.items.first.childName != null ? ' · ${view.order.items.first.childName}' : ''}',
                              style: TextStyle(color: Theme.of(context).hintColor, fontSize: 12),
                            ),
                            if (view.order.voucherCode != null && view.status != OrderStatus.pendingPayment)
                              Text(
                                '凭证码 ${view.order.voucherCode} · ${view.order.checkInState == 'checked-in' ? '已签到' : '待核销'}',
                                style: const TextStyle(fontSize: 12),
                              ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                if (view.status == OrderStatus.pendingPayment) ...[
                                  TextButton(
                                    onPressed: () => setState(() => client.cancelOrder(view.order.id)),
                                    child: const Text('取消订单'),
                                  ),
                                  FilledButton.tonal(
                                    onPressed: () => setState(() => client.payOrder(view.order.id)),
                                    child: const Text('去支付'),
                                  ),
                                ],
                                if (view.status == OrderStatus.upcoming || view.status == OrderStatus.ongoing)
                                  TextButton(
                                    onPressed: () => setState(() => client.refundOrder(view.order.id)),
                                    child: const Text('申请退款'),
                                  ),
                                if (view.status == OrderStatus.pendingReview)
                                  FilledButton(
                                    onPressed: () => Navigator.of(context).pushNamed(
                                      'app.zhiya.trade.review',
                                      arguments: {'orderId': view.order.id},
                                    ),
                                    child: const Text('去评价'),
                                  ),
                                if (view.order.type == 'package' &&
                                    (view.status == OrderStatus.upcoming ||
                                        view.status == OrderStatus.ongoing))
                                  FilledButton.tonal(
                                    onPressed: () => Navigator.of(context).pushNamed(
                                      'app.zhiya.trade.benefits',
                                      arguments: {'orderId': view.order.id},
                                    ),
                                    child: const Text('查看权益'),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
  }
}
