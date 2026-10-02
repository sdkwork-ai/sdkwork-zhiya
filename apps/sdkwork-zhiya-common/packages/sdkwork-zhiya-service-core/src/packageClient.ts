/**
 * Mock PackagePort (PRD §12/§41, display + purchase data in this milestone;
 * benefit booking lands in P1).
 */

import type { PackagePort } from './ports.js';
import type { ZhiyaMockState } from './state.js';

export function createMockPackageClient(state: ZhiyaMockState): PackagePort {
  return {
    async listPackages() {
      return [...state.packages];
    },
    async getPackage(packageId) {
      return state.packages.find((entry) => entry.id === packageId) ?? null;
    },
    async listHotPackages() {
      return [...state.packages].sort((left, right) => right.purchasedCount - left.purchasedCount);
    },
  };
}
