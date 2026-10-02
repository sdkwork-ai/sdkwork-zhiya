import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

import {
  Avatar,
  Card,
  Price,
  ScreenState,
  SectionHeader,
  useAsyncData,
} from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient, RegistrationError } from '@sdkwork/zhiya-h5-core';
import type { Child, RegistrationErrorCode, UserCoupon } from '@sdkwork/zhiya-h5-core';

import { cx } from '../utils/format.js';
import { trimPrice } from '../utils/format.js';

interface RegisterData {
  title: string;
  emoji: string;
  price: number;
  originalPrice: number;
  sessionOptions: { id: string; label: string; remaining: number }[];
  children: Child[];
}

/**
 * 报名流程 (PRD §9.1): 选择参加儿童 → 选择场次 → 选择优惠券 → 确认订单.
 * 系统自动检查年龄/名额/重复/时间冲突 (PRD §9.2), rejected with typed codes.
 */
export function RegisterScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activityId = '' } = useParams<{ activityId: string }>();

  const activityClient = getZhiyaClient('activity');
  const familyClient = getZhiyaClient('family');
  const orderClient = getZhiyaClient('order');
  const couponClient = getZhiyaClient('coupon');

  const [childId, setChildId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [error, setError] = useState<RegistrationErrorCode | null>(null);

  const loadRegister = useCallback(async (): Promise<RegisterData> => {
    const [activity, children, claimable] = await Promise.all([
      activityClient.getActivity(activityId),
      familyClient.listChildren(),
      couponClient.listClaimable(),
    ]);
    if (activity === null) {
      throw new Error(`activity not found: ${activityId}`);
    }
    void claimable;
    return {
      title: activity.title,
      emoji: activity.emoji,
      price: activity.price,
      originalPrice: activity.originalPrice,
      sessionOptions: activity.sessions.map((session) => ({
        id: session.id,
        label: `${session.label} · ${new Date(session.startTime).getMonth() + 1}/${new Date(session.startTime).getDate()}`,
        remaining: Math.max(session.quota - session.enrolled, 0),
      })),
      children,
    };
  }, [activityClient, familyClient, couponClient, activityId]);

  const data = useAsyncData(loadRegister, [loadRegister]);

  if (data.state === 'ready' && data.data.children.length === 0) {
    return (
      <div className="px-4 pt-6">
        <Card className="px-4 py-10 text-center">
          <p className="text-sm font-medium text-primary">{t('zhiya.activity.register.noChild')}</p>
          <p className="mt-1 text-xs text-muted">{t('zhiya.activity.register.noChildHint')}</p>
          <Link
            to="/profile/child/new"
            className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white"
          >
            {t('zhiya.activity.register.addChild')}
          </Link>
        </Card>
      </div>
    );
  }

  const submit = async (): Promise<void> => {
    if (data.state !== 'ready') {
      return;
    }
    setError(null);
    const effectiveChild = childId ?? data.data.children[0]?.id;
    const effectiveSession = sessionId ?? data.data.sessionOptions[0]?.id;
    if (effectiveChild === undefined || effectiveSession === undefined) {
      return;
    }
    try {
      const order = await orderClient.createRegistrationOrder({
        activityId,
        sessionId: effectiveSession,
        childId: effectiveChild,
        couponId: couponId ?? undefined,
      });
      navigate(`/activity/pay/${order.id}`);
    } catch (caught) {
      if (caught instanceof RegistrationError) {
        setError(caught.code);
      } else {
        setError('not-open');
      }
    }
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.activity.register.title')}</h1>
      </header>

      <ScreenState
        state={data.state === 'loading' ? 'loading' : data.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {data.state === 'ready' ? (
          <>
            <Card className="flex items-center gap-3 px-4 py-3">
              <span aria-hidden="true" className="text-3xl">
                {data.data.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">{data.data.title}</p>
                <Price value={data.data.price} originalValue={data.data.originalPrice} size="sm" />
              </div>
            </Card>

            <SectionHeader title={t('zhiya.activity.register.chooseChild')} />
            <div className="space-y-2 px-4">
              {data.data.children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  data-testid={`child-${child.id}`}
                  onClick={() => {
                    setChildId(child.id);
                  }}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                    (childId ?? data.data.children[0]?.id) === child.id
                      ? 'border-brand bg-brand-soft'
                      : 'border-border-subtle bg-panel',
                  )}
                >
                  <Avatar glyph={child.emoji} size="sm" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-primary">{child.nickname}</span>
                    <span className="block text-xs text-muted">
                      {t(`zhiya.commons.childStage.${child.stage}`)}
                    </span>
                  </span>
                  {(childId ?? data.data.children[0]?.id) === child.id ? (
                    <span aria-hidden="true" className="text-brand">✓</span>
                  ) : null}
                </button>
              ))}
            </div>

            <SectionHeader title={t('zhiya.activity.register.chooseSession')} />
            <div className="flex flex-wrap gap-2 px-4">
              {data.data.sessionOptions.map((session) => {
                const selected = (sessionId ?? data.data.sessionOptions[0]?.id) === session.id;
                return (
                  <button
                    key={session.id}
                    type="button"
                    disabled={session.remaining === 0}
                    onClick={() => {
                      setSessionId(session.id);
                    }}
                    className={cx(
                      'rounded-xl border px-3 py-2 text-xs disabled:opacity-40',
                      selected ? 'border-brand bg-brand-soft text-brand' : 'border-border-subtle bg-panel text-secondary',
                    )}
                  >
                    <span className="block font-medium">{session.label}</span>
                    <span className={session.remaining === 0 ? 'text-danger' : 'text-muted'}>
                      {session.remaining === 0
                        ? t('zhiya.commons.quota.full')
                        : t('zhiya.commons.quota.remaining', { count: session.remaining })}
                    </span>
                  </button>
                );
              })}
            </div>

            <CouponPicker
              activityId={activityId}
              amount={data.data.price}
              selectedCouponId={couponId}
              onSelect={setCouponId}
            />

            {error !== null ? (
              <p data-testid="register-error" className="px-4 pt-3 text-sm text-danger">
                {t(`zhiya.activity.register.error.${error}`)}
              </p>
            ) : null}

            <p className="flex items-center gap-1 px-4 pt-4 text-xs text-muted">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              {t('zhiya.activity.register.agreement')}
            </p>
          </>
        ) : null}
      </ScreenState>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[42rem] border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <button
          type="button"
          data-testid="submit-order"
          disabled={data.state !== 'ready'}
          onClick={() => {
            void submit();
          }}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-opacity hover:bg-brand-hover disabled:bg-border-strong disabled:text-muted"
        >
          {t('zhiya.activity.register.submit')}
        </button>
      </div>
    </div>
  );
}

