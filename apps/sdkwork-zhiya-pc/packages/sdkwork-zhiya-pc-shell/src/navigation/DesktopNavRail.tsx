import { NavLink } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { Bird, CalendarDays, Home, ShoppingBag, User, type LucideIcon } from 'lucide-react';

import { useSessionStore, useTabBadgeStore, ZHIYA_TABS } from '@sdkwork/zhiya-pc-core';
import type { TabId } from '@sdkwork/zhiya-pc-core';

import { cx } from './navStyles.js';

const TAB_ICONS: Record<TabId, LucideIcon> = {
  home: Home,
  activity: CalendarDays,
  ai: Bird,
  mall: ShoppingBag,
  profile: User,
};

/**
 * Fixed 240px navigation rail (APP_PC_REACT_UI_SPEC.md): brand block, the
 * five cross-surface tabs with unread badge, and the session footer.
 */
export function DesktopNavRail() {
  const { t } = useTranslation();
  const user = useSessionStore((state) => state.user);
  const unreadMessages = useTabBadgeStore((state) => state.unreadMessages);
  return (
    <nav
      aria-label={t('zhiya.shell.rail.label')}
      className="flex w-60 shrink-0 flex-col border-r border-border-subtle bg-panel"
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg font-semibold text-white"
        >
          鸭
        </span>
        <span className="text-base font-semibold text-primary">知鸭</span>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {ZHIYA_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const badge = tab.id === 'profile' && unreadMessages > 0 ? unreadMessages : null;
          return (
            <li key={tab.id}>
              <NavLink
                to={tab.path}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-brand-soft text-brand' : 'text-secondary hover:bg-panel-muted hover:text-primary',
                  )
                }
              >
                <Icon aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
                <span className="flex-1">{t(tab.titleKey)}</span>
                {badge !== null ? (
                  <span
                    data-testid={`nav-badge-${tab.id}`}
                    className="min-w-4 rounded-full bg-danger px-1 text-center text-[0.625rem] leading-4 font-semibold text-white"
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                ) : null}
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-border-subtle px-4 py-3">
        <p className="truncate text-sm font-medium text-primary" data-testid="rail-user">
          {user?.nickname ?? t('zhiya.shell.rail.guest')}
        </p>
        <p className="truncate text-xs text-muted">{user?.phone ?? t('zhiya.shell.rail.slogan')}</p>
      </div>
    </nav>
  );
}
