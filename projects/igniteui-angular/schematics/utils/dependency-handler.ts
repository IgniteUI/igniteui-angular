import { SchematicContext, Rule, SchematicsException } from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { getWorkspace } from '@schematics/angular/utility/config';
import { Options } from '../interfaces/options';
import { WorkspaceProject, ProjectType, WorkspaceSchema } from '@schematics/angular/utility/workspace-models';

const schematicsPackage = '@igniteui/angular-schematics';

function logIncludingDependency(context: SchematicContext, pkg: string, version: string): void {
    context.logger.info(`Including ${pkg} - Version: ${version}`);
}

function getTargetedProjectOptions(project: WorkspaceProject<ProjectType>, target: string) {
    if (project.targets &&
        project.targets[target] &&
        project.targets[target].options) {
        return project.targets[target].options;
    }

    if (project.architect &&
        project.architect[target] &&
        project.architect[target].options) {
        return project.architect[target].options;
    }

    throw new SchematicsException(`Cannot determine the project's configuration for: ${target}`);
}

function getMainFile(project: WorkspaceProject<ProjectType>): string {
    const buildOptions = getTargetedProjectOptions(project, 'build');
    if (!buildOptions.main) {
        throw new SchematicsException(`Could not find the project main file inside of the ` +
            `workspace config (${project.sourceRoot})`);
    }

    return buildOptions.main;
}

export function overwriteJsonFile(tree: Tree, targetFile: string, data: any) {
    tree.overwrite(targetFile, JSON.stringify(data, null, 2) + '\n');
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
        const dependencies = 'dependencies';
        const devDependencies = 'devDependencies';

        includeDependencies(pkgJson, context, tree, dependencies);

        // Add web-animations-js to dependencies
        Object.keys(pkgJson.peerDependencies).forEach(pkg => {
            const version = pkgJson.peerDependencies[pkg];
            if (pkg.includes('web-animations')) {
                addPackageToPkgJson(tree, pkg, version, dependencies);
                logIncludingDependency(context, pkg, version);
                return;
            }
        });

        addPackageToPkgJson(tree, schematicsPackage, pkgJson.devDependencies[schematicsPackage], devDependencies);
        return tree;
    };
}

/**
 * Recursively search for the first property that matches targetProp within the angular.json file.
 */
export function getPropertyFromWorkspace(targetProp: string, workspace: any, curKey = ''): any {
    if (workspace.hasOwnProperty(targetProp)) {
        return { key: targetProp, value: workspace[targetProp] };
    }

    const workspaceKeys = Object.keys(workspace);
    for (const key of workspaceKeys) {
        // If the target property is an array, return its key and its contents.
        if (Array.isArray(workspace[key])) {
            return {
                key: curKey,
                value: workspace[key]
            };
        } else if (workspace[key] instanceof Object) {
            // If the target property is an object, go one level in.
            if (workspace.hasOwnProperty(key)) {
                const newValue = getPropertyFromWorkspace(targetProp, workspace[key], key);
                if (newValue !== null) {
                    return newValue;
                }
            }
        }
    }

    return null;
}

function includeDependencies(pkgJson: any, context: SchematicContext, tree: Tree, dependenciesKey: string) {
    Object.keys(pkgJson.dependencies).forEach(pkg => {
        const version = pkgJson.dependencies[pkg];
        switch (pkg) {
            case 'hammerjs':
                logIncludingDependency(context, pkg, version);
                addPackageToPkgJson(tree, pkg, version, dependenciesKey);

                const workspace = getWorkspace(tree);
                const project = workspace.projects[workspace.defaultProject];
                const projectOptions = getTargetedProjectOptions(project, 'build');
                const mainTsPath = getMainFile(project);
                const hammerImport = 'import \'hammerjs\';\n';
                const mainTsContent = tree.read(mainTsPath).toString();
                // if there are no elements in the architect.build.options.scripts array that contain hammerjs
                // and main.ts does not contain an import with hammerjs
                if (!projectOptions.scripts.some(el => el.includes('hammerjs')) && !mainTsContent.includes(hammerImport)) {
                    // import hammerjs in the main.ts file
                    const contents = hammerImport + mainTsContent;
                    tree.overwrite(mainTsPath, contents);
                }
                break;
            default:
                logIncludingDependency(context, pkg, version);
                addPackageToPkgJson(tree, pkg, version, dependenciesKey);
                break;
        }
    });
}

/**
 * Add an item to an angular.json section, within the architect
 * @param workspace Angular Workspace Schema (angular.json)
 * @param key Architect tool key to add option to
 */
function addItemToAngularWorkspace(workspace: WorkspaceSchema, key: string, item: string): boolean {
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
        if (!workspace.projects[currentProjectName].architect[key].options.scripts.includes(item)) {
            workspace.projects[currentProjectName].architect[key].options.scripts.push(item);
            return true;
        }

        return false;
    }
}

function addPackageToPkgJson(tree: Tree, pkg: string, version: string, target: string): Tree {
    const targetFile = 'package.json';
    if (tree.exists(targetFile)) {
        const sourceText = tree.read(targetFile).toString();
        const json = JSON.parse(sourceText);

        if (!json[target]) {
            json[target] = {};
        }

        if (!json.dependencies[pkg]) {
            json[target][pkg] = version;
            json[target] =
                Object.keys(json[target])
                    .sort()
                    .reduce((result, key) => (result[key] = json[target][key]) && result, {});
            tree.overwrite(targetFile, JSON.stringify(json, null, 2) + '\n');
        }
    }

    return tree;
}
