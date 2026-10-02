import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 商城 tab (PRD §16): category chips + goods list (browse-only).
class MallScreen extends StatelessWidget {
  const MallScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final client = ZhiyaRuntime.instance.client;
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('商城'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [Tab(text: '全部'), Tab(text: '图书'), Tab(text: '科学实验')],
          ),
        ),
        body: TabBarView(
          children: [
            _GoodsGrid(client: client, category: null),
            _GoodsGrid(client: client, category: 'books'),
            _GoodsGrid(client: client, category: 'science'),
          ],
        ),
      ),
    );
  }
}

class _GoodsGrid extends StatelessWidget {
  const _GoodsGrid({required this.client, required this.category});

  final MockZhiyaClient client;
  final String? category;

  @override
  Widget build(BuildContext context) {
    final goods = client.listGoods(category: category);
    if (goods.isEmpty) {
      return const ScreenStateView(state: 'empty', child: SizedBox());
    }
    return ListView(
      children: [
        for (final item in goods)
          ZhiyaTile(
            emoji: item.emoji,
            title: item.title,
            subtitle: '${item.summary}\n已售 ${item.sales}',
            trailing: formatPrice(item.price),
          ),
      ],
    );
  }
}
