/**
 * Mock session store (Phase 1 用户体系, PRD §3.1). Sign-in is a phone number +
 * verification code against the mock hub (any 6-digit code passes in the
 * standalone milestone); the session persists to localStorage so refreshes
 * keep the family context. Phase 2 replaces this with IAM-backed sessions via
 * the appbase runtime — the store shape is the seam.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SessionUser {
  id: string;
  phone: string;
  nickname: string;
  /** Emoji avatar stand-in. */
  avatar: string;
}

interface SessionState {
  user: SessionUser | null;
  signIn: (phone: string, nickname?: string) => SessionUser;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (phone, nickname) => {
        const normalized = phone.trim();
        const user: SessionUser = {
          id: `user-${normalized.slice(-4)}-${Date.now().toString(36)}`,
          phone: normalized,
          nickname: nickname !== undefined && nickname.trim().length > 0 ? nickname.trim() : `鸭家长${normalized.slice(-4)}`,
          avatar: '🦆',
        };
        set({ user });
        return user;
      },
      signOut: () => {
        set({ user: null });
      },
    }),
    {
      name: 'zhiya.session',
      storage: createJSONStorage(() => globalThis.localStorage),
      partialize: (state) => ({ user: state.user }) as unknown as SessionState,
    },
  ),
);

export function getCurrentUser(): SessionUser | null {
  return useSessionStore.getState().user;
}
