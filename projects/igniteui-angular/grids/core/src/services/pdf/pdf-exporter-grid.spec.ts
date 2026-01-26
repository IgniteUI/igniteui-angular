import { TestBed, waitForAsync } from '@angular/core/testing';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterService } from './pdf-exporter';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { GridIDNameJobTitleComponent } from '../../../../../test-utils/grid-samples.spec';
import { first } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NestedColumnGroupsGridComponent, ColumnGroupTestComponent, BlueWhaleGridComponent } from '../../../../../test-utils/grid-mch-sample.spec';
import { IgxHierarchicalGridExportComponent, IgxHierarchicalGridTestBaseComponent } from '../../../../../test-utils/hierarchical-grid-components.spec';
import { IgxTreeGridSortingComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../../../../test-utils/tree-grid-components.spec';
import { CustomSummariesComponent } from 'igniteui-angular/grids/grid/src/grid-summary.spec';
import { IgxHierarchicalGridComponent } from 'igniteui-angular/grids/hierarchical-grid';
import { IgxPivotGridMultipleRowComponent, IgxPivotGridTestComplexHierarchyComponent } from '../../../../../test-utils/pivot-grid-samples.spec';
import { IgxPivotGridComponent } from 'igniteui-angular/grids/pivot-grid';
import { PivotRowLayoutType } from 'igniteui-angular/grids/core';
import { UIInteractions, wait } from 'igniteui-angular/test-utils/ui-interactions.spec';

import { describe, it, expect, beforeEach, vi } from 'vitest';
describe('PDF Grid Exporter', () => {
    let exporter: IgxPdfExporterService;
    let options: IgxPdfExporterOptions;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                GridIDNameJobTitleComponent,
                IgxPivotGridMultipleRowComponent,
                IgxPivotGridTestComplexHierarchyComponent
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        exporter = new IgxPdfExporterService();
        options = new IgxPdfExporterOptions('PdfGridExport');

        // Spy the saveBlobToFile method so the files are not really created
        vi.spyOn(ExportUtilities as any, 'saveBlobToFile');
    });

    it('should export grid as displayed.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export grid with custom page orientation', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.pageOrientation = 'landscape';

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should honor ignoreColumnsVisibility option', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.columnList.get(0).hidden = true;
        options.ignoreColumnsVisibility = false;

        fix.detectChanges();

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should handle empty grid', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.data = [];
        fix.detectChanges();

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export grid with landscape orientation', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.pageOrientation = 'landscape';

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export with table borders disabled', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.showTableBorders = false;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export with custom font size', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.fontSize = 14;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export with different page sizes', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.pageSize = 'letter';

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should honor ignoreColumnsOrder option', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.ignoreColumnsOrder = true;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should honor ignoreFiltering option', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.ignoreFiltering = false;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should honor ignoreSorting option', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.ignoreSorting = false;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });



    it('should handle grid with multiple columns', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export with custom filename from options', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const customOptions = new IgxPdfExporterOptions('MyCustomGrid');

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, customOptions);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            const callArgs = (ExportUtilities.saveBlobToFile as any).mock.lastCall;
            expect(callArgs[1]).toBe('MyCustomGrid.pdf');
        });

    it('should export grid with multi-column headers', async () => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ColumnGroupTestComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(ColumnGroupTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export grid with nested multi-column headers', async () => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NestedColumnGroupsGridComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(NestedColumnGroupsGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export grid with summaries', async () => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                CustomSummariesComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(CustomSummariesComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export hierarchical grid', async () => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxHierarchicalGridTestBaseComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.hgrid;
        grid.expandChildren = true;
        grid.getChildGrids().forEach((childGrid: IgxHierarchicalGridComponent) => {
            childGrid.expandChildren = true;
        });
        fix.detectChanges();

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export the correct number of child data rows from a hierarchical grid', async () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridExportComponent);
        fix.detectChanges();

        const hGrid = fix.componentInstance.hGrid;
        hGrid.data = hGrid.data.slice(0, 1); // Limit data for test performance

        // Expand first few rows to realize all inner levels, same as in Excel tests
        const firstRow = hGrid.gridAPI.get_row_by_index(0) as any;

        UIInteractions.simulateClickAndSelectEvent(firstRow.expander);
        fix.detectChanges();

        let childGrids = hGrid.gridAPI.getChildGrids(false) as any[];
        const firstChildGrid = childGrids[0];
        const firstChildRow = firstChildGrid.gridAPI.get_row_by_index(0) as any;
        const secondChildRow = firstChildGrid.gridAPI.get_row_by_index(1) as any;
        UIInteractions.simulateClickAndSelectEvent(secondChildRow.expander);
        fix.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(firstChildRow.expander);
        fix.detectChanges();

        childGrids = hGrid.gridAPI.getChildGrids(false) as any[];
        const thirdChildGrid = childGrids[1];
        const thirdChildRow = thirdChildGrid.gridAPI.get_row_by_index(0) as any;
        UIInteractions.simulateClickAndSelectEvent(thirdChildRow.expander);
        fix.detectChanges();

        // Calculate expected number of data rows to be exported
        const allGrids = [hGrid, ...(hGrid.gridAPI.getChildGrids(true) as any[])];
        const expectedRows = allGrids.reduce((acc, g) => acc + g.data.length, 0);

        // Spy PDF row drawing to count exported rows
        const drawDataRowSpy = vi.spyOn(exporter as any, 'drawDataRow');

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(hGrid, options);
        await exportPromise;
        expect(drawDataRowSpy.mock.calls.length).toBe(expectedRows);
        });

    it('should export tree grid with hierarchical data', async () => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridSortingComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(IgxTreeGridSortingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.treeGrid;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should export tree grid with flat self-referencing data', async () => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridPrimaryForeignKeyComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.treeGrid;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

    it('should truncate long header text with ellipsis in multi-column headers', async () => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                BlueWhaleGridComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(BlueWhaleGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        const exportPromise = firstValueFrom(exporter.exportEnded);

        // Use smaller page size to force truncation
        options.pageSize = 'a5';
        exporter.export(grid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The PDF should be created successfully even with long header text
            expect(args.pdf).toBeDefined();
        });

    describe('Pivot Grid PDF Export', () => {
        let pivotGrid: IgxPivotGridComponent;
        let fix;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxPivotGridMultipleRowComponent);
            fix.detectChanges();
            await wait();

            pivotGrid = fix.componentInstance.pivotGrid;
        });

        it('should export basic pivot grid', async () => {
            const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(pivotGrid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid with row headers', async () => {
            pivotGrid.pivotUI.showRowHeaders = true;

            const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(pivotGrid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid with horizontal row layout', async () => {
            pivotGrid.pivotUI.showRowHeaders = true;
            pivotGrid.pivotUI.rowLayout = PivotRowLayoutType.Horizontal;
            pivotGrid.pivotConfiguration.rows = [{
                memberName: 'ProductCategory',
                memberFunction: (data) => data.ProductCategory,
                enabled: true,
                childLevel: {
                    memberName: 'Country',
                    enabled: true,
                    childLevel: {
                        memberName: 'Date',
                        enabled: true
                    }
                }
            }];
            fix.detectChanges();

            const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(pivotGrid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid with custom page size', async () => {
            options.pageSize = 'letter';

            const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(pivotGrid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid with landscape orientation', async () => {
            options.pageOrientation = 'landscape';

            const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(pivotGrid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid without table borders', async () => {
            options.showTableBorders = false;

            const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(pivotGrid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid with custom font size', async () => {
            options.fontSize = 14;

            const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(pivotGrid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export hierarchical pivot grid', async () => {
            fix = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
            fix.detectChanges();
            fix.whenStable().then(() => {
                pivotGrid = fix.componentInstance.pivotGrid;

                const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.export(pivotGrid, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });
        });
    });
});


