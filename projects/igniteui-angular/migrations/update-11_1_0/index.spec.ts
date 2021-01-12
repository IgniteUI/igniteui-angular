import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update to 11.1.0', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc',
            },
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix',
            },
        },
    };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should update fontSet to family', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/icon.component.html`,
            '<igx-icon fontSet="material">settings</igx-icon>'
        );

        const tree = await runner.runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/icon.component.html'))
            .toEqual('<igx-icon family="material">settings</igx-icon>');

    });

    it('should update isActive to active', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/icon.component.html`,
            '<igx-icon [isActive]="false">settings</igx-icon>'
        );

        const tree = await runner.runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/icon.component.html'))
            .toEqual('<igx-icon [active]="false">settings</igx-icon>');

    });
});
