import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { SchematicContext, Rule, SchematicsException, chain } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@angular-devkit/core/src/workspace';
import { getWorkspace } from '@schematics/angular/utility/config';
import { Options } from '../interfaces/options';

const hammerJsMinAddress = './node_modules/hammerjs/hammer.min.js';

function logIncludingDependency(context: SchematicContext, pkg: string, version: string): void {
    context.logger.info(`Including ${pkg} - Version: ${version}`);
}

export function logSuccess(options: Options): Rule {
    return (tree: Tree, context: SchematicContext) => {
        context.logger.info('');
        context.logger.warn('Ignite UI for Angular installed');
        context.logger.info('Learn more: https://www.infragistics.com/products/ignite-ui-angular');
        context.logger.info('');
    };
}

export function addDependencies(options: Options): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const pkgJson = require('../../package.json');

        Object.keys(pkgJson.dependencies).forEach(pkg => {
            const version = pkgJson.dependencies[pkg];
            switch (pkg) {
                case 'hammerjs':
                    addPackageJsonDependency(tree, pkg, version);
                    addHammerJsToWorkspace(tree);
                    logIncludingDependency(context, pkg, version);
                    break;
                default:
                    addPackageJsonDependency(tree, pkg, version);
                    logIncludingDependency(context, pkg, version);
                    break;
            }
        });

        // Add web-animations-js to dependencies
        Object.keys(pkgJson.peerDependencies).forEach(pkg => {
            const version = pkgJson.peerDependencies[pkg];
            if (pkg.includes('web-animations')) {
                addPackageJsonDependency(tree, pkg, version);
                logIncludingDependency(context, pkg, version);
                return;
            }
        });

        addPackageToJsonDevDependency(tree, 'igniteui-cli', pkgJson.devDependencies['igniteui-cli']);
        return tree;
    };
}

function addHammerJsToWorkspace(tree: Tree): Tree {
    try {
        const targetFile = 'angular.json';
        const workspace = getWorkspace(tree);
        const addedtoBuildScripts = addHammerToAngularWorkspace(workspace, 'build');
        const addedtoToTestScripts = addHammerToAngularWorkspace(workspace, 'test');

        if (addedtoBuildScripts || addedtoToTestScripts) {
            tree.overwrite(targetFile, JSON.stringify(workspace, null, 2) + '\n');
        }

        return tree;
    } catch (e) {
        if (e.toString().includes('Could not find (undefined)')) {
            throw new SchematicsException('angular.json was not found in the project\'s root');
        }

        throw new Error(e.message);
    }
}

/**
 * Add Hammer script to angular.json section
 * @param workspace Angular Workspace Schema (angular.json)
 * @param key Architect tool key to add option to
 */
function addHammerToAngularWorkspace(workspace: WorkspaceSchema, key: string): boolean {
    const currentProjectName = workspace.defaultProject;
    if (currentProjectName) {
        if (!workspace.projects[currentProjectName].architect) {
            workspace.projects[currentProjectName].architect = {};
        }
        if (!workspace.projects[currentProjectName].architect[key]) {
            workspace.projects[currentProjectName].architect[key] = {};
        }
        if (!workspace.projects[currentProjectName].architect[key].options) {
            workspace.projects[currentProjectName].architect[key].options = {};
        }
        if (!workspace.projects[currentProjectName].architect[key].options.scripts) {
            workspace.projects[currentProjectName].architect[key].options.scripts = [];
        }
        if (!workspace.projects[currentProjectName].architect[key].options.scripts.includes(hammerJsMinAddress)) {
            workspace.projects[currentProjectName].architect[key].options.scripts.push(hammerJsMinAddress);
            return true;
        }

        return false;
    }
}

function addPackageJsonDependency(tree: Tree, pkg: string, version: string): Tree {
    const targetFile = 'package.json';
    if (tree.exists(targetFile)) {
        const sourceText = tree.read(targetFile).toString();
        const json = JSON.parse(sourceText);

        if (!json.dependencies) {
            json.dependencies = {};
        }

        if (!json.dependencies[pkg]) {
            json.dependencies[pkg] = version;
            json.dependencies =
                Object.keys(json.dependencies)
                    .sort()
                    .reduce((result, key) => (result[key] = json.dependencies[key]) && result, {});
            tree.overwrite(targetFile, JSON.stringify(json, null, 2) + '\n');
        }
    }

    return tree;
}

function addPackageToJsonDevDependency(tree: Tree, pkg: string, version: string): Tree {
    const targetFile = 'package.json';
    if (tree.exists(targetFile)) {
        const sourceText = tree.read(targetFile).toString();
        const json = JSON.parse(sourceText);

        if (!json.devDependencies) {
            json.devDependencies = {};
        }

        if (!json.devDependencies[pkg]) {
            json.devDependencies[pkg] = version;
            json.devDependencies =
                Object.keys(json.devDependencies)
                    .sort()
                    .reduce((result, key) => (result[key] = json.devDependencies[key]) && result, {});
            tree.overwrite(targetFile, JSON.stringify(json, null, 2) + '\n');
        }
    }

    return tree;
}
