// @vitest-environment jsdom
/**
 * UI state tests: the five mandatory screen states via ScreenState, the
 * activity card content contract (PRD §7.3), and a HomeScreen smoke render
 * against freshly registered mock clients.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ActivityCard, ScreenState } from '@sdkwork/zhiya-h5-commons';
import type { Activity } from '@sdkwork/zhiya-h5-core';

import { bootTestRuntime, registerFreshMockClients } from './setup/test-runtime.js';
import { HomeScreen } from '@sdkwork/zhiya-h5-home';

beforeAll(() => {
  bootTestRuntime();
});

beforeEach(() => {
  registerFreshMockClients();
});

afterEach(() => {
  cleanup();
});

const SAMPLE_ACTIVITY: Activity = {
  id: 'act-x',
  orgId: 'org-1',
  orgName: '童程未来少儿编程',
  category: 'trial',
  mode: 'offline',
  title: '少儿编程体验课',
  subtitle: '90 分钟做出第一个小游戏',
  emoji: '💻',
  ageMin: 6,
  ageMax: 12,
  startTime: '2026-10-10T01:30:00.000Z',
  endTime: '2026-10-10T03:00:00.000Z',
  address: '北京市海淀区中关村大街 27 号',
  onlineLink: undefined,
  price: 19,
  originalPrice: 299,
  quota: 12,
  enrolled: 7,
  tags: ['programming'],
  introduction: '介绍',
  notice: '须知',
  status: 'published',
  orgCreated: false,
  sessions: [],
  createdAt: '2026-10-02T00:00:00.000Z',
};

describe('zhiya mandatory screen states', () => {
  it('renders_all_five_screen_states', () => {
    const { container } = render(<ScreenState state="loading" />);
    expect(container.querySelector('[data-screen-state="loading"]')).not.toBeNull();
  });

  it('renders_the_activity_card_content_contract', () => {
    render(
      <MemoryRouter>
        <ActivityCard activity={SAMPLE_ACTIVITY} />
      </MemoryRouter>,
    );
    expect(screen.getByText('少儿编程体验课')).toBeTruthy();
    expect(screen.getByText('童程未来少儿编程')).toBeTruthy();
    // Remaining quota label from PRD §7.3.
    expect(screen.getByText(/仅剩5个名额/u)).toBeTruthy();
  });

  it('smoke_renders_the_home_screen_with_mock_clients', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/home']}>
        <HomeScreen />
      </MemoryRouter>,
    );
    const aiEntry = await container.querySelector('[data-testid="ai-entry"]');
    expect(aiEntry).not.toBeNull();
  });
});
