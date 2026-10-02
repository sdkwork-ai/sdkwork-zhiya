/**
 * PC application architecture contract tests (TEST_SPEC.md §2.4.2, executable
 * form of APP_PC_ARCHITECTURE_SPEC.md): required directories, thin root src,
 * package naming with reserved roles, strict TypeScript baseline, Vite
 * profile-mode build layout, and secret-free source config.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, '..', '..');

function readJson(relative: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.join(appRoot, relative), 'utf8')) as Record<string, unknown>;
}

function readTsConfigOptions(relative: string): Record<string, unknown> {
  const config = readJson(relative) as {
    extends?: string;
    compilerOptions?: Record<string, unknown>;
  };
  let merged: Record<string, unknown> = {};
  if (config.extends !== undefined) {
    merged = readTsConfigOptions(config.extends) as Record<string, unknown>;
  }
  return { ...merged, ...(config.compilerOptions ?? {}) };
}

function listFiles(relativeDir: string): string[] {
  const absolute = path.join(appRoot, relativeDir);
  if (!existsSync(absolute)) {
    return [];
  }
  return readdirSync(absolute, { recursive: true })
    .map((entry) => path.join(relativeDir, String(entry)).replaceAll('\\', '/'))
    .filter((file) => statSync(path.join(appRoot, file)).isFile());
}

function listDirectories(relativeDir: string): string[] {
  const absolute = path.join(appRoot, relativeDir);
  if (!existsSync(absolute)) {
    return [];
  }
  return readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

describe('pc app root structure', () => {
  it('owns_the_required_app_root_directories', () => {
    for (const dir of ['.sdkwork', 'config/browser', 'src/bootstrap', 'packages', 'sdks', 'scripts', 'tests', 'specs', 'etc/browser']) {
      expect(existsSync(path.join(appRoot, dir)), `missing ${dir}`).toBe(true);
    }
  });

  it('keeps_the_root_src_thin_with_bootstrap_entry_only', () => {
    const srcEntries = listFiles('src');
    expect(srcEntries).toContain('src/main.tsx');
    expect(srcEntries).toContain('src/App.tsx');
    expect(srcEntries).toContain('src/AuthGate.tsx');
    expect(srcEntries).toContain('src/index.css');
    for (const entry of srcEntries) {
      expect(
        /^(src\/(main\.tsx|App\.tsx|AuthGate\.tsx|index\.css|vite-env\.d\.ts)|src\/(bootstrap|shell)\/)/u.test(entry),
        `unexpected root src entry ${entry}`,
      ).toBe(true);
    }
  });
});

describe('pc package naming (NAMING_SPEC §4.2)', () => {
  it('names_packages_sdkwork_zhiya_pc_role_with_reserved_roles_only', () => {
    const names = listDirectories('packages');
    const allowed = new Set([
      'sdkwork-zhiya-pc-core',
      'sdkwork-zhiya-pc-commons',
      'sdkwork-zhiya-pc-shell',
      'sdkwork-zhiya-pc-home',
      'sdkwork-zhiya-pc-activity',
      'sdkwork-zhiya-pc-ai',
      'sdkwork-zhiya-pc-mall',
      'sdkwork-zhiya-pc-trade',
      'sdkwork-zhiya-pc-profile',
      'sdkwork-zhiya-pc-org',
    ]);
    for (const name of names) {
      expect(allowed.has(name), `unexpected package ${name}`).toBe(true);
    }
  });

  it('declares_every_package_in_the_pnpm_workspace', () => {
    const workspace = readFileSync(path.join(repoRoot, 'pnpm-workspace.yaml'), 'utf8');
    expect(workspace).toContain('apps/sdkwork-zhiya-pc');
    expect(workspace).toContain('apps/sdkwork-zhiya-pc/packages/*');
  });
});

describe('typescript strict baseline (TYPESCRIPT_CODE_SPEC §1)', () => {
  it('enables_the_strict_family_in_tsconfig_app', () => {
    const options = readTsConfigOptions('tsconfig.app.json');
    expect(options.strict).toBe(true);
    expect(options.noUncheckedIndexedAccess).toBe(true);
    expect(options.exactOptionalPropertyTypes).toBe(true);
    expect(options.isolatedModules).toBe(true);
    expect(options.verbatimModuleSyntax).toBe(true);
  });
});

describe('browser build contract (PNPM_SCRIPT_SPEC §4.2)', () => {
  it('builds_with_the_profile_mode_and_profile_aware_outdir', () => {
    const viteConfig = readFileSync(path.join(appRoot, 'vite.config.ts'), 'utf8');
    expect(viteConfig).toContain('resolveViteEnvironment');
    expect(viteConfig).toContain('resolveViteRuntimeProfile');
    expect(viteConfig).toContain('resolveBrowserDistOutDir');
  });

  it('declares_standalone_only_deployment_profiles_in_both_manifests', () => {
    const appManifest = readJson('sdkwork.app.config.json') as {
      runtime?: { supportedDeploymentProfiles?: string[]; defaultDeploymentProfile?: string };
    };
    expect(appManifest.runtime?.supportedDeploymentProfiles).toEqual(['standalone']);
    expect(appManifest.runtime?.defaultDeploymentProfile).toBe('standalone');
  });

  it('exposes_the_standalone_build_script_family_without_cloud', () => {
    const scripts = (readJson('package.json') as { scripts: Record<string, string> }).scripts;
    for (const environment of ['dev', 'test', 'staging', 'prod']) {
      expect(scripts[`build:${environment}`]).toBeDefined();
      expect(scripts[`build:${environment}`]).toContain('build-browser-client.mjs');
    }
    for (const scriptName of Object.keys(scripts)) {
      expect(scriptName.includes(':cloud'), `unexpected cloud script ${scriptName}`).toBe(false);
    }
  });

  it('keeps_runtime_env_sources_identity_exact_and_secret_free', () => {
    const sources = listFiles('etc/browser').filter((file) => file.endsWith('.json'));
    expect(sources.length).toBeGreaterThanOrEqual(4);
    for (const file of sources) {
      const content = readFileSync(path.join(appRoot, file), 'utf8');
      expect(content).not.toMatch(/token|secret|password|apikey|api_key/iu);
      const parsed = JSON.parse(content) as Record<string, unknown>;
      expect(parsed.runtimeTarget).toBe('browser');
      expect(parsed.browserOriginMode).toBe('same-origin');
      expect(parsed.profileId).toBe(`standalone.${String(parsed.environment)}`);
    }
  });
});

describe('theme contract (THEME_DARKMODE_SPEC)', () => {
  it('bootstraps_tailwind_once_with_the_dark_custom_variant', () => {
    const css = readFileSync(path.join(appRoot, 'src/index.css'), 'utf8');
    expect(css.match(/@import\s+"tailwindcss"/gu)).toHaveLength(1);
    expect(css).toContain('@custom-variant dark');
  });

  it('declares_light_and_dark_values_for_semantic_tokens', () => {
    const css = readFileSync(path.join(appRoot, 'src/index.css'), 'utf8');
    const lightSection = css.slice(css.indexOf(':root,'), css.indexOf('[data-sdk-color-mode="dark"]'));
    const darkSection = css.slice(css.indexOf('[data-sdk-color-mode="dark"]'));
    for (const token of [
      '--sdk-color-surface-canvas',
      '--sdk-color-text-primary',
      '--sdk-color-brand-primary',
      '--sdk-color-state-danger',
      '--sdk-color-border-default',
    ]) {
      expect(lightSection).toContain(token);
      expect(darkSection).toContain(token);
    }
  });

  it('inlines_the_anti_flash_boot_script_in_index_html', () => {
    const html = readFileSync(path.join(appRoot, 'index.html'), 'utf8');
    expect(html).toContain('data-sdk-color-mode');
    expect(html).toContain("classList.toggle('dark'");
    expect(html.indexOf('data-sdk-color-mode')).toBeLessThan(html.indexOf('src="/src/main.tsx"'));
  });
});
