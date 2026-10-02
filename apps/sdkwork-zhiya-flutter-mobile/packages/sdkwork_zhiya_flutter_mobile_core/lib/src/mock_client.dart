/// Mock service client for the Zhiya Flutter surface (Phase 1 standalone):
/// an in-memory port of the shared TS service hub (`@sdkwork/zhiya-service-core`)
/// implementing the P0 loop business rules — registration checks (PRD §9.2),
/// order status derivation (PRD §29), coupons (PRD §17), reviews (PRD §21),
/// and the 问知鸭 engine (PRD §14). Phase 2 swaps this for generated SDK
/// clients behind the same accessors; behavior is pinned by
/// `test/order_flow_test.dart`.
library;

import 'dart:math';

import 'intent.dart';
import 'models.dart';

/// Typed registration rejection (PRD §9.2), code-stable across surfaces.
class RegistrationException implements Exception {
  RegistrationException(this.code, this.message);
  final String code;
  final String message;

  @override
  String toString() => 'RegistrationException($code): $message';
}

const List<String> kFollowUps = [
  '8岁孩子适合学什么？',
  '周末有什么亲子活动？',
  '想让孩子体验编程，有什么课程？',
  '预算100元，帮我安排一个周末体验计划。',
];

DateTime _nextWeekday(DateTime from, int weekday, int hour, int minute) {
  final result = DateTime(from.year, from.month, from.day, hour, minute);
  var delta = (weekday - result.weekday) % 7;
  // Dart: Monday=1..Sunday=7; shift so Saturday=6/Sunday=7 stays intuitive.
  if (delta < 0) {
    delta += 7;
  }
  final candidate = result.add(Duration(days: delta));
  return candidate.isAfter(from) ? candidate : candidate.add(const Duration(days: 7));
}

class MockZhiyaClient {
  MockZhiyaClient({DateTime Function()? now}) : _now = now ?? DateTime.now {
    _seed();
  }

  final DateTime Function() _now;
  final Random _random = Random();

  final List<ZhiyaActivity> _activities = [];
  final List<ZhiyaPackage> _packages = [];
  final List<ZhiyaGoods> _goods = [];
  final List<ZhiyaChild> _children = [];
  final List<ZhiyaOrder> _orders = [];
  final List<ZhiyaCoupon> _coupons = [];
  final List<ZhiyaReview> _reviews = [];
  final List<ZhiyaMessage> _messages = [];
  var _childSeq = 0;
  var _orderSeq = 0;
  var _bookingSeq = 0;
  final List<BenefitBookingView> _benefitBookings = [];

