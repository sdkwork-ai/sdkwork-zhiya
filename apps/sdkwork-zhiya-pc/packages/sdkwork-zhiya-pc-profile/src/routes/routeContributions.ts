import { defineZhiyaRoutes } from '@sdkwork/zhiya-pc-core';

import type { ZhiyaRouteIdentity } from '@sdkwork/zhiya-pc-core';

/** Route contributions of the profile capability (PRD §20): 我的 tab + sub-screens. */
export const profileRouteContributions = defineZhiyaRoutes([
  { id: 'app.zhiya.profile.root', path: '/profile', titleKey: 'zhiya.profile.root.title', capability: 'profile', tab: 'profile' },
  { id: 'app.zhiya.profile.login', path: '/profile/login', titleKey: 'zhiya.profile.login.title', capability: 'profile', tab: null },
  { id: 'app.zhiya.profile.family', path: '/profile/family', titleKey: 'zhiya.profile.family.title', capability: 'profile', tab: null },
  { id: 'app.zhiya.profile.child-new', path: '/profile/child/new', titleKey: 'zhiya.profile.child-new.title', capability: 'profile', tab: null },
  { id: 'app.zhiya.profile.child-edit', path: '/profile/child/:childId', titleKey: 'zhiya.profile.child-edit.title', capability: 'profile', tab: null },
  { id: 'app.zhiya.profile.activities', path: '/profile/activities', titleKey: 'zhiya.profile.activities.title', capability: 'profile', tab: null },
  { id: 'app.zhiya.profile.coupons', path: '/profile/coupons', titleKey: 'zhiya.profile.coupons.title', capability: 'profile', tab: null },
  { id: 'app.zhiya.profile.favorites', path: '/profile/favorites', titleKey: 'zhiya.profile.favorites.title', capability: 'profile', tab: null },
  { id: 'app.zhiya.profile.messages', path: '/profile/messages', titleKey: 'zhiya.profile.messages.title', capability: 'profile', tab: null },
  { id: 'app.zhiya.profile.settings', path: '/profile/settings', titleKey: 'zhiya.profile.settings.title', capability: 'profile', tab: null },
] satisfies readonly ZhiyaRouteIdentity[]);
