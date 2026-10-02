/**
 * Route composition (APP_H5 §2 `src/bootstrap/routes.ts`): capability
 * contributions → canonical route table → element map. The route-alignment
 * test asserts every identity in the table is mounted.
 */

import { lazy } from 'react';

import { composeZhiyaRouteTable } from '@sdkwork/zhiya-pc-core';
import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-pc-core';

import { homeRouteContributions } from '@sdkwork/zhiya-pc-home';
import { activityRouteContributions } from '@sdkwork/zhiya-pc-activity';
import { aiRouteContributions } from '@sdkwork/zhiya-pc-ai';
import { mallRouteContributions } from '@sdkwork/zhiya-pc-mall';
import { tradeRouteContributions } from '@sdkwork/zhiya-pc-trade';
import { profileRouteContributions } from '@sdkwork/zhiya-pc-profile';
import { adminRouteContributions } from '@sdkwork/zhiya-pc-admin-platform';
import { orgRouteContributions } from '@sdkwork/zhiya-pc-org';

export const zhiyaRouteTable: readonly ZhiyaRouteIdentity[] = composeZhiyaRouteTable([
  homeRouteContributions,
  activityRouteContributions,
  aiRouteContributions,
  mallRouteContributions,
  tradeRouteContributions,
  profileRouteContributions,
  orgRouteContributions,
  adminRouteContributions,
]);

export function listZhiyaRouteIdentities(): string[] {
  return zhiyaRouteTable.map((route) => route.id);
}

/** Route id → lazily loaded screen element (kept in sync with App.tsx). */
export const zhiyaRouteElements: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'app.zhiya.home.root': lazy(() =>
    import('@sdkwork/zhiya-pc-home').then((module) => ({ default: module.HomeScreen })),
  ),
  'app.zhiya.home.search': lazy(() =>
    import('@sdkwork/zhiya-pc-home').then((module) => ({ default: module.SearchScreen })),
  ),
  'app.zhiya.activity.root': lazy(() =>
    import('@sdkwork/zhiya-pc-activity').then((module) => ({ default: module.ActivityListScreen })),
  ),
  'app.zhiya.activity.detail': lazy(() =>
    import('@sdkwork/zhiya-pc-activity').then((module) => ({ default: module.ActivityDetailScreen })),
  ),
  'app.zhiya.activity.register': lazy(() =>
    import('@sdkwork/zhiya-pc-activity').then((module) => ({ default: module.RegisterScreen })),
  ),
  'app.zhiya.activity.pay': lazy(() =>
    import('@sdkwork/zhiya-pc-activity').then((module) => ({ default: module.PayScreen })),
  ),
  'app.zhiya.activity.success': lazy(() =>
    import('@sdkwork/zhiya-pc-activity').then((module) => ({ default: module.RegisterSuccessScreen })),
  ),
  'app.zhiya.activity.packages': lazy(() =>
    import('@sdkwork/zhiya-pc-activity').then((module) => ({ default: module.PackageListScreen })),
  ),
  'app.zhiya.activity.package': lazy(() =>
    import('@sdkwork/zhiya-pc-activity').then((module) => ({ default: module.PackageDetailScreen })),
  ),
  'app.zhiya.ai.root': lazy(() =>
    import('@sdkwork/zhiya-pc-ai').then((module) => ({ default: module.AiHomeScreen })),
  ),
  'app.zhiya.mall.root': lazy(() =>
    import('@sdkwork/zhiya-pc-mall').then((module) => ({ default: module.MallHomeScreen })),
  ),
  'app.zhiya.mall.goods': lazy(() =>
    import('@sdkwork/zhiya-pc-mall').then((module) => ({ default: module.GoodsDetailScreen })),
  ),
  'app.zhiya.trade.orders': lazy(() =>
    import('@sdkwork/zhiya-pc-trade').then((module) => ({ default: module.OrderListScreen })),
  ),
  'app.zhiya.trade.order-detail': lazy(() =>
    import('@sdkwork/zhiya-pc-trade').then((module) => ({ default: module.OrderDetailScreen })),
  ),
  'app.zhiya.trade.review': lazy(() =>
    import('@sdkwork/zhiya-pc-trade').then((module) => ({ default: module.ReviewScreen })),
  ),
  'app.zhiya.profile.root': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.ProfileHomeScreen })),
  ),
  'app.zhiya.profile.login': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.LoginScreen })),
  ),
  'app.zhiya.profile.family': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.FamilyScreen })),
  ),
  'app.zhiya.profile.child-new': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.ChildEditScreen })),
  ),
  'app.zhiya.profile.child-edit': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.ChildEditScreen })),
  ),
  'app.zhiya.profile.activities': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.MyActivitiesScreen })),
  ),
  'app.zhiya.profile.coupons': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.CouponsScreen })),
  ),
  'app.zhiya.profile.favorites': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.FavoritesScreen })),
  ),
  'app.zhiya.profile.messages': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.MessagesScreen })),
  ),
  'app.zhiya.profile.settings': lazy(() =>
    import('@sdkwork/zhiya-pc-profile').then((module) => ({ default: module.SettingsScreen })),
  ),
  'app.zhiya.org.workspace': lazy(() =>
    import('@sdkwork/zhiya-pc-org').then((module) => ({ default: module.OrgWorkspaceScreen })),
  ),
  'app.zhiya.org.activities': lazy(() =>
    import('@sdkwork/zhiya-pc-org').then((module) => ({ default: module.OrgActivitiesScreen })),
  ),
  'app.zhiya.org.activity-edit': lazy(() =>
    import('@sdkwork/zhiya-pc-org').then((module) => ({ default: module.OrgActivityEditScreen })),
  ),
  'app.zhiya.org.registrations': lazy(() =>
    import('@sdkwork/zhiya-pc-org').then((module) => ({ default: module.OrgRegistrationsScreen })),
  ),
  'app.zhiya.admin.dashboard': lazy(() =>
    import('@sdkwork/zhiya-pc-admin-platform').then((module) => ({ default: module.AdminDashboardScreen })),
  ),
};
