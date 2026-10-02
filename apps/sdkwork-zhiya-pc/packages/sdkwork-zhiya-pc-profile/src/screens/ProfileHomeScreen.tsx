import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Baby,
  CalendarCheck,
  ChevronRight,
  Heart,
  MessageSquareText,
  Settings as SettingsIcon,
  Store,
  Ticket,
  ClipboardList,
} from 'lucide-react';

import { Avatar, Card } from '@sdkwork/zhiya-pc-commons';
import { useSessionStore, useTabBadgeStore } from '@sdkwork/zhiya-pc-core';

const QUICK_ENTRIES = [
  { to: '/profile/activities', labelKey: 'zhiya.profile.root.myActivities', icon: CalendarCheck },
  { to: '/trade/orders', labelKey: 'zhiya.profile.root.myOrders', icon: ClipboardList },
  { to: '/profile/coupons', labelKey: 'zhiya.profile.root.coupons', icon: Ticket },
  { to: '/profile/favorites', labelKey: 'zhiya.profile.root.favorites', icon: Heart },
] as const;

const LIST_ENTRIES = [
  { to: '/profile/family', labelKey: 'zhiya.profile.root.family', icon: Baby },
  { to: '/profile/messages', labelKey: 'zhiya.profile.root.messages', icon: MessageSquareText, badge: true },
  { to: '/org/workspace', labelKey: 'zhiya.profile.root.orgWorkspace', icon: Store },
  { to: '/profile/settings', labelKey: 'zhiya.profile.root.settings', icon: SettingsIcon },
] as const;

/** 我的 (PRD §20): 用户卡、我的家庭、我的活动、订单、优惠券、收藏、消息、设置. */
export function ProfileHomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const unreadMessages = useTabBadgeStore((state) => state.unreadMessages);

  return (
    <div className="pb-6">
      <header className="px-4 pt-6">
        <button
          type="button"
          data-testid="profile-user-card"
          className="flex w-full items-center gap-3 text-left"
          onClick={() => {
            navigate('/profile/settings');
          }}
        >
          <Avatar glyph={user?.avatar ?? '🦆'} size="lg" />
          <div className="min-w-0 flex-1">
            <p data-testid="profile-nickname" className="text-base font-semibold text-primary">
              {user?.nickname ?? t('zhiya.profile.root.guest')}
            </p>
            <p className="text-xs text-muted">{user?.phone ?? ''}</p>
          </div>
          <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted" />
        </button>
      </header>

      <div className="mt-4 grid grid-cols-4 gap-1 px-4">
        {QUICK_ENTRIES.map((entry) => (
          <Link
            key={entry.to}
            to={entry.to}
            data-testid={`profile-entry-${entry.to.replaceAll('/', '')}`}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-panel px-1 py-3 text-xs text-secondary shadow-[var(--shadow-card)]"
          >
            <entry.icon aria-hidden="true" className="h-5 w-5 text-brand" />
            {t(entry.labelKey)}
          </Link>
        ))}
      </div>

      <Card className="mt-4 divide-y divide-border-subtle px-0 py-0">
        {LIST_ENTRIES.map((entry) => (
          <Link
            key={entry.to}
            to={entry.to}
            data-testid={`profile-row-${entry.to.replaceAll('/', '')}`}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <entry.icon aria-hidden="true" className="h-5 w-5 text-secondary" />
            <span className="flex-1 text-sm text-primary">{t(entry.labelKey)}</span>
            {'badge' in entry && entry.badge === true && unreadMessages > 0 ? (
              <span className="rounded-full bg-danger px-1.5 text-center text-[0.625rem] leading-4 font-semibold text-white">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            ) : null}
            <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted" />
          </Link>
        ))}
      </Card>
    </div>
  );
}
