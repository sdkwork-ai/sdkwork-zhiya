/// Cross-surface route identity table (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC
/// + APP_FLUTTER_UI_SPEC): route ids are the alignment key shared by H5, PC,
/// and the mini-program surface — pinned by `test/route_alignment_test.dart`.
library;

/// Route identity: `<surface>.<domain>.<capability>.<screen>`.
class ZhiyaRouteIdentity {
  const ZhiyaRouteIdentity({
    required this.id,
    required this.path,
    required this.titleKey,
    required this.capability,
    required this.tab,
  });

  final String id;
  final String path;
  final String titleKey;
  final String capability;
  /// Tab token (`home|activity|ai|mall|profile`) or `null` for detail routes.
  final String? tab;
}

const List<ZhiyaRouteIdentity> kHomeRoutes = [
  ZhiyaRouteIdentity(id: 'app.zhiya.home.root', path: '/home', titleKey: 'zhiya.home.root.title', capability: 'home', tab: 'home'),
  ZhiyaRouteIdentity(id: 'app.zhiya.home.search', path: '/home/search', titleKey: 'zhiya.home.search.title', capability: 'home', tab: null),
];

const List<ZhiyaRouteIdentity> kActivityRoutes = [
  ZhiyaRouteIdentity(id: 'app.zhiya.activity.root', path: '/activity', titleKey: 'zhiya.activity.root.title', capability: 'activity', tab: 'activity'),
  ZhiyaRouteIdentity(id: 'app.zhiya.activity.detail', path: '/activity/detail/:activityId', titleKey: 'zhiya.activity.detail.title', capability: 'activity', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.activity.register', path: '/activity/register/:activityId', titleKey: 'zhiya.activity.register.title', capability: 'activity', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.activity.pay', path: '/activity/pay/:orderId', titleKey: 'zhiya.activity.pay.title', capability: 'activity', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.activity.success', path: '/activity/success/:orderId', titleKey: 'zhiya.activity.success.title', capability: 'activity', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.activity.packages', path: '/activity/packages', titleKey: 'zhiya.activity.packages.title', capability: 'activity', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.activity.package', path: '/activity/package/:packageId', titleKey: 'zhiya.activity.package.title', capability: 'activity', tab: null),
];

const List<ZhiyaRouteIdentity> kAiRoutes = [
  ZhiyaRouteIdentity(id: 'app.zhiya.ai.root', path: '/ai', titleKey: 'zhiya.ai.root.title', capability: 'ai', tab: 'ai'),
];

const List<ZhiyaRouteIdentity> kMallRoutes = [
  ZhiyaRouteIdentity(id: 'app.zhiya.mall.root', path: '/mall', titleKey: 'zhiya.mall.root.title', capability: 'mall', tab: 'mall'),
  ZhiyaRouteIdentity(id: 'app.zhiya.mall.goods', path: '/mall/goods/:goodsId', titleKey: 'zhiya.mall.goods.title', capability: 'mall', tab: null),
];

const List<ZhiyaRouteIdentity> kTradeRoutes = [
  ZhiyaRouteIdentity(id: 'app.zhiya.trade.orders', path: '/trade/orders', titleKey: 'zhiya.trade.orders.title', capability: 'trade', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.trade.order-detail', path: '/trade/orders/:orderId', titleKey: 'zhiya.trade.detail.title', capability: 'trade', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.trade.review', path: '/trade/orders/:orderId/review', titleKey: 'zhiya.trade.review.title', capability: 'trade', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.trade.benefits', path: '/trade/orders/:orderId/benefits', titleKey: 'zhiya.trade.benefits.title', capability: 'trade', tab: null),
];

const List<ZhiyaRouteIdentity> kProfileRoutes = [
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.root', path: '/profile', titleKey: 'zhiya.profile.root.title', capability: 'profile', tab: 'profile'),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.login', path: '/profile/login', titleKey: 'zhiya.profile.login.title', capability: 'profile', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.family', path: '/profile/family', titleKey: 'zhiya.profile.family.title', capability: 'profile', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.child-new', path: '/profile/child/new', titleKey: 'zhiya.profile.child-new.title', capability: 'profile', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.child-edit', path: '/profile/child/:childId', titleKey: 'zhiya.profile.child-edit.title', capability: 'profile', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.activities', path: '/profile/activities', titleKey: 'zhiya.profile.activities.title', capability: 'profile', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.coupons', path: '/profile/coupons', titleKey: 'zhiya.profile.coupons.title', capability: 'profile', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.favorites', path: '/profile/favorites', titleKey: 'zhiya.profile.favorites.title', capability: 'profile', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.messages', path: '/profile/messages', titleKey: 'zhiya.profile.messages.title', capability: 'profile', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.profile.settings', path: '/profile/settings', titleKey: 'zhiya.profile.settings.title', capability: 'profile', tab: null),
];

const List<ZhiyaRouteIdentity> kOrgRoutes = [
  ZhiyaRouteIdentity(id: 'app.zhiya.org.workspace', path: '/org/workspace', titleKey: 'zhiya.org.workspace.title', capability: 'org', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.org.activities', path: '/org/activities', titleKey: 'zhiya.org.activities.title', capability: 'org', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.org.activity-edit', path: '/org/activities/:activityId', titleKey: 'zhiya.org.activity-edit.title', capability: 'org', tab: null),
  ZhiyaRouteIdentity(id: 'app.zhiya.org.registrations', path: '/org/registrations', titleKey: 'zhiya.org.registrations.title', capability: 'org', tab: null),
];

/// Full route table, tab roots first (PRD §5 order).
final List<ZhiyaRouteIdentity> kZhiyaRouteTable = [
  ...kHomeRoutes,
  ...kActivityRoutes,
  ...kAiRoutes,
  ...kMallRoutes,
  ...kTradeRoutes,
  ...kProfileRoutes,
  ...kOrgRoutes,
];

/// The five cross-surface tab roots (PRD §5).
final List<ZhiyaRouteIdentity> kTabRootRoutes = [
  kHomeRoutes[0],
  kActivityRoutes[0],
  kAiRoutes[0],
  kMallRoutes[0],
  kProfileRoutes[0],
];

/// Cross-surface alignment pins (mirrored in the H5/PC/mini-program tests).
const List<String> kCrossSurfaceRouteIds = [
  'app.zhiya.home.root',
  'app.zhiya.home.search',
  'app.zhiya.activity.root',
  'app.zhiya.activity.detail',
  'app.zhiya.activity.register',
  'app.zhiya.activity.pay',
  'app.zhiya.activity.success',
  'app.zhiya.activity.packages',
  'app.zhiya.activity.package',
  'app.zhiya.ai.root',
  'app.zhiya.mall.root',
  'app.zhiya.mall.goods',
  'app.zhiya.trade.orders',
  'app.zhiya.trade.order-detail',
  'app.zhiya.trade.review',
  'app.zhiya.trade.benefits',
  'app.zhiya.profile.root',
  'app.zhiya.profile.login',
  'app.zhiya.profile.family',
  'app.zhiya.profile.child-new',
  'app.zhiya.profile.child-edit',
  'app.zhiya.profile.activities',
  'app.zhiya.profile.coupons',
  'app.zhiya.profile.favorites',
  'app.zhiya.profile.messages',
  'app.zhiya.profile.settings',
  'app.zhiya.org.workspace',
  'app.zhiya.org.activities',
  'app.zhiya.org.activity-edit',
  'app.zhiya.org.registrations',
];

/// All route ids in table order.
List<String> listZhiyaRouteIdentities() => kZhiyaRouteTable.map((route) => route.id).toList();
