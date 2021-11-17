import { TestBed, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPivotGridComponent, IgxPivotGridModule } from 'igniteui-angular';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxPivotGridMultipleRowComponent } from '../../test-utils/pivot-grid-samples.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

const PIVOT_TBODY_CSS_CLASS = '.igx-grid__tbody';
const PIVOT_HEADER_ROW = 'igx-pivot-header-row';
const COLUMNS_HEADER_CSS_CLASS = '.igx-grid-thead__wrapper';
const HEADER_CELL_CSS_CLASS = '.igx-grid-th';
const ACTIVE_CELL_CSS_CLASS = '.igx-grid-th--active';

describe('IgxPivotGrid - Keyboard navigation #pGrid', () => {

    let fixture: ComponentFixture<IgxPivotGridMultipleRowComponent>;
    let pivotGrid: IgxPivotGridComponent;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxPivotGridMultipleRowComponent
            ],
            imports: [
                NoopAnimationsModule, IgxPivotGridModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridMultipleRowComponent);
        fixture.detectChanges();
        pivotGrid = fixture.componentInstance.pivotGrid;
    }));

    it('should allow navigating between row headers', () => {
        const [firstCell, secondCell] = fixture.debugElement.queryAll(
            By.css(`${PIVOT_TBODY_CSS_CLASS} ${COLUMNS_HEADER_CSS_CLASS} ${HEADER_CELL_CSS_CLASS}`));
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
    });

    it('should not go outside of the boundaries of the row dimensions content', () => {
        const [firstCell, _, thirdCell] = fixture.debugElement.queryAll(
            By.css(`${PIVOT_TBODY_CSS_CLASS} ${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`));
        UIInteractions.simulateClickAndSelectEvent(firstCell);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', firstCell.nativeElement);
        fixture.detectChanges();

        GridFunctions.verifyHeaderIsFocused(firstCell.parent);
        let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
        expect(activeCells.length).toBe(1);

        UIInteractions.simulateClickAndSelectEvent(thirdCell);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', firstCell.nativeElement);
        fixture.detectChanges();

        GridFunctions.verifyHeaderIsFocused(thirdCell.parent);
        activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
        expect(activeCells.length).toBe(1);
    });

    it('should allow navigating from first to last row headers in a row(Home/End)', () => {
        const [firstCell, _, thirdCell] = fixture.debugElement.queryAll(
            By.css(`${PIVOT_TBODY_CSS_CLASS} ${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`));
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

    it('should allow navigating from first to last row headers(Ctrl + End)', () => {
        const [firstCell] = fixture.debugElement.queryAll(
            By.css(`${PIVOT_TBODY_CSS_CLASS} ${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`));
        UIInteractions.simulateClickAndSelectEvent(firstCell);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('End', firstCell.nativeElement, false, false, false, true);
        fixture.detectChanges();

        const allCells = fixture.debugElement.queryAll(
            By.css(`${PIVOT_TBODY_CSS_CLASS} ${PIVOT_HEADER_ROW} ${HEADER_CELL_CSS_CLASS}`));
        const lastCell = allCells[allCells.length - 1];
        fixture.detectChanges();
        GridFunctions.verifyHeaderIsFocused(lastCell.parent);
        const activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
        expect(activeCells.length).toBe(1);

        const scrollTop = pivotGrid.verticalScrollContainer.getScroll().scrollTop;
        const scrollHeight = pivotGrid.verticalScrollContainer.getScroll().scrollHeight;
        const tbody = fixture.debugElement.query(By.css(`${PIVOT_TBODY_CSS_CLASS}`)).nativeElement;
        const scrolledToBottom = Math.round(scrollTop + tbody.scrollHeight) === scrollHeight;
        expect(scrolledToBottom).toBeTruthy();
    });

    it('should allow navigating between column headers', () => {
        const [firstHeader, secondHeader] = fixture.debugElement.queryAll(
            By.css(`${COLUMNS_HEADER_CSS_CLASS} ${HEADER_CELL_CSS_CLASS}`));
        UIInteractions.simulateClickAndSelectEvent(firstHeader);
        fixture.detectChanges();

        GridFunctions.verifyHeaderIsFocused(firstHeader.parent);
        let  activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
        expect(activeCells.length).toBe(1);

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', firstHeader.nativeElement);
        fixture.detectChanges();
        GridFunctions.verifyHeaderIsFocused(secondHeader.parent);
        activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
        expect(activeCells.length).toBe(1);
    });
    it('should allow navigating from first to last column headers', () => {
        const [firstHeader] = fixture.debugElement.queryAll(
            By.css(`${COLUMNS_HEADER_CSS_CLASS} ${HEADER_CELL_CSS_CLASS}`));
        UIInteractions.simulateClickAndSelectEvent(firstHeader);
        fixture.detectChanges();

        GridFunctions.verifyHeaderIsFocused(firstHeader.parent);
        let activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
        expect(activeCells.length).toBe(1);

        UIInteractions.triggerKeyDownEvtUponElem('End', firstHeader.nativeElement);
        fixture.detectChanges();

        const allHeaders = fixture.debugElement.queryAll(
            By.css(`${COLUMNS_HEADER_CSS_CLASS} ${HEADER_CELL_CSS_CLASS}`));
        const lastHeader = allHeaders[length - 1];
        GridFunctions.verifyHeaderIsFocused(lastHeader.parent);
        activeCells = fixture.debugElement.queryAll(By.css(`${ACTIVE_CELL_CSS_CLASS}`));
        expect(activeCells.length).toBe(1);
    });
});
