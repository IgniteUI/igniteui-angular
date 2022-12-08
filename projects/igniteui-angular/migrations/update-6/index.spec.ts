import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 6.0.0', () => {
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

    /* eslint-disable arrow-parens */
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
