import { describe, expect, it } from 'vitest';

import { validateZhiyaRouteTable } from '@sdkwork/zhiya-pc-core';

import { mallRouteContributions } from '../src/routes/routeContributions.js';

describe('zhiya mall route contributions', () => {
  it('declares_the_mall_tab_root_and_goods_detail', () => {
    expect(mallRouteContributions.map((route) => route.id)).toEqual([
      'app.zhiya.mall.root',
      'app.zhiya.mall.goods',
    ]);
    expect(
      validateZhiyaRouteTable(mallRouteContributions).filter((issue) => !issue.routeId.startsWith('tab:')),
    ).toEqual([]);
  });
});
