import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Card, Price, ScreenState, VoucherQr, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient, RegistrationError } from '@sdkwork/zhiya-pc-core';
import type { OrderView } from '@sdkwork/zhiya-pc-core';

/**
 * 订单详情 (PRD §29/§11): 状态、金额明细、活动凭证 QR, 状态化操作
 * (去支付 / 取消订单 / 申请退款 / 去评价).
 */
export function OrderDetailScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId = '' } = useParams<{ orderId: string }>();
  const orderClient = getZhiyaClient('order');
  const [actionError, setActionError] = useState<string | null>(null);

  const order = useAsyncData<OrderView | null>(() => orderClient.getOrder(orderId), [orderClient, orderId]);

  if (order.state === 'ready' && order.data === null) {
    return <ScreenState state="empty" titleKey="zhiya.trade.detail.notFound" />;
  }

  const runAction = async (action: () => Promise<unknown>): Promise<void> => {
    setActionError(null);
    try {
      await action();
      navigate(0);
    } catch (caught) {
      setActionError(caught instanceof RegistrationError ? caught.code : 'not-open');
    }
  };

  const data = order.state === 'ready' ? order.data : null;
  const item = data?.items[0];

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.trade.detail.title')}</h1>
      </header>

      <ScreenState
        state={order.state === 'loading' ? 'loading' : order.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {data !== null ? (
          <>
            <Card className="mx-0 flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-primary">
                {t(`zhiya.commons.orderStatus.${data.status}`)}
              </span>
              <span className="text-xs text-muted">{data.id}</span>
            </Card>

            <Card className="mx-0 mt-3 flex items-center gap-3 px-4 py-3">
              <span aria-hidden="true" className="text-3xl">{item?.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">{item?.title}</p>
                <p className="truncate text-xs text-muted">
                  {item?.orgName}
                  {item?.childName !== undefined && item.childName !== '' ? ` · ${item.childName}` : ''}
                </p>
              </div>
              <Price value={data.payable} size="sm" />
            </Card>

            {data.type === 'activity' && data.voucherCode !== undefined && (data.status === 'upcoming' || data.status === 'ongoing') ? (
              <Card className="mx-0 mt-3 flex justify-center px-4 py-6">
                <VoucherQr code={data.voucherCode} />
              </Card>
            ) : null}

            {data.type === 'activity' && data.voucherCode !== undefined && data.status !== 'pending-payment' ? (
              <p className="px-4 pt-2 text-center text-xs text-muted">
                {t('zhiya.commons.checkInState.' + data.checkInState)}
              </p>
            ) : null}

            <Card className="mx-0 mt-3 space-y-1.5 px-4 py-3 text-xs text-secondary">
              <div className="flex justify-between">
                <span>{t('zhiya.trade.detail.amount')}</span>
                <span>{formatMoney(data.amount)}</span>
              </div>
              {data.discount > 0 ? (
                <div className="flex justify-between text-success">
                  <span>{t('zhiya.trade.detail.discount')}</span>
                  <span>-{formatMoney(data.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border-subtle pt-1.5 font-medium text-primary">
                <span>{t('zhiya.trade.detail.payable')}</span>
                <span>{formatMoney(data.payable)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t('zhiya.trade.detail.createdAt')}</span>
                <span>{data.createdAt.slice(0, 16).replace('T', ' ')}</span>
              </div>
            </Card>

            {data.type === 'package' && (data.status === 'upcoming' || data.status === 'ongoing') ? (
              <p className="px-4 pt-3 text-center">
                <Link
                  to={`/trade/orders/${data.id}/benefits`}
                  data-testid="order-benefits"
                  className="text-sm font-medium text-brand underline"
                >
                  {t('zhiya.trade.detail.benefits')}
                </Link>
              </p>
            ) : null}

            {actionError !== null ? (
              <p className="px-4 pt-3 text-sm text-danger">{t(`zhiya.trade.detail.actionError.${actionError}`)}</p>
            ) : null}

            <div className="mt-4 flex justify-end gap-2 px-4">
              {data.status === 'pending-payment' ? (
                <>
                  <button
                    type="button"
                    data-testid="order-cancel"
                    onClick={() => {
                      void runAction(() => orderClient.cancelOrder(data.id));
                    }}
                    className="rounded-full border border-border-default px-4 py-2 text-xs text-secondary"
                  >
                    {t('zhiya.trade.detail.cancel')}
                  </button>
                  <Link
                    to={`/activity/pay/${data.id}`}
                    data-testid="order-pay"
                    className="rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white"
                  >
                    {t('zhiya.trade.detail.pay')}
                  </Link>
                </>
              ) : null}
              {(data.status === 'upcoming' || data.status === 'ongoing') ? (
                <button
                  type="button"
                  data-testid="order-refund"
                  onClick={() => {
                    void runAction(() => orderClient.refundOrder(data.id));
                  }}
                  className="rounded-full border border-border-default px-4 py-2 text-xs text-secondary"
                >
                  {t('zhiya.trade.detail.refund')}
                </button>
              ) : null}
              {data.status === 'pending-review' && data.reviewId === undefined ? (
                <Link
                  to={`/trade/orders/${data.id}/review`}
                  data-testid="order-review"
                  className="rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white"
                >
                  {t('zhiya.trade.detail.review')}
                </Link>
              ) : null}
            </div>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}

function formatMoney(value: number): string {
  return `¥${Number.isInteger(value) ? value : value.toFixed(2)}`;
}
