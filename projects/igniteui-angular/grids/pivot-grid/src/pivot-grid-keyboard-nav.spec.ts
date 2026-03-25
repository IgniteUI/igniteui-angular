import { TestBed, fakeAsync, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import { IgxPivotGridMultipleRowComponent, IgxPivotGridTestBaseComponent } from '../../../test-utils/pivot-grid-samples.spec';
import { UIInteractions, wait } from '../../../test-utils/ui-interactions.spec';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';
import { DebugElement } from '@angular/core';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxGridNavigationService, PivotRowLayoutType } from 'igniteui-angular/grids/core';
import { IgxPivotGridNavigationService } from './pivot-grid-navigation.service';

const DEBOUNCE_TIME = 250;
const PIVOT_TBODY_CSS_CLASS = '.igx-grid__tbody';
const PIVOT_ROW_DIMENSION_CONTENT = 'igx-pivot-row-dimension-content';
const PIVOT_HEADER_ROW = 'igx-pivot-header-row';
const HEADER_CELL_CSS_CLASS = '.igx-grid-th';
const ACTIVE_CELL_CSS_CLASS = '.igx-grid-th--active';
const CSS_CLASS_ROW_DIMENSION_CONTAINER = '.igx-grid__tbody-pivot-dimension'
const CSS_CLASS_TBODY_CONTENT = '.igx-grid__tbody-content';

