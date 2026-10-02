import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-h5-commons';
import { getZhiyaClient, MESSAGE_CATEGORIES, useTabBadgeStore } from '@sdkwork/zhiya-h5-core';
import type { MessageCategory } from '@sdkwork/zhiya-h5-core';

import { cx } from '../utils/format.js';

type CategoryFilter = MessageCategory | 'all';

/** 消息中心 (PRD §18): 分类通知 + 未读角标 + 全部已读. */
export function MessagesScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const messageClient = getZhiyaClient('message');
  const setUnreadMessages = useTabBadgeStore((state) => state.setUnreadMessages);
  const [category, setCategory] = useState<CategoryFilter>('all');

  const messages = useAsyncData(async () => {
    const [list, unread] = await Promise.all([
      messageClient.listMessages(category),
      messageClient.unreadCount(),
    ]);
    setUnreadMessages(unread);
    return list;
  }, [messageClient, category, setUnreadMessages]);

  useEffect(() => {
    return () => {
      // Refresh the badge when leaving (messages may have been marked read).
      void messageClient.unreadCount().then(setUnreadMessages);
    };
  }, [messageClient, setUnreadMessages]);

  const markAll = async (): Promise<void> => {
    await messageClient.markAllRead(category);
    navigate(0);
  };

  return (
    <div className="pb-6">
      <header className="flex items-center px-4 pt-4 pb-1">
        <h1 className="flex-1 text-lg font-semibold text-primary">{t('zhiya.profile.messages.title')}</h1>
        <button
          type="button"
          data-testid="messages-mark-all"
          onClick={() => {
            void markAll();
          }}
          className="text-xs text-brand"
        >
          {t('zhiya.profile.messages.markAll')}
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 py-2" data-testid="message-category-tabs">
        {(['all', ...MESSAGE_CATEGORIES] as const).map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => {
              setCategory(entry as CategoryFilter);
            }}
            className={cx(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
              category === entry ? 'bg-brand text-white' : 'bg-panel text-secondary border border-border-subtle',
            )}
          >
            {entry === 'all' ? t('zhiya.profile.messages.all') : t(`zhiya.commons.messageCategory.${entry}`)}
          </button>
        ))}
      </div>

      <ScreenState
        state={
          messages.state === 'loading'
            ? 'loading'
            : messages.state === 'error'
              ? 'error'
              : messages.data.length === 0
                ? 'empty'
                : 'success'
        }
        onRetry={() => undefined}
      >
        {messages.state === 'ready' ? (
          <div className="space-y-2 px-4 pt-1">
            {messages.data.map((message) => (
              <Card
                key={message.id}
                className="mx-0 cursor-pointer px-4 py-3"
              >
                <div
                  role="button"
                  tabIndex={0}
                  data-testid={`message-${message.id}`}
                  onClick={() => {
                    void messageClient.markRead(message.id).then(() => {
                      if (message.orderId !== undefined) {
                        navigate(`/trade/orders/${message.orderId}`);
                      } else {
                        navigate(0);
                      }
                    });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void messageClient.markRead(message.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {!message.read ? <span className="h-2 w-2 rounded-full bg-danger" /> : null}
                    <span className="flex-1 truncate text-sm font-medium text-primary">{message.title}</span>
                    <span className="text-xs text-muted">{message.createdAt.slice(5, 16).replace('T', ' ')}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 pl-4 text-xs leading-5 text-secondary">{message.body}</p>
                  <p className="mt-1 pl-4 text-[0.625rem] text-muted">
                    {t(`zhiya.commons.messageCategory.${message.category}`)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </ScreenState>
    </div>
  );
}
