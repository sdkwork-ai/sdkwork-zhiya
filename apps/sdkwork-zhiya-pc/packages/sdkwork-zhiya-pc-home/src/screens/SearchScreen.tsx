import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import {
  ActivityCard,
  Avatar,
  Card,
  ListRow,
  PackageCard,
  ScreenState,
  SectionHeader,
  useAsyncData,
} from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';

/**
 * 全局搜索 (PRD §6.2/§32): 搜课程、活动、机构、商品。Keyword search across
 * the activity catalog, experience packages, orgs, and mall goods.
 */
export function SearchScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const [submitted, setSubmitted] = useState(searchParams.get('q') ?? '');

  const activity = getZhiyaClient('activity');
  const pkg = getZhiyaClient('package');
  const mall = getZhiyaClient('mall');

  const hasQuery = submitted.trim().length > 0;
  const results = useAsyncData(async () => {
    if (!hasQuery) {
      return { activities: [], packages: [], orgs: [], goods: [] };
    }
    const [activities, packages, orgs, goods] = await Promise.all([
      activity.listActivities({ keyword: submitted }),
      pkg.listPackages(),
      activity.listOrgs(submitted),
      mall.listGoods(undefined, submitted),
    ]);
    const needle = submitted.trim().toLowerCase();
    return {
      activities,
      packages: packages.filter((entry) =>
        `${entry.title} ${entry.summary}`.toLowerCase().includes(needle),
      ),
      orgs,
      goods,
    };
  }, [activity, pkg, mall, submitted, hasQuery]);

  const total =
    results.state === 'ready'
      ? results.data.activities.length +
        results.data.packages.length +
        results.data.orgs.length +
        results.data.goods.length
      : 0;

  return (
    <div className="pb-6">
      <header className="flex items-center gap-2 px-4 pt-4 pb-2">
        <form
          className="flex flex-1 items-center gap-2 rounded-full border border-border-default bg-panel px-3 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(keyword);
          }}
        >
          <Search aria-hidden="true" className="h-4 w-4 text-muted" />
          <input
            data-testid="search-input"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
            }}
            placeholder={t('zhiya.home.searchPlaceholder')}
            className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted"
          />
        </form>
        <button
          type="button"
          className="text-sm text-brand"
          onClick={() => {
            navigate(-1);
          }}
        >
          {t('zhiya.commons.action.back')}
        </button>
      </header>

      <ScreenState state={results.state === 'loading' ? 'loading' : results.state === 'error' ? 'error' : total === 0 && hasQuery ? 'empty' : 'success'}>
        {results.state === 'ready' ? (
          <>
            {!hasQuery ? (
              <p className="px-4 pt-8 text-center text-sm text-muted">{t('zhiya.home.search.hint')}</p>
            ) : null}
            {results.data.activities.length > 0 ? (
              <>
                <SectionHeader title={t('zhiya.home.search.activities')} />
                <div className="grid grid-cols-2 gap-3 px-4">
                  {results.data.activities.map((item) => (
                    <ActivityCard key={item.id} activity={item} />
                  ))}
                </div>
              </>
            ) : null}
            {results.data.packages.length > 0 ? (
              <>
                <SectionHeader title={t('zhiya.home.search.packages')} />
                <div className="flex gap-3 overflow-x-auto px-4 pb-1">
                  {results.data.packages.map((item) => (
                    <PackageCard key={item.id} pkg={item} />
                  ))}
                </div>
              </>
            ) : null}
            {results.data.orgs.length > 0 ? (
              <>
                <SectionHeader title={t('zhiya.home.search.orgs')} />
                <Card>
                  {results.data.orgs.map((org) => (
                    <ListRow
                      key={org.id}
                      leading={<Avatar glyph={org.logo} />}
                      title={org.name}
                      description={org.summary}
                      trailing={t('zhiya.home.search.orgRating', { rating: org.rating.toFixed(1) })}
                    />
                  ))}
                </Card>
              </>
            ) : null}
            {results.data.goods.length > 0 ? (
              <>
                <SectionHeader title={t('zhiya.home.search.goods')} />
                <Card>
                  {results.data.goods.map((goods) => (
                    <ListRow
                      key={goods.id}
                      leading={<Avatar glyph={goods.emoji} />}
                      title={goods.title}
                      description={goods.summary}
                      trailing={t('zhiya.home.search.goodsSales', { count: goods.sales })}
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
