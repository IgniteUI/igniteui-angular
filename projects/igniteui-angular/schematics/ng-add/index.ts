import { workspaces } from '@angular-devkit/core';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Options } from '../interfaces/options';
import { installPackageJsonDependencies } from '../utils/package-handler';
import {
  logSuccess, addDependencies, getConfigFile
} from '../utils/dependency-handler';
import { addResetCss } from './add-normalize';
import { createHost } from '../utils/util';

const enableIESupport = (tree: Tree, context: SchematicContext) => {
    const targetFile = '/.browserslistrc';
    let updateFile = false;
    let browserslistrcContent = (tree.read(targetFile)?.toString());
    while (browserslistrcContent?.includes('not IE')) {
        browserslistrcContent = browserslistrcContent.replace('not IE', 'IE');
        updateFile = true;
    }
    if (updateFile) {
        tree.overwrite(targetFile, browserslistrcContent);
    } else {
        context.logger.warn(
            `Commented out IE section not found.
            Either IE support is already enabled OR you may need to update ${targetFile} file manually.`);
    }
};

// Only required if AnimationBuilder is used (igniteui-angular does) & using IE/Edge or Safari
const enableWebAnimationsAndGridSupport = (tree: Tree, targetFile: string, polyfillsData: any): void => {
  // Target the web-animations-js commented import statement and uncomment it.
  const webAnimationsLine = '// import \'web-animations-js\';';
  polyfillsData = polyfillsData.replace(webAnimationsLine,
    webAnimationsLine.substring(3, webAnimationsLine.length));

  tree.overwrite(targetFile, polyfillsData);
};

const readInput = (options: Options): Rule =>
    async (tree: Tree, context: SchematicContext) => {
        const workspaceHost = createHost(tree);
        const { workspace } = await workspaces.readWorkspace(tree.root.path, workspaceHost);
        if (options.polyfills) { // TODO may be can be refactored/deleted using only -->  const polyfillsFile = getConfigFile(
            const project = workspace.projects.get(workspace.extensions['defaultProject'] as string);
            const polyfillsFile = getConfigFile(project, 'polyfills', context);
            if (polyfillsFile !== undefined) {
                const polyfillsData = tree.read(polyfillsFile).toString();
                const browserslistrcFile = (tree.read('/.browserslistrc'));
                // If project targets angular cli version >= 10.0
                if (browserslistrcFile !== undefined) {
                    context.logger.warn('browserslistrcFile is TRUE');
                    enableIESupport(tree, context);
                    enableWebAnimationsAndGridSupport(tree, polyfillsFile, polyfillsData);
                } else {
                    context.logger.warn(`You may want to manually uncomment '// import 'web-animations-js' in polyfills.ts`);
                }
            }
        }
    };

const addNormalize = (options: Options): Rule =>
  async (tree: Tree, context: SchematicContext) => {
    if (options.resetCss) {
      const workspaceHost = createHost(tree);
      const { workspace } = await workspaces.readWorkspace(tree.root.path, createHost(tree));
      const result = addResetCss(workspace, tree);
      await workspaces.writeWorkspace(workspace, workspaceHost);
      if (!result) {
        context.logger.warn(`Could not complete adding reset styles. Those may need to be added manually.`);
      }
    }
  };

export default (options: Options): Rule => chain([
  readInput(options),
  addNormalize(options),
  addDependencies(options),
  installPackageJsonDependencies(options),
  logSuccess(options)
]);
