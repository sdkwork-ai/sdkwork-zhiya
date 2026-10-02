/**
 * Mock MallPort (PRD §16 — browse + favorites in this milestone; purchase is
 * a P1 capability per PRD §44).
 */

import type { MallPort } from './ports.js';
import type { Goods } from './types.js';
import type { ZhiyaMockState } from './state.js';

export function createMockMallClient(state: ZhiyaMockState): MallPort {
  return {
    async listGoods(category, keyword) {
      return state.goods.filter((goods) => {
        if (category !== undefined && goods.category !== category) {
          return false;
        }
        if (keyword !== undefined && keyword.trim().length > 0) {
          const needle = keyword.trim().toLowerCase();
          const haystack = `${goods.title} ${goods.summary} ${goods.detail}`.toLowerCase();
          if (!haystack.includes(needle)) {
            return false;
          }
        }
        return true;
      });
    },
    async getGoods(goodsId) {
      return state.goods.find((goods) => goods.id === goodsId) ?? null;
    },
    async listFavoriteGoods() {
      return state.goodsFavorites
        .map((id) => state.goods.find((goods) => goods.id === id))
        .filter((goods): goods is Goods => goods !== undefined);
    },
    async toggleFavoriteGoods(goodsId) {
      const index = state.goodsFavorites.indexOf(goodsId);
      if (index >= 0) {
        state.goodsFavorites.splice(index, 1);
      } else {
        state.goodsFavorites.push(goodsId);
      }
      state.persist();
      return state.goodsFavorites.includes(goodsId);
    },
  };
}