  // ── seeding ─────────────────────────────────────────────────────────────
  void _seed() {
    final now = _now();
    DateTime days(int offset, int hour) => DateTime(now.year, now.month, now.day + offset, hour);

    ZhiyaSession session(String id, String label, DateTime start, int hours, int quota, int enrolled) =>
        ZhiyaSession(id: id, label: label, start: start, end: start.add(Duration(hours: hours)), quota: quota, enrolled: enrolled);

    final sat = _nextWeekday(now, 6, 9, 30);
    final satStart = _nextWeekday(now, 6, 10, 0);
    final sun = _nextWeekday(now, 7, 15, 0);

    _activities.addAll([
      ZhiyaActivity(
        id: 'act-101', orgId: 'org-1', orgName: '童程未来少儿编程', category: 'trial', mode: 'offline',
        title: '少儿编程 Scratch 体验课', subtitle: '90 分钟做出第一个小游戏', emoji: '💻',
        ageMin: 6, ageMax: 12, startTime: sat, endTime: sat.add(const Duration(hours: 2)),
        address: '北京市海淀区中关村大街 27 号 3 层', price: 19, originalPrice: 299, quota: 12, enrolled: 7,
        tags: ['programming', 'thinking'],
        introduction: '以 Scratch 为载体的编程启蒙体验课，现场完成一个可运行的小游戏。',
        notice: '请自带笔记本电脑（可现场租借）；请提前 10 分钟到店签到。',
        sessions: [session('act-101-s1', '周六 09:30 场', sat, 2, 12, 7), session('act-101-s2', '周日 15:00 场', sun, 2, 12, 2)],
      ),
      ZhiyaActivity(
        id: 'act-103', orgId: 'org-2', orgName: '科学盒子实验室', category: 'trial', mode: 'offline',
        title: '科学实验：火山大爆发', subtitle: '动手做一次“安全喷发”', emoji: '🌋',
        ageMin: 5, ageMax: 10, startTime: days(2, 14), endTime: days(2, 15),
        address: '北京市朝阳区大悦城写字楼 B 座 12 层', price: 29.9, originalPrice: 199, quota: 10, enrolled: 4,
        tags: ['science'], introduction: '亲手搭建火山模型，用酸碱反应模拟喷发，实验盒带回家。', notice: '实验材料由机构提供。',
        sessions: [session('act-103-s1', '周五 16:30 场', days(2, 14), 1, 10, 4)],
      ),
      ZhiyaActivity(
        id: 'act-104', orgId: 'org-3', orgName: '小天鹅艺术中心', category: 'trial', mode: 'offline',
        title: '创意美术体验课', subtitle: '一块画布，一个故事', emoji: '🎨',
        ageMin: 4, ageMax: 8, startTime: satStart, endTime: satStart.add(const Duration(hours: 2)),
        address: '北京市朝阳区望京 SOHO T1 2201', price: 0, originalPrice: 168, quota: 8, enrolled: 6,
        tags: ['art'], introduction: '免费公益体验课，以“我的家庭”为主题自由创作。', notice: '画材由机构提供；作品可带走。',
        sessions: [session('act-104-s1', '周六 10:00 场', satStart, 2, 8, 6)],
      ),
      ZhiyaActivity(
        id: 'act-106', orgId: 'org-6', orgName: '阳光亲子俱乐部', category: 'parent-child', mode: 'offline',
        title: '周末亲子露营会', subtitle: '搭帐篷、点篝火、数星星', emoji: '⛺',
        ageMin: 3, ageMax: 12, startTime: days(6, 14), endTime: days(7, 12),
        address: '北京市昌平区十三陵镇亲子营地', price: 199, originalPrice: 458, quota: 15, enrolled: 9,
        tags: ['nature', 'sports'], introduction: '一夜露营亲子活动，费用含场地、餐食与装备租赁（一大一小）。', notice: '请为孩子准备保暖睡袋。',
        sessions: const [],
      ),
      ZhiyaActivity(
        id: 'act-108', orgId: 'org-5', orgName: '悦读星球英文馆', category: 'open-course', mode: 'online',
        title: '英文绘本公开课', subtitle: '和外教一起“吃”出一周单词', emoji: '🐛',
        ageMin: 3, ageMax: 8, startTime: sat.add(const Duration(hours: 10, minutes: 30)),
        endTime: sat.add(const Duration(hours: 11)),
        address: '线上直播', price: 0, originalPrice: 99, quota: 100, enrolled: 47,
        tags: ['english'], introduction: '30 分钟免费线上公开课，家长同步获得亲子共读指导。', notice: '开课前 15 分钟进入教室。',
        sessions: const [],
      ),
      ZhiyaActivity(
        id: 'act-109', orgId: 'org-1', orgName: '童程未来少儿编程', category: 'trial', mode: 'offline',
        title: '机器人搭建体验课', subtitle: '从零件到会动的机器人', emoji: '🤖',
        ageMin: 6, ageMax: 12, startTime: days(4, 14), endTime: days(4, 16),
        address: '北京市海淀区中关村大街 27 号 3 层', price: 39, originalPrice: 299, quota: 10, enrolled: 3,
        tags: ['robotics', 'programming'], introduction: '完成一辆可以避障的小车，体验“物理世界编程”。', notice: '套件由机构提供。',
        sessions: [session('act-109-s1', '周六 14:00 场', days(4, 14), 2, 10, 3)],
      ),
      ZhiyaActivity(
        id: 'act-110', orgId: 'org-3', orgName: '小天鹅艺术中心', category: 'exhibition', mode: 'offline',
        title: '美术馆儿童展览导览团', subtitle: '把看展变成一场寻宝', emoji: '🖼️',
        ageMin: 5, ageMax: 12, startTime: _nextWeekday(now, 6, 13, 0), endTime: _nextWeekday(now, 6, 15, 0),
        address: '北京市朝阳区今日美术馆 2 号馆', price: 49, originalPrice: 128, quota: 15, enrolled: 8,
        tags: ['art'], introduction: '专业儿童导览 + 寻宝任务卡 + 亲子共创。', notice: '门票自理（儿童免票）。',
        sessions: const [],
      ),
    ]);

    _packages.addAll([
      const ZhiyaPackage(
        id: 'pkg-201', title: '儿童科技探索体验包', emoji: '🚀',
        summary: '编程、机器人、科学实验、创意美术一次体验，找到孩子的兴趣方向。',
        price: 99, originalPrice: 399, purchasedCount: 326, activityIds: ['act-101', 'act-109', 'act-103', 'act-104'],
      ),
    ]);

    _goods.addAll([
      const ZhiyaGoods(id: 'goods-301', title: '家庭科学实验套装 · 100 个小实验', emoji: '🧫', category: 'science', price: 129, originalPrice: 199, summary: '与科学盒子实验课配套的家庭版材料盒。', sales: 1204),
      const ZhiyaGoods(id: 'goods-302', title: 'Scratch 少儿编程启蒙教材', emoji: '📗', category: 'books', price: 45, originalPrice: 59, summary: '编程体验课课后练习的官方配套教材。', sales: 862),
      const ZhiyaGoods(id: 'goods-303', title: '儿童绘画蜡笔 48 色', emoji: '🖍️', category: 'painting', price: 29.9, originalPrice: 49, summary: '创意美术课同款，可水洗不脏手。', sales: 2310),
      const ZhiyaGoods(id: 'goods-304', title: '入门机器人拼装套件', emoji: '🛠️', category: 'robotics', price: 199, originalPrice: 299, summary: '机器人体验课同款教具家庭版。', sales: 536),
    ]);

    _messages.add(
      ZhiyaMessage(
        id: 'msg-welcome', category: 'system', title: '欢迎来到知鸭',
        body: '知孩子，也知教育。先为孩子添加资料，再看看附近的体验课吧！',
        createdAt: now, read: false,
      ),
    );
  }

