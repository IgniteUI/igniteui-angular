import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '22.0.0';

const SELECT_POSITION_NOTE =
    `<!-- IgxSelect: default positioning changed to AutoPositionStrategy (below/above input).\n` +
    `     To preserve overlap behavior: this.select.overlaySettings = { positionStrategy: new IgxSelectOverlapPositionStrategy(this.select) }; -->\n`;

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-57';

    it('should add type="line" to igx-input-group without explicit type', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-input-group><input igxInput></igx-input-group>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-input-group type="line"><input igxInput></igx-input-group>`);
    });

    it('should add type="line" and a positioning note to igx-select without explicit type', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-select><igx-select-item>Option</igx-select-item></igx-select>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`${SELECT_POSITION_NOTE}<igx-select type="line"><igx-select-item>Option</igx-select-item></igx-select>`);
    });

    it('should add a positioning note to igx-select that already has an explicit type', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-select type="border"><igx-select-item>Option</igx-select-item></igx-select>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`${SELECT_POSITION_NOTE}<igx-select type="border"><igx-select-item>Option</igx-select-item></igx-select>`);
    });

    it('should add type="line" to igx-date-picker without explicit type', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-date-picker></igx-date-picker>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-date-picker type="line"></igx-date-picker>`);
    });

    it('should add type="line" to igx-date-range-picker without explicit type', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-date-range-picker></igx-date-range-picker>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-date-range-picker type="line"></igx-date-range-picker>`);
    });

    it('should add type="line" to igx-time-picker without explicit type', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-time-picker></igx-time-picker>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-time-picker type="line"></igx-time-picker>`);
    });

    it('should NOT modify igx-input-group that already has type attribute', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-input-group type="box"><input igxInput></igx-input-group>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-input-group type="box"><input igxInput></igx-input-group>`);
    });

    it('should NOT modify igx-input-group that already has [type] binding', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-input-group [type]="myType"><input igxInput></igx-input-group>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-input-group [type]="myType"><input igxInput></igx-input-group>`);
    });

    it('should handle multiple components in the same template', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-input-group><input igxInput></igx-input-group>
<igx-select></igx-select>
<igx-input-group type="border"><input igxInput></igx-input-group>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-input-group type="line"><input igxInput></igx-input-group>
${SELECT_POSITION_NOTE}<igx-select type="line"></igx-select>
<igx-input-group type="border"><input igxInput></igx-input-group>`);
    });
});
