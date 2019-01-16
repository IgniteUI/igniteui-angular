import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { getWorkspace } from '@schematics/angular/utility/config';

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
    populatePackageJson();
  });

  function populatePackageJson() {
    const igPkgJson = require('../../package.json');
    const pkgJson = JSON.parse(tree.readContent('/package.json'));
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
    const polyfills = `
// import 'core-js/es6/object';
// import 'core-js/es6/function';
/** a comment */
// import 'core-js/es6/reflect';
// import 'core-js/es6/set';

/** comment */
// import 'web-animations-js';  // Run \`npm install --save web-animations-js\`.
`;
    const result = `
import 'core-js/es6/object';
import 'core-js/es6/function';
/** a comment */
import 'core-js/es6/reflect';
import 'core-js/es6/set';
/** ES7 \`Object.entries\` needed for igxGrid to render in IE. */
import 'core-js/es7/object';

/** comment */
import 'web-animations-js';  // Run \`npm install --save web-animations-js\`.
`;

    tree.create('src/polyfills.ts', polyfills);
    runner.runSchematic('ng-add', { polyfills: true }, tree);
    expect(tree.readContent('src/polyfills.ts').replace(/\r\n/g, '\n')).toEqual(result.replace(/\r\n/g, '\n'));
  });

  it('should properly add web animations', () => {
    runner.runSchematic('ng-add', {}, tree);
    const pkgJsonData = JSON.parse(tree.readContent('/package.json'));
    expect(pkgJsonData.dependencies['web-animations-js']).toBeTruthy();
  });

  it('should properly display the dependency mismatch warning', () => {
    const targetFile = '/package.json';
    const angularCore = '@angular/core';
    const angularCommon = '@angular/common';
    const version = '^6.1.0';

    const pkgJson = JSON.parse(tree.readContent(targetFile));
    pkgJson.dependencies[angularCore] = version;
    pkgJson.dependencies[angularCommon] = version;
    tree.overwrite(targetFile, JSON.stringify(pkgJson));

    spyOn(console, 'warn');
    runner.runSchematic('ng-add', {}, tree);
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching(/WARNING */));
  });
});
