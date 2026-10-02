import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 体验包权益页 (PRD §12.4): 包内每个活动的已约/可约状态，选孩子 + 场次
/// 后预约一个权益，出凭证并进入机构核销流程。
class BenefitsScreen extends StatefulWidget {
  const BenefitsScreen({super.key});

  @override
  State<BenefitsScreen> createState() => _BenefitsScreenState();
}

class _BenefitsScreenState extends State<BenefitsScreen> {
  String? _selectedActivityId;
  String? _selectedChildId;
  String? _sessionId;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;
    final orderId = args is Map ? (args['orderId'] as String? ?? '') : '';
    final client = ZhiyaRuntime.instance.client;
    final view = client.getOrder(orderId);
    if (view == null || view.order.type != 'package') {
      return const Scaffold(body: Center(child: Text('订单不存在')));
    }
    final benefits = client.listPackageBenefits(orderId: orderId);
    final children = client.listChildren();

    return Scaffold(
      appBar: AppBar(title: const Text('体验包权益')),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 32),
        children: [
          if (children.isEmpty)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Text('还没有孩子资料，请先在「我的」中添加后再预约'),
            ),
          for (final benefit in benefits)
            _BenefitCard(
              benefit: benefit,
              children: children,
              expanded: _selectedActivityId == benefit.activityId && !benefit.booked,
              selectedChildId: _selectedChildId,
              selectedSessionId: _sessionId,
              error: _error,
              onToggle: () => setState(() {
                _selectedActivityId =
                    _selectedActivityId == benefit.activityId ? null : benefit.activityId;
                _sessionId = null;
                _error = null;
              }),
              onChildSelected: (childId) => setState(() => _selectedChildId = childId),
              onSessionSelected: (sessionId) => setState(() => _sessionId = sessionId),
              onBook: () {
                final childId = _selectedChildId ?? (children.isNotEmpty ? children.first.id : '');
                if (childId.isEmpty || _sessionId == null) {
                  setState(() => _error = '请选择孩子和场次');
                  return;
                }
                try {
                  final booking = client.bookPackageBenefit(
                    orderId: orderId,
                    activityId: benefit.activityId,
                    sessionId: _sessionId!,
                    childId: childId,
                  );
                  if (!context.mounted) {
                    return;
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('预约成功！凭证码 ${booking.voucherCode}')),
                  );
                  setState(() {
                    _selectedActivityId = null;
                    _sessionId = null;
                    _error = null;
                  });
                } on RegistrationException catch (error) {
                  setState(() => _error = '预约失败：${error.message}');
                }
              },
            ),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              '权益规则：包内每个活动可预约一次，预约后到场出示凭证核销；未核销的权益可取消预约后退款。',
              style: TextStyle(fontSize: 12, color: Color(0xFF71717A), height: 1.6),
            ),
          ),
        ],
      ),
    );
  }
}

class _BenefitCard extends StatelessWidget {
  const _BenefitCard({
    required this.benefit,
    required this.children,
    required this.expanded,
    required this.selectedChildId,
    required this.selectedSessionId,
    required this.error,
    required this.onToggle,
    required this.onChildSelected,
    required this.onSessionSelected,
    required this.onBook,
  });

  final PackageBenefitView benefit;
  final List<ZhiyaChild> children;
  final bool expanded;
  final String? selectedChildId;
  final String? selectedSessionId;
  final String? error;
  final VoidCallback onToggle;
  final ValueChanged<String> onChildSelected;
  final ValueChanged<String> onSessionSelected;
  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(benefit.emoji, style: const TextStyle(fontSize: 24)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    benefit.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                if (benefit.booked)
                  Text(
                    benefit.checkInState ? '已签到' : '已预约',
                    style: const TextStyle(color: Color(0xFF16A34A), fontSize: 12),
                  ),
              ],
            ),
            if (benefit.booked && benefit.voucherCode != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  '凭证码 ${benefit.voucherCode}',
                  style: const TextStyle(fontSize: 12, letterSpacing: 2),
                ),
              ),
            if (expanded) ...[
              const Padding(
                padding: EdgeInsets.only(top: 8, bottom: 4),
                child: Text('选择参加儿童', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              ),
              Wrap(
                spacing: 8,
                children: [
                  for (final child in children)
                    ChoiceChip(
                      label: Text('${child.emoji} ${child.nickname}'),
                      selected: selectedChildId == child.id ||
                          (selectedChildId == null && children.first.id == child.id),
                      onSelected: (_) => onChildSelected(child.id),
                    ),
                ],
              ),
              const Padding(
                padding: EdgeInsets.only(top: 8, bottom: 4),
                child: Text('选择场次', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              ),
              Wrap(
                spacing: 8,
                children: [
                  for (final session in _sessions())
                    ChoiceChip(
                      label: Text(
                        '${session.label}（${session.remaining == 0 ? '满员' : '剩${session.remaining}'}）',
                      ),
                      selected: selectedSessionId == session.id,
                      onSelected: session.remaining == 0 ? null : (_) => onSessionSelected(session.id),
                    ),
                ],
              ),
              if (error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12)),
                ),
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: FilledButton(onPressed: onBook, child: const Text('确认预约')),
              ),
            ] else if (!benefit.booked)
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(onPressed: onToggle, child: const Text('预约')),
              ),
          ],
        ),
      ),
    );
  }

  List<ZhiyaSession> _sessions() {
    final activity = ZhiyaRuntime.instance.client.getActivity(benefit.activityId);
    return activity?.sessions ?? const <ZhiyaSession>[];
  }
}
