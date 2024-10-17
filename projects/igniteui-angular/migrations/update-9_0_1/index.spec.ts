import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 9.0.1', () => {
    let appTree: UnitTestTree;
    const _schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    const migrationName = 'migration-14';

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('Should remove $base-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`$typography: igx-typography(
    $base-color: white,
    $font-family: null,
    $type-scale: null
);
`);
    const tree = await _schematicRunner
        .runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss'))
        .toEqual(
`$typography: igx-typography(
    $font-family: null,
    $type-scale: null
);
`);
    });
});
