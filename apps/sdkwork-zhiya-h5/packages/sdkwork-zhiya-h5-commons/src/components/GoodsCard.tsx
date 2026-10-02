import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { Goods } from '@sdkwork/zhiya-h5-core';

import { Price } from './Price.js';
import { formatCount } from '../utils/format.js';

export interface GoodsCardProps {
  goods: Goods;
}

/** 商品卡片 (PRD §16). */
export function GoodsCard({ goods }: GoodsCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      data-testid={`goods-card-${goods.id}`}
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-panel text-left shadow-[var(--shadow-card)]"
      onClick={() => {
        navigate(`/mall/goods/${goods.id}`);
      }}
    >
      <div className="flex items-center justify-center bg-panel-muted py-6 text-4xl" aria-hidden="true">
        {goods.emoji}
      </div>
      <div className="space-y-1 px-2.5 pt-2 pb-2.5">
        <p className="line-clamp-2 min-h-8 text-xs leading-4 font-medium text-primary">{goods.title}</p>
        <Price value={goods.price} originalValue={goods.originalPrice} size="sm" />
        <p className="text-xs text-muted">
          {t('zhiya.commons.goods.sales', { count: formatCount(goods.sales) })}
        </p>
      </div>
    </button>
  );
}
