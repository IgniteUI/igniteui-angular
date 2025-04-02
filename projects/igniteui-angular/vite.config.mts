/// <reference types="vitest" />
/// <reference types="@vitest/browser/providers/playwright" />

import angular from '@analogjs/vite-plugin-angular';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        plugins: [
            ...angular({
                tsconfig: 'projects/igniteui-angular/tsconfig.spec.json',
                workspaceRoot: path.resolve(__dirname, '../../')
            }),
            viteTsConfigPaths()],
        server: {
            fs: {
                strict: false,
            },
        },
        test: {
            globals: true,
            setupFiles: ['src/test-setup.ts'],
            include: [
                'src/lib/accordion/**/*.spec.ts',
                'src/lib/action-strip/**/*.spec.ts',
                'src/lib/avatar/**/*.spec.ts',
                'src/lib/badge/**/*.spec.ts',
                'src/lib/banner/**/*.spec.ts',
                'src/lib/checkbox/**/*.spec.ts'
            ],
            reporters: ['default'],
            browser: {
                enabled: true,
                provider: 'playwright',
                headless: true,
                viewport: { height: 800, width: 600 },
                instances: [
                    {
                        browser: 'chromium',
                        launch: {
                            args: ['--no-sandbox', '--disable-gpu', '--js-flags="--expose-gc"']
                        }
                    }
                ]
            },
        },
        define: {
            'import.meta.vitest': mode !== 'production',
        },
    };
});
