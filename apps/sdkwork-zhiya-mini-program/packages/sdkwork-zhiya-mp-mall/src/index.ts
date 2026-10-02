/**
 * Mall capability view-models for the WeChat surface (PRD §16, browse-only
 * in this milestone): category tabs + goods list + detail + favorite.
 */

import { getZhiyaClient, GOODS_CATEGORIES } from '@sdkwork/zhiya-service-core';
import type { Goods } from '@sdkwork/zhiya-service-core';

import { formatPrice } from '@sdkwork/zhiya-mp-commons';

const GOODS_CATEGORY_ENTRIES: readonly (readonly [string, string])[] = [
  ['stationery', '文具'],
  ['books', '图书'],
  ['painting', '绘画'],
  ['science', '科学实验'],
  ['programming', '编程'],
  ['robotics', '机器人'],
  ['teaching-aids', '教具'],
  ['supplies', '学习用品'],
];

export const GOODS_CATEGORY_TABS: readonly { id: string; label: string }[] = [
  { id: 'all', label: '全部' },
  ...GOODS_CATEGORY_ENTRIES.map(([id, label]) => ({ id, label })),
];

export interface GoodsCardView {
  id: string;
  emoji: string;
  title: string;
  priceLabel: string;
  originalLabel: string | null;
  salesLabel: string;
}

export function toGoodsCardView(goods: Goods): GoodsCardView {
  return {
    id: goods.id,
    emoji: goods.emoji,
    title: goods.title,
    priceLabel: formatPrice(goods.price),
    originalLabel: goods.originalPrice > goods.price ? `¥${goods.originalPrice}` : null,
    salesLabel: `已售 ${goods.sales}`,
  };
}

/** List goods, optionally by category token (PRD §16.1). */
export async function listGoods(category?: string): Promise<GoodsCardView[]> {
  const mall = getZhiyaClient('mall');
  const list = await mall.listGoods(
    category === undefined || category === 'all' ? undefined : (category as never),
  );
  return list.map(toGoodsCardView);
}

export interface GoodsDetailView extends GoodsCardView {
  summary: string;
  detail: string;
  spec: string;
}

/** Goods detail (PRD §16.2). */
export async function loadGoodsDetail(goodsId: string): Promise<GoodsDetailView | null> {
  const mall = getZhiyaClient('mall');
  const goods = await mall.getGoods(goodsId);
  if (goods === null) {
    return null;
  }
  return {
    ...toGoodsCardView(goods),
    summary: goods.summary,
    detail: goods.detail,
    spec: goods.spec,
  };
}

/** Toggle the goods favorite; returns the new state. */
export async function toggleGoodsFavorite(goodsId: string): Promise<boolean> {
  const mall = getZhiyaClient('mall');
  return mall.toggleFavoriteGoods(goodsId);
}

export { GOODS_CATEGORIES };
