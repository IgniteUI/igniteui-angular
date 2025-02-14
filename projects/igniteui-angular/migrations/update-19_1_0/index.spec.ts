import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '19.1.0';
const themes = [
    'badge-theme', 'bottom-nav-theme', 'button-theme', 'card-theme', 'carousel-theme',
    'chip-theme', 'column-actions-theme', 'dialog-theme', 'drop-down-theme', 'grid-toolbar-theme',
    'grid-theme', 'icon-button-theme', 'input-group-theme', 'navbar-theme', 'navdrawer-theme',
    'query-builder-theme', 'snackbar-theme', 'splitter-theme', 'time-picker-theme'
];
const testFilePath = '/testSrc/appPrefix/component/${theme}.component.scss';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-42';

    themes.forEach(theme => {
        it('should remove the $elevations property from all component themes', async () => {
            appTree.create(
                testFilePath,
                `$custom-${theme}: ${theme}($elevations: $my-elevations);`
            );

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(testFilePath)).toEqual(
                `$custom-${theme}: ${theme}();`
            );
        });
    });

    it('should remove the $palette property from the color-classes mixin', async () => {
            const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

            appTree.create(
                testFilePath,
                `@include color-classes(
                    $palette: $some-palette,
                    $prop: 'color',
                    $prefix: 'bg'
                );`
            );

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(testFilePath)).toEqual(
                `@include color-classes(
                    $prop: 'color',
                    $prefix: 'bg'
                );`
            );
    });

    it('should replace Query Builder deprecated property `fields` with `entities`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-query-builder [fields]="[{ field: 'ID', dataType: 'number' }, { field: 'Name', dataType: 'string' }]"></igx-query-builder>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-query-builder [entities]="[{ name: '', fields: [{ field: 'ID', dataType: 'number' }, { field: 'Name', dataType: 'string' }]}]"></igx-query-builder>
        `
        );
    });

    it('should remove Query Builder Header deprecated property `showLegend`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-query-builder-header [showLegend]="false"></igx-query-builder-header>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-query-builder-header></igx-query-builder-header>
        `
        );
    });
});
