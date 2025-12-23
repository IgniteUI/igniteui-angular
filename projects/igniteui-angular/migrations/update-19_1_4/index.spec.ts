import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '19.1.4';
const themes = [
    'circular-theme'
];
const testFilePath = '/testSrc/appPrefix/component/${theme}.component.scss';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-44';

    it('should remove the summaries related properties from the grid theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$my-grid-theme: grid-theme(
                $header-background: orange,
                $root-summaries-background: orange,
                $root-summaries-text-color: black,
                $body-summaries-background: orange,
                $body-summaries-text-color: black,
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$my-grid-theme: grid-theme(
                $header-background: orange,
            );`
        );
    });
});
