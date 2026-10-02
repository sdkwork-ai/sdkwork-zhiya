/**
 * Mock FamilyPort (PRD §3.2/§15/§42). One family per browser profile; children
 * persist to storage. Phase 2 replaces this with the iam/family app SDK.
 */

import type { FamilyPort } from './ports.js';
import type { Child, ChildInput, Family } from './types.js';
import type { ZhiyaMockState } from './state.js';

const CHILD_EMOJIS = ['🐣', '🐰', '🦊', '🐼', '🐨', '🐯'] as const;

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMockFamilyClient(state: ZhiyaMockState): FamilyPort {
  const ensureFamily = (name?: string): Family => {
    if (state.family === null) {
      state.family = {
        id: makeId('fam'),
        name: name ?? '我的家庭',
        children: [],
      };
      state.persist();
    }
    return state.family;
  };

  return {
    async getFamily() {
      return state.family;
    },
    async ensureFamily(name) {
      return ensureFamily(name);
    },
    async listChildren() {
      return state.family?.children ?? [];
    },
    async getChild(childId) {
      return state.family?.children.find((child) => child.id === childId) ?? null;
    },
    async addChild(input) {
      const family = ensureFamily();
      const child: Child = {
        id: makeId('child'),
        nickname: input.nickname,
        emoji: input.emoji ?? CHILD_EMOJIS[family.children.length % CHILD_EMOJIS.length]!,
        gender: input.gender,
        birthDate: input.birthDate,
        interests: [...input.interests],
        stage: input.stage,
        notes: input.notes,
      };
      family.children.push(child);
      state.persist();
      return child;
    },
    async updateChild(childId, patch) {
      const family = state.family;
      const child = family?.children.find((entry) => entry.id === childId);
      if (family === null || family === undefined || child === undefined) {
        throw new Error(`child not found: ${childId}`);
      }
      if (patch.nickname !== undefined) child.nickname = patch.nickname;
      if (patch.emoji !== undefined) child.emoji = patch.emoji;
      if (patch.gender !== undefined) child.gender = patch.gender;
      if (patch.birthDate !== undefined) child.birthDate = patch.birthDate;
      if (patch.interests !== undefined) child.interests = [...patch.interests];
      if (patch.stage !== undefined) child.stage = patch.stage;
      if (patch.notes !== undefined) child.notes = patch.notes;
      state.persist();
      return child;
    },
    async removeChild(childId) {
      const family = state.family;
      if (family === null || family === undefined) {
        return;
      }
      family.children = family.children.filter((child) => child.id !== childId);
      state.persist();
    },
  };
}

/** Child age in whole years at `at` (defaults to state clock). */
export function ageOf(child: Pick<Child, 'birthDate'>, at: Date): number {
  const birth = new Date(`${child.birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) {
    return 0;
  }
  let age = at.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    at.getMonth() < birth.getMonth() ||
    (at.getMonth() === birth.getMonth() && at.getDate() < birth.getDate());
  if (beforeBirthday) {
    age -= 1;
  }
  return Math.max(age, 0);
}

export type { ChildInput };