  bool get _isNewUser => _orders.every((order) => order.rawStatus != 'paid');

  // ── family (PRD §42) ────────────────────────────────────────────────────
  List<ZhiyaChild> listChildren() => List.unmodifiable(_children);

  ZhiyaChild addChild({required String nickname, required String birthDate, String stage = 'primary-low'}) {
    _childSeq += 1;
    final child = ZhiyaChild(
      id: 'child-$_childSeq',
      nickname: nickname,
      emoji: ['🐣', '🐰', '🦊', '🐼'][_childSeq % 4],
      birthDate: birthDate,
      stage: stage,
      interests: const [],
    );
    _children.add(child);
    return child;
  }

  void removeChild(String childId) {
    _children.removeWhere((child) => child.id == childId);
  }

  // ── activities (PRD §6–§8) ──────────────────────────────────────────────
  List<ZhiyaActivity> listActivities({
    String? category,
    String? mode,
    bool freeOnly = false,
    int? childAge,
    String? keyword,
  }) {
    final now = _now();
    return _activities
        .where((activity) => activity.endTime.isAfter(now))
        .where((activity) => category == null || activity.category == category)
        .where((activity) => mode == null || activity.mode == mode)
        .where((activity) => !freeOnly || activity.price == 0)
        .where((activity) => childAge == null || (activity.ageMin <= childAge && childAge <= activity.ageMax))
        .where((activity) {
      if (keyword == null || keyword.trim().isEmpty) {
        return true;
      }
      final needle = keyword.trim().toLowerCase();
      final haystack =
          '${activity.title} ${activity.subtitle} ${activity.orgName} ${activity.introduction} ${activity.tags.join(' ')}'
              .toLowerCase();
      return haystack.contains(needle);
    })
        .toList();
  }

  ZhiyaActivity? getActivity(String activityId) =>
      _activities.where((activity) => activity.id == activityId).firstOrNull;

  List<ZhiyaActivity> listHomeRecommendations() {
    final now = _now();
    final live = _activities.where((activity) => activity.endTime.isAfter(now)).toList()
      ..sort((left, right) {
        final heat =
            (right.enrolled / right.quota).compareTo(left.enrolled / left.quota);
        return heat != 0 ? heat : left.startTime.compareTo(right.startTime);
      });
    return live;
  }

  List<ZhiyaPackage> listHotPackages() => List.unmodifiable(_packages);

  /// 体验包权益视图 (PRD §12.4): per-activity booked state for one package order.
  List<PackageBenefitView> listPackageBenefits({required String orderId}) {
    final order = _orders.where((entry) => entry.id == orderId).firstOrNull;
    if (order == null || order.type != 'package') {
      throw RegistrationException('not-found', 'package order not found: $orderId');
    }
    final packageId = order.items.first.packageId ?? '';
    final pkg = _packages.where((entry) => entry.id == packageId).firstOrNull;
    if (pkg == null) {
      throw RegistrationException('not-found', 'package not found: $packageId');
    }
    return pkg.activityIds.map((activityId) {
      final activity = getActivity(activityId);
      final booking = _benefitBookings
          .where((entry) => entry.packageOrderId == orderId && entry.activityId == activityId && entry.status != 'cancelled')
          .firstOrNull;
      return PackageBenefitView(
        activityId: activityId,
        title: activity?.title ?? activityId,
        emoji: activity?.emoji ?? '📌',
        orgName: activity?.orgName ?? '',
        price: activity?.price ?? 0,
        booked: booking != null,
        voucherCode: booking?.voucherCode,
        checkInState: booking?.status == 'checked-in',
      );
    }).toList();
  }

