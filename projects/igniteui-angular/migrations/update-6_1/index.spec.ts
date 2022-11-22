import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 6.1.0', () => {
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

    it('should update igxToggle events and selectors', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-tab-bar attr igxForRemote="true"></igx-tab-bar>` +
            `<elem igxToggle (onOpen)="handler" (onClose)="handler"></elem>`
        );
        const tree = await schematicRunner.runSchematicAsync('migration-04', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
                `<igx-bottom-nav attr></igx-bottom-nav>` +
                `<elem igxToggle (onOpened)="handler" (onClosed)="handler"></elem>`);
    });
});
