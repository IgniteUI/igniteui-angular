import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 6.1.0', () => {
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

    it('should update igxToggle events and selectors', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-tab-bar attr igxForRemote="true"></igx-tab-bar>` +
            `<elem igxToggle (onOpen)="handler" (onClose)="handler"></elem>`
        );
        const tree = schematicRunner.runSchematic('migration-04', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
                `<igx-bottom-nav attr></igx-bottom-nav>` +
                `<elem igxToggle (onOpened)="handler" (onClosed)="handler"></elem>`);
        done();
    });
});
