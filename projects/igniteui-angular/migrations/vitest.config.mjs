import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

// Schematics and migrations are tested in Node against their CommonJS build in dist
// (see `test:schematics`), since the schematics engine `require`s the compiled factories.
export default defineConfig({
    test: {
        root: resolve(repoRoot, 'dist/igniteui-angular'),
        include: ['migrations/**/*.spec.js', 'schematics/**/*.spec.js'],
        // Shared helpers named *.spec.js that hold no tests.
        exclude: ['migrations/common/setup.spec.js'],
        environment: 'node',
        // Resolve the `igniteui-angular/...` specifiers used by migrations against the dist build.
        execArgv: ['--require', resolve(repoRoot, 'projects/igniteui-angular/migrations/tsconfig-paths-bootstrap.js')],
        // The compiled specs are CommonJS, which cannot `require('vitest')`, so they rely on globals.
        globals: true,
        restoreMocks: true,
        // Language-service based migrations spin up a TS program per test and can be slow.
        testTimeout: 30000
    }
});