  /// Book one benefit visit with PRD §9.2 checks; issues a voucher.
  BenefitBookingView bookPackageBenefit({
    required String orderId,
    required String activityId,
    required String sessionId,
    required String childId,
  }) {
    final order = _orders.where((entry) => entry.id == orderId).firstOrNull;
    if (order == null || order.type != 'package') {
      throw RegistrationException('not-found', 'package order not found: $orderId');
    }
    if (order.rawStatus != 'paid') {
      throw RegistrationException('not-open', 'package order not paid: $orderId');
    }
    final packageId = order.items.first.packageId ?? '';
    final pkg = _packages.where((entry) => entry.id == packageId).firstOrNull;
    if (pkg == null || !pkg.activityIds.contains(activityId)) {
      throw RegistrationException('not-in-package', 'activity not in package: $activityId');
    }
    final child = _children.where((entry) => entry.id == childId).firstOrNull;
    if (child == null) {
      throw RegistrationException('child-not-found', 'child not found: $childId');
    }
    final activity = getActivity(activityId);
    if (activity == null || !activity.endTime.isAfter(_now())) {
      throw RegistrationException('not-open', 'activity not available: $activityId');
    }
    final session = activity.sessions.where((entry) => entry.id == sessionId).firstOrNull;
    if (session == null) {
      throw RegistrationException('session-not-found', 'session not found: $sessionId');
    }
    if (session.enrolled >= session.quota) {
      throw RegistrationException('sold-out', 'session sold out: $sessionId');
    }
    final age = child.ageAt(_now());
    if (age < activity.ageMin || age > activity.ageMax) {
      throw RegistrationException('age-not-fit', 'age $age outside [${activity.ageMin}, ${activity.ageMax}]');
    }
    final duplicate = _benefitBookings.any(
      (booking) =>
          booking.packageOrderId == orderId && booking.activityId == activityId && booking.status != 'cancelled',
    );
    if (duplicate) {
      throw RegistrationException('duplicate', 'benefit already booked: $activityId');
    }
    final conflict = _benefitBookings.any((booking) {
      if (booking.childId != childId || booking.status == 'cancelled') {
        return false;
      }
      final other = getActivity(booking.activityId);
      final otherSession = other?.sessions.where((entry) => entry.id == booking.sessionId).firstOrNull;
      if (other == null || otherSession == null) {
        return false;
      }
      return session.start.isBefore(otherSession.end) && otherSession.start.isBefore(session.end);
    });
    if (conflict) {
      throw RegistrationException('time-conflict', 'time conflict for child $childId');
    }
    _bookingSeq += 1;
    final code = 'ZY${List.generate(6, (_) => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[_random.nextInt(31)]).join()}';
    final booking = BenefitBookingView(
      id: 'bkg-flutter-$_bookingSeq',
      packageOrderId: orderId,
      packageId: packageId,
      activityId: activityId,
      sessionId: sessionId,
      childId: childId,
      childName: child.nickname,
      voucherCode: code,
      status: 'booked',
      createdAt: _now(),
    );
    _benefitBookings.add(booking);
    _notify('registration', '权益预约成功', '「${activity.title}」已预约，凭证码 $code。');
    return booking;
  }

  ZhiyaPackage? getPackage(String packageId) =>
      _packages.where((entry) => entry.id == packageId).firstOrNull;

