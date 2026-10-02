/**
 * Session gate (PRD §3.1 登录 is P0): renders the mock sign-in screen until a
 * session exists. The standalone milestone authenticates against the mock
 * session store (phone + code, any code passes); Phase 2 replaces the body
 * with the IAM login integration — the gate stays.
 */

import type { ReactNode } from 'react';

import { LoginScreen } from '@sdkwork/zhiya-pc-profile';
import { useSessionStore } from '@sdkwork/zhiya-pc-core';

export function AuthGate({ children }: { children: ReactNode }) {
  const user = useSessionStore((state) => state.user);
  if (user === null) {
    return <LoginScreen />;
  }
  return <>{children}</>;
}
