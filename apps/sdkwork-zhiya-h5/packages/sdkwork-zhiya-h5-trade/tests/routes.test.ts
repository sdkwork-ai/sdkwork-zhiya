import { describe, expect, it } from 'vitest';

import { validateZhiyaRouteTable } from '@sdkwork/zhiya-h5-core';

import { tradeRouteContributions } from '../src/routes/routeContributions.js';

describe('zhiya trade route contributions', () => {
  it('declares_orders_detail_and_review_routes', () => {
    expect(tradeRouteContributions.map((route) => route.id)).toEqual([
      'app.zhiya.trade.orders',
      'app.zhiya.trade.order-detail',
      'app.zhiya.trade.review',
    ]);
    expect(tradeRouteContributions.every((route) => route.tab === null)).toBe(true);
    expect(
      validateZhiyaRouteTable(tradeRouteContributions).filter((issue) => !issue.routeId.startsWith('tab:')),
    ).toEqual([]);
  });
});
