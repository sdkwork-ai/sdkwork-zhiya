/// Domain model of the Zhiya Flutter surface. Shapes mirror the shared
/// TypeScript contracts in `@sdkwork/zhiya-service-core` (PRD §39–§42) and
/// are pinned by the route-alignment/order-flow tests — Dart cannot import
/// TS, so this file is the declared cross-surface mirror.
library;

/// One bookable occurrence of an activity (PRD §9.1 场次).
class ZhiyaSession {
  const ZhiyaSession({
    required this.id,
    required this.label,
    required this.start,
    required this.end,
    required this.quota,
    required this.enrolled,
  });

  final String id;
  final String label;
  final DateTime start;
  final DateTime end;
  final int quota;
  final int enrolled;

  int get remaining => quota - enrolled < 0 ? 0 : quota - enrolled;
}

/// Education activity (PRD §8, §40).
class ZhiyaActivity {
  const ZhiyaActivity({
    required this.id,
    required this.orgId,
    required this.orgName,
    required this.category,
    required this.mode,
    required this.title,
    required this.subtitle,
    required this.emoji,
    required this.ageMin,
    required this.ageMax,
    required this.startTime,
    required this.endTime,
    required this.address,
    required this.price,
    required this.originalPrice,
    required this.quota,
    required this.enrolled,
    required this.tags,
    required this.introduction,
    required this.notice,
    required this.sessions,
  });

  final String id;
  final String orgId;
  final String orgName;
  /// Category token from the shared vocabulary (PRD §7.1), e.g. `trial`.
  final String category;
  /// `offline` or `online`.
  final String mode;
  final String title;
  final String subtitle;
  final String emoji;
  final int ageMin;
  final int ageMax;
  final DateTime startTime;
  final DateTime endTime;
  final String address;
  final double price;
  final double originalPrice;
  final int quota;
  final int enrolled;
  final List<String> tags;
  final String introduction;
  final String notice;
  final List<ZhiyaSession> sessions;

  int get remaining => quota - enrolled < 0 ? 0 : quota - enrolled;
}

/// Multi-org trial experience package (PRD §12.2/§41).
class ZhiyaPackage {
  const ZhiyaPackage({
    required this.id,
    required this.title,
    required this.emoji,
    required this.summary,
    required this.price,
    required this.originalPrice,
    required this.purchasedCount,
    required this.activityIds,
  });

  final String id;
  final String title;
  final String emoji;
  final String summary;
  final double price;
  final double originalPrice;
  final int purchasedCount;
  final List<String> activityIds;
}

/// Mall goods item (PRD §16).
class ZhiyaGoods {
  const ZhiyaGoods({
    required this.id,
    required this.title,
    required this.emoji,
    required this.category,
    required this.price,
    required this.originalPrice,
    required this.summary,
    required this.sales,
  });

  final String id;
  final String title;
  final String emoji;
  final String category;
  final double price;
  final double originalPrice;
  final String summary;
  final int sales;
}

/// Child family member (PRD §3.2, §42).
class ZhiyaChild {
  const ZhiyaChild({
    required this.id,
    required this.nickname,
    required this.emoji,
    required this.birthDate,
    required this.stage,
    required this.interests,
  });

  final String id;
  final String nickname;
  final String emoji;
  /// ISO date `yyyy-MM-dd`.
  final String birthDate;
  /// Stage token (PRD §3.2), e.g. `primary-low`.
  final String stage;
  final List<String> interests;

  /// Whole-year age at [at].
  int ageAt(DateTime at) {
    final birth = DateTime.parse(birthDate);
    var age = at.year - birth.year;
    final beforeBirthday =
        at.month < birth.month || (at.month == birth.month && at.day < birth.day);
    if (beforeBirthday) {
      age -= 1;
    }
    return age < 0 ? 0 : age;
  }
}

/// Claimed coupon (PRD §17).
class ZhiyaCoupon {
  const ZhiyaCoupon({
    required this.id,
    required this.templateId,
    required this.title,
    required this.scope,
    required this.activityId,
    required this.orgId,
    required this.amountOff,
    required this.minSpend,
    required this.state,
  });

  final String id;
  final String templateId;
  final String title;
  /// `platform | org | activity | package`.
  final String scope;
  final String? activityId;
  final String? orgId;
  final double amountOff;
  final double minSpend;
  /// `unused | used | expired`.
  final String state;
}

/// One order line (PRD §29).
class ZhiyaOrderItem {
  const ZhiyaOrderItem({
    required this.title,
    required this.emoji,
    required this.activityId,
    required this.sessionId,
    required this.childName,
    required this.price,
    this.packageId,
  });

  final String title;
  final String emoji;
  final String? activityId;
  final String? sessionId;
  final String? childName;
  final double price;
  /// Set for package orders (PRD §12).
  final String? packageId;
}

/// Derived, user-visible order status (PRD §29).
enum OrderStatus {
  pendingPayment,
  upcoming,
  ongoing,
  pendingReview,
  completed,
  cancelled,
  refunded;

  String get token => switch (this) {
        OrderStatus.pendingPayment => 'pending-payment',
        OrderStatus.upcoming => 'upcoming',
        OrderStatus.ongoing => 'ongoing',
        OrderStatus.pendingReview => 'pending-review',
        OrderStatus.completed => 'completed',
        OrderStatus.cancelled => 'cancelled',
        OrderStatus.refunded => 'refunded',
      };

