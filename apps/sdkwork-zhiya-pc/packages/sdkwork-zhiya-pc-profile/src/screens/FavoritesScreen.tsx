import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  ActivityCard,
  Avatar,
  Card,
  ListRow,
  Price,
  ScreenState,
  SectionHeader,
  useAsyncData,
} from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';

/** 收藏 (PRD §20): 收藏的活动 + 收藏的商品. */
export function FavoritesScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activityClient = getZhiyaClient('activity');
  const mallClient = getZhiyaClient('mall');

  const favorites = useAsyncData(async () => {
    const [activities, goods] = await Promise.all([
      activityClient.listFavoriteActivities(),
      mallClient.listFavoriteGoods(),
    ]);
    return { activities, goods };
  }, [activityClient, mallClient]);

  const toggleActivityFavorite = async (id: string): Promise<void> => {
    await activityClient.toggleFavorite(id);
    navigate(0);
  };

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.profile.favorites.title')}</h1>
      </header>

      <ScreenState
        state={
          favorites.state === 'loading'
            ? 'loading'
            : favorites.state === 'error'
              ? 'error'
              : favorites.data.activities.length === 0 && favorites.data.goods.length === 0
                ? 'empty'
                : 'success'
        }
        onRetry={() => undefined}
      >
        {favorites.state === 'ready' ? (
          <>
            {favorites.data.activities.length > 0 ? (
              <>
                <SectionHeader title={t('zhiya.profile.favorites.activities')} />
                <div className="grid grid-cols-2 gap-3 px-4">
                  {favorites.data.activities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      favorited
                      onToggleFavorite={(id) => void toggleActivityFavorite(id)}
                    />
                  ))}
                </div>
              </>
            ) : null}
            {favorites.data.goods.length > 0 ? (
              <>
                <SectionHeader title={t('zhiya.profile.favorites.goods')} />
                <Card className="mx-0">
                  {favorites.data.goods.map((goods) => (
                    <ListRow
                      key={goods.id}
                      leading={<Avatar glyph={goods.emoji} />}
                      title={goods.title}
                      description={goods.summary}
                      trailing={<Price value={goods.price} size="sm" />}
                      onClick={() => {
                        navigate(`/mall/goods/${goods.id}`);
                      }}
                    />
                  ))}
                </Card>
              </>
            ) : null}
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}
