import { workspaces } from '@angular-devkit/core';
import { chain } from '@angular-devkit/schematics';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import type { Options } from '../interfaces/options';
import { installPackageJsonDependencies } from '../utils/package-handler';
import { logSuccess, addDependencies } from '../utils/dependency-handler';
import { addResetCss } from './add-normalize';
import { createHost } from '../utils/util';

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
    addNormalize(options),
    addDependencies(options),
    installPackageJsonDependencies(options),
    logSuccess(options)
]);
