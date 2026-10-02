/**
 * Public export boundary of `@sdkwork/zhiya-intent-core` — activity
 * vocabulary + the 问知鸭 rule-based intent recognizer (PRD §14/§32).
 */

export type {
  ActivityCategory,
  ActivityMode,
  ActivityIntent,
  EducationTag,
  IntentTime,
} from './types.js';
export { ACTIVITY_CATEGORIES, emptyIntent } from './types.js';

export { isEmptyIntent, recognizeActivityIntent } from './recognizer.js';
