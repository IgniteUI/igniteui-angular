import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '22.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-59';
    const filePath = '/testSrc/appPrefix/component/test.component.ts';

    it('should move a single IgxSummaryOperand import from grids/core to core', async () => {
        appTree.create(
            filePath,
            `import { IgxSummaryOperand } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxSummaryOperand } from 'igniteui-angular/core';`);
    });

    it('should move all summary operand imports from grids/core to core', async () => {
        appTree.create(
            filePath,
            `import { IgxSummaryOperand, IgxNumberSummaryOperand, IgxDateSummaryOperand, IgxTimeSummaryOperand } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand, IgxTimeSummaryOperand } from 'igniteui-angular/core';`);
    });

    it('should split mixed imports, keeping non-operand exports in grids/core', async () => {
        appTree.create(
            filePath,
            `import { IgxGridComponent, IgxNumberSummaryOperand } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxGridComponent } from 'igniteui-angular/grids/core';\n` +
                `import { IgxNumberSummaryOperand } from 'igniteui-angular/core';`
            );
    });

    it('should preserve aliased operand imports', async () => {
        appTree.create(
            filePath,
            `import { IgxSummaryOperand as SummaryOperand } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxSummaryOperand as SummaryOperand } from 'igniteui-angular/core';`);
    });

    it('should migrate imports from the licensed package', async () => {
        appTree.create(
            filePath,
            `import { IgxTimeSummaryOperand } from '@infragistics/igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IgxTimeSummaryOperand } from '@infragistics/igniteui-angular/core';`);
    });

    it('should NOT modify operand imports that already come from core', async () => {
        const content = `import { IgxSummaryOperand } from 'igniteui-angular/core';`;
        appTree.create(filePath, content);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(content);
    });

    it('should NOT modify grids/core imports that are not moved operands', async () => {
        const content = `import { IgxGridComponent } from 'igniteui-angular/grids/core';`;
        appTree.create(filePath, content);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(content);
    });

    it('should move selection and transaction types from grids/core to core', async () => {
        appTree.create(
            filePath,
            `import { GridSelectionRange, ISelectionNode, IMultiRowLayoutNode, ISelectionKeyboardState, ISelectionPointerState, IColumnSelectionState, SelectionState, IgxGridTransaction } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { GridSelectionRange, IColumnSelectionState, IMultiRowLayoutNode, ISelectionKeyboardState, ISelectionNode, ISelectionPointerState, IgxGridTransaction, SelectionState } from 'igniteui-angular/core';`);
    });

    it('should split a mixed grids/core import, keeping non-moved exports in place', async () => {
        appTree.create(
            filePath,
            `import { IgxGridComponent, SelectionState, IgxSummaryOperand } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxGridComponent } from 'igniteui-angular/grids/core';\n` +
                `import { IgxSummaryOperand, SelectionState } from 'igniteui-angular/core';`
            );
    });

    it('should move IGroupingDoneEventArgs from grids/grid to grids/core', async () => {
        appTree.create(
            filePath,
            `import { IGroupingDoneEventArgs } from 'igniteui-angular/grids/grid';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import { IGroupingDoneEventArgs } from 'igniteui-angular/grids/core';`);
    });

    it('should move IGroupingDoneEventArgs from grids/grid to grids/core as type import', async () => {
        appTree.create(
            filePath,
            `import type { IGroupingDoneEventArgs } from 'igniteui-angular/grids/grid';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import type { IGroupingDoneEventArgs } from 'igniteui-angular/grids/core';`);
    });

    it('should preserve the type modifier when moving summary operands from grids/core to core', async () => {
        appTree.create(
            filePath,
            `import type { IgxSummaryOperand } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(`import type { IgxSummaryOperand } from 'igniteui-angular/core';`);
    });

    it('should preserve a per-specifier inline type modifier when moving an export', async () => {
        appTree.create(
            filePath,
            `import { type IGroupingDoneEventArgs, IgxGridComponent } from 'igniteui-angular/grids/grid';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxGridComponent } from 'igniteui-angular/grids/grid';\n` +
                `import { type IGroupingDoneEventArgs } from 'igniteui-angular/grids/core';`
            );
    });

    it('should migrate multiple separate import declarations in the same file', async () => {
        appTree.create(
            filePath,
            `import { IgxSummaryOperand } from 'igniteui-angular/grids/core';\n` +
            `import { IGroupingDoneEventArgs } from 'igniteui-angular/grids/grid';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxSummaryOperand } from 'igniteui-angular/core';\n` +
                `import { IGroupingDoneEventArgs } from 'igniteui-angular/grids/core';`
            );
    });

    it('should migrate multiple import type declarations in the same file', async () => {
        appTree.create(
            filePath,
            `import type { IMultiRowLayoutNode, ISelectionNode } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import type { IMultiRowLayoutNode, ISelectionNode } from 'igniteui-angular/core';`
            );
    });

    it('should merge migrated import declarations', async () => {
        appTree.create(
            filePath,
            `import { IgxSummaryResult } from 'igniteui-angular/core';\n` +
            `import { IgxNumberSummaryOperand, IgxSummaryOperand } from 'igniteui-angular/grids/core';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from 'igniteui-angular/core';`
            );
    });

    it('should split IGroupingDoneEventArgs out of grids/grid, keeping other exports', async () => {
        appTree.create(
            filePath,
            `import { IgxGridComponent, IGroupingDoneEventArgs } from 'igniteui-angular/grids/grid';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { IgxGridComponent } from 'igniteui-angular/grids/grid';\n` +
                `import { IGroupingDoneEventArgs } from 'igniteui-angular/grids/core';`
            );
    });

    it('should NOT move IGroupingDoneEventArgs when imported from grids/core', async () => {
        const content = `import { IGroupingDoneEventArgs } from 'igniteui-angular/grids/core';`;
        appTree.create(filePath, content);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(content);
    });

    it('should merge into an existing core import while leaving unrelated imports untouched', async () => {
        appTree.create(
            filePath,
            `import { Component, OnInit, ViewChild } from '@angular/core';\n` +
            `import { IgxHierarchicalGridComponent, IgxRowIslandComponent } from 'igniteui-angular/grids/hierarchical-grid';\n` +
            `import { IgxCellTemplateDirective, IgxColumnComponent, IgxNumberSummaryOperand, IgxSummaryOperand } from 'igniteui-angular/grids/core';\n` +
            `import { IgxSummaryResult } from 'igniteui-angular/core';\n` +
            `import { SINGERS } from '../../data/singersData';\n` +
            `import { IgxPreventDocumentScrollDirective } from '../../directives/prevent-scroll.directive';`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath))
            .toEqual(
                `import { Component, OnInit, ViewChild } from '@angular/core';\n` +
                `import { IgxHierarchicalGridComponent, IgxRowIslandComponent } from 'igniteui-angular/grids/hierarchical-grid';\n` +
                `import { IgxCellTemplateDirective, IgxColumnComponent } from 'igniteui-angular/grids/core';\n` +
                `import { IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from 'igniteui-angular/core';\n` +
                `import { SINGERS } from '../../data/singersData';\n` +
                `import { IgxPreventDocumentScrollDirective } from '../../directives/prevent-scroll.directive';`
            );
    });
});
