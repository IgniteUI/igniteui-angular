import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { getWorkspace } from '@schematics/angular/utility/config';

const polyfills =
  `
// import 'core-js/es6/symbol';
// import 'core-js/es6/object';
// import 'core-js/es6/function';
// import 'core-js/es6/parse-int';
// import 'core-js/es6/parse-float';
// import 'core-js/es6/number';
// import 'core-js/es6/math';
// import 'core-js/es6/string';
// import 'core-js/es6/date';
// import 'core-js/es6/array';
// import 'core-js/es6/regexp';
// import 'core-js/es6/map';
// import 'core-js/es6/weak-map';
// import 'core-js/es6/set';
// import 'core-js/es6/reflect';
// import 'core-js/es7/object';
// import 'web-animations-js';  // Run \`npm install --save web-animations-js\`.
`;

describe('ng-add schematics', () => {
  const collectionPath = path.join(__dirname, '../collection.json');
  const runner: SchematicTestRunner = new SchematicTestRunner('cli-schematics', collectionPath);
  let tree: UnitTestTree;
  const ngJsonConfig = {
    defaultProject: 'testProj',
    projects: {
      testProj: {
        architect: {
          serve: {}
        }
      }
    }
  };

  const pkgJsonConfig = {
    dependencies: {},
    devDependencies: {}
  };

  beforeEach(() => {
    tree = new UnitTestTree(new EmptyTree());
    tree.create('/angular.json', JSON.stringify(ngJsonConfig));
    tree.create('/package.json', JSON.stringify(pkgJsonConfig));
    tree.create('src/polyfills.ts', polyfills);
    populatePackageJson();
  });

  function populatePackageJson() {
    const igPkgJson = require('../../package.json');
    const pkgJson = JSON.parse(tree.read('/package.json').toString());
    const angularCommon = '@angular/common';
    const angularCore = '@angular/core';

    pkgJson.dependencies[angularCommon] = igPkgJson.peerDependencies[angularCommon];
    pkgJson.dependencies[angularCore] = igPkgJson.peerDependencies[angularCore];

    tree.overwrite('/package.json', JSON.stringify(pkgJson));
  }

  it('should create the needed files correctly', () => {
    expect(tree).toBeTruthy();
    expect(tree.exists('/angular.json')).toBeTruthy();
    expect(tree.exists('/package.json')).toBeTruthy();
    expect(JSON.parse(tree.readContent('/angular.json')).projects['testProj'].architect).toBeTruthy();

    const pkgJsonData = JSON.parse(tree.readContent('/package.json'));
    expect(Object.keys(pkgJsonData).length).toBeGreaterThan(0);
  });

  it('should add packages to package.json dependencies', () => {
    runner.runSchematic('ng-add', {}, tree);
    const pkgJsonData = JSON.parse(tree.readContent('/package.json'));
    expect(pkgJsonData.dependencies).toBeTruthy();
    expect(pkgJsonData.devDependencies).toBeTruthy();
  });

  it('should add the correct igniteui-angular packages to package.json dependencies', () => {
    runner.runSchematic('ng-add', {}, tree);
    const pkgJsonData = JSON.parse(tree.readContent('/package.json'));
    expect(pkgJsonData.dependencies['jszip']).toBeTruthy();
    expect(pkgJsonData.dependencies['hammerjs']).toBeTruthy();
  });

  it('should add hammer.js to the workspace', () => {
    runner.runSchematic('ng-add', {}, tree);
    const workspace = getWorkspace(tree) as any;
    const currentProjectName = workspace.defaultProject;
    expect(
      workspace.projects[currentProjectName].architect.test.options.scripts.filter(d => d.includes('hammerjs')).length
    )
      .toBeGreaterThan(0);
    expect(
      workspace.projects[currentProjectName].architect.build.options.scripts.filter(d => d.includes('hammerjs')).length
    )
      .toBeGreaterThan(0);
  });

  it('should add hammer.js to package.json dependencies', () => {
    runner.runSchematic('ng-add', {}, tree);
    const pkgJsonData = JSON.parse(tree.readContent('/package.json'));
    expect(pkgJsonData.dependencies['hammerjs']).toBeTruthy();
  });

  it('should add the CLI only to devDependencies', () => {
    runner.runSchematic('ng-add', {}, tree);
    const pkgJsonData = JSON.parse(tree.readContent('/package.json'));

    expect(pkgJsonData.devDependencies['igniteui-cli']).toBeTruthy();
    expect(pkgJsonData.dependencies['igniteui-cli']).toBeFalsy();
  });

  it('should properly add polyfills', () => {
    expect(tree.readContent('src/polyfills.ts')).toBe(polyfills);
    runner.runSchematic('ng-add', { polyfills: true }, tree);
    const polyfillsData = tree.readContent('src/polyfills.ts');
    expect(polyfillsData).not.toBe(polyfills);
    expect(polyfillsData.match(/[/] /g).length).toBe(3);
  });

  it('should properly add web animations', () => {
    runner.runSchematic('ng-add', {}, tree);
    const pkgJsonData = JSON.parse(tree.readContent('/package.json'));
    expect(pkgJsonData.dependencies['web-animations-js']).toBeTruthy();
  });
});
