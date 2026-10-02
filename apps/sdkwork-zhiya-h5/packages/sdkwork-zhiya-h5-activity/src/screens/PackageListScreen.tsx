import { useTranslation } from 'react-i18next';

import { PackageCard, ScreenState, useAsyncData } from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-h5-core';

/** 体验包列表 (PRD §12.2): 多机构联合体验包. */
export function PackageListScreen() {
  const { t } = useTranslation();
  const packageClient = getZhiyaClient('package');
  const packages = useAsyncData(() => packageClient.listPackages(), [packageClient]);

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.activity.packages.title')}</h1>
        <p className="text-xs text-muted">{t('zhiya.activity.packages.subtitle')}</p>
      </header>
      <ScreenState
        state={
          packages.state === 'loading'
            ? 'loading'
            : packages.state === 'error'
              ? 'error'
              : packages.data.length === 0
                ? 'empty'
                : 'success'
        }
        onRetry={() => undefined}
      >
        {packages.state === 'ready' ? (
          <div className="grid grid-cols-1 gap-3 px-4 pt-2">
            {packages.data.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : null}
      </ScreenState>
    </div>
  );
}
