import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '22.2.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-61';

    it('should remove scrollbar-theme properties that no longer have effect', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$my-scrollbar: scrollbar-theme(
    $sb-size: 16px,
    $sb-thumb-bg-color: blue,
    $sb-thumb-bg-color-hover: navy,
    $sb-thumb-border-radius: 4px,
    $sb-track-bg-color: black,
    $sb-corner-bg: gray
);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$my-scrollbar: scrollbar-theme(
    $sb-thumb-bg-color: blue,
    $sb-track-bg-color: black
);`
        );
    });

    it('should leave the supported scrollbar-theme properties untouched', async () => {
        const content = `$my-scrollbar: scrollbar-theme(
    $sb-thumb-bg-color: blue,
    $sb-track-bg-color: black
);`;
        appTree.create(`/testSrc/appPrefix/component/test.component.scss`, content);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(content);
    });

    it('should not touch same-named properties on other themes', async () => {
        const content = `$my-grid: grid-theme(
    $sb-size: 16px
);`;
        appTree.create(`/testSrc/appPrefix/component/test.component.scss`, content);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(content);
    });
});
