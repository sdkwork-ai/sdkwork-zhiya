import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { ExperiencePackage } from '@sdkwork/zhiya-h5-core';

import { Price } from './Price.js';
import { formatCount } from '../utils/format.js';

export interface PackageCardProps {
  pkg: ExperiencePackage;
}

/** 体验包卡片 (PRD §6.2/§12.2): title, 适龄, 活动数, 原价/售价, 已购人数. */
export function PackageCard({ pkg }: PackageCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div
      data-testid={`package-card-${pkg.id}`}
      className="w-64 shrink-0 cursor-pointer rounded-2xl border border-border-subtle bg-panel p-3 shadow-[var(--shadow-card)]"
      onClick={() => {
        navigate(`/activity/package/${pkg.id}`);
      }}
    >
      <div className="flex items-start gap-2">
        <span aria-hidden="true" className="text-3xl">
          {pkg.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">{pkg.title}</p>
          <p className="text-xs text-muted">
            {pkg.ageMin}-{pkg.ageMax}
            {t('zhiya.commons.age.unit')} ·{' '}
            {t('zhiya.commons.package.activityCount', { count: pkg.activityIds.length })}
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 min-h-8 text-xs text-secondary">{pkg.summary}</p>
      <div className="mt-2 flex items-center justify-between">
        <Price value={pkg.price} originalValue={pkg.originalPrice} size="md" />
        <span className="text-xs text-muted">
          {formatCount(pkg.purchasedCount)}
          {t('zhiya.commons.package.purchasedSuffix')}
        </span>
      </div>
    </div>
  );
}
