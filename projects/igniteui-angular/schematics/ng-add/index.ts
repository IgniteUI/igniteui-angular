import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Options } from '../interfaces/options';
import { installPackageJsonDependencies } from '../utils/package-handler';
import {
  logSuccess, addDependencies, overwriteJsonFile,
  getPropertyFromWorkspace, getConfigFile
} from '../utils/dependency-handler';

import { addResetCss } from './add-normalize';
import { getWorkspace } from '@schematics/angular/utility/config';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';


/**
 * Checks whether a property exists in the angular workspace.
 */
function propertyExistsInWorkspace(targetProp: string, workspace: WorkspaceSchema): boolean {
  const foundProp = getPropertyFromWorkspace(targetProp, workspace);
  return foundProp !== null && foundProp.key === targetProp;
}

const enableIESupport = (tree: Tree, context: SchematicContext) => {
    const targetFile = '/.browserslistrc';
    let updateFile = false;
    let content = (tree.read(targetFile)?.toString());
    while (content?.includes('not IE')) {
      content = content.replace('not IE', 'IE');
      updateFile = true;
    }
    if (updateFile) {
      tree.overwrite(targetFile, content);
    } else {
      context.logger.warn(`Either IE support is already enabled OR you may need to update ${targetFile} file manually.`);
    }
  };

function enableWebAnimationsAndGridSupport(tree: Tree, targetFile: string, polyfillsData: any): void {
  // Target the web-animations-js commented import statement and uncomment it.
  const webAnimationsLine = '// import \'web-animations-js\';';
  polyfillsData = polyfillsData.replace(webAnimationsLine,
    webAnimationsLine.substring(3, webAnimationsLine.length));

  tree.overwrite(targetFile, polyfillsData);
}

function readInput(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.polyfills) {
      const workspace = getWorkspace(tree);
      const project = workspace.projects[workspace.defaultProject];
      const polyfillsFilePath = getConfigFile(project, 'polyfills', context);
      const browserslistrcFile = (tree.read('/.browserslistrc'));
      const animationsWarn = 'You may want to manually uncomment \'// import \'web-animations-js\' in polyfills.ts';
      // .browserslistrc --> If project targets angular cli version >= 10.0
      if (browserslistrcFile) {
        enableIESupport(tree, context);
      } else {
        context.logger.warn('.browserslistrc file not found. You may want to manually add it and enable IE support.');
      }
      if (polyfillsFilePath) {
        const polyfillsData = tree.read(polyfillsFilePath)?.toString();
        if (polyfillsData) {
          enableWebAnimationsAndGridSupport(tree, polyfillsFilePath, polyfillsData);
        } else {
          context.logger.warn('polyfills.ts file not found OR empty. ' + animationsWarn);
        }
      } else {
        context.logger.warn('polyfills.ts file path not found. ' + animationsWarn);
      }
    }
  };
}

function addNormalize(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.resetCss) {
      const result = addResetCss(tree);
      if (!result) {
        context.logger.warn(`Could not complete adding reset styles. Those may need to be added manually.`);
      }
    }
  };
}

export default function (options: Options): Rule {
  return chain([
    readInput(options),
    addNormalize(options),
    addDependencies(options),
    installPackageJsonDependencies(options),
    logSuccess(options)
  ]);
}
