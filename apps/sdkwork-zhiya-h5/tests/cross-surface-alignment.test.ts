/**
 * Cross-surface alignment gate (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC,
 * executable): the four client surfaces must declare the SAME route identity
 * set — H5 and PC via their route contributions, Flutter via its pinned
 * cross-surface id list, and the mini-program via its native page projection
 * (tab pages 1:1 with the five-tab contract; detail pages are a C-end subset).
 * This test reads sibling surfaces from disk; it is the workspace-level seam
 * check that per-surface tests cannot express.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';

const appRoot = process.cwd();
const appsRoot = path.resolve(appRoot, '..');
const repoRoot = path.resolve(appsRoot, '..');

function scanRouteIds(surfaceRoot: string): string[] {
  const ids = new Set<string>();
  const packagesDir = path.join(surfaceRoot, 'packages');
  for (const pkg of ['home', 'activity', 'ai', 'mall', 'trade', 'profile', 'org']) {
    const file = path.join(packagesDir, `sdkwork-zhiya-h5-${pkg}`, 'src', 'routes', 'routeContributions.ts');
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/id: '(app\.zhiya\.[a-z0-9-]+\.[a-z0-9-]+)'/gu)) {
      ids.add(match[1]!);
    }
  }
  return [...ids].sort();
}

function scanPcRouteIds(surfaceRoot: string): string[] {
  const ids = new Set<string>();
  const packagesDir = path.join(surfaceRoot, 'packages');
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const file = path.join(packagesDir, entry.name, 'src', 'routes', 'routeContributions.ts');
    if (!existsSync(file)) {
      continue;
    }
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/id: '(app\.zhiya\.[a-z0-9-]+\.[a-z0-9-]+)'/gu)) {
      ids.add(match[1]!);
    }
  }
  return [...ids].sort();
}

function flutterRouteIds(): string[] {
  const source = readFileSync(
    path.join(appsRoot, 'sdkwork-zhiya-flutter-mobile', 'packages', 'sdkwork_zhiya_flutter_mobile_core', 'lib', 'src', 'route_table.dart'),
    'utf8',
  );
  const block = /const List<String> kCrossSurfaceRouteIds = \[([\s\S]*?)\];/u.exec(source);
  if (block === null) {
    throw new Error('kCrossSurfaceRouteIds missing from the Flutter route table');
  }
  return [...block[1]!.matchAll(/'(app\.zhiya\.[a-z0-9-]+\.[a-z0-9-]+)'/gu)].map((match) => match[1]!).sort();
}

function miniProgramTabPages(): string[] {
  const appJson = JSON.parse(readFileSync(path.join(appsRoot, 'sdkwork-zhiya-mini-program', 'src', 'app.json'), 'utf8')) as {
    tabBar: { list: { pagePath: string; text: string }[] };
  };
  return appJson.tabBar.list.map((entry) => entry.pagePath);
}

describe('cross-surface route alignment (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC)', () => {
  const h5 = scanRouteIds(appRoot);
  const pc = scanPcRouteIds(path.join(appsRoot, 'sdkwork-zhiya-pc'));
  const flutter = flutterRouteIds();

  it('declares_the_identical_common_route_id_set_on_h5_and_pc', () => {
    // PC may carry surface-specific admin routes (PRD §25 平台后台); the
    // common C-end set must stay identical to H5.
    const pcCommon = pc.filter((id) => !id.startsWith('app.zhiya.admin.'));
    expect(pcCommon).toEqual(h5);
    expect(pc.filter((id) => id.startsWith('app.zhiya.admin.')).length).toBeGreaterThanOrEqual(1);
  });

  it('declares_the_identical_route_id_set_on_h5_and_flutter', () => {
    expect(flutter).toEqual(h5);
  });

  it('keeps_the_workspace_above_the_single_surface_floor_of_25_routes', () => {
    // The P0 lattice: 2 home + 7 activity + 1 ai + 2 mall + 3 trade + 10 profile + 4 org.
    expect(h5.length).toBeGreaterThanOrEqual(25);
  });

  it('projects_the_five_tabs_1to1_on_the_mini_program', () => {
    const tabs = ['home', 'activity', 'ai', 'mall', 'profile'];
    const pages = miniProgramTabPages();
    expect(pages).toEqual(tabs.map((tab) => `pages/${tab}/index`));
    // Every mini-program tab must exist in the shared route id set.
    for (const tab of tabs) {
      expect(h5.some((id) => id.startsWith(`app.zhiya.${tab}.`)), `tab ${tab} missing from the route set`).toBe(true);
    }
  });

  it('shares_the_zhiya_i18n_key_prefix_across_react_surfaces', () => {
    for (const surface of ['sdkwork-zhiya-h5', 'sdkwork-zhiya-pc']) {
      const source = readFileSync(
        path.join(appsRoot, surface, 'packages', `${surface.replace('apps/', '')}-shell`, 'src', 'i18n', 'zh-CN', 'zhiya', 'shell', 'navigation.json'),
        'utf8',
      );
      expect(source).toContain('"tab"');
      for (const tab of ['首页', '活动', 'AI', '商城', '我的']) {
        expect(source).toContain(tab);
      }
    }
    void repoRoot;
  });
});