  /// Create a package order (PRD §12/§29); auto-applies the best
  /// package-scoped coupon, mock-pays immediately, and marks the coupon used.
  ZhiyaOrder createPackageOrder(String packageId) {
    final pkg = _packages.where((entry) => entry.id == packageId).firstOrNull;
    if (pkg == null) {
      throw RegistrationException('not-found', 'package not found: $packageId');
    }
    ZhiyaCoupon? best;
    for (final coupon in _coupons) {
      if (coupon.state != 'unused' ||
          coupon.scope != 'package' ||
          coupon.minSpend > pkg.price) {
        continue;
      }
      if (best == null || coupon.amountOff > best.amountOff) {
        best = coupon;
      }
    }
    final discount =
        best == null ? 0.0 : (best.amountOff > pkg.price ? pkg.price : best.amountOff);
    _orderSeq += 1;
    final order = ZhiyaOrder(
      id: 'ord-pkg-$_orderSeq',
      type: 'package',
      rawStatus: 'pending-payment',
      items: [
        ZhiyaOrderItem(
          title: pkg.title,
          emoji: pkg.emoji,
          activityId: null,
          sessionId: null,
          childName: null,
          price: pkg.price,
          packageId: pkg.id,
        ),
      ],
      amount: pkg.price,
      discount: discount,
      payable: pkg.price - discount,
      createdAt: _now(),
      checkInState: 'none',
      couponId: best?.id,
    );
    _orders.insert(0, order);
    _notify('registration', '体验包订单已创建', '「${pkg.title}」订单已创建，请尽快完成支付。');
    return payOrder(order.id, method: 'wechat');
  }

  List<ZhiyaGoods> listGoods({String? category}) =>
      _goods.where((goods) => category == null || goods.category == category).toList();

  // ── orders (PRD §9/§29) ─────────────────────────────────────────────────
  OrderStatus deriveStatus(ZhiyaOrder order) {
    if (order.rawStatus != 'paid') {
      return switch (order.rawStatus) {
        'pending-payment' => OrderStatus.pendingPayment,
        'cancelled' => OrderStatus.cancelled,
        _ => OrderStatus.refunded,
      };
    }
    if (order.reviewId != null) {
      return OrderStatus.completed;
    }
    if (order.type == 'package') {
      return OrderStatus.upcoming;
    }
    final activity = getActivity(order.items.first.activityId ?? '');
    if (activity == null) {
      return OrderStatus.upcoming;
    }
    final now = _now();
    if (order.orgCompleted || !activity.endTime.isAfter(now)) {
      return OrderStatus.pendingReview;
    }
    final session = activity.sessions
        .where((entry) => entry.id == order.items.first.sessionId)
        .firstOrNull;
    final start = session?.start ?? activity.startTime;
    if (order.checkInState == 'checked-in' || !start.isAfter(now)) {
      return OrderStatus.ongoing;
    }
    return OrderStatus.upcoming;
  }

  /// Create a registration order with the full PRD §9.2 checks.
  ZhiyaOrder createRegistrationOrder({
    required String activityId,
    required String sessionId,
    required String childId,
    String? couponId,
  }) {
    final activity = getActivity(activityId);
    if (activity == null) {
      throw RegistrationException('activity-not-found', 'activity not found: $activityId');
    }
    final session = activity.sessions.where((entry) => entry.id == sessionId).firstOrNull;
    if (session == null) {
      throw RegistrationException('session-not-found', 'session not found: $sessionId');
    }
    final child = _children.where((entry) => entry.id == childId).firstOrNull;
    if (child == null) {
      throw RegistrationException('child-not-found', 'child not found: $childId');
    }
    if (!activity.startTime.isAfter(_now())) {
      throw RegistrationException('not-open', 'activity not open: $activityId');
    }
    if (activity.enrolled >= activity.quota || session.enrolled >= session.quota) {
      throw RegistrationException('sold-out', 'sold out: $activityId');
    }
    final age = child.ageAt(_now());
    if (age < activity.ageMin || age > activity.ageMax) {
      throw RegistrationException('age-not-fit', 'age $age outside [${activity.ageMin}, ${activity.ageMax}]');
    }
    final duplicate = _orders.any(
      (order) =>
          order.type == 'activity' &&
          (order.rawStatus == 'paid' || order.rawStatus == 'pending-payment') &&
          order.items.any((item) => item.activityId == activityId),
    );
    if (duplicate) {
      throw RegistrationException('duplicate', 'duplicate registration: $activityId');
    }
    final conflict = _orders.any((order) {
      if (order.type != 'activity' || (order.rawStatus != 'paid' && order.rawStatus != 'pending-payment')) {
        return false;
      }
      return order.items.any((item) {
        final other = getActivity(item.activityId ?? '');
        final otherSession =
            other?.sessions.where((entry) => entry.id == item.sessionId).firstOrNull;
        if (other == null || otherSession == null) {
          return false;
        }
        return session.start.isBefore(otherSession.end) && otherSession.start.isBefore(session.end);
      });
    });
    if (conflict) {
      throw RegistrationException('time-conflict', 'time conflict for child $childId');
    }

    var discount = 0.0;
    if (couponId != null) {
      final coupon = _coupons.where((entry) => entry.id == couponId).firstOrNull;
      if (coupon == null ||
          coupon.state != 'unused' ||
          !(coupon.scope == 'platform' || (coupon.scope == 'org' && coupon.orgId == activity.orgId) || (coupon.scope == 'activity' && coupon.activityId == activityId)) ||
          coupon.minSpend > activity.price ||
          (coupon.templateId == 'tpl-newbie' && !_isNewUser)) {
        throw RegistrationException('coupon-invalid', 'coupon not applicable: $couponId');
      }
      discount = coupon.amountOff > activity.price ? activity.price : coupon.amountOff;
    }

    _orderSeq += 1;
    final code = 'ZY${String.fromCharCodes(List.generate(6, (_) => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.codeUnitAt(_random.nextInt(31))))}';
    final order = ZhiyaOrder(
      id: 'ord-flutter-$_orderSeq',
      type: 'activity',
      rawStatus: 'pending-payment',
      items: [
        ZhiyaOrderItem(
          title: activity.title,
          emoji: activity.emoji,
          activityId: activity.id,
          sessionId: session.id,
          childName: child.nickname,
          price: activity.price,
        ),
      ],
      amount: activity.price,
      discount: discount,
      payable: activity.price - discount,
      createdAt: _now(),
      checkInState: 'none',
      couponId: couponId,
      voucherCode: code,
    );
    _orders.insert(0, order);
    _notify('registration', '报名订单已创建', '「${activity.title}」订单已创建，请尽快完成支付。');
    return order;
  }

