import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '22.2.0';

fdescribe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-59';

    it('should rename focus-outline-color and focus-selected-outline-color in chip-theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$my-chip-theme: chip-theme(
                $focus-outline-color: red,
                $focus-selected-outline-color: blue
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$my-chip-theme: chip-theme(
                $focus-shadow-color: red,
                $focus-selected-shadow-color: blue
            );`
        );
    });
});
