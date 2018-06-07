// tslint:disable:no-implicit-dependencies
import { normalize } from '@angular-devkit/core';
import { filter, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'path';

const configPaths = ['/.angular.json', '/angular.json'];

function getProjectPaths(config /*: CliConfig*/): string[] {
    const sourceDirs = [];
    let globalPrefix;

    if (config.schematics && config.schematics['@schematics/angular:component']) {
        // updated projects have global prefix rather than per-project:
        globalPrefix = config.schematics['@schematics/angular:component'].prefix;
    }

    for (const projName of Object.keys(config.projects)) {
        const proj = config.projects[projName];
        if (proj.architect && proj.architect.e2e) {
            // filter out e2e apps
            continue;
        }
        let sourcePath = path.join('/', proj.sourceRoot);
        if (proj.prefix || globalPrefix) {
            sourcePath = path.join(sourcePath, proj.prefix || globalPrefix);
        }
        sourceDirs.push(normalize(sourcePath));
    }
    return sourceDirs;
}

/** Filter tree to project source dirs */
export function filterSourceDirs(host: Tree, context: SchematicContext): Rule {
    // tslint:disable:arrow-parens
    let config /*: CliConfig*/; // requires @schematics/angular
    const configPath = configPaths.find(x => host.exists(x));
    let sourcePaths: string[];
    const schematicPosition = context.schematic.collection.listSchematicNames().indexOf(context.schematic.description.name);

    if (schematicPosition !== 0 && !configPath) {
        // assume already filtered
        return tree => tree;
    } else if (configPath) {
        config = JSON.parse(host.read(configPath).toString());
        // TODO: Multi-project support
        sourcePaths = getProjectPaths(config);
    } else {
        context.logger.warn(`Couldn't find angular.json. This may take slightly longer to search all files.`);
        sourcePaths = host.root.subdirs.filter(x => x.indexOf('node_modules') === -1).map(x => `/${x}`);
    }

    return filter(x => {
        return !!sourcePaths.find(folder => x.startsWith(folder));
    });
}
