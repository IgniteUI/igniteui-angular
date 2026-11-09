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

    const migrationName = 'migration-62';

    it('should remove the border width properties from grid-summary-theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$my-summary-theme: grid-summary-theme(
                $background-color: red,
                $border-width: 4px,
                $border-style: dashed,
                $border-color: blue,
                $pinned-border-width: 6px,
                $pinned-border-style: dotted,
                $pinned-border-color: green
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$my-summary-theme: grid-summary-theme(
                $background-color: red,
                $border-style: dashed,
                $border-color: blue,
                $pinned-border-style: dotted,
                $pinned-border-color: green
            );`
        );
    });

    it('should rename the grid-summary border width CSS custom properties and keep the styles', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `igx-grid {
                --ig-grid-summary-border-width: 4px;
                --ig-grid-summary-border-style: dashed;
                --ig-grid-summary-pinned-border-width: 6px;
                --ig-grid-summary-pinned-border-style: dotted;
                --ig-grid-summary-pinned-border-color: green;
            }`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `igx-grid {
                --ig-grid-header-border-width: 4px;
                --ig-grid-summary-border-style: dashed;
                --ig-grid-pinned-border-width: 6px;
                --ig-grid-summary-pinned-border-style: dotted;
                --ig-grid-summary-pinned-border-color: green;
            }`
        );
    });

    it('should rename the CSS custom properties in plain CSS files and keep the --igx- prefix', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.css`;

        appTree.create(
            testFilePath,
            `igx-grid { --igx-grid-summary-pinned-border-width: 6px; }`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `igx-grid { --igx-grid-pinned-border-width: 6px; }`
        );
    });
});
