import { TestBed, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxPivotGridMultipleRowComponent, IgxPivotGridTestBaseComponent } from '../../test-utils/pivot-grid-samples.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';

const DEBOUNCE_TIME = 250;
const PIVOT_TBODY_CSS_CLASS = '.igx-grid__tbody';
const PIVOT_ROW_DIMENSION_CONTENT = 'igx-pivot-row-dimension-content';
const PIVOT_HEADER_ROW = 'igx-pivot-header-row';
const HEADER_CELL_CSS_CLASS = '.igx-grid-th';
const ACTIVE_CELL_CSS_CLASS = '.igx-grid-th--active';

describe('IgxPivotGrid - Keyboard navigation #pivotGrid', () => {
    describe('General Keyboard Navigation', () => {
        let fixture: ComponentFixture<IgxPivotGridMultipleRowComponent>;
        let pivotGrid: IgxPivotGridComponent;
        configureTestSuite((() => {
            return TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxPivotGridMultipleRowComponent
                ]
            });
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxPivotGridMultipleRowComponent);
            fixture.detectChanges();
            pivotGrid = fixture.componentInstance.pivotGrid;
        }));

        it('should allow navigating between row headers', () => {
            const allGroups = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const firstCell = allGroups[0];
            const secondCell = allGroups.filter(x => x.componentInstance.column.field === 'Country')[0];
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fixture.detectChanges();

            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
            let  activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', firstCell.nativeElement);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(secondCell.parent);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            // should do nothing if wrong key is pressed
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
            UIInteractions.triggerKeyDownEvtUponElem('h', firstCell.nativeElement);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
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
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.simulateClickAndSelectEvent(thirdCell);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thirdCell.nativeElement);
            fixture.detectChanges();

            GridFunctions.verifyHeaderIsFocused(thirdCell.parent);
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
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('Home', thirdCell.nativeElement);
            fixture.detectChanges();
            GridFunctions.verifyHeaderIsFocused(firstCell.parent);
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
            let  activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', pivotGrid.theadRow.nativeElement);
            fixture.detectChanges();

            const secondHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[1];
            GridFunctions.verifyHeaderIsFocused(secondHeader.parent);
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
            let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('End', pivotGrid.theadRow.nativeElement);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const allHeaders = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`));
            const lastHeader = allHeaders[allHeaders.length - 1];
            GridFunctions.verifyHeaderIsFocused(lastHeader.parent);
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
            let  activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', firstHeader.nativeElement);
            fixture.detectChanges();
            const secondHeader = fixture.debugElement.queryAll(
                By.css(`${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`))[1];
            GridFunctions.verifyHeaderIsFocused(secondHeader.parent);
            activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
            expect(activeCells.length).toBe(1);
        });

        it('should allow navigating within the cells of the body', async () => {
            const cell = pivotGrid.rowList.first.cells.first;
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

            let  activeCells = fixture.debugElement.queryAll(By.css(`.igx-grid__td--active`));
            expect(activeCells.length).toBe(1);
            expect(cell.column.field).toEqual('Stanley-UnitsSold');

            const gridContent = GridFunctions.getGridContent(fixture);
            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            await wait(30);
            fixture.detectChanges();

            activeCells = fixture.debugElement.queryAll(By.css(`.igx-grid__td--active`));
            expect(activeCells.length).toBe(1);
            expect(activeCells[0].componentInstance.column.field).toEqual('Stanley-UnitPrice')
        });
    });
    describe('Row Dimension Expand/Collapse Keyboard Interactions', () => {
        let fixture: ComponentFixture<IgxPivotGridTestBaseComponent>;
        configureTestSuite((() => {
            return TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxPivotGridTestBaseComponent
                ]
            });
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxPivotGridTestBaseComponent);
            fixture.detectChanges();
        }));

        it('should allow row dimension expand(Alt + ArrowDown/ArrowRight) and collapse(Alt + ArrowUp/ArrowLeft)', async () => {
            const rowDimension = fixture.debugElement.queryAll(
                By.css(`.igx-grid__tbody-pivot-dimension`));
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
