import { TestBed, waitForAsync } from '@angular/core/testing';
import { IgxGridComponent } from '../../grids/grid/grid.component';
import { IColumnExportingEventArgs, IRowExportingEventArgs } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { TestMethods } from '../exporter-common/test-methods.spec';
import { IgxExcelExporterService } from './excel-exporter';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { ZipWrapper } from './zip-verification-wrapper.spec';
import { FileContentData } from './test-data.service.spec';
import {
    ReorderedColumnsComponent,
    GridIDNameJobTitleComponent,
    ProductsComponent,
    GridIDNameJobTitleHireDataPerformanceComponent,
    GridHireDateComponent,
    GridExportGroupedDataComponent,
    MultiColumnHeadersExportComponent,
    GridWithEmptyColumnsComponent,
    ColumnsAddedOnInitComponent,
    GridWithThreeLevelsOfMultiColumnHeadersAndTwoRowsExportComponent,
    GroupedGridWithSummariesComponent,
    GridCurrencySummariesComponent,
    GridUserMeetingDataComponent,
    GridCustomSummaryComponent,
    GridCustomSummaryWithNullAndZeroComponent,
    GridCustomSummaryWithUndefinedZeroAndValidNumberComponent,
    GridCustomSummaryWithUndefinedAndNullComponent,
    GridCustomSummaryWithDateComponent
} from '../../test-utils/grid-samples.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';
import { DefaultSortingStrategy, SortingDirection } from '../../data-operations/sorting-strategy';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxTreeGridPrimaryForeignKeyComponent, IgxTreeGridSummariesKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { IgxTreeGridComponent } from '../../grids/tree-grid/public_api';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { IgxHierarchicalGridExportComponent,
         IgxHierarchicalGridMultiColumnHeaderIslandsExportComponent,
         IgxHierarchicalGridMultiColumnHeadersExportComponent,
         IgxHierarchicalGridSummariesExportComponent
} from '../../test-utils/hierarchical-grid-components.spec';
import { IgxHierarchicalGridComponent } from '../../grids/hierarchical-grid/public_api';
import { IgxHierarchicalRowComponent } from '../../grids/hierarchical-grid/hierarchical-row.component';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxPivotGridMultipleRowComponent, IgxPivotGridTestComplexHierarchyComponent } from '../../test-utils/pivot-grid-samples.spec';
import { IgxPivotGridComponent, PivotRowLayoutType } from '../../grids/pivot-grid/public_api';

