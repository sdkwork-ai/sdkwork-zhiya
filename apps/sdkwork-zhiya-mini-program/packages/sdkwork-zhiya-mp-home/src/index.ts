/**
 * Home capability view-models for the WeChat surface (PRD §6/§45): 首页
 * overview = recommendations + hot packages, rendered by pages/home.
 */

import { getZhiyaClient } from '@sdkwork/zhiya-service-core';
import type { Activity, ExperiencePackage } from '@sdkwork/zhiya-service-core';

import { formatPrice, formatStart, quotaLabel } from '@sdkwork/zhiya-mp-commons';

export interface ActivityCardView {
  id: string;
  emoji: string;
  title: string;
  orgName: string;
  categoryLabel: string;
  priceLabel: string;
  originalLabel: string | null;
  quotaLabel: string;
  startLabel: string;
}

export interface PackageCardView {
  id: string;
  emoji: string;
  title: string;
  summary: string;
  priceLabel: string;
  originalLabel: string | null;
  purchasedCount: number;
  activityCount: number;
}

export function toActivityCardView(activity: Activity, categoryLabel: string): ActivityCardView {
  return {
    id: activity.id,
    emoji: activity.emoji,
    title: activity.title,
    orgName: activity.orgName,
    categoryLabel,
    priceLabel: formatPrice(activity.price),
    originalLabel: activity.originalPrice > activity.price ? `¥${activity.originalPrice}` : null,
    quotaLabel: quotaLabel(activity.quota, activity.enrolled),
    startLabel: formatStart(activity.startTime),
  };
}

export function toPackageCardView(pkg: ExperiencePackage): PackageCardView {
  return {
    id: pkg.id,
    emoji: pkg.emoji,
    title: pkg.title,
    summary: pkg.summary,
    priceLabel: formatPrice(pkg.price),
    originalLabel: pkg.originalPrice > pkg.price ? `¥${pkg.originalPrice}` : null,
    purchasedCount: pkg.purchasedCount,
    activityCount: pkg.activityIds.length,
  };
}

export interface HomeOverview {
  recommendations: ActivityCardView[];
  hotPackages: PackageCardView[];
}

/** Load the 首页 overview (recommendations + hot packages, PRD §6.2). */
export async function loadHomeOverview(categoryLabels: Record<string, string>): Promise<HomeOverview> {
  const activity = getZhiyaClient('activity');
  const pkg = getZhiyaClient('package');
  const [recommendations, hotPackages] = await Promise.all([
    activity.listHomeRecommendations(),
    pkg.listHotPackages(),
  ]);
  return {
    recommendations: recommendations.slice(0, 6).map((entry) => toActivityCardView(entry, categoryLabels[entry.category] ?? entry.category)),
    hotPackages: hotPackages.map(toPackageCardView),
  };
}
