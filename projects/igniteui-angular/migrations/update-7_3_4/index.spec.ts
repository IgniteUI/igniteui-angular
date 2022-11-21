import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 7.3.4', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                root: '/',
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

    it('should update time picker events', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-time-picker (onOpen)="handler" (onClose)="handler"></igx-time-picker>`
        );
        const tree = await schematicRunner.runSchematicAsync('migration-09', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
                `<igx-time-picker (onOpened)="handler" (onClosed)="handler"></igx-time-picker>`);
    });

    it('should update date picker events', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-date-picker (onOpen)="handler" (onClose)="handler"></igx-date-picker>`
        );
        const tree = await schematicRunner.runSchematicAsync('migration-09', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
                `<igx-date-picker (onOpened)="handler" (onClosed)="handler"></igx-date-picker>`);
    });
});
