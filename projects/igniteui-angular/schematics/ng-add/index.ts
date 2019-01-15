import { chain, Rule, SchematicContext, Tree, FileDoesNotExistException, schematic } from '@angular-devkit/schematics';
import { DependencyNotFoundException } from '@angular-devkit/core';
import { Options } from '../interfaces/options';
import { installPackageJsonDependencies } from '../utils/package-handler';
import { logSuccess, addDependencies } from '../utils/dependency-handler';

function displayVersionMismatch(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const igPackageJson = require('../../package.json');
    const ngKey = '@angular/core';
    const ngCommonKey = '@angular/common';
    const ngProjVer = getDependencyVersion(ngKey, tree);
    const ngCommonProjVer = getDependencyVersion(ngCommonKey, tree);
    const igAngularVer = igPackageJson.peerDependencies[ngKey];
    const igAngularCommonVer = igPackageJson.peerDependencies[ngCommonKey];

    if (ngProjVer < igAngularVer || ngCommonProjVer < igAngularCommonVer) {
      context.logger.warn(`
WARNING Version mismatch detected - igniteui-angular is built against a newer version of @angular/core (${igAngularVer}).
Running 'ng update' will prevent potential version conflicts.\n`);
    }
  };
}

/**
 *  ES7 `Object.entries` needed for igxGrid to render in IE.
 * - https://github.com/IgniteUI/igniteui-cli/issues/344
 */
function addIgxGridSupportForIe(polyfillsData: string): string {
  const targetImport = 'import \'core-js/es6/set\';';
  const lineToAdd = 'import \'core-js/es7/object\';';
  return polyfillsData.replace(targetImport, `${targetImport}\n ${lineToAdd}`);
}

function enablePolyfills(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.polyfills) {
      const targetFile = 'src/polyfills.ts';
      if (!tree.exists(targetFile)) {
        context.logger.warn(`${targetFile} not found. You may need to update polyfills.ts manually.`);
        return;
      }

      // Match all commented import statements that are core-js/es6/*
      const pattern = /\/{2}\s{0,}import\s{0,}\'core\-js\/es6\/.+/g;
      let polyfillsData = tree.read(targetFile).toString();
      if (pattern.test(polyfillsData)) {
        polyfillsData.match(pattern).forEach(match => {
          polyfillsData = polyfillsData.replace(match, match.substring(2, match.length));
        });
      }

      // Target the web-animations-js commented import statement and uncomment it.
      const webAnimationsLine = '// import \'web-animations-js\';';
      polyfillsData = polyfillsData.replace(webAnimationsLine,
        webAnimationsLine.substring(2, webAnimationsLine.length));

      polyfillsData = addIgxGridSupportForIe(polyfillsData);
      tree.overwrite(targetFile, polyfillsData);
    }
  };
}

function getDependencyVersion(pkg: string, tree: Tree): string {
  const targetFile = 'package.json';
  if (tree.exists(targetFile)) {
    const sourceText = tree.read(targetFile).toString();
    const json = JSON.parse(sourceText);

    let targetDep: any;
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

export default function (options: Options): Rule {
  return chain([
    enablePolyfills(options),
    addDependencies(options),
    logSuccess(options),
    installPackageJsonDependencies(options),
    displayVersionMismatch(options),
  ]);
}
