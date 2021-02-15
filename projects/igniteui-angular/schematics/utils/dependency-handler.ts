import { SchematicContext, Rule, SchematicsException } from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { getWorkspace } from '@schematics/angular/utility/config';
import { Options } from '../interfaces/options';
import { WorkspaceProject, ProjectType } from '@schematics/angular/utility/workspace-models';


export enum PackageTarget {
    DEV = 'devDependencies',
    REGULAR = 'dependencies',
    NONE = 'none'
}
export interface PackageEntry {
    name: string;
    target: PackageTarget;
}


const schematicsPackage = '@igniteui/angular-schematics';
/**
 * Dependencies are explicitly defined here, so we avoid adding
 * unnecessary packages to the consuming project's deps
 */
export const DEPENDENCIES_MAP: PackageEntry[] = [
    // dependencies
    { name: 'hammerjs', target: PackageTarget.REGULAR },
    { name: 'jszip', target: PackageTarget.REGULAR },
    { name: 'tslib', target: PackageTarget.NONE },
    { name: 'resize-observer-polyfill', target: PackageTarget.REGULAR },
    { name: '@types/hammerjs', target: PackageTarget.DEV },
    { name: 'igniteui-trial-watermark', target: PackageTarget.NONE },
    { name: 'lodash.mergewith', target: PackageTarget.NONE },
    { name: 'uuid', target: PackageTarget.NONE },
    { name: 'web-animations-js', target: PackageTarget.REGULAR },
    { name: '@igniteui/material-icons-extended', target: PackageTarget.REGULAR },
    // peerDependencies
    { name: '@angular/forms', target: PackageTarget.NONE },
    { name: '@angular/common', target: PackageTarget.NONE },
    { name: '@angular/core', target: PackageTarget.NONE },
    { name: '@angular/animations', target: PackageTarget.NONE },
    // igxDevDependencies
    { name: '@igniteui/angular-schematics', target: PackageTarget.DEV }
];

function logIncludingDependency(context: SchematicContext, pkg: string, version: string): void {
    context.logger.info(`Including ${pkg} - Version: ${version}`);
}

function getTargetedProjectOptions(project: WorkspaceProject<ProjectType>, target: string, context: SchematicContext) {
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

    context.logger.warn(`Could not find matching ${target} options ` +
        `in Angular workspace ${project.sourceRoot}. ` +
        `It could require you to manually add and update the ${target} section.`);
}

export function getConfigFile(
    project: WorkspaceProject<ProjectType>, option: string, context: SchematicContext, configSection: string = 'build'): string {
    const options = getTargetedProjectOptions(project, configSection, context);
    if (!options) {
        context.logger.warn(`Could not find matching ${configSection} options in Angular workspace. ` +
            `It could require you to manually add and update the ${configSection} options.`);

    }
    if (options) {
        if (!options[option]) {
            context.logger.warn(`Could not find a matching ${option} property under ${configSection} options in Angular workspace. ` +
                `Some updates may not execute correctly.`);
        } else {
            return options[option];
        }
    }
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

        includeDependencies(pkgJson, context, tree);

        // Add web-animations-js to dependencies
        Object.keys(pkgJson.peerDependencies).forEach(pkg => {
            if (pkg.includes('web-animations')) {
                const version = pkgJson.peerDependencies[pkg];
                addPackageToPkgJson(tree, pkg, version, PackageTarget.REGULAR);
                logIncludingDependency(context, pkg, version);
                return;
            }
        });

        addPackageToPkgJson(tree, schematicsPackage, pkgJson.igxDevDependencies[schematicsPackage], PackageTarget.DEV);
        return tree;
    };
}

/**
 * Recursively search for the first property that matches targetProp within a json file.
 */
export function getPropertyFromWorkspace(targetProp: string, workspace: any, curKey = ''): { key: string, value: any } {
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
                if (newValue) {
                    return newValue;
                }
            }
        }
    }

    return null;
}

const addHammerToConfig = (workspace, project: WorkspaceProject<ProjectType>, tree: Tree, config: string, context: SchematicContext) => {
    const projectOptions = getTargetedProjectOptions(project, config, context);
    const tsPath = getConfigFile(project, 'main', context, config);
    const hammerImport = 'import \'hammerjs\';\n';
    const tsContent = tree.read(tsPath)?.toString();
    // if there are no elements in the architect[config]options.scripts array that contain hammerjs
    // and the "main" file does not contain an import with hammerjs
    if (!projectOptions?.scripts?.some(el => el.includes('hammerjs')) && !tsContent?.includes(hammerImport)) {
        const hammerjsFilePath = './node_modules/hammerjs/hammer.min.js';
        if (projectOptions?.scripts) {
            projectOptions.scripts.push(hammerjsFilePath);
            overwriteJsonFile(tree, 'angular.json', workspace);
            return;
        }
        context.logger.warn(`Could not find a matching scripts array property under ${config} options. ` +
            `It could require you to manually update it to 'scripts': [ ${hammerjsFilePath}] `);
    }
};

function includeDependencies(pkgJson: any, context: SchematicContext, tree: Tree) {
    Object.keys(pkgJson.dependencies).forEach(pkg => {
        const version = pkgJson.dependencies[pkg];
        const entry = DEPENDENCIES_MAP.find(e => e.name === pkg);
        const workspace = getWorkspace(tree);
        const defaultProject = workspace.projects[workspace.defaultProject];
        if (!entry || entry.target === PackageTarget.NONE) {
            return;
        }
        switch (pkg) {
            case 'hammerjs':
                logIncludingDependency(context, pkg, version);
                addPackageToPkgJson(tree, pkg, version, entry.target);
                addHammerToConfig(workspace, defaultProject, tree, 'build', context);
                addHammerToConfig(workspace, defaultProject, tree, 'test', context);
                break;
            default:
                logIncludingDependency(context, pkg, version);
                addPackageToPkgJson(tree, pkg, version, entry.target);
                break;
        }
    });
}

export function addPackageToPkgJson(tree: Tree, pkg: string, version: string, target: string): boolean {
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

        return true;
    }

    return false;
}
