import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bell, Bird, Search } from 'lucide-react';

import {
  ActivityCard,
  PackageCard,
  ScreenState,
  SectionHeader,
  useAsyncData,
} from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient, useTabBadgeStore } from '@sdkwork/zhiya-pc-core';

const QUICK_ENTRIES: readonly { category: string | null; labelKey: string; emoji: string }[] = [
  { category: 'trial', labelKey: 'zhiya.home.quick.trial', emoji: '🎯' },
  { category: null, labelKey: 'zhiya.home.quick.packages', emoji: '🎁' },
  { category: 'parent-child', labelKey: 'zhiya.home.quick.parentChild', emoji: '👨‍👩‍👧' },
  { category: 'study-tour', labelKey: 'zhiya.home.quick.studyTour', emoji: '🚌' },
  { category: 'online-course', labelKey: 'zhiya.home.quick.online', emoji: '💻' },
  { category: 'competition', labelKey: 'zhiya.home.quick.competition', emoji: '🏆' },
];

/**
 * 首页 (PRD §6/§45): 城市/搜索/消息 header, 问问知鸭 AI entry, 快捷入口,
 * 附近热门活动, 热门体验包.
 */
export function HomeScreen() {
  const { t } = useTranslation();
  const activity = getZhiyaClient('activity');
  const pkg = getZhiyaClient('package');
  const unreadMessages = useTabBadgeStore((state) => state.unreadMessages);

  const recommended = useAsyncData(() => activity.listHomeRecommendations(), [activity]);
  const hotPackages = useAsyncData(() => pkg.listHotPackages(), [pkg]);

  const state =
    recommended.state === 'error' || hotPackages.state === 'error'
      ? ('error' as const)
      : recommended.state === 'loading' || hotPackages.state === 'loading'
        ? ('loading' as const)
        : ('success' as const);

  return (
    <div className="pb-6">
      <header className="flex items-center gap-3 px-4 pt-4 pb-1">
        <span className="flex items-center gap-1 text-sm font-semibold text-primary">
          <span aria-hidden="true">📍</span>
          {t('zhiya.home.city')}
        </span>
        <Link
          to="/home/search"
          aria-label={t('zhiya.home.search.title')}
          className="flex flex-1 items-center gap-2 rounded-full border border-border-default bg-panel px-3 py-2 text-sm text-muted"
        >
          <Search aria-hidden="true" className="h-4 w-4" />
          <span className="truncate">{t('zhiya.home.searchPlaceholder')}</span>
        </Link>
        <Link to="/profile/messages" aria-label={t('zhiya.home.messages')} className="relative p-1">
          <Bell aria-hidden="true" className="h-5 w-5 text-secondary" />
          {unreadMessages > 0 ? (
            <span
              data-testid="home-unread-badge"
              className="absolute -top-0.5 -right-0.5 min-w-4 rounded-full bg-danger px-1 text-center text-[0.625rem] leading-4 font-semibold text-white"
            >
              {unreadMessages > 99 ? '99+' : unreadMessages}
            </span>
          ) : null}
        </Link>
      </header>

      <div className="px-4 pt-3">
        <Link
          to="/ai"
          data-testid="ai-entry"
          className="flex items-center gap-3 rounded-2xl bg-brand-soft px-4 py-3 transition-opacity hover:opacity-90"
        >
          <Bird aria-hidden="true" className="h-7 w-7 text-brand" />
          <span className="flex-1">
            <span className="block text-sm font-semibold text-primary">{t('zhiya.home.ai.title')}</span>
            <span className="block truncate text-xs text-secondary">
              {t('zhiya.home.ai.subtitle')}
            </span>
          </span>
          <span aria-hidden="true" className="text-muted">›</span>
        </Link>
      </div>

      <nav aria-label={t('zhiya.home.quick.label')} className="grid grid-cols-6 gap-1 px-4 pt-4">
        {QUICK_ENTRIES.map((entry) => (
          <Link
            key={entry.labelKey}
            to={entry.category === null ? '/activity/packages' : `/activity?category=${entry.category}`}
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs text-secondary hover:bg-panel-muted"
          >
            <span aria-hidden="true" className="text-xl">{entry.emoji}</span>
            {t(entry.labelKey)}
          </Link>
        ))}
      </nav>

      <ScreenState state={state} onRetry={() => undefined}>
        {recommended.state === 'ready' ? (
          <>
            <SectionHeader
              title={t('zhiya.home.nearbyActivities')}
              action={
                <Link to="/activity" className="text-xs text-brand">
                  {t('zhiya.home.more')}
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-3 px-4">
              {recommended.data.slice(0, 6).map((item) => (
                <ActivityCard key={item.id} activity={item} />
              ))}
            </div>
          </>
        ) : null}

        {hotPackages.state === 'ready' && hotPackages.data.length > 0 ? (
          <>
            <SectionHeader title={t('zhiya.home.hotPackages')} />
            <div className="flex gap-3 overflow-x-auto px-4 pb-2">
              {hotPackages.data.map((item) => (
                <PackageCard key={item.id} pkg={item} />
              ))}
            </div>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}
