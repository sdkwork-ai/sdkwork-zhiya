import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, MapPin, Wifi } from 'lucide-react';

import type { Activity } from '@sdkwork/zhiya-h5-core';

import { Price } from './Price.js';
import { cx, formatCount, formatDateTime, formatTimeRange } from '../utils/format.js';

export interface ActivityCardProps {
  activity: Activity;
  favorited?: boolean | undefined;
  onToggleFavorite?: ((activityId: string) => void) | undefined;
}

/**
 * 活动卡片 (PRD §7.3): cover, title, type, org, time, place, age, price,
 * remaining quota, tags, favorite state.
 */
export function ActivityCard({ activity, favorited, onToggleFavorite }: ActivityCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const remaining = Math.max(activity.quota - activity.enrolled, 0);
  return (
    <div
      data-testid={`activity-card-${activity.id}`}
      className="relative cursor-pointer overflow-hidden rounded-2xl border border-border-subtle bg-panel shadow-[var(--shadow-card)] transition-opacity hover:opacity-95"
      onClick={() => {
        navigate(`/activity/detail/${activity.id}`);
      }}
    >
      <div className="flex items-center justify-center bg-brand-soft py-7 text-4xl" aria-hidden="true">
        {activity.emoji}
      </div>
      {onToggleFavorite !== undefined ? (
        <button
          type="button"
          aria-label={t('zhiya.commons.action.favorite')}
          data-testid={`favorite-${activity.id}`}
          className="absolute top-2 right-2 rounded-full bg-panel/90 p-1.5"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(activity.id);
          }}
        >
          <Heart
            aria-hidden="true"
            className={cx('h-4 w-4', favorited === true ? 'fill-danger text-danger' : 'text-muted')}
          />
        </button>
      ) : null}
      <div className="space-y-1.5 px-3 pt-2.5 pb-3">
        <p className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold text-primary">{activity.title}</p>
        <div className="flex items-center gap-1 text-xs text-secondary">
          <span>{t(`zhiya.commons.category.${activity.category}`)}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{activity.orgName}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          {activity.mode === 'online' ? (
            <Wifi aria-hidden="true" className="h-3 w-3" />
          ) : (
            <MapPin aria-hidden="true" className="h-3 w-3" />
          )}
          <span className="truncate">
            {activity.mode === 'online'
              ? t('zhiya.commons.mode.online')
              : activity.address}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary">
            {formatDateTime(activity.startTime)} {formatTimeRange(activity.startTime, activity.endTime).split(' - ')[0]}
          </span>
          <span className={remaining === 0 ? 'text-danger' : 'text-muted'}>
            {remaining === 0
              ? t('zhiya.commons.quota.full')
              : t('zhiya.commons.quota.remaining', { count: remaining })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Price value={activity.price} originalValue={activity.originalPrice} size="md" />
          <span className="flex items-center gap-1 text-xs text-muted">
            <Users aria-hidden="true" className="h-3 w-3" />
            {activity.ageMin}-{activity.ageMax}
            {t('zhiya.commons.age.unit')}
            {activity.enrolled > 0 ? ` · ${formatCount(activity.enrolled)}${t('zhiya.commons.quota.enrolledSuffix')}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
