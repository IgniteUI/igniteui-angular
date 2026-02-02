import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright'
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^igniteui-angular\/(.*)$/,
        replacement: path.resolve(__dirname, 'projects/igniteui-angular/$1')
      },
      {
        find: 'igniteui-angular',
        replacement: path.resolve(__dirname, 'projects/igniteui-angular/src/public_api.ts')
      },
      {
        find: 'igniteui-angular-i18n',
        replacement: path.resolve(__dirname, 'projects/igniteui-angular-i18n/src/index.ts')
      }
    ]
  },
  test: {
    globals: true,
    include: ['**/*.spec.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/migrations/**',
      '**/schematics/**',
      '**/cypress/**',
    ],
    browser: {
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        'dist/',
      ],
    }
  },
});
