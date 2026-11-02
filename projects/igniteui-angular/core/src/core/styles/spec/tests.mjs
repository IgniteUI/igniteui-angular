import * as path from 'path';
import * as sass from 'sass-embedded';
import * as sassTrue from 'sass-true';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '_index.scss');
sassTrue.runSass({ describe, it }, file, { loadPaths: ['node_modules'] });

describe('Theme included inside a selector', () => {
    it('should declare the cascade layer order at the stylesheet root', () => {
        const root = path.resolve(__dirname, '../../../../../../..');
        const { css } = sass.compileString(
            `@use 'styles/themes' as *;
            .light-theme { @include theme($schema: $light-material-schema, $palette: $light-material-palette); }`,
            {
                loadPaths: ['node_modules', 'projects/igniteui-angular', 'projects/igniteui-angular/core/src/core/'].map((p) => path.join(root, p)),
                silenceDeprecations: ['if-function'],
            }
        );

        expect(css).toMatch(/^@layer ig\.reset, ig\.base, ig\.material, ig\.derived;$/m);
    });
});
