import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    browser: {
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }]
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
    },
    projects: [{
      extends: './vitest.config.ts',
      test: {
        name: 'igniteui-angular',
        root: './projects/igniteui-angular',
        include: ['**/*.spec.ts'],
        exclude: [
          'migrations/**/*.spec.ts',
          'schematics/**/*.spec.ts',
          'cypress/**/*.spec.ts',
        ],
      },
    },
    ]
  },
});
