import { describe, expect, it } from 'vitest';

import { isEmptyIntent, recognizeActivityIntent } from '../src/index.js';

describe('zhiya activity intent recognizer', () => {
  it('parses_the_prd_age_example', () => {
    const intent = recognizeActivityIntent('8岁孩子适合学什么？');
    expect(intent.age).toBe(8);
    expect(isEmptyIntent(intent)).toBe(false);
  });

  it('parses_budget_from_the_prd_plan_example', () => {
    const intent = recognizeActivityIntent('预算100元，帮我安排一个周末体验计划。');
    expect(intent.budgetMax).toBe(100);
    expect(intent.time).toBe('weekend');
    expect(intent.wantsPlan).toBe(true);
  });

  it('recognizes_categories_tags_mode_and_free_demand', () => {
    const intent = recognizeActivityIntent('想找免费的线上编程亲子活动');
    expect(intent.categories).toContain('parent-child');
    expect(intent.tags).toContain('programming');
    expect(intent.mode).toBe('online');
    expect(intent.freeOnly).toBe(true);
  });

  it('recognizes_education_directions_like_science_and_english', () => {
    const intent = recognizeActivityIntent('周六适合7岁孩子的科学类活动');
    expect(intent.age).toBe(7);
    expect(intent.time).toBe('weekend');
    expect(intent.tags).toContain('science');
  });

  it('falls_back_to_keyword_for_unrecognized_queries', () => {
    const intent = recognizeActivityIntent('围棋');
    expect(intent.tags).toContain('thinking');
    const plain = recognizeActivityIntent('xyzzy');
    expect(plain.keywords).toEqual(['xyzzy']);
    expect(isEmptyIntent(plain)).toBe(true);
  });

  it('returns_an_empty_intent_for_blank_queries', () => {
    expect(isEmptyIntent(recognizeActivityIntent('  '))).toBe(true);
  });
});
