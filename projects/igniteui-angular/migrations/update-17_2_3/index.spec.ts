import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '17.2.3';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-37';

    it('should rename the $idle-item-color property to the $label-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-bottom-nav: bottom-nav-theme($idle-item-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-bottom-nav: bottom-nav-theme($label-color: red);`
        );
    });

    it('should rename the $selected-item-color property to the $label-selected-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-bottom-nav: bottom-nav-theme($selected-item-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-bottom-nav: bottom-nav-theme($label-selected-color: red);`
        );
    });
});