  String get zhLabel => switch (this) {
        OrderStatus.pendingPayment => '待支付',
        OrderStatus.upcoming => '待参加',
        OrderStatus.ongoing => '进行中',
        OrderStatus.pendingReview => '待评价',
        OrderStatus.completed => '已完成',
        OrderStatus.cancelled => '已取消',
        OrderStatus.refunded => '已退款',
      };
}

/// Unified order (PRD §29). [status] carries the derived view status.
class ZhiyaOrder {
  const ZhiyaOrder({
    required this.id,
    required this.type,
    required this.rawStatus,
    required this.items,
    required this.amount,
    required this.discount,
    required this.payable,
    required this.createdAt,
    required this.checkInState,
    this.couponId,
    this.voucherCode,
    this.reviewId,
    this.orgCompleted = false,
  });

  final String id;
  /// `activity | package`.
  final String type;
  /// Stored status: `pending-payment | paid | cancelled | refunded`.
  final String rawStatus;
  final List<ZhiyaOrderItem> items;
  final double amount;
  final double discount;
  final double payable;
  final DateTime createdAt;
  /// `none | checked-in` (PRD §11 核销状态).
  final String checkInState;
  final String? couponId;
  final String? voucherCode;
  final String? reviewId;
  final bool orgCompleted;

  ZhiyaOrder copyWith({String? rawStatus, String? checkInState, String? reviewId, bool? orgCompleted}) {
    final self = this;
    return ZhiyaOrder(
      id: id,
      type: type,
      rawStatus: rawStatus ?? self.rawStatus,
      items: items,
      amount: amount,
      discount: discount,
      payable: payable,
      createdAt: createdAt,
      checkInState: checkInState ?? self.checkInState,
      couponId: couponId,
      voucherCode: voucherCode ?? self.voucherCode,
      reviewId: reviewId ?? self.reviewId,
      orgCompleted: orgCompleted ?? self.orgCompleted,
    );
  }
}

/// 体验包权益预约 (PRD §12.4/§38.2): one booking consumes one benefit visit.
class BenefitBookingView {
  const BenefitBookingView({
    required this.id,
    required this.packageOrderId,
    required this.packageId,
    required this.activityId,
    required this.sessionId,
    required this.childId,
    required this.childName,
    required this.voucherCode,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String packageOrderId;
  final String packageId;
  final String activityId;
  final String sessionId;
  final String childId;
  final String childName;
  final String voucherCode;
  /// `booked | checked-in | cancelled`.
  final String status;
  final DateTime createdAt;

  BenefitBookingView copyWith({String? status}) {
    return BenefitBookingView(
      id: id,
      packageOrderId: packageOrderId,
      packageId: packageId,
      activityId: activityId,
      sessionId: sessionId,
      childId: childId,
      childName: childName,
      voucherCode: voucherCode,
      status: status ?? this.status,
      createdAt: createdAt,
    );
  }
}

/// Per-activity benefit state for one package order.
class PackageBenefitView {
  const PackageBenefitView({
    required this.activityId,
    required this.title,
    required this.emoji,
    required this.orgName,
    required this.price,
    required this.booked,
    this.voucherCode,
    this.checkInState = false,
  });

  final String activityId;
  final String title;
  final String emoji;
  final String orgName;
  final double price;
  final bool booked;
  final String? voucherCode;
  final bool checkInState;
}

/// Activity review (PRD §21).
class ZhiyaReview {
  const ZhiyaReview({
    required this.id,
    required this.orderId,
    required this.activityId,
    required this.authorName,
    required this.overall,
    required this.recommend,
    required this.content,
  });

  final String id;
  final String orderId;
  final String activityId;
  final String authorName;
  final int overall;
  final bool recommend;
  final String content;
}

/// Message-center entry (PRD §18).
class ZhiyaMessage {
  const ZhiyaMessage({
    required this.id,
    required this.category,
    required this.title,
    required this.body,
    required this.createdAt,
    required this.read,
  });

  final String id;
  final String category;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool read;
}

/// Weekly plan entry of an AI experience plan (PRD §14.2).
class AiPlanWeek {
  const AiPlanWeek({required this.weekIndex, required this.activityId, required this.title, required this.price});

  final int weekIndex;
  final String activityId;
  final String title;
  final double price;
}

/// 问知鸭 structured reply (PRD §14): i18n `messageKey` + real activities.
class AiReply {
  const AiReply({
    required this.messageKey,
    required this.params,
    required this.activities,
    required this.followUps,
    this.plan,
  });

  final String messageKey;
  final Map<String, Object> params;
  final List<ZhiyaActivity> activities;
  final List<String> followUps;
  final List<AiPlanWeek>? plan;
}

/// Recommended activity + price entry used by plan builders.
ActivityRating? activityRatingOf(List<ZhiyaReview> reviews, String activityId) {
  final own = reviews.where((review) => review.activityId == activityId).toList();
  if (own.isEmpty) {
    return null;
  }
  final avg = own.map((review) => review.overall).reduce((a, b) => a + b) / own.length;
  return ActivityRating(average: avg, count: own.length);
}

class ActivityRating {
  const ActivityRating({required this.average, required this.count});

  final double average;
  final int count;
}
