import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ScreenState, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';
import type { PlatformStats } from '@sdkwork/zhiya-pc-core';

import { AdminDataTables } from '../components/AdminDataTables.js';

/**
 * 平台后台仪表盘 (PRD §25.1/§25.3): 平台 KPI + 机构治理（暂停/恢复） +
 * 活动治理（下架/恢复上架）。治理操作即时生效于 C 端列表。
 */
export function AdminDashboardScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const adminClient = getZhiyaClient('admin');

  const loadDashboard = useCallback(async () => {
    const [stats, orgs, activities] = await Promise.all([
      adminClient.platformStats(),
      adminClient.listOrgs(),
      adminClient.listAllActivities(),
    ]);
    return { stats, orgs, activities };
  }, [adminClient]);

  const dashboard = useAsyncData(loadDashboard, [loadDashboard]);

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <header className="px-6 pt-6 pb-1">
        <h1 className="text-xl font-semibold text-primary">{t('zhiya.admin.dashboard.title')}</h1>
        <p className="text-xs text-muted">{t('zhiya.admin.dashboard.subtitle')}</p>
      </header>

      <ScreenState
        state={dashboard.state === 'loading' ? 'loading' : dashboard.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {dashboard.state === 'ready' ? (
          <AdminDataTables
            stats={dashboard.data.stats as PlatformStats}
            orgs={dashboard.data.orgs}
            activities={dashboard.data.activities}
            onChanged={() => navigate(0)}
          />
        ) : null}
      </ScreenState>
    </div>
  );
}
