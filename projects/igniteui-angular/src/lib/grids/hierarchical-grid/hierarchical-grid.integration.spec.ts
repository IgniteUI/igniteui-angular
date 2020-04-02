import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxColumnMovingDragDirective } from '../moving/moving.drag.directive';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { take } from 'rxjs/operators';
import { IgxIconModule } from '../../icon';
import { GridSelectionMode } from '../common/enums';
import {
    IgxHierarchicalGridTestBaseComponent,
    IgxHierarchicalGridTestCustomToolbarComponent
} from '../../test-utils/hierarchical-grid-components.spec';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridToolbarComponent } from '../toolbar/grid-toolbar.component';
import { HierarchicalGridFunctions } from '../../test-utils/hierarchical-grid-functions.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

describe('IgxHierarchicalGrid Integration #hGrid', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;

    const DEBOUNCE_TIME = 30;

    const FILTERING_ROW_CLASS = 'igx-grid-filtering-row';
    const FILTERING_CELL_CLASS = 'igx-grid-filtering-cell';

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent,
                IgxHierarchicalGridTestCustomToolbarComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule, IgxIconModule]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
    }));

    describe('MCH', () => {
        it('should allow declaring column groups.', fakeAsync(() => {
            const expectedColumnGroups = 1;
            const expectedLevel = 1;

            expect(hierarchicalGrid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
            expect(hierarchicalGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

            expect(document.querySelectorAll('igx-grid-header').length).toEqual(3);

            const firstRow = hierarchicalGrid.dataRowList.first;
            // the first row's cell should contain an expand indicator
            expect(firstRow.nativeElement.children[0].classList.contains('igx-grid__hierarchical-expander')).toBeTruthy();
            hierarchicalGrid.expandRow(firstRow.rowID);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

            expect(childGrid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
            expect(childGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

            expect(document.querySelectorAll('igx-grid-header').length).toEqual(6);
        }));

        it('should apply height correctly with and without filtering', fakeAsync(() => {
            let filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(600);

            hierarchicalGrid.height = '800px';
            tick();
            fixture.detectChanges();
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(800);
            expect(filteringCells.length).toBe(3);

            hierarchicalGrid.allowFiltering = false;
            fixture.detectChanges();
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(800);
            filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toBe(0);

        }));
    });

    describe('Selection', () => {
        it('should allow only one cell to be selected in the whole hierarchical grid.', fakeAsync(() => {
            let firstRow = hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent;
            hierarchicalGrid.expandRow(firstRow.rowID);
            expect(firstRow.expanded).toBeTruthy();

            let firstCell = firstRow.cells.first;
            firstCell.nativeElement.focus();
            tick();

            expect(firstCell.selected).toBeTruthy();
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const firstChildCell = childGrid.dataRowList.first.cells.first;

            // select child cell
            firstChildCell.nativeElement.focus();
            tick();

            expect(firstChildCell.selected).toBeTruthy();
            expect(firstCell.selected).toBeFalsy();

            // select parent cell
            firstRow = hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent;
            firstCell = firstRow.cells.first;
            firstCell.nativeElement.focus();
            tick();

            expect(firstChildCell.selected).toBeFalsy();
            expect(firstCell.selected).toBeTruthy();
        }));
    });

    describe('Updating', () => {
        it(`should have separate instances of updating service for
        parent and children and the same for children of the same island`, fakeAsync(() => {
            const firstLayoutInstances: IgxHierarchicalGridComponent[] = [];
            hierarchicalGrid.childLayoutList.first.onGridCreated.pipe(take(2)).subscribe((args) => {
                firstLayoutInstances.push(args.grid);
            });
            const dataRows = hierarchicalGrid.dataRowList.toArray();
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].rowID);
            // test instances
            expect(firstLayoutInstances.length).toEqual(2);
            expect(hierarchicalGrid.transactions).not.toBe(firstLayoutInstances[0].transactions);
            expect(firstLayoutInstances[0].transactions).not.toBe(firstLayoutInstances[1].transactions);
        }));

        it('should contain all transactions for a row island', fakeAsync(() => {
            const firstLayoutInstances: IgxHierarchicalGridComponent[] = [];
            hierarchicalGrid.childLayoutList.first.onGridCreated.pipe(take(2)).subscribe((args) => {
                firstLayoutInstances.push(args.grid);
            });
            const dataRows = hierarchicalGrid.dataRowList.toArray();
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].rowID);

            firstLayoutInstances[0].updateRow({ ProductName: 'Changed' }, '00');
            firstLayoutInstances[1].updateRow({ ProductName: 'Changed' }, '10');
            expect(hierarchicalGrid.transactions.getTransactionLog().length).toEqual(0);
            expect(firstLayoutInstances[0].transactions.getTransactionLog().length).toEqual(1);
            expect(fixture.componentInstance.rowIsland.transactions.getTransactionLog().length).toEqual(0);
        }));

        it('should remove expand indicator for uncommitted added rows', fakeAsync(() => {
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            hierarchicalGrid.addRow({ ID: -1, ProductName: 'Name1' });
            fixture.detectChanges();
            const rows = fixture.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent));
            const lastRow = rows[rows.length - 1];
            expect(lastRow.query(By.css('igx-icon')).nativeElement).toHaveClass('igx-icon--inactive');
            hierarchicalGrid.transactions.commit(hierarchicalGrid.data);
            fixture.detectChanges();
            expect(lastRow.query(By.css('igx-icon')).nativeElement).not.toHaveClass('igx-icon--inactive');
        }));

        it('should now allow expanding uncommitted added rows', fakeAsync(() => {
            /* using the API here assumes keyboard interactions to expand/collapse would also be blocked */
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            hierarchicalGrid.addRow({ ID: -1, ProductName: 'Name1' });
            fixture.detectChanges();

            const dataRows = hierarchicalGrid.dataRowList;
            hierarchicalGrid.expandRow(dataRows.last.rowID);
            let childRows = fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            expect(childRows.length).toEqual(0);

            hierarchicalGrid.transactions.commit(hierarchicalGrid.data);
            fixture.detectChanges();

            hierarchicalGrid.expandRow(dataRows.last.rowID);
            childRows = fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            expect(childRows.length).toEqual(1);
        }));

        it('should revert changes when transactions are cleared for child grids', fakeAsync(() => {
            let childGrid;
            hierarchicalGrid.childLayoutList.first.onGridCreated.pipe(take(1)).subscribe((args) => {
                childGrid = args.grid;
            });
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            childGrid.updateRow({ ProductName: 'Changed' }, '00');
            fixture.detectChanges();
            expect(childGrid.getCellByColumn(0, 'ProductName').nativeElement.innerText).toEqual('Changed');
            childGrid.transactions.clear();
            fixture.detectChanges();
            expect(childGrid.getCellByColumn(0, 'ProductName').nativeElement.innerText).toEqual('Product: A0');
        }));
    });

    describe('Sorting', () => {
        it('should display correct child data for expanded row after sorting.', fakeAsync(() => {
            /* this test doesn't need scrolling as it only cares about the child grid getting assigned to the correct parent */
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            hierarchicalGrid.sort({
                fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const firstChildCell = childGrid.dataRowList.first.cells.first;
            expect(hierarchicalGrid.getRowByIndex(3) instanceof IgxChildGridRowComponent).toBeTruthy();
            expect(childGrid.data).toBe(fixture.componentInstance.data[0]['childData']);
            expect(firstChildCell.value).toBe('00');
        }));

        it('should allow sorting via headers in child grids', fakeAsync(() => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            // enable sorting
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            childGrid.columnList.first.sortable = true;
            fixture.detectChanges();

            const childHeaders = fixture.debugElement.query(By.css('igx-child-grid-row')).queryAll(By.css('igx-grid-header'));
            childHeaders[0].nativeElement.click();
            fixture.detectChanges();
            childHeaders[0].nativeElement.click();
            fixture.detectChanges();

            expect(childGrid.dataRowList.first.cells.first.value).toBe('09');
            const icon = GridFunctions.getHeaderSortIcon(childHeaders[0]);
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('arrow_downward');
        }));
    });

    describe('Filtering', () => {

        it('should enable filter-row for root and child grids', fakeAsync(() => {
            let filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toEqual(3);

            GridFunctions.clickFilterCellChipUI(fixture, 'ID');
            expect(document.querySelectorAll(FILTERING_ROW_CLASS).length).toEqual(1);

            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toEqual(6);

            GridFunctions.clickFilterCellChipUI(fixture, 'ProductName', hierarchicalGrid.hgridAPI.getChildGrids(false)[0]);
            expect(document.querySelectorAll(FILTERING_ROW_CLASS).length).toEqual(2);
        }));

        it('should not lose child grid states after filtering in parent grid.', fakeAsync(() => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            const childGrids = fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            let childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            let firstChildCell = childGrid.dataRowList.first.cells.first;
            UIInteractions.simulateClickAndSelectCellEvent(firstChildCell);
            expect(firstChildCell.selected).toBe(true);

            // apply some filter
            hierarchicalGrid.filter('ID', '0', IgxStringFilteringOperand.instance().condition('contains'), true);

            expect((hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).expanded).toBe(true);
            expect(hierarchicalGrid.getRowByIndex(1) instanceof IgxChildGridRowComponent).toBeTruthy();

            childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            firstChildCell = childGrid.dataRowList.first.cells.first;
            expect(firstChildCell.selected).toBe(true);
        }));

        it('should show empty filter message when there are no records matching the filter', fakeAsync(() => {
            fixture.componentInstance.data = [];
            fixture.detectChanges();

            const gridBody = fixture.debugElement.query(By.css('.igx-grid__tbody-content'));
            expect(gridBody.nativeElement.innerText).toMatch(hierarchicalGrid.emptyGridMessage);

            fixture.componentInstance.data = SampleTestData.generateHGridData(40, 3);
            fixture.detectChanges();

            hierarchicalGrid.filter('ID', '123450', IgxStringFilteringOperand.instance().condition('contains'), true);
            fixture.detectChanges();
            expect(gridBody.nativeElement.innerText).toMatch(hierarchicalGrid.emptyFilteredGridMessage);
        }));

        it('should apply classes to the header when filter row is visible', fakeAsync(() => {
            hierarchicalGrid.rowSelection = GridSelectionMode.multiple;
            fixture.detectChanges();
            const headerExpander: HTMLElement = fixture.nativeElement.querySelector('.igx-grid__hierarchical-expander');
            const headerCheckbox: HTMLElement = fixture.nativeElement.querySelector('.igx-grid__cbx-selection');

            expect(headerExpander.classList.contains('igx-grid__hierarchical-expander--push')).toBeFalsy();
            expect(headerCheckbox.classList.contains('igx-grid__cbx-selection--push')).toBeFalsy();

            // open filter row
            GridFunctions.clickFilterCellChipUI(fixture, 'ID');

            expect(headerExpander.classList.contains('igx-grid__hierarchical-expander--push')).toBeTruthy();
            expect(headerCheckbox.classList.contains('igx-grid__cbx-selection--push')).toBeTruthy();
        }));
    });

    describe('Summaries', () => {
        const SUMMARIES_MARGIN_CLASS = '.igx-grid__summaries-patch';
        it('should allow defining summaries for child grid and child should be sized correctly.', fakeAsync(() => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const expander = childGrid.dataRowList.first.expander;

            // Expect expansion cell to be rendered and sized the same as the expansion cell inside the grid
            const summaryRow = childGrid.summariesRowList.first.nativeElement;
            const summaryRowIndentation = summaryRow.querySelector(SUMMARIES_MARGIN_CLASS);
            expect(summaryRow.children.length).toEqual(2);
            expect(summaryRowIndentation.offsetWidth).toEqual(expander.nativeElement.offsetWidth);

            const gridHeight = childGrid.nativeElement.offsetHeight;
            const childElements: HTMLElement[] = Array.from(childGrid.nativeElement.children);
            const elementsHeight = childElements.map(elem => elem.offsetHeight).reduce((total, height) => {
                return total + height;
            }, 0);

            // Expect the combined height of all elements (header, body, footer etc) to equal the calculated height of the grid.
            expect(elementsHeight).toEqual(gridHeight);

            // expand first row of child
            childGrid.expandRow(childGrid.dataRowList.first.rowID);

            const grandChild = childGrid.hgridAPI.getChildGrids(false)[0];
            const grandChildSummaryRow = grandChild.summariesRowList.first.nativeElement;
            const childSummaryRowIndentation = grandChildSummaryRow.querySelector(SUMMARIES_MARGIN_CLASS);

            expect(grandChildSummaryRow.children.length).toEqual(1);
            expect(childSummaryRowIndentation).toBeNull();
        }));

        it('should size summaries with row selectors for parent and child grids correctly.', fakeAsync(() => {
            hierarchicalGrid.rowSelectable = true;
            fixture.detectChanges();
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const rootExpander = (hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent).expander;
            const rootCheckbox = hierarchicalGrid.headerSelectorContainer;
            const rootSummaryRow = hierarchicalGrid.summariesRowList.first.nativeElement;
            const rootSummaryIndentation = rootSummaryRow.querySelector(SUMMARIES_MARGIN_CLASS);

            expect(rootSummaryRow.children.length).toEqual(2);
            expect(rootSummaryIndentation.offsetWidth)
                .toEqual(rootExpander.nativeElement.offsetWidth + rootCheckbox.nativeElement.offsetWidth);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const expander = childGrid.dataRowList.first.expander;

            // Expect expansion cell to be rendered and sized the same as the expansion cell inside the grid
            const summaryRow = childGrid.summariesRowList.first.nativeElement;
            const childSummaryIndentation = summaryRow.querySelector(SUMMARIES_MARGIN_CLASS);

            expect(summaryRow.children.length).toEqual(2);
            expect(childSummaryIndentation.offsetWidth).toEqual(expander.nativeElement.offsetWidth);
        }));

        it('should render summaries for column inside a column group.', fakeAsync(() => {
            fixture.componentInstance.rowIsland.childColumns.first.hasSummary = false;
            fixture.componentInstance.rowIsland.childColumns.last.hasSummary = true;
            fixture.detectChanges();

            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

            const summaryRow = childGrid.summariesRowList.first;
            expect(summaryRow.nativeElement.children.length).toEqual(2);
            expect(summaryRow.summaryCells.length).toEqual(3);
        }));
    });

    describe('Paging', () => {
        it('should work on data records only when paging is enabled and should not be affected by child grid rows.', fakeAsync(() => {
            hierarchicalGrid.paging = true;
            fixture.detectChanges();

            expect(hierarchicalGrid.dataView.length).toEqual(15);

            const dataRows = hierarchicalGrid.dataRowList.toArray();

            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            expect(hierarchicalGrid.dataView.length).toEqual(16);

            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].rowID);
            expect(hierarchicalGrid.dataView.length).toEqual(17);

            expect(hierarchicalGrid.dataView.pop().ID).toEqual('14');
        }));

        it('should preserve expansion states after changing pages.', fakeAsync(() => {
            hierarchicalGrid.paging = true;
            fixture.detectChanges();

            let dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].rowID);

            expect(dataRows[0].expanded).toBeTruthy();
            expect(dataRows[1].expanded).toBeTruthy();
            expect(hierarchicalGrid.dataView.length).toEqual(17);

            let childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
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

            childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);

            // Return to previous page
            GridFunctions.navigateToPrevPage(hierarchicalGrid.nativeElement);
            fixture.detectChanges();

            dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            expect(dataRows[0].cells.first.value).toEqual('0');
            expect(dataRows[0].expanded).toBeTruthy();
            expect(dataRows[1].expanded).toBeTruthy();
            expect(hierarchicalGrid.dataView.length).toEqual(17);

            childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
            expect(childGrids[0].dataRowList.first.cells.first.value).toEqual('00');
        }));

        it('should allow scrolling to the last row after page size has been changed and rows are expanded.', (async () => {
            /* it's better to avoid scrolling and only check for scrollbar availability */
            /* scrollbar doesn't update its visibility in fakeAsync tests */
            hierarchicalGrid.perPage = 20;
            hierarchicalGrid.paging = true;
            hierarchicalGrid.height = '800px';
            fixture.componentInstance.rowIsland.height = '200px';
            fixture.detectChanges();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();

            hierarchicalGrid.perPage = 5;
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();

            const dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];

            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            await wait(DEBOUNCE_TIME);

            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();
            expect(hierarchicalGrid.getRowByIndex(1) instanceof IgxChildGridRowComponent).toBeTruthy();

            // expand 3rd row
            hierarchicalGrid.expandRow(dataRows[3].rowID);
            await wait(DEBOUNCE_TIME);
            expect(hierarchicalGrid.getRowByIndex(4) instanceof IgxChildGridRowComponent).toBeTruthy();
        }));

        it('should correctly hide/show vertical scrollbar after page is changed.', (async () => {
            /* scrollbar doesn't update its visibility in fakeAsync tests */
            hierarchicalGrid.paging = true;
            hierarchicalGrid.perPage = 5;
            fixture.detectChanges();

            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();

            // expand 1st row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
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
            await wait(DEBOUNCE_TIME);

            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();
        }));
    });

    describe('Hiding', () => {
        it('should leave no feature UI elements when all columns are hidden', fakeAsync(() => {
            hierarchicalGrid.rowSelection = GridSelectionMode.multiple;
            hierarchicalGrid.rowDraggable = true;
            hierarchicalGrid.paging = true;
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            let headers = GridFunctions.getColumnHeaders(fixture);
            let gridRows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            let paging = GridFunctions.getGridPaginator(fixture);
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
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            headers = GridFunctions.getColumnHeaders(fixture);
            gridRows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            paging = GridFunctions.getGridPaginator(fixture);
            rowSelectors = GridSelectionFunctions.getCheckboxes(fixture);
            dragIndicators = GridFunctions.getDragIndicators(fixture);
            expander = HierarchicalGridFunctions.getExpander(fixture, '[hidden]');

            expect(headers.length).toBe(0);
            expect(gridRows.length).toBe(0);
            expect(paging).toBeNull();
            expect(rowSelectors.length).toBe(0);
            expect(dragIndicators.length).toBe(0);
            // this check executes correctly on Ivy only
            // expect(Object.keys(expanders[0].attributes)).toContain('hidden');
            expect(expander).not.toBeNull();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();
        }));
    });

    describe('Toolbar', () => {
        it('should be displayed correctly for child layout and hiding should apply to the correct child.', fakeAsync(() => {
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const toolbar = childGrid.toolbar as IgxGridToolbarComponent;

            // Check if visible columns and headers are rendered correctly
            expect(childGrid.visibleColumns.length).toEqual(4);

            // Check if hiding button & dropdown are init
            expect(toolbar).toBeDefined();
            expect(toolbar.columnHidingButton).toBeDefined();
            expect(toolbar.columnHidingDropdown).toBeDefined();

            // Check if the child grid columns are the one used by the hiding UI
            childGrid.visibleColumns.forEach((column, index) => expect(toolbar.columnHidingUI.columns[index]).toEqual(column));

            // Instead of clicking we can just change the item's value
            toolbar.columnHidingUI.columnItems[2].value = true;
            fixture.detectChanges();

            // And it should hide the column of the child grid
            expect(childGrid.visibleColumns.length).toEqual(3);
        }));

        it('should be displayed correctly for child layout and pinning should apply to the correct child.', fakeAsync(() => {
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const toolbar = childGrid.toolbar as IgxGridToolbarComponent;

            // Check if visible columns and headers are rendered correctly
            expect(childGrid.visibleColumns.length).toEqual(4);

            // Check if pinning button & dropdown are init
            expect(toolbar).toBeDefined();
            expect(toolbar.columnPinningButton).toBeDefined();
            expect(toolbar.columnPinningDropdown).toBeDefined();

            // Check if the child grid columns are the one used by the pinning UI
            childGrid.visibleColumns.forEach((column, index) => expect(toolbar.columnPinningUI.columns[index]).toEqual(column));

            // Instead of clicking we can just change the item's value
            toolbar.columnPinningUI.columnItems[1].value = true;
            fixture.detectChanges();

            // Check pinned state
            expect(childGrid.getColumnByName('ChildLevels').pinned).toBeTruthy();
            expect(childGrid.getColumnByName('ProductName').pinned).toBeTruthy();
            expect(childGrid.getColumnByName('ID').pinned).toBeFalsy();
        }));

        it('should read from custom templates per level', fakeAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestCustomToolbarComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const toolbars = fixture.debugElement.queryAll(By.css('igx-grid-toolbar'));
            expect(toolbars.length).toEqual(3);
            expect(toolbars[0].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Parent Button');
            expect(toolbars[1].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Child 1 Button');
            expect(toolbars[2].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Child 2 Button');
        }));

        it('should have same width as the grid whole width', fakeAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestCustomToolbarComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;

            const toolbar = fixture.debugElement.query(By.css('igx-grid-toolbar'));
            expect(toolbar.nativeElement.offsetWidth).toEqual(hierarchicalGrid.nativeElement.offsetWidth);
        }));
    });

    describe('Moving', () => {
        it('should not be possible to drag move a column from another grid.', (async () => {
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childHeader = childGrids[0].queryAll(By.css('igx-grid-header'))[0].nativeElement;
            const mainHeaders = hierarchicalGrid.nativeElement
                .querySelectorAll('igx-grid-header[ng-reflect-grid-i-d="' + hierarchicalGrid.id + '"]');

            const childHeaderX = childHeader.getBoundingClientRect().x + childHeader.getBoundingClientRect().width / 2;
            const childHeaderY = childHeader.getBoundingClientRect().y + childHeader.getBoundingClientRect().height / 2;
            const mainHeaderX = mainHeaders[0].getBoundingClientRect().x + mainHeaders[0].getBoundingClientRect().width / 2;
            const mainHeaderY = mainHeaders[0].getBoundingClientRect().y + mainHeaders[0].getBoundingClientRect().height / 2;

            UIInteractions.simulatePointerEvent('pointerdown', childHeader, childHeaderX, childHeaderY);
            await wait();
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', childHeader, childHeaderX, childHeaderY - 10);
            await wait(100);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', childHeader, mainHeaderX + 50, mainHeaderY);
            await wait(100);
            fixture.detectChanges();

            // The moving indicator shouldn't show that a column can be moved.
            const childGroupHeader = childGrids[0].query(By.css('igx-grid-header')).injector.get(IgxColumnMovingDragDirective);
            const dragElem = childGroupHeader.ghostElement;
            const dragIcon = dragElem.querySelector('i');
            expect(dragElem).toBeDefined();
            expect(dragIcon.innerText.trim()).toEqual('block');

            UIInteractions.simulatePointerEvent('pointerup', childHeader, mainHeaderX + 50, mainHeaderY);
            await wait();
            fixture.detectChanges();

            expect(hierarchicalGrid.columnList.length).toEqual(4);
            expect(mainHeaders.length).toEqual(3);
            expect(mainHeaders[0].children[0].innerText.trim()).toEqual('ID');
            expect(mainHeaders[1].children[0].innerText.trim()).toEqual('ChildLevels');
            expect(mainHeaders[2].children[0].innerText.trim()).toEqual('ProductName');
        }));
    });

    describe('Pinning', () => {
        it('should be possible by templating the header and getting column reference for child grid', fakeAsync(() => {
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            let childHeader = GridFunctions.getColumnGroupHeaders(fixture)[4];
            const firstHeaderIcon = childHeader.query(By.css('.igx-icon'));

            expect(childHeader.nativeElement.classList).not.toContain('igx-grid__th--pinned');
            expect(childGrid.columnList.first.pinned).toBeFalsy();
            expect(firstHeaderIcon).toBeDefined();

            UIInteractions.clickElement(firstHeaderIcon);
            fixture.detectChanges();
            tick();

            childHeader = GridFunctions.getColumnGroupHeaders(fixture)[4];
            expect(childGrid.columnList.first.pinned).toBeTruthy();
            expect(childHeader.nativeElement.classList).toContain('igx-grid__th--pinned');
        }));

        it('should be applied correctly for child grid with multi-column header.', (() => {
            fixture.componentInstance.rowIsland.columnList.find(x => x.header === 'Information').pinned = true;
            fixture.detectChanges();

            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            // check unpinned/pinned columns
            expect(childGrid.pinnedColumns.length).toBe(3);
            expect(childGrid.unpinnedColumns.length).toBe(1);
            // check cells
            expect(childGrid.getRowByIndex(0).cells.length).toBe(3);
            let cell = childGrid.getCellByColumn(0, 'ChildLevels');
            expect(cell.visibleColumnIndex).toEqual(0);
            expect(cell.nativeElement.classList).toContain('igx-grid__td--pinned');
            cell = childGrid.getCellByColumn(0, 'ProductName');
            expect(cell.visibleColumnIndex).toEqual(1);
            expect(cell.nativeElement.classList).toContain('igx-grid__td--pinned');
            cell = childGrid.getCellByColumn(0, 'ID');
            expect(cell.visibleColumnIndex).toEqual(2);
            expect(cell.nativeElement.classList).not.toContain('igx-grid__td--pinned');
        }));
    });
});
