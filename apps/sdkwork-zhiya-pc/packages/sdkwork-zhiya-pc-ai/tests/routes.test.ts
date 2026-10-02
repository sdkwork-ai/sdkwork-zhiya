import { describe, expect, it } from 'vitest';

import { validateZhiyaRouteTable } from '@sdkwork/zhiya-pc-core';

import { aiRouteContributions } from '../src/routes/routeContributions.js';

describe('zhiya ai route contributions', () => {
  it('declares_the_ai_tab_root', () => {
    expect(aiRouteContributions.map((route) => route.id)).toEqual(['app.zhiya.ai.root']);
    expect(aiRouteContributions[0]).toMatchObject({ path: '/ai', tab: 'ai' });
    expect(
      validateZhiyaRouteTable(aiRouteContributions).filter((issue) => !issue.routeId.startsWith('tab:')),
    ).toEqual([]);
  });
});
