import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '19.1.6';
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

    const migrationName = 'migration-45';

    it('should remove the properties related to invalid state from the switch theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$invalid-switch-theme: switch-theme(
                $label-color: orange,
                $label-invalid-color: red,
                $track-error-color: red,
                $thumb-on-error-color: darkred,
                $error-color: red,
                $error-color-hover: darkred,
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$invalid-switch-theme: switch-theme(
                $label-color: orange,
            );`
        );
    });
});