  /// Mock pay (PRD §9.1): flips to paid, bumps enrollment, issues the voucher.
  ZhiyaOrder payOrder(String orderId, {String method = 'wechat'}) {
    final order = _requireOrder(orderId);
    if (order.rawStatus != 'pending-payment') {
      throw RegistrationException('not-open', 'order not payable: $orderId');
    }
    final paid = order.copyWith(rawStatus: 'paid');
    _orders[_orders.indexOf(order)] = paid;
    // Coupon flips to used on payment (PRD §17 usage lifecycle).
    if (paid.couponId != null) {
      final couponIndex = _coupons.indexWhere((entry) => entry.id == paid.couponId);
      if (couponIndex >= 0) {
        final coupon = _coupons[couponIndex];
        _coupons[couponIndex] = ZhiyaCoupon(
          id: coupon.id,
          templateId: coupon.templateId,
          title: coupon.title,
          scope: coupon.scope,
          activityId: coupon.activityId,
          orgId: coupon.orgId,
          amountOff: coupon.amountOff,
          minSpend: coupon.minSpend,
          state: 'used',
        );
      }
    }
    final item = paid.items.first;
    final index = _activities.indexWhere((activity) => activity.id == item.activityId);
    if (index >= 0) {
      final activity = _activities[index];
      final sessionIndex = activity.sessions.indexWhere((entry) => entry.id == item.sessionId);
      if (sessionIndex >= 0) {
        final session = activity.sessions[sessionIndex];
        activity.sessions[sessionIndex] = ZhiyaSession(
          id: session.id, label: session.label, start: session.start, end: session.end,
          quota: session.quota, enrolled: session.enrolled + 1,
        );
      }
      _activities[index] = ZhiyaActivity(
        id: activity.id, orgId: activity.orgId, orgName: activity.orgName, category: activity.category,
        mode: activity.mode, title: activity.title, subtitle: activity.subtitle, emoji: activity.emoji,
        ageMin: activity.ageMin, ageMax: activity.ageMax, startTime: activity.startTime,
        endTime: activity.endTime, address: activity.address, price: activity.price,
        originalPrice: activity.originalPrice, quota: activity.quota, enrolled: activity.enrolled + 1,
        tags: activity.tags, introduction: activity.introduction, notice: activity.notice,
        sessions: activity.sessions,
      );
    }
    _notify('payment', '支付成功', '「${item.title}」报名成功，凭证码 ${paid.voucherCode}。');
    return paid;
  }

  /// Cancel a pending-payment order.
  ZhiyaOrder cancelOrder(String orderId) {
    final order = _requireOrder(orderId);
    if (order.rawStatus != 'pending-payment') {
      throw RegistrationException('not-open', 'order not cancellable: $orderId');
    }
    final cancelled = order.copyWith(rawStatus: 'cancelled');
    _orders[_orders.indexOf(order)] = cancelled;
    return cancelled;
  }

