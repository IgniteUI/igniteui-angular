import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 6.0.2', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                styleext: 'scss'
            }
        }
      };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should update theme import', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `// Import the IgniteUI themes library first` +
            `@import "~igniteui-angular/core/styles/themes/index";` +
            `$company-color: #2ab759; // Some green shade I like` +
            `$secondary-color: #f96a88; // Watermelon pink` +
            `$my-color-palette: igx-palette(` +
            `  $primary: $company-color,` +
            `  $secondary: $secondary-color` +
            `);`
        );
        appTree.create(
            '/testSrc/testSrc/styles.scss',
            `@import "~igniteui-angular/core/styles/themes/_index.scss";`
        );
        const tree = schematicRunner.runSchematic('migration-03', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `// Import the IgniteUI themes library first` +
            `@import "~igniteui-angular/lib/core/styles/themes/index";` +
            `$company-color: #2ab759; // Some green shade I like` +
            `$secondary-color: #f96a88; // Watermelon pink` +
            `$my-color-palette: igx-palette(` +
            `  $primary: $company-color,` +
            `  $secondary: $secondary-color` +
            `);`
        );
        expect(tree.readContent('/testSrc/testSrc/styles.scss')).toEqual(
            `@import "~igniteui-angular/lib/core/styles/themes/_index.scss";`
        );
        done();
    });

    it('should update theme import in sass files', done => {
        configJson.projects.testProj['schematics'] = {
            '@schematics/angular:component': {
                styleext: 'sass'
            }
        };
        appTree.overwrite('/angular.json', JSON.stringify(configJson));
        appTree.create(
            '/testSrc/appPrefix/component/test.component.sass',
            `@import "~igniteui-angular/core/styles/themes/index";`
        );
        appTree.create(
            '/testSrc/testSrc/styles.sass',
            `@import "~igniteui-angular/core/styles/themes/_index.scss";`
        );
        const tree = schematicRunner.runSchematic('migration-03', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.sass')).toEqual(
            `@import "~igniteui-angular/lib/core/styles/themes/index";`
        );
        expect(tree.readContent('/testSrc/testSrc/styles.sass')).toEqual(
            `@import "~igniteui-angular/lib/core/styles/themes/_index.scss";`
        );
        done();
    });
});
