import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 问知鸭 AI tab (PRD §14): chat thread + suggestions + plan rendering.
class AiScreen extends StatefulWidget {
  const AiScreen({super.key});

  @override
  State<AiScreen> createState() => _AiScreenState();
}

class _AiTurn {
  _AiTurn.user(this.text) : reply = null;
  _AiTurn.assistant(this.text, this.reply);

  final String text;
  final AiReply? reply;
}

class _AiScreenState extends State<AiScreen> {
  final List<_AiTurn> _turns = <_AiTurn>[];
  final TextEditingController _controller = TextEditingController();
  bool _sending = false;

  static const List<String> _suggestions = [
    '8岁孩子适合学什么？',
    '周末有什么亲子活动？',
    '想让孩子体验编程，有什么课程？',
    '预算100元，帮我安排一个周末体验计划。',
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _sending) {
      return;
    }
    setState(() {
      _sending = true;
      _turns.add(_AiTurn.user(trimmed));
      _controller.clear();
    });
    final reply = ZhiyaRuntime.instance.client.aiAsk(trimmed);
    final messageKey = reply.messageKey;
    const texts = {
      'zhiya.ai.reply.recommend': '结合你的需求，为你挑了这些活动：',
      'zhiya.ai.reply.found': '在知鸭上找到这些相关的活动：',
      'zhiya.ai.reply.fallback': '这个问题有点超出我的活动库啦，先看看热门活动吧：',
      'zhiya.ai.reply.plan': '好的！按你的预算为你安排了体验计划：',
    };
    setState(() {
      _sending = false;
      _turns.add(_AiTurn.assistant(texts[messageKey] ?? messageKey, reply));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('问知鸭 🦆')),
      body: Column(
        children: [
          Expanded(
            child: _turns.isEmpty
                ? ListView(
                    children: [
                      const Padding(
                        padding: EdgeInsets.all(24),
                        child: Text('你好呀，我是知鸭 🦆 可以问我：孩子适合学什么、周末去哪儿、怎么安排体验计划……'),
                      ),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final suggestion in _suggestions)
                            ActionChip(
                              label: Text(suggestion, style: const TextStyle(fontSize: 12)),
                              onPressed: () => _send(suggestion),
                            ),
                        ],
                      ),
                    ],
                  )
                : ListView(
                    children: [
                      for (final turn in _turns) ...[
                        Align(
                          alignment: turn.reply == null ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            padding: const EdgeInsets.all(12),
                            constraints: const BoxConstraints(maxWidth: 320),
                            decoration: BoxDecoration(
                              color: turn.reply == null
                                  ? Theme.of(context).colorScheme.primary
                                  : Theme.of(context).colorScheme.surfaceContainerHighest,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              turn.text,
                              style: turn.reply == null
                                  ? const TextStyle(color: Colors.white)
                                  : const TextStyle(),
                            ),
                          ),
                        ),
                        if (turn.reply?.plan != null)
                          Card(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            child: Column(
                              children: [
                                for (final week in turn.reply!.plan!)
                                  ListTile(
                                    dense: true,
                                    title: Text('第${week.weekIndex}周 · ${week.title}'),
                                    trailing: Text(formatPrice(week.price)),
                                  ),
                              ],
                            ),
                          ),
                        for (final activity in turn.reply?.activities ?? const <ZhiyaActivity>[])
                          ListTile(
                            dense: true,
                            leading: Text(activity.emoji, style: const TextStyle(fontSize: 20)),
                            title: Text(activity.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                            subtitle: Text(activity.orgName),
                            trailing: Text(formatPrice(activity.price)),
                            onTap: () => Navigator.of(context).pushNamed(
                              'app.zhiya.activity.detail',
                              arguments: {'activityId': activity.id},
                            ),
                          ),
                      ],
                    ],
                  ),
          ),
          if (_sending) const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator()),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      onSubmitted: _send,
                      decoration: const InputDecoration(
                        hintText: '说说你的需求，比如“8岁孩子学什么”',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  IconButton.filled(onPressed: () => _send(_controller.text), icon: const Icon(Icons.send)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
