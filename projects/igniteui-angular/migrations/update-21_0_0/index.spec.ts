import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '21.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-50';

    it('should remove properties related to box-shadows from the outlined-button theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$my-outlined-button-theme: outlined-button-theme(
                $shadow-color: #ffff00,
                $resting-shadow: 5px 5px #ff0000,
                $hover-shadow: 5px 5px #0000ff,
                $focus-shadow: 5px 5px #008000,
                $active-shadow: 5px 5px #ffa500
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$my-outlined-button-theme: outlined-button-theme(
                $shadow-color: #ffff00
            );`
        );
    });

    it('should remove properties related to box-shadows from the flat-button theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$my-flat-button-theme: flat-button-theme(
                $shadow-color: #ffff00,
                $resting-shadow: 5px 5px #ff0000,
                $hover-shadow: 5px 5px #0000ff,
                $focus-shadow: 5px 5px #008000,
                $active-shadow: 5px 5px #ffa500
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$my-flat-button-theme: flat-button-theme(
                $shadow-color: #ffff00
            );`
        );
    });
});