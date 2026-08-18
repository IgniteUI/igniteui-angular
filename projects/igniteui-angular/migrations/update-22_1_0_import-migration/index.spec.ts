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
});