function CouponPicker({
  activityId,
  amount,
  selectedCouponId,
  onSelect,
}: {
  activityId: string;
  amount: number;
  selectedCouponId: string | null;
  onSelect: (couponId: string | null) => void;
}) {
  const { t } = useTranslation();
  const orderClient = getZhiyaClient('order');
  const coupons = useAsyncData(
    () => orderClient.listApplicableCoupons({ kind: 'activity', id: activityId }, amount),
    [orderClient, activityId, amount],
  );

  if (coupons.state !== 'ready' || coupons.data.length === 0) {
    return null;
  }
  return (
    <>
      <SectionHeader title={t('zhiya.activity.register.coupons')} />
      <div className="space-y-2 px-4">
        {coupons.data.map((coupon: UserCoupon) => (
          <button
            key={coupon.id}
            type="button"
            data-testid={`coupon-${coupon.id}`}
            onClick={() => {
              onSelect(selectedCouponId === coupon.id ? null : coupon.id);
            }}
            className={cx(
              'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left',
              selectedCouponId === coupon.id ? 'border-brand bg-brand-soft' : 'border-border-subtle bg-panel',
            )}
          >
            <span>
              <span className="block text-sm font-medium text-primary">{coupon.title}</span>
              <span className="block text-xs text-muted">
                {t(`zhiya.commons.couponScope.${coupon.scope}`)}
                {coupon.minSpend > 0
                  ? ` · ${t('zhiya.activity.register.couponMinSpend', { amount: coupon.minSpend })}`
                  : ''}
              </span>
            </span>
            <span className="text-sm font-semibold text-brand">-¥{trimPrice(coupon.amountOff)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
