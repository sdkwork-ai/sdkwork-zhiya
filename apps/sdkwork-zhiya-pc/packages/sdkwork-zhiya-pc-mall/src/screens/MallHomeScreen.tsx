import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { GoodsCard, ScreenState, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient, GOODS_CATEGORIES } from '@sdkwork/zhiya-pc-core';

import { cx } from '../utils/format.js';

/** 商城 (PRD §16, browse-only in P0): 商品分类 + 商品列表. */
export function MallHomeScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<string | null>(null);
  const mallClient = getZhiyaClient('mall');
  const goods = useAsyncData(
    () => mallClient.listGoods((category ?? undefined) as never),
    [mallClient, category],
  );

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.mall.root.title')}</h1>
        <p className="text-xs text-muted">{t('zhiya.mall.root.subtitle')}</p>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 py-2" data-testid="mall-categories">
        <button
          type="button"
          onClick={() => {
            setCategory(null);
          }}
          className={cx(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
            category === null ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
          )}
        >
          {t('zhiya.mall.filter.all')}
        </button>
        {GOODS_CATEGORIES.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => {
              setCategory(entry);
            }}
            className={cx(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
              category === entry ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
            )}
          >
            {t(`zhiya.commons.goodsCategory.${entry}`)}
          </button>
        ))}
      </div>

      <ScreenState
        state={
          goods.state === 'loading'
            ? 'loading'
            : goods.state === 'error'
              ? 'error'
              : goods.data.length === 0
                ? 'empty'
                : 'success'
        }
        onRetry={() => undefined}
      >
        {goods.state === 'ready' ? (
          <div className="grid grid-cols-2 gap-3 px-4 pt-1">
            {goods.data.map((item) => (
              <GoodsCard key={item.id} goods={item} />
            ))}
          </div>
        ) : null}
      </ScreenState>
    </div>
  );
}
