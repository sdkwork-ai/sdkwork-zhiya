import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient, RegistrationError } from '@sdkwork/zhiya-h5-core';
import type { Child, PackageBenefitView } from '@sdkwork/zhiya-h5-core';

import { cx } from '../utils/format.js';

function formatPrice(value: number): string {
  return `¥${Number.isInteger(value) ? value : value.toFixed(value * 10 % 1 === 0 ? 1 : 2)}`;
}

interface BenefitsData {
  orderId: string;
  packageTitle: string;
  benefits: PackageBenefitView[];
  children: Child[];
}

interface BookingSelection {
  activityId: string;
  sessionId: string;
  childId: string;
}

/**
 * 体验包权益页 (PRD §12.4): 查看包内每个活动的已约/可约状态，
 * 选孩子 + 场次后预约一个权益，出凭证并进入机构核销流程。
 */
export function BenefitsScreen() {
  const { t } = useTranslation();
  const { orderId = '' } = useParams<{ orderId: string }>();

  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const orderClient = getZhiyaClient('order');
  const familyClient = getZhiyaClient('family');

  const loadBenefits = useCallback(async (): Promise<BenefitsData> => {
    const [benefits, children] = await Promise.all([
      orderClient.listPackageBenefits(orderId),
      familyClient.listChildren(),
    ]);
    return { orderId, packageTitle: t('zhiya.trade.benefits.title'), benefits, children };
  }, [orderClient, familyClient, orderId, t]);

  const data = useAsyncData(loadBenefits, [loadBenefits]);

  if (data.state === 'ready' && data.data.children.length === 0) {
    return (
      <div className="px-4 pt-6">
        <Card className="px-4 py-10 text-center">
          <p className="text-sm font-medium text-primary">{t('zhiya.trade.benefits.noChild')}</p>
          <Link to="/profile/child/new" className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white">
            {t('zhiya.trade.benefits.addChild')}
          </Link>
        </Card>
      </div>
    );
  }

  const submit = async (): Promise<void> => {
    if (selection === null || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await orderClient.bookPackageBenefit({ orderId, ...selection });
      setSelection(null);
      navigateRefresh();
    } catch (caught) {
      setError(caught instanceof RegistrationError ? caught.message : String(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const navigateRefresh = (): void => {
    globalThis.location.reload();
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.trade.benefits.title')}</h1>
      </header>

      <ScreenState
        state={data.state === 'loading' ? 'loading' : data.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {data.state === 'ready' ? (
          <>
            <div className="space-y-3 px-4 pt-2">
              {data.data.benefits.map((benefit) => (
                <Card key={benefit.activityId} className="mx-0 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="text-3xl">{benefit.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary">{benefit.title}</p>
                      <p className="truncate text-xs text-muted">
                        {benefit.orgName} · {benefit.ageMin}-{benefit.ageMax}
                        {t('zhiya.commons.age.unit')} · {formatPrice(benefit.price)}
                      </p>
                    </div>
                    {benefit.booked ? (
                      <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-xs text-success">
                        {benefit.checkInState === 'checked-in'
                          ? t('zhiya.commons.checkInState.checked-in')
                          : t('zhiya.trade.benefits.booked')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        data-testid={`benefit-book-${benefit.activityId}`}
                        onClick={() =>
                          setSelection(
                            selection?.activityId === benefit.activityId
                              ? null
                              : { activityId: benefit.activityId, sessionId: '', childId: data.data.children[0]?.id ?? '' },
                          )
                        }
                        className={cx(
                          'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold',
                          selection?.activityId === benefit.activityId
                            ? 'bg-panel-muted text-muted'
                            : 'bg-brand text-white',
                        )}
                      >
                        {selection?.activityId === benefit.activityId
                          ? t('zhiya.trade.benefits.cancel')
                          : t('zhiya.trade.benefits.book')}
                      </button>
                    )}
                  </div>

                  {benefit.booked && benefit.voucherCode !== undefined ? (
                    <p className="mt-2 font-mono text-xs tracking-widest text-brand">
                      {benefit.voucherCode}
                    </p>
                  ) : null}

                  {selection !== null && selection.activityId === benefit.activityId && !benefit.booked ? (
                    <BookingPanel
                      activityId={benefit.activityId}
                      children_={data.data.children}
                      selection={selection}
                      onSelect={setSelection}
                      error={error}
                      submitting={submitting}
                      onSubmit={() => {
                        void submit();
                      }}
                    />
                  ) : null}
                </Card>
              ))}
            </div>
            <p className="px-4 pt-4 text-xs leading-5 text-muted">{t('zhiya.trade.benefits.rules')}</p>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}

function BookingPanel({
  activityId,
  children_,
  selection,
  onSelect,
  error,
  submitting,
  onSubmit,
}: {
  activityId: string;
  children_: Child[];
  selection: BookingSelection;
  onSelect: (next: BookingSelection | null) => void;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const activityClient = getZhiyaClient('activity');
  const sessions = useAsyncData(() => activityClient.getActivity(activityId), [activityClient, activityId]);

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-panel-muted p-3">
      <div>
        <p className="mb-1 text-xs font-medium text-secondary">{t('zhiya.trade.benefits.chooseChild')}</p>
        <div className="flex flex-wrap gap-2">
          {children_.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelect({ ...selection, childId: child.id })}
              className={cx(
                'rounded-full border px-3 py-1 text-xs',
                selection.childId === child.id ? 'border-brand bg-brand-soft text-brand' : 'border-border-subtle bg-panel text-secondary',
              )}
            >
              {child.emoji} {child.nickname}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-secondary">{t('zhiya.trade.benefits.chooseSession')}</p>
        {sessions.state === 'ready' && sessions.data !== null ? (
          <div className="flex flex-wrap gap-2">
            {sessions.data.sessions.map((session) => {
              const remaining = session.quota - session.enrolled;
              return (
                <button
                  key={session.id}
                  type="button"
                  disabled={remaining === 0}
                  onClick={() => onSelect({ ...selection, sessionId: session.id })}
                  className={cx(
                    'rounded-xl border px-3 py-1.5 text-xs disabled:opacity-40',
                    selection.sessionId === session.id
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-border-subtle bg-panel text-secondary',
                  )}
                >
                  {session.label}（{remaining === 0 ? t('zhiya.commons.quota.full') : t('zhiya.commons.quota.remaining', { count: remaining })}）
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted">{t('zhiya.commons.state.loading.title')}</p>
        )}
      </div>
      {error !== null ? (
        <p data-testid="benefit-error" className="text-xs text-danger">
          {t('zhiya.trade.benefits.bookFailed')}
        </p>
      ) : null}
      <button
        type="button"
        data-testid="benefit-submit"
        disabled={submitting || selection.sessionId === ''}
        onClick={onSubmit}
        className="w-full rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white disabled:bg-border-strong disabled:text-muted"
      >
        {submitting ? t('zhiya.trade.benefits.booking') : t('zhiya.trade.benefits.confirm')}
      </button>
    </div>
  );
}
