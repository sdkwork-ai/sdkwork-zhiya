/**
 * Shared activity vocabulary + intent types for the 问知鸭 natural-language
 * activity search (PRD §7.1, §14.1, §32). This package has zero dependencies;
 * `service-core` re-exports the vocabulary so the whole workspace shares one
 * definition. The recognizer is a pure rule engine over zh-CN phrases;
 * surfaces render the structured result, they never parse text themselves.
 */

/** Activity category taxonomy (PRD §7.1 活动分类). */
export type ActivityCategory =
  | 'trial'
  | 'online-course'
  | 'open-course'
  | 'parent-child'
  | 'study-tour'
  | 'summer-camp'
  | 'winter-camp'
  | 'competition'
  | 'exhibition'
  | 'training'
  | 'other';

/** Online/offline delivery mode (PRD §7.2 线上/线下). */
export type ActivityMode = 'offline' | 'online';

/** Education direction tags used by seeds, filters, and intent matching. */
export type EducationTag =
  | 'programming'
  | 'robotics'
  | 'science'
  | 'art'
  | 'music'
  | 'english'
  | 'sports'
  | 'thinking'
  | 'drama'
  | 'nature';

/** Logical time buckets understood by the recognizer. */
export type IntentTime = 'today' | 'weekend' | 'weekday' | 'holiday';

/**
 * Structured search intent extracted from a free-form query. Every field is
 * optional; an empty result means "match everything" (browse mode).
 */
export interface ActivityIntent {
  /** Child age mentioned in the query (e.g. "8岁"). */
  age?: number | undefined;
  /** Maximum total budget mentioned (e.g. "预算100元"). */
  budgetMax?: number | undefined;
  /** Activity categories mentioned (e.g. "编程/亲子活动"). */
  categories: ActivityCategory[];
  /** Education directions mentioned (e.g. "科学/美术"). */
  tags: EducationTag[];
  /** Online/offline preference (e.g. "线上"/"线下"). */
  mode?: ActivityMode | undefined;
  /** Free-only demand (e.g. "免费"). */
  freeOnly: boolean;
  /** Time bucket (e.g. "周末"/"今天"). */
  time?: IntentTime | undefined;
  /** Free-text keywords left after structured extraction. */
  keywords: string[];
  /** Experience-plan demand (e.g. "计划"/"安排"). */
  wantsPlan: boolean;
}

export function emptyIntent(): ActivityIntent {
  return { categories: [], tags: [], freeOnly: false, keywords: [], wantsPlan: false };
}

/** Canonical category list in PRD §7.1 order (display uses i18n keys). */
export const ACTIVITY_CATEGORIES: readonly ActivityCategory[] = [
  'trial',
  'online-course',
  'open-course',
  'parent-child',
  'study-tour',
  'summer-camp',
  'winter-camp',
  'competition',
  'exhibition',
  'training',
  'other',
];
