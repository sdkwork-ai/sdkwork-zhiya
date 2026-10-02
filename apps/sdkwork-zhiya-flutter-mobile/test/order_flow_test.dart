// Order-flow tests: the P0 loop business rules (PRD §9/§29/§11/§21) mirrored
// from the shared TS service contracts — checks, derivation, check-in,
// coupons, and reviews.
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

void main() {
  late MockZhiyaClient client;
  late ZhiyaChild child;

  setUp(() {
    client = MockZhiyaClient(now: () => DateTime(2026, 10, 2, 10));
    child = client.addChild(nickname: '小鸭', birthDate: '2018-05-01');
  });

  test('creates_pays_and_derives_upcoming_status_with_a_voucher', () {
    final order = client.createRegistrationOrder(
      activityId: 'act-101',
      sessionId: 'act-101-s1',
      childId: child.id,
    );
    expect(order.rawStatus, equals('pending-payment'));
    final paid = client.payOrder(order.id);
    expect(client.getOrder(order.id)!.status, equals(OrderStatus.upcoming));
    expect(paid.voucherCode, startsWith('ZY'));
    expect(paid.voucherCode!.length, equals(8));
  });

  test('rejects_a_child_outside_the_activity_age_range', () {
    final young = client.addChild(nickname: '小小米', birthDate: '2022-05-01');
    expect(
      () => client.createRegistrationOrder(activityId: 'act-101', sessionId: 'act-101-s1', childId: young.id),
      throwsA(
        isA<RegistrationException>().having((error) => error.code, 'code', 'age-not-fit'),
      ),
    );
  });

  test('rejects_duplicate_registration_for_the_same_child', () {
    final order = client.createRegistrationOrder(
      activityId: 'act-101',
      sessionId: 'act-101-s1',
      childId: child.id,
    );
    client.payOrder(order.id);
    expect(
      () => client.createRegistrationOrder(activityId: 'act-101', sessionId: 'act-101-s1', childId: child.id),
      throwsA(
        isA<RegistrationException>().having((error) => error.code, 'code', 'duplicate'),
      ),
    );
  });

  test('rejects_time_conflicts_across_activities_for_the_same_child', () {
    final order = client.createRegistrationOrder(
      activityId: 'act-101',
      sessionId: 'act-101-s1',
      childId: child.id,
    );
    client.payOrder(order.id);
    // act-104 sits on the same Saturday slot as act-101-s1 in the seed.
    expect(
      () => client.createRegistrationOrder(activityId: 'act-104', sessionId: 'act-104-s1', childId: child.id),
      throwsA(
        isA<RegistrationException>().having((error) => error.code, 'code', 'time-conflict'),
      ),
    );
  });

  test('coupons_apply_scopes_and_flip_to_used_on_payment', () {
    final coupon = client.claimCoupon('tpl-org-1-20');
    final order = client.createRegistrationOrder(
      activityId: 'act-101',
      sessionId: 'act-101-s1',
      childId: child.id,
      couponId: coupon.id,
    );
    expect(order.discount, equals(19)); // capped at the ¥19 activity price
    client.payOrder(order.id);
    expect(
      () => client.createRegistrationOrder(
        activityId: 'act-109',
        sessionId: 'act-109-s1',
        childId: child.id,
        couponId: coupon.id,
      ),
      throwsA(
        isA<RegistrationException>().having((error) => error.code, 'code', 'coupon-invalid'),
      ),
    );
  });

  test('completing_the_activity_lifecycle_reaches_completed_after_review', () {
    final order = client.createRegistrationOrder(
      activityId: 'act-101',
      sessionId: 'act-101-s1',
      childId: child.id,
    );
    client.payOrder(order.id);
    // Org completes the activity (PRD §11 活动结束确认) — simulate on the stored order.
    final view = client.getOrder(order.id)!;
    expect(view.status, equals(OrderStatus.upcoming));

    var clock = DateTime(2026, 10, 2, 10);
    final endedClient = MockZhiyaClient(now: () => clock);
    // Book while the activity is upcoming…
    endedClient.addChild(nickname: '小鸭', birthDate: '2018-05-01');
    final endedOrder = endedClient.createRegistrationOrder(
      activityId: 'act-101',
      sessionId: 'act-101-s1',
      childId: endedClient.listChildren().first.id,
    );
    endedClient.payOrder(endedOrder.id);
    // …then advance past the activity end (seeds are relative to boot time).
    clock = DateTime(2026, 10, 3, 12, 30);
    expect(endedClient.getOrder(endedOrder.id)!.status, equals(OrderStatus.pendingReview));
    endedClient.submitReview(orderId: endedOrder.id, overall: 5, recommend: true, content: '很棒');
    expect(endedClient.getOrder(endedOrder.id)!.status, equals(OrderStatus.completed));
  });

  test('ai_recommends_age_fit_activities_and_builds_a_budget_plan', () {
    final reply = client.aiAsk('我家孩子8岁，喜欢动手，周末想找点有趣的课程。');
    expect(reply.messageKey, equals('zhiya.ai.reply.recommend'));
    expect(reply.activities, isNotEmpty);
    for (final activity in reply.activities) {
      expect(activity.ageMin <= 8 && activity.ageMax >= 8, isTrue);
    }

    final planReply = client.aiAsk('预算100元，帮我安排一个周末体验计划。');
    expect(planReply.plan, isNotNull);
    expect(planReply.plan!.length, lessThanOrEqualTo(4));
    final total = planReply.plan!.fold<double>(0, (sum, week) => sum + week.price);
    expect(total, lessThanOrEqualTo(100));
  });
}