  /// Refund an unverified paid order (PRD §30 未核销退款).
  ZhiyaOrder refundOrder(String orderId) {
    final order = _requireOrder(orderId);
    if (order.rawStatus != 'paid' || order.checkInState == 'checked-in') {
      throw RegistrationException('not-open', 'order not refundable: $orderId');
    }
    final refunded = order.copyWith(rawStatus: 'refunded');
    _orders[_orders.indexOf(order)] = refunded;
    _notify('refund', '退款成功', '订单 ${order.id} 已退款，预计 1-3 个工作日到账。');
    return refunded;
  }

  /// Order + derived status view (PRD §29) for UI list consumers.
  List<OrderView> listOrders({String? status}) {
    final views = _orders
        .map((order) => OrderView(order: order, status: deriveStatus(order)))
        .toList();
    if (status == null || status == 'all') {
      return views;
    }
    return views.where((view) => view.status.token == status).toList();
  }

  OrderView? getOrder(String orderId) {
    final order = _orders.where((entry) => entry.id == orderId).firstOrNull;
    return order == null ? null : OrderView(order: order, status: deriveStatus(order));
  }

  ZhiyaOrder _requireOrder(String orderId) =>
      _orders.where((entry) => entry.id == orderId).firstOrNull ??
      (throw RegistrationException('not-found', 'order not found: $orderId'));

  // ── coupons (PRD §17) ───────────────────────────────────────────────────
  final List<Map<String, Object>> _couponTemplates = [
    {'id': 'tpl-newbie', 'title': '新人立减券', 'scope': 'platform', 'amountOff': 10.0, 'minSpend': 0.0, 'newbieOnly': true},
    {'id': 'tpl-org-1-20', 'title': '童程未来编程专享券', 'scope': 'org', 'orgId': 'org-1', 'amountOff': 20.0, 'minSpend': 0.0, 'newbieOnly': false},
    {'id': 'tpl-act-103-5', 'title': '火山实验课立减 5 元', 'scope': 'activity', 'activityId': 'act-103', 'amountOff': 5.0, 'minSpend': 0.0, 'newbieOnly': false},
  ];

  List<Map<String, Object>> listClaimableCoupons() => _couponTemplates
      .where((template) => !(template['newbieOnly'] as bool) || _isNewUser)
      .where((template) => !_coupons.any(
          (coupon) => coupon.templateId == template['id'] && coupon.state == 'unused'))
      .toList();

  /// My coupons, optionally filtered by state (`unused|used|expired`).
  List<ZhiyaCoupon> listMyCoupons({String? state}) {
    final coupons = List<ZhiyaCoupon>.unmodifiable(_coupons.reversed);
    if (state == null) {
      return coupons;
    }
    return coupons.where((coupon) => coupon.state == state).toList();
  }

  ZhiyaCoupon claimCoupon(String templateId) {
    final template = _couponTemplates.where((entry) => entry['id'] == templateId).firstOrNull;
    if (template == null) {
      throw RegistrationException('not-found', 'coupon template not found: $templateId');
    }
    final coupon = ZhiyaCoupon(
      id: 'cpn-${_coupons.length + 1}',
      templateId: templateId,
      title: template['title'] as String,
      scope: template['scope'] as String,
      activityId: template['activityId'] as String?,
      orgId: template['orgId'] as String?,
      amountOff: template['amountOff'] as double,
      minSpend: template['minSpend'] as double,
      state: 'unused',
    );
    _coupons.add(coupon);
    _notify('coupon', '优惠券到账', '「${coupon.title}」已放入你的卡包。');
    return coupon;
  }

  // ── reviews (PRD §21) ───────────────────────────────────────────────────
  ZhiyaReview submitReview({
    required String orderId,
    required int overall,
    required bool recommend,
    required String content,
    String authorName = '鸭家长',
  }) {
    final stored = _orders.where((entry) => entry.id == orderId).firstOrNull;
    if (stored == null || stored.rawStatus != 'paid' || stored.reviewId != null) {
      throw RegistrationException('not-reviewable', 'order not reviewable: $orderId');
    }
    final item = stored.items.first;
    final activity = getActivity(item.activityId ?? '');
    final ended = stored.orgCompleted || (activity != null && !activity.endTime.isAfter(_now()));
    if (!ended) {
      throw RegistrationException('not-finished', 'activity not finished: ${item.activityId}');
    }
    final review = ZhiyaReview(
      id: 'rev-${_reviews.length + 1}',
      orderId: orderId,
      activityId: item.activityId ?? '',
      authorName: authorName,
      overall: overall < 1 ? 1 : (overall > 5 ? 5 : overall),
      recommend: recommend,
      content: content,
    );
    _reviews.insert(0, review);
    _orders[_orders.indexOf(stored)] = stored.copyWith(reviewId: review.id);
    _notify('activity', '评价成功', '感谢你对「${item.title}」的评价！');
    return review;
  }

