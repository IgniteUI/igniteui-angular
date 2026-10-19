// projects/igniteui-angular/vitest.config.ts
import { defineConfig, mergeConfig, type Plugin } from 'vitest/config';
import { readFileSync } from 'node:fs';
import { availableParallelism, totalmem } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileAsync } from 'sass-embedded';
import { perfProbeOptions } from './test-utils/perf-probe.node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const nodeModules = resolve(__dirname, '../../node_modules');
const themeFile = resolve(__dirname, 'core/src/core/styles/themes/presets/igniteui-angular.scss');
let cachedTheme: string | null = null;

// Page-level styles the specs were written against (previously loaded by the Karma test target):
// full-height html/body and the icon/text fonts used by the components.
const testCss = readFileSync(resolve(__dirname, 'test.css'), 'utf-8');
const fontStylesheets = [
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/css?family=Titillium+Web:300,400,600,700'
];

// Spec files share one page per worker (isolate: false), and a page grows to this much renderer memory
// over a full run. Vitest's default of cores - 1 workers then swaps on a typical dev machine, which is
// slower than fewer workers. CI keeps Vitest's default; VITEST_MAX_WORKERS overrides both.
const PAGE_MEMORY_BUDGET = 3.5 * 1024 ** 3;
const localWorkers = Math.max(1, Math.min(availableParallelism() - 1, Math.floor(totalmem() / PAGE_MEMORY_BUDGET)));

// Since Angular nukes everything aside from `resolve, test, optimizeDeps and plugins` from the custom config,
// we have to inject the theme scss file as a plugin instead of a `css` configuration.
// This is not ideal but it is what it is.
const scssThemePlugin: Plugin = {
    name: 'scss-theme-inject',
    async transformIndexHtml() {
        if (!cachedTheme) {
            const result = await compileAsync(themeFile, {
                loadPaths: [nodeModules],
            });
            cachedTheme = result.css;
        }
        return [
            ...fontStylesheets.map(href => ({ tag: 'link', attrs: { rel: 'stylesheet', href }, injectTo: 'head' as const })),
            { tag: 'style', children: cachedTheme, injectTo: 'head' },
            { tag: 'style', children: testCss, injectTo: 'head' }
        ];
    },
};

const config = defineConfig({
  plugins: [scssThemePlugin],
  resolve: {
    alias: [
        // TODO: Fix this since it's mighty annoying to have to do this for every project
        // Exact match only: a plain 'fflate' key also matches 'fflate/browser' and re-aliases it.
        { find: /^fflate$/, replacement: 'fflate/browser' },
    ]
  },
  test: {
    ...(process.env['CI'] ? {} : { maxWorkers: localWorkers }),
    // IGX_LONG_STACKS=1 keeps zone.js long stack traces (see test-setup.ts) for debugging async failures.
    provide: { longStacks: !!process.env['IGX_LONG_STACKS'] },
    restoreMocks: true,
    browser: {
        viewport: { width: 1280, height: 720 },
        screenshotFailures: false
    }
  }
});

// Opt-in perf probe (IGX_PERF_PROBE=1); adds nothing otherwise.
export default mergeConfig(config, { test: perfProbeOptions(resolve(__dirname, '../..')) });
