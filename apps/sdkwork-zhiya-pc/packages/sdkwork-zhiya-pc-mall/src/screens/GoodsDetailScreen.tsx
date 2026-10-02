import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';

import {
  Card,
  GoodsCard,
  Price,
  ScreenState,
  SectionHeader,
  useAsyncData,
} from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';

/** 商品详情 (PRD §16.2): 图片/标题/价格/规格/详情/评价入口/相关推荐. */
export function GoodsDetailScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goodsId = '' } = useParams<{ goodsId: string }>();
  const mallClient = getZhiyaClient('mall');

  const detail = useAsyncData(async () => {
    const [goods, favorites, all] = await Promise.all([
      mallClient.getGoods(goodsId),
      mallClient.listFavoriteGoods(),
      mallClient.listGoods(),
    ]);
    return {
      goods,
      favorited: favorites.some((entry) => entry.id === goodsId),
      related: all.filter((entry) => entry.id !== goodsId && entry.category === goods?.category).slice(0, 2),
    };
  }, [mallClient, goodsId]);

  if (detail.state === 'ready' && detail.data.goods === null) {
    return <ScreenState state="empty" titleKey="zhiya.mall.goods.notFound" />;
  }

  const toggleFavorite = async (): Promise<void> => {
    await mallClient.toggleFavoriteGoods(goodsId);
    navigate(0);
  };

  return (
    <div className="pb-24">
      <ScreenState
        state={detail.state === 'loading' ? 'loading' : detail.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        {detail.state === 'ready' && detail.data.goods !== null ? (
          <>
            <div className="flex items-center justify-center bg-panel-muted py-14 text-7xl" aria-hidden="true">
              {detail.data.goods.emoji}
            </div>
            <div className="space-y-2 px-4 pt-3">
              <h1 className="text-base leading-snug font-semibold text-primary">{detail.data.goods.title}</h1>
              <Price value={detail.data.goods.price} originalValue={detail.data.goods.originalPrice} size="lg" />
              <p className="text-sm text-secondary">{detail.data.goods.summary}</p>
              <p className="text-xs text-muted">
                {t('zhiya.commons.goods.sales', { count: detail.data.goods.sales })} · {detail.data.goods.spec}
              </p>
            </div>

            <SectionHeader title={t('zhiya.mall.goods.detail')} />
            <Card className="px-4 py-3 text-sm leading-6 text-secondary">{detail.data.goods.detail}</Card>

            {detail.data.related.length > 0 ? (
              <>
                <SectionHeader title={t('zhiya.mall.goods.related')} />
                <div className="grid grid-cols-2 gap-3 px-4">
                  {detail.data.related.map((item) => (
                    <GoodsCard key={item.id} goods={item} />
                  ))}
                </div>
              </>
            ) : null}

            <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[42rem] border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={t('zhiya.commons.action.favorite')}
                  data-testid="goods-favorite"
                  onClick={() => {
                    void toggleFavorite();
                  }}
                  className="flex flex-col items-center px-2 text-muted"
                >
                  <Heart
                    aria-hidden="true"
                    className={detail.data.favorited ? 'h-5 w-5 fill-danger text-danger' : 'h-5 w-5'}
                  />
                  <span className="text-[0.625rem]">{t('zhiya.commons.action.favorite')}</span>
                </button>
                <span
                  data-testid="goods-buy-soon"
                  className="flex-1 rounded-full bg-border-strong px-6 py-3 text-center text-sm font-semibold text-muted"
                >
                  {t('zhiya.mall.goods.buySoon')}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}
