import { WorkspaceSchema } from '@angular-devkit/core/src/workspace';
import { chain, Rule, SchematicContext, Tree, externalSchematic, SchematicsException } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
// tslint:disable-next-line:no-submodule-imports
import { getWorkspace } from '@schematics/angular/utility/config';

export interface Options {
  [key: string]: any;
}

const extSchematicModule = 'igniteui-cli';
const schematicName = 'cli-config';
const hammerJsMinAddress = './node_modules/hammerjs/hammer.min.js';

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
    return tree;
  };
}

function LogIncludingDependency(context: SchematicContext, pkg: string, version: string) {
  context.logger.log('info', `Including ${pkg} - Version: ${version}`);
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

function installPackageJsonDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.log('info', 'Installing packages...');

    return tree;
  };
}

export default function (options): Rule {
  return chain([
    addDependencies(options),
    installPackageJsonDependencies(),
    externalSchematic(extSchematicModule, schematicName, options)
  ]);
}
