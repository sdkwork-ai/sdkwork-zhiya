/**
 * Cross-package tab badge store: capabilities publish unread counts, the shell
 * tab bar and home header subscribe (FRONTEND_CODE_SPEC.md: cross-package UI
 * state goes through core, never direct feature-to-feature imports).
 */

import { create } from 'zustand';

interface TabBadgeState {
  unreadMessages: number;
  setUnreadMessages: (count: number) => void;
}

export const useTabBadgeStore = create<TabBadgeState>((set) => ({
  unreadMessages: 0,
  setUnreadMessages: (count) => {
    set({ unreadMessages: Math.max(0, count) });
  },
}));
