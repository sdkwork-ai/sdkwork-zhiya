import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Clock, MapPin, Share2, Heart, MessageCircle, Wifi, Users } from 'lucide-react';

import {
  Avatar,
  Card,
  Price,
  ScreenState,
  SectionHeader,
  useAsyncData,
} from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-h5-core';
import type { Activity, Org, Review } from '@sdkwork/zhiya-h5-core';

interface DetailData {
  activity: Activity | null;
  favorited: boolean;
  reviews: Review[];
  org: Org | null;
}

/**
 * 活动详情 (PRD §8): 基础信息, 活动内容, 机构信息, 用户评价, 底部操作
 * (收藏 / 分享 / 联系机构 / 立即报名).
 */
export function ActivityDetailScreen() {
  const { activityId = '' } = useParams<{ activityId: string }>();

  const activityClient = getZhiyaClient('activity');
  const reviewClient = getZhiyaClient('review');

  const loadDetail = useCallback(async (): Promise<DetailData> => {
    const activity = await activityClient.getActivity(activityId);
    if (activity === null) {
      return { activity: null, favorited: false, reviews: [], org: null };
    }
    const [favorites, reviews, orgs] = await Promise.all([
      activityClient.listFavoriteActivities(),
      reviewClient.listByActivity(activity.id),
      activityClient.listOrgs(),
    ]);
    return {
      activity,
      favorited: favorites.some((entry) => entry.id === activityId),
      reviews,
      org: orgs.find((org) => org.id === activity.orgId) ?? null,
    };
  }, [activityClient, reviewClient, activityId]);

  const detail = useAsyncData(loadDetail, [loadDetail]);

  if (detail.state === 'ready' && detail.data.activity === null) {
    return <ScreenState state="empty" titleKey="zhiya.activity.detail.notFound" />;
  }

  return (
    <div className="pb-24">
      <ScreenState
        state={detail.state === 'loading' ? 'loading' : detail.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {detail.state === 'ready' && detail.data.activity !== null ? (
          <DetailBody data={detail.data} />
        ) : null}
      </ScreenState>
    </div>
  );
}

function DetailBody({ data }: { data: DetailData }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activityClient = getZhiyaClient('activity');
  const activity = data.activity!;
  const remaining = Math.max(activity.quota - activity.enrolled, 0);
  const rating =
    data.reviews.length > 0
      ? data.reviews.reduce((sum, review) => sum + review.overall, 0) / data.reviews.length
      : null;

  const toggleFavorite = async (): Promise<void> => {
    await activityClient.toggleFavorite(activity.id);
    navigate(0);
  };

  const share = async (): Promise<void> => {
    const url = `${globalThis.location.origin}/activity/detail/${activity.id}`;
    try {
      await navigator.share?.({ title: activity.title, url });
    } catch {
      await navigator.clipboard?.writeText(url).catch(() => undefined);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center bg-brand-soft py-12 text-6xl" aria-hidden="true">
        {activity.emoji}
      </div>

      <div className="space-y-2 px-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg leading-snug font-semibold text-primary">{activity.title}</h1>
            <p className="mt-0.5 text-sm text-secondary">{activity.subtitle}</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-soft px-2 py-1 text-xs font-medium text-brand">
            {t(`zhiya.commons.category.${activity.category}`)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Price value={activity.price} originalValue={activity.originalPrice} size="lg" />
          <span className="text-xs text-muted">
            {remaining === 0 ? t('zhiya.commons.quota.full') : t('zhiya.commons.quota.remaining', { count: remaining })}
          </span>
        </div>
      </div>

      <Card className="mt-4 space-y-3 py-3">
        <div className="flex items-start gap-2 px-4 text-sm text-secondary">
          <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <span data-testid="detail-time">{formatRange(activity.startTime, activity.endTime)}</span>
        </div>
        <div className="flex items-start gap-2 px-4 text-sm text-secondary">
          {activity.mode === 'online' ? (
            <Wifi aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          ) : (
            <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          )}
          <span>
            {activity.mode === 'online' ? (
              activity.onlineLink !== undefined ? (
                <a className="text-brand underline" href={activity.onlineLink} target="_blank" rel="noreferrer">
                  {t('zhiya.activity.detail.onlineLink')}
                </a>
              ) : (
                t('zhiya.commons.mode.online')
              )
            ) : (
              activity.address
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 text-sm text-secondary">
          <Users aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />
          {t('zhiya.activity.detail.ageLabel', { min: activity.ageMin, max: activity.ageMax })}
        </div>
      </Card>

      <SectionHeader title={t('zhiya.activity.detail.introduction')} />
      <Card className="px-4 py-3 text-sm leading-6 whitespace-pre-line text-secondary">
        {activity.introduction}
      </Card>

      <SectionHeader title={t('zhiya.activity.detail.notice')} />
      <Card className="px-4 py-3 text-sm leading-6 whitespace-pre-line text-secondary">
        {activity.notice}
      </Card>

      <SectionHeader title={t('zhiya.activity.detail.org')} />
      <Card>
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar glyph={data.org?.logo ?? '🏫'} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-primary">{activity.orgName}</p>
            <p className="truncate text-xs text-muted">
              {data.org?.summary ?? t('zhiya.activity.detail.orgContactHint')}
            </p>
          </div>
          <Link
            to="/profile/messages"
            className="flex shrink-0 items-center gap-1 rounded-full border border-border-default px-3 py-1.5 text-xs text-secondary"
          >
            <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
            {t('zhiya.activity.detail.contactOrg')}
          </Link>
        </div>
      </Card>

      <SectionHeader
        title={
          rating !== null
            ? t('zhiya.activity.detail.reviewsWithRating', {
                rating: rating.toFixed(1),
                count: data.reviews.length,
              })
            : t('zhiya.activity.detail.reviews')
        }
      />
      {data.reviews.length === 0 ? (
        <Card className="px-4 py-6 text-center text-xs text-muted">{t('zhiya.activity.detail.noReviews')}</Card>
      ) : (
        <Card>
          {data.reviews.map((review) => (
            <div key={review.id} className="border-b border-border-subtle px-4 py-3 last:border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">{review.authorName}</p>
                <p className="text-xs text-warning">{'★'.repeat(review.overall)}</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-secondary">{review.content}</p>
            </div>
          ))}
        </Card>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[42rem] border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t('zhiya.commons.action.favorite')}
            data-testid="detail-favorite"
            onClick={() => {
              void toggleFavorite();
            }}
            className="flex flex-col items-center px-2 text-muted"
          >
            <Heart
              aria-hidden="true"
              className={data.favorited ? 'h-5 w-5 fill-danger text-danger' : 'h-5 w-5'}
            />
            <span className="text-[0.625rem]">{t('zhiya.activity.detail.favorite')}</span>
          </button>
          <button
            type="button"
            aria-label={t('zhiya.activity.detail.share')}
            onClick={() => {
              void share();
            }}
            className="flex flex-col items-center px-2 text-muted"
          >
            <Share2 aria-hidden="true" className="h-5 w-5" />
            <span className="text-[0.625rem]">{t('zhiya.activity.detail.share')}</span>
          </button>
          <button
            type="button"
            data-testid="register-cta"
            disabled={remaining === 0}
            onClick={() => {
              navigate(`/activity/register/${activity.id}`);
            }}
            className="ml-auto flex-1 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-opacity hover:bg-brand-hover disabled:bg-border-strong disabled:text-muted"
          >
            {remaining === 0 ? t('zhiya.activity.detail.soldOut') : t('zhiya.activity.detail.registerNow')}
          </button>
        </div>
      </div>
    </>
  );
}

function formatRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} ~ ${end}`;
  }
  const pad = (input: number): string => String(input).padStart(2, '0');
  return `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())} ${pad(
    startDate.getHours(),
  )}:${pad(startDate.getMinutes())} ~ ${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())} ${pad(
    endDate.getHours(),
  )}:${pad(endDate.getMinutes())}`;
}
