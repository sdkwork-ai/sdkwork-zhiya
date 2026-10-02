import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import { Card, ScreenState, VoucherQr, useAsyncData } from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-h5-core';
import type { OrderView } from '@sdkwork/zhiya-h5-core';

/**
 * 报名成功 (PRD §9.3): 订单号 + 活动凭证 QR + 活动提醒入口.
 */
export function RegisterSuccessScreen() {
  const { t } = useTranslation();
  const { orderId = '' } = useParams<{ orderId: string }>();
  const orderClient = getZhiyaClient('order');
  const order = useAsyncData<OrderView | null>(() => orderClient.getOrder(orderId), [orderClient, orderId]);

  if (order.state === 'ready' && order.data === null) {
    return <ScreenState state="empty" titleKey="zhiya.activity.pay.orderMissing" />;
  }

  const data = order.state === 'ready' ? order.data : null;
  const isActivity = data?.type === 'activity';

  return (
    <div className="px-4 pt-8 pb-10">
      <ScreenState
        state={order.state === 'loading' ? 'loading' : order.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <CheckCircle2 aria-hidden="true" className="h-14 w-14 text-success" />
          <h1 data-testid="success-title" className="text-lg font-semibold text-primary">
            {isActivity ? t('zhiya.activity.success.title') : t('zhiya.activity.success.packageTitle')}
          </h1>
          <p className="text-xs text-muted">
            {t('zhiya.activity.success.orderNo', { orderId })}
          </p>
        </div>

        {isActivity && data?.voucherCode !== undefined ? (
          <Card className="mt-6 flex justify-center px-4 py-6">
            <VoucherQr code={data.voucherCode} />
          </Card>
        ) : null}

        {!isActivity ? (
          <Card className="mt-6 px-4 py-6 text-center text-sm text-secondary">
            {t('zhiya.activity.success.packageHint')}
          </Card>
        ) : null}

        <div className="mt-6 flex gap-3">
          <Link
            to="/home"
            className="flex-1 rounded-full border border-border-default px-4 py-3 text-center text-sm font-medium text-secondary"
          >
            {t('zhiya.activity.success.backHome')}
          </Link>
          <Link
            to="/trade/orders"
            data-testid="success-view-orders"
            className="flex-1 rounded-full bg-brand px-4 py-3 text-center text-sm font-medium text-white"
          >
            {t('zhiya.activity.success.viewOrders')}
          </Link>
        </div>
      </ScreenState>
    </div>
  );
}
