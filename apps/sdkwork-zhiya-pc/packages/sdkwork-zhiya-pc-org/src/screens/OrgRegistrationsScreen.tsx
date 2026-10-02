import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ScanLine } from 'lucide-react';

import { Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient, VerifyVoucherError } from '@sdkwork/zhiya-pc-core';

import { cx } from '../utils/format.js';

/**
 * 报名管理 + 核销 (PRD §22.4/§11): 按活动查看报名, 输入/扫描凭证核销,
 * 活动结束确认.
 */
export function OrgRegistrationsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const orgClient = getZhiyaClient('org');
  const checkinClient = getZhiyaClient('checkin');
  const [activityId, setActivityId] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const published = useAsyncData(() => orgClient.listOrgActivities('published'), [orgClient]);

  const selectedActivityId =
    activityId ?? (published.state === 'ready' ? (published.data[0]?.id ?? null) : null);

  const registrations = useAsyncData(
    () =>
      selectedActivityId === null
        ? Promise.resolve([])
        : checkinClient.listOrgRegistrations({ activityId: selectedActivityId }),
    [checkinClient, selectedActivityId],
  );

  const checkIn = async (code: string): Promise<void> => {
    setError(null);
    setNotice(null);
    try {
      const view = await checkinClient.verifyVoucher(code);
      setVoucherInput('');
      setNotice(t('zhiya.org.registrations.checkedIn', { child: view.childName }));
      navigate(0);
    } catch (caught) {
      if (caught instanceof VerifyVoucherError) {
        setError(caught.code);
      } else {
        setError('voucher-not-found');
      }
    }
  };

  const complete = async (): Promise<void> => {
    if (selectedActivityId === null) {
      return;
    }
    const count = await checkinClient.completeActivity(selectedActivityId);
    setNotice(t('zhiya.org.registrations.completed', { count }));
    navigate(0);
  };

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.org.registrations.title')}</h1>
      </header>

      <ScreenState
        state={published.state === 'loading' ? 'loading' : published.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {published.state === 'ready' && published.data.length === 0 ? (
          <p className="px-4 pt-8 text-center text-sm text-muted">{t('zhiya.org.registrations.noActivities')}</p>
        ) : null}

        {published.state === 'ready' && published.data.length > 0 ? (
          <>
            <div className="flex gap-2 overflow-x-auto px-4 py-2" data-testid="org-activity-tabs">
              {published.data.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => {
                    setActivityId(activity.id);
                  }}
                  className={cx(
                    'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
                    selectedActivityId === activity.id
                      ? 'bg-brand text-white'
                      : 'bg-panel text-secondary border border-border-subtle',
                  )}
                >
                  {activity.title}
                </button>
              ))}
            </div>

            <Card className="mx-0 px-4 py-3">
              <div className="flex items-center gap-2">
                <ScanLine aria-hidden="true" className="h-4 w-4 text-brand" />
                <input
                  data-testid="voucher-input"
                  value={voucherInput}
                  onChange={(event) => {
                    setVoucherInput(event.target.value.toUpperCase());
                  }}
                  placeholder={t('zhiya.org.registrations.voucherPlaceholder')}
                  className="flex-1 rounded-xl bg-canvas px-3 py-2 text-sm tracking-widest outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  data-testid="voucher-verify"
                  disabled={voucherInput.trim().length === 0}
                  onClick={() => {
                    void checkIn(voucherInput.trim());
                  }}
                  className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white disabled:bg-border-strong disabled:text-muted"
                >
                  {t('zhiya.org.registrations.verify')}
                </button>
              </div>
              {error !== null ? (
                <p data-testid="voucher-error" className="pt-2 text-xs text-danger">
                  {t(`zhiya.org.registrations.error.${error}`)}
                </p>
              ) : null}
              {notice !== null ? (
                <p data-testid="voucher-notice" className="pt-2 text-xs text-success">
                  {notice}
                </p>
              ) : null}
            </Card>

            <div className="flex justify-end px-4 pt-3">
              <button
                type="button"
                data-testid="complete-activity"
                onClick={() => {
                  void complete();
                }}
                className="rounded-full border border-border-default px-4 py-2 text-xs text-secondary"
              >
                {t('zhiya.org.registrations.completeActivity')}
              </button>
            </div>

            <ScreenState
              state={
                registrations.state === 'loading'
                  ? 'loading'
                  : registrations.state === 'error'
                    ? 'error'
                    : registrations.data.length === 0
                      ? 'empty'
                      : 'success'
              }
              onRetry={() => undefined}
            >
              {registrations.state === 'ready' ? (
                <div className="mt-2 space-y-2 px-4">
                  {registrations.data.map((registration) => (
                    <Card key={registration.orderId} className="mx-0 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-primary">
                            {registration.childName || t('zhiya.org.registrations.anonymous')}
                          </p>
                          <p className="text-xs text-muted">
                            {registration.sessionLabel} · {registration.parentPhone}
                          </p>
                          <p className="mt-0.5 font-mono text-xs tracking-widest text-brand">
                            {registration.voucherCode}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span className="text-[0.625rem] text-muted">
                            {t(`zhiya.commons.orderStatus.${registration.status}`)}
                          </span>
                          {registration.checkInState === 'checked-in' ? (
                            <span className="rounded-full bg-success/15 px-2 py-1 text-[0.625rem] font-medium text-success">
                              {t('zhiya.commons.checkInState.checked-in')}
                            </span>
                          ) : registration.status === 'upcoming' || registration.status === 'ongoing' ? (
                            <button
                              type="button"
                              data-testid={`checkin-${registration.orderId}`}
                              onClick={() => {
                                void checkIn(registration.voucherCode);
                              }}
                              className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              {t('zhiya.org.registrations.checkIn')}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : null}
            </ScreenState>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}