  List<ZhiyaReview> listReviewsByActivity(String activityId) =>
      _reviews.where((review) => review.activityId == activityId).toList();

  // ── messages (PRD §18) ──────────────────────────────────────────────────
  void _notify(String category, String title, String body) {
    _messages.insert(
      0,
      ZhiyaMessage(id: 'msg-${_messages.length + 1}', category: category, title: title, body: body, createdAt: _now(), read: false),
    );
  }

  List<ZhiyaMessage> listMessages({String? category}) => category == null
      ? List.unmodifiable(_messages)
      : _messages.where((message) => message.category == category).toList();

  void markAllMessagesRead() {
    for (var index = 0; index < _messages.length; index += 1) {
      final message = _messages[index];
      if (!message.read) {
        _messages[index] =
            ZhiyaMessage(id: message.id, category: message.category, title: message.title, body: message.body, createdAt: message.createdAt, read: true);
      }
    }
  }

  // ── 问知鸭 AI (PRD §14) ─────────────────────────────────────────────────
  AiReply aiAsk(String query) {
    final intent = recognizeActivityIntent(query);
    final now = _now();
    final candidates = _activities
        .where((activity) => activity.endTime.isAfter(now))
        .where((activity) => intent.age == null || (activity.ageMin <= intent.age! && intent.age! <= activity.ageMax))
        .where((activity) => intent.categories.isEmpty || intent.categories.contains(activity.category))
        .where((activity) => intent.tags.isEmpty || activity.tags.any(intent.tags.contains))
        .where((activity) => intent.mode == null || activity.mode == intent.mode)
        .where((activity) => !intent.freeOnly || activity.price == 0)
        .where((activity) {
      if (intent.time != 'weekend') {
        return true;
      }
      final starts = [activity.startTime, ...activity.sessions.map((session) => session.start)];
      return starts.any((start) => start.weekday == DateTime.saturday || start.weekday == DateTime.sunday);
    }).toList()
      ..sort((left, right) => (right.enrolled / right.quota).compareTo(left.enrolled / left.quota));

    if (intent.wantsPlan) {
      final plan = _buildPlan(candidates, (intent.budgetMax ?? 300).toDouble());
      if (plan != null) {
        var total = 0.0;
        for (final AiPlanWeek week in plan) {
          total += week.price;
        }
        final plannedActivities =
            plan.map((week) => getActivity(week.activityId)).whereType<ZhiyaActivity>().toList();
        return AiReply(
          messageKey: 'zhiya.ai.reply.plan',
          params: {'count': plan.length, 'budget': total},
          activities: plannedActivities,
          followUps: kFollowUps,
          plan: plan,
        );
      }
    }

    if (candidates.isNotEmpty) {
      return AiReply(
        messageKey: intent.isEmpty ? 'zhiya.ai.reply.found' : 'zhiya.ai.reply.recommend',
        params: {'count': candidates.length},
        activities: candidates.take(4).toList(),
        followUps: kFollowUps,
      );
    }

    return AiReply(
      messageKey: 'zhiya.ai.reply.fallback',
      params: {},
      activities: listHomeRecommendations().take(3).toList(),
      followUps: kFollowUps,
    );
  }

  List<AiPlanWeek>? _buildPlan(List<ZhiyaActivity> candidates, double budget) {
    final affordable =
        candidates.where((activity) => activity.price <= budget).toList();
    final chosen = <ZhiyaActivity>[];
    final usedCategories = <String>{};
    var total = 0.0;
    for (final activity in affordable) {
      if (chosen.length >= 4) {
        break;
      }
      if (usedCategories.contains(activity.category)) {
        continue;
      }
      if (total + activity.price > budget) {
        continue;
      }
      chosen.add(activity);
      usedCategories.add(activity.category);
      total += activity.price;
    }
    if (chosen.isEmpty) {
      return null;
    }
    return chosen
        .asMap()
        .entries
        .map((entry) => AiPlanWeek(weekIndex: entry.key + 1, activityId: entry.value.id, title: entry.value.title, price: entry.value.price))
        .toList();
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}

/// An order together with its derived, user-visible status (PRD §29).
class OrderView {
  const OrderView({required this.order, required this.status});

  final ZhiyaOrder order;
  final OrderStatus status;
}
