import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar, Card, ListRow } from '@sdkwork/zhiya-h5-commons';
import {
  applyColorMode,
  useSessionStore,
  ZHIYA_LOCALES,
  type ZhiyaLocale,
} from '@sdkwork/zhiya-h5-core';

import { useSettingsStore } from '../state/settingsStore.js';
import { cx } from '../utils/format.js';

/** 设置 (PRD §20): 深色模式 / 语言 / 清除本地数据 / 退出登录 / 关于. */
export function SettingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const signOut = useSessionStore((state) => state.signOut);
  const colorMode = useSettingsStore((state) => state.colorMode);
  const setColorMode = useSettingsStore((state) => state.setColorMode);
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);
  const [cleared, setCleared] = useState(false);

  const toggleColorMode = (): void => {
    const next = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(next);
    applyColorMode(next);
  };

  const clearData = (): void => {
    // Clears every mock-hub `zhiya.*` key the standalone milestone persists;
    // the in-memory catalog rebuilds on the next load.
    try {
      const storage = globalThis.localStorage;
      for (const key of Object.keys(storage)) {
        if (key.startsWith('zhiya.')) {
          storage.removeItem(key);
        }
      }
      setCleared(true);
    } catch {
      setCleared(false);
    }
  };

  const signOutAndRestart = (): void => {
    signOut();
    navigate('/home', { replace: true });
    navigate(0);
  };

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('zhiya.profile.settings.title')}</h1>
      </header>

      <Card className="mx-0 flex items-center gap-3 px-4 py-4">
        <Avatar glyph={user?.avatar ?? '🦆'} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-primary">{user?.nickname ?? ''}</p>
          <p className="text-xs text-muted">{user?.phone ?? ''}</p>
        </div>
      </Card>

      <Card className="mt-4 divide-y divide-border-subtle">
        <ListRow
          title={t('zhiya.profile.settings.colorMode')}
          description={colorMode === 'dark' ? t('zhiya.profile.settings.dark') : t('zhiya.profile.settings.light')}
          trailing={
            <button
              type="button"
              role="switch"
              aria-checked={colorMode === 'dark'}
              data-testid="color-mode-switch"
              onClick={toggleColorMode}
              className={cx(
                'h-6 w-10 rounded-full p-0.5 transition-colors',
                colorMode === 'dark' ? 'bg-brand' : 'bg-border-strong',
              )}
            >
              <span
                className={cx(
                  'block h-5 w-5 rounded-full bg-white transition-transform',
                  colorMode === 'dark' && 'translate-x-4',
                )}
              />
            </button>
          }
        />
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="flex-1 text-sm text-primary">{t('zhiya.profile.settings.locale')}</span>
          {ZHIYA_LOCALES.map((entry: ZhiyaLocale) => (
            <button
              key={entry}
              type="button"
              data-testid={`locale-${entry}`}
              onClick={() => {
                setLocale(entry);
              }}
              className={cx(
                'rounded-full px-3 py-1.5 text-xs font-medium',
                locale === entry ? 'bg-brand-soft text-brand' : 'bg-panel-muted text-muted',
              )}
            >
              {entry === 'zh-CN' ? '中文' : 'English'}
            </button>
          ))}
        </div>
        <ListRow
          title={t('zhiya.profile.settings.clearData')}
          description={
            cleared ? t('zhiya.profile.settings.cleared') : t('zhiya.profile.settings.clearDataHint')
          }
          onClick={clearData}
        />
      </Card>

      <Card className="mt-4 divide-y divide-border-subtle">
        <ListRow title={t('zhiya.profile.settings.about')} description={t('zhiya.profile.settings.version')} />
        <ListRow title={t('zhiya.profile.settings.signOut')} onClick={signOutAndRestart} />
      </Card>
    </div>
  );
}
