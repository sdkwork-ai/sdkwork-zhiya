import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_commons/sdkwork_zhiya_flutter_mobile_commons.dart';
import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

/// 报名流程 (PRD §9): 选儿童 → 选场次 → 选优惠券 → 确认订单 → mock 支付.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  String? _childId;
  String? _sessionId;
  String? _couponId;
  String? _error;
  bool _submitting = false;

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;
    final activityId = args is Map ? (args['activityId'] as String? ?? '') : '';
    final client = ZhiyaRuntime.instance.client;
    final activity = client.getActivity(activityId);
    if (activity == null) {
      return const Scaffold(body: Center(child: Text('活动不存在')));
    }
    final children = client.listChildren();
    final coupons = client.listClaimableCoupons();
    return Scaffold(
      appBar: AppBar(title: const Text('确认报名')),
      body: ListView(
        children: [
          ListTile(
            title: Text(activity.title),
            trailing: Text(
              formatPrice(activity.price),
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          const Padding(
            padding: EdgeInsets.all(12),
            child: Text('选择参加儿童', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
          if (children.isEmpty)
            const ListTile(
              title: Text('还没有孩子资料，请先在「我的」中添加'),
              subtitle: Text('系统会自动检查适龄与时间冲突'),
            ),
          RadioGroup<String>(
            groupValue: _childId,
            onChanged: (value) => setState(() => _childId = value),
            child: Column(
              children: [
                for (final child in children)
                  RadioListTile<String>(
                    value: child.id,
                    title: Text('${child.emoji} ${child.nickname}'),
                  ),
              ],
            ),
          ),
          const Padding(
            padding: EdgeInsets.all(12),
            child: Text('选择场次', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
          RadioGroup<String>(
            groupValue: _sessionId,
            onChanged: (value) => setState(() => _sessionId = value),
            child: Column(
              children: [
                for (final session in activity.sessions)
                  RadioListTile<String>(
                    value: session.id,
                    title: Text(
                      '${session.label}（${session.remaining == 0 ? '满员' : '剩${session.remaining}'}）',
                    ),
                  ),
              ],
            ),
          ),
          if (coupons.isNotEmpty)
            const Padding(
              padding: EdgeInsets.all(12),
              child: Text('选择优惠券', style: TextStyle(fontWeight: FontWeight.w600)),
            ),
          for (final coupon in coupons)
            CheckboxListTile(
              value: _couponId == coupon['id'],
              onChanged: (checked) =>
                  setState(() => _couponId = checked == true ? coupon['id'] as String : null),
              title: Text(coupon['title'] as String),
              secondary: Text('-¥${(coupon['amountOff'] as double).toStringAsFixed(0)}'),
            ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          const SizedBox(height: 80),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: _submitting
                ? null
                : () async {
                    if (_childId == null || _sessionId == null) {
                      setState(
                        () => _error = children.isEmpty ? '请先在「我的」中添加孩子资料' : '请选择场次',
                      );
                      return;
                    }
                    setState(() {
                      _submitting = true;
                      _error = null;
                    });
                    try {
                      final order = client.createRegistrationOrder(
                        activityId: activityId,
                        sessionId: _sessionId!,
                        childId: _childId!,
                        couponId: _couponId,
                      );
                      final paid = client.payOrder(order.id);
                      if (!context.mounted) {
                        return;
                      }
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('报名成功！凭证码 ${paid.voucherCode}')),
                      );
                      Navigator.of(context).pushReplacementNamed('app.zhiya.trade.orders');
                    } on RegistrationException catch (error) {
                      setState(() {
                        _submitting = false;
                        _error = switch (error.code) {
                          'age-not-fit' => '孩子年龄不在活动适龄范围内',
                          'sold-out' => '来晚一步，名额已被抢光',
                          'duplicate' => '该孩子已报名此活动，无需重复报名',
                          'time-conflict' => '与已报名活动时间冲突，请调整场次',
                          'coupon-invalid' => '优惠券不可用，请重新选择',
                          _ => '活动当前不可报名',
                        };
                      });
                    }
                  },
            child: Text(_submitting ? '提交中…' : '提交订单并支付'),
          ),
        ),
      ),
    );
  }
}
