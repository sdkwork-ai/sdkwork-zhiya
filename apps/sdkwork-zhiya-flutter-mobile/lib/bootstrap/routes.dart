/// Named-route composition (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC): detail
/// screens map to the cross-surface route ids; tab roots render through the
/// shell's IndexedStack in `app.dart`.
library;

import 'package:flutter/material.dart';

import 'package:sdkwork_zhiya_flutter_mobile_activity/sdkwork_zhiya_flutter_mobile_activity.dart';
import 'package:sdkwork_zhiya_flutter_mobile_trade/sdkwork_zhiya_flutter_mobile_trade.dart';

Map<String, WidgetBuilder> zhiyaDetailRoutes() {
  return {
    'app.zhiya.activity.detail': (context) => const ActivityDetailScreen(),
    'app.zhiya.activity.register': (context) => const RegisterScreen(),
    'app.zhiya.activity.package': (context) => const PackageDetailScreen(),
    'app.zhiya.trade.orders': (context) => const OrdersScreen(),
    'app.zhiya.trade.review': (context) => const ReviewScreen(),
  };
}
