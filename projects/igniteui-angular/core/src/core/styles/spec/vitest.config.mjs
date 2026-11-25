import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const specDir = dirname(fileURLToPath(import.meta.url));

// Sass unit tests (sass-true) run in Node, separately from the browser-based component tests.
export default defineConfig({
    // Keep Vite's cache in the repository's node_modules rather than next to the spec files.
    cacheDir: resolve(specDir, '../../../../../../../node_modules/.vite'),
    test: {
        root: specDir,
        include: ['tests.mjs'],
        environment: 'node'
    }
});
