import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import {
  Card,
  Price,
  ScreenState,
  useAsyncData,
} from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-h5-core';
import type { OrderStatus } from '@sdkwork/zhiya-h5-core';

import { cx } from '../utils/format.js';

const STATUS_TABS: readonly (OrderStatus | 'all')[] = [
  'all',
  'pending-payment',
  'upcoming',
  'pending-review',
  'completed',
  'refunded',
];

/** 统一订单列表 (PRD §29): 状态 tabs + 订单卡片. */
export function OrderListScreen() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') ?? 'all') as OrderStatus | 'all';

  const orderClient = getZhiyaClient('order');
  const orders = useAsyncData(() => orderClient.listOrders({ status }), [orderClient, status]);

  const selectStatus = (next: OrderStatus | 'all'): void => {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') {
      params.delete('status');
    } else {
      params.set('status', next);
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.trade.orders.title')}</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 py-2" data-testid="order-status-tabs">
        {STATUS_TABS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => {
              selectStatus(entry);
            }}
            className={cx(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
              status === entry ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
            )}
          >
            {entry === 'all' ? t('zhiya.trade.orders.all') : t(`zhiya.commons.orderStatus.${entry}`)}
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
                  <Link to={`/trade/orders/${order.id}`} data-testid={`order-${order.id}`} className="block px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs text-muted">
                        <span aria-hidden="true" className="text-lg">{item?.emoji}</span>
                        {item?.orgName}
                      </span>
                      <span className="text-xs font-medium text-brand">
                        {t(`zhiya.commons.orderStatus.${order.status}`)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-primary">
                        {item?.title}
                      </span>
                      <Price value={order.payable} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {item?.childName !== undefined && item.childName !== ''
                        ? `${item.childName} · `
                        : ''}
                      {t(`zhiya.commons.orderStatus.${order.status}`)} · {order.createdAt.slice(0, 16).replace('T', ' ')}
                    </p>
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : null}
      </ScreenState>
    </div>
  );
}
