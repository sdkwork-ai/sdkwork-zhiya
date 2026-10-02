import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';
import type { CouponState } from '@sdkwork/zhiya-pc-core';

import { cx, trimPrice } from '../utils/format.js';

const STATE_TABS: readonly (CouponState | 'claimable')[] = ['claimable', 'unused', 'used', 'expired'];

/** 优惠券中心 (PRD §17): 领券 + 我的券 (未使用/已使用/已过期). */
export function CouponsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const couponClient = getZhiyaClient('coupon');
  const [tab, setTab] = useState<CouponState | 'claimable'>('claimable');

  const claimable = useAsyncData(() => couponClient.listClaimable(), [couponClient, tab]);
  const mine = useAsyncData(
    () => couponClient.listMyCoupons(tab === 'claimable' ? undefined : (tab as CouponState)),
    [couponClient, tab],
  );

  const claim = async (templateId: string): Promise<void> => {
    await couponClient.claim(templateId);
    navigate(0);
  };

  const loading =
    claimable.state === 'loading' || mine.state === 'loading'
      ? 'loading'
      : claimable.state === 'error' || mine.state === 'error'
        ? 'error'
        : null;

  const empty =
    tab === 'claimable'
      ? claimable.state === 'ready' && claimable.data.length === 0
      : mine.state === 'ready' && mine.data.length === 0;

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.profile.coupons.title')}</h1>
      </header>

      <div className="flex gap-2 px-4 py-2" data-testid="coupon-tabs">
        {STATE_TABS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => {
              setTab(entry);
            }}
            className={cx(
              'flex-1 rounded-full px-3 py-1.5 text-xs font-medium',
              tab === entry ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
            )}
          >
            {entry === 'claimable'
              ? t('zhiya.profile.coupons.claimable')
              : t(`zhiya.commons.couponState.${entry}`)}
          </button>
        ))}
      </div>

      <ScreenState
        state={loading ?? (empty ? 'empty' : 'success')}
        onRetry={() => undefined}
      >
        {tab === 'claimable' && claimable.state === 'ready' ? (
          <div className="space-y-3 px-4 pt-1">
            {claimable.data.map((template) => (
              <Card key={template.id} className="mx-0 flex items-center gap-3 px-4 py-3">
                <CouponFace amountOff={template.amountOff} minSpend={template.minSpend} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primary">{template.title}</p>
                  <p className="text-xs text-muted">
                    {t(`zhiya.commons.couponScope.${template.scope}`)} ·{' '}
                    {t('zhiya.profile.coupons.validDays', { days: template.validDays })}
                  </p>
                </div>
                <button
                  type="button"
                  data-testid={`claim-${template.id}`}
                  onClick={() => {
                    void claim(template.id);
                  }}
                  className="shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
                >
                  {t('zhiya.profile.coupons.claim')}
                </button>
              </Card>
            ))}
          </div>
        ) : null}

        {tab !== 'claimable' && mine.state === 'ready' ? (
          <div className="space-y-3 px-4 pt-1">
            {mine.data.map((coupon) => (
              <Card
                key={coupon.id}
                className={cx('mx-0 flex items-center gap-3 px-4 py-3', coupon.state !== 'unused' && 'opacity-60')}
              >
                <CouponFace amountOff={coupon.amountOff} minSpend={coupon.minSpend} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primary">{coupon.title}</p>
                  <p className="text-xs text-muted">
                    {t(`zhiya.commons.couponState.${coupon.state}`)} ·{' '}
                    {t('zhiya.profile.coupons.expireAt', { date: coupon.expireAt.slice(0, 10) })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </ScreenState>
    </div>
  );
}

function CouponFace({ amountOff, minSpend }: { amountOff: number; minSpend: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-soft text-brand">
      <span className="text-lg leading-none font-semibold">¥{trimPrice(amountOff)}</span>
      <span className="mt-0.5 text-[0.625rem]">
        {minSpend > 0 ? t('zhiya.profile.coupons.overSpend', { amount: minSpend }) : t('zhiya.profile.coupons.noThreshold')}
      </span>
    </div>
  );
}
