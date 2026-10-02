import { Outlet } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { DesktopNavRail } from '../navigation/DesktopNavRail.js';

/**
 * Desktop navigation container (APP_PC_ARCHITECTURE_SPEC.md): fixed left
 * navigation rail + fluid content column + brand footer strip. All five tabs
 * render inside this layout via the router outlet.
 */
export function DesktopLayout() {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen w-full flex-col bg-canvas text-primary">
      <div className="flex min-h-0 flex-1">
        <DesktopNavRail />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <footer className="shrink-0 border-t border-border-subtle bg-panel px-4 py-1 text-[0.625rem] text-muted">
        {t('zhiya.shell.footer.brand')}
      </footer>
    </div>
  );
}
