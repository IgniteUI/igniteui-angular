import { async, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule} from './index';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { SelectionWithScrollsComponent } from '../../test-utils/grid-samples.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { HelperUtils } from '../../test-utils/helper-utils.spec';


describe('IgxGrid - Multi Cell selection', () => {
     configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SelectionWithScrollsComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    describe('Base', () => {
        let fix;
        let grid;

        beforeEach(() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Should be able to select a range with mouse dragging', (async () => {
            const firstCell = grid.getCellByColumn(0, 'ID');
            const secondCell = grid.getCellByColumn(2, 'Name');

            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            expect(grid.selectedCells.length).toBe(9);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 2, 2);
        }));

        it('Should be able to select multiple ranges with Ctrl key and mouse drag', (async () => {
            let firstCell = grid.getCellByColumn(1, 'ParentID');
            let secondCell = grid.getCellByColumn(2, 'Name');

            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            expect(grid.selectedCells.length).toBe(4);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 2);

            firstCell = grid.getCellByColumn(2, 'ParentID');
            secondCell = grid.getCellByColumn(3, 'ID');
            await HelperUtils.selectCellsRange(fix, firstCell, secondCell, true);

            expect(grid.selectedCells.length).toBe(7);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 2);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 0, 3, 1);
        }));

        it('Should be able to select multiple cells with Ctrl key and mouse click', (async () => {
            const firstCell = grid.getCellByColumn(1, 'ParentID');
            const secondCell = grid.getCellByColumn(2, 'Name');
            const thirdCell = grid.getCellByColumn(0, 'ID');

            UIInteractions.simulatePointerOverCellEvent('pointerdown', firstCell.nativeElement);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.simulatePointerOverCellEvent('pointerdown', secondCell.nativeElement, false, true);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(firstCell);
            HelperUtils.verifyCellSelected(secondCell);
            expect(grid.selectedCells.length).toBe(2);

            UIInteractions.simulatePointerOverCellEvent('pointerdown', thirdCell.nativeElement, false, true);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(firstCell);
            HelperUtils.verifyCellSelected(secondCell);
            HelperUtils.verifyCellSelected(thirdCell);
            expect(grid.selectedCells.length).toBe(3);
        }));

        it('Should be able to select range when click on a cell and hold Shift key and click on another Cell', (async () => {
            const firstCell = grid.getCellByColumn(3, 'HireDate');
            const secondCell = grid.getCellByColumn(1, 'ID');
            const thirdCell = grid.getCellByColumn(0, 'Name');

            await HelperUtils.selectCellsRangeWithShiftKey(fix, firstCell, secondCell);
            expect(grid.selectedCells.length).toBe(12);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 0, 3, 3);

            UIInteractions.simulatePointerOverCellEvent('pointerdown', thirdCell.nativeElement, true);
            await wait();
            fix.detectChanges();

            expect(grid.selectedCells.length).toBe(6);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 1, 2);
        }));

        it('Should be able to select range with Shift key when first cell is not visible', (async () => {
            const firstCell = grid.getCellByColumn(1, 'ID');

            UIInteractions.simulatePointerOverCellEvent('pointerdown', firstCell.nativeElement);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(firstCell);

            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fix.detectChanges();

            const secondCell = grid.getCellByColumn(7, 'ParentID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', secondCell.nativeElement, true);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 3, 0, 7, 1);

            grid.verticalScrollContainer.scrollTo(0);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 1, 0, 4, 1);
        }));

        it('Should update range selection when hold a Ctrl key and click on another cell', (async () => {
            const firstCell = grid.getCellByColumn(2, 'ID');
            const secondCell = grid.getCellByColumn(0, 'ParentID');
            const thirdCell = grid.getCellByColumn(0, 'Name');

            await HelperUtils.selectCellsRangeWithShiftKey(fix, firstCell, secondCell);

            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 2, 1);

            // Click on another cell holding control
            UIInteractions.simulatePointerOverCellEvent('pointerdown', thirdCell.nativeElement, false, true);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 2, 1);
            HelperUtils.verifyCellSelected(thirdCell);

            // Click on a cell in the region and verify it is not changed
            let cell = grid.getCellByColumn(1, 'ParentID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement, false, true);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 2, 1);
            HelperUtils.verifyCellSelected(thirdCell);

            // Click on a cell without holding Ctrl
            cell = grid.getCellByColumn(0, 'ID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifyCellSelected(firstCell, false);
            HelperUtils.verifyCellSelected(secondCell, false);
            HelperUtils.verifyCellSelected(thirdCell, false);
        }));
    });

    describe('Keyboard navigation', () => {
        let fix;
        let grid;

        beforeEach(() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Should be able to select a with arrow keys and holding Shift', (async () => {
            let cell = grid.getCellByColumn(1, 'ParentID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement);
            await wait(50);
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 1);

            cell = grid.getCellByColumn(2, 'ParentID');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 2);

            cell = grid.getCellByColumn(2, 'Name');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, true);
             fix.detectChanges();
            await wait(50);

            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 1, 2);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 1, 2, 3, false);

            cell = grid.getCellByColumn(1, 'Name');
            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            HelperUtils.verifyCellSelected(cell, false);
            cell = grid.getCellByColumn(1, 'ParentID');
            HelperUtils.verifyCellSelected(cell);

            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            HelperUtils.verifyCellsRegionSelected(grid, 1, 0, 1, 1);
        }));

        it('Should be able to select a with arrow keys and holding Shift', (async () => {
            let cell = grid.getCellByColumn(3, 'Name');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement);
            await wait(50);
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(150);

            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 3, 3);

            cell = grid.getCellByColumn(3, 'HireDate');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(150);

            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 3, 4);

            cell = grid.getCellByColumn(3, 'Age');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(150);

            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 3, 5);

            cell = grid.getCellByColumn(3, 'OnPTO');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(150);

            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 4, 5);

            cell = grid.getCellByColumn(4, 'OnPTO');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(150);

            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 5, 5);

            cell = grid.getCellByColumn(5, 'OnPTO');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(150);

            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 6, 5);
        }));
    });
});
