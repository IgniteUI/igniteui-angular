// projects/igniteui-angular/vitest.config.ts
import { defineConfig, type Plugin } from 'vitest/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileAsync } from 'sass';
import { config } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const nodeModules = resolve(__dirname, '../../node_modules');
const themeFile = resolve(__dirname, 'core/src/core/styles/themes/presets/igniteui-angular.scss');

// Since Angular nukes everything aside from `resolve, test, optimizeDeps and plugins` from the custom config,
// we have to inject the theme scss file as a plugin instead of a `css` configuration.
// This is not ideal but it is what it is.
const scssThemePlugin: Plugin = {
    name: 'scss-theme-inject',
    async transformIndexHtml() {
        const result = await compileAsync(themeFile, {
            loadPaths: [nodeModules],
        });
        return [{ tag: 'style', children: result.css, injectTo: 'head' }];
    },
};

export default defineConfig({
  plugins: [scssThemePlugin],
  resolve: {
    alias: {
        // TODO: Fix this since it's mighty annoying to have to do this for every project
        'fflate': 'fflate/browser',
    }
  },
  test: {
    restoreMocks: true,
    browser: {
        viewport: { width: 1280, height: 720 },
        screenshotFailures: false
    }
  }
});
