/**
 * Mock ActivityPort (PRD §6–§8, §40). Catalog is the shared mock state; the
 * query engine filters the published, upcoming catalog. Favorites persist.
 */

import type { ActivityPort, ActivityQuery } from './ports.js';
import type { Activity } from './types.js';
import type { ZhiyaMockState } from './state.js';

const FAVORITES_KEY_LIMIT = 200;

function matchesQuery(activity: Activity, query: ActivityQuery | undefined, now: Date): boolean {
  if (activity.status !== 'published') {
    return false;
  }
  if (new Date(activity.endTime).getTime() <= now.getTime()) {
    return false;
  }
  if (query === undefined) {
    return true;
  }
  if (query.category !== undefined && activity.category !== query.category) {
    return false;
  }
  if (query.mode !== undefined && activity.mode !== query.mode) {
    return false;
  }
  if (query.freeOnly === true && activity.price !== 0) {
    return false;
  }
  if (query.childAge !== undefined) {
    if (query.childAge < activity.ageMin || query.childAge > activity.ageMax) {
      return false;
    }
  }
  if (query.keyword !== undefined && query.keyword.trim().length > 0) {
    const keyword = query.keyword.trim().toLowerCase();
    const haystack = `${activity.title} ${activity.subtitle} ${activity.orgName} ${activity.introduction} ${activity.tags.join(' ')}`.toLowerCase();
    if (!haystack.includes(keyword)) {
      return false;
    }
  }
  return true;
}

export function createMockActivityClient(state: ZhiyaMockState): ActivityPort {
  let hydrated = false;

  const hydrate = (): void => {
    // Re-apply persisted enrollment deltas on first touch after a reload.
    if (hydrated) {
      return;
    }
    hydrated = true;
    for (const activity of state.allActivities()) {
      const delta = state.enrolled.activity[activity.id];
      if (delta !== undefined && delta !== 0) {
        activity.enrolled = Math.max(0, activity.enrolled + delta);
      }
      for (const session of activity.sessions) {
        const sessionDelta = state.enrolled.session[session.id];
        if (sessionDelta !== undefined && sessionDelta !== 0) {
          session.enrolled = Math.max(0, session.enrolled + sessionDelta);
        }
      }
    }
  };

  return {
    async listActivities(query) {
      hydrate();
      const now = state.now();
      const matched = state
        .allActivities()
        .filter((activity) => matchesQuery(activity, query, now));
      return matched.sort(
        (left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
      );
    },
    async getActivity(activityId) {
      hydrate();
      return state.findActivity(activityId);
    },
    async listHomeRecommendations() {
      hydrate();
      const now = state.now();
      return state
        .allActivities()
        .filter((activity) => matchesQuery(activity, undefined, now))
        .sort((left, right) => {
          const heat = right.enrolled / Math.max(right.quota, 1) - left.enrolled / Math.max(left.quota, 1);
          if (heat !== 0) {
            return heat;
          }
          return new Date(left.startTime).getTime() - new Date(right.startTime).getTime();
        })
        .slice(0, 10);
    },
    async listOrgs(keyword) {
      const orgs = [...state.orgs];
      if (keyword === undefined || keyword.trim().length === 0) {
        return orgs;
      }
      const needle = keyword.trim().toLowerCase();
      return orgs.filter((org) =>
        `${org.name} ${org.summary} ${org.district}`.toLowerCase().includes(needle),
      );
    },
    async listFavoriteActivities() {
      hydrate();
      return state.favorites
        .map((id) => state.findActivity(id))
        .filter((activity): activity is Activity => activity !== null);
    },
    async toggleFavorite(activityId) {
      const index = state.favorites.indexOf(activityId);
      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(activityId);
        if (state.favorites.length > FAVORITES_KEY_LIMIT) {
          state.favorites.shift();
        }
      }
      state.persist();
      return state.favorites.includes(activityId);
    },
  };
}
