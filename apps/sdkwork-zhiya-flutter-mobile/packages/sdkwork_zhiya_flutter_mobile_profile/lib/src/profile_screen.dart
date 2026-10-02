import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 我的 tab (PRD §20/§42): user card, children management (add/remove), and
/// entries to orders/messages. The org workspace lives on PC/H5.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final TextEditingController _nickname = TextEditingController();
  String _birthDate = '2018-01-01';

  @override
  void dispose() {
    _nickname.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final client = ZhiyaRuntime.instance.client;
    final children = client.listChildren();
    final unread = client.listMessages().where((message) => !message.read).length;
    return Scaffold(
      appBar: AppBar(title: const Text('我的')),
      body: ListView(
        children: [
          const ListTile(
            leading: Text('🦆', style: TextStyle(fontSize: 32)),
            title: Text('鸭家长', style: TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text('知孩子，也知教育'),
          ),
          const Divider(),
          ListTile(
            leading: const Text('👶'),
            title: const Text('我的家庭'),
            subtitle: children.isEmpty ? const Text('添加孩子资料后即可报名活动') : Text(children.map((child) => child.nickname).join(' / ')),
          ),
          for (final child in children)
            ListTile(
              contentPadding: const EdgeInsets.only(left: 56, right: 16),
              leading: Text(child.emoji),
              title: Text(child.nickname),
              subtitle: Text('${kStageLabels[child.stage] ?? child.stage} · ${child.ageAt(DateTime.now())} 岁'),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline),
                onPressed: () => setState(() => client.removeChild(child.id)),
              ),
            ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: ExpansionTile(
              tilePadding: EdgeInsets.zero,
              title: const Text('添加孩子'),
              children: [
                TextField(
                  controller: _nickname,
                  decoration: const InputDecoration(labelText: '昵称', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Text('出生日期'),
                    const SizedBox(width: 12),
                    Text(_birthDate),
                    IconButton(
                      icon: const Icon(Icons.calendar_month),
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: DateTime.parse(_birthDate),
                          firstDate: DateTime(2010),
                          lastDate: DateTime(2024, 12, 31),
                        );
                        if (picked != null) {
                          setState(() {
                            _birthDate =
                                '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                          });
                        }
                      },
                    ),
                  ],
                ),
                FilledButton.tonal(
                  onPressed: () {
                    if (_nickname.text.trim().isEmpty) {
                      return;
                    }
                    setState(() {
                      client.addChild(nickname: _nickname.text.trim(), birthDate: _birthDate);
                      _nickname.clear();
                    });
                  },
                  child: const Text('保存'),
                ),
              ],
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Text('📋'),
            title: const Text('我的订单'),
            subtitle: const Text('报名 / 支付 / 退款 / 评价'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.of(context).pushNamed('app.zhiya.trade.orders'),
          ),
          ListTile(
            leading: const Text('🔔'),
            title: const Text('消息中心'),
            subtitle: const Text('报名、支付、优惠通知'),
            trailing: unread > 0
                ? Badge(label: Text('$unread'), child: const Icon(Icons.chevron_right))
                : const Icon(Icons.chevron_right),
            onTap: () {
              setState(() => client.markAllMessagesRead());
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    client.listMessages().take(3).map((message) => message.title).join(' · '),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
