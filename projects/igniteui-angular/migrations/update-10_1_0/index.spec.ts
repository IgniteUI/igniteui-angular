import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 10.1.0', () => {
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
                prefix: 'appPrefix'
            }
        }
      };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should replace onDataPreLoad with onScroll ', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/tree-grid.component.html`,
            '<igx-tree-grid (onDataPreLoad)="handleEvent($event)"></igx-tree-grid>'
        );

        const tree = await schematicRunner.runSchematicAsync('migration-16', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/tree-grid.component.html'))
            .toEqual('<igx-tree-grid (onScroll)="handleEvent($event)"></igx-tree-grid>');

    });
});
