/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { resolveBrowserDistOutDir } from '../../../sdkwork-specs/tools/browser-dist-layout.mjs';
import {
  resolveViteEnvironment,
  resolveViteRuntimeProfile,
} from '../../../sdkwork-specs/tools/vite-runtime-profile.mjs';

export default defineConfig(({ mode }) => {
  const environment = resolveViteEnvironment(mode);
  const runtimeProfile = resolveViteRuntimeProfile(mode);
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        // Dev shadow (BROWSER_RUNTIME_ENV_SPEC §2-3): when a deploy-time
        // public/runtime-env.json artifact exists on disk, serve the
        // per-profile etc/browser source instead so the dev server never
        // poisons itself with a stale production document.
        name: 'zhiya-runtime-env-dev-shadow',
        configureServer(server) {
          server.middlewares.use('/runtime-env.json', (_req, res, next) => {
            if (_req.method !== 'GET' && _req.method !== 'HEAD') {
              next();
              return;
            }
            const source = resolve(import.meta.dirname, 'etc', 'browser', `runtime-env.${runtimeProfile.profileId}.json`);
            res.setHeader('Content-Type', 'application/json');
            res.end(readFileSync(source, 'utf8'));
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
    server: {
      port: 3300,
      host: '0.0.0.0',
    },
    build: {
      outDir: resolveBrowserDistOutDir(environment),
      emptyOutDir: true,
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.?(c|m)[jt]s?(x)'],
    },
    // `runtimeProfile` is resolved for parity with the canonical browser build
    // runner (mode = `<deploymentProfile>.<environment>`); the value is part of
    // the profile contract even though this standalone-only app needs no extra
    // define placeholders today.
    define: {
      __SDKWORK_PROFILE_ID__: JSON.stringify(runtimeProfile.profileId),
    },
  };
});
