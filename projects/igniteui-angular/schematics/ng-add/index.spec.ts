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
    dependencies: null,
    devDependencies: null
  };

  beforeEach(() => {
    tree = new UnitTestTree(new EmptyTree());
    tree.create('/angular.json', JSON.stringify(ngJsonConfig));
    tree.create('/package.json', JSON.stringify(pkgJsonConfig));
  });

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
    expect(pkgJsonData.dependencies).toBeTruthy();

    const dependenciesFound = Object.keys(pkgJsonData.dependencies)
      .filter(pkg =>
        pkg.includes('igniteui-angular') ||
        pkg.includes('web-animations-js') ||
        pkg.includes('jszip') ||
        pkg.includes('hammerjs'));

    expect(dependenciesFound.length).toBeGreaterThan(0);
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
    expect(pkgJsonData.dependencies).toBeTruthy();

    expect(Object.keys(pkgJsonData.dependencies).filter(k => k.includes('hammerjs')).length).toBeGreaterThan(0);
  });

  it('should add the CLI only to devDependencies', () => {
    runner.runSchematic('ng-add', {}, tree);

    const pkgJsonData = JSON.parse(tree.readContent('/package.json'));
    expect(pkgJsonData.dependencies).toBeTruthy();
    expect(pkgJsonData.devDependencies).toBeTruthy();

    expect(Object.keys(pkgJsonData.devDependencies).filter(k => k.includes('igniteui-cli')).length).toBeGreaterThan(0);
    expect(Object.keys(pkgJsonData.dependencies).filter(k => k.includes('igniteui-cli')).length).toBe(0);
  });
});
