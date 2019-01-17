import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Options } from '../interfaces/options';
import { installPackageJsonDependencies } from '../utils/package-handler';
import { logSuccess, addDependencies } from '../utils/dependency-handler';

import * as os from 'os';

/**
 *  ES7 `Object.entries` needed for igxGrid to render in IE.
 * - https://github.com/IgniteUI/igniteui-cli/issues/344
 */
function addIgxGridSupportForIe(polyfillsData: string): string {
  const targetImport = 'import \'core-js/es6/set\';';
  const lineToAdd = 'import \'core-js/es7/object\';';
  const comment = '/** ES7 `Object.entries` needed for igxGrid to render in IE. */';
  return polyfillsData.replace(targetImport, `${targetImport}${os.EOL}${comment}${os.EOL}${lineToAdd}`);
}

function enablePolyfills(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.polyfills) {
      const targetFile = 'src/polyfills.ts';
      if (!tree.exists(targetFile)) {
        context.logger.warn(`${targetFile} not found. You may need to update polyfills.ts manually.`);
        return;
      }

      // Match all commented import statements that are core-js/es6/*
      const pattern = /\/{2}\s{0,}(import\s{0,}\'core\-js\/es6\/.+)/;
      let polyfillsData = tree.read(targetFile).toString();
      if (pattern.test(polyfillsData)) {
        let result: any;
        while (result = pattern.exec(polyfillsData)) {
          polyfillsData = polyfillsData.replace(result[0], result[1]);
        }
      }

      // Target the web-animations-js commented import statement and uncomment it.
      const webAnimationsLine = '// import \'web-animations-js\';';
      polyfillsData = polyfillsData.replace(webAnimationsLine,
        webAnimationsLine.substring(3, webAnimationsLine.length));

      polyfillsData = addIgxGridSupportForIe(polyfillsData);
      tree.overwrite(targetFile, polyfillsData);
    }
  };
}

export default function (options: Options): Rule {
  return chain([
    enablePolyfills(options),
    addDependencies(options),
    installPackageJsonDependencies(options),
    logSuccess(options)
  ]);
}
