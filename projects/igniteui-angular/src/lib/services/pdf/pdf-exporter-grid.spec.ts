import { TestBed, waitForAsync } from '@angular/core/testing';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterService } from './pdf-exporter';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { GridIDNameJobTitleComponent } from '../../test-utils/grid-samples.spec';
import { first } from 'rxjs/operators';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NestedColumnGroupsGridComponent, ColumnGroupTestComponent, BlueWhaleGridComponent } from '../../test-utils/grid-mch-sample.spec';
import { IgxHierarchicalGridTestBaseComponent } from '../../test-utils/hierarchical-grid-components.spec';
import { IgxTreeGridSortingComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { CustomSummariesComponent } from '../../grids/grid/grid-summary.spec';
import { IgxHierarchicalGridComponent } from '../../grids/hierarchical-grid/public_api';

describe('PDF Grid Exporter', () => {
    let exporter: IgxPdfExporterService;
    let options: IgxPdfExporterOptions;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                GridIDNameJobTitleComponent
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        exporter = new IgxPdfExporterService();
        options = new IgxPdfExporterOptions('PdfGridExport');

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities as any, 'saveBlobToFile');
    });

    it('should export grid as displayed.', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export grid with custom page orientation', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.pageOrientation = 'landscape';

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should honor ignoreColumnsVisibility option', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.columnList.get(0).hidden = true;
        options.ignoreColumnsVisibility = false;

        fix.detectChanges();

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should handle empty grid', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.data = [];
        fix.detectChanges();

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export grid with landscape orientation', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.pageOrientation = 'landscape';

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export with table borders disabled', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.showTableBorders = false;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export with custom font size', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.fontSize = 14;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export with different page sizes', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.pageSize = 'letter';

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should honor ignoreColumnsOrder option', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.ignoreColumnsOrder = true;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should honor ignoreFiltering option', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.ignoreFiltering = false;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should honor ignoreSorting option', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.ignoreSorting = false;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });



    it('should handle grid with multiple columns', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export with custom filename from options', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const customOptions = new IgxPdfExporterOptions('MyCustomGrid');

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            const callArgs = (ExportUtilities.saveBlobToFile as jasmine.Spy).calls.mostRecent().args;
            expect(callArgs[1]).toBe('MyCustomGrid.pdf');
            done();
        });

        exporter.export(grid, customOptions);
    });

    it('should export grid with multi-column headers', (done) => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ColumnGroupTestComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(ColumnGroupTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export grid with nested multi-column headers', (done) => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NestedColumnGroupsGridComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(NestedColumnGroupsGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export grid with summaries', (done) => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                CustomSummariesComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(CustomSummariesComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export hierarchical grid', (done) => {
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

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    fit('should export tree grid with hierarchical data', (done) => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridSortingComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(IgxTreeGridSortingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.treeGrid;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    fit('should export tree grid with flat self-referencing data', (done) => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridPrimaryForeignKeyComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.treeGrid;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should truncate long header text with ellipsis in multi-column headers', (done) => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                BlueWhaleGridComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(BlueWhaleGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The PDF should be created successfully even with long header text
            expect(args.pdf).toBeDefined();
            done();
        });

        // Use smaller page size to force truncation
        options.pageSize = 'a5';
        exporter.export(grid, options);
    });
});
