import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 评价活动 (PRD §21): five-dimension rating + recommend + content.
class ReviewScreen extends StatefulWidget {
  const ReviewScreen({super.key});

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  int _overall = 5;
  bool _recommend = true;
  final TextEditingController _content = TextEditingController();

  static const Map<String, String> _dimensions = {
    'overall': '综合评分',
    'experience': '活动体验',
    'teacher': '教师',
    'environment': '环境',
    'service': '服务',
  };

  @override
  void dispose() {
    _content.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;
    final orderId = args is Map ? (args['orderId'] as String? ?? '') : '';
    return Scaffold(
      appBar: AppBar(title: const Text('评价活动')),
      body: ListView(
        children: [
          for (final entry in _dimensions.entries)
            ListTile(
              title: Text(entry.value),
              trailing: entry.key == 'overall'
                  ? Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        for (var star = 1; star <= 5; star += 1)
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            icon: Icon(
                              star <= _overall ? Icons.star : Icons.star_border,
                              color: Colors.amber,
                            ),
                            onPressed: () => setState(() => _overall = star),
                          ),
                      ],
                    )
                  : null,
            ),
          SwitchListTile(
            title: const Text('愿意推荐给其他家长'),
            value: _recommend,
            onChanged: (value) => setState(() => _recommend = value),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _content,
              maxLines: 4,
              maxLength: 300,
              decoration: const InputDecoration(
                hintText: '孩子玩得怎么样？有什么亮点或建议都可以说～',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: FilledButton(
              onPressed: () {
                final message = ZhiyaRuntime.instance.client.submitReview(
                  orderId: orderId,
                  overall: _overall,
                  recommend: _recommend,
                  content: _content.text.trim(),
                );
                ScaffoldMessenger.of(context)
                    .showSnackBar(SnackBar(content: Text('评价成功：${message.id}')));
                Navigator.of(context).pop();
              },
              child: const Text('发布评价'),
            ),
          ),
        ],
      ),
    );
  }
}
