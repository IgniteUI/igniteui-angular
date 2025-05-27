import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '20.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-46';

    it('should remove the $focus-background-color property from the grid summary theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$my-grid-theme: grid-summary-theme(
                $label-color: white,
                $focus-background-color: orange,
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$my-grid-theme: grid-summary-theme(
                $label-color: white,
            );`
        );
    });

    it('should remove the $interim-bottom-line-color property from the input-group theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$my-input-group-theme: input-group-theme(
                $box-background: #ccc,
                $interim-bottom-line-color: orange,
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$my-input-group-theme: input-group-theme(
                $box-background: #ccc,
            );`
        );
    });
});
