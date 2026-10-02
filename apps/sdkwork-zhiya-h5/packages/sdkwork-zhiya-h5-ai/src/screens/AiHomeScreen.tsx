import { useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Send, Bird } from 'lucide-react';

import { Avatar, Price, ScreenState } from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-h5-core';
import type { Activity, AiPlan } from '@sdkwork/zhiya-h5-core';

import { cx } from '../utils/format.js';

interface Turn {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  messageKey?: string;
  params?: Record<string, string | number>;
  activities?: Activity[];
  plan?: AiPlan;
  followUps?: string[];
  loading?: boolean;
}

const STARTERS = [
  '8岁孩子适合学什么？',
  '周末有什么亲子活动？',
  '想让孩子体验编程，有什么课程？',
  '预算100元，帮我安排一个周末体验计划。',
] as const;

/**
 * 问知鸭 AI 首页 (PRD §14): 自然语言提问 → 理解 → 推荐活动/体验包 →
 * 时间安排, 支持一键报名.
 */
export function AiHomeScreen() {
  const { t } = useTranslation();
  const aiClient = getZhiyaClient('ai');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const ask = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || busy) {
      return;
    }
    setBusy(true);
    setQuery('');
    const loadingId = `turn-${Date.now()}-loading`;
    setTurns((previous) => [
      ...previous,
      { id: `turn-${Date.now()}-user`, role: 'user', text: trimmed },
      { id: loadingId, role: 'assistant', loading: true },
    ]);
    try {
      const reply = await aiClient.ask(trimmed);
      setTurns((previous) =>
        previous.map((turn) =>
          turn.id === loadingId
            ? {
                id: loadingId,
                role: 'assistant',
                messageKey: reply.messageKey,
                params: reply.params,
                activities: reply.activities,
                ...(reply.plan !== undefined ? { plan: reply.plan } : {}),
                followUps: reply.followUps,
              }
            : turn,
        ),
      );
    } catch {
      setTurns((previous) =>
        previous.map((turn) =>
          turn.id === loadingId
            ? { id: loadingId, role: 'assistant', messageKey: 'zhiya.ai.error', params: {} }
            : turn,
        ),
      );
    } finally {
      setBusy(false);
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Bird aria-hidden="true" className="h-6 w-6 text-brand" />
        <div>
          <h1 className="text-base font-semibold text-primary">{t('zhiya.ai.root.title')}</h1>
          <p className="text-xs text-muted">{t('zhiya.ai.root.subtitle')}</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2" data-testid="ai-thread">
        {turns.length === 0 ? (
          <div className="pt-8">
            <div className="flex items-start gap-2">
              <Avatar glyph="🦆" size="sm" />
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-panel px-3 py-2.5 text-sm leading-6 text-primary">
                {t('zhiya.ai.greeting')}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  data-testid="ai-starter"
                  onClick={() => {
                    void ask(starter);
                  }}
                  className="rounded-full border border-border-subtle bg-panel px-3 py-2 text-xs text-secondary hover:bg-panel-muted"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {turns.map((turn) => (
              <TurnBubble key={turn.id} turn={turn} onFollowUp={(next) => void ask(next)} />
            ))}
            <div ref={listEndRef} />
          </div>
        )}
      </div>

      <ScreenState state={busy ? 'loading' : 'success'}>
        <span />
      </ScreenState>

      <form
        className="flex items-center gap-2 border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(query);
        }}
      >
        <input
          data-testid="ai-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder={t('zhiya.ai.inputPlaceholder')}
          className="flex-1 rounded-full bg-canvas px-4 py-2.5 text-sm text-primary outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label={t('zhiya.ai.send')}
          data-testid="ai-send"
          disabled={busy || query.trim().length === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white disabled:bg-border-strong disabled:text-muted"
        >
          <Send aria-hidden="true" className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function TurnBubble({ turn, onFollowUp }: { turn: Turn; onFollowUp: (query: string) => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (turn.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand px-3 py-2.5 text-sm text-white">
          {turn.text}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="ai-turn" className="flex items-start gap-2">
      <Avatar glyph="🦆" size="sm" />
      <div className="min-w-0 max-w-[85%] space-y-3">
        <div
          className={cx(
            'rounded-2xl rounded-tl-sm bg-panel px-3 py-2.5 text-sm leading-6 text-primary',
            turn.loading && 'animate-pulse text-muted',
          )}
        >
          {turn.loading ? t('zhiya.ai.thinking') : turn.messageKey !== undefined ? t(turn.messageKey, turn.params ?? {}) : (turn.text ?? '')}
        </div>

        {turn.plan !== undefined ? (
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-panel">
            <p className="border-b border-border-subtle px-3 py-2 text-xs font-semibold text-primary">
              {t('zhiya.ai.planTitle', { total: turn.plan.totalCost })}
            </p>
            {turn.plan.weeks.map((week) => (
              <button
                key={week.activityId}
                type="button"
                data-testid={`ai-plan-week-${week.weekIndex}`}
                onClick={() => {
                  navigate(`/activity/detail/${week.activityId}`);
                }}
                className="flex w-full items-center justify-between border-b border-border-subtle px-3 py-2 text-left text-xs last:border-b-0 hover:bg-panel-muted"
              >
                <span className="text-secondary">
                  {t('zhiya.ai.planWeek', { index: week.weekIndex })} · {week.title}
                </span>
                <span className="text-brand">¥{week.price}</span>
              </button>
            ))}
          </div>
        ) : null}

        {(turn.activities ?? []).map((activity) => (
          <div
            key={activity.id}
            data-testid="ai-recommendation"
            className="flex items-center gap-2 rounded-2xl border border-border-subtle bg-panel px-3 py-2"
          >
            <span aria-hidden="true" className="text-2xl">
              {activity.emoji}
            </span>
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                navigate(`/activity/detail/${activity.id}`);
              }}
            >
              <span className="block truncate text-xs font-medium text-primary">{activity.title}</span>
              <span className="block truncate text-xs text-muted">{activity.orgName}</span>
            </button>
            <Price value={activity.price} size="sm" />
            <button
              type="button"
              onClick={() => {
                navigate(`/activity/register/${activity.id}`);
              }}
              className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white"
            >
              {t('zhiya.ai.register')}
            </button>
          </div>
        ))}

        {turn.followUps !== undefined && turn.followUps.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {turn.followUps.slice(0, 2).map((followUp) => (
              <button
                key={followUp}
                type="button"
                onClick={() => {
                  onFollowUp(followUp);
                }}
                className="rounded-full border border-border-subtle bg-canvas px-3 py-1.5 text-xs text-muted hover:bg-panel-muted"
              >
                {followUp}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
