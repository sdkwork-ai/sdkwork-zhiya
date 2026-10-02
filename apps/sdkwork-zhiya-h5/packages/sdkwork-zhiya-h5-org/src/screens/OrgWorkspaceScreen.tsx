import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, Star, TrendingUp, Users } from 'lucide-react';

import { Avatar, Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-h5-core';

/** 机构工作台 (PRD §22.1): 今日报名/待核销/销售额/在架活动/完成率/评分. */
export function OrgWorkspaceScreen() {
  const { t } = useTranslation();
  const orgClient = getZhiyaClient('org');

  const workspace = useAsyncData(async () => {
    const [org, stats] = await Promise.all([orgClient.getMyOrg(), orgClient.getWorkspaceStats()]);
    return { org, stats };
  }, [orgClient]);

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.org.workspace.title')}</h1>
      </header>

      <ScreenState
        state={workspace.state === 'loading' ? 'loading' : workspace.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {workspace.state === 'ready' ? (
          <>
            <Card className="mx-0 flex items-center gap-3 px-4 py-3">
              <Avatar glyph={workspace.data.org.logo} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary">{workspace.data.org.name}</p>
                <p className="text-xs text-muted">{workspace.data.org.district}</p>
              </div>
              <span className="flex items-center gap-1 text-sm text-warning">
                <Star aria-hidden="true" className="h-4 w-4 fill-warning" />
                {workspace.data.stats.rating.toFixed(1)}
              </span>
            </Card>

            <div className="mt-4 grid grid-cols-3 gap-2 px-4">
              <KpiCard
                testId="kpi-today-registrations"
                icon={Users}
                value={String(workspace.data.stats.todayRegistrations)}
                label={t('zhiya.org.workspace.todayRegistrations')}
              />
              <KpiCard
                testId="kpi-pending-checkins"
                icon={ClipboardCheck}
                value={String(workspace.data.stats.pendingCheckIns)}
                label={t('zhiya.org.workspace.pendingCheckIns')}
              />
              <KpiCard
                testId="kpi-sales"
                icon={TrendingUp}
                value={`¥${Math.round(workspace.data.stats.salesToday)}`}
                label={t('zhiya.org.workspace.salesToday')}
              />
              <KpiCard
                testId="kpi-published"
                icon={CalendarDays}
                value={String(workspace.data.stats.publishedActivities)}
                label={t('zhiya.org.workspace.publishedActivities')}
              />
              <KpiCard
                testId="kpi-registrations"
                icon={Users}
                value={String(workspace.data.stats.totalRegistrations)}
                label={t('zhiya.org.workspace.totalRegistrations')}
              />
              <KpiCard
                testId="kpi-completion"
                icon={TrendingUp}
                value={`${Math.round(workspace.data.stats.completionRate * 100)}%`}
                label={t('zhiya.org.workspace.completionRate')}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 px-4">
              <Link
                to="/org/activities"
                data-testid="org-manage-activities"
                className="rounded-2xl bg-brand-soft px-4 py-4 text-center text-sm font-medium text-brand"
              >
                {t('zhiya.org.workspace.manageActivities')}
              </Link>
              <Link
                to="/org/registrations"
                data-testid="org-manage-registrations"
                className="rounded-2xl bg-brand-soft px-4 py-4 text-center text-sm font-medium text-brand"
              >
                {t('zhiya.org.workspace.manageRegistrations')}
              </Link>
            </div>

            <p className="px-4 pt-4 text-xs text-muted">{workspace.data.org.summary}</p>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  value,
  label,
  testId,
}: {
  icon: typeof Users;
  value: string;
  label: string;
  testId: string;
}) {
  return (
    <div data-testid={testId} className="rounded-2xl bg-panel px-3 py-3 shadow-[var(--shadow-card)]">
      <Icon aria-hidden="true" className="h-4 w-4 text-brand" />
      <p className="mt-1.5 text-base font-semibold text-primary">{value}</p>
      <p className="text-[0.625rem] leading-3 text-muted">{label}</p>
    </div>
  );
}
