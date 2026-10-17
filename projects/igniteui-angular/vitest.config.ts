// projects/igniteui-angular/vitest.config.ts
import { defineConfig, type Plugin } from 'vitest/config';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileAsync } from 'sass-embedded';

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

export default defineConfig({
  plugins: [scssThemePlugin],
  resolve: {
    alias: [
        // TODO: Fix this since it's mighty annoying to have to do this for every project
        // Exact match only: a plain 'fflate' key also matches 'fflate/browser' and re-aliases it.
        { find: /^fflate$/, replacement: 'fflate/browser' },
    ]
  },
  test: {
    restoreMocks: true,
    browser: {
        viewport: { width: 1280, height: 720 },
        screenshotFailures: false
    }
  }
});
