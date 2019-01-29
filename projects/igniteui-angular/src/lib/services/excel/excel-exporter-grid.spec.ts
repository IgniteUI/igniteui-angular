import { async, TestBed } from '@angular/core/testing';
import { IgxGridModule } from '../../grids/grid';
import { IgxGridComponent } from '../../grids/grid/grid.component';
import { IColumnExportingEventArgs, IRowExportingEventArgs } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { TestMethods } from '../exporter-common/test-methods.spec';
import { IgxExcelExporterService } from './excel-exporter';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { JSZipWrapper } from './jszip-verification-wrapper.spec';
import { FileContentData } from './test-data.service.spec';
import { ReorderedColumnsComponent, GridIDNameJobTitleComponent, ProductsComponent } from '../../test-utils/grid-samples.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { IgxTreeGridModule, IgxTreeGridComponent } from '../../grids/tree-grid';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { wait } from '../../test-utils/ui-interactions.spec';

describe('Excel Exporter', () => {
    configureTestSuite();
    let exporter: IgxExcelExporterService;
    let actualData: FileContentData;
    let options: IgxExcelExporterOptions;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ReorderedColumnsComponent,
                GridIDNameJobTitleComponent,
                IgxTreeGridPrimaryForeignKeyComponent,
                ProductsComponent
            ],
            imports: [IgxGridModule.forRoot(), IgxTreeGridModule]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        exporter = new IgxExcelExporterService();
        actualData = new FileContentData();

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities as any, 'saveBlobToFile');
    }));

    afterEach(async(() => {
        exporter.onColumnExport.unsubscribe();
        exporter.onRowExport.unsubscribe();
    }));

    describe('', () => {
        beforeEach(async(() => {
            options = createExportOptions('GridExcelExport', 50);
        }));

        it('should export grid as displayed.', async () => {
            const currentGrid: IgxGridComponent = null;
            TestMethods.testRawData(currentGrid, async (grid) => {
                await exportAndVerify(grid, options, actualData.simpleGridData);
            });
        });

        it('should honor \'ignoreFiltering\' option.', async () => {
            const result = TestMethods.createGridAndFilter();
            const fix = result.fixture;
            const grid = result.grid;
            expect(grid.rowList.length).toEqual(1);

            options.ignoreFiltering = false;
            fix.detectChanges();

            let wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridDataRecord5, 'One row only should have been exported!');

            options.ignoreFiltering = true;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All 10 rows should have been exported!');
        });

        it('should honor filter criteria changes.', async () => {
            const result = TestMethods.createGridAndFilter();
            const fix = result.fixture;
            const grid = result.grid;
            expect(grid.rowList.length).toEqual(1);
            options.ignoreFiltering = false;

            let wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridDataRecord5, 'One row should have been exported!');

            grid.filter('JobTitle', 'Director', IgxStringFilteringOperand.instance().condition('equals'), true);
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(2, 'Invalid number of rows after filtering!');
            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridDataDirectors, 'Two rows should have been exported!');
        });

        it('should honor \'ignoreColumnsVisibility\' option.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            grid.columns[0].hidden = true;
            options.ignoreColumnsOrder = true;
            options.ignoreColumnsVisibility = false;
            fix.detectChanges();

            expect(grid.visibleColumns.length).toEqual(2, 'Invalid number of visible columns!');
            let wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle, 'Two columns should have been exported!');

            options.ignoreColumnsVisibility = true;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All three columns should have been exported!');
        });

        it('should honor columns visibility changes.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            options.ignoreColumnsOrder = true;
            options.ignoreColumnsVisibility = false;

            expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
            let wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All columns should have been exported!');

            grid.columns[0].hidden = true;
            fix.detectChanges();

            expect(grid.visibleColumns.length).toEqual(2, 'Invalid number of visible columns!');
            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle, 'Two columns should have been exported!');

            grid.columns[0].hidden = false;
            fix.detectChanges();

            expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All columns should have been exported!');

            grid.columns[0].hidden = undefined;
            fix.detectChanges();

            expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All columns should have been exported!');
        });

        it('should honor columns declaration order.', async () => {
            const fix = TestBed.createComponent(ReorderedColumnsComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;

            const wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitleID);
        });

        it('should honor \'ignorePinning\' option.', async () => {
            const result = TestMethods.createGridAndPinColumn([1]);
            const fix = result.fixture;
            const grid = result.grid;

            options.ignorePinning = false;
            fix.detectChanges();

            let wrapper = await getExportedData(grid, options);
            wrapper.verifyStructure();
            // wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.gridNameFrozen, 'One frozen column should have been exported!');

            options.ignorePinning = true;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.gridNameIDJobTitle, 'No frozen columns should have been exported!');
        });

        it('should honor pinned state changes.', async () => {
            const result = TestMethods.createGridAndPinColumn([1]);
            const fix = result.fixture;
            const grid = result.grid;

            let wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.gridNameFrozen, 'One frozen column should have been exported!');

            grid.columns[1].pinned = false;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridData, 'No frozen columns should have been exported!');
        });

        it('should honor applied sorting.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            grid.sort({fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            const wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridSortByName);

            // XXX : ???? What's the point of this?
            // grid.clearSort();
            // fix.detectChanges();
        });

        it('should honor changes in applied sorting.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            grid.sort({fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            let wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridSortByName, 'Ascending sorted data should have been exported.');

            grid.sort({fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            wrapper = await getExportedData(grid, options);
            wrapper.verifyDataFilesContent(actualData.simpleGridSortByNameDesc(true), 'Descending sorted data should have been exported.');

            grid.clearSort();
            grid.sort({fieldName: 'ID',  dir: SortingDirection.Asc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            // wrapper = await getExportedData(grid, options);
            // wrapper.verifyDataFilesContent(actualData.simpleGridSortByNameDesc(false), 'Unsorted data should have been exported.');
        });

        it('should export all columns with the width specified in options.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            grid.columns[1].hidden = true;
            grid.columns[2].hidden = true;
            const columnWidths = [100, 200, 0, undefined, null];
            fix.detectChanges();

            await setColWidthAndExport(grid, options, fix, columnWidths[0]);
            await setColWidthAndExport(grid, options, fix, columnWidths[1]);
            await setColWidthAndExport(grid, options, fix, columnWidths[2]);
            await setColWidthAndExport(grid, options, fix, columnWidths[3]);
            await setColWidthAndExport(grid, options, fix, columnWidths[4]);
        });

        it('should export all rows with the height specified in options.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            const rowHeights = [20, 40, 0, undefined, null];

            await setRowHeightAndExport(grid, options, fix, rowHeights[0]);
            await setRowHeightAndExport(grid, options, fix, rowHeights[1]);
            await setRowHeightAndExport(grid, options, fix, rowHeights[2]);
            await setRowHeightAndExport(grid, options, fix, rowHeights[3]);
            await setRowHeightAndExport(grid, options, fix, rowHeights[4]);
        });

        it('should fire \'onColumnExport\' for each grid column.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            const cols = [];
            exporter.onColumnExport.subscribe((value) => {
                cols.push({ header: value.header, index: value.columnIndex });
            });

            await getExportedData(grid, options);
            expect(cols.length).toBe(3);
            expect(cols[0].header).toBe('ID');
            expect(cols[0].index).toBe(0);
            expect(cols[1].header).toBe('Name');
            expect(cols[1].index).toBe(1);
            expect(cols[2].header).toBe('JobTitle');
            expect(cols[2].index).toBe(2);
        });

        it('should fire \'onColumnExport\' for each visible grid column.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            const cols = [];
            exporter.onColumnExport.subscribe((value) => {
                cols.push({ header: value.header, index: value.columnIndex });
            });

            grid.columns[0].hidden = true;
            options.ignoreColumnsVisibility = false;
            fix.detectChanges();

            const wrapper = await getExportedData(grid, options);
            expect(cols.length).toBe(2);
            expect(cols[0].header).toBe('Name');
            expect(cols[0].index).toBe(0);
            expect(cols[1].header).toBe('JobTitle');
            expect(cols[1].index).toBe(1);
            wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle);
        });

        it('should not export columns when \'onColumnExport\' is canceled.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            exporter.onColumnExport.subscribe((value: IColumnExportingEventArgs) => {
                value.cancel = true;
            });

            const wrapper = await getExportedData(grid, options);
            expect(wrapper.hasValues).toBe(false);
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
        });

        it('should fire \'onRowExport\' for each grid row.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const data = SampleTestData.personJobData();

            const rows = [];
            exporter.onRowExport.subscribe((value: IRowExportingEventArgs) => {
                rows.push({ data: value.rowData, index: value.rowIndex });
            });

            await getExportedData(grid, options);
            expect(rows.length).toBe(10);
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i].index).toBe(i);
                expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(data[i]));
            }
        });

        it('should not export rows when \'onRowExport\' is canceled.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            exporter.onRowExport.subscribe((value: IRowExportingEventArgs) => {
                value.cancel = true;
            });

            const wrapper = await getExportedData(grid, options);
            expect(wrapper.hasValues).toBe(false);
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
        });

        it('shouldn\'t affect grid sort expressions', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            grid.columns[1].header = 'My header';
            grid.columns[1].sortable = true;
            grid.sort({fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: false});
            const sortField = grid.sortingExpressions[0].fieldName;
            fix.detectChanges();

            let wrapper = await getExportedData(grid, options);
            fix.detectChanges();

            wrapper = await getExportedData(grid, options);
            const sortFieldAfterExport = grid.sortingExpressions[0].fieldName;
            expect(sortField).toBe(sortFieldAfterExport);
        });

        it('should skip the column formatter when \'onColumnExport\' skipFormatter is true', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            // Set column formatters
            grid.columns[0].formatter = ((val: number) => {
                const numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine' , 'ten'];
                return numbers[val - 1];
            });
            grid.cdr.detectChanges();
            fix.detectChanges();

            // Verify the exported data is formatted by default
            await exportAndVerify(grid, options, actualData.simpleGridNameJobTitleWithFormatting);

            exporter.onColumnExport.subscribe((val: IColumnExportingEventArgs) => {
                val.skipFormatter = true;
            });
            fix.detectChanges();
            grid.cdr.detectChanges();

            // Verify the data without formatting
            await exportAndVerify(grid, options, actualData.simpleGridData);

            exporter.onColumnExport.subscribe((val: IColumnExportingEventArgs) => {
                val.skipFormatter = false;
            });
            grid.cdr.detectChanges();
            fix.detectChanges();
            // Verify the exported data with formatting
            await exportAndVerify(grid, options, actualData.simpleGridNameJobTitleWithFormatting);
        });
    });

    describe('', () => {
        let fix;
        let treeGrid: IgxTreeGridComponent;
        beforeEach(() => {
            options = createExportOptions('TreeGridExcelExport', 50);
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should export tree grid as displayed with all groups expanded.', async () => {
            await exportAndVerify(treeGrid, options, actualData.treeGridData);
        });

        it('should export sorted tree grid properly.', async () => {
            treeGrid.sort({fieldName: 'ID', dir: SortingDirection.Desc});
            options.ignoreSorting = true;
            fix.detectChanges();

            await exportAndVerify(treeGrid, options, actualData.treeGridData);

            options.ignoreSorting = false;
            await exportAndVerify(treeGrid, options, actualData.treeGridDataSorted);

            treeGrid.clearSort();
            fix.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridData);
        });

        it('should export filtered tree grid properly.', async () => {
            treeGrid.filter('ID', 3, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            options.ignoreFiltering = true;
            fix.detectChanges();

            await exportAndVerify(treeGrid, options, actualData.treeGridData);

            options.ignoreFiltering = false;
            await exportAndVerify(treeGrid, options, actualData.treeGridDataFiltered);

            treeGrid.clearFilter();
            fix.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridData);
        });

        it('should export filtered and sorted tree grid properly.', async () => {
            treeGrid.filter('ID', 3, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            treeGrid.sort({fieldName: 'Name', dir: SortingDirection.Desc});
            fix.detectChanges();

            await exportAndVerify(treeGrid, options, actualData.treeGridDataFilteredSorted);
        });

        it('should export tree grid with only first level expanded.', async () => {
            treeGrid.expansionDepth = 1;
            fix.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridDataExpDepth(1));
        });

        it('should export tree grid with collapsed first level.', async () => {
            treeGrid.collapseAll();
            fix.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridDataExpDepth(0));
        });

        it('should throw an exception when nesting level is greater than 8.', async () => {
            const nestedData = SampleTestData.employeePrimaryForeignKeyTreeData();
            for (let i = 1; i < 9; i++) {
                nestedData[i - 1].ID = i;
                nestedData[i - 1].ParentID = i - 1;
            }
            nestedData.push({ ID: 9, ParentID: 8, Name: 'Test', JobTitle: '', Age: 49 });
            treeGrid.data = nestedData;
            fix.detectChanges();
            await wait(16);

            let error = '';
            try {
                exporter.export(treeGrid, options);
                await wait();
            } catch (ex) {
                error = ex.message;
            }
            expect(error).toMatch('Can create an outline of up to eight levels!');

            treeGrid.deleteRowById(9);
            fix.detectChanges();
            await wait(16);

            error = '';
            try {
                exporter.export(treeGrid, options);
                await wait();
            } catch (ex) {
                error = ex.message;
            }
            expect(error).toEqual('');

            treeGrid.addRow({ ID: 9, ParentID: 8, Name: 'Test', JobTitle: '', Age: 49 });
            fix.detectChanges();
            await wait(16);

            error = '';
            try {
                exporter.export(treeGrid, options);
                await wait();
            } catch (ex) {
                error = ex.message;
            }
            expect(error).toMatch('Can create an outline of up to eight levels!');
        });

        it('should skip the formatter when columnExproting skipFormatter is true', async () => {
            treeGrid.columns[4].formatter = ((val: number) => {
                const t = Math.floor(val / 10);
                const o = val % 10;
                return val + parseFloat(((t + o) / 12).toFixed(2));
            });
            treeGrid.cdr.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridDataFormatted);

            exporter.onColumnExport.subscribe((args: IColumnExportingEventArgs) => {
                args.skipFormatter = true;
            });
            treeGrid.cdr.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridData);

            exporter.onColumnExport.subscribe((args: IColumnExportingEventArgs) => {
                args.skipFormatter = false;
            });
            treeGrid.cdr.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridDataFormatted);
        });
    });

    function getExportedData(grid, exportOptions: IgxExcelExporterOptions) {
        const exportData = new Promise<JSZipWrapper>((resolve) => {
            exporter.onExportEnded.pipe(first()).subscribe((value) => {
                const wrapper = new JSZipWrapper(value.xlsx);
                resolve(wrapper);
            });
            exporter.export(grid, exportOptions);
        });
        return exportData;
    }

    function setColWidthAndExport(grid, exportOptions: IgxExcelExporterOptions, fix, value) {
        return new Promise<void>((resolve) => {
            options.columnWidth = value;
            fix.detectChanges();
            getExportedData(grid, exportOptions).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridColumnWidth(value), ' Width :' + value).then(() => resolve());
            });
        });
    }

    function setRowHeightAndExport(grid, exportOptions: IgxExcelExporterOptions, fix, value) {
        return new Promise<void>((resolve) => {
            options.rowHeight = value;
            fix.detectChanges();
            getExportedData(grid, exportOptions).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridRowHeight(value), ' Height :' + value).then(() => resolve());
            });
        });
    }

    function createExportOptions(fileName, columnWidth?) {
        const opts = new IgxExcelExporterOptions(fileName);

        // Set column width to a specific value to workaround the issue where
        // different platforms measure text differently
        opts.columnWidth = columnWidth;

        return opts;
    }

    async function exportAndVerify(component, exportOptions, expectedData) {
        const wrapper = await getExportedData(component, exportOptions);
        await wrapper.verifyStructure();
        await wrapper.verifyDataFilesContent(expectedData);
    }
});
