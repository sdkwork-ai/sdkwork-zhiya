/**
 * Mini-program surface contract tests (TEST_SPEC.md §2.4.2,
 * MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md verification): manifest ↔ pages
 * alignment, page-file completeness, runtime-bundle freshness/profile stamp,
 * the wx.* host-adapter boundary, and cross-surface route alignment.
 * Pure Node — no WeChat tooling required.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(relative) {
  return JSON.parse(readFileSync(path.join(appRoot, relative), 'utf8'));
}

function listFiles(relativeDir) {
  const absolute = path.join(appRoot, relativeDir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { recursive: true })
    .map((entry) => path.join(relativeDir, String(entry)).replaceAll('\\', '/'))
    .filter((file) => statSync(path.join(appRoot, file)).isFile());
}

function existsSync(relative) {
  try {
    statSync(path.join(appRoot, relative));
    return true;
  } catch {
    return false;
  }
}

const TAB_IDS = ['home', 'activity', 'ai', 'mall', 'profile'];
const TAB_LABELS = ['首页', '活动', 'AI', '商城', '我的'];
const DETAIL_PAGES = [
  'detail/activity-detail/index',
  'detail/register/index',
  'detail/pay/index',
  'detail/orders/index',
  'detail/review/index',
  'detail/family/index',
  'detail/messages/index',
  'detail/coupons/index',
  'detail/package-detail/index',
];

describe('zhiya mini-program surface contract', () => {
  it('app_json_projects_exactly_the_five_tab_pages_and_the_detail_subpackage', () => {
    const appJson = readJson('src/app.json');
    const expectedPages = TAB_IDS.map((id) => `pages/${id}/index`);
    assert.deepEqual(appJson.pages, expectedPages);
    assert.equal(appJson.subPackages.length, 1);
    assert.equal(appJson.subPackages[0].root, 'detail');
    assert.deepEqual(appJson.subPackages[0].pages, DETAIL_PAGES.map((page) => page.replace('detail/', '')));
    assert.equal(appJson.tabBar.list.length, 5);
    assert.deepEqual(
      appJson.tabBar.list.map((entry) => entry.text),
      TAB_LABELS,
    );
    for (const page of expectedPages) {
      assert.ok(
        appJson.tabBar.list.some((entry) => entry.pagePath === page),
        `tab page ${page} missing from tabBar`,
      );
    }
  });

  it('every_declared_page_has_a_complete_index_quad', () => {
    const appJson = readJson('src/app.json');
    const declared = [
      ...appJson.pages,
      ...appJson.subPackages.flatMap((pkg) => pkg.pages.map((page) => `${pkg.root}/${page}`)),
    ].map((page) => `src/${page}`);
    for (const page of declared) {
      for (const ext of ['js', 'json', 'wxml', 'wxss']) {
        assert.ok(existsSync(`${page}.${ext}`), `missing ${page}.${ext}`);
      }
    }
  });

  it('runtime_bundle_exists_and_is_profile_stamped', () => {
    const bundle = readFileSync(path.join(appRoot, 'src/runtime/app.js'), 'utf8');
    assert.ok(bundle.length > 1000, 'runtime bundle too small — run `pnpm build`');
    const stampSource = readFileSync(path.join(appRoot, 'src/runtime/runtime-env.js'), 'utf8');
    const moduleMatch = /module\.exports\s*=\s*(\{[\s\S]*\});\s*$/u.exec(stampSource);
    assert.ok(moduleMatch, 'runtime-env.js must end with module.exports = {...}');
    const stamp2 = JSON.parse(moduleMatch[1]);
    assert.equal(stamp2.runtimeTarget, 'mini-program');
    assert.match(stamp2.profileId, /^(standalone|cloud)\.(development|test|staging|production)$/u);
  });

  it('capability_packages_never_call_wx_directly_host_adapter_boundary', () => {
    const packagesRoot = path.join(appRoot, 'packages');
    for (const pkg of readdirSync(packagesRoot)) {
      const indexSource = readFileSync(path.join(packagesRoot, pkg, 'src', 'index.ts'), 'utf8');
      const withoutComments = indexSource.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
      assert.doesNotMatch(withoutComments, /\bwx\.[a-z]/u, `${pkg} must not call wx.* directly`);
    }
  });

  it('route_projection_stays_aligned_with_the_cross_surface_tabs', () => {
    const shell = readFileSync(path.join(appRoot, 'packages/sdkwork-zhiya-mp-shell/src/index.ts'), 'utf8');
    for (const id of TAB_IDS) {
      assert.ok(shell.includes(`pages/${id}/index`), `shell projection missing pages/${id}/index`);
    }
    const routeCore = readFileSync(
      path.join(appRoot, '../sdkwork-zhiya-common/packages/sdkwork-zhiya-route-core/src/tabs.ts'),
      'utf8',
    );
    for (const label of TAB_LABELS) {
      assert.ok(routeCore.includes(label), `route-core tab contract missing ${label}`);
    }
  });
});
