import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxGridModule
} from './public_api';
import { IgxGridComponent } from './grid.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    SelectionWithScrollsComponent,
    MRLTestComponent,
    ColumnGroupsNavigationTestComponent
} from '../../test-utils/grid-samples.spec';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { DebugElement } from '@angular/core';
import { GridSelectionMode, FilterMode } from '../common/enums';
import { IActiveNodeChangeEventArgs } from '../common/events';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';

const DEBOUNCETIME = 30;

describe('IgxGrid - Headers Keyboard navigation #grid', () => {
    describe('Headers Navigation', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridHeader: DebugElement;
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    SelectionWithScrollsComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            gridHeader = GridFunctions.getGridHeader(fix);
        }));

        it('when click on a header it should stay in the view', async () => {
            grid.headerContainer.getScroll().scrollLeft = 1000;
            await wait(100);
            fix.detectChanges();

            let header = GridFunctions.getColumnHeader('OnPTO', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            await wait(200);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            expect(header).toBeDefined();
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should focus first header when the grid is scrolled', async () => {
            grid.navigateTo(7, 5);
            await wait(150);
            fix.detectChanges();

            gridHeader.triggerEventHandler('focus', {});
            await wait(250);
            fix.detectChanges();

            const header = GridFunctions.getColumnHeader('ID', fix);
            expect(header).not.toBeDefined();
            expect(grid.navigation.activeNode.column).toEqual(3);
            expect(grid.navigation.activeNode.row).toEqual(-1);
            expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThanOrEqual(200);
            expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThanOrEqual(100);
        });

        it('should emit when activeNode ref is changed', () => {
            spyOn(grid.activeNodeChange, 'emit').and.callThrough();

            const args: IActiveNodeChangeEventArgs = {
                row: -1,
                column: 0,
                level: 0,
                tag: 'headerCell'
            };

            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            expect(grid.activeNodeChange.emit).toHaveBeenCalledWith(args);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            args.column += 1;
            expect(grid.activeNodeChange.emit).toHaveBeenCalledWith(args);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            args.column -= 1;
            expect(grid.activeNodeChange.emit).toHaveBeenCalledWith(args);
            expect(grid.activeNodeChange.emit).toHaveBeenCalledTimes(3);
        });

        it('should allow horizontal navigation', async () => {
            // Focus grid header
            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            // Verify first header is focused
            let header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            for (let index = 0; index < 5; index++) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press arrow right again
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();
            GridFunctions.verifyHeaderIsFocused(header.parent);

            for (let index = 5; index > 1; index--) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate to first/last header', async () => {
            // Focus grid header
            let header = GridFunctions.getColumnHeader('ParentID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press end key
            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            await wait(100);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            expect(header).toBeTruthy();
            expect(grid.navigation.activeNode.column).toEqual(5);
            expect(grid.navigation.activeNode.row).toEqual(-1);

            // Press Home ket
            UIInteractions.triggerEventHandlerKeyDown('home', gridHeader);
            await wait(100);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            expect(header).toBeTruthy();
            expect(grid.navigation.activeNode.column).toEqual(0);
            expect(grid.navigation.activeNode.row).toEqual(-1);

            // Press Ctrl+ Arrow right
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, false, false, true);
            await wait(100);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            expect(header).toBeTruthy();
            expect(grid.navigation.activeNode.column).toEqual(5);
            expect(grid.navigation.activeNode.row).toEqual(-1);

            // Press Ctrl+ Arrow left
            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            expect(header).toBeTruthy();
            expect(grid.navigation.activeNode.column).toEqual(0);
            expect(grid.navigation.activeNode.row).toEqual(-1);
        });

        it('should not change active header on arrow up or down pressed', () => {
            // Focus grid header
            const header = GridFunctions.getColumnHeader('Name', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press arrow down key
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press arrow up key
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press pageUp key
            UIInteractions.triggerEventHandlerKeyDown('PageUp', gridHeader);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press pageDown key
            UIInteractions.triggerEventHandlerKeyDown('PageUp', gridHeader);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('Verify navigation when there are pinned columns', async () => {
            grid.getColumnByName('ParentID').pinned = true;
            fix.detectChanges();

            // Focus grid header
            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            // Verify first header is focused
            let header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Navigate to last cell
            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            expect(header).toBeTruthy();
            expect(grid.navigation.activeNode.column).toEqual(5);
            expect(grid.navigation.activeNode.row).toEqual(-1);

            // Click on the pinned column
            header = GridFunctions.getColumnHeader('ParentID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Start navigating right

            for (let index = 0; index < 5; index++) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
            const hScroll = grid.headerContainer.getScroll().scrollLeft;

            // Navigate with home key
            UIInteractions.triggerEventHandlerKeyDown('Home', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
            expect(grid.headerContainer.getScroll().scrollLeft).toEqual(hScroll);
        });

        it('Sorting: Should be able to sort a column with the keyboard', fakeAsync (() => {
            spyOn(grid.sorting, 'emit').and.callThrough();
            spyOn(grid.onSortingDone, 'emit').and.callThrough();
            grid.getColumnByName('ID').sortable = true;
            fix.detectChanges();

            // Focus grid header
            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, true);
            expect(grid.sortingExpressions.length).toEqual(1);
            expect(grid.sortingExpressions[0].fieldName).toEqual('ID');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);

            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: grid.sortingExpressions,
                owner: grid
            });

            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, false);
            expect(grid.sortingExpressions.length).toEqual(0);

            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, true);
            expect(grid.sortingExpressions.length).toEqual(1);
            expect(grid.sortingExpressions[0].fieldName).toEqual('ID');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, false, false, true);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, true);
            expect(grid.sortingExpressions.length).toEqual(1);
            expect(grid.sortingExpressions[0].fieldName).toEqual('ID');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Desc);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, false, false, true);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, false);
            expect(grid.sortingExpressions.length).toEqual(0);

            // select not sortable column
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, false, false, true);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, false, false);
            expect(grid.sortingExpressions.length).toEqual(0);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, false, false);
            expect(grid.sortingExpressions.length).toEqual(0);

            expect(grid.sorting.emit).toHaveBeenCalledTimes(5);
            expect(grid.onSortingDone.emit).toHaveBeenCalledTimes(5);
        }));

        it('Filtering: Should be able to open filter row with the keyboard', () => {
            // Focus grid header
            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Test when grid does not have filtering
            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
            fix.detectChanges();

            let filterRow = GridFunctions.getFilterRow(fix);
            expect(filterRow).toBeNull();

            // Allow filtering
            grid.allowFiltering = true;
            grid.getColumnByName('ID').filterable = false;
            fix.detectChanges();

            // Try to open filter row for not filterable column
            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
            fix.detectChanges();

            filterRow = GridFunctions.getFilterRow(fix);
            expect(filterRow).toBeNull();

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();
            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Try to open filter row for not filterable column
            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
            fix.detectChanges();

            filterRow = GridFunctions.getFilterRow(fix);
            expect(filterRow).not.toBeNull();
            expect(grid.filteringRow.column.field).toEqual('ParentID');
        });

        it('Excel Style Filtering: Should be able to open ESF with the keyboard', () => {
            // Allow ESF
            grid.allowFiltering = true;
            grid.filterMode = FilterMode.excelStyleFilter;
            grid.getColumnByName('ID').filterable = false;
            fix.detectChanges();

             let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Try to open filter for not filterable column
            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
            fix.detectChanges();

            let filterDialog =  GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(filterDialog).toBeNull();

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();
            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Open filter
            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
            fix.detectChanges();

            filterDialog =  GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(filterDialog).toBeDefined();
        });

        it('Advanced Filtering: Should be able to open Advanced filter', () => {
            const header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Test when advanced filtering is disabled
            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, true);
            fix.detectChanges();

            // Verify AF dialog is not opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();

            // Enable Advanced Filtering
            grid.allowAdvancedFiltering = true;
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, true);
            fix.detectChanges();

            // Verify AF dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull();
        });

        it('Advanced Filtering: Should be able to close Advanced filtering with "escape"',  fakeAsync(() => {
            // Enable Advanced Filtering
            grid.allowAdvancedFiltering = true;
            fix.detectChanges();
            let header = GridFunctions.getColumnHeader('Name', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, true);
            fix.detectChanges();

            // Verify AF dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull();

            const afDialog = fix.nativeElement.querySelector('.igx-advanced-filter');
            UIInteractions.triggerKeyDownEvtUponElem('Escape', afDialog);
            tick(100);
            fix.detectChanges();

            // Verify AF dialog is closed.
            header = GridFunctions.getColumnHeader('Name', fix);
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            GridFunctions.verifyHeaderIsFocused(header.parent);
        }));


        it('Column selection: Should be able to select columns when columnSelection is multi', () => {
            const columnID = grid.getColumnByName('ID');
            const columnParentID = grid.getColumnByName('ParentID');
            const columnName = grid.getColumnByName('Name');
            columnName.selectable = false;
            expect(grid.columnSelection).toEqual(GridSelectionMode.none);
            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press space when the columnSelection is none
            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(columnID, false);

            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(columnID);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(columnID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnParentID);

            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(columnID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnParentID, false);


            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Name', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press Space on not selectable column
            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(columnID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnName, false);
        });

        it('Column selection: Should be able to select columns when columnSelection is single', () => {
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();
            const columnID = grid.getColumnByName('ID');
            const columnParentID = grid.getColumnByName('ParentID');
            const columnName = grid.getColumnByName('Name');
            columnName.selectable = false;
            grid.columnSelection = GridSelectionMode.single;

            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnID);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(columnID, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnParentID);

            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(columnParentID, false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Name', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press Space on not selectable column
            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(columnName, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(3);
        });

        it('Group by: Should be able group columns with keyboard', () => {
            spyOn(grid.onGroupingDone, 'emit').and.callThrough();
            grid.getColumnByName('ID').groupable = true;
            grid.getColumnByName('Name').groupable = true;

            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, true, true);
            fix.detectChanges();

            expect(grid.groupingExpressions.length).toEqual(1);
            expect(grid.groupingExpressions[0].fieldName).toEqual('ID');

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            // Try to group not groupable column
            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, true, true);
            fix.detectChanges();

            expect(grid.groupingExpressions.length).toEqual(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Name', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press Space on not selectable column
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, true, true);
            fix.detectChanges();

            expect(grid.groupingExpressions.length).toEqual(2);
            expect(grid.groupingExpressions[0].fieldName).toEqual('ID');
            expect(grid.groupingExpressions[1].fieldName).toEqual('Name');

            // Ungroup column
            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, true, true);
            fix.detectChanges();

            expect(grid.groupingExpressions.length).toEqual(1);
            expect(grid.groupingExpressions[0].fieldName).toEqual('ID');

            // Ungroup not grouped column
            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, true, true);
            fix.detectChanges();

            expect(grid.groupingExpressions.length).toEqual(1);
            expect(grid.groupingExpressions[0].fieldName).toEqual('ID');
            expect(grid.onGroupingDone.emit).toHaveBeenCalled();
        });

        it('Group by: Should be able group columns with keyboard when hideGroupedColumns is true', fakeAsync(() => {
            grid.width = '1000px';
            grid.hideGroupedColumns = true;
            grid.columns.forEach(c => c.groupable = true);
            fix.detectChanges();
            tick(100);
            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Group by first column
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, true, true);
            tick(100);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
            expect(grid.groupingExpressions.length).toEqual(1);
            expect(grid.groupingExpressions[0].fieldName).toEqual('ID');
            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('ID'), true, 5);

            // Go to last column
            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            fix.detectChanges();

            // Try to group not groupable column
            header = GridFunctions.getColumnHeader('OnPTO', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, true, true);
            tick(100);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Age', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
            expect(grid.groupingExpressions.length).toEqual(2);
            expect(grid.groupingExpressions[0].fieldName).toEqual('ID');
            expect(grid.groupingExpressions[1].fieldName).toEqual('OnPTO');
            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('OnPTO'), true, 4);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('HireDate', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        }));
    });

    describe('MRL Headers Navigation', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridHeader: DebugElement;
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    MRLTestComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(MRLTestComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            gridHeader = GridFunctions.getGridHeader(fix);
        }));

        it('should navigate through a layout with right and left arrow keys in first level', async () => {
            let header = GridFunctions.getColumnHeader('CompanyName', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Country', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Phone', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Country', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through a layout with right and left arrow keys in second level', async () => {
            let header = GridFunctions.getColumnHeader('ContactTitle', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Fax', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactTitle', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through a layout with home and end keys', async () => {
            let header = GridFunctions.getColumnHeader('ContactTitle', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Fax', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            header = GridFunctions.getColumnHeader('Address', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Fax', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('home', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Address', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through a layout with up and down arrow keys', () => {
            let header = GridFunctions.getColumnHeader('ContactTitle', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactTitle', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Address', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactTitle', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should focus the first element when focus the header', () => {
            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            const header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });
    });

    describe('MCH Headers Navigation', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridHeader: DebugElement;
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    ColumnGroupsNavigationTestComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnGroupsNavigationTestComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            gridHeader = GridFunctions.getGridHeader(fix);
        }));

        it('should navigate through groups with right and left arrow keys in first level', () => {
            let header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Address Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);
        });

        it('should navigate through groups with right and left arrow keys in child level', () => {
            let header = GridFunctions.getColumnHeader('ContactTitle', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Region', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Country', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('City Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Country', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Region', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactTitle', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through groups with Home and End keys', () => {
            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, false, false, true);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Address Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, false, false, true);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            header = GridFunctions.getColumnHeader('City', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('Home', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Address', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through groups with arrowUp and down keys', () => {
            let header = GridFunctions.getColumnHeader('City', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('City Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Country Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Address Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Country Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('City Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);

            // click on parent
            header = GridFunctions.getColumnGroupHeaderCell('Address Information', fix);

            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header);
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Region', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should focus the first element when focus the header', () => {
            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            let header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            // Verify children are not focused
            header = GridFunctions.getColumnGroupHeaderCell('Person Details', fix);
            GridFunctions.verifyHeaderIsFocused(header, false);

            header = GridFunctions.getColumnGroupHeaderCell('Person Details', fix);
            GridFunctions.verifyHeaderIsFocused(header, false);

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent, false);
        });

        it('should be able to expand collapse column group with the keyboard', () => {
            const getInfGroup = GridFunctions.getColGroup(grid, 'General Information');
            const personDetailsGroup = GridFunctions.getColGroup(grid, 'Person Details');
            const companyName = grid.getColumnByName('CompanyName');
            getInfGroup.collapsible = true;
            personDetailsGroup.visibleWhenCollapsed = true;
            companyName.visibleWhenCollapsed = false;
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 10);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup);

            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            const header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, true);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, true, 12);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup, true, false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, true);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 10);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup);

            // set group not to be collapsible
            getInfGroup.collapsible = false;
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 13);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup, false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, true);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 13);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup, false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, true);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 13);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup, false);
        });

        it('Column selection: should be possible to select column group with the keyboard', () => {
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            const header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();
            fix.detectChanges();

            expect(grid.getColumnByName('CompanyName').selected).toBeTruthy();
            expect(grid.getColumnByName('ContactName').selected).toBeTruthy();
            expect(grid.getColumnByName('ContactTitle').selected).toBeTruthy();

            UIInteractions.triggerEventHandlerKeyDown('Space', gridHeader);
            fix.detectChanges();

            expect(grid.selectedColumns().length).toEqual(0);
        });

        it('Features Integration: should nor be possible to sort, filter or groupBy column group', () => {
            grid.allowAdvancedFiltering = true;
            grid.columns.forEach(c => {
c.sortable = true; c.groupable = true;
});
            fix.detectChanges();

            const header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header);

            // Press Ctrl+ Arrow Up and down on group to sort it
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            fix.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, false, false, true);
            fix.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);

             // Press Shift + Alt + Arrow left  on group to groupBy it
             UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, true, true);
             fix.detectChanges();

             expect(grid.groupingExpressions.length).toEqual(0);


             // Press Ctrl + Shift + L  on group to open filter row
             UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
             fix.detectChanges();

             expect(GridFunctions.getFilterRow(fix)).toBeNull();

             // Change filter mode to be excel style filter
             grid.filterMode = FilterMode.excelStyleFilter;
             fix.detectChanges();

             // Press Ctrl + Shift + L  on group to open excel style filter
             UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
             fix.detectChanges();

             expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeNull();
        });

        it('MCH Grid with no data: should be able to navigate with arrow keys in the headers', () => {
            grid.filter('Country', 'Bulgaria', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            expect(grid.rowList.length).toBe(0);

            let header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            UIInteractions.simulateClickAndSelectEvent(header);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, false, false, true);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Address Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, false, false, false);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Region', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, false, false, false);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Country Information', fix);
            GridFunctions.verifyHeaderIsFocused(header);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, false, false, true);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });
    });
});
