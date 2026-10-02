import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';
import type { ActivityStatus } from '@sdkwork/zhiya-pc-core';

import { cx } from '../utils/format.js';

const STATUS_FILTERS: readonly (ActivityStatus | 'all')[] = ['all', 'published', 'draft', 'offline'];

/** 机构活动管理 (PRD §22.2): 列表 + 上架/下架/编辑/删除, 新建入口. */
export function OrgActivitiesScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const orgClient = getZhiyaClient('org');
  const [status, setStatus] = useState<ActivityStatus | 'all'>('all');

  const activities = useAsyncData(() => orgClient.listOrgActivities(status === 'all' ? undefined : status), [orgClient, status]);

  const mutate = async (action: () => Promise<unknown>): Promise<void> => {
    await action();
    navigate(0);
  };

  return (
    <div className="pb-6">
      <header className="flex items-center px-4 pt-4 pb-1">
        <h1 className="flex-1 text-lg font-semibold text-primary">{t('zhiya.org.activities.title')}</h1>
        <Link
          to="/org/activities/new"
          data-testid="org-new-activity"
          className="rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white"
        >
          {t('zhiya.org.activities.new')}
        </Link>
      </header>

      <div className="flex gap-2 px-4 py-2" data-testid="org-status-tabs">
        {STATUS_FILTERS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => {
              setStatus(entry);
            }}
            className={cx(
              'flex-1 rounded-full px-3 py-1.5 text-xs font-medium',
              status === entry ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
            )}
          >
            {entry === 'all' ? t('zhiya.org.activities.all') : t(`zhiya.org.activities.${entry}`)}
          </button>
        ))}
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
          <div className="space-y-3 px-4 pt-1">
            {activities.data.map((activity) => (
              <Card key={activity.id} className="mx-0 px-4 py-3">
                <div className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-2xl">{activity.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary">{activity.title}</p>
                    <p className="text-xs text-muted">
                      ¥{activity.price} · {activity.quota - activity.enrolled}/{activity.quota} ·{' '}
                      {activity.startTime.slice(5, 16).replace('T', ' ')}
                    </p>
                  </div>
                  <span
                    className={cx(
                      'shrink-0 rounded-full px-2 py-1 text-[0.625rem] font-medium',
                      activity.status === 'published'
                        ? 'bg-success/15 text-success'
                        : activity.status === 'draft'
                          ? 'bg-panel-muted text-muted'
                          : 'bg-danger/10 text-danger',
                    )}
                  >
                    {t(`zhiya.org.activities.${activity.status}`)}
                  </span>
                </div>
                <div className="mt-2 flex justify-end gap-2 border-t border-border-subtle pt-2 text-xs">
                  {activity.status === 'draft' ? (
                    <button
                      type="button"
                      data-testid={`publish-${activity.id}`}
                      onClick={() => {
                        void mutate(() => orgClient.publishActivity(activity.id));
                      }}
                      className="rounded-full bg-brand px-3 py-1.5 font-medium text-white"
                    >
                      {t('zhiya.org.activities.publish')}
                    </button>
                  ) : null}
                  {activity.status === 'published' ? (
                    <button
                      type="button"
                      data-testid={`offline-${activity.id}`}
                      onClick={() => {
                        void mutate(() => orgClient.offlineActivity(activity.id));
                      }}
                      className="rounded-full border border-border-default px-3 py-1.5 text-secondary"
                    >
                      {t('zhiya.org.activities.offline')}
                    </button>
                  ) : null}
                  <Link
                    to={`/org/activities/${activity.id}`}
                    data-testid={`edit-${activity.id}`}
                    className="rounded-full border border-border-default px-3 py-1.5 text-secondary"
                  >
                    {t('zhiya.org.activities.edit')}
                  </Link>
                  <button
                    type="button"
                    data-testid={`delete-${activity.id}`}
                    onClick={() => {
                      void mutate(() => orgClient.deleteActivity(activity.id));
                    }}
                    className="rounded-full border border-danger/40 px-3 py-1.5 text-danger"
                  >
                    {t('zhiya.org.activities.delete')}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </ScreenState>
    </div>
  );
}