describe('Excel Exporter', () => {
    configureTestSuite();
    let exporter: IgxExcelExporterService;
    let actualData: FileContentData;
    let options: IgxExcelExporterOptions;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ReorderedColumnsComponent,
                GridIDNameJobTitleComponent,
                IgxTreeGridPrimaryForeignKeyComponent,
                ProductsComponent,
                GridWithEmptyColumnsComponent,
                GridIDNameJobTitleHireDataPerformanceComponent,
                GridHireDateComponent,
                GridExportGroupedDataComponent,
                IgxHierarchicalGridExportComponent,
                MultiColumnHeadersExportComponent,
                IgxHierarchicalGridMultiColumnHeadersExportComponent,
                ColumnsAddedOnInitComponent,
                IgxHierarchicalGridMultiColumnHeaderIslandsExportComponent,
                GridWithThreeLevelsOfMultiColumnHeadersAndTwoRowsExportComponent,
                IgxPivotGridMultipleRowComponent,
                IgxPivotGridTestComplexHierarchyComponent,
                IgxTreeGridSummariesKeyComponent,
                IgxHierarchicalGridSummariesExportComponent,
                GroupedGridWithSummariesComponent,
                GridCurrencySummariesComponent,
                GridUserMeetingDataComponent,
                GridCustomSummaryComponent,
                GridCustomSummaryWithNullAndZeroComponent,
                GridCustomSummaryWithUndefinedZeroAndValidNumberComponent,
                GridCustomSummaryWithUndefinedAndNullComponent,
                GridCustomSummaryWithDateComponent
            ]
        }).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        exporter = new IgxExcelExporterService();
        actualData = new FileContentData();

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities as any, 'saveBlobToFile');
    }));

    afterEach(waitForAsync(() => {
        exporter.columnExporting.unsubscribe();
        exporter.rowExporting.unsubscribe();
    }));

    describe('', () => {
        beforeEach(waitForAsync(() => {
            options = createExportOptions('GridExcelExport', 50);
        }));

        it('should export grid as displayed.', async () => {
            const currentGrid: IgxGridComponent = null;
            await TestMethods.testRawData(currentGrid, async (grid) => {
                await exportAndVerify(grid, options, actualData.simpleGridData);
            });
        });

        it('should honor \'ignoreFiltering\' option.', async () => {
            const result = await TestMethods.createGridAndFilter();
            const fix = result.fixture;
            const grid = result.grid;
            expect(grid.rowList.length).toEqual(1);

            options.ignoreFiltering = false;
            fix.detectChanges();

            let wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridDataRecord5, 'One row only should have been exported!');

            options.ignoreFiltering = true;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All 10 rows should have been exported!');
        });

        it('should honor filter criteria changes.', async () => {
            const result = await TestMethods.createGridAndFilter();
            const fix = result.fixture;
            const grid = result.grid;
            expect(grid.rowList.length).toEqual(1);
            options.ignoreFiltering = false;

            let wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridDataRecord5, 'One row should have been exported!');

            grid.filter('JobTitle', 'Director', IgxStringFilteringOperand.instance().condition('equals'), true);
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(2, 'Invalid number of rows after filtering!');
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridDataDirectors, 'Two rows should have been exported!');
        });

        it('should honor \'ignoreColumnsVisibility\' option.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            grid.columnList.get(0).hidden = true;
            options.ignoreColumnsVisibility = false;
            fix.detectChanges();

            expect(grid.visibleColumns.length).toEqual(2, 'Invalid number of visible columns!');
            let wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle, 'Two columns should have been exported!');

            options.ignoreColumnsVisibility = true;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All three columns should have been exported!');
        });

        it('should honor columns visibility changes.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            options.ignoreColumnsVisibility = false;

            expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
            let wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All columns should have been exported!');

            grid.columnList.get(0).hidden = true;
            fix.detectChanges();

            expect(grid.visibleColumns.length).toEqual(2, 'Invalid number of visible columns!');
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle, 'Two columns should have been exported!');

            grid.columnList.get(0).hidden = false;
            fix.detectChanges();

            expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All columns should have been exported!');

            grid.columnList.get(0).hidden = undefined;
            fix.detectChanges();

            expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridData, 'All columns should have been exported!');
        });

        it('should honor columns declaration order.', async () => {
            const fix = TestBed.createComponent(ReorderedColumnsComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            const wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitleID);
        });

        it('should honor \'ignorePinning\' option.', async () => {
            const result = await TestMethods.createGridAndPinColumn([1]);
            const fix = result.fixture;
            const grid = result.grid;

            options.ignorePinning = false;
            fix.detectChanges();

            let wrapper = await getExportedData(grid, options);
            wrapper.verifyStructure();
            // await wrapper.verifyTemplateFilesContent();
            await wrapper.verifyDataFilesContent(actualData.gridNameFrozen, 'One frozen column should have been exported!');

            options.ignorePinning = true;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.gridNameIDJobTitle, 'No frozen columns should have been exported!');
        });

        it('should honor pinned state changes.', async () => {
            const result = await TestMethods.createGridAndPinColumn([1]);
            const fix = result.fixture;
            const grid = result.grid;

            let wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.gridNameFrozen, 'One frozen column should have been exported!');

            grid.columnList.get(1).pinned = false;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridData, 'No frozen columns should have been exported!');
        });

        it('should honor all pinned columns.', async () => {
            const result = await TestMethods.createGridAndPinColumn(2, 0);
            const grid = result.grid;

            const wrapper = await getExportedData(grid, options);
            wrapper.verifyStructure();
            await wrapper.verifyDataFilesContent(actualData.gridJobTitleIdFrozen, 'Not all pinned columns are frozen in the export!');
        });

        it('should honor \'freezeHeaders\' option.', async () => {
            const result = await TestMethods.createGridAndPinColumn([1]);
            const fix = result.fixture;
            const grid = result.grid;

            options.ignorePinning = false;
            options.freezeHeaders = true;
            fix.detectChanges();

            let wrapper = await getExportedData(grid, options);
            wrapper.verifyStructure();
            await wrapper.verifyDataFilesContent(actualData.gridNameFrozenHeaders,
                'One frozen column and frozen headers should have been exported!');

            options.ignorePinning = true;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.gridFrozenHeaders,
                'No frozen columns and frozen headers should have been exported!');

            options.freezeHeaders = false;
            fix.detectChanges();
            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.gridNameIDJobTitle,
                'No frozen columns and no frozen headers should have been exported!');
        });

        it('should honor applied sorting.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            grid.sort({fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            const wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridSortByName);

            // XXX : ???? What's the point of this?
            // grid.clearSort();
            // fix.detectChanges();
        });

        it('should honor changes in applied sorting.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            grid.sort({fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            let wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(actualData.simpleGridSortByName, 'Ascending sorted data should have been exported.');

            grid.sort({fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            wrapper = await getExportedData(grid, options);
            await wrapper.verifyDataFilesContent(
                actualData.simpleGridSortByNameDesc(), 'Descending sorted data should have been exported.');

            grid.clearSort();
            grid.sort({fieldName: 'ID',  dir: SortingDirection.Asc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            // wrapper = await getExportedData(grid, options);
            // await wrapper.verifyDataFilesContent(actualData.simpleGridSortByNameDesc(false), 'Unsorted data should have been exported.');
        });

        it('should export all columns with the width specified in options.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            grid.columnList.get(1).hidden = true;
            grid.columnList.get(2).hidden = true;
            const columnWidths = [100, 200, 0, null];
            fix.detectChanges();

            await setColWidthAndExport(grid, options, fix, columnWidths[0]);
            await setColWidthAndExport(grid, options, fix, columnWidths[1]);
            await setColWidthAndExport(grid, options, fix, columnWidths[2]);
            await setColWidthAndExport(grid, options, fix, columnWidths[3]);
        });

        it('should export all rows with the height specified in options.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            const rowHeights = [20, 40, 0, undefined, null];

            await setRowHeightAndExport(grid, options, fix, rowHeights[0]);
            await setRowHeightAndExport(grid, options, fix, rowHeights[1]);
            await setRowHeightAndExport(grid, options, fix, rowHeights[2]);
            await setRowHeightAndExport(grid, options, fix, rowHeights[3]);
            await setRowHeightAndExport(grid, options, fix, rowHeights[4]);
        });

        it('should fire \'columnExporting\' for each grid column.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            const cols = [];
            exporter.columnExporting.subscribe((value) => {
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

        it('should fire \'columnExporting\' for each visible grid column.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            const cols = [];
            exporter.columnExporting.subscribe((value) => {
                cols.push({ header: value.header, index: value.columnIndex });
            });

            grid.columnList.get(0).hidden = true;
            options.ignoreColumnsVisibility = false;
            fix.detectChanges();

            const wrapper = await getExportedData(grid, options);
            expect(cols.length).toBe(2);
            expect(cols[0].header).toBe('Name');
            expect(cols[0].index).toBe(0);
            expect(cols[1].header).toBe('JobTitle');
            expect(cols[1].index).toBe(1);
            await wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle);
        });

        it('should not export columns when \'columnExporting\' is canceled.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            options.alwaysExportHeaders = false;

            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            exporter.columnExporting.subscribe((value: IColumnExportingEventArgs) => {
                value.cancel = true;
            });

            const wrapper = await getExportedData(grid, options);
            expect(wrapper.hasValues).toBe(false);
            wrapper.verifyStructure();
            await wrapper.verifyTemplateFilesContent();
        });

        it('should export the column at the specified index when \'columnIndex\' is set during \'columnExporting\' event.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            exporter.columnExporting.subscribe((value: IColumnExportingEventArgs) => {
                if (value.columnIndex === 0) {
                    value.columnIndex = 2;
                }
            });

            await exportAndVerify(grid, options, actualData.simpleGridNameJobTitleID);
        });

        it('should export the column at the specified index when \'columnIndex\' is set during \'columnExporting\' (2).', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            exporter.columnExporting.subscribe((value: IColumnExportingEventArgs) => {
                if (value.columnIndex === 2) {
                    value.columnIndex = 0;
                }
            });

            await exportAndVerify(grid, options, actualData.simpleGridJobTitleIDName);
        });

        it('should handle gracefully setting \'columnIndex\' to an invalid value.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            exporter.columnExporting.subscribe((value: IColumnExportingEventArgs) => {
                if (value.columnIndex === 0) {
                    value.columnIndex = 4;
                } else if (value.columnIndex === 2) {
                    value.columnIndex = -1;
                }
            });

            await exportAndVerify(grid, options, actualData.simpleGridNameJobTitleID);
        });

        it('should fire \'rowExporting\' for each grid row.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            const data = SampleTestData.personJobData();

            const rows = [];
            exporter.rowExporting.subscribe((value: IRowExportingEventArgs) => {
                rows.push({ data: value.rowData, index: value.rowIndex });
            });

            await getExportedData(grid, options);
            expect(rows.length).toBe(10);
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i].index).toBe(i);
                expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(data[i]));
            }
        });

        it('should not export rows when \'rowExporting\' is canceled.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            options.alwaysExportHeaders = false;

            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            exporter.rowExporting.subscribe((value: IRowExportingEventArgs) => {
                value.cancel = true;
            });

            const wrapper = await getExportedData(grid, options);
            expect(wrapper.hasValues).toBe(false);
            wrapper.verifyStructure();
            await wrapper.verifyTemplateFilesContent();
        });

        it('shouldn\'t affect grid sort expressions', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            grid.columnList.get(1).header = 'My header';
            grid.columnList.get(1).sortable = true;
            grid.sort({fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: false});
            const sortField = grid.sortingExpressions[0].fieldName;
            fix.detectChanges();

            await getExportedData(grid, options);
            fix.detectChanges();

            await getExportedData(grid, options);
            const sortFieldAfterExport = grid.sortingExpressions[0].fieldName;
            expect(sortField).toBe(sortFieldAfterExport);
        });

        it('should skip the column formatter when \'columnExporting\' skipFormatter is true', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            // Set column formatters
            grid.columnList.get(0).formatter = ((val: number) => {
                const numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine' , 'ten'];
                return numbers[val - 1];
            });
            grid.cdr.detectChanges();
            fix.detectChanges();

            // Verify the exported data is formatted by default
            await exportAndVerify(grid, options, actualData.simpleGridNameJobTitleWithFormatting);

            exporter.columnExporting.subscribe((val: IColumnExportingEventArgs) => {
                val.skipFormatter = true;
            });
            fix.detectChanges();
            grid.cdr.detectChanges();

            // Verify the data without formatting
            await exportAndVerify(grid, options, actualData.simpleGridData);

            exporter.columnExporting.subscribe((val: IColumnExportingEventArgs) => {
                val.skipFormatter = false;
            });
            grid.cdr.detectChanges();
            fix.detectChanges();
            // Verify the exported data with formatting
            await exportAndVerify(grid, options, actualData.simpleGridNameJobTitleWithFormatting);
        });

        it('should export columns without header', async () => {
            const fix = TestBed.createComponent(GridWithEmptyColumnsComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            // Verify the data without formatting
            await exportAndVerify(grid, options, actualData.gridWithEmptyColumns);

            exporter.columnExporting.subscribe((value: IColumnExportingEventArgs) => {
                if (value.columnIndex === 0 || value.columnIndex === 2) {
                    value.cancel = true;
                }
            });
            await exportAndVerify(grid, options, actualData.simpleGridData);
        });

        it('Should honor Advanced filters when exporting', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Name',
                searchVal: 'a',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push({
                fieldName: 'Name',
                searchVal: 'r',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push({
                fieldName: 'ID',
                searchVal: 5,
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
            });

            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();
            grid.cdr.detectChanges();
            await wait();
            expect(grid.filteredData.length).toBe(4);

            // Export and verify
            await exportAndVerify(grid, options, actualData.gridWithAdvancedFilters);
        });

        it('Should set worksheet name', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            const worksheetName = 'NewWorksheetName';

            await setWorksheetNameAndExport(grid, options, fix, worksheetName);
        });

        it('Should export arrays as strings.', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleHireDataPerformanceComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.personJobHoursDataPerformance);
        });

        it('Should export dates correctly.', async () => {
            const fix = TestBed.createComponent(GridHireDateComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.hireDate);
        });

        it('Should export grouped grid', async () => {
            const fix = TestBed.createComponent(GridExportGroupedDataComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            grid.groupBy({ fieldName: 'Brand', dir: SortingDirection.Asc, ignoreCase: false });
            grid.groupBy({ fieldName: 'Price', dir: SortingDirection.Desc, ignoreCase: false });

            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportGroupedData);
        });

        it('Should export grouped grid with collapsed rows', async () => {
            const fix = TestBed.createComponent(GridExportGroupedDataComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            grid.groupBy({ fieldName: 'Brand', dir: SortingDirection.Asc, ignoreCase: false });
            grid.groupBy({ fieldName: 'Price', dir: SortingDirection.Desc, ignoreCase: false });

            fix.detectChanges();

            const groupRows = grid.groupsRecords;

            grid.toggleGroup(groupRows[0].groups[1]);
            grid.toggleGroup(groupRows[1]);
            grid.toggleGroup(groupRows[1].groups[2]);

            fix.detectChanges();


            await exportAndVerify(grid, options, actualData.exportGroupedDataWithCollapsedRows);
        });

        it('Should export grouped grid with ignored sorting', async () => {
            const fix = TestBed.createComponent(GridExportGroupedDataComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            grid.groupBy({ fieldName: 'Brand', dir: SortingDirection.Asc, ignoreCase: false });
            grid.sort({fieldName: 'Price', dir: SortingDirection.Desc});

            options.ignoreSorting = true;

            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportGroupedDataWithIgnoreSorting);
        });

        it('Should export grouped grid with ignored filtering', async () => {
            const fix = TestBed.createComponent(GridExportGroupedDataComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            grid.groupBy({ fieldName: 'Brand', dir: SortingDirection.Asc, ignoreCase: false });

            grid.filter('Model', 'Model', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            options.ignoreFiltering = true;

            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportGroupedDataWithIgnoreFiltering);
        });

        it('Should export grouped grid with ignored grouping', async () => {
            const fix = TestBed.createComponent(GridExportGroupedDataComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            grid.groupBy({ fieldName: 'Brand', dir: SortingDirection.Asc, ignoreCase: false });

            options.ignoreGrouping = true;

            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportGroupedDataWithIgnoreGrouping);
        });

        it('should map dynamically added data & columns properly (#9872).', async () => {
            const fix = TestBed.createComponent(ColumnsAddedOnInitComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            await exportAndVerify(grid, options, actualData.columnsAddedOnInit);
        });

        it('Should escape special chars in headers', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleHireDataPerformanceComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            grid.columnList.get(1).header = '&';
            grid.columnList.get(2).header = '<>';
            grid.columnList.get(3).header = '"';
            grid.columnList.get(4).header = '\'';


            await exportAndVerify(grid, options, actualData.exportGridDataWithSpecialCharsInHeaders);
        });

        it('Should export date, dateTime, time and percent columns correctly', async () => {
            const fix = TestBed.createComponent(GridUserMeetingDataComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.exportGriWithDateData);
        });

        it('Should respect column formatter', async () => {
            const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
            fix.detectChanges();
            await wait();

            const grid = fix.componentInstance.grid;
            const nameCol = grid.getColumnByName('Name');
            nameCol.formatter = fix.componentInstance.formatter;
            grid.getColumnByName('JobTitle').hidden = true;

            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportGriWithFormattedColumn);
        });
    });

    describe('', () => {
        let fix;
        let hGrid;
        beforeEach(waitForAsync(() => {
            options = createExportOptions('HierarchicalGridExcelExport');
            fix = TestBed.createComponent(IgxHierarchicalGridExportComponent);
            fix.detectChanges();

            hGrid = fix.componentInstance.hGrid;
        }));

        it('should export hierarchical grid', async () => {
            await exportAndVerify(hGrid, options, actualData.exportHierarchicalData);
        });

        it('should export hierarchical grid respecting options width.', async () => {
            options = createExportOptions('HierarchicalGridExcelExport', 50);

            await exportAndVerify(hGrid, options, actualData.exportHierarchicalDataWithColumnWidth);
        });

        it('should export sorted hierarchical grid data', async () => {
            hGrid.sort({fieldName: 'GrammyNominations', dir: SortingDirection.Desc});
            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportSortedHierarchicalData);
        });

        it('should export hierarchical grid data with ignored sorting', async () => {
            hGrid.sort({fieldName: 'GrammyNominations', dir: SortingDirection.Desc});

            options.ignoreSorting = true;
            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportHierarchicalData);
        });

        it('should export filtered hierarchical grid data', async () => {
            hGrid.filter('Debut', '2009', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportFilteredHierarchicalData);
        });

        it('should export hierarchical grid data with ignored filtering', async () => {
            hGrid.filter('Debut', '2009', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            options.ignoreFiltering = true;

            await exportAndVerify(hGrid, options, actualData.exportHierarchicalData);
        });

        it('should export hierarchical grid with expanded rows.', async () => {
            const firstRow = hGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            const secondRow = hGrid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;

            UIInteractions.simulateClickAndSelectEvent(firstRow.expander);
            fix.detectChanges();
            expect(firstRow.expanded).toBe(true);

            let childGrids = hGrid.gridAPI.getChildGrids(false);

            const firstChildGrid = childGrids[0];
            const firstChildRow = firstChildGrid.gridAPI.get_row_by_index(2) as IgxHierarchicalRowComponent;

            UIInteractions.simulateClickAndSelectEvent(firstChildRow.expander);
            fix.detectChanges();
            expect(firstChildRow.expanded).toBe(true);

            const secondChildGrid = childGrids[1];
            const secondChildRow = secondChildGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;

            UIInteractions.simulateClickAndSelectEvent(secondChildRow.expander);
            fix.detectChanges();
            expect(secondChildRow.expanded).toBe(true);

            UIInteractions.simulateClickAndSelectEvent(secondRow.expander);
            fix.detectChanges();
            expect(secondRow.expanded).toBe(true);

            childGrids = hGrid.gridAPI.getChildGrids(false);

            const thirdChildGrid = childGrids[3];
            const thirdChildRow = thirdChildGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;

            UIInteractions.simulateClickAndSelectEvent(thirdChildRow.expander);
            fix.detectChanges();
            expect(thirdChildRow.expanded).toBe(true);

            await exportAndVerify(hGrid, options, actualData.exportHierarchicalDataWithExpandedRows);
        });

        it('should export hierarchical grid data with frozen headers', async () => {
            options.freezeHeaders = true;
            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportHierarchicalDataWithFrozenHeaders);
        });

        it('should export hierarchical grid with skipped columns', async () => {
            exporter.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
                if (args.header === 'Debut' ||
                    args.header === 'Billboard Review' ||
                    args.header === 'Album' ||
                    args.header === 'Tickets Sold' ||
                    args.header === 'Released') {
                    args.cancel = true;
                  }
            });

            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportHierarchicalDataWithSkippedColumns);
        });

        it('should export hierarchical grid with all child rows canceled.', async () => {
            exporter.rowExporting.subscribe((args: IRowExportingEventArgs) => {
                if (args.owner?.key === "Albums" ||
                    args.owner?.key === "Songs" ||
                    args.owner?.key === "Tours" ||
                    args.owner?.key === "TourData") {
                        args.cancel = true;
                    }
            });

            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportHierarchicalDataWithSkippedRows);
        });
    });

    describe('', () => {
        it('should export hierarchical grid with multi column headers', async () => {
            const fix = TestBed.createComponent(IgxHierarchicalGridMultiColumnHeadersExportComponent);
            fix.detectChanges();

            const hGrid = fix.componentInstance.hGrid;
            options = createExportOptions('HierarchicalGridMCHExcelExport');
            await exportAndVerify(hGrid, options, actualData.exportHierarchicalDataWithMultiColumnHeaders);
        });

        it('should export hierarchical grid with multi column headers only in the row island', async () => {
            const fix = TestBed.createComponent(IgxHierarchicalGridMultiColumnHeaderIslandsExportComponent);
            fix.detectChanges();

            const hGrid = fix.componentInstance.hGrid;
            options = createExportOptions('HierarchicalGridMCHExcelExport');
            await exportAndVerify(hGrid, options, actualData.exportHierarchicalDataWithMultiColumnHeadersOnlyInIsland);
        });

        it('should export hierarchical grid with multi column headers and skipped column', async () => {
            const fix = TestBed.createComponent(IgxHierarchicalGridMultiColumnHeadersExportComponent);
            fix.detectChanges();

            const hGrid = fix.componentInstance.hGrid;
            options = createExportOptions('HierarchicalGridMCHExcelExport');

            exporter.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
                if (args.field === 'ContactTitle') {
                    args.cancel = true;
                }
            });
            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportMultiColumnHeadersDataWithSkippedColumn);
        });

        it('should export hierarchical grid with multi column headers and skipped parent multi column header', async () => {
            const fix = TestBed.createComponent(IgxHierarchicalGridMultiColumnHeadersExportComponent);
            fix.detectChanges();

            const hGrid = fix.componentInstance.hGrid;
            options = createExportOptions('HierarchicalGridMCHExcelExport');

            exporter.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
                if (args.header === 'Address Information') {
                    args.cancel = true;
                }
            });
            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportMultiColumnHeadersDataWithSkippedParentMCH);
        });

        it('should export empty file when all parent multi column headers are skipped and alwaysExportHeaders is false', async () => {
            const fix = TestBed.createComponent(IgxHierarchicalGridMultiColumnHeadersExportComponent);
            fix.detectChanges();

            const hGrid = fix.componentInstance.hGrid;
            options = createExportOptions('HierarchicalGridMCHExcelExport');
            options.alwaysExportHeaders = false;

            exporter.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
                if (args.header === 'General Information' || args.header === 'Address Information' || args.field === 'CustomerID') {
                    args.cancel = true;
                }
            });
            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportMultiColumnHeadersDataWithAllParentsSkipped);
        });

        it('should export headers when exporting empty hierarchical grid with multi column headers', async () => {
            const fix = TestBed.createComponent(IgxHierarchicalGridMultiColumnHeadersExportComponent);
            fix.detectChanges();

            const hGrid = fix.componentInstance.hGrid;
            fix.componentInstance.data = [];
            options = createExportOptions('HierarchicalGridMCHExcelExport');

            fix.detectChanges();

            await exportAndVerify(hGrid, options, actualData.exportEmptyMultiColumnHeadersDataWithExportedHeaders);
        });
    });

    describe('', () => {
        let fix;
        let treeGrid: IgxTreeGridComponent;
        beforeEach(waitForAsync(() => {
            options = createExportOptions('TreeGridExcelExport', 50);
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
        }));

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

        it('should export tree grid with ignore filtering properly.', async () => {
            treeGrid.filter('Age', 52, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            options.ignoreFiltering = true;
            fix.detectChanges();

            await exportAndVerify(treeGrid, options, actualData.treeGridDataIgnoreFiltering);
        });

        it('should export tree grid with ignore sorting properly.', async () => {
            treeGrid.sort({fieldName: 'Age', dir: SortingDirection.Desc});
            options.ignoreSorting = true;
            fix.detectChanges();

            await exportAndVerify(treeGrid, options, actualData.treeGridData);
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

        it('should skip the formatter when columnExporting skipFormatter is true', async () => {
            treeGrid.columnList.get(4).formatter = ((val: number) => {
                const t = Math.floor(val / 10);
                const o = val % 10;
                return val + parseFloat(((t + o) / 12).toFixed(2));
            });
            treeGrid.cdr.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridDataFormatted);

            exporter.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
                args.skipFormatter = true;
            });
            treeGrid.cdr.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridData);

            exporter.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
                args.skipFormatter = false;
            });
            treeGrid.cdr.detectChanges();
            await exportAndVerify(treeGrid, options, actualData.treeGridDataFormatted);
        });

        it('Should honor Advanced filters when exporting', async () => {
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Age',
                searchVal: 40,
                condition: IgxNumberFilteringOperand.instance().condition('lessThan'),
                ignoreCase: true
            });
            tree.filteringOperands.push({
                fieldName: 'Name',
                searchVal: 'a',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });

            treeGrid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();
            treeGrid.cdr.detectChanges();
            await wait();
            expect(treeGrid.filteredData.length).toBe(5);

            await exportAndVerify(treeGrid, options, actualData.treeGridWithAdvancedFilters);
        });

        it('should export headers when exporting empty tree grid.', async () => {
            fix.componentInstance.data = [];
            fix.detectChanges();

            await exportAndVerify(treeGrid, options, actualData.emptyTreeGridWithExportedHeaders);
        });
    });

    describe('', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(waitForAsync(() => {
            options = createExportOptions('MultiColumnHeaderGridExcelExport');
            fix = TestBed.createComponent(MultiColumnHeadersExportComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;
        }));

        it('should export grid with multi column headers', async () => {
            await exportAndVerify(grid, options, actualData.exportMultiColumnHeadersData, false);
        });

        it('should export grid with multi column headers and moved column', async () => {
            grid.columnList.get(0).move(2);
            await wait();
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportMultiColumnHeadersDataWithMovedColumn, false);
        });

        it('should export grid with hidden column', async () => {
            grid.columnList.get(0).hidden = true;
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportMultiColumnHeadersDataWithHiddenColumn, false);
        });

        it('should export grid with hidden column and ignoreColumnVisibility set to true', async () => {
            grid.columnList.get(0).hidden = true;
            options.ignoreColumnsVisibility = true;
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportMultiColumnHeadersDataWithIgnoreColumnVisibility, false);
        });

        it('should export grid with pinned column group', async () => {
            grid.columnList.get(1).pinned = true;
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportMultiColumnHeadersDataWithPinnedColumn, false);
        });

        it('should export grid with collapsed and expanded multi column headers', async () => {
            GridFunctions.clickGroupExpandIndicator(fix, grid.columnList.get(1));
            GridFunctions.clickGroupExpandIndicator(fix, grid.columnList.get(7));
            fix.detectChanges();
            await exportAndVerify(grid, options, actualData.exportCollapsedAndExpandedMultiColumnHeadersData, false);
        });

        it('should respect ignoreMultiColumnHeaders when set to true', async () => {
            options.ignoreMultiColumnHeaders = true;
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportMultiColumnHeadersDataWithoutMultiColumnHeaders);
        });

        it('should export grid with frozen multi column headers', async () => {
            options.freezeHeaders = true;
            fix.detectChanges();
            await exportAndVerify(grid, options, actualData.exportFrozenMultiColumnHeadersData, false);
        });

        it('should export headers when exporting empty grid with multi column headers', async () => {
            fix.componentInstance.data = [];

            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportEmptyGridWithMultiColumnHeadersData, false);
        });

        it('should export grid with three levels of multi column headers which have only two rows', async () => {
            fix = TestBed.createComponent(GridWithThreeLevelsOfMultiColumnHeadersAndTwoRowsExportComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.exportThreeLevelsOfMultiColumnHeadersWithTwoRowsData, false);
        });

        it('should export grouped grid with only multi column headers', async () => {
            grid.groupBy({ fieldName: 'ContactTitle', dir: SortingDirection.Asc, ignoreCase: true });
            grid.columnList.get(0).hidden = true;

            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportMultiColumnHeadersWithGroupedData, false);
        });
    });


    describe('', () => {
        let fix;
        let grid: any;

        beforeEach(waitForAsync(() => {
            options = createExportOptions('GirdSummariesExcelExport', 50);
        }));

        it('should export grid with summaries based on summaryCalculationMode', async () => {
            fix = TestBed.createComponent(GroupedGridWithSummariesComponent);
            fix.detectChanges();
            await wait(300);

            grid = fix.componentInstance.grid;
            grid.summaryCalculationMode = 'rootLevelOnly';

            await exportAndVerify(grid, options, actualData.exportGridWithSummaries);

            (grid as IgxGridComponent).groupBy({ fieldName: 'Shipped', dir: SortingDirection.Asc, ignoreCase: false });
            (grid as IgxGridComponent).groupBy({ fieldName: 'City', dir: SortingDirection.Asc, ignoreCase: false });
            (grid as IgxGridComponent).groupBy({ fieldName: 'ContactTitle', dir: SortingDirection.Asc, ignoreCase: false });

            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportGroupedGridWithSummariesRootLevelOnly);

            grid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportGroupedGridWithSummariesChildLevelsOnly);

            grid.summaryCalculationMode = 'rootAndChildLevels';
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportGroupedGridWithSummariesRootAndChildLevels);
        });

        it('should export tree grid with summaries', async () => {
            fix = TestBed.createComponent(IgxTreeGridSummariesKeyComponent);
            fix.detectChanges();
            await wait(300);
            grid = fix.componentInstance.treeGrid;

            grid.toggleRow(grid.getRowByIndex(2).key);
            grid.toggleRow(grid.getRowByIndex(0).key);
            grid.toggleRow(grid.getRowByIndex(3).key);
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportTreeGridWithSummaries);
        });

        it('should export hierarchical grid with summaries', async () => {
            fix = TestBed.createComponent(IgxHierarchicalGridSummariesExportComponent);
            fix.detectChanges();
            await wait(300);
            grid = fix.componentInstance.hGrid;

            const firstRow = grid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            const secondRow = grid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;

            UIInteractions.simulateClickAndSelectEvent(firstRow.expander);
            fix.detectChanges();
            expect(firstRow.expanded).toBe(true);

            let childGrids = grid.gridAPI.getChildGrids(false);

            const firstChildGrid = childGrids[0];
            const firstChildRow = firstChildGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;

            UIInteractions.simulateClickAndSelectEvent(firstChildRow.expander);
            fix.detectChanges();
            expect(firstChildRow.expanded).toBe(true);

            UIInteractions.simulateClickAndSelectEvent(secondRow.expander);
            fix.detectChanges();
            expect(secondRow.expanded).toBe(true);

            childGrids = grid.gridAPI.getChildGrids(false);

            const thirdChildGrid = childGrids[1];
            const thirdChildRow = thirdChildGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;

            UIInteractions.simulateClickAndSelectEvent(thirdChildRow.expander);
            fix.detectChanges();
            expect(thirdChildRow.expanded).toBe(true);

            await exportAndVerify(grid, options, actualData.exportHierarchicalGridWithSummaries);
        });

        it('should export grid with custom summaries, only with summary label as string', async () => {
            fix = TestBed.createComponent(GridCustomSummaryComponent);
            fix.detectChanges();
            await wait(300);

            grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.exportGridWithCustomSummaryOnlyWithSummaryLabel);
        });

        it('should export grid with custom summaries, with null and zero (as number)', async () => {
            fix = TestBed.createComponent(GridCustomSummaryWithNullAndZeroComponent);
            fix.detectChanges();
            await wait(300);
            grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.exportGridCustomSummaryWithNullAndZero);
        });

        it('should export grid with custom summaries, with undefined, zero and positive number (as number)', async () => {
            fix = TestBed.createComponent(GridCustomSummaryWithUndefinedZeroAndValidNumberComponent);
            fix.detectChanges();
            await wait(300);

            grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.exportGridCustomSummaryWithUndefinedZeroAndValidNumber);
        });

        it('should export grid with custom summaries, with undefined and null', async () => {
            fix = TestBed.createComponent(GridCustomSummaryWithUndefinedAndNullComponent);
            fix.detectChanges();
            await wait(300);

            grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.exportGridCustomSummaryWithUndefinedAndNull);
        });

        it('should export grid with custom summaries, with date', async () => {
            fix = TestBed.createComponent(GridCustomSummaryWithDateComponent);
            fix.detectChanges();
            await wait(300);

            grid = fix.componentInstance.grid;

            await exportAndVerify(grid, options, actualData.exportGridCustomSummaryWithDate);
        });
    });

    describe('', () => {
        let fix;
        let grid: IgxPivotGridComponent;

        beforeEach(waitForAsync(() => {
            options = createExportOptions('PivotGridGridExcelExport');
        }));

        it('should export pivot grid', async () => {
            fix = TestBed.createComponent(IgxPivotGridMultipleRowComponent);
            fix.detectChanges();
            await wait(300);

            grid = fix.componentInstance.pivotGrid;

            await exportAndVerify(grid, options, actualData.exportPivotGridData, false);
        });

        it('should export pivot grid that has row headers.', async () => {
            fix = TestBed.createComponent(IgxPivotGridMultipleRowComponent);
            fix.detectChanges();

            grid = fix.componentInstance.pivotGrid;
            grid.pivotUI.showRowHeaders = true;
            fix.detectChanges();
            await wait(300);

            await exportAndVerify(grid, options, actualData.exportPivotGridDataWithHeaders, false);
        });

        it('should export hierarchical pivot grid', async () => {
            fix = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
            fix.detectChanges();
            await wait(300);

            grid = fix.componentInstance.pivotGrid;

            await exportAndVerify(grid, options, actualData.exportPivotGridHierarchicalData, false);
        });

        it('should export pivot grid with horizontal row layout.', async () => {
            fix = TestBed.createComponent(IgxPivotGridMultipleRowComponent);
            fix.detectChanges();

            grid = fix.componentInstance.pivotGrid;
            grid.pivotUI.showRowHeaders = true;
            grid.pivotUI.rowLayout = PivotRowLayoutType.Horizontal;
            grid.pivotConfiguration.rows = [{
                memberName: 'ProductCategory',
                memberFunction: (data) => data.ProductCategory,
                enabled: true,
                childLevel:{
                    memberName: 'Country',
                    enabled: true,
                    childLevel: {
                        memberName: 'Date',
                        enabled: true
                    }
                }
            }],
            fix.detectChanges();
            await wait(300);
            fix.detectChanges();

            await exportAndVerify(grid, options, actualData.exportPivotGridDataHorizontal, false);
        });
    });

    const getExportedData = (grid, exportOptions: IgxExcelExporterOptions) => {
        const exportData = new Promise<ZipWrapper>((resolve) => {
            exporter.exportEnded.pipe(first()).subscribe((value) => {
                const wrapper = new ZipWrapper(value.xlsx);
                resolve(wrapper);
            });
            exporter.export(grid, exportOptions);
        });
        return exportData;
    };

    const setColWidthAndExport = (grid, exportOptions: IgxExcelExporterOptions, fix, value) => new Promise<void>((resolve) => {
            options.columnWidth = value;
            fix.detectChanges();
            getExportedData(grid, exportOptions).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridColumnWidth(value), ' Width :' + value).then(() => resolve());
            });
        });

    const setRowHeightAndExport = (grid, exportOptions: IgxExcelExporterOptions, fix, value) => new Promise<void>((resolve) => {
            options.rowHeight = value;
            fix.detectChanges();
            getExportedData(grid, exportOptions).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridRowHeight(value), ' Height :' + value).then(() => resolve());
            });
        });

    const setWorksheetNameAndExport = (grid, exportOptions: IgxExcelExporterOptions, fix, worksheetName) => new Promise<void>((resolve) => {
            options.worksheetName = worksheetName;
            fix.detectChanges();
            getExportedData(grid, exportOptions).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridWorksheetName(worksheetName), ' Worksheet Name : ' + worksheetName)
                    .then(() => resolve());
            });
        });

    const createExportOptions = (fileName, columnWidth?) => {
        const opts = new IgxExcelExporterOptions(fileName);

        // Set column width to a specific value to workaround the issue where
        // different platforms measure text differently
        opts.columnWidth = columnWidth;

        return opts;
    };

    const exportAndVerify = async (component, exportOptions, expectedData, exportTable = true) => {
        const isHGrid = component instanceof IgxHierarchicalGridComponent;
        const shouldNotExportTable = isHGrid || !exportTable;

        const wrapper = await getExportedData(component, exportOptions);
        await wrapper.verifyStructure(shouldNotExportTable);
        await wrapper.verifyDataFilesContent(expectedData, '', shouldNotExportTable);
    };
});
