import { globby } from 'globby';
import { readFileSync, writeFileSync } from 'fs';

/**
 * Small patch for debugging compiled migrations that get wrapped with extra lines for encapsulation:
 * https://github.com/angular/angular-cli/blob/e51b9068763a115fa27d06e2dd7988b34a3f677c/packages/angular/cli/src/command-builder/utilities/schematic-engine-host.ts#L213-L215
 * Works for the simple "version":3 mappings produced where adding ; at the start shifts the mapped lines (ignores the extra unmapped source)
 */
(async () => {
    const paths = await globby('dist/igniteui-angular/migrations/**/*.js.map');
    for (const path of paths) {
        const extraLine = ';';
        const offset = 3;
        let content = readFileSync(path, { encoding: 'utf-8' });
        content = content.replace(`"mappings":"`, `"mappings":"${extraLine.repeat(offset)}`);
        writeFileSync(path, content);
    }
})();
