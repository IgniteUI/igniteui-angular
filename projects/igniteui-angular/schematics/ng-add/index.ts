import { WorkspaceSchema } from '@angular-devkit/core/src/workspace';
import { chain, Rule, SchematicContext, Tree, SchematicsException, FileDoesNotExistException } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
// tslint:disable-next-line:no-submodule-imports
import { getWorkspace } from '@schematics/angular/utility/config';
import { DependencyNotFoundException } from '@angular-devkit/core';

export interface Options {
  [key: string]: any;
  polyfills: boolean;
}

const extSchematicModule = 'igniteui-cli';
const schematicName = 'cli-config';
const hammerJsMinAddress = './node_modules/hammerjs/hammer.min.js';

function logSuccess(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(``);
    context.logger.warn(`Ignite UI for Angular installed`);
    context.logger.info(`Learn more: https://www.infragistics.com/products/ignite-ui-angular`);
    context.logger.info(``);
  };
}

function addDependencies(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pkgJson = require('../../package.json');

    Object.keys(pkgJson.dependencies).forEach(pkg => {
      const version = pkgJson.dependencies[pkg];
      switch (pkg) {
        case 'hammerjs':
          addPackageJsonDependency(tree, pkg, version);
          addHammerJsToWorkspace(tree);
          LogIncludingDependency(context, pkg, version);
          break;
        default:
          addPackageJsonDependency(tree, pkg, version);
          LogIncludingDependency(context, pkg, version);
          break;
      }
    });

    addPackageToJsonDevDependency(tree, 'igniteui-cli', pkgJson.devDependencies['igniteui-cli']);
    displayVersionMismatch(context, tree, pkgJson);
    promptEnablePolyfills(context, tree, options);
    return tree;
  };
}

function LogIncludingDependency(context: SchematicContext, pkg: string, version: string) {
  context.logger.info(`Including ${pkg} - Version: ${version}`);
}

function promptEnablePolyfills(context: SchematicContext, tree: Tree, options: Options) {
  if (options.polyfills) {
    const targetFile = 'src/polyfills.ts';
    if (!tree.exists(targetFile)) {
      context.logger.warn(`${targetFile} not found. You may need to update polyfills.ts manually.`);
      return;
    }

    // Match all commented import statements that are core-js/es6/*
    const pattern = /\/{2}\s{0,}import\s{0,}\'core\-js\/es6\/.+/g;
    let polyfillsData = tree.read(targetFile).toString();
    for (const match of polyfillsData.match(pattern)) {
      polyfillsData = polyfillsData.replace(match, match.substring(2, match.length));
    }

    // Target the web-animations-js commented import statement and uncomment it.
    const webAnimationsLine = '// import \'web-animations-js\';';
    polyfillsData = polyfillsData.replace(webAnimationsLine,
      webAnimationsLine.substring(2, webAnimationsLine.length));

    polyfillsData = addIgxGridSupportForIe(polyfillsData);
    tree.overwrite(targetFile, polyfillsData);
    return tree;
  }
}


/**
 * The import is needed so that the igxGrid can render under IE.
 * - https://github.com/IgniteUI/igniteui-cli/issues/344
 */
function addIgxGridSupportForIe(polyfillsData: string): string {
  const targetImport = 'import \'core-js/es6/set\';';
  const lineToAdd = 'import \'core-js/es7/object\';';
  return polyfillsData.replace(targetImport, `${targetImport}\n ${lineToAdd}`);
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
function addHammerToAngularWorkspace(workspace: WorkspaceSchema, key: string) {
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

function displayVersionMismatch(context: SchematicContext, tree: Tree, igPackageJson: any) {
  const ngKey = '@angular/core';
  const ngCommonKey = '@angular/common';
  const ngProjVer = getDependencyVersion(ngKey, tree);
  const ngCommonProjVer = getDependencyVersion(ngCommonKey, tree);
  const igAngularVer = igPackageJson.peerDependencies[ngKey];
  const igAngularCommonVer = igPackageJson.peerDependencies[ngCommonKey];

  if (ngProjVer < igAngularVer || ngCommonProjVer < igAngularCommonVer) {
    context.logger.warn(`
    Version mismatch detected - igniteui-angular is built against a newer version of @angular/core (${igAngularVer}).
    Running 'ng update' will prevent potential version conflicts.`);
  }
}

function getDependencyVersion(pkg: string, tree: Tree) {
  const targetFile = 'package.json';
  if (tree.exists(targetFile)) {
    const sourceText = tree.read(targetFile).toString();
    const json = JSON.parse(sourceText);

    let targetDep;
    if (json.dependencies[pkg]) {
      targetDep = json.dependencies[pkg];
    } else {
      targetDep = json.devDependencies[pkg];
    }
    if (!targetDep) {
      throw new DependencyNotFoundException();
    }

    return targetDep;
  }

  throw new FileDoesNotExistException(`${tree.root.path}/${targetFile}`);
}

function installPackageJsonDependencies(options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const installTaskId = context.addTask(new NodePackageInstallTask());
    // Add Task for igniteu-cli schematic and wait for install task to finish
    context.addTask(
      new RunSchematicTask(
        `${extSchematicModule}`, // Module
        `${schematicName}`, // Schematic Name
        {
          collection: extSchematicModule,
          name: `${schematicName}`,
          options
        }
      ),
      [installTaskId]);

    return tree;
  };
}

export default function (options): Rule {
  return chain([
    addDependencies(options),
    installPackageJsonDependencies(options),
    logSuccess(options)
  ]);
}
