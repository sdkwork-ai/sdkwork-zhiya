import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import { Card, Price, ScreenState, useAsyncData } from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-h5-core';
import type { OrderStatus } from '@sdkwork/zhiya-h5-core';

import { cx } from '../utils/format.js';

const ACTIVITY_TABS: readonly (OrderStatus | 'all')[] = [
  'upcoming',
  'ongoing',
  'pending-review',
  'completed',
  'cancelled',
  'all',
];

/** 我的活动 (PRD §20): 待参加/进行中/待评价/已完成/已取消/全部. */
export function MyActivitiesScreen() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') ?? 'upcoming') as OrderStatus | 'all';

  const orderClient = getZhiyaClient('order');
  const orders = useAsyncData(
    () => orderClient.listOrders({ type: 'activity', status }),
    [orderClient, status],
  );

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.profile.activities.title')}</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 py-2" data-testid="my-activity-tabs">
        {ACTIVITY_TABS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('status', entry);
              setSearchParams(params, { replace: true });
            }}
            className={cx(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
              status === entry ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
            )}
          >
            {entry === 'all'
              ? t('zhiya.profile.activities.all')
              : t(`zhiya.commons.orderStatus.${entry}`)}
          </button>
        ))}
      </div>

      <ScreenState
        state={
          orders.state === 'loading'
            ? 'loading'
            : orders.state === 'error'
              ? 'error'
              : orders.data.length === 0
                ? 'empty'
                : 'success'
        }
        onRetry={() => undefined}
      >
        {orders.state === 'ready' ? (
          <div className="space-y-3 px-4 pt-1">
            {orders.data.map((order) => {
              const item = order.items[0];
              return (
                <Card key={order.id} className="mx-0">
                  <Link to={`/trade/orders/${order.id}`} className="flex items-center gap-3 px-4 py-3">
                    <span aria-hidden="true" className="text-2xl">{item?.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-primary">{item?.title}</span>
                      <span className="block truncate text-xs text-muted">
                        {item?.childName !== undefined && item.childName !== '' ? `${item.childName} · ` : ''}
                        {t(`zhiya.commons.orderStatus.${order.status}`)}
                        {order.checkInState === 'checked-in'
                          ? ` · ${t('zhiya.commons.checkInState.checked-in')}`
                          : ''}
                      </span>
                    </span>
                    <Price value={order.payable} size="sm" />
                  </Link>
                  {order.status === 'pending-review' ? (
                    <div className="flex justify-end border-t border-border-subtle px-4 py-2">
                      <Link
                        to={`/trade/orders/${order.id}/review`}
                        className="rounded-full bg-brand px-4 py-1.5 text-xs font-medium text-white"
                      >
                        {t('zhiya.profile.activities.review')}
                      </Link>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        ) : null}
      </ScreenState>
    </div>
  );
}
