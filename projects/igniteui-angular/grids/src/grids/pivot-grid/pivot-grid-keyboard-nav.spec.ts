import { TestBed, fakeAsync, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxPivotGridMultipleRowComponent, IgxPivotGridTestBaseComponent } from '../../test-utils/pivot-grid-samples.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';
import { DebugElement } from '@angular/core';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { PivotRowLayoutType } from 'igniteui-angular';

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
});
