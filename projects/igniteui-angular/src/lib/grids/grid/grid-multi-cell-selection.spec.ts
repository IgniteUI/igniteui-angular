import { async, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule } from './index';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { SelectionWithScrollsComponent } from '../../test-utils/grid-samples.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { HelperUtils } from '../../test-utils/helper-utils.spec';


describe('IgxGrid - Multi Cell selection', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SelectionWithScrollsComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
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

        it('Should be able to select a range with mouse dragging', () => {
            const firstCell = grid.getCellByColumn(0, 'ID');
            const secondCell = grid.getCellByColumn(2, 'Name');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            expect(grid.selectedCells.length).toBe(9);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 2, 2);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            const range = { rowStart: 0, rowEnd: 2, columnStart: 0, columnEnd: 2 };
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
        });

        it('Should be able to select multiple ranges with Ctrl key and mouse drag', () => {
            let firstCell = grid.getCellByColumn(1, 'ParentID');
            let secondCell = grid.getCellByColumn(2, 'Name');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            let range = { rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            expect(grid.selectedCells.length).toBe(4);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 2);

            firstCell = grid.getCellByColumn(2, 'ParentID');
            secondCell = grid.getCellByColumn(3, 'ID');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell, true);

            expect(grid.selectedCells.length).toBe(7);
            range = { rowStart: 2, rowEnd: 3, columnStart: 0, columnEnd: 1 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 2);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 0, 3, 1);
        });

        it('Should be able to select multiple cells with Ctrl key and mouse click', () => {
            const firstCell = grid.getCellByColumn(1, 'ParentID');
            const secondCell = grid.getCellByColumn(2, 'Name');
            const thirdCell = grid.getCellByColumn(0, 'ID');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulatePointerOverCellEvent('pointerdown', firstCell.nativeElement);
            UIInteractions.simulatePointerOverCellEvent('pointerup', firstCell.nativeElement);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.simulatePointerOverCellEvent('pointerdown', secondCell.nativeElement, false, true);
            UIInteractions.simulatePointerOverCellEvent('pointerup', secondCell.nativeElement);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            HelperUtils.verifyCellSelected(secondCell);
            expect(grid.selectedCells.length).toBe(2);

            UIInteractions.simulatePointerOverCellEvent('pointerdown', thirdCell.nativeElement, false, true);
            UIInteractions.simulatePointerOverCellEvent('pointerup', thirdCell.nativeElement);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            HelperUtils.verifyCellSelected(secondCell);
            HelperUtils.verifyCellSelected(thirdCell);
            expect(grid.selectedCells.length).toBe(3);
            expect(grid.getSelectedData()).toEqual([{ ParentID: 147 }, { Name: 'Monica Reyes' }, { ID: 475 }]);
            expect(grid.getSelectedRanges().length).toBe(3);
        });

        it('Should be able to select range when click on a cell and hold Shift key and click on another Cell', () => {
            const firstCell = grid.getCellByColumn(3, 'HireDate');
            const secondCell = grid.getCellByColumn(1, 'ID');
            const thirdCell = grid.getCellByColumn(0, 'Name');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            HelperUtils.selectCellsRangeWithShiftKeyNoWait(fix, firstCell, secondCell);
            expect(grid.selectedCells.length).toBe(12);
            let range = { rowStart: 1, rowEnd: 3, columnStart: 0, columnEnd: 3 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 0, 3, 3);

            UIInteractions.simulatePointerOverCellEvent('pointerdown', thirdCell.nativeElement, true);
            UIInteractions.simulatePointerOverCellEvent('pointerup', thirdCell.nativeElement);
            fix.detectChanges();

            expect(grid.selectedCells.length).toBe(8);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 2, 3, 3);
            range = { rowStart: 0, rowEnd: 3, columnStart: 2, columnEnd: 3 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            expect(grid.getSelectedRanges()).toEqual([range]);
        });

        it('Should be able to select range with Shift key when first cell is not visible', (async () => {
            const firstCell = grid.getCellByColumn(1, 'ID');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulatePointerOverCellEvent('pointerdown', firstCell.nativeElement);
            UIInteractions.simulatePointerOverCellEvent('pointerup', firstCell.nativeElement);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(firstCell);

            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fix.detectChanges();

            const secondCell = grid.getCellByColumn(7, 'ParentID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', secondCell.nativeElement, true);
            UIInteractions.simulatePointerOverCellEvent('pointerup', secondCell.nativeElement);
            await wait();
            fix.detectChanges();

            const expectedData1 = [
                { ID: 957, ParentID: 147 },
                { ID: 317, ParentID: 147 },
                { ID: 225, ParentID: 847 },
                { ID: 663, ParentID: 847 },
                { ID: 15, ParentID: 19 },
                { ID: 12, ParentID: 17 },
                { ID: 101, ParentID: 17 }
            ];
            let range = { rowStart: 1, rowEnd: 7, columnStart: 0, columnEnd: 1 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(grid.getSelectedData()).toEqual(expectedData1);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            expect(grid.getSelectedRanges()).toEqual([range]);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 0, 7, 1);

            const thirdCell = grid.getCellByColumn(6, 'Name');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', thirdCell.nativeElement, true);
            UIInteractions.simulatePointerOverCellEvent('pointerup', thirdCell.nativeElement);
            await wait();
            fix.detectChanges();

            range = { rowStart: 1, rowEnd: 6, columnStart: 0, columnEnd: 2 };
            const expectedData2 = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy' },
                { ID: 317, ParentID: 147, Name: 'Monica Reyes' },
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson' },
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards' },
                { ID: 15, ParentID: 19 , Name: 'Antonio Moreno'},
                { ID: 12, ParentID: 17, Name: 'Pedro Afonso' }
            ];
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            expect(grid.getSelectedRanges()).toEqual([range]);
            expect(grid.getSelectedData()).toEqual(expectedData2);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 0, 6, 2);

            grid.verticalScrollContainer.scrollTo(0);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 1, 0, 4, 2);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(grid.getSelectedData()).toEqual(expectedData2);
        }));

        it('Should update range selection when hold a Ctrl key and click on another cell', () => {
            const firstCell = grid.getCellByColumn(2, 'ID');
            const secondCell = grid.getCellByColumn(0, 'ParentID');
            const thirdCell = grid.getCellByColumn(0, 'Name');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range1 = { rowStart: 0, rowEnd: 2, columnStart: 0, columnEnd: 1 };
            const range2 = { rowStart: 0, rowEnd: 0, columnStart: 2, columnEnd: 2 };
            const range3 = { rowStart: 1, rowEnd: 1, columnStart: 1, columnEnd: 1 };
            const expectedData1 = [
                { ID: 475, ParentID: 147 },
                { ID: 957, ParentID: 147 },
                { ID: 317, ParentID: 147 }
            ];

            const expectedData2 = [
                { ID: 475, ParentID: 147, Name: 'Michael Langdon' },
                { ID: 957, ParentID: 147 },
                { ID: 317, ParentID: 147 }
            ];

            HelperUtils.selectCellsRangeWithShiftKeyNoWait(fix, firstCell, secondCell);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(grid.getSelectedData()).toEqual(expectedData1);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range1);
            expect(grid.getSelectedRanges()).toEqual([range1]);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 2, 1);

            // Click on another cell holding control
            UIInteractions.simulatePointerOverCellEvent('pointerdown', thirdCell.nativeElement, false, true);
            UIInteractions.simulatePointerOverCellEvent('pointerup', thirdCell.nativeElement);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(grid.getSelectedRanges()).toEqual([range1, range2]);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 2, 1);
            HelperUtils.verifyCellSelected(thirdCell);

            // Click on a cell in the region and verify it is not changed
            let cell = grid.getCellByColumn(1, 'ParentID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement, false, true);
            UIInteractions.simulatePointerOverCellEvent('pointerup', cell.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 2, 1);
            HelperUtils.verifyCellSelected(thirdCell);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(grid.getSelectedData()).toEqual(expectedData2);
            expect(grid.getSelectedRanges()).toEqual([range1, range2, range3]);

            // Click on a cell without holding Ctrl
            cell = grid.getCellByColumn(0, 'ID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement);
            UIInteractions.simulatePointerOverCellEvent('pointerup', cell.nativeElement);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(grid.getSelectedData()).toEqual([{ID: 475}]);
            expect(grid.getSelectedRanges()).toEqual([{ rowStart: 0, rowEnd: 0, columnStart: 0, columnEnd: 0 }]);
            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifyCellSelected(firstCell, false);
            HelperUtils.verifyCellSelected(secondCell, false);
            HelperUtils.verifyCellSelected(thirdCell, false);
        });
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
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            let cell = grid.getCellByColumn(1, 'ParentID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement);
            UIInteractions.simulatePointerOverCellEvent('pointerup', cell.nativeElement);
            await wait(50);
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);

            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 1);

            cell = grid.getCellByColumn(2, 'ParentID');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 2);

            cell = grid.getCellByColumn(2, 'Name');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 1, 2);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 1, 2, 3, false);

            cell = grid.getCellByColumn(1, 'Name');
            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(4);
            HelperUtils.verifyCellSelected(cell, false);
            cell = grid.getCellByColumn(1, 'ParentID');
            HelperUtils.verifyCellSelected(cell);

            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(5);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 0, 1, 1);
        }));

        it('Should be able to select and move scroll with arrow keys and holding Shift', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            let cell = grid.getCellByColumn(3, 'Name');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement);
            UIInteractions.simulatePointerOverCellEvent('pointerup', cell.nativeElement);
            await wait(50);
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 3, 3);

            cell = grid.getCellByColumn(3, 'HireDate');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 3, 4);

            cell = grid.getCellByColumn(3, 'Age');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(3);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 3, 5);

            cell = grid.getCellByColumn(3, 'OnPTO');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(4);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 4, 5);

            cell = grid.getCellByColumn(4, 'OnPTO');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(5);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 5, 5);

            cell = grid.getCellByColumn(5, 'OnPTO');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(6);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 2, 6, 5);
        }));

        it('Should not fire event when no new cells are selected', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range1 = { rowStart: 0, rowEnd: 1, columnStart: 1, columnEnd: 1 };
            const range2 = { rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 };

            let cell = grid.getCellByColumn(1, 'ParentID');
            UIInteractions.simulatePointerOverCellEvent('pointerdown', cell.nativeElement);
            UIInteractions.simulatePointerOverCellEvent('pointerup', cell.nativeElement);
            await wait(50);
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range1);
            expect(grid.getSelectedRanges()).toEqual([range1]);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 1, 1, 1);

            cell = grid.getCellByColumn(0, 'ParentID');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 1, 1, 1);
            expect(grid.getSelectedRanges()).toEqual([range1]);

            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range2);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 1, 0, 1);
            expect(grid.getSelectedRanges()).toEqual([range2]);

            cell = grid.getCellByColumn(0, 'ID');
            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 1, 0, 1);
            expect(grid.getSelectedRanges()).toEqual([range2]);
        }));
    });

    describe('MCS - features integration', () => {
        let fix;
        let grid;

        beforeEach(() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });


        it('Sorting -  selection should not change when sorting is performed', (async () => {
            const column = grid.getColumnByName('ID');
            column.sortable = true;
            // const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const firstCell = grid.getCellByColumn(1, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 1, 3, 1, 4);
            grid.sort({ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            const rowID = grid.selectedCells[0].cellID.rowID;
            HelperUtils.verifySelectedRange(grid, 1, 3, 1, 4);
            grid.clearSort();
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 1, 3, 1, 4);
            expect(grid.selectedCells[0].cellID.rowID).not.toBe(rowID);
        }));

        it('Sorting - selection containing selected cell out of the view should not change when sorting is performed', (async () => {
            const column = grid.getColumnByName('ID');
            column.sortable = true;
            // const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 2, rowEnd: 7, columnStart: 'ID', columnEnd: 'OnPTO' };
            grid.selectRange(range);
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            HelperUtils.verifySelectedRange(grid, 0, 5, 2, 7);
            grid.sort({ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 5, 2, 7);
            grid.clearSort();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 5, 2, 7);
        }));

        it('Filtering - selected range should not change when filtering is performed', (async () => {
            // const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const firstCell = grid.getCellByColumn(0, 'ParentID');
            const secondCell = grid.getCellByColumn(3, 'HireDate');
            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 3);
            grid.filter('Name', 'm', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 3);
            grid.clearFilter();
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 3);
        }));

        it('Filtering - selected range should not change when filtering result is smaller that selected range', (async () => {
            // const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 0, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 3, 0, 4);
            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);

            grid.filter('Name', 'm', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 3, 0, 4);
            grid.clearFilter();
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 0, 3, 0, 4);
        }));

        it('Filtering - selected range should not change when filtering result is empty that selected range', (async () => {
            // const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 0, rowEnd: 7, columnStart: 'ID', columnEnd: 'OnPTO' };
            grid.selectRange(range);
            HelperUtils.verifySelectedRange(grid, 0, 5, 0, 7);
            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);

            grid.filter('Name', 'leon', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 5, 0, 7);
            grid.clearFilter();
            fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 0, 5, 0, 7);

        }));
    });
});
