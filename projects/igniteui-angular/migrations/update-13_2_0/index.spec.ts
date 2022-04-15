import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '13.2.0';

describe(`Update to ${version}`, () => {
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

    const migrationName = 'migration-24';

    it('should rename remove the $direction prop from the core mixin', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@include igniteui.core($direction: 'rtl');`
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@include igniteui.core();`
        );
    });
});