describe('IgxPivotGrid - Keyboard navigation #pivotGrid', () => {
    describe('General Keyboard Navigation', () => {
        let fixture: ComponentFixture<IgxPivotGridMultipleRowComponent>;
        let pivotGrid: IgxPivotGridComponent;
        let rowDimension: DebugElement;
        let headerRow: DebugElement;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxPivotGridMultipleRowComponent
                ],
                providers: [
                    IgxGridNavigationService
                ]
            }).compileComponents();
        }));

        beforeEach(fakeAsync(async () => {
            fixture = TestBed.createComponent(IgxPivotGridMultipleRowComponent);
            fixture.detectChanges();
            pivotGrid = fixture.componentInstance.pivotGrid;
            await fixture.whenStable();
            rowDimension = fixture.debugElement.query(
                By.css(CSS_CLASS_ROW_DIMENSION_CONTAINER));
            headerRow = fixture.debugElement.query(By.directive(IgxPivotHeaderRowComponent));
        }));

        it('should allow navigating between row headers', () => {
            const allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const firstCell = allGroups[0];
            const secondCell = allGroups.filter(x => x.componentInstance.column.field === 'Country')[0];
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fixture.detectChanges();

            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
            // for the row dimensions headers, the active descendant is set on the div having
            // tabindex="0" and class '.igx-grid__tbody-pivot-dimension';
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, firstCell.nativeElement.id);
            expect(firstCell.nativeElement.getAttribute('role')).toBe('rowheader');
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', firstCell.nativeElement);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(secondCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, secondCell.nativeElement.id);
            expect(firstCell.nativeElement.getAttribute('role')).toBe('rowheader');
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            // should do nothing if wrong key is pressed
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, firstCell.nativeElement.id);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
            UIInteractions.triggerKeyDownEvtUponElem('h', firstCell.nativeElement);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, firstCell.nativeElement.id);
        });

        it('should not go outside of the boundaries of the row dimensions content', () => {
            const allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const firstCell = allGroups[0];
            const thirdCell = allGroups.filter(x => x.componentInstance.column.field === 'Date')[0];
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', firstCell.nativeElement);
            fixture.detectChanges();

            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, firstCell.nativeElement.id);
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.simulateClickAndSelectEvent(thirdCell);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thirdCell.nativeElement);
            fixture.detectChanges();

            GridFunctions.verifyHeaderIsFocused(thirdCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, thirdCell.nativeElement.id);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
        });

        it('should allow navigating from first to last row headers in a row(Home/End)', () => {
            const allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const firstCell = allGroups[0];
            const thirdCell = allGroups.filter(x => x.componentInstance.column.field === 'Date')[0];
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('End', firstCell.nativeElement);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(thirdCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, thirdCell.nativeElement.id);
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('Home', thirdCell.nativeElement);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, firstCell.nativeElement.id);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
        });

        it('should allow navigating from first to last row headers(Ctrl + ArrowDown)', () => {
            let allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const thirdCell = allGroups.filter(x => x.componentInstance.column.field === 'Date')[0];
            UIInteractions.simulateClickAndSelectEvent(thirdCell);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', thirdCell.nativeElement, true, false, false, true);
            fixture.detectChanges();

            allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const lastCell = allGroups[allGroups.length - 1];
            GridFunctions.verifyHeaderIsFocused(lastCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, lastCell.nativeElement.id);
            const activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
        });

        it('should allow navigating from any to first row headers(Ctrl + ArrowUp)', () => {
            // Ctrl + arrowup
            let allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const thirdCell = allGroups.filter(x => x.componentInstance.column.field === 'ProductCategory')[2]
            UIInteractions.simulateClickAndSelectEvent(thirdCell);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', thirdCell.nativeElement, true, false, false, true);
            fixture.detectChanges();

            allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const firstCell = allGroups[0];
            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, firstCell.nativeElement.id);
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            // just arrow up
            UIInteractions.simulateClickAndSelectEvent(thirdCell);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', thirdCell.nativeElement, true, false, false, false);
            fixture.detectChanges();
            allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const secondCell = allGroups.filter(x => x.componentInstance.column.field === 'ProductCategory')[1];
            GridFunctions.verifyHeaderIsFocused(secondCell.parent);
            GridFunctions.verifyPivotElementActiveDescendant(rowDimension, secondCell.nativeElement.id);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

        });

        it('should allow navigating between column headers', () => {
            let firstHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[0];
            UIInteractions.simulateClickAndSelectEvent(firstHeader);
            fixture.detectChanges();

            firstHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[0];
            GridFunctions.verifyHeaderIsFocused(firstHeader.parent);
            // for the column headers, the active descendant is set on the header row element
            GridFunctions.verifyPivotElementActiveDescendant(headerRow, firstHeader.nativeElement.id);
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            const secondHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[1];
            GridFunctions.verifyHeaderIsFocused(secondHeader.parent);
            GridFunctions.verifyPivotElementActiveDescendant(headerRow, secondHeader.nativeElement.id);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
        });

        it('should allow navigating from first to last column headers', async () => {
            let firstHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[0];
            UIInteractions.simulateClickAndSelectEvent(firstHeader);
            fixture.detectChanges();

            firstHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[0];

            GridFunctions.verifyHeaderIsFocused(firstHeader.parent);
            GridFunctions.verifyPivotElementActiveDescendant(headerRow, firstHeader.nativeElement.id);
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('End', pivotGrid.theadRow.nativeElement);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const allHeaders = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`));
            const lastHeader = allHeaders[allHeaders.length - 1];
            GridFunctions.verifyHeaderIsFocused(lastHeader.parent);
            GridFunctions.verifyPivotElementActiveDescendant(headerRow, lastHeader.nativeElement.id);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
        });

        it('should allow navigating in column headers when switching focus from rows to columns', () => {
            const [firstCell] = fixture.debugElement.queryAll(
                By.css(`${PIVOT_TBODY_CSS_CLASS} ${PIVOT_ROW_DIMENSION_CONTENT} ${HEADER_CELL_CSS_CLASS}`));
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fixture.detectChanges();

            let firstHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[0];
            UIInteractions.simulateClickAndSelectEvent(firstHeader);
            fixture.detectChanges();

            firstHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[0];
            GridFunctions.verifyHeaderIsFocused(firstHeader.parent);
            GridFunctions.verifyPivotElementActiveDescendant(headerRow, firstHeader.nativeElement.id);
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', firstHeader.nativeElement);
            fixture.detectChanges();
            const secondHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[1];
            GridFunctions.verifyHeaderIsFocused(secondHeader.parent);
            GridFunctions.verifyPivotElementActiveDescendant(headerRow, secondHeader.nativeElement.id);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
        });

        it('should navigate properly among row dimension column headers for horizontal row layout', () => {
            pivotGrid.pivotUI = {
                ...pivotGrid.pivotUI,
                rowLayout: PivotRowLayoutType.Horizontal,
                showRowHeaders: true
            };
            fixture.detectChanges();

            let firstHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[0];
            UIInteractions.simulateClickAndSelectEvent(firstHeader);
            fixture.detectChanges();

            firstHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[0];
            GridFunctions.verifyHeaderIsFocused(firstHeader.parent);
            // for the row dimensions column headers in horizontal layout,
            // the active descendant is set on the header row element.
            GridFunctions.verifyPivotElementActiveDescendant(headerRow, firstHeader.nativeElement.id);
            expect(firstHeader.nativeElement.getAttribute('role')).toBe('columnheader');
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            const secondHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[1];
            GridFunctions.verifyHeaderIsFocused(secondHeader.parent);
            GridFunctions.verifyPivotElementActiveDescendant(headerRow, secondHeader.nativeElement.id);
            expect(firstHeader.nativeElement.getAttribute('role')).toBe('columnheader');
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
        });

        it('should allow navigating within the cells of the body', async () => {
            const cell = pivotGrid.rowList.first.cells.first;
            const tBodyContent = fixture.debugElement.query(By.css(CSS_CLASS_TBODY_CONTENT));
            GridFunctions.focusFirstCell(fixture, pivotGrid);
            fixture.detectChanges();
            expect(pivotGrid.navigation.activeNode.row).toBeUndefined();
            expect(pivotGrid.navigation.activeNode.column).toBeUndefined();

            UIInteractions.simulateClickAndSelectEvent(cell.nativeElement);
            fixture.detectChanges();

            GridFunctions.focusFirstCell(fixture, pivotGrid);
            fixture.detectChanges();
            expect(pivotGrid.navigation.activeNode.row).toBeDefined();
            expect(pivotGrid.navigation.activeNode.column).toBeDefined();
            // The activedescendant attribute for cells in the grid body
            //  is set on the tbody content div with tabindex='0'
            GridFunctions.verifyPivotElementActiveDescendant(tBodyContent, cell.nativeElement.id);

            let activeCells = fixture.debugElement.queryAll(By.css(`.igx-grid__td--active`));
            expect(activeCells.length).toBe(1);
            expect(cell.column.field).toEqual('Stanley-UnitsSold');

            const gridContent = GridFunctions.getGridContent(fixture);
            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            await wait(30);
            fixture.detectChanges();

            activeCells = fixture.debugElement.queryAll(By.css(`.igx-grid__td--active`));
            expect(activeCells.length).toBe(1);
            expect(activeCells[0].componentInstance.column.field).toEqual('Stanley-UnitPrice')
            GridFunctions.verifyPivotElementActiveDescendant(tBodyContent, activeCells[0].nativeElement.id);
        });
    });
    describe('Row Dimension Expand/Collapse Keyboard Interactions', () => {
        let fixture: ComponentFixture<IgxPivotGridTestBaseComponent>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxPivotGridTestBaseComponent
                ],
                providers: [
                    IgxGridNavigationService
                ]
            }).compileComponents();
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxPivotGridTestBaseComponent);
            fixture.detectChanges();
        }));

        it('should allow row dimension expand(Alt + ArrowDown/ArrowRight) and collapse(Alt + ArrowUp/ArrowLeft)', async () => {
            const rowDimension = fixture.debugElement.queryAll(
                By.css(CSS_CLASS_ROW_DIMENSION_CONTAINER));
            let allHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));

            expect(allHeaders.length).toBe(5, 'There should initially be 5 row dimension headers');

            UIInteractions.simulateClickAndSelectEvent(allHeaders[0]);
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', rowDimension[0], true);
            fixture.detectChanges();

            allHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));

            expect(allHeaders.length).toBe(1, 'There should be only 1 row dimension header after collapse with Alt + ArrowUp');

            UIInteractions.simulateClickAndSelectEvent(allHeaders[0]);
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', rowDimension[0], true);
            fixture.detectChanges();

            allHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));

            expect(allHeaders.length).toBe(5, 'There should be 5 row dimension headers after expand with Alt + ArrowDown');

            UIInteractions.simulateClickAndSelectEvent(allHeaders[0]);
            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', rowDimension[0], true);
            fixture.detectChanges();

            allHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));

            expect(allHeaders.length).toBe(1, 'There should be 1 row dimension header after collapse with Alt + ArrowLeft');

            UIInteractions.simulateClickAndSelectEvent(allHeaders[0]);
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', rowDimension[0], true);
            fixture.detectChanges();

            allHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));

            expect(allHeaders.length).toBe(5, 'There should be 5 row dimension headers after expand with Alt + ArrowRight');
        });
    });

    describe('headerNavigation with isRowDimensionHeaderActive', () => {
        let fixture: ComponentFixture<IgxPivotGridMultipleRowComponent>;
        let pivotGrid: IgxPivotGridComponent;
        let pivotNav: IgxPivotGridNavigationService;
        let headerRow: DebugElement;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxPivotGridMultipleRowComponent
                ],
                providers: [
                    IgxGridNavigationService
                ]
            }).compileComponents();
        }));

        beforeEach(fakeAsync(async () => {
            fixture = TestBed.createComponent(IgxPivotGridMultipleRowComponent);
            fixture.detectChanges();
            pivotGrid = fixture.componentInstance.pivotGrid;
            pivotNav = pivotGrid.navigation as IgxPivotGridNavigationService;
            await fixture.whenStable();
            headerRow = fixture.debugElement.query(By.directive(IgxPivotHeaderRowComponent));

            // Enable row headers so ArrowLeft on column 0 activates row dimension header navigation
            pivotGrid.pivotUI = { ...pivotGrid.pivotUI, showRowHeaders: true };
            fixture.detectChanges();
        }));

        /**
         * Helper: directly set activeNode to column 0 in header mode and press ArrowLeft
         * to set isRowDimensionHeaderActive=true with activeNode.column = lastRowDimensionsIndex.
         */
        const activateRowDimensionHeaderNav = () => {
            // Directly set activeNode to simulate "column header 0 is active" state
            // (bypasses the need to click on the correct header with showRowHeaders=true)
            pivotNav.activeNode = { row: -1, column: 0 };
            // ArrowLeft on column 0 with showRowHeaders=true → else if branch →
            // sets isRowDimensionHeaderActive=true and activeNode.column=lastRowDimensionsIndex
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();
        };

        it('should set isRowDimensionHeaderActive when pressing ArrowLeft at column 0 with showRowHeaders', () => {
            expect(pivotNav.isRowDimensionHeaderActive).toBeFalse();

            activateRowDimensionHeaderNav();

            expect(pivotNav.isRowDimensionHeaderActive).toBeTrue();
            // activeNode.column is set to lastRowDimensionsIndex (3 row dims → index 2)
            expect(pivotNav.activeNode.column).toBe(pivotNav.lastRowDimensionsIndex);
        });

        it('should move left within row dimension headers when isRowDimensionHeaderActive=true', () => {
            activateRowDimensionHeaderNav();
            expect(pivotNav.activeNode.column).toBe(pivotNav.lastRowDimensionsIndex);

            // ArrowLeft from index 2 → index 1
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            expect(pivotNav.activeNode.column).toBe(1);
        });

        it('should move to first row dimension header on Home key when isRowDimensionHeaderActive=true', () => {
            activateRowDimensionHeaderNav();
            expect(pivotNav.activeNode.column).toBe(pivotNav.lastRowDimensionsIndex);

            UIInteractions.triggerKeyDownEvtUponElem('Home', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            expect(pivotNav.activeNode.column).toBe(0);
        });

        it('should move right within row dimension headers when isRowDimensionHeaderActive=true', () => {
            activateRowDimensionHeaderNav();

            // Move left first to column 0
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();
            expect(pivotNav.activeNode.column).toBe(0);

            // ArrowRight from column 0 → column 1
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            expect(pivotNav.activeNode.column).toBe(1);
        });

        it('should move to last row dimension header on End key when isRowDimensionHeaderActive=true', () => {
            activateRowDimensionHeaderNav();

            // Move to column 0 first
            UIInteractions.triggerKeyDownEvtUponElem('Home', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();
            expect(pivotNav.activeNode.column).toBe(0);

            UIInteractions.triggerKeyDownEvtUponElem('End', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            expect(pivotNav.activeNode.column).toBe(pivotNav.lastRowDimensionsIndex);
        });

        it('should deactivate isRowDimensionHeaderActive when pressing ArrowRight at last row dimension', () => {
            activateRowDimensionHeaderNav();
            // activeNode.column = lastRowDimensionsIndex (2) after activating
            expect(pivotNav.activeNode.column).toBe(pivotNav.lastRowDimensionsIndex);

            // ArrowRight at the last row dimension → switches back to column header navigation
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            expect(pivotNav.isRowDimensionHeaderActive).toBeFalse();
            expect(pivotNav.activeNode.column).toBe(0);
        });

        it('should focus row cells (isRowHeaderActive) when pressing ArrowDown from row dimension header', () => {
            activateRowDimensionHeaderNav();

            expect(pivotNav.isRowDimensionHeaderActive).toBeTrue();
            expect(pivotNav.isRowHeaderActive).toBeFalse();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            // ArrowDown should deactivate row dimension header nav and activate row header nav
            expect(pivotNav.isRowDimensionHeaderActive).toBeFalse();
            expect(pivotNav.isRowHeaderActive).toBeTrue();
        });

        it('should sort dimension when pressing ctrl+ArrowDown with row=-1 in row dimension header nav', () => {
            activateRowDimensionHeaderNav();

            const col = pivotNav.activeNode.column;
            const dim = pivotGrid.visibleRowDimensions[col];
            const initialSortDirection = dim.sortDirection;

            spyOn(pivotGrid, 'sortDimension').and.callThrough();

            // ctrl+ArrowDown at row=-1 → sortDimension is called
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', pivotGrid.theadRow.nativeElement, true, false, false, true);
            fixture.detectChanges();

            expect(pivotGrid.sortDimension).toHaveBeenCalled();
        });

        it('should sort dimension when pressing ctrl+ArrowUp with row=-1 in row dimension header nav', () => {
            activateRowDimensionHeaderNav();

            spyOn(pivotGrid, 'sortDimension').and.callThrough();

            // ctrl+ArrowUp at row=-1 → sortDimension is called
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', pivotGrid.theadRow.nativeElement, true, false, false, true);
            fixture.detectChanges();

            expect(pivotGrid.sortDimension).toHaveBeenCalled();
        });

        it('should call super.headerNavigation for unhandled keys when isRowDimensionHeaderActive is false', () => {
            // When isRowDimensionHeaderActive=false and column > 0,
            // the else branch calls super.headerNavigation(event) which navigates columns.
            // Directly set activeNode to column 1 in header mode (no row dimension header active)
            pivotNav.activeNode = { row: -1, column: 1 };
            fixture.detectChanges();

            expect(pivotNav.isRowDimensionHeaderActive).toBeFalse();

            // Spy on the base class method to verify the else branch routes to super
            spyOn(IgxGridNavigationService.prototype, 'headerNavigation').and.callThrough();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            // isRowDimensionHeaderActive should remain false (else branch, not else-if)
            expect(pivotNav.isRowDimensionHeaderActive).toBeFalse();
            // super.headerNavigation was invoked (the else branch executed)
            expect(IgxGridNavigationService.prototype.headerNavigation).toHaveBeenCalled();
        });
    });
});
