import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxChildGridRowComponent, IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../../test-utils/ui-interactions.spec';
import {
    IgxColumnActionsComponent,
    IgxColumnComponent,
    IgxColumnGroupComponent,
    IgxColumnHidingDirective,
    IgxColumnMovingDragDirective,
    IgxColumnPinningDirective,
    IgxGridNavigationService,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarDirective,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent
} from 'igniteui-angular/grids/core';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxRowIslandComponent } from './row-island.component';
import { take } from 'rxjs/operators';
import {
    IgxHierarchicalGridEmptyDataExportComponent,
    IgxHierarchicalGridTestBaseComponent,
    IgxHierarchicalGridTestCustomToolbarComponent,
    IgxHierarchicalGridTestInputPaginatorComponent,
    IgxHierarchicalGridTestInputToolbarComponent,
    IgxHierarchicalGridWithTransactionProviderComponent
} from '../../../test-utils/hierarchical-grid-components.spec';
import { GridFunctions, GridSelectionFunctions, HEADER_PINNED_CLASS } from '../../../test-utils/grid-functions.spec';
import { HierarchicalGridFunctions } from '../../../test-utils/hierarchical-grid-functions.spec';
import { GridSelectionMode, RowPinningPosition } from 'igniteui-angular/grids/core';
import { SampleTestData } from '../../../test-utils/sample-test-data.spec';
import { setElementSize } from '../../../test-utils/helper-utils.spec';
import { ColumnPinningPosition, DefaultSortingStrategy, IgxStringFilteringOperand, ɵSize, SortingDirection } from 'igniteui-angular/core';
import { IgxPaginatorComponent } from 'igniteui-angular/paginator';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('IgxHierarchicalGrid Integration #hGrid', () => {
    let fixture: ComponentFixture<IgxHierarchicalGridTestBaseComponent>;
    let hierarchicalGrid: IgxHierarchicalGridComponent;

    // Setting a DEBOUNCE_TIME that is bigger than the resize observer's throttleTime.
    const DEBOUNCE_TIME = 50;

    const FILTERING_ROW_CLASS = 'igx-grid-filtering-row';
    const FILTERING_CELL_CLASS = 'igx-grid-filtering-cell';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxHierarchicalGridEmptyDataExportComponent,
                IgxHierarchicalGridTestBaseComponent,
                IgxHierarchicalGridTestCustomToolbarComponent,
                IgxHierarchicalGridWithTransactionProviderComponent,
                IgxHierarchicalGridTestInputPaginatorComponent,
                IgxHierarchicalGridTestInputToolbarComponent,
                IgxHierarchicalGridChildToolbarActionsComponent
            ],
            providers: [
                IgxGridNavigationService
            ]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
    });

    describe('MCH', () => {
        it('should allow declaring column groups.', async () => {
            const expectedColumnGroups = 1;
            const expectedLevel = 1;

            expect(hierarchicalGrid.columns.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
            expect(hierarchicalGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

            expect(GridFunctions.getColumnHeaders(fixture).length).toEqual(3);

            const firstRow = hierarchicalGrid.dataRowList.first;
            // the first row's cell should contain an expand indicator
            expect(HierarchicalGridFunctions.hasExpander(firstRow)).toBeTruthy();
            hierarchicalGrid.expandRow(firstRow.key);
            await fixture.whenStable();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];

            expect(childGrid.columns.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
            expect(childGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

            expect(GridFunctions.getColumnHeaders(fixture).length).toEqual(6);
        });

        it('should apply height correctly with and without filtering', async () => {
            let filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(600);

            hierarchicalGrid.height = '800px';
            await fixture.whenStable();
            fixture.detectChanges();
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(800);
            expect(filteringCells.length).toBe(3);

            hierarchicalGrid.allowFiltering = false;
            fixture.detectChanges();
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(800);
            filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toBe(0);
        });

        it('should recreate columns when data changes and autoGenerate is true', async () => {
            hierarchicalGrid.width = '500px';
            hierarchicalGrid.height = '500px';
            hierarchicalGrid.autoGenerate = true;
            fixture.detectChanges();

            const initialData = [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' }
            ];
            hierarchicalGrid.data = initialData;
            await fixture.whenStable();
            fixture.detectChanges();

            expect(hierarchicalGrid.columns.length).toBe(2);
            expect(hierarchicalGrid.columns[0].field).toBe('id');
            expect(hierarchicalGrid.columns[1].field).toBe('name');

            const newData = [
                { id: 1, firstName: 'John', lastName: 'Doe' },
                { id: 2, firstName: 'Jane', lastName: 'Smith' }
            ];
            hierarchicalGrid.data = newData;
            await fixture.whenStable();
            fixture.detectChanges();

            expect(hierarchicalGrid.columns.length).toBe(3);
            expect(hierarchicalGrid.columns[0].field).toBe('id');
            expect(hierarchicalGrid.columns[1].field).toBe('firstName');
            expect(hierarchicalGrid.columns[2].field).toBe('lastName');
        });
    });

    describe('Selection', () => {
        it('should allow only one cell to be selected in the whole hierarchical grid.', async () => {
            let firstRow = hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent;
            hierarchicalGrid.expandRow(firstRow.key);
            expect(firstRow.expanded).toBeTruthy();

            let fCell = firstRow.cells.toArray()[0];

            // select parent cell
            GridFunctions.focusCell(fixture, fCell);
            await wait(100);
            fixture.detectChanges();

            expect(fCell.selected).toBeTruthy();
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const fChildCell = childGrid.dataRowList.first.cells.first;

            // select child cell
            GridFunctions.focusCell(fixture, fChildCell);
            await wait(100);
            fixture.detectChanges();

            expect(fChildCell.selected).toBeTruthy();
            expect(fCell.selected).toBeFalsy();

            // select parent cell
            firstRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
            fCell = firstRow.cells.toArray()[0];
            GridFunctions.focusCell(fixture, fCell);
            await wait(100);
            fixture.detectChanges();
            expect(fChildCell.selected).toBeFalsy();
            expect(fCell.selected).toBeTruthy();
        });

        it('should not copy the previous row value from an expanded parent row', async () => {
            const singersFixture = TestBed.createComponent(IgxHierarchicalGridEmptyDataExportComponent);
            const singersData = SampleTestData.hierarchicalGridSingersFullData();
            (singersFixture.componentInstance as { data: unknown[] }).data = singersData;
            singersFixture.detectChanges();

            const grid = singersFixture.componentInstance.hGrid;

            const previousArtist = singersData[1].Artist;
            const targetArtist = singersData[2].Artist;
            const targetRow = grid.dataRowList.toArray()
                .find(row => row.data.Artist === targetArtist) as IgxHierarchicalRowComponent | undefined;

            expect(targetRow).toBeDefined();
            targetRow!.toggle();
            await wait(DEBOUNCE_TIME);
            singersFixture.detectChanges();

            grid.selectRange({
                rowStart: targetRow!.index,
                rowEnd: targetRow!.index,
                columnStart: 'Artist',
                columnEnd: 'Artist'
            });
            singersFixture.detectChanges();

            expect(targetRow!.expanded).toBeTruthy();

            const selectedData = grid.getSelectedData();
            expect(selectedData).toEqual([{ Artist: targetArtist }]);
            expect(selectedData[0].Artist).not.toBe(previousArtist);
        });
    });

    describe('Updating', () => {
        it(`should have separate instances of updating service for
        parent and children and the same for children of the same island`, async () => {
            const firstLayoutInstances: IgxHierarchicalGridComponent[] = [];
            hierarchicalGrid.childLayoutList.first.gridCreated.pipe(take(2)).subscribe((args) => {
                firstLayoutInstances.push(args.grid);
            });
            const dataRows = hierarchicalGrid.dataRowList.toArray();
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].key);
            await fixture.whenStable();
            fixture.detectChanges();
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].key);
            await fixture.whenStable();
            fixture.detectChanges();
            // test instances
            expect(firstLayoutInstances.length).toEqual(2);
            expect(hierarchicalGrid.transactions).not.toBe(firstLayoutInstances[0].transactions);
            expect(firstLayoutInstances[0].transactions).not.toBe(firstLayoutInstances[1].transactions);
        });

        it('should contain all transactions for a row island', async () => {
            const firstLayoutInstances: IgxHierarchicalGridComponent[] = [];
            hierarchicalGrid.childLayoutList.first.gridCreated.pipe(take(2)).subscribe((args) => {
                firstLayoutInstances.push(args.grid);
            });
            hierarchicalGrid.batchEditing = true;
            await fixture.whenStable();
            fixture.detectChanges();
            const dataRows = hierarchicalGrid.dataRowList.toArray();
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].key);
            await fixture.whenStable();
            fixture.detectChanges();
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].key);
            await fixture.whenStable();
            fixture.detectChanges();

            firstLayoutInstances[0].updateRow({ ProductName: 'Changed' }, '00');
            firstLayoutInstances[1].updateRow({ ProductName: 'Changed' }, '10');
            expect(hierarchicalGrid.transactions.getTransactionLog().length).toEqual(0);
            expect(firstLayoutInstances[0].transactions.getTransactionLog().length).toEqual(1);
            expect(fixture.componentInstance.rowIsland.transactions.getTransactionLog().length).toEqual(0);
        });

        it('should remove expand indicator for uncommitted added rows', async () => {
            hierarchicalGrid.batchEditing = true;
            fixture.detectChanges();
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            hierarchicalGrid.addRow({ ID: -1, ProductName: 'Name1' });
            fixture.detectChanges();
            const rows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            const lastRow = rows[rows.length - 1];
            expect(lastRow.query(By.css('igx-icon')).nativeElement.classList.contains('igx-icon--inactive')).toBe(true);
            hierarchicalGrid.transactions.commit(hierarchicalGrid.data);
            fixture.detectChanges();
            expect(lastRow.query(By.css('igx-icon')).nativeElement.classList.contains('igx-icon--inactive')).toBe(false);
        });

        it('should now allow expanding uncommitted added rows', async () => {
            /* using the API here assumes keyboard interactions to expand/collapse would also be blocked */
            hierarchicalGrid.batchEditing = true;
            fixture.detectChanges();
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            hierarchicalGrid.addRow({ ID: -1, ProductName: 'Name1' });
            fixture.detectChanges();

            const dataRows = hierarchicalGrid.dataRowList;
            hierarchicalGrid.expandRow(dataRows.last.key);
            let childRows = fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            expect(childRows.length).toEqual(0);

            hierarchicalGrid.transactions.commit(hierarchicalGrid.data);
            fixture.detectChanges();

            hierarchicalGrid.expandRow(dataRows.last.key);
            await fixture.whenStable();
            fixture.detectChanges();
            childRows = fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            expect(childRows.length).toEqual(1);
        });

        it('should revert changes when transactions are cleared for child grids', async () => {
            hierarchicalGrid.batchEditing = true;
            fixture.detectChanges();
            let childGrid;
            hierarchicalGrid.childLayoutList.first.gridCreated.pipe(take(1)).subscribe((args) => {
                childGrid = args.grid;
            });
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            childGrid.updateRow({ ProductName: 'Changed' }, '00');
            fixture.detectChanges();
            expect(childGrid.gridAPI.get_cell_by_index(0, 'ProductName').nativeElement.innerText).toEqual('Changed');
            childGrid.transactions.clear();
            fixture.detectChanges();
            expect(childGrid.gridAPI.get_cell_by_index(0, 'ProductName').nativeElement.innerText).toEqual('Product: A0');
        });

        it('should return correctly the rowData', () => {
            hierarchicalGrid.primaryKey = 'ID';
            fixture.detectChanges();

            const rowData = hierarchicalGrid.getRowByKey('2').data;
            expect(hierarchicalGrid.getRowData('2')).toEqual(rowData);

            hierarchicalGrid.sort({ fieldName: 'ChildLevels', dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            expect(hierarchicalGrid.getRowData('2')).toEqual(rowData);
            expect(hierarchicalGrid.getRowData('101')).toEqual({});

            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('startsWith'));
            fixture.detectChanges();

            expect(hierarchicalGrid.getRowData('2')).toEqual(rowData);
            expect(hierarchicalGrid.getRowData('101')).toEqual({});
        });

        it('should respect transaction service that is provided in the providers array', async () => {
            fixture = TestBed.createComponent(IgxHierarchicalGridWithTransactionProviderComponent);
            await fixture.whenStable();
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            expect(hierarchicalGrid.transactions.enabled).toBeTruthy();
            expect(hierarchicalGrid.batchEditing).toBeFalsy();
            let childGrid: IgxHierarchicalGridComponent;
            hierarchicalGrid.childLayoutList.first.gridCreated.pipe(take(1)).subscribe((args) => {
                childGrid = args.grid;
            });
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            expect(childGrid).toBeDefined();
            expect(childGrid.transactions.enabled).toBeTruthy();
            childGrid.updateRow({ ProductName: 'Changed' }, '00');
            expect(childGrid.transactions.getAggregatedChanges(false).length).toBe(1);
        });
    });

    describe('Sorting', () => {
        it('should display correct child data for expanded row after sorting.', async () => {
            /* this test doesn't need scrolling as it only cares about the child grid getting assigned to the correct parent */
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            hierarchicalGrid.sort({
                fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const firstChildCell = childGrid.dataRowList.first.cells.first;
            expect(hierarchicalGrid.gridAPI.get_row_by_index(3) instanceof IgxChildGridRowComponent).toBeTruthy();
            expect(childGrid.data).toBe(fixture.componentInstance.data[0]['childData']);
            expect(firstChildCell.value).toBe('00');
        });

        it('should allow sorting via headers in child grids', async () => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            // enable sorting
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            childGrid.columns[0].sortable = true;
            fixture.detectChanges();
            childGrid.cdr.detectChanges();

            const childHeader = GridFunctions.getColumnHeader('ID', fixture, childGrid);
            GridFunctions.clickHeaderSortIcon(childHeader);
            fixture.detectChanges();
            GridFunctions.clickHeaderSortIcon(childHeader);
            fixture.detectChanges();

            expect(childGrid.dataRowList.first.cells.first.value).toBe('09');
            const icon = GridFunctions.getHeaderSortIcon(childHeader);
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('arrow_downward');
            expect(childHeader.attributes['aria-sort']).toEqual('descending');
        });
    });

    describe('Filtering', () => {

        it('should enable filter-row for root and child grids', async () => {
            let filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toEqual(3);

            GridFunctions.clickFilterCellChipUI(fixture, 'ID');
            expect(document.querySelectorAll(FILTERING_ROW_CLASS).length).toEqual(1);

            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);

            filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toEqual(6);

            GridFunctions.clickFilterCellChipUI(fixture, 'ProductName', hierarchicalGrid.gridAPI.getChildGrids(false)[0]);
            expect(document.querySelectorAll(FILTERING_ROW_CLASS).length).toEqual(2);
        });

        it('should not lose child grid states after filtering in parent grid.', async () => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            await fixture.whenStable();
            fixture.detectChanges();
            let childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            let firstChildCell = childGrid.dataRowList.first.cells.first;
            UIInteractions.simulateClickAndSelectEvent(firstChildCell);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(firstChildCell.selected).toBe(true);

            // apply some filter
            hierarchicalGrid.filter('ID', '0', IgxStringFilteringOperand.instance().condition('contains'), true);

            expect(hierarchicalGrid.getRowByIndex(0).expanded).toBe(true);
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1) instanceof IgxChildGridRowComponent).toBeTruthy();

            childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            firstChildCell = childGrid.dataRowList.first.cells.first;
            expect(firstChildCell.selected).toBe(true);
        });

        it('should show empty filter message when there are no records matching the filter', async () => {
            fixture.componentInstance.data = [];
            fixture.detectChanges();

            const gridBody = fixture.debugElement.query(By.css('.igx-grid__tbody-content'));
            expect(gridBody.nativeElement.innerText).toMatch(hierarchicalGrid.emptyGridMessage);

            fixture.componentInstance.data = SampleTestData.generateHGridData(40, 3);
            fixture.detectChanges();

            hierarchicalGrid.filter('ID', '123450', IgxStringFilteringOperand.instance().condition('contains'), true);
            fixture.detectChanges();
            expect(gridBody.nativeElement.innerText).toMatch(hierarchicalGrid.emptyFilteredGridMessage);
        });

        it('should apply classes to the header when filter row is visible', async () => {
            hierarchicalGrid.rowSelection = GridSelectionMode.multiple;
            fixture.detectChanges();
            const headerExpander: HTMLElement = HierarchicalGridFunctions.getExpander(fixture);
            const headerCheckbox: HTMLElement = GridSelectionFunctions.getRowCheckboxDiv(fixture.nativeElement);

            expect(HierarchicalGridFunctions.isExpander(headerExpander, '--push')).toBeFalsy();
            expect(GridSelectionFunctions.isCheckbox(headerCheckbox, '--push')).toBeFalsy();

            // open filter row
            GridFunctions.clickFilterCellChipUI(fixture, 'ID');

            expect(HierarchicalGridFunctions.isExpander(headerExpander, '--push')).toBeTruthy();
            expect(GridSelectionFunctions.isCheckbox(headerCheckbox, '--push')).toBeTruthy();
        });
    });

    describe('Summaries', () => {
        const SUMMARIES_MARGIN_CLASS = '.igx-grid__summaries-patch';
        it('should allow defining summaries for child grid and child should be sized correctly.', async () => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;
            const expander = (childGrid.dataRowList.first as IgxHierarchicalRowComponent).expander;

            // Expect expansion cell to be rendered and sized the same as the expansion cell inside the grid
            const summaryRow = childGrid.summariesRowList.first.nativeElement;
            const summaryRowIndentation = summaryRow.querySelector<HTMLElement>(SUMMARIES_MARGIN_CLASS);
            expect(summaryRow.children.length).toEqual(2);
            expect(summaryRowIndentation.offsetWidth).toEqual(expander.nativeElement.offsetWidth);

            const gridHeight = childGrid.nativeElement.offsetHeight;
            const childElements: HTMLElement[] = Array.from(childGrid.nativeElement.children) as HTMLElement [];
            const elementsHeight = childElements
                // skip the loading outlet element as it is positioned absolute and doesn't take part in the height calculation of the grid
                .filter(elem => !elem.className.includes('igx-grid__loading-outlet'))
                .map(elem => elem.offsetHeight)
                .reduce((total, height) => total + height, 0);

            // Expect the combined height of all elements (header, body, footer etc) to equal the calculated height of the grid.
            expect(elementsHeight).toEqual(gridHeight);

            // expand first row of child
            childGrid.expandRow(childGrid.dataRowList.first.key);

            const grandChild = childGrid.gridAPI.getChildGrids(false)[0];
            const grandChildSummaryRow = grandChild.summariesRowList.first.nativeElement;
            const childSummaryRowIndentation = grandChildSummaryRow.querySelector(SUMMARIES_MARGIN_CLASS);

            expect(grandChildSummaryRow.children.length).toEqual(1);
            expect(childSummaryRowIndentation).toBeNull();
        });

        it('should size summaries with row selectors for parent and child grids correctly.', async () => {
            hierarchicalGrid.rowSelection = GridSelectionMode.multiple;
            fixture.detectChanges();
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const rootExpander = (hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent).expander;
            const rootCheckbox = hierarchicalGrid.headerSelectorContainer;
            const rootSummaryRow = hierarchicalGrid.summariesRowList.first.nativeElement;
            const rootSummaryIndentation = rootSummaryRow.querySelector<HTMLElement>(SUMMARIES_MARGIN_CLASS);

            expect(rootSummaryRow.children.length).toEqual(2);
            expect(rootSummaryIndentation.offsetWidth)
                .toEqual(rootExpander.nativeElement.offsetWidth + rootCheckbox.nativeElement.offsetWidth);

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const expander = childGrid.dataRowList.first.expander;

            // Expect expansion cell to be rendered and sized the same as the expansion cell inside the grid
            const summaryRow = childGrid.summariesRowList.first.nativeElement;
            const childSummaryIndentation = summaryRow.querySelector<HTMLElement>(SUMMARIES_MARGIN_CLASS);

            expect(summaryRow.children.length).toEqual(2);
            expect(childSummaryIndentation.offsetWidth).toEqual(expander.nativeElement.offsetWidth);
        });

        it('should size summaries for parent and child grids correctly when grid size is changed and summaryRowHeight is set to falsy value', () => {
            setElementSize(hierarchicalGrid.nativeElement, ɵSize.Large);
            fixture.detectChanges();

            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            hierarchicalGrid.summaryRowHeight = 0;
            fixture.detectChanges();

            let childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            let tFoot = hierarchicalGrid.nativeElement.querySelector('.igx-grid__tfoot');
            let childTFoot = childGrid.nativeElement.querySelector('.igx-grid__tfoot');

            expect(tFoot.getBoundingClientRect().height).toBe(hierarchicalGrid.defaultSummaryHeight);
            expect(childTFoot.getBoundingClientRect().height).toBe(hierarchicalGrid.defaultSummaryHeight);


            setElementSize(hierarchicalGrid.nativeElement, ɵSize.Medium);
            hierarchicalGrid.summaryRowHeight = 0;
            childGrid.summaryRowHeight = 0;
            fixture.detectChanges();

            childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            tFoot = hierarchicalGrid.nativeElement.querySelectorAll('.igx-grid__tfoot')[1];
            childTFoot = childGrid.nativeElement.querySelector('.igx-grid__tfoot');

            expect(tFoot.getBoundingClientRect().height).toBe(hierarchicalGrid.defaultSummaryHeight);
            expect(childTFoot.getBoundingClientRect().height).toBe(hierarchicalGrid.defaultSummaryHeight);

            setElementSize(hierarchicalGrid.nativeElement, ɵSize.Small);
            hierarchicalGrid.summaryRowHeight = 0;
            childGrid.summaryRowHeight = 0;
            fixture.detectChanges();

            childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            tFoot = hierarchicalGrid.nativeElement.querySelectorAll('.igx-grid__tfoot')[1];
            childTFoot = childGrid.nativeElement.querySelector('.igx-grid__tfoot');

            expect(tFoot.getBoundingClientRect().height).toBe(hierarchicalGrid.defaultSummaryHeight);
            expect(childTFoot.getBoundingClientRect().height).toBe(hierarchicalGrid.defaultSummaryHeight);
        });

        it('should render summaries for column inside a column group.', async () => {
            const count = fixture.componentInstance.rowIsland.columns.length - 1;
            fixture.componentInstance.rowIsland.columns[0].hasSummary = false;
            fixture.componentInstance.rowIsland.columns[count].hasSummary = true;
            fixture.detectChanges();

            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];

            const summaryRow = childGrid.summariesRowList.first;
            expect(summaryRow.nativeElement.children.length).toEqual(2);
            expect(summaryRow.summaryCells.length).toEqual(3);
        });
    });

    describe('Paging', () => {
        it('should page the data records and update the paging state of the grid.', () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();

            hierarchicalGrid.page = 1;
            fixture.detectChanges();

            expect(hierarchicalGrid.dataView.length).toBe(15);
            expect(hierarchicalGrid.dataView[0].ID).toBe('15');
            expect(hierarchicalGrid.pagingState.index).toBe(1);
            expect(hierarchicalGrid.pagingState.recordsPerPage).toBe(15);
            expect(hierarchicalGrid.pagingState.metadata.countRecords).toBe(fixture.componentInstance.data.length);
        });

        it('should not page the data when paging is disabled or the paging mode is remote.', () => {
            const dataLength = fixture.componentInstance.data.length;
            expect(hierarchicalGrid.dataView.length).toBe(dataLength);

            fixture.componentInstance.paging = true;
            hierarchicalGrid.pagingMode = 'remote';
            fixture.detectChanges();

            expect(hierarchicalGrid.dataView.length).toBe(dataLength);
        });

        it('should use the totalRecords of the grid for the paging state when it is set.', () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();

            hierarchicalGrid.totalRecords = 100;
            fixture.detectChanges();

            expect(hierarchicalGrid.dataView.length).toBe(15);
            expect(hierarchicalGrid.pagingState.metadata.countRecords).toBe(100);
            expect(hierarchicalGrid.pagingState.metadata.countPages).toBe(7);
        });

        it('should work on data records only when paging is enabled and should not be affected by child grid rows.', async () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            hierarchicalGrid.notifyChanges();
            fixture.detectChanges();

            expect(hierarchicalGrid.dataView.length).toEqual(15);

            const dataRows = hierarchicalGrid.dataRowList.toArray();

            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].key);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(hierarchicalGrid.dataView.length).toEqual(16);

            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].key);
            await fixture.whenStable();
            fixture.detectChanges();

            expect(hierarchicalGrid.dataView.length).toEqual(17);
            expect(hierarchicalGrid.dataView.pop().ID).toEqual('14');
        });

        it('should preserve expansion states after changing pages.', async () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();

            let dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].key);
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].key);

            expect(dataRows[0].expanded).toBeTruthy();
            expect(dataRows[1].expanded).toBeTruthy();
            expect(hierarchicalGrid.dataView.length).toEqual(17);

            let childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);
            expect(childGrids.length).toEqual(2);
            expect(childGrids[0].dataRowList.first.cells.first.value).toEqual('00');

            // Go to next page
            GridFunctions.navigateToNextPage(hierarchicalGrid.nativeElement);
            fixture.detectChanges();

            dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            expect(dataRows[0].cells.first.value).toEqual('15');
            expect(dataRows[0].expanded).toBeFalsy();
            expect(dataRows[1].expanded).toBeFalsy();
            expect(hierarchicalGrid.dataView.length).toEqual(15);

            childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);

            // Return to previous page
            GridFunctions.navigateToPrevPage(hierarchicalGrid.nativeElement);
            fixture.detectChanges();

            dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            expect(dataRows[0].cells.first.value).toEqual('0');
            expect(dataRows[0].expanded).toBeTruthy();
            expect(dataRows[1].expanded).toBeTruthy();
            expect(hierarchicalGrid.dataView.length).toEqual(17);

            childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);
            expect(childGrids[0].dataRowList.first.cells.first.value).toEqual('00');
        });

        it('should allow scrolling to the last row after page size has been changed and rows are expanded.', async () => {
            /* it's better to avoid scrolling and only check for scrollbar availability */
            /* scrollbar doesn't update its visibility in fakeAsync tests */
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            hierarchicalGrid.perPage = 20;
            hierarchicalGrid.height = '800px';
            fixture.componentInstance.rowIsland.height = '200px';
            await fixture.whenStable();
            fixture.detectChanges();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();

            hierarchicalGrid.perPage = 5;
            await fixture.whenStable();
            fixture.detectChanges();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();

            const dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];

            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].key);
            await fixture.whenStable();
            fixture.detectChanges();

            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1) instanceof IgxChildGridRowComponent).toBeTruthy();

            // expand 3rd row
            hierarchicalGrid.expandRow(dataRows[3].key);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(hierarchicalGrid.gridAPI.get_row_by_index(4) instanceof IgxChildGridRowComponent).toBeTruthy();
        });

        it('should correctly hide/show vertical scrollbar after page is changed.', async () => {
            /* scrollbar doesn't update its visibility in fakeAsync tests */
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            hierarchicalGrid.perPage = 5;
            fixture.detectChanges();

            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();

            // expand 1st row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            await wait(DEBOUNCE_TIME);

            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();

            // change page
            hierarchicalGrid.page = 1;
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();

            // change page
            hierarchicalGrid.page = 0;
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME * 2);

            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();
        });

        it('should be displayed correctly when using the template input', async () => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestInputPaginatorComponent);
            await fixture.whenStable();
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;

            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            await fixture.whenStable();
            fixture.detectChanges();

            const paginators = fixture.debugElement.queryAll(By.css('igx-paginator'));
            expect(paginators[0].query(By.css('button')).nativeElement.innerText.trim()).toEqual('childData1 Button');
            expect(paginators[1].query(By.css('button')).nativeElement.innerText.trim()).toEqual('childData2 Button');
        });
    });

    describe('Hiding', () => {
        it('should leave no feature UI elements when all columns are hidden', async () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            hierarchicalGrid.rowSelection = GridSelectionMode.multiple;
            hierarchicalGrid.rowDraggable = true;
            await fixture.whenStable();
            fixture.detectChanges();

            let headers = GridFunctions.getColumnHeaders(fixture);
            let gridRows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            const paging = GridFunctions.getGridPaginator(fixture);
            let rowSelectors = GridSelectionFunctions.getCheckboxes(fixture);
            let dragIndicators = GridFunctions.getDragIndicators(fixture);
            let expander = HierarchicalGridFunctions.getExpander(fixture, '[hidden]');

            expect(headers.length).toBeGreaterThan(0);
            expect(gridRows.length).toBeGreaterThan(0);
            expect(paging).not.toBeNull();
            expect(rowSelectors.length).toBeGreaterThan(0);
            expect(dragIndicators.length).toBeGreaterThan(0);
            // this check executes correctly on Ivy only
            // expect(Object.keys(expanders[0].attributes)).not.toContain('hidden');
            expect(expander).toBeNull();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();

            hierarchicalGrid.columnList.forEach((col) => col.hidden = true);
            await fixture.whenStable();
            fixture.detectChanges();

            headers = GridFunctions.getColumnHeaders(fixture);
            gridRows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            rowSelectors = GridSelectionFunctions.getCheckboxes(fixture);
            dragIndicators = GridFunctions.getDragIndicators(fixture);
            expander = HierarchicalGridFunctions.getExpander(fixture, '[hidden]');

            expect(headers.length).toBe(0);
            expect(gridRows.length).toBe(0);
            expect(rowSelectors.length).toBe(0);
            expect(dragIndicators.length).toBe(0);
            // this check executes correctly on Ivy only
            // expect(Object.keys(expanders[0].attributes)).toContain('hidden');
            expect(expander).not.toBeNull();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();
        });
    });

    describe('Toolbar', () => {
        it('should be displayed correctly for child layout and hiding should apply to the correct child.', async () => {
            fixture = TestBed.createComponent(IgxHierarchicalGridChildToolbarActionsComponent);
            fixture.detectChanges();
            await fixture.whenStable();
            hierarchicalGrid = fixture.componentInstance.hgrid;

            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            // The row island toolbar is rendered only for the child grid, the root grid declares none.
            const toolbars = fixture.debugElement.queryAll(By.directive(IgxGridToolbarComponent));
            expect(toolbars.length).toBe(1);
            expect(toolbars[0].componentInstance.grid).toBe(childGrid);
            expect(childGrid.nativeElement.contains(toolbars[0].nativeElement)).toBe(true);

            const hidingDebugEl = toolbars[0].query(By.directive(IgxGridToolbarHidingComponent));
            expect(hidingDebugEl).not.toBeNull();
            const hidingAction = hidingDebugEl.componentInstance as IgxGridToolbarHidingComponent;
            expect(hidingAction.grid).toBe(childGrid);

            // ID, the Information group and its ChildLevels and ProductName children
            expect(childGrid.visibleColumns.length).toEqual(4);
            expect(childGrid.hiddenColumnsCount).toBe(0);

            const opened = firstValueFrom(hidingAction.opened);
            (hidingDebugEl.nativeElement as HTMLElement).querySelector('button').click();
            await opened;
            fixture.detectChanges();

            // The hiding UI lists the columns of the child grid.
            const columnChooserElement = hidingDebugEl.query(By.directive(IgxColumnHidingDirective));
            expect((columnChooserElement.componentInstance as IgxColumnActionsComponent).grid).toBe(childGrid);
            expect(GridFunctions.getColumnActionsColumnList(columnChooserElement))
                .toEqual(['ID', 'Information', 'ChildLevels', 'ProductName']);

            const toggleSpy = vi.spyOn(hidingAction.columnToggle, 'emit');
            (GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ProductName').nativeElement as HTMLElement).click();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            // And it should hide the column of the child grid only.
            expect(toggleSpy).toHaveBeenCalledExactlyOnceWith({ column: childGrid.getColumnByName('ProductName'), checked: false });
            expect(childGrid.getColumnByName('ProductName').hidden).toBe(true);
            expect(childGrid.visibleColumns.length).toEqual(3);
            expect(childGrid.hiddenColumnsCount).toBe(1);
            expect(childGrid.headerCellList.map(h => h.column.field)).toEqual(['ID', 'ChildLevels']);
            expect(hierarchicalGrid.getColumnByName('ProductName').hidden).toBe(false);
            expect(hierarchicalGrid.visibleColumns.length).toEqual(4);
            expect(hierarchicalGrid.hiddenColumnsCount).toBe(0);
        });

        it('should be displayed correctly for child layout and pinning should apply to the correct child.', async () => {
            fixture = TestBed.createComponent(IgxHierarchicalGridChildToolbarActionsComponent);
            fixture.detectChanges();
            await fixture.whenStable();
            hierarchicalGrid = fixture.componentInstance.hgrid;

            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const toolbar = fixture.debugElement.query(By.directive(IgxGridToolbarComponent));
            expect(toolbar.componentInstance.grid).toBe(childGrid);

            // Check if visible columns and headers are rendered correctly
            expect(childGrid.visibleColumns.length).toEqual(4);
            expect(childGrid.pinnedColumns.length).toBe(0);

            // Check if pinning button & dropdown are init
            const pinningDebugEl = toolbar.query(By.directive(IgxGridToolbarPinningComponent));
            expect(pinningDebugEl).not.toBeNull();
            const pinningAction = pinningDebugEl.componentInstance as IgxGridToolbarPinningComponent;
            expect(pinningAction.grid).toBe(childGrid);

            const opened = firstValueFrom(pinningAction.opened);
            (pinningDebugEl.nativeElement as HTMLElement).querySelector('button').click();
            await opened;
            fixture.detectChanges();

            // Check if the child grid columns are the ones used by the pinning UI
            const columnPinningElement = pinningDebugEl.query(By.directive(IgxColumnPinningDirective));
            expect((columnPinningElement.componentInstance as IgxColumnActionsComponent).grid).toBe(childGrid);
            // Only top level columns can be pinned
            expect(GridFunctions.getColumnActionsColumnList(columnPinningElement)).toEqual(['ID', 'Information']);

            // Pin the Information column group
            const toggleSpy = vi.spyOn(pinningAction.columnToggle, 'emit');
            (GridFunctions.getColumnChooserItemElement(columnPinningElement, 'Information').nativeElement as HTMLElement).click();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            // Check pinned state
            const groupColumn = childGrid.columns.find(c => c.columnGroup);
            expect(toggleSpy).toHaveBeenCalledExactlyOnceWith({ column: groupColumn, checked: true });
            expect(groupColumn.pinned).toBe(true);
            expect(childGrid.getColumnByName('ChildLevels').pinned).toBe(true);
            expect(childGrid.getColumnByName('ProductName').pinned).toBe(true);
            expect(childGrid.getColumnByName('ID').pinned).toBe(false);
            expect(childGrid.pinnedColumns.filter(c => !c.columnGroup).map(c => c.field)).toEqual(['ChildLevels', 'ProductName']);
            expect(childGrid.unpinnedColumns.map(c => c.field)).toEqual(['ID']);
            expect(childGrid.getColumnByName('ChildLevels').headerGroup.nativeElement.classList.contains(HEADER_PINNED_CLASS)).toBe(true);
            expect(childGrid.getColumnByName('ID').headerGroup.nativeElement.classList.contains(HEADER_PINNED_CLASS)).toBe(false);

            // The root grid is not affected.
            expect(hierarchicalGrid.pinnedColumns.length).toBe(0);
            expect(hierarchicalGrid.getColumnByName('ChildLevels').pinned).toBe(false);
        });

        it('should read from custom templates per level', async () => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestCustomToolbarComponent);
            await fixture.whenStable();
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            await fixture.whenStable();
            fixture.detectChanges();

            const toolbars = fixture.debugElement.queryAll(By.css('igx-grid-toolbar'));
            expect(toolbars.length).toEqual(3);
            expect(toolbars[0].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Parent Button');
            expect(toolbars[1].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Child 1 Button');
            expect(toolbars[2].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Child2 Button');

            // Each toolbar is rendered for the grid of its own level.
            const childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);
            const toolbarOwners = toolbars.map(t => (t.componentInstance as IgxGridToolbarComponent).grid);
            expect(toolbarOwners[0]).toBe(hierarchicalGrid);
            expect(toolbarOwners[1]).toBe(childGrids.find(g => g.parentIsland.key === 'childData1'));
            expect(toolbarOwners[2]).toBe(childGrids.find(g => g.parentIsland.key === 'childData2'));
            expect(toolbarOwners[1].nativeElement.contains(toolbars[1].nativeElement)).toBe(true);
            expect(toolbarOwners[2].nativeElement.contains(toolbars[2].nativeElement)).toBe(true);
        });

        it('should have same width as the grid whole width', async () => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestCustomToolbarComponent);
            await fixture.whenStable();
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;

            const toolbar = fixture.debugElement.query(By.css('igx-grid-toolbar'));
            expect(toolbar.nativeElement.offsetWidth).toEqual(hierarchicalGrid.nativeElement.offsetWidth);
        });

        it('should be displayed correctly when using the template input', async () => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestInputToolbarComponent);
            await fixture.whenStable();
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;

            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            await fixture.whenStable();
            fixture.detectChanges();

            const toolbars = fixture.debugElement.queryAll(By.css('igx-grid-toolbar'));
            expect(toolbars[1].query(By.css('button')).nativeElement.innerText.trim()).toEqual('childData1 Button');
            expect(toolbars[2].query(By.css('button')).nativeElement.innerText.trim()).toEqual('childData2 Button');
        });
    });

    describe('Moving', () => {

        it('should not be possible to drag move a column from another grid.', async () => {
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            // Enable moving in the child grid as well, so the only restriction is that the target belongs to another grid.
            childGrid.moving = true;
            fixture.detectChanges();
            expect(hierarchicalGrid.moving).toBe(true);
            const rootColumnsOrder = hierarchicalGrid.columns.map(c => c.header || c.field);
            const childColumnsOrder = childGrid.columns.map(c => c.header || c.field);
            const rootMovingEndSpy = vi.spyOn(hierarchicalGrid.columnMovingEnd, 'emit');
            const childMovingEndSpy = vi.spyOn(childGrid.columnMovingEnd, 'emit');

            const center = (element: HTMLElement) => {
                const rect = element.getBoundingClientRect();
                return { x: rect.left + window.scrollX + rect.width / 2, y: rect.top + window.scrollY + rect.height / 2 };
            };
            const childHeaderDebugEl = fixture.debugElement.queryAll(By.directive(IgxColumnMovingDragDirective))
                .find(de => de.injector.get(IgxColumnMovingDragDirective).column === childGrid.getColumnByName('ID'));
            const dragDirective = childHeaderDebugEl.injector.get(IgxColumnMovingDragDirective);
            const childHeader = childHeaderDebugEl.nativeElement as HTMLElement;
            // Valid target: the column group of the child grid on the same level
            const childGroupHeader = childGrid.columns.find(c => c.columnGroup).headerGroup.nativeElement
                .querySelector('[droppable]') as HTMLElement;
            // Invalid target: the ID column of the root grid
            const rootHeader = hierarchicalGrid.getColumnByName('ID').headerCell.nativeElement as HTMLElement;
            expect(childGrid.nativeElement.contains(rootHeader)).toBe(false);

            const start = center(childHeader);
            const childTarget = center(childGroupHeader);
            const rootTarget = center(rootHeader);

            UIInteractions.simulatePointerEvent('pointerdown', childHeader, start.x, start.y);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', childHeader, start.x + 10, start.y);
            await wait(50);
            fixture.detectChanges();
            expect(dragDirective.ghostElement).toBeTruthy();

            // Dragging over a column of the same grid shows that the column can be dropped there.
            UIInteractions.simulatePointerEvent('pointermove', childHeader, childTarget.x, childTarget.y);
            await wait(50);
            fixture.detectChanges();
            expect(dragDirective.icon.innerText.trim()).not.toEqual('block');

            // The moving indicator shouldn't show that a column can be moved to another grid.
            UIInteractions.simulatePointerEvent('pointermove', childHeader, rootTarget.x, rootTarget.y);
            await wait(50);
            fixture.detectChanges();
            expect(dragDirective.icon.innerText.trim()).toEqual('block');

            UIInteractions.simulatePointerEvent('pointerup', childHeader, rootTarget.x, rootTarget.y);
            await wait();
            fixture.detectChanges();

            expect(dragDirective.ghostElement).toBeFalsy();
            expect(rootMovingEndSpy).not.toHaveBeenCalled();
            expect(childMovingEndSpy).not.toHaveBeenCalled();
            // No column was added to the root grid or removed from the child grid.
            expect(hierarchicalGrid.columns.length).toEqual(4);
            expect(childGrid.columns.length).toEqual(4);
            expect(hierarchicalGrid.columns.map(c => c.header || c.field)).toEqual(rootColumnsOrder);
            expect(childGrid.columns.map(c => c.header || c.field)).toEqual(childColumnsOrder);
            expect(hierarchicalGrid.getColumnByName('ID').grid).toBe(hierarchicalGrid);
            expect(childGrid.getColumnByName('ID').grid).toBe(childGrid);
        });
    });

    describe('Pinning', () => {
        it('should be possible by templating the header and getting column reference for child grid', async () => {
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            let childHeader = GridFunctions.getColumnHeaders(fixture)[3];
            const firstHeaderIcon = childHeader.query(By.css('.igx-icon'));

            expect(GridFunctions.isHeaderPinned(childHeader.parent)).toBeFalsy();
            expect(childGrid.columns[0].pinned).toBeFalsy();
            expect(firstHeaderIcon).toBeDefined();

            UIInteractions.simulateClickAndSelectEvent(firstHeaderIcon);
            fixture.detectChanges();
            await fixture.whenStable();

            childHeader = GridFunctions.getColumnHeaders(fixture)[3];
            expect(childGrid.columns[0].pinned).toBeTruthy();
            expect(GridFunctions.isHeaderPinned(childHeader.parent)).toBeTruthy();
        });

        it('should be applied correctly for child grid with multi-column header.', async () => {
            fixture.componentInstance.rowIsland.columnList.find(x => x.header === 'Information').pinned = true;
            await fixture.whenStable();
            fixture.detectChanges();

            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            await fixture.whenStable();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            // check unpinned/pinned columns
            expect(childGrid.pinnedColumns.length).toBe(3);
            expect(childGrid.unpinnedColumns.length).toBe(1);
            // check cells
            expect(childGrid.gridAPI.get_row_by_index(0).cells.length).toBe(3);
            let cell = childGrid.gridAPI.get_cell_by_index(0, 'ChildLevels');
            expect(cell.visibleColumnIndex).toEqual(0);
            expect(GridFunctions.isCellPinned(cell)).toBeTruthy();
            cell = childGrid.gridAPI.get_cell_by_index(0, 'ProductName');
            expect(cell.visibleColumnIndex).toEqual(1);
            expect(GridFunctions.isCellPinned(cell)).toBeTruthy();
            cell = childGrid.gridAPI.get_cell_by_index(0, 'ID');
            expect(cell.visibleColumnIndex).toEqual(2);
            expect(GridFunctions.isCellPinned(cell)).toBeFalsy();
        });

        it('should be applied correctly even on the right side', async () => {
            hierarchicalGrid = fixture.componentInstance.hgrid;
            hierarchicalGrid.columnList.find(x => x.field === 'ID').pinned = true;
            hierarchicalGrid.pinning.columns = 1;
            hierarchicalGrid.cdr.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            const rightMostGridPart = hierarchicalGrid.nativeElement.getBoundingClientRect().right;
            const leftMostGridPart = hierarchicalGrid.nativeElement.getBoundingClientRect().left;
            const leftMostRightPinnedCellsPart = hierarchicalGrid.gridAPI.get_cell_by_index(0, 'ID')
                .nativeElement.getBoundingClientRect().left;
            const pinnedCellWidth = hierarchicalGrid.getCellByColumn(0, 'ID').width;
            // Expects that right pinning has been in action
            expect(leftMostGridPart).not.toEqual(leftMostRightPinnedCellsPart);
            // Expects that pinned column is in the visible grid's area
            expect(leftMostRightPinnedCellsPart).toBeLessThan(rightMostGridPart);
            // Expects that the whole pinned column is visible
            expect(leftMostRightPinnedCellsPart + Number.parseInt(pinnedCellWidth, 10)).toBeLessThan(rightMostGridPart);
        });
    });

    describe('Row Pinning', () => {
        const FIXED_ROW_CONTAINER = '.igx-grid__tr--pinned';
        const FIXED_ROW_CONTAINER_TOP = 'igx-grid__tr--pinned-top';
        const FIXED_ROW_CONTAINER_BOTTOM = 'igx-grid__tr--pinned-bottom';

        beforeEach(() => {
            hierarchicalGrid.width = '800px';
            hierarchicalGrid.height = '500px';
            fixture.detectChanges();
        });

        it('should pin rows to top ', () => {
            hierarchicalGrid.pinRow('0');
            expect(hierarchicalGrid.pinnedRows.length).toBe(1);

            hierarchicalGrid.unpinRow('0');
            expect(hierarchicalGrid.pinnedRows.length).toBe(0);

            hierarchicalGrid.pinRow('0');
            expect(hierarchicalGrid.pinnedRows.length).toBe(1);

            let pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].nativeElement.classList.contains(FIXED_ROW_CONTAINER_TOP)).toBeTruthy();
            expect(pinRowContainer[0].nativeElement.classList.contains(FIXED_ROW_CONTAINER_BOTTOM)).toBeFalsy();

            expect(pinRowContainer[0].children[0].context.key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(3).key).toBe('2');

            hierarchicalGrid.pinRow('2');

            pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);

            expect(pinRowContainer[0].children[0].context.key).toBe('0');
            expect(pinRowContainer[0].children[1].context.key).toBe('2');
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(3).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(4).key).toBe('2');

            fixture.detectChanges();
            expect(hierarchicalGrid.pinnedRowHeight).toBe(2 * hierarchicalGrid.renderedRowHeight + 2);
            const expectedHeight = parseInt(hierarchicalGrid.height, 10) -
                hierarchicalGrid.pinnedRowHeight - 18 - hierarchicalGrid.theadRow.nativeElement.offsetHeight;
            expect(hierarchicalGrid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should pin rows to bottom', () => {
            fixture.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fixture.detectChanges();

            // Pin 2nd row
            hierarchicalGrid.pinRow('1');
            fixture.detectChanges();

            expect(hierarchicalGrid.pinnedRows.length).toBe(1);
            let pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].nativeElement.classList.contains(FIXED_ROW_CONTAINER_TOP)).toBeFalsy();
            expect(pinRowContainer[0].nativeElement.classList.contains(FIXED_ROW_CONTAINER_BOTTOM)).toBeTruthy();

            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.key).toBe('1');
            expect(pinRowContainer[0].children[0].context.index).toBe(fixture.componentInstance.data.length);
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(hierarchicalGrid.gridAPI.get_row_by_index(fixture.componentInstance.data.length).nativeElement);

            expect(hierarchicalGrid.getRowByIndex(0).key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('2');

            // Pin 1st row
            hierarchicalGrid.pinRow('0');
            fixture.detectChanges();

            pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.key).toBe('1');
            expect(pinRowContainer[0].children[1].context.key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(0).key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('2');

            fixture.detectChanges();
            // Check last pinned is fully in view
            const last = pinRowContainer[0].children[1].context.nativeElement;
            expect(last.getBoundingClientRect().bottom - hierarchicalGrid.tbody.nativeElement.getBoundingClientRect().bottom).toBe(0);

            // 2 records pinned + 2px border
            expect(hierarchicalGrid.pinnedRowHeight).toBe(2 * hierarchicalGrid.renderedRowHeight + 2);
            const expectedHeight = parseInt(hierarchicalGrid.height, 10) -
                hierarchicalGrid.pinnedRowHeight - 18 - hierarchicalGrid.theadRow.nativeElement.offsetHeight;
            expect(hierarchicalGrid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should search in both pinned and unpinned rows.', () => {
            let findCount = hierarchicalGrid.findNext('Product: A0');
            fixture.detectChanges();

            let spans = fixture.debugElement.queryAll(By.css('.igx-highlight'));
            expect(spans.length).toBe(1);
            expect(findCount).toEqual(1);

            // Pin 1st row
            hierarchicalGrid.pinRow('0');
            fixture.detectChanges();
            expect(hierarchicalGrid.pinnedRows.find(r => r.key === '0')).toBeDefined();

            findCount = hierarchicalGrid.findNext('Product: A0');
            fixture.detectChanges();

            spans = fixture.debugElement.queryAll(By.css('.igx-highlight'));
            expect(spans.length).toBe(2);
            expect(findCount).toEqual(2);
        });

        it('should apply filtering to both pinned and unpinned rows.', () => {
            hierarchicalGrid.pinRow('1');
            fixture.detectChanges();
            hierarchicalGrid.pinRow('5');
            fixture.detectChanges();

            let pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.key).toBe('1');
            expect(pinRowContainer[0].children[1].context.key).toBe('5');

            hierarchicalGrid.filter('ID', '5', IgxStringFilteringOperand.instance().condition('contains'), false);
            fixture.detectChanges();

            const allRows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.key).toBe('5');
            expect(allRows[1].componentInstance.key).toEqual('5');
        });

        it('should render paging with correct data and rows be correctly paged.', () => {
            hierarchicalGrid.height = '700px';
            fixture.detectChanges();
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            hierarchicalGrid.perPage = 5;
            fixture.detectChanges();


            let rows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            const paginator = fixture.debugElement.query(By.directive(IgxPaginatorComponent));
            expect(rows.length).toEqual(5);
            expect(paginator.componentInstance.perPage).toEqual(5);
            expect(paginator.componentInstance.totalPages).toEqual(8);

            hierarchicalGrid.pinRow('1');
            fixture.detectChanges();

            rows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            expect(rows.length).toEqual(6);
            expect(paginator.componentInstance.perPage).toEqual(5);
            expect(paginator.componentInstance.totalPages).toEqual(8);

            hierarchicalGrid.pinRow('3');
            fixture.detectChanges();

            rows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            expect(rows.length).toEqual(7);
            expect(paginator.componentInstance.perPage).toEqual(5);
            expect(paginator.componentInstance.totalPages).toEqual(8);
        });

        it('should apply sorting to both pinned and unpinned rows.', () => {
            hierarchicalGrid.pinRow('1');
            hierarchicalGrid.pinRow('3');
            fixture.detectChanges();

            expect(hierarchicalGrid.getRowByIndex(0).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('3');

            hierarchicalGrid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();

            // check pinned rows data is sorted
            expect(hierarchicalGrid.getRowByIndex(0).key).toBe('3');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('1');

            // check unpinned rows data is sorted
            // Expect 9 since it is a string.
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('9');
        });

        it('should return pinned rows as well on multiple cell selection in both pinned and unpinned areas', async () => {
            hierarchicalGrid.pinRow('1');
            fixture.detectChanges();

            let range = { rowStart: 0, rowEnd: 2, columnStart: 'ID', columnEnd: 'ChildLevels' };
            hierarchicalGrid.selectRange(range);
            fixture.detectChanges();

            let selectedData = hierarchicalGrid.getSelectedData();
            expect(selectedData).toEqual([{ ID: '1', ChildLevels: 3 }, { ID: '0', ChildLevels: 3 }, { ID: '1', ChildLevels: 3 }]);

            fixture.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fixture.detectChanges();

            hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop = 5000;
            await wait();

            range = { rowStart: 38, rowEnd: 40, columnStart: 'ID', columnEnd: 'ChildLevels' };
            hierarchicalGrid.clearCellSelection();
            hierarchicalGrid.selectRange(range);
            fixture.detectChanges();

            selectedData = hierarchicalGrid.getSelectedData();
            expect(selectedData).toEqual([{ ID: '38', ChildLevels: 3 }, { ID: '39', ChildLevels: 3 }, { ID: '1', ChildLevels: 3 }]);
        });

        it('should return correct filterData collection after filtering.', () => {
            hierarchicalGrid.pinRow('1');
            hierarchicalGrid.pinRow('11');
            fixture.detectChanges();

            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('contains'), false);
            fixture.detectChanges();

            let gridFilterData = hierarchicalGrid.filteredData;
            expect(gridFilterData.length).toBe(15);
            expect(gridFilterData[0].ID).toBe('1');
            expect(gridFilterData[1].ID).toBe('11');
            expect(gridFilterData[2].ID).toBe('1');

            fixture.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fixture.detectChanges();

            gridFilterData = hierarchicalGrid.filteredData;
            expect(gridFilterData.length).toBe(15);
            expect(gridFilterData[0].ID).toBe('1');
            expect(gridFilterData[1].ID).toBe('11');
            expect(gridFilterData[2].ID).toBe('1');
        });

        it('should correctly apply paging state for grid and paginator when there are pinned rows.', async () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            hierarchicalGrid.perPage = 5;
            hierarchicalGrid.height = '700px';
            fixture.detectChanges();
            const paginator = fixture.debugElement.query(By.directive(IgxPaginatorComponent)).componentInstance;
            // pin the first row
            hierarchicalGrid.getRowByIndex(0).pin();

            expect(hierarchicalGrid.rowList.length).toEqual(6);
            expect(hierarchicalGrid.perPage).toEqual(5);
            expect(paginator.perPage).toEqual(5);
            expect(paginator.totalRecords).toEqual(40);
            expect(paginator.totalPages).toEqual(8);

            // pin the second row
            hierarchicalGrid.getRowByIndex(2).pin();

            expect(hierarchicalGrid.rowList.length).toEqual(7);
            expect(hierarchicalGrid.perPage).toEqual(5);
            expect(paginator.perPage).toEqual(5);
            expect(paginator.totalRecords).toEqual(40);
            expect(paginator.totalPages).toEqual(8);

            // expand the first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.key);
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(hierarchicalGrid.rowList.length).toEqual(8);
            expect(hierarchicalGrid.perPage).toEqual(5);
            expect(paginator.perPage).toEqual(5);
            expect(paginator.totalRecords).toEqual(40);
            expect(paginator.totalPages).toEqual(8);

            expect(hierarchicalGrid.rowList.toArray()[1] instanceof IgxChildGridRowComponent).toBeFalsy();
            expect(hierarchicalGrid.rowList.toArray()[3] instanceof IgxChildGridRowComponent).toBeTruthy();
        });

        it('should have the correct records shown for pages with pinned rows', () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            hierarchicalGrid.perPage = 6;
            hierarchicalGrid.height = '700px';
            fixture.detectChanges();
            hierarchicalGrid.getRowByIndex(0).pin();

            let rows = hierarchicalGrid.rowList.toArray();

            [0, 0, 1, 2, 3, 4, 5].forEach((x, index) => expect(parseInt(rows[index].cells.first.value, 10)).toEqual(x));

            hierarchicalGrid.paginator.paginate(6);
            fixture.detectChanges();

            rows = hierarchicalGrid.rowList.toArray();

            [0, 36, 37, 38, 39].forEach((x, index) => expect(parseInt(rows[index].cells.first.value, 10)).toEqual(x));
        });
    });
});

@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="Information">
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
        </igx-column-group>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'">
            <igx-grid-toolbar *igxGridToolbar>
                <igx-grid-toolbar-actions>
                    <igx-grid-toolbar-hiding></igx-grid-toolbar-hiding>
                    <igx-grid-toolbar-pinning></igx-grid-toolbar-pinning>
                </igx-grid-toolbar-actions>
            </igx-grid-toolbar>
            <igx-column field="ID"></igx-column>
            <igx-column-group header="Information">
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-column-group>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IgxHierarchicalGridComponent,
        IgxRowIslandComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarDirective,
        IgxGridToolbarActionsComponent,
        IgxGridToolbarHidingComponent,
        IgxGridToolbarPinningComponent
    ]
})
class IgxHierarchicalGridChildToolbarActionsComponent extends IgxHierarchicalGridTestBaseComponent {
}
