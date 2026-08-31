import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '21.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-51';
    const filePath = '/testSrc/appPrefix/component/test.component.ts';

    it('should split a root import into granular entry points', async () => {
        appTree.create(
            filePath,
            `import { IgxGridComponent, IgxIconComponent, IgxColumnComponent } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxGridComponent } from 'igniteui-angular/grids/grid';\n` +
                `import { IgxIconComponent } from 'igniteui-angular/icon';\n` +
                `import { IgxColumnComponent } from 'igniteui-angular/grids/core';`
            );
    });

    it('should sort the exports of an entry point alphabetically', async () => {
        appTree.create(
            filePath,
            `import { IgxColumnComponent, IgxCellTemplateDirective, IgxCsvExporterService } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxCellTemplateDirective, IgxColumnComponent, IgxCsvExporterService } from 'igniteui-angular/grids/core';`);
    });

    it('should default unmapped exports to core', async () => {
        appTree.create(
            filePath,
            `import { IgxOverlayService } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxOverlayService } from 'igniteui-angular/core';`);
    });

    it('should preserve aliased imports', async () => {
        appTree.create(
            filePath,
            `import { IgxGridComponent as Grid } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxGridComponent as Grid } from 'igniteui-angular/grids/grid';`);
    });

    it('should migrate imports from the licensed package', async () => {
        appTree.create(
            filePath,
            `import { IgxGridComponent } from '@infragistics/igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxGridComponent } from '@infragistics/igniteui-angular/grids/grid';`);
    });

    it('should NOT modify imports that already use a granular entry point', async () => {
        const content = `import { IgxGridComponent } from 'igniteui-angular/grids/grid';`;
        appTree.create(filePath, content);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(content);
    });

    it('should preserve the type modifier of an import type declaration', async () => {
        appTree.create(
            filePath,
            `import type { CellType, IgxGridComponent } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import type { CellType } from 'igniteui-angular/grids/core';\n` +
                `import type { IgxGridComponent } from 'igniteui-angular/grids/grid';`
            );
    });

    it('should preserve a per-specifier inline type modifier', async () => {
        appTree.create(
            filePath,
            `import { type CellType, IgxColumnComponent } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { type CellType, IgxColumnComponent } from 'igniteui-angular/grids/core';`);
    });

    it('should split inline type specifiers into their own entry points', async () => {
        appTree.create(
            filePath,
            `import { IgxGridComponent, type CellType } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxGridComponent } from 'igniteui-angular/grids/grid';\n` +
                `import { type CellType } from 'igniteui-angular/grids/core';`
            );
    });

    it('should rename Direction to CarouselAnimationDirection and move it to carousel', async () => {
        appTree.create(
            filePath,
            `import { Direction, IgxCarouselComponent } from 'igniteui-angular';\n` +
            `export class TestComponent {\n` +
            `    public animationDirection: Direction;\n` +
            `}`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { CarouselAnimationDirection, IgxCarouselComponent } from 'igniteui-angular/carousel';\n` +
                `export class TestComponent {\n` +
                `    public animationDirection: CarouselAnimationDirection;\n` +
                `}`
            );
    });

    it('should rename a type in an import type declaration', async () => {
        appTree.create(
            filePath,
            `import type { Direction } from 'igniteui-angular';\n` +
            `export class TestComponent {\n` +
            `    public animationDirection: Direction;\n` +
            `}`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import type { CarouselAnimationDirection } from 'igniteui-angular/carousel';\n` +
                `export class TestComponent {\n` +
                `    public animationDirection: CarouselAnimationDirection;\n` +
                `}`
            );
    });

    it('should move the button directives to directives', async () => {
        appTree.create(
            filePath,
            `import { IgxButtonDirective, IgxIconButtonDirective, IgxButtonGroupComponent } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';\n` +
                `import { IgxButtonGroupComponent } from 'igniteui-angular/button-group';`
            );
    });

    it('should rename the misspelled column pattern validator directive', async () => {
        appTree.create(
            filePath,
            `import { IgxColumPatternValidatorDirective } from 'igniteui-angular';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxColumnPatternValidatorDirective } from 'igniteui-angular/grids/core';`);
    });

    it('should migrate a component file, leaving unrelated imports untouched', async () => {
        appTree.create(
            filePath,
            `import { Component, ViewChild } from '@angular/core';\n` +
            `import { IgxGridComponent, IgxColumnComponent, type CellType } from 'igniteui-angular';\n` +
            `import { DATA } from '../../data/localData';\n` +
            `@Component({ selector: 'app-test', template: '' })\n` +
            `export class TestComponent {\n` +
            `    @ViewChild(IgxGridComponent, { static: true })\n` +
            `    public grid: IgxGridComponent;\n` +
            `    public data = DATA;\n` +
            `}`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { Component, ViewChild } from '@angular/core';\n` +
                `import { IgxGridComponent } from 'igniteui-angular/grids/grid';\n` +
                `import { type CellType, IgxColumnComponent } from 'igniteui-angular/grids/core';\n` +
                `import { DATA } from '../../data/localData';\n` +
                `@Component({ selector: 'app-test', template: '' })\n` +
                `export class TestComponent {\n` +
                `    @ViewChild(IgxGridComponent, { static: true })\n` +
                `    public grid: IgxGridComponent;\n` +
                `    public data = DATA;\n` +
                `}`
            );
    });
});
