import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  ActivityCard,
  Card,
  Price,
  ScreenState,
  SectionHeader,
  useAsyncData,
} from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient, RegistrationError } from '@sdkwork/zhiya-pc-core';
import type { Activity, ExperiencePackage } from '@sdkwork/zhiya-pc-core';

interface PackageDetailData {
  pkg: ExperiencePackage | null;
  activities: Activity[];
}

/**
 * 体验包详情 (PRD §12.2/§12.3): 包含活动、有效期、购买规则; 本里程碑支持
 * 直接购买 (权益预约为 P1, PRD §44).
 */
export function PackageDetailScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { packageId = '' } = useParams<{ packageId: string }>();
  const packageClient = getZhiyaClient('package');
  const activityClient = getZhiyaClient('activity');
  const orderClient = getZhiyaClient('order');
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPackage = useCallback(async (): Promise<PackageDetailData> => {
    const pkg = await packageClient.getPackage(packageId);
    if (pkg === null) {
      return { pkg: null, activities: [] };
    }
    const activities = await Promise.all(
      pkg.activityIds.map((id) => activityClient.getActivity(id)),
    );
    return { pkg, activities: activities.filter((entry): entry is NonNullable<typeof entry> => entry !== null) };
  }, [packageClient, activityClient, packageId]);

  const data = useAsyncData(loadPackage, [loadPackage]);

  if (data.state === 'ready' && data.data.pkg === null) {
    return <ScreenState state="empty" titleKey="zhiya.activity.package.notFound" />;
  }

  const buy = async (): Promise<void> => {
    if (data.state !== 'ready' || data.data.pkg === null || buying) {
      return;
    }
    setBuying(true);
    setError(null);
    try {
      const applicable = await orderClient.listApplicableCoupons(
        { kind: 'package', id: packageId },
        data.data.pkg.price,
      );
      const order = await orderClient.createPackageOrder(packageId, applicable[0]?.id);
      navigate(`/activity/pay/${order.id}`);
    } catch (caught) {
      setError(caught instanceof RegistrationError ? caught.code : 'not-open');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="pb-24">
      <ScreenState
        state={data.state === 'loading' ? 'loading' : data.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {data.state === 'ready' && data.data.pkg !== null ? (
          <>
            <div className="flex items-center justify-center bg-brand-soft py-10 text-6xl" aria-hidden="true">
              {data.data.pkg.emoji}
            </div>
            <div className="space-y-2 px-4 pt-3">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-lg font-semibold text-primary">{data.data.pkg.title}</h1>
                <Price
                  value={data.data.pkg.price}
                  originalValue={data.data.pkg.originalPrice}
                  size="lg"
                />
              </div>
              <p className="text-sm text-secondary">{data.data.pkg.summary}</p>
              <p className="text-xs text-muted">
                {data.data.pkg.ageMin}-{data.data.pkg.ageMax}
                {t('zhiya.commons.age.unit')} ·{' '}
                {t('zhiya.activity.package.validDays', { days: data.data.pkg.validDays })} ·{' '}
                {t('zhiya.commons.package.purchasedSuffix', { count: data.data.pkg.purchasedCount })}
              </p>
            </div>

            <SectionHeader
              title={t('zhiya.activity.package.includes', { count: data.data.pkg.activityIds.length })}
            />
            <div className="space-y-3 px-4">
              {data.data.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>

            <Card className="mt-4 px-4 py-3 text-xs leading-5 text-muted">
              <p className="mb-1 font-medium text-secondary">{t('zhiya.activity.package.rulesTitle')}</p>
              <p>{t('zhiya.activity.package.rule1')}</p>
              <p>{t('zhiya.activity.package.rule2')}</p>
              <p>{t('zhiya.activity.package.rule3')}</p>
            </Card>

            {error !== null ? (
              <p className="px-4 pt-3 text-sm text-danger">{t('zhiya.activity.package.buyFailed')}</p>
            ) : null}

            <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[42rem] border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
              <div className="flex items-center gap-3">
                <Link to="/activity/packages" className="text-xs text-muted">
                  {t('zhiya.activity.package.morePackages')}
                </Link>
                <button
                  type="button"
                  data-testid="package-buy"
                  disabled={buying}
                  onClick={() => {
                    void buy();
                  }}
                  className="ml-auto rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-opacity hover:bg-brand-hover disabled:bg-border-strong disabled:text-muted"
                >
                  {t('zhiya.activity.package.buy', { price: data.data.pkg.price })}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}
