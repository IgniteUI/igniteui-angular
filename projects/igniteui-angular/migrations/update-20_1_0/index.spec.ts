import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '20.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-49';

    it('should remove properties related to the advanced filtering from the grid theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(testFilePath, `$my-input-group-theme: grid-theme(
                $filtering-row-background: #ccc,
                $filtering-background-and: red,
                $filtering-background-and--focus: blue,
                $filtering-background-or: yellow,
                $filtering-background-or--focus: green
            );`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(`$my-input-group-theme: grid-theme(
                $filtering-row-background: #ccc
            );`);
    });
});



