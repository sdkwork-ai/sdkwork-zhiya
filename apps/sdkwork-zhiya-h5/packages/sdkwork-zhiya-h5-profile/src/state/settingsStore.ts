/**
 * Settings store (zustand + persist): color mode + locale preferences with
 * side effects applied on change (THEME_DARKMODE_SPEC.md single theme owner;
 * I18N_SPEC locale preference).
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  applyColorMode,
  changeZhiyaLocale,
  persistLocale,
  readAppliedColorMode,
  type ColorMode,
  type ZhiyaLocale,
} from '@sdkwork/zhiya-h5-core';

interface SettingsState {
  colorMode: ColorMode;
  locale: ZhiyaLocale;
  setColorMode: (mode: ColorMode) => void;
  setLocale: (locale: ZhiyaLocale) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      colorMode: 'light',
      locale: 'zh-CN',
      setColorMode: (mode) => {
        applyColorMode(mode);
        set({ colorMode: mode });
      },
      setLocale: (locale) => {
        persistLocale(locale);
        void changeZhiyaLocale(locale);
        set({ locale });
      },
    }),
    {
      name: 'zhiya.settings',
      storage: createJSONStorage(() => globalThis.localStorage),
      partialize: (state) => ({ colorMode: state.colorMode, locale: state.locale }) as unknown as SettingsState,
      onRehydrateStorage: () => (state) => {
        // Re-apply persisted preferences after reload (single theme owner).
        if (state !== undefined) {
          applyColorMode(state.colorMode);
        }
      },
    },
  ),
);

export function currentColorMode(): ColorMode {
  return useSettingsStore.getState().colorMode ?? readAppliedColorMode();
}
