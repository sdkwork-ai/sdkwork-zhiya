/**
 * Rule-based zh-CN intent recognizer for 问知鸭 (PRD §14, §32). Pure
 * functions: no I/O, no clock, no network — surfaces and mock clients can run
 * it deterministically. Extraction covers the query shapes from the PRD
 * examples: age ("8岁"), budget ("预算100元"/"100元以内"), categories
 * ("编程/亲子活动"), education directions ("科学/美术"), mode ("线上/线下"),
 * free demand ("免费"), time ("周末/今天/假期"), and plan demand ("计划/安排").
 */

import type { ActivityCategory, ActivityIntent, EducationTag, IntentTime } from './types.js';
import { emptyIntent } from './types.js';

interface CategoryRule {
  category: ActivityCategory;
  patterns: readonly string[];
}

const CATEGORY_RULES: readonly CategoryRule[] = [
  { category: 'trial', patterns: ['体验课', '试听', '体验班'] },
  { category: 'online-course', patterns: ['线上课', '线上课程', '网课', '直播课'] },
  { category: 'open-course', patterns: ['公开课', '讲座'] },
  { category: 'parent-child', patterns: ['亲子', '亲子活动', '带娃', '遛娃'] },
  { category: 'study-tour', patterns: ['研学', '游学'] },
  { category: 'summer-camp', patterns: ['夏令营'] },
  { category: 'winter-camp', patterns: ['冬令营'] },
  { category: 'competition', patterns: ['比赛', '竞赛', '考级'] },
  { category: 'exhibition', patterns: ['展览', '展会', '博物馆', '美术馆'] },
  { category: 'training', patterns: ['训练营', '集训', '培训班'] },
];

interface TagRule {
  tag: EducationTag;
  patterns: readonly string[];
}

const TAG_RULES: readonly TagRule[] = [
  { tag: 'programming', patterns: ['编程', 'scratch', 'python', '代码'] },
  { tag: 'robotics', patterns: ['机器人'] },
  { tag: 'science', patterns: ['科学', '实验', 'stem'] },
  { tag: 'art', patterns: ['美术', '绘画', '画画', '艺术', '创意'] },
  { tag: 'music', patterns: ['音乐', '钢琴', '乐器', '声乐'] },
  { tag: 'english', patterns: ['英语', '英文'] },
  { tag: 'sports', patterns: ['体育', '运动', '游泳', '篮球', '足球', '体能'] },
  { tag: 'thinking', patterns: ['思维', '逻辑', '数学思维', '围棋'] },
  { tag: 'drama', patterns: ['戏剧', '表演', '口才', '主持'] },
  { tag: 'nature', patterns: ['自然', '户外', '露营', '农耕'] },
];

const TIME_RULES: readonly (readonly [IntentTime, readonly string[]])[] = [
  ['today', ['今天', '今日', '明天']],
  ['weekend', ['周末', '周六', '周日', '星期六', '星期日']],
  ['holiday', ['假期', '节假日', '寒假', '暑假', '国庆', '五一']],
  ['weekday', ['工作日', '周内']],
];

/** Extract and strip a pattern, returning the remaining query. */
function extractPhrase(query: string, patterns: readonly string[]): { matched: boolean; rest: string } {
  let rest = query;
  let matched = false;
  for (const pattern of patterns) {
    if (rest.includes(pattern)) {
      matched = true;
      rest = rest.split(pattern).join(' ');
    }
  }
  return { matched, rest };
}

function extractAge(query: string): { age: number | undefined; rest: string } {
  const match = /(\d{1,2})\s*岁/.exec(query);
  if (match === null) {
    return { age: undefined, rest: query };
  }
  const age = Number.parseInt(match[1] ?? '', 10);
  if (!Number.isFinite(age) || age < 1 || age > 18) {
    return { age: undefined, rest: query };
  }
  return { age, rest: query.replace(match[0], ' ') };
}

function extractBudget(query: string): { budgetMax: number | undefined; rest: string } {
  const patterns = [
    /预算\s*(\d{1,5})\s*(?:元|块)?/,
    /(\d{1,5})\s*(?:元|块)\s*(?:以内|以下|之内)/,
    /(?:不超过|最多)\s*(\d{1,5})\s*(?:元|块)?/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(query);
    const raw = match?.[1];
    if (raw !== undefined) {
      const value = Number.parseInt(raw, 10);
      if (Number.isFinite(value) && value > 0) {
        return { budgetMax: value, rest: query.replace(match![0], ' ') };
      }
    }
  }
  return { budgetMax: undefined, rest: query };
}

/**
 * Recognize the activity-search intent of a free-form query. Never throws;
 * unrecognized queries yield an empty intent (browse-all) plus the original
 * text as the single keyword.
 */
export function recognizeActivityIntent(rawQuery: string): ActivityIntent {
  const intent = emptyIntent();
  const query = rawQuery.toLowerCase().trim();
  if (query.length === 0) {
    return intent;
  }

  let rest = query;

  const age = extractAge(rest);
  intent.age = age.age;
  rest = age.rest;

  const budget = extractBudget(rest);
  intent.budgetMax = budget.budgetMax;
  rest = budget.rest;

  for (const rule of CATEGORY_RULES) {
    const extracted = extractPhrase(rest, rule.patterns);
    if (extracted.matched) {
      intent.categories.push(rule.category);
      rest = extracted.rest;
    }
  }

  for (const rule of TAG_RULES) {
    const extracted = extractPhrase(rest, rule.patterns);
    if (extracted.matched) {
      intent.tags.push(rule.tag);
      rest = extracted.rest;
    }
  }

  if (rest.includes('线上')) {
    intent.mode = 'online';
    rest = rest.split('线上').join(' ');
  } else if (rest.includes('线下')) {
    intent.mode = 'offline';
    rest = rest.split('线下').join(' ');
  }

  if (rest.includes('免费')) {
    intent.freeOnly = true;
    rest = rest.split('免费').join(' ');
  }

  for (const [time, patterns] of TIME_RULES) {
    const extracted = extractPhrase(rest, patterns);
    if (extracted.matched) {
      intent.time = time;
      rest = extracted.rest;
      break;
    }
  }

  if (/(计划|安排|规划|搭配|组合)/u.test(rest)) {
    intent.wantsPlan = true;
    rest = rest.replace(/(体验?计划|安排|规划|搭配|组合)/gu, ' ');
  }

  const keywords = rest
    .split(/[\s，。！？,.!?、：:；;（）()【】\[\]{}"'·…—]+/u)
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
  intent.keywords = keywords.length > 0 ? keywords : query.trim().length > 0 ? [query.trim()] : [];

  return intent;
}

/**
 * True when the intent carries no structured constraint at all — the caller
 * should fall back to plain keyword search over the catalog.
 */
export function isEmptyIntent(intent: ActivityIntent): boolean {
  return (
    intent.age === undefined &&
    intent.budgetMax === undefined &&
    intent.categories.length === 0 &&
    intent.tags.length === 0 &&
    intent.mode === undefined &&
    !intent.freeOnly &&
    intent.time === undefined &&
    !intent.wantsPlan
  );
}
