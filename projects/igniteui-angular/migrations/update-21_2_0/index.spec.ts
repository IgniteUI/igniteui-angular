import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '21.2.0';
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

    const migrationName = 'migration-55';

    themes.forEach(theme => {
        it(`should rename the base circle color property of the circular progress for ${theme}`, async () => {
            appTree.create(
                testFilePath,
                `$custom-${theme}: ${theme}($base-circle-color: red);`
            );

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(testFilePath)).toEqual(
                `$custom-${theme}: ${theme}($track-color: red);`
            );
        });
    });
});
