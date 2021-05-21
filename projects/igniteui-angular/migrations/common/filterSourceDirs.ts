import { filter, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace, getWorkspacePath, getProjectPaths } from './util';

/**
 * Filter tree to project source dirs
 *
 * @deprecated Temporary
 */
export const filterSourceDirs = (host: Tree, context: SchematicContext): Rule => {
    const configPath = getWorkspacePath(host);
    let sourcePaths: string[];
    const schematicPosition = context.schematic.collection.listSchematicNames().indexOf(context.schematic.description.name);

    if (schematicPosition !== 0 && !configPath) {
        // assume already filtered
        return tree => tree;
    }
    const config = getWorkspace(host);
    if (config) {
        sourcePaths = getProjectPaths(config);
    } else {
        context.logger.warn(`Couldn't find angular.json. This may take slightly longer to search all files.`);
        sourcePaths = host.root.subdirs.filter(x => x.indexOf('node_modules') === -1).map(x => `/${x}`);
    }

    return filter(x => !!sourcePaths.find(folder => x.startsWith(folder)));
};
