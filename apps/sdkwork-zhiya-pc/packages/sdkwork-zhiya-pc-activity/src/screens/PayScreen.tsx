import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';
import type { OrderView } from '@sdkwork/zhiya-pc-core';

import { cx, formatPrice } from '../utils/format.js';

/**
 * 收银台 (PRD §9.1 支付): 订单确认 + 支付方式选择 (微信/支付宝, mock) → 支付.
 */
export function PayScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId = '' } = useParams<{ orderId: string }>();
  const orderClient = getZhiyaClient('order');
  const [method, setMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [paying, setPaying] = useState(false);

  const order = useAsyncData<OrderView | null>(() => orderClient.getOrder(orderId), [orderClient, orderId]);

  if (order.state === 'ready' && order.data === null) {
    return <ScreenState state="empty" titleKey="zhiya.activity.pay.orderMissing" />;
  }

  const pay = async (): Promise<void> => {
    if (order.state !== 'ready' || order.data === null || paying) {
      return;
    }
    setPaying(true);
    try {
      await orderClient.payOrder(orderId, method);
      navigate(`/activity/success/${orderId}`, { replace: true });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.activity.pay.title')}</h1>
      </header>

      <ScreenState
        state={order.state === 'loading' ? 'loading' : order.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {order.state === 'ready' && order.data !== null ? (
          <>
            <Card className="space-y-2 px-4 py-4">
              <p className="text-center text-xs text-muted">{t('zhiya.activity.pay.payableLabel')}</p>
              <p data-testid="pay-amount" className="text-center text-3xl font-semibold text-primary">
                {formatPrice(order.data.payable)}
              </p>
              <p className="text-center text-xs text-muted">{order.data.items[0]?.title}</p>
            </Card>

            <Card className="mt-4">
              {(
                [
                  { value: 'wechat', label: t('zhiya.activity.pay.wechat'), emoji: '💬' },
                  { value: 'alipay', label: t('zhiya.activity.pay.alipay'), emoji: '🅰️' },
                ] as const
              ).map((entry) => (
                <button
                  key={entry.value}
                  type="button"
                  data-testid={`pay-method-${entry.value}`}
                  onClick={() => {
                    setMethod(entry.value);
                  }}
                  className="flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3 text-left last:border-b-0"
                >
                  <span aria-hidden="true" className="text-xl">{entry.emoji}</span>
                  <span className="flex-1 text-sm text-primary">{entry.label}</span>
                  <span
                    className={cx(
                      'flex h-4 w-4 items-center justify-center rounded-full border',
                      method === entry.value ? 'border-brand' : 'border-border-strong',
                    )}
                  >
                    {method === entry.value ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
                  </span>
                </button>
              ))}
            </Card>

            <Card className="mt-4 space-y-1.5 px-4 py-3 text-xs text-secondary">
              <div className="flex justify-between">
                <span>{t('zhiya.activity.pay.amountLabel')}</span>
                <span>{formatPrice(order.data.amount)}</span>
              </div>
              {order.data.discount > 0 ? (
                <div className="flex justify-between text-success">
                  <span>{t('zhiya.activity.pay.discountLabel')}</span>
                  <span>-{formatPrice(order.data.discount)}</span>
                </div>
              ) : null}
            </Card>

            <p className="px-4 pt-3 text-center text-xs text-muted">{t('zhiya.activity.pay.mockHint')}</p>
          </>
        ) : null}
      </ScreenState>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[42rem] border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <button
          type="button"
          data-testid="pay-confirm"
          disabled={order.state !== 'ready' || paying}
          onClick={() => {
            void pay();
          }}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-opacity hover:bg-brand-hover disabled:bg-border-strong disabled:text-muted"
        >
          {paying ? t('zhiya.activity.pay.paying') : t('zhiya.activity.pay.payNow')}
        </button>
      </div>
    </div>
  );
}
