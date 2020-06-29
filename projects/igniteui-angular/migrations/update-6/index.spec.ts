import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 6.0.0', () => {
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

    // tslint:disable:arrow-parens
    it('should update igx-tab-bar selector', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            '<igx-tab-bar> <content> </igx-tab-bar>'
        );

        const tree = await schematicRunner.runSchematicAsync('migration-01', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual('<igx-bottom-nav> <content> </igx-bottom-nav>');
    });

    it('should remove igxForRemote directive', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<tag attr igxForRemote="true" attr2><tag attr [igxForRemote]="true">`
        );

        const tree = await schematicRunner.runSchematicAsync('migration-01', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                .toEqual('<tag attr attr2><tag attr>');
    });
});
