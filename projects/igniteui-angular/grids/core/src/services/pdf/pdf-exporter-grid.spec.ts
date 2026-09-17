import { TestBed, waitForAsync } from '@angular/core/testing';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterService } from './pdf-exporter';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { GridIDNameJobTitleComponent, GridWithThreeLevelsOfMultiColumnHeadersAndTwoRowsExportComponent, MultiColumnHeadersExportComponent } from '../../../../../test-utils/grid-samples.spec';
import { first } from 'rxjs/operators';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NestedColumnGroupsGridComponent, ColumnGroupTestComponent, BlueWhaleGridComponent } from '../../../../../test-utils/grid-mch-sample.spec';
import { IgxHierarchicalGridExportComponent, IgxHierarchicalGridTestBaseComponent } from '../../../../../test-utils/hierarchical-grid-components.spec';
import { IgxTreeGridSortingComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../../../../test-utils/tree-grid-components.spec';
import { CustomSummariesComponent } from 'igniteui-angular/grids/grid/src/grid-summary.spec';
import { IgxHierarchicalGridComponent } from 'igniteui-angular/grids/hierarchical-grid';
import { IgxPivotGridMultipleRowComponent, IgxPivotGridTestComplexHierarchyComponent } from '../../../../../test-utils/pivot-grid-samples.spec';
import { IgxPivotGridComponent } from 'igniteui-angular/grids/pivot-grid';
import { PivotRowLayoutType } from 'igniteui-angular/grids/core';
import { IgxStringFilteringOperand, SortingDirection } from 'igniteui-angular/core';
import { UIInteractions, wait } from 'igniteui-angular/test-utils/ui-interactions.spec';
import {
    PAGE_SIZES, getDrawnRectangles, getHeaderCellOf, getPageCount, getPageDimensions,
    getRenderedCells, getRenderedRows, getRenderedRowsByPage, getRenderedText
} from './pdf-exporter-utils.spec';

/** `GridIDNameJobTitleComponent` as the exporter lays it out, in the order the grid shows it. */
const GRID_ROWS = [
    ['ID', 'Name', 'JobTitle'],
    ['1', 'Casey Houston', 'Vice President'],
    ['2', 'Gilberto Todd', 'Director'],
    ['3', 'Tanya Bennett', 'Director'],
    ['4', 'Jack Simon', 'Software Developer'],
    ['5', 'Celia Martinez', 'Senior Software Developer'],
    ['6', 'Erma Walsh', 'CEO'],
    ['7', 'Debra Morton', 'Associate Software Developer'],
    ['8', 'Erika Wells', 'Software Development Team Lead'],
    ['9', 'Leslie Hansen', 'Associate Software Developer'],
    ['10', 'Eduardo Ramirez', 'Manager']
];

describe('PDF Grid Exporter', () => {
    let exporter: IgxPdfExporterService;
    let options: IgxPdfExporterOptions;
    let originalTimeout: number;

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

        // PDF export of hierarchical/large grids can exceed Jasmine's default 5s timeout under CI
        // load. Give it room so the export completes within the test — a timed-out export otherwise
        // leaks its (first()) exportEnded subscription into the next test, where the saveBlobToFile
        // spy no longer exists ("Expected a spy, but got Function").
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities as any, 'saveBlobToFile');
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('should export grid as displayed.', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Every column and every record of the grid, in the order the grid shows them.
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
            expect(getPageCount(args.pdf)).toBe(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export grid with custom page orientation', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        // Portrait is the one that is not the default, so it is the one worth asking for here.
        options.pageOrientation = 'portrait';

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.a4Portrait);
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
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

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The hidden ID column is left out of the header and out of every row.
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS.map(([, ...rest]) => rest));
            done();
        });

        exporter.export(grid, options);
    });

    it('should export a hidden column when told to ignore column visibility', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.columnList.get(0).hidden = true;
        options.ignoreColumnsVisibility = true;

        fix.detectChanges();

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The column is hidden in the grid but asked for in the export, so it comes back.
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
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

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The columns still head the table, there is simply nothing underneath them.
            expect(getRenderedRows(args.pdf)).toEqual([GRID_ROWS[0]]);
            expect(getPageCount(args.pdf)).toBe(1);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export grid with landscape orientation', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.pageOrientation = 'landscape';

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.a4Landscape);
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export with table borders disabled', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.showTableBorders = false;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Not a rectangle in the document, but the table itself is untouched.
            expect(getDrawnRectangles(args.pdf)).toEqual([]);
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export with custom font size', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.fontSize = 14;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(new Set(getRenderedCells(args.pdf).map(cell => cell.fontSize))).toEqual(new Set([14]));
            done();
        });

        exporter.export(grid, options);
    });

    it('should export with different page sizes', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.pageSize = 'letter';

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Landscape is the default, so the letter page comes out the other way round.
            expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.letterLandscape);
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
            done();
        });

        exporter.export(grid, options);
    });

    it('should honor ignoreColumnsOrder option', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        // Pin Name, which moves it to the front of the grid and so of the export.
        grid.columnList.get(1).pinned = true;
        fix.detectChanges();

        options.ignoreColumnsOrder = true;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Ignoring the order puts the columns back the way they were declared.
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export a pinned column first when not ignoring the column order', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.columnList.get(1).pinned = true;
        fix.detectChanges();

        options.ignoreColumnsOrder = false;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Name leads, the way the grid shows it once it is pinned.
            expect(getRenderedRows(args.pdf))
                .toEqual(GRID_ROWS.map(([id, name, jobTitle]) => [name, id, jobTitle]));
            done();
        });

        exporter.export(grid, options);
    });

    it('should honor ignoreFiltering option', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        // Filter the grid down to the two directors, so that there is a filter to honour.
        grid.filter('JobTitle', 'Director', IgxStringFilteringOperand.instance().condition('equals'));
        fix.detectChanges();

        options.ignoreFiltering = false;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Only the rows the grid is showing reach the document.
            expect(getRenderedRows(args.pdf)).toEqual([
                GRID_ROWS[0],
                ['2', 'Gilberto Todd', 'Director'],
                ['3', 'Tanya Bennett', 'Director']
            ]);
            done();
        });

        exporter.export(grid, options);
    });

    it('should export every record when told to ignore filtering', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.filter('JobTitle', 'Director', IgxStringFilteringOperand.instance().condition('equals'));
        fix.detectChanges();

        options.ignoreFiltering = true;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The filter is set aside and the whole grid is exported.
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
            done();
        });

        exporter.export(grid, options);
    });

    it('should honor ignoreSorting option', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        // Sort by name, so that there is a sort order to honour.
        grid.sort({ fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true });
        fix.detectChanges();

        options.ignoreSorting = false;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The records come out in the order the grid is showing them.
            const [header, ...records] = getRenderedRows(args.pdf);
            expect(header).toEqual(GRID_ROWS[0]);
            expect(records.map(row => row[1]))
                .toEqual(GRID_ROWS.slice(1).map(row => row[1]).sort((a, b) => a.localeCompare(b)));
            done();
        });

        exporter.export(grid, options);
    });

    it('should export the records unsorted when told to ignore sorting', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.sort({ fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true });
        fix.detectChanges();

        options.ignoreSorting = true;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The sort is set aside and the records keep their original order.
            expect(getRenderedRows(args.pdf)).toEqual(GRID_ROWS);
            done();
        });

        exporter.export(grid, options);
    });



    it('should handle grid with multiple columns', (done) => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            const cells = getDrawnRectangles(args.pdf).filter(rectangle => !rectangle.filled);
            // One cell per column of the header row and of each of the ten records, all the same
            // width, tiling the page in three columns from a single left margin.
            expect(cells.length).toBe(3 * GRID_ROWS.length);
            expect(new Set(cells.map(cell => cell.width)).size).toBe(1);
            expect(new Set(cells.map(cell => cell.x)).size).toBe(3);
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
            // The exporter hands over the document itself, as a PDF blob.
            expect(callArgs[0] instanceof Blob).toBeTrue();
            expect(callArgs[0].type).toBe('application/pdf');
            expect(callArgs[0].size).toBeGreaterThan(0);
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

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            const pages = getRenderedRowsByPage(args.pdf);
            // Three levels of headers, repeated at the top of every page, with the groups above
            // the leaf columns they span.
            for (const page of pages) {
                expect(page[0]).toEqual(['General Information', 'Address Information']);
                expect(page[1]).toEqual(['ID', 'Person Details', 'Location', 'Contact Information']);
                expect(page[3]).toEqual([
                    'ContactNa...', 'ContactTitle', 'Country', 'Region', 'City', 'Address', 'Phone',
                    'Fax', 'PostalCode'
                ]);
            }
            expect(pages.length).toBeGreaterThan(1);
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

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            const pages = getRenderedRowsByPage(args.pdf);
            // A group inside a group inside a group, each level above the next.
            for (const page of pages) {
                expect(page[0]).toEqual(['Master']);
                expect(page[1]).toEqual(['Slave 1', 'Slave 2']);
                expect(page[2]).toEqual(['Address', 'Phone', 'Fax', 'City']);
            }
            // The first record of the grid, under those headers.
            expect(pages[0][3]).toEqual(['Obere Str. 57', '030-0074321', '030-0076545', 'Berlin']);
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

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            const rows = getRenderedRows(args.pdf);
            expect(rows[0]).toEqual(['Product ID', 'ProductName', 'InStock', 'UnitsInStock', 'OrderDate']);
            expect(rows[1]).toEqual(['1', 'Chai', 'true', '2760', '3/21/2005']);
            // The summaries follow the records, one row per summary level, each cell holding the
            // label and the value the grid computed.
            expect(rows.slice(11)).toEqual([
                ['Count: 10', 'Count: 10', 'Count: 10', 'Earliest: Thu May 17 1990 00:...'],
                ['Sum: 39004', 'Items InStock: 1337'],
                ['Avg: 3900.4']
            ]);
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

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            const rows = getRenderedRows(args.pdf);
            // Every island introduces itself with its own header rows before its records, and the
            // root grid's own header opens the document.
            expect(rows[0]).toEqual(['Information']);
            expect(rows[1]).toEqual(['ID']);
            expect(rows[2]).toEqual(['ChildLevels', 'ProductName']);
            expect(rows[3]).toEqual(['0', '3', 'Product: A0']);

            // Expanding everything gives 40 root records, each with 20 children and each of those
            // with 20 of its own, so the export runs well past a single page.
            expect(getPageCount(args.pdf)).toBeGreaterThan(1);
            expect(rows.filter(row => row[0] === 'Information').length)
                .toBe(rows.filter(row => row[0] === 'ChildLevels').length);

            // The islands are indented one step further in than the records above them.
            const cells = getRenderedCells(args.pdf);
            const xOf = (text: string) => cells.find(cell => cell.text === text)!.x;
            expect(xOf('0')).toBeLessThan(xOf('00'));
            done();
        });

        exporter.export(grid, options);
    });

    it('should export the correct number of child data rows from a hierarchical grid', (done) => {
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
        const drawDataRowSpy = spyOn<any>(exporter as any, 'drawDataRow').and.callThrough();

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(drawDataRowSpy.calls.count()).toBe(expectedRows);
            done();
        });

        exporter.export(hGrid, options);
    });

    it('should export hierarchical grid with expanded rows when using primaryKey', (done) => {
        const fix = TestBed.createComponent(IgxHierarchicalGridExportComponent);
        fix.detectChanges();

        const hGrid = fix.componentInstance.hGrid;

        // Set primary key on the grid
        hGrid.primaryKey = 'Artist';
        fix.detectChanges();

        // Limit data for test performance
        hGrid.data = hGrid.data.slice(0, 1);
        fix.detectChanges();

        const firstRowData = hGrid.data[0];

        hGrid.toggleRow(firstRowData['Artist']);
        fix.detectChanges();

        expect(hGrid.expansionStates.get(firstRowData['Artist'])).toBe(true);

        const childGrids = hGrid.gridAPI.getChildGrids(false) as any[];
        expect(childGrids.length).toBeGreaterThan(0);

        const firstChildGrid = childGrids[0];
        expect(firstChildGrid.data.length).toBeGreaterThan(0);

        // Spy on drawDataRow to count exported rows
        const drawDataRowSpy = spyOn<any>(exporter as any, 'drawDataRow').and.callThrough();

        exporter.exportEnded.pipe(first()).subscribe(() => {
            const minExpectedRows = 1 + firstChildGrid.data.length;
            expect(drawDataRowSpy.calls.count()).toBeGreaterThanOrEqual(minExpectedRows,
                'Child rows should be exported when parent is expanded via toggleRow with primaryKey');
            done();
        });

        exporter.export(hGrid, options);
    });

    it('should export tree grid with hierarchical data', (done) => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridSortingComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(IgxTreeGridSortingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.treeGrid;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            expect(getRenderedRows(args.pdf)).toEqual([
                ['ID', 'Name', 'HireDate', 'Age'],
                ['147', 'John Winchester', '4/20/2008', '55'],
                ['475', 'Michael Langdon', '7/3/2011', '30'],
                ['957', 'Thomas Hardy', '7/19/2009', '29'],
                ['317', 'Monica Reyes', '9/18/2014', '31'],
                ['711', 'Roland Mendel', '10/17/2015', '35'],
                ['998', 'Sven Ottlieb', '11/11/2009', '44'],
                ['299', 'Peter Lewis', '4/18/2018', '25'],
                ['19', 'Yang Wang', '2/1/2010', '61'],
                ['847', 'Ana Sanders', '2/22/2014', '42'],
                ['663', 'Elizabeth Richards', '12/9/2017', '25']
            ]);

            // The nesting shows as an indent on the first cell. 147 has 475, 957 and 317 under
            // it, and 317 in turn has 711, so each level starts further to the right than the one
            // above it while siblings line up with each other.
            const cells = getRenderedCells(args.pdf);
            const xOf = (text: string) => cells.find(cell => cell.text === text)!.x;
            expect(xOf('147')).toBeLessThan(xOf('475'));
            expect(xOf('475')).toBeLessThan(xOf('711'));
            expect(xOf('957')).toBe(xOf('475'));
            expect(xOf('19')).toBe(xOf('147'));
            done();
        });

        exporter.export(grid, options);
    });

    it('should export tree grid with flat self-referencing data', (done) => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridPrimaryForeignKeyComponent
            ]
        }).compileComponents();

        const fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.treeGrid;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            // Self-referencing data is nested by ParentID, and comes out in the same shape a
            // tree grid over hierarchical data does.
            expect(getRenderedRows(args.pdf)).toEqual([
                ['ID', 'ParentID', 'Name', 'JobTitle', 'Age'],
                ['1', '-1', 'Casey Houston', 'Vice President', '32'],
                ['2', '1', 'Gilberto Todd', 'Director', '41'],
                ['3', '2', 'Tanya Bennett', 'Director', '29'],
                ['7', '2', 'Debra Morton', 'Associate Software Developer', '35'],
                ['4', '1', 'Jack Simon', 'Software Developer', '33'],
                ['6', '-1', 'Erma Walsh', 'CEO', '52'],
                ['10', '-1', 'Eduardo Ramirez', 'Manager', '53'],
                ['9', '10', 'Leslie Hansen', 'Associate Software Developer', '44']
            ]);

            // The nesting shows as an indent on the first cell of each row.
            const cells = getRenderedCells(args.pdf);
            const xOf = (text: string) => cells.find(cell => cell.text === text)!.x;
            expect(xOf('1')).toBeLessThan(xOf('2'));
            expect(xOf('2')).toBeLessThan(xOf('3'));
            expect(xOf('6')).toBe(xOf('1'));
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

            const pages = getRenderedRowsByPage(args.pdf);
            const columnWidth = getDrawnRectangles(args.pdf).find(rectangle => !rectangle.filled)!.width;

            expect(pages.length).toBeGreaterThan(1);
            for (const [topLevel, secondLevel, ...body] of pages) {
                // The two group captions are short enough to survive, and are repeated on every
                // page; the groups beside them are not.
                expect(topLevel).toEqual(['100 IDs', '2 col groups with 50 IDs each', '...', '...']);
                expect(secondLevel).toEqual(['50 IDs', '50 IDs', '...', '...', '...', '...']);

                // A hundred columns on an A5 page leaves so little room that every leaf header
                // and every value below them is cut back to the ellipsis alone.
                expect(body.length).toBeGreaterThan(0);
                for (const row of body) {
                    expect(new Set(row)).toEqual(new Set(['...']));
                }
            }
            expect(args.pdf!.getTextWidth('...')).toBeLessThanOrEqual(columnWidth - 10);
            done();
        });

        // Use smaller page size to force truncation
        options.pageSize = 'a5';
        exporter.export(grid, options);
    });


    describe('Multi column header layout', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    NestedColumnGroupsGridComponent,
                    ColumnGroupTestComponent
                ]
            }).compileComponents();
        }));

        it('should draw each column group exactly over the columns it spans', (done) => {
            const fix = TestBed.createComponent(NestedColumnGroupsGridComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // Master over Slave 1 and Slave 2, each of those over two leaf columns.
                const master = getHeaderCellOf(args.pdf, 'Master');
                const firstSlave = getHeaderCellOf(args.pdf, 'Slave 1');
                const secondSlave = getHeaderCellOf(args.pdf, 'Slave 2');
                const leaves = ['Address', 'Phone', 'Fax', 'City'].map(field => getHeaderCellOf(args.pdf, field));

                // The leaves tile the table: same width, each starting where the last one ended.
                expect(new Set(leaves.map(leaf => leaf.width)).size).toBe(1);
                leaves.slice(1).forEach((leaf, index) => {
                    expect(leaf.x).toBeCloseTo(leaves[index].x + leaves[index].width, 6);
                });

                // Each slave starts at its first leaf and ends at its second.
                expect(firstSlave.x).toBeCloseTo(leaves[0].x, 6);
                expect(firstSlave.x + firstSlave.width).toBeCloseTo(leaves[1].x + leaves[1].width, 6);
                expect(secondSlave.x).toBeCloseTo(leaves[2].x, 6);
                expect(secondSlave.x + secondSlave.width).toBeCloseTo(leaves[3].x + leaves[3].width, 6);

                // And master covers both slaves, which is the whole table.
                expect(master.x).toBeCloseTo(firstSlave.x, 6);
                expect(master.width).toBeCloseTo(firstSlave.width + secondSlave.width, 6);

                // Each level sits directly below the one above it, none of them overlapping.
                expect(firstSlave.y).toBeCloseTo(master.y + master.height, 6);
                expect(leaves[0].y).toBeCloseTo(firstSlave.y + firstSlave.height, 6);

                // And the header block sits over the records rather than beside them: the first
                // record's cells line up with the leaf headers, column for column. Without this
                // the checks above would all hold with the whole header block shifted sideways.
                const drawn = getDrawnRectangles(args.pdf).filter(rectangle => rectangle.page === 1);
                const headerBottom = Math.max(...drawn.filter(r => r.filled).map(r => r.y + r.height));
                const below = drawn
                    .filter(rectangle => !rectangle.filled && rectangle.y >= headerBottom - 0.01)
                    .sort((a, b) => (a.y - b.y) || (a.x - b.x));
                const firstRecord = below.filter(rectangle => rectangle.y === below[0].y);

                expect(firstRecord.length).toBe(leaves.length);
                firstRecord.forEach((cell, index) => {
                    expect(cell.x).toBeCloseTo(leaves[index].x, 6);
                    expect(cell.width).toBeCloseTo(leaves[index].width, 6);
                });
                done();
            });

            exporter.export(grid, options);
        });

        it('should draw a group over its columns when the levels are uneven', (done) => {
            const fix = TestBed.createComponent(ColumnGroupTestComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // This grid nests unevenly. `ID` stands on its own beside the groups, and
                // `General Information` holds a plain column, `CompanyName`, next to a group of
                // its own, so its children do not all sit on the same level.
                const id = getHeaderCellOf(args.pdf, 'ID');
                const general = getHeaderCellOf(args.pdf, 'General Information');
                const personDetails = getHeaderCellOf(args.pdf, 'Person Details');
                const addressInfo = getHeaderCellOf(args.pdf, 'Address Information');
                const companyName = getHeaderCellOf(args.pdf, 'Company...');
                const leafWidth = getHeaderCellOf(args.pdf, 'Country').width;

                // Each top level header picks up exactly where the previous one stopped, and
                // covers one column per leaf beneath it - one, three and seven of them.
                expect(general.x).toBeCloseTo(id.x + id.width, 6);
                expect(addressInfo.x).toBeCloseTo(general.x + general.width, 6);
                expect(id.width).toBeCloseTo(leafWidth, 6);
                expect(general.width).toBeCloseTo(leafWidth * 3, 6);
                expect(addressInfo.width).toBeCloseTo(leafWidth * 7, 6);

                // The nested group ends where its parent does, sitting to the right of the plain
                // column it shares that parent with.
                expect(personDetails.x).toBeCloseTo(companyName.x + companyName.width, 6);
                expect(personDetails.x + personDetails.width)
                    .toBeCloseTo(general.x + general.width, 6);

                // A column with no group under it is drawn tall enough to reach the bottom of the
                // header block instead of leaving a gap: `ID` spans all three levels and
                // `CompanyName`, one level further down, spans the two below it.
                expect(id.height).toBeGreaterThan(companyName.height);
                expect(companyName.height).toBeGreaterThan(personDetails.height);
                done();
            });

            exporter.export(grid, options);
        });

        it('should flatten the groups when told to ignore multi column headers', (done) => {
            const fix = TestBed.createComponent(NestedColumnGroupsGridComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            options.ignoreMultiColumnHeaders = true;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const pages = getRenderedRowsByPage(args.pdf);
                // Only the leaf columns are left to head the table - neither Master nor either
                // Slave reaches the document - and the records are untouched.
                for (const page of pages) {
                    expect(page[0]).toEqual(['Address', 'Phone', 'Fax', 'City']);
                }
                expect(getRenderedText(args.pdf)).not.toContain('Master');
                expect(getRenderedText(args.pdf)).not.toContain('Slave 1');
                expect(pages[0][1]).toEqual(['Obere Str. 57', '030-0074321', '030-0076545', 'Berlin']);
                done();
            });

            exporter.export(grid, options);
        });

        it('should narrow a group when one of its columns is hidden', (done) => {
            const fix = TestBed.createComponent(NestedColumnGroupsGridComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            // Hide Phone, which is the second of Slave 1's two columns.
            grid.columnList.find(column => column.field === 'Phone').hidden = true;
            options.ignoreColumnsVisibility = false;
            fix.detectChanges();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const pages = getRenderedRowsByPage(args.pdf);
                expect(pages[0][0]).toEqual(['Master']);
                expect(pages[0][1]).toEqual(['Slave 1', 'Slave 2']);
                expect(pages[0][2]).toEqual(['Address', 'Fax', 'City']);

                // Slave 1 is down to a single column while Slave 2 still has two, and the two of
                // them still meet without a gap and still fill the table between them.
                const master = getHeaderCellOf(args.pdf, 'Master');
                const firstSlave = getHeaderCellOf(args.pdf, 'Slave 1');
                const secondSlave = getHeaderCellOf(args.pdf, 'Slave 2');
                const leaves = ['Address', 'Fax', 'City'].map(field => getHeaderCellOf(args.pdf, field));

                expect(firstSlave.width).toBeCloseTo(leaves[0].width, 6);
                expect(secondSlave.width).toBeCloseTo(leaves[0].width * 2, 6);
                expect(secondSlave.x).toBeCloseTo(firstSlave.x + firstSlave.width, 6);
                expect(master.width).toBeCloseTo(firstSlave.width + secondSlave.width, 6);
                done();
            });

            exporter.export(grid, options);
        });

        it('should export the groups of an empty grid', (done) => {
            const fix = TestBed.createComponent(NestedColumnGroupsGridComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            grid.data = [];
            fix.detectChanges();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // All three header levels are drawn even with nothing to put under them.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Master'],
                    ['Slave 1', 'Slave 2'],
                    ['Address', 'Phone', 'Fax', 'City']
                ]);
                expect(getPageCount(args.pdf)).toBe(1);
                done();
            });

            exporter.export(grid, options);
        });
    });


    describe('Multi column header variations', () => {
        let fix;
        let grid;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    MultiColumnHeadersExportComponent,
                    GridWithThreeLevelsOfMultiColumnHeadersAndTwoRowsExportComponent
                ]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(MultiColumnHeadersExportComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('should export the groups as the grid has them collapsed and expanded', (done) => {
            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // The grid shows `General Information` expanded and `Location` collapsed, and the
                // export follows it: `CompanyName` is marked visible only when its group is
                // collapsed, so it stays out, while `Country` is hidden yet marked visible when
                // collapsed, so it comes in. `Region`, `City` and `Address` are hidden without
                // that marking and stay out.
                expect(getRenderedRowsByPage(args.pdf)[0].slice(0, 4)).toEqual([
                    ['General Information', 'Address Information'],
                    ['ID', 'Personal Details', 'Location', 'Contact Information'],
                    ['ContactName', 'ContactTitle', 'Country', 'Phone', 'Fax', 'PostalCode'],
                    ['ALFKI', 'Maria Anders', 'Sales Representative', 'Germany', '030-0074321', '030-0076545', '12209']
                ]);
                done();
            });

            exporter.export(grid, options);
        });

        it('should follow a group that the grid has collapsed', (done) => {
            grid.columnList.find(column => column.header === 'General Information').expanded = false;
            fix.detectChanges();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // Collapsing the group swaps what is under it: `Personal Details` is marked as
                // not visible when collapsed and goes, taking its two columns with it, while
                // `CompanyName` is marked as visible when collapsed and takes their place. It
                // heads no group of its own, so it is drawn tall and lands on its own baseline
                // between the two header rows.
                expect(getRenderedRowsByPage(args.pdf)[0].slice(0, 4)).toEqual([
                    ['General Information', 'Address Information'],
                    ['ID', 'Location', 'Contact Information'],
                    ['CompanyName'],
                    ['Country', 'Phone', 'Fax', 'PostalCode']
                ]);
                expect(getRenderedText(args.pdf)).not.toContain('Personal Details');
                expect(getRenderedText(args.pdf)).not.toContain('ContactName');
                done();
            });

            exporter.export(grid, options);
        });

        it('should export a pinned column group ahead of the rest', (done) => {
            grid.columnList.find(column => column.header === 'Address Information').pinned = true;
            fix.detectChanges();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // The pinned group leads, with its own sub groups and columns intact, and the
                // records are reordered to match.
                expect(getRenderedRowsByPage(args.pdf)[0].slice(0, 4)).toEqual([
                    ['Address Information', 'General Information'],
                    ['Location', 'Contact Information', 'ID', 'Personal Details'],
                    ['Country', 'Phone', 'Fax', 'PostalCode', 'ContactName', 'ContactTitle'],
                    ['Germany', '030-0074321', '030-0076545', '12209', 'ALFKI', 'Maria Anders', 'Sales Representative']
                ]);
                done();
            });

            exporter.export(grid, options);
        });

        it('should export a moved column in the place the grid moved it to', (done) => {
            grid.columnList.get(0).move(2);
            fix.detectChanges();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // Moving `ID` puts it inside `General Information`, after `Personal Details`,
                // and the export places both the header and the values there.
                expect(getRenderedRowsByPage(args.pdf)[0].slice(0, 4)).toEqual([
                    ['General Information', 'Address Information'],
                    ['Personal Details', 'ID', 'Location', 'Contact Information'],
                    ['ContactName', 'ContactTitle', 'Country', 'Phone', 'Fax', 'PostalCode'],
                    ['Maria Anders', 'Sales Representative', 'ALFKI', 'Germany', '030-0074321', '030-0076545', '12209']
                ]);
                done();
            });

            exporter.export(grid, options);
        });

        it('should leave out a column group turned away during columnExporting', (done) => {
            exporter.columnExporting.subscribe((args) => {
                if (args.header === 'Address Information') {
                    args.cancel = true;
                }
            });

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // Turning away a group takes everything under it with it - both of its sub groups
                // and all four of their columns - and what is left closes up behind it.
                expect(getRenderedRowsByPage(args.pdf)[0].slice(0, 4)).toEqual([
                    ['General Information'],
                    ['ID', 'Personal Details'],
                    ['ContactName', 'ContactTitle'],
                    ['ALFKI', 'Maria Anders', 'Sales Representative']
                ]);
                expect(getRenderedText(args.pdf)).not.toContain('Address Information');
                expect(getRenderedText(args.pdf)).not.toContain('Phone');
                done();
            });

            exporter.export(grid, options);
        });

        it('should export three levels of groups over only two records', (done) => {
            const twoRows = TestBed.createComponent(GridWithThreeLevelsOfMultiColumnHeadersAndTwoRowsExportComponent);
            twoRows.detectChanges();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // All three header levels are drawn over the two records, on one page.
                expect(getRenderedRowsByPage(args.pdf)[0]).toEqual([
                    ['General Information', 'Address Information'],
                    ['ID', 'Personal Details', 'Location', 'Contact Information'],
                    ['ContactName', 'ContactTitle', 'Country', 'Phone', 'Fax', 'PostalCode'],
                    ['ALFKI', 'Maria Anders', 'Sales Representative', 'Germany', '030-0074321', '030-0076545', '12209'],
                    ['ANATR', 'Ana Trujillo', 'Owner', 'Mexico', '(5) 555-4729', '(5) 555-3745', '05021']
                ]);
                expect(getPageCount(args.pdf)).toBe(1);
                done();
            });

            exporter.export(twoRows.componentInstance.grid, options);
        });

        it('should draw the headers even when alwaysExportHeaders is turned off', (done) => {
            grid.data = [];
            options.alwaysExportHeaders = false;
            fix.detectChanges();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                // The PDF exporter does not read `alwaysExportHeaders` at all - only the CSV and
                // Excel exporters do - so an empty grid still comes out with its full header
                // block. This pins that rather than endorsing it.
                expect(getRenderedRowsByPage(args.pdf)[0]).toEqual([
                    ['General Information', 'Address Information'],
                    ['ID', 'Personal Details', 'Location', 'Contact Information'],
                    ['ContactName', 'ContactTitle', 'Country', 'Phone', 'Fax', 'PostalCode']
                ]);
                done();
            });

            exporter.export(grid, options);
        });
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

        /** The seven sellers the sample pivots on, which head the table. */
        const SELLER_COLUMNS = ['Stanley', 'Elisa', 'Lydia', 'David', 'John', 'Larry', 'Walter'];

        it('should export basic pivot grid', (done) => {
            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const rows = getRenderedRows(args.pdf);
                // The sellers head the table, each over its own pair of aggregations, and the
                // seven records follow.
                expect(rows[0]).toEqual(SELLER_COLUMNS);
                expect(rows[1].length).toBe(SELLER_COLUMNS.length * 2);
                expect(rows.slice(2).length).toBe(7);
                done();
            });

            exporter.export(pivotGrid, options);
        });

        it('should export pivot grid with row headers', (done) => {
            pivotGrid.pivotUI.showRowHeaders = true;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const rows = getRenderedRows(args.pdf);
                // Showing the row headers adds a row of dimension names between the sellers and
                // their aggregations - the three row dimensions the sample pivots by.
                expect(rows[0]).toEqual(SELLER_COLUMNS);
                expect(rows[1].length).toBe(3);
                expect(rows[2].length).toBe(SELLER_COLUMNS.length * 2);
                done();
            });

            exporter.export(pivotGrid, options);
        });

        it('should export pivot grid with horizontal row layout', (done) => {
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

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const rows = getRenderedRows(args.pdf);
                // The row layout is a display choice: the export lays the dimensions out the same
                // way either way round, so this comes out like the row headers case above.
                expect(rows[0]).toEqual(SELLER_COLUMNS);
                expect(rows[1].length).toBe(3);
                expect(rows.slice(3).length).toBe(7);
                done();
            });

            exporter.export(pivotGrid, options);
        });

        it('should export pivot grid with custom page size', (done) => {
            options.pageSize = 'letter';

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.letterLandscape);
                expect(getRenderedRows(args.pdf)[0]).toEqual(SELLER_COLUMNS);
                done();
            });

            exporter.export(pivotGrid, options);
        });

        it('should export pivot grid with landscape orientation', (done) => {
            options.pageOrientation = 'landscape';

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.a4Landscape);
                expect(getRenderedRows(args.pdf)[0]).toEqual(SELLER_COLUMNS);
                done();
            });

            exporter.export(pivotGrid, options);
        });

        it('should export pivot grid without table borders', (done) => {
            options.showTableBorders = false;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // Not even the shaded backgrounds a pivot header would otherwise get.
                expect(getDrawnRectangles(args.pdf)).toEqual([]);
                expect(getRenderedRows(args.pdf)[0]).toEqual(SELLER_COLUMNS);
                done();
            });

            exporter.export(pivotGrid, options);
        });

        it('should export pivot grid with custom font size', (done) => {
            options.fontSize = 14;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(new Set(getRenderedCells(args.pdf).map(cell => cell.fontSize))).toEqual(new Set([14]));
                expect(getRenderedRows(args.pdf)[0]).toEqual(SELLER_COLUMNS);
                done();
            });

            exporter.export(pivotGrid, options);
        });

        it('should export hierarchical pivot grid', (done) => {
            fix = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
            fix.detectChanges();
            fix.whenStable().then(() => {
                pivotGrid = fix.componentInstance.pivotGrid;

                exporter.exportEnded.pipe(first()).subscribe((args) => {
                    expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                    const rows = getRenderedRows(args.pdf);
                    // The countries head the table, each over the two aggregations of the sample.
                    expect(rows[0]).toEqual(['Bulgaria', 'US', 'Uruguay', 'UK', 'Japan']);
                    expect(rows[1]).toEqual(rows[0].flatMap(() => ['UnitsSold', 'Amount ...']));

                    // Two row dimensions, city over product, and each record carries its own pair
                    // of them: the totals across all cities first, then each city with the
                    // products it sold. Every value comes from the record itself, so a grid with
                    // more records than row header columns still labels each row correctly.
                    expect(rows.slice(2).map(row => row.slice(0, 2))).toEqual([
                        ['All Cities', 'AllProducts'],
                        ['All Cities', 'Clothing'],
                        ['All Cities', 'Bikes'],
                        ['All Cities', 'Accessori...'],
                        ['All Cities', 'Compone...'],
                        ['Plovdiv', 'AllProducts'],
                        ['Plovdiv', 'Clothing'],
                        ['New York', 'AllProducts'],
                        ['New York', 'Clothing'],
                        ['Ciudad d...', 'AllProducts'],
                        ['Ciudad d...', 'Bikes'],
                        ['Ciudad d...', 'Clothing'],
                        ['London', 'AllProducts'],
                        ['London', 'Accessori...'],
                        ['Yokohama', 'AllProducts'],
                        ['Yokohama', 'Compone...'],
                        ['Sofia', 'AllProducts'],
                        ['Sofia', 'Compone...']
                    ]);
                    done();
                });

                exporter.export(pivotGrid, options);
            });
        });
    });
});
