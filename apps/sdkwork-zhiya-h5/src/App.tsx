import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ScreenState } from '@sdkwork/zhiya-h5-commons';
import { MobileLayout } from '@sdkwork/zhiya-h5-shell';

import { AuthGate } from './AuthGate.js';
import { zhiyaRouteElements, zhiyaRouteTable } from './bootstrap/routes.js';

/**
 * Root routes: AuthGate → MobileLayout (five-tab shell) → one route per
 * composed identity. The mapping lives in src/bootstrap/routes.ts and is
 * verified by tests/route-alignment.test.ts.
 */
export function App() {
  const { t } = useTranslation();
  const fallback = <ScreenState state="loading" titleKey="zhiya.home.root.title" />;
  return (
    <AuthGate>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          {zhiyaRouteTable.map((route) => {
            const Element = zhiyaRouteElements[route.id];
            if (Element === undefined) {
              throw new Error(`route identity ${route.id} has no mounted element`);
            }
            return (
              <Route
                key={route.id}
                path={route.path}
                element={
                  <Suspense fallback={fallback}>
                    <Element />
                  </Suspense>
                }
                aria-label={t(route.titleKey)}
              />
            );
          })}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </AuthGate>
  );
}
