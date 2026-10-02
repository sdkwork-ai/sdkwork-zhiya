import { useTranslation } from 'react-i18next';

import { Card, SectionHeader } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';
import type { Activity, OrgAdminView, PlatformStats } from '@sdkwork/zhiya-pc-core';

const KPI_ROWS: readonly { key: keyof PlatformStats; labelKey: string }[] = [
  { key: 'totalFamilies', labelKey: 'zhiya.admin.kpi.families' },
  { key: 'totalChildren', labelKey: 'zhiya.admin.kpi.children' },
  { key: 'totalOrgs', labelKey: 'zhiya.admin.kpi.orgs' },
  { key: 'suspendedOrgs', labelKey: 'zhiya.admin.kpi.suspendedOrgs' },
  { key: 'totalActivities', labelKey: 'zhiya.admin.kpi.activities' },
  { key: 'offlineActivities', labelKey: 'zhiya.admin.kpi.offlineActivities' },
  { key: 'totalOrders', labelKey: 'zhiya.admin.kpi.orders' },
  { key: 'paidOrders', labelKey: 'zhiya.admin.kpi.paidOrders' },
  { key: 'gmv', labelKey: 'zhiya.admin.kpi.gmv' },
  { key: 'refundAmount', labelKey: 'zhiya.admin.kpi.refunds' },
  { key: 'checkInCount', labelKey: 'zhiya.admin.kpi.checkIns' },
  { key: 'reviewCount', labelKey: 'zhiya.admin.kpi.reviews' },
];

/** 平台治理表格：KPI 行 + 机构暂停/恢复 + 活动下架/恢复（操作即时生效）。 */
export function AdminDataTables({
  stats,
  orgs,
  activities,
  onChanged,
}: {
  stats: PlatformStats;
  orgs: OrgAdminView[];
  activities: Activity[];
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const adminClient = getZhiyaClient('admin');

  const run = async (action: () => Promise<unknown>): Promise<void> => {
    await action();
    onChanged();
  };

  return (
    <>
      <SectionHeader title={t('zhiya.admin.kpi.title')} />
      <Card className="mx-6 grid grid-cols-3 gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-4">
        {KPI_ROWS.map((row) => (
          <div key={row.key} className="py-1">
            <p className="text-[0.6875rem] text-muted">{t(row.labelKey)}</p>
            <p data-testid={`kpi-${row.key}`} className="text-sm font-semibold text-primary">
              {row.key === 'gmv' || row.key === 'refundAmount'
                ? `¥${(stats[row.key] as number).toFixed(2)}`
                : String(stats[row.key])}
            </p>
          </div>
        ))}
      </Card>

      <SectionHeader title={t('zhiya.admin.orgs.title')} />
      <Card className="mx-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-xs text-muted">
              <th className="px-4 py-2 font-medium">{t('zhiya.admin.orgs.name')}</th>
              <th className="px-4 py-2 font-medium">{t('zhiya.admin.orgs.activities')}</th>
              <th className="px-4 py-2 font-medium">{t('zhiya.admin.orgs.status')}</th>
              <th className="px-4 py-2 font-medium">{t('zhiya.admin.orgs.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-b border-border-subtle last:border-b-0">
                <td className="px-4 py-2.5">
                  <span className="mr-1" aria-hidden="true">{org.logo}</span>
                  <span className="font-medium text-primary">{org.name}</span>
                  <span className="ml-2 text-xs text-muted">{org.district}</span>
                </td>
                <td className="px-4 py-2.5 text-secondary">{org.activityCount}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      org.status === 'suspended'
                        ? 'rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger'
                        : 'rounded-full bg-success/15 px-2 py-0.5 text-xs text-success'
                    }
                  >
                    {t(`zhiya.admin.orgs.${org.status}`)}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    data-testid={`org-toggle-${org.id}`}
                    onClick={() => {
                      void run(() =>
                        adminClient.setOrgStatus(org.id, org.status === 'suspended' ? 'normal' : 'suspended'),
                      );
                    }}
                    className="rounded-full border border-border-default px-3 py-1 text-xs text-secondary hover:bg-panel-muted"
                  >
                    {org.status === 'suspended' ? t('zhiya.admin.orgs.restore') : t('zhiya.admin.orgs.suspend')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <SectionHeader title={t('zhiya.admin.activities.title')} />
      <Card className="mx-6 mb-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-xs text-muted">
              <th className="px-4 py-2 font-medium">{t('zhiya.admin.activities.name')}</th>
              <th className="px-4 py-2 font-medium">{t('zhiya.admin.activities.org')}</th>
              <th className="px-4 py-2 font-medium">{t('zhiya.admin.activities.status')}</th>
              <th className="px-4 py-2 font-medium">{t('zhiya.admin.activities.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b border-border-subtle last:border-b-0">
                <td className="px-4 py-2.5 font-medium text-primary">
                  <span className="mr-1" aria-hidden="true">{activity.emoji}</span>
                  {activity.title}
                </td>
                <td className="px-4 py-2.5 text-secondary">{activity.orgName}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      activity.status === 'published'
                        ? 'rounded-full bg-success/15 px-2 py-0.5 text-xs text-success'
                        : 'rounded-full bg-panel-muted px-2 py-0.5 text-xs text-muted'
                    }
                  >
                    {t(`zhiya.admin.activities.${activity.status === 'published' ? 'published' : 'offline'}`)}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    data-testid={`activity-toggle-${activity.id}`}
                    onClick={() => {
                      void run(() =>
                        adminClient.setActivityStatus(
                          activity.id,
                          activity.status === 'published' ? 'offline' : 'published',
                        ),
                      );
                    }}
                    className="rounded-full border border-border-default px-3 py-1 text-xs text-secondary hover:bg-panel-muted"
                  >
                    {activity.status === 'published'
                      ? t('zhiya.admin.activities.takeOffline')
                      : t('zhiya.admin.activities.republish')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
