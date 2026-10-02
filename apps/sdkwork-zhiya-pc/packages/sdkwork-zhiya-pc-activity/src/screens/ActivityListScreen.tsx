import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import {
  ActivityCard,
  ScreenState,
  useAsyncData,
} from '@sdkwork/zhiya-pc-commons';
import {
  ACTIVITY_CATEGORIES,
  getZhiyaClient,
} from '@sdkwork/zhiya-pc-core';
import type { ActivityMode } from '@sdkwork/zhiya-pc-core';

import { cx } from '../utils/format.js';

/**
 * 活动中心 (PRD §7): 分类 tabs + 筛选 (线上线下/免费) + 活动卡片列表.
 */
export function ActivityListScreen() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [mode, setMode] = useState<ActivityMode | 'all'>('all');
  const [freeOnly, setFreeOnly] = useState(false);

  const activity = getZhiyaClient('activity');
  const activities = useAsyncData(
    () =>
      activity.listActivities({
        category: (category ?? undefined) as never,
        mode: mode === 'all' ? undefined : mode,
        freeOnly: freeOnly || undefined,
      }),
    [activity, category, mode, freeOnly],
  );

  const selectCategory = (next: string | null): void => {
    const params = new URLSearchParams(searchParams);
    if (next === null) {
      params.delete('category');
    } else {
      params.set('category', next);
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.activity.root.title')}</h1>
      </header>

      <div className="sticky top-0 z-10 space-y-2 bg-canvas pb-2 pt-1">
        <div className="flex gap-2 overflow-x-auto px-4" data-testid="category-tabs">
          <button
            type="button"
            onClick={() => {
              selectCategory(null);
            }}
            className={cx(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
              category === null ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
            )}
          >
            {t('zhiya.activity.filter.all')}
          </button>
          {ACTIVITY_CATEGORIES.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => {
                selectCategory(entry);
              }}
              className={cx(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
                category === entry ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
              )}
            >
              {t(`zhiya.commons.category.${entry}`)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 px-4 text-xs">
          {(
            [
              { value: 'all', label: t('zhiya.activity.filter.allModes') },
              { value: 'offline', label: t('zhiya.commons.mode.offline') },
              { value: 'online', label: t('zhiya.commons.mode.online') },
            ] as const
          ).map((entry) => (
            <button
              key={entry.value}
              type="button"
              onClick={() => {
                setMode(entry.value);
              }}
              className={cx(
                'rounded-full px-3 py-1.5 font-medium',
                mode === entry.value ? 'bg-brand-soft text-brand' : 'bg-panel text-muted border border-border-subtle',
              )}
            >
              {entry.label}
            </button>
          ))}
          <button
            type="button"
            data-testid="free-toggle"
            onClick={() => {
              setFreeOnly((value) => !value);
            }}
            className={cx(
              'ml-auto rounded-full px-3 py-1.5 font-medium',
              freeOnly ? 'bg-success/15 text-success' : 'bg-panel text-muted border border-border-subtle',
            )}
          >
            {t('zhiya.activity.filter.free')}
          </button>
        </div>
      </div>

      <ScreenState
        state={
          activities.state === 'loading'
            ? 'loading'
            : activities.state === 'error'
              ? 'error'
              : activities.data.length === 0
                ? 'empty'
                : 'success'
        }
        onRetry={() => undefined}
      >
        {activities.state === 'ready' ? (
          <div className="space-y-3 px-4 pt-2">
            {activities.data.map((item) => (
              <ActivityCard key={item.id} activity={item} />
            ))}
          </div>
        ) : null}
      </ScreenState>
    </div>
  );
}
