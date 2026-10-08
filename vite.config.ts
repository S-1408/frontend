import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { visualizer } from 'rollup-plugin-visualizer'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix loads non-VITE_ vars too; they're only used here, never bundled
  const env = loadEnv(mode, process.cwd(), '')
  // `npm run analyze` builds in this mode; normal builds skip the visualizer
  const isAnalyze = mode === 'analyze'

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Uploads source maps on `vite build` so Sentry shows readable stack traces.
      // Skipped when no auth token is set (local builds without Sentry access),
      // and for analyze builds, which are local-only and never deployed.
      sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        disable: !env.SENTRY_AUTH_TOKEN || isAnalyze,
      }),
      // Bundle size treemap: writes stats.html (gitignored) and opens it.
      // Shows raw, gzip and brotli sizes per module; gzip/brotli is roughly
      // what users actually download.
      isAnalyze &&
        visualizer({
          filename: 'stats.html',
          template: 'treemap',
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
    ],
    // 'hidden' generates maps for upload without referencing them from the JS
    build: {
      sourcemap: 'hidden',
      rolldownOptions: {
        output: {
          // Core libraries go in their own file. They rarely change, so browsers
          // keep it cached across deploys and repeat visits only re-download app code.
          // Listed explicitly (not all of node_modules) so page-only libraries like
          // react-hook-form stay in their lazy page chunk.
          codeSplitting: {
            groups: [
              {
                name: 'vendor',
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|@tanstack|@sentry|axios|sonner)[\\/]/,
              },
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      // `npm run test:coverage` writes coverage/lcov.info, which SonarQube Cloud
      // reads to show coverage per file and enforce it on new code in PRs
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/test/**', 'src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/**/*.d.ts'],
      },
    },
  }
})


// vite.config.ts: tells Vitest to run in jsdom, a simulated browser.
