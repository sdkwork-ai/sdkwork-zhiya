// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { applyColorMode, createZhiyaI18n } from '@sdkwork/zhiya-h5-core';

import { useSettingsStore } from '../src/state/settingsStore.js';

beforeAll(() => {
  // The store's setLocale drives the shared i18next instance; initialize the
  // singleton (empty resources are fine) before touching it.
  createZhiyaI18n({}, 'zh-CN');
});

describe('zhiya profile settings store', () => {
  afterEach(() => {
    useSettingsStore.getState().setColorMode('light');
    useSettingsStore.getState().setLocale('zh-CN');
  });

  it('applies_color_mode_side_effect_on_change', () => {
    useSettingsStore.getState().setColorMode('dark');
    expect(document.documentElement.getAttribute('data-sdk-color-mode')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(useSettingsStore.getState().colorMode).toBe('dark');
  });

  it('changes_locale_and_persists_the_preference', () => {
    useSettingsStore.getState().setLocale('en-US');
    expect(useSettingsStore.getState().locale).toBe('en-US');
    expect(globalThis.localStorage.getItem('zhiya.locale')).toBe('en-US');
  });

  it('keeps_apply_color_mode_idempotent', () => {
    applyColorMode('light');
    applyColorMode('light');
    expect(document.documentElement.getAttribute('data-sdk-color-mode')).toBe('light');
  });
});
