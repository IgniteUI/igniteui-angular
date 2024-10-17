import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '13.2.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-24';

    it('should remove the $direction prop from the core mixin', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@include igniteui.core($direction: 'rtl');`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@include igniteui.core();`
        );
    });
});
