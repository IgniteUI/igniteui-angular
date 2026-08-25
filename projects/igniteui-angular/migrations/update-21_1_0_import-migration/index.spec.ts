import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '21.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-52';
    const filePath = '/testSrc/appPrefix/component/test.component.ts';

    it('should move IgxGridGroupByAreaComponent from grids/core to grids/grid', async () => {
        appTree.create(
            filePath,
            `import { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/grid';`);
    });

    it('should split the moved export out, keeping the other exports in grids/core', async () => {
        appTree.create(
            filePath,
            `import { IgxColumnComponent, IgxGridGroupByAreaComponent, IgxCellTemplateDirective } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxCellTemplateDirective, IgxColumnComponent } from 'igniteui-angular/grids/core';\n` +
                `import { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/grid';`
            );
    });

    it('should preserve aliased imports', async () => {
        appTree.create(
            filePath,
            `import { IgxGridGroupByAreaComponent as GroupByArea } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxGridGroupByAreaComponent as GroupByArea } from 'igniteui-angular/grids/grid';`);
    });

    it('should migrate imports from the licensed package', async () => {
        appTree.create(
            filePath,
            `import { IgxGridGroupByAreaComponent } from '@infragistics/igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxGridGroupByAreaComponent } from '@infragistics/igniteui-angular/grids/grid';`);
    });

    it('should NOT modify grids/core imports that are not moved', async () => {
        const content = `import { IgxColumnComponent } from 'igniteui-angular/grids/core';`;
        appTree.create(filePath, content);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(content);
    });

    it('should NOT modify IgxGridGroupByAreaComponent when imported from grids/grid', async () => {
        const content = `import { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/grid';`;
        appTree.create(filePath, content);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(content);
    });

    it('should preserve the type modifier of an import type declaration', async () => {
        appTree.create(
            filePath,
            `import type { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import type { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/grid';`);
    });

    it('should preserve the type modifier on both sides of a split import type declaration', async () => {
        appTree.create(
            filePath,
            `import type { IgxColumnComponent, IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import type { IgxColumnComponent } from 'igniteui-angular/grids/core';\n` +
                `import type { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/grid';`
            );
    });

    it('should preserve a per-specifier inline type modifier on the moved export', async () => {
        appTree.create(
            filePath,
            `import { type IgxGridGroupByAreaComponent, IgxColumnComponent } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxColumnComponent } from 'igniteui-angular/grids/core';\n` +
                `import { type IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/grid';`
            );
    });

    it('should preserve a per-specifier inline type modifier on a retained export', async () => {
        appTree.create(
            filePath,
            `import { IgxGridGroupByAreaComponent, type CellType, IgxColumnComponent } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { type CellType, IgxColumnComponent } from 'igniteui-angular/grids/core';\n` +
                `import { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/grid';`
            );
    });

    it('should migrate a component file, leaving unrelated imports untouched', async () => {
        appTree.create(
            filePath,
            `import { Component, ViewChild } from '@angular/core';\n` +
            `import { IgxColumnComponent, IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/core';\n` +
            `import { IgxGridComponent } from 'igniteui-angular/grids/grid';\n` +
            `import { DATA } from '../../data/localData';\n` +
            `@Component({ selector: 'app-test', template: '' })\n` +
            `export class TestComponent {\n` +
            `    @ViewChild(IgxGridGroupByAreaComponent, { static: true })\n` +
            `    public groupByArea: IgxGridGroupByAreaComponent;\n` +
            `    public data = DATA;\n` +
            `}`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { Component, ViewChild } from '@angular/core';\n` +
                `import { IgxColumnComponent } from 'igniteui-angular/grids/core';\n` +
                `import { IgxGridGroupByAreaComponent } from 'igniteui-angular/grids/grid';\n` +
                `import { IgxGridComponent } from 'igniteui-angular/grids/grid';\n` +
                `import { DATA } from '../../data/localData';\n` +
                `@Component({ selector: 'app-test', template: '' })\n` +
                `export class TestComponent {\n` +
                `    @ViewChild(IgxGridGroupByAreaComponent, { static: true })\n` +
                `    public groupByArea: IgxGridGroupByAreaComponent;\n` +
                `    public data = DATA;\n` +
                `}`
            );
    });
});
