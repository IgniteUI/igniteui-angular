import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
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
]);
