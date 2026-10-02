import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';

import { Avatar, Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-h5-core';
import type { OrderView } from '@sdkwork/zhiya-h5-core';

import { cx } from '../utils/format.js';

const DIMENSIONS = ['overall', 'experience', 'teacher', 'environment', 'service'] as const;

/**
 * 活动评价 (PRD §21): 综合评分 + 活动体验/教师/环境/服务 + 是否推荐 + 图文.
 */
export function ReviewScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId = '' } = useParams<{ orderId: string }>();
  const orderClient = getZhiyaClient('order');
  const reviewClient = getZhiyaClient('review');

  const [scores, setScores] = useState<Record<(typeof DIMENSIONS)[number], number>>({
    overall: 5,
    experience: 5,
    teacher: 5,
    environment: 5,
    service: 5,
  });
  const [recommend, setRecommend] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = useAsyncData<OrderView | null>(() => orderClient.getOrder(orderId), [orderClient, orderId]);

  if (order.state === 'ready' && order.data === null) {
    return <ScreenState state="empty" titleKey="zhiya.trade.detail.notFound" />;
  }
  if (order.state === 'ready' && order.data?.status !== 'pending-review') {
    return <ScreenState state="empty" titleKey="zhiya.trade.review.notReviewable" />;
  }

  const item = order.state === 'ready' ? order.data?.items[0] : undefined;

  const submit = async (): Promise<void> => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await reviewClient.submitReview({
        orderId,
        overall: scores.overall,
        experience: scores.experience,
        teacher: scores.teacher,
        environment: scores.environment,
        service: scores.service,
        recommend,
        content: content.trim(),
        authorName: '鸭家长',
      });
      navigate(`/trade/orders/${orderId}`);
    } catch {
      setError('failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.trade.review.title')}</h1>
      </header>

      <ScreenState
        state={order.state === 'loading' ? 'loading' : order.state === 'error' ? 'error' : 'success'}
        onRetry={() => undefined}
      >
        <Card className="mx-0 flex items-center gap-3 px-4 py-3">
          <span aria-hidden="true" className="text-3xl">{item?.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-primary">{item?.title}</p>
            <p className="text-xs text-muted">{t('zhiya.trade.review.finishedHint')}</p>
          </div>
          <Avatar glyph="🦆" size="sm" />
        </Card>

        <Card className="mx-0 mt-3 space-y-3 px-4 py-4">
          {DIMENSIONS.map((dimension) => (
            <div key={dimension} className="flex items-center justify-between">
              <span className="text-sm text-secondary">{t(`zhiya.trade.review.${dimension}`)}</span>
              <span className="flex gap-1" data-testid={`review-${dimension}`}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={t(`zhiya.trade.review.star`, { value })}
                    onClick={() => {
                      setScores((previous) => ({ ...previous, [dimension]: value }));
                    }}
                  >
                    <Star
                      aria-hidden="true"
                      className={cx(
                        'h-5 w-5',
                        value <= scores[dimension] ? 'fill-warning text-warning' : 'text-border-strong',
                      )}
                    />
                  </button>
                ))}
              </span>
            </div>
          ))}
          <label className="flex items-center justify-between pt-1">
            <span className="text-sm text-secondary">{t('zhiya.trade.review.recommend')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={recommend}
              data-testid="review-recommend"
              onClick={() => {
                setRecommend((value) => !value);
              }}
              className={cx(
                'h-6 w-10 rounded-full p-0.5 transition-colors',
                recommend ? 'bg-success' : 'bg-border-strong',
              )}
            >
              <span
                className={cx(
                  'block h-5 w-5 rounded-full bg-white transition-transform',
                  recommend && 'translate-x-4',
                )}
              />
            </button>
          </label>
        </Card>

        <Card className="mx-0 mt-3 px-4 py-3">
          <textarea
            data-testid="review-content"
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
            }}
            rows={4}
            placeholder={t('zhiya.trade.review.placeholder')}
            className="w-full resize-none bg-transparent text-sm text-primary outline-none placeholder:text-muted"
          />
        </Card>

        {error !== null ? (
          <p className="px-4 pt-3 text-sm text-danger">{t('zhiya.trade.review.failed')}</p>
        ) : null}
      </ScreenState>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[42rem] border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <button
          type="button"
          data-testid="review-submit"
          disabled={submitting || order.state !== 'ready'}
          onClick={() => {
            void submit();
          }}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white disabled:bg-border-strong disabled:text-muted"
        >
          {t('zhiya.trade.review.submit')}
        </button>
      </div>
    </div>
  );
}
