/**
 * Mock MessagePort (PRD §18 消息中心). Message content is composed by the
 * mock hub on business events (报名/支付/退款/优惠/活动/AI); the client only
 * reads, filters, and marks read. Phase 2 moves this to push + inbox SDK.
 */

import type { MessagePort } from './ports.js';
import type { MessageCategory } from './types.js';
import { MESSAGE_CATEGORIES } from './types.js';
import type { ZhiyaMockState } from './state.js';

export function createMockMessageClient(state: ZhiyaMockState): MessagePort {
  return {
    async listMessages(category) {
      const sorted = [...state.messages].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      if (category === undefined || category === 'all') {
        return sorted;
      }
      return sorted.filter((message) => message.category === category);
    },
    async unreadCount() {
      return state.messages.filter((message) => !message.read).length;
    },
    async markRead(messageId) {
      const message = state.messages.find((entry) => entry.id === messageId);
      if (message !== undefined) {
        message.read = true;
        state.persist();
      }
    },
    async markAllRead(category) {
      for (const message of state.messages) {
        if (category === undefined || category === 'all' || message.category === category) {
          message.read = true;
        }
      }
      state.persist();
    },
  };
}

export { MESSAGE_CATEGORIES };
export type { MessageCategory };
