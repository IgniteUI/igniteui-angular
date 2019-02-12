import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule, IgxGridGroupByRowComponent } from './index';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { SelectionWithScrollsComponent, SelectionWithTransactionsComponent } from '../../test-utils/grid-samples.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { HelperUtils } from '../../test-utils/helper-utils.spec';
import { DefaultSortingStrategy } from 'igniteui-angular';


describe('IgxGrid - Multi Cell selection', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SelectionWithScrollsComponent,
                SelectionWithTransactionsComponent
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
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const startCell =  grid.getCellByColumn(2, 'ParentID');
            const endCell =  grid.getCellByColumn(3, 'ID');
            const range = { rowStart: 2, rowEnd: 3, columnStart: 0, columnEnd: 1 };

            UIInteractions.simulateClickAndSelectCellEvent(startCell);
            fix.detectChanges();

            expect(startCell.focused).toBe(true);

            for (let i = 3; i < 5; i++) {
              const cell = grid.getCellByColumn(i, grid.columns[i - 1].field);
              UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
              fix.detectChanges();
              HelperUtils.verifyCellsRegionSelected(grid, 2, i, 1, i - 1);
            }

            for (let i = 3; i >= 0; i--) {
                const cell = grid.getCellByColumn(i, 'HireDate');
                UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
                fix.detectChanges();
                HelperUtils.verifyCellsRegionSelected(grid, 2, i, 1, 3);
            }

            for (let i = 2; i >= 0; i--) {
                const cell = grid.getCellByColumn(0, grid.columns[i].field);
                UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
                fix.detectChanges();
                HelperUtils.verifyCellsRegionSelected(grid, 2, 0, 1, i);
            }

            for (let i = 1; i < 4; i++) {
                const cell = grid.getCellByColumn(i, 'ID');
                UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
                fix.detectChanges();
                HelperUtils.verifyCellsRegionSelected(grid, 2, i, 1, 0);
            }

            UIInteractions.simulatePointerOverCellEvent('pointerup', endCell.nativeElement);
            fix.detectChanges();

            expect(startCell.focused).toBe(true);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 3, 1, 0);
            HelperUtils.verifySelectedRange(grid, 2, 2, 1, 1, 0, 2);
            HelperUtils.verifySelectedRange(grid, 2, 3, 0, 1, 1, 2);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
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
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 1, 2);

            firstCell = grid.getCellByColumn(2, 'ParentID');
            secondCell = grid.getCellByColumn(3, 'ID');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell, true);

            expect(grid.selectedCells.length).toBe(7);
            range = { rowStart: 2, rowEnd: 3, columnStart: 0, columnEnd: 1 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 1, 2);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 3, 0, 1);
        });

        it('Should be able to select multiple cells with Ctrl key and mouse click', () => {
            const firstCell = grid.getCellByColumn(1, 'ParentID');
            const secondCell = grid.getCellByColumn(2, 'Name');
            const thirdCell = grid.getCellByColumn(0, 'ID');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.simulateClickAndSelectCellEvent(secondCell, false, true);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            HelperUtils.verifyCellSelected(secondCell);
            expect(grid.selectedCells.length).toBe(2);

            UIInteractions.simulateClickAndSelectCellEvent(thirdCell, false, true);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            HelperUtils.verifyCellSelected(secondCell);
            HelperUtils.verifyCellSelected(thirdCell);
            expect(grid.selectedCells.length).toBe(3);
            expect(grid.getSelectedData()).toEqual([{ ParentID: 147 }, { Name: 'Monica Reyes' }, { ID: 475 }]);
            HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1, 0, 3);
            HelperUtils.verifySelectedRange(grid, 2, 2, 2, 2, 1, 3);
            HelperUtils.verifySelectedRange(grid, 0, 0, 0, 0, 2, 3);
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
            HelperUtils.verifyCellsRegionSelected(grid, 1, 3, 0, 3);

            UIInteractions.simulateClickAndSelectCellEvent(thirdCell, true);
            fix.detectChanges();

            expect(grid.selectedCells.length).toBe(8);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 3, 2, 3);
            range = { rowStart: 0, rowEnd: 3, columnStart: 2, columnEnd: 3 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            expect(grid.getSelectedRanges()).toEqual([range]);
        });

        it('Should be able to select range with Shift key when first cell is not visible', (async () => {
            const firstCell = grid.getCellByColumn(1, 'ID');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(firstCell);

            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fix.detectChanges();

            const secondCell = grid.getCellByColumn(7, 'ParentID');
            UIInteractions.simulateClickAndSelectCellEvent(secondCell, true);
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
            HelperUtils.verifyCellsRegionSelected(grid, 3, 7, 0, 1);

            const thirdCell = grid.getCellByColumn(6, 'Name');
            UIInteractions.simulateClickAndSelectCellEvent(thirdCell, true);
            await wait();
            fix.detectChanges();

            range = { rowStart: 1, rowEnd: 6, columnStart: 0, columnEnd: 2 };
            const expectedData2 = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy' },
                { ID: 317, ParentID: 147, Name: 'Monica Reyes' },
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson' },
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards' },
                { ID: 15, ParentID: 19, Name: 'Antonio Moreno' },
                { ID: 12, ParentID: 17, Name: 'Pedro Afonso' }
            ];
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            expect(grid.getSelectedRanges()).toEqual([range]);
            expect(grid.getSelectedData()).toEqual(expectedData2);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 6, 0, 2);

            grid.verticalScrollContainer.scrollTo(0);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 2);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(grid.getSelectedData()).toEqual(expectedData2);
        }));

        it('Should update range selection when hold a Ctrl key and click on another cell', () => {
            const firstCell = grid.getCellByColumn(2, 'ID');
            const secondCell = grid.getCellByColumn(0, 'ParentID');
            const thirdCell = grid.getCellByColumn(0, 'Name');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
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
            expect(selectionChangeSpy).toHaveBeenCalledWith({ rowStart: 0, rowEnd: 2, columnStart: 0, columnEnd: 1 });
            expect(grid.getSelectedData()).toEqual(expectedData1);
            HelperUtils.verifySelectedRange(grid, 0, 2, 0, 1);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 2, 0, 1);

            // Click on another cell holding control
            UIInteractions.simulateClickAndSelectCellEvent(thirdCell, false, true);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 0, 2, 0, 1, 0, 2);
            HelperUtils.verifySelectedRange(grid, 0, 0, 2, 2, 1, 2);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 2, 0, 1);
            HelperUtils.verifyCellSelected(thirdCell);

            // Click on a cell in the region and verify it is not changed
            let cell = grid.getCellByColumn(1, 'ParentID');
            UIInteractions.simulateClickAndSelectCellEvent(cell, false, true);
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 0, 2, 0, 1);
            HelperUtils.verifyCellSelected(thirdCell);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(grid.getSelectedData()).toEqual(expectedData2);
            HelperUtils.verifySelectedRange(grid, 0, 2, 0, 1, 0, 3);
            HelperUtils.verifySelectedRange(grid, 0, 0, 2, 2, 1, 3);
            HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1, 2, 3);

            // Click on a cell without holding Ctrl
            cell = grid.getCellByColumn(0, 'ID');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(grid.getSelectedData()).toEqual([{ ID: 475 }]);
            HelperUtils.verifySelectedRange(grid, 0, 0, 0, 0);
            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifyCellSelected(firstCell, false);
            HelperUtils.verifyCellSelected(secondCell, false);
            HelperUtils.verifyCellSelected(thirdCell, false);
        });
    });

    describe('API', () => {
        let fix;
        let grid;

        beforeEach(() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Should select a single cell', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 2, rowEnd: 2, columnStart: 1, columnEnd: 1 };
            const cell = grid.getCellByColumn(2, 'ParentID');
            const expectedData = [
                { ParentID: 147 }
            ];
            grid.selectRange(range);
            fix.detectChanges();

            HelperUtils.verifyCellSelected(cell);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
            expect(grid.getSelectedRanges()).toEqual([range]);
        });

        it('Should select a region', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 0, rowEnd: 2, columnStart: 'Name', columnEnd: 'ParentID' };
            const expectedData = [
                { ParentID: 147, Name: 'Michael Langdon' },
                { ParentID: 147, Name: 'Thomas Hardy' },
                { ParentID: 147, Name: 'Monica Reyes' }
            ];
            grid.selectRange(range);
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 0, 2, 1, 2);
            HelperUtils.verifySelectedRange(grid, 0, 2, 1, 2);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
        });

        it('Should select a region when one of cells is not visible', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 3, rowEnd: 7, columnStart: 'ID', columnEnd: 'ParentID' };
            const expectedData = [
                { ID: 225, ParentID: 847 },
                { ID: 663, ParentID: 847 },
                { ID: 15, ParentID: 19 },
                { ID: 12, ParentID: 17 },
                { ID: 101, ParentID: 17 }
            ];

            grid.selectRange(range);
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 3, 4, 0, 1);
            HelperUtils.verifySelectedRange(grid, 3, 7, 0, 1);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);

            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 4, 7, 0, 1);
            HelperUtils.verifySelectedRange(grid, 3, 7, 0, 1);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
        }));

        it('Should select a region when two of cells are not visible', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 6, rowEnd: 6, columnStart: 'OnPTO', columnEnd: 'Age' };
            const expectedData = [
                { Age: 50, OnPTO: false }
            ];

            grid.selectRange(range);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 6, 6, 4, 5);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);

            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fix.detectChanges();

            grid.dataRowList.first.virtDirRow.scrollTo(5);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 6, 6, 4, 5);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
            HelperUtils.verifyCellsRegionSelected(grid, 6, 6, 4, 5);
        }));

        it('Should add new range when there is already added range', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range1 = { rowStart: 0, rowEnd: 1, columnStart: 'ID', columnEnd: 'ParentID' };
            const range2 = { rowStart: 1, rowEnd: 2, columnStart: 'ParentID', columnEnd: 'Name' };
            const expectedData1 = [
                { ID: 475, ParentID: 147 },
                { ID: 957, ParentID: 147 }
            ];
            const expectedData2 = [
                { ID: 475, ParentID: 147 },
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy' },
                { ParentID: 147, Name: 'Monica Reyes' }
            ];

            grid.selectRange(range1);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 1, 0, 1);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData1);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 1, 0, 1);

            grid.selectRange(range2);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 1, 0, 1, 0, 2);
            HelperUtils.verifySelectedRange(grid, 1, 2, 1, 2, 1, 2);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData2);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 1, 0, 1);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 1, 2);
        });

        it('Should add multiple ranges', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range1 = { rowStart: 0, rowEnd: 0, columnStart: 'ID', columnEnd: 'ParentID' };
            const range2 = { rowStart: 2, rowEnd: 3, columnStart: 'ParentID', columnEnd: 'Name' };
            const expectedData = [
                { ID: 475, ParentID: 147 },
                { ParentID: 147, Name: 'Monica Reyes' },
                { ParentID: 147, Name: 'Laurence Johnson' }
            ];

            grid.selectRange([range1, range2]);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 0, 0, 1, 0, 2);
            HelperUtils.verifySelectedRange(grid, 2, 3, 1, 2, 1, 2);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 0, 0, 1);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 3, 1, 2);
        });

        it('Should add multiple ranges when they have same cells', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range1 = { rowStart: 1, rowEnd: 3, columnStart: 'ID', columnEnd: 'ParentID' };
            const range2 = { rowStart: 3, rowEnd: 1, columnStart: 'ParentID', columnEnd: 'ID' };
            const expectedData = [
                { ID: 957, ParentID: 147 },
                { ID: 317, ParentID: 147 },
                { ID: 225, ParentID: 847 }
            ];

            grid.selectRange([range1, range2]);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 1);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 3, 0, 1);
        });

        it('Should add multiple ranges when some of their cells are same', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range1 = { rowStart: 1, rowEnd: 3, columnStart: 'ID', columnEnd: 'ParentID' };
            const range2 = { rowStart: 4, rowEnd: 2, columnStart: 'ParentID', columnEnd: 'ID' };
            const expectedData = [
                { ID: 957, ParentID: 147 },
                { ID: 317, ParentID: 147 },
                { ID: 225, ParentID: 847 },
                { ID: 663, ParentID: 847 }
            ];

            grid.selectRange([range1, range2]);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 1);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 1);
        });

        it('Should not add range when column is hidden', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 1, rowEnd: 3, columnStart: 'ID', columnEnd: 'Name' };
            grid.getColumnByName('Name').hidden = true;
            fix.detectChanges();

            let errorMessage = '';
            try {
                grid.selectRange(range);
            } catch (error) {
                errorMessage = error.message;
            }
            finally {
                fix.detectChanges();
            }
            expect(errorMessage).toEqual('Cannot read property \'visibleIndex\' of undefined');
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual([]);
            expect(grid.getSelectedRanges()).toEqual([]);
        });

        it('Should not add range when column is hidden and there is already selected range', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range1 = { rowStart: 1, rowEnd: 2, columnStart: 'ID', columnEnd: 'Name' };
            const range2 = { rowStart: 0, rowEnd: 4, columnStart: 'ParentID', columnEnd: 'OnPTO' };
            const expectedData = [
                { ID: 957, Name: 'Thomas Hardy' },
                { ID: 317, Name: 'Monica Reyes' }
            ];
            grid.getColumnByName('ParentID').hidden = true;
            fix.detectChanges();

            grid.selectRange(range1);
            fix.detectChanges();
            HelperUtils.verifySelectedRange(grid, 1, 2, 0, 1);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 0, 1);

            let errorMessage = '';
            try {
                grid.selectRange(range2);
            } catch (error) {
                errorMessage = error.message;
            }
            finally {
                fix.detectChanges();
            }
            expect(errorMessage).toEqual('Cannot read property \'visibleIndex\' of undefined');
            HelperUtils.verifySelectedRange(grid, 1, 2, 0, 1);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual(expectedData);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 0, 1);
        });

        it('Should not add range when column does not exist', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 1, rowEnd: 3, columnStart: 'NotExisting', columnEnd: 'Name' };

            let errorMessage = '';
            try {
                grid.selectRange(range);
            } catch (error) {
                errorMessage = error.message;
            }
            finally {
                fix.detectChanges();
            }
            expect(errorMessage).toEqual('Cannot read property \'visibleIndex\' of undefined');
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedData()).toEqual([]);
            expect(grid.getSelectedRanges()).toEqual([]);
        });

        it('Should add range when row does not exist', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: -7, rowEnd: 100, columnStart: 'ID', columnEnd: 'ID' };
            const expectedData = [
                { ID: 475 },
                { ID: 957 },
                { ID: 317 },
                { ID: 225 },
                { ID: 663 },
                { ID: 15 },
                { ID: 12 },
                { ID: 101 }
            ];

            grid.selectRange(range);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, -7, 100, 0, 0);
            expect(grid.getSelectedData()).toEqual(expectedData);
        });

        it('Should add range when columnStart index does not exist', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 0, rowEnd: 1, columnStart: -4, columnEnd: 0 };
            const expectedData = [
                { ID: 475 },
                { ID: 957 }
            ];

            grid.selectRange(range);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 0, 1, -4, 0);
            expect(grid.getSelectedData()).toEqual(expectedData);
        });

        it('Should add range when columnStart index does not exist', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 1, rowEnd: 2, columnStart: 5, columnEnd: 10 };
            const expectedData = [
                { OnPTO: true },
                { OnPTO: false }
            ];

            grid.selectRange(range);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 1, 2, 5, 10);
            expect(grid.getSelectedData()).toEqual(expectedData);
        });

        it('Should not add range when columnStart and columnEnd indexes do not exist', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 1, rowEnd: 2, columnStart: 10, columnEnd: 100 };

            grid.selectRange(range);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 1, 2, 10, 100);
            expect(grid.getSelectedData()).toEqual([]);
        });

        it('Should be able to clear the selected ranges', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 };
            const expectedData = [
                { ParentID: 147, Name: 'Thomas Hardy' },
                { ParentID: 147, Name: 'Monica Reyes' }
            ];
            grid.selectRange(range);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 1, 2, 1, 2);
            expect(grid.getSelectedData()).toEqual(expectedData);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 1, 2);

            grid.selectRange();
            fix.detectChanges();
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            expect(grid.getSelectedRanges().length).toEqual(0);
            expect(grid.getSelectedData()).toEqual([]);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 1, 2, false);
        });

        it('Should be able to clear the selection when a single cell is selected', () => {
            const cell = grid.getCellByColumn(1, 'ParentID');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fix.detectChanges();

            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1);

            grid.selectRange(null);
            fix.detectChanges();
            expect(grid.getSelectedRanges().length).toEqual(0);
            expect(grid.getSelectedData()).toEqual([]);
            HelperUtils.verifyCellSelected(cell, false);
        });

        it('Should be able to clear the selection when there are no selected cells', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            grid.selectRange();
            fix.detectChanges();
            expect(grid.getSelectedRanges().length).toEqual(0);
            expect(grid.getSelectedData()).toEqual([]);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
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
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);

            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 1, 1);
            // HelperUtils.verifySelectedRange(grid, 1, 2, 1, 1, 0, 2);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1, 1, 2);

            cell = grid.getCellByColumn(2, 'ParentID');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 1, 2);
            // HelperUtils.verifySelectedRange(grid, 1, 2, 1, 2, 0, 2);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1, 1, 2);

            cell = grid.getCellByColumn(2, 'Name');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 1, 2);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 2, 1, 3, false);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 1, 2, 0, 2);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1, 1, 2);

            cell = grid.getCellByColumn(1, 'Name');
            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(4);
            HelperUtils.verifyCellSelected(cell, false);
            cell = grid.getCellByColumn(1, 'ParentID');
            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1);

            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            fix.detectChanges();
            await wait(50);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(5);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 0, 1);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 0, 1, 0, 2);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1, 1, 2);
        }));

        it('Should be able to select and move scroll with arrow keys and holding Shift', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            let cell = grid.getCellByColumn(1, 'Name');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);

            for (let i = 3; i < 6; i++) {
                cell = grid.getCellByColumn(1, grid.columns[i - 1].field);
                UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
                await wait(100);
                fix.detectChanges();
            }

            expect(selectionChangeSpy).toHaveBeenCalledTimes(3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 1, 2, 5);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 2, 5, 1, 2);

            for (let i = 1; i < 6; i++) {
                cell = grid.getCellByColumn(i, 'OnPTO');
                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
                await wait(100);
                fix.detectChanges();
            }
            expect(selectionChangeSpy).toHaveBeenCalledTimes(8);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 6, 2, 5);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(grid, 1, 7, 2, 5, 1, 2);

            for (let i = 7; i > 0; i--) {
                cell = grid.getCellByColumn(i, 'OnPTO');
                UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, true);
                await wait(100);
                fix.detectChanges();
            }
            expect(selectionChangeSpy).toHaveBeenCalledTimes(14);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 1, 2, 5);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(grid, 0, 1, 2, 5, 1, 2);

            for (let i = 5; i > 0; i--) {
                cell = grid.getCellByColumn(0, grid.columns[i - 1].field);
                UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
                await wait(100);
                fix.detectChanges();
            }
            expect(selectionChangeSpy).toHaveBeenCalledTimes(18);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 1, 1, 2);
            // HelperUtils.verifySelectedRange(grid, 1, 1, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(grid, 0, 1, 0, 2, 1, 2);
        }));

        it('Should not fire event when no new cells are selected', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            let cell = grid.getCellByColumn(0, 'ID');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait(30);
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 0, 0, 0, 0);

            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 0, 0, 0, 0);

            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fix.detectChanges();

            grid.dataRowList.first.virtDirRow.scrollTo(5);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(7, 'OnPTO');
            UIInteractions.simulateClickAndSelectCellEvent(cell, false, true);
            await wait();
            fix.detectChanges();
            HelperUtils.verifyCellSelected(cell);

            HelperUtils.verifySelectedRange(grid, 0, 0, 0, 0, 0, 2);
            HelperUtils.verifySelectedRange(grid, 7, 7, 5, 5, 1, 2);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 0, 0, 0, 0, 0, 2);
            HelperUtils.verifySelectedRange(grid, 7, 7, 5, 5, 1, 2);

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 0, 0, 0, 0, 0, 2);
            HelperUtils.verifySelectedRange(grid, 7, 7, 5, 5, 1, 2);
        }));

        it('Should be able to navigate with the keyboard when a range is selected by dragging', (async () => {
            const firstCell = grid.getCellByColumn(1, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'Name');
            const thirdCell = grid.getCellByColumn(2, 'ParentID');

            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 1, 1, 1, 1, 0, 2);
            HelperUtils.verifySelectedRange(grid, 1, 4, 1, 2, 1, 2);
            expect(firstCell.focused);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', firstCell.nativeElement, true);
            fix.detectChanges();
            await wait(150);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellSelected(thirdCell);
            HelperUtils.verifySelectedRange(grid, 2, 2, 1, 1);
        }));

        it('Should be able to navigate with the keyboard when a range is selected by click ad holding ShiftKey', (async () => {
            const firstCell = grid.getCellByColumn(0, 'Name');
            const secondCell = grid.getCellByColumn(2, 'ID');
            const thirdCell = grid.getCellByColumn(2, 'ParentID');

            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            await HelperUtils.selectCellsRangeWithShiftKey(fix, firstCell, secondCell);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
             HelperUtils.verifySelectedRange(grid, 0, 2, 0, 2);
            expect(secondCell.focused);

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', secondCell.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            HelperUtils.verifyCellSelected(thirdCell);
            HelperUtils.verifyCellSelected(secondCell);
            HelperUtils.verifyCellSelected(firstCell, false);
            HelperUtils.verifySelectedRange(grid, 2, 2, 0, 1);
        }));

        it('Should be able to navigate with the keyboard when a range is selected by click ad holding Ctrl', (async () => {
            const firstCell = grid.getCellByColumn(1, 'Name');
            const secondCell = grid.getCellByColumn(2, 'HireDate');
            const thirdCell = grid.getCellByColumn(1, 'HireDate');

            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.simulateClickAndSelectCellEvent(secondCell, false, true);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            HelperUtils.verifyCellSelected(secondCell);
            expect(grid.selectedCells.length).toBe(2);

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', secondCell.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellSelected(thirdCell);
            HelperUtils.verifyCellSelected(firstCell, false);
            HelperUtils.verifySelectedRange(grid, 1, 2, 3, 3);
        }));

        it('Should handle Shift + Ctrl + Arrow Down keys combination', (async () => {
            const firstCell = grid.getCellByColumn(2, 'Name');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', firstCell.nativeElement, true, true, true);
            await wait(150);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 2, 7, 2, 2);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 7, 2, 2);
        }));

        it('Should handle Shift + Ctrl + Arrow Up keys combination', (async () => {
            const firstCell = grid.getCellByColumn(4, 'ParentID');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', firstCell.nativeElement, true, true, true);
            await wait(150);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 0, 4, 1, 1);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 4, 1, 1);
        }));

        it('Should handle  Shift + Ctrl + Arrow Left keys combination', (async () => {
            const firstCell = grid.getCellByColumn(3, 'HireDate');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', firstCell.nativeElement, true, true, true);
            await wait(150);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 3, 3, 3, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 3, 3, 3);
        }));

        it('Should handle  Shift + Ctrl + Arrow Right keys combination', (async () => {
            const firstCell = grid.getCellByColumn(4, 'Name');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', firstCell.nativeElement, true, true, true);
            await wait(150);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 4, 4, 2, 5);
            HelperUtils.verifyCellsRegionSelected(grid, 4, 4, 2, 5);
        }));

        it('Should handle  Shift + Ctrl + Home  keys combination', (async () => {
            const firstCell = grid.getCellByColumn(3, 'HireDate');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('home', firstCell.nativeElement, true, true, true);
            await wait(150);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 0, 3, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 3, 0, 3);
        }));

        it('Should handle  Shift + Ctrl + End  keys combination', (async () => {
            const firstCell = grid.getCellByColumn(2, 'ID');
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(firstCell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('end', firstCell.nativeElement, true, true, true);
            await wait(150);
            fix.detectChanges();
            await wait(150);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 2, 7, 0, 5);
            HelperUtils.verifyCellsRegionSelected(grid, 3, 7, 2, 5);
        }));

        it('Grouping: should select cells with arrow up and down keys', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            grid.getColumnByName('ParentID').groupable = true;
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            let cell = grid.getCellByColumn(2, 'Name');

            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(cell);
            expect(grid.selectedCells.length).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();
            await wait(150);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            cell = grid.getCellByColumn(2, 'Name');
            HelperUtils.verifyCellSelected(cell);
            expect(grid.selectedCells.length).toBe(1);

            const row = grid.getRowByIndex(3);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', row.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();
            await wait(150);

            cell = grid.getCellByColumn(4, 'Name');
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellSelected(cell);
            expect(grid.selectedCells.length).toBe(2);
            // HelperUtils.verifySelectedRange(grid, 2, 4, 3, 3 );

            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();
            await wait(150);

            cell = grid.getCellByColumn(4, 'ParentID');
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            HelperUtils.verifyCellSelected(cell);
            expect(grid.selectedCells.length).toBe(4);
            // HelperUtils.verifySelectedRange(grid, 2, 4, 2, 3 );

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();
            await wait(150);

            cell = grid.getCellByColumn(4, 'ParentID');
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            HelperUtils.verifyCellSelected(cell);
            expect(grid.selectedCells.length).toBe(4);
            // HelperUtils.verifySelectedRange(grid, 2, 4, 2, 3 );

            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', row.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();
            await wait(150);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(3);
            expect(grid.selectedCells.length).toBe(2);
            // HelperUtils.verifySelectedRange(grid, 2, 2, 2, 3 );
        }));

        it('Grouping: should select cells with arrow up and down keys when there are scrolls', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            grid.getColumnByName('ParentID').groupable = true;
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            let cell = grid.getCellByColumn(2, 'HireDate');

            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(cell);
            expect(grid.selectedCells.length).toBe(1);

            await HelperUtils.navigateVerticallyToIndex(grid, 2, 10, 3, true);
            fix.detectChanges();
            await wait(150);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(5);
            HelperUtils.verifySelectedRange(grid, 2, 10, 3, 3 );

            cell = grid.getCellByColumn(10, 'HireDate');

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();
            await wait(150);
            HelperUtils.verifySelectedRange(grid, 2, 10, 3, 4);

            await HelperUtils.navigateVerticallyToIndex(grid, 10, 0, 4, true);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(11);
            HelperUtils.verifySelectedRange(grid, 2, 1, 3, 4 );
            HelperUtils.verifyCellsRegionSelected(grid, 1, 2, 3, 4);
        }));

        it('Grouping and Summaries: should select cells with arrow up and down keys', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            grid.getColumnByName('ParentID').groupable = true;
            grid.getColumnByName('Name').hasSummary = true;
            grid.summaryCalculationMode = 'childLevelsOnly';
            grid.height = '700px';
            await wait(30);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            await wait(50);
            fix.detectChanges();

            let cell = grid.getCellByColumn(2, 'ParentID');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(cell);

            await HelperUtils.navigateVerticallyToIndexWithSummaries(grid, 2, 10, 1, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(4);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 10, 1, 1);
            expect(grid.selectedCells.length).toBe(5);

            cell = grid.getCellByColumn(10, 'ParentID');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            await wait(150);
            fix.detectChanges();
            await wait(150);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(5);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 10, 1, 2);
            expect(grid.selectedCells.length).toBe(10);

            await HelperUtils.navigateVerticallyToIndexWithSummaries(grid, 10, 3, 2, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(8);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 5, 1, 2);
            expect(grid.selectedCells.length).toBe(4);

            await HelperUtils.moveSummaryCell(fix, 3, 2, 'ArrowLeft');
            await HelperUtils.moveSummaryCell(fix, 3, 1, 'ArrowLeft');
            expect(selectionChangeSpy).toHaveBeenCalledTimes(8);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 5, 1, 2);
            expect(grid.selectedCells.length).toBe(4);

            await HelperUtils.moveSummaryCell(fix, 3, 0, 'ArrowUp');
            expect(selectionChangeSpy).toHaveBeenCalledTimes(9);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 2, 0, 1);
            expect(grid.selectedCells.length).toBe(2);
        }));

        it('Grouping and Summaries: should select cells with arrow up and down keys when there are scrolls', (async () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            grid.getColumnByName('ParentID').groupable = true;
            grid.getColumnByName('Name').hasSummary = true;
            grid.summaryCalculationMode = 'childLevelsOnly';
            await wait(30);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            await wait(30);
            fix.detectChanges();

            const cell = grid.getCellByColumn(2, 'ID');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifyCellSelected(cell);

            await HelperUtils.navigateVerticallyToIndexWithSummaries(grid, 2, 8, 0, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 8, 0, 0);

            for (let i = 0; i < 5; i++) {
                HelperUtils.verifySummaryCellActive(fix, 8, i);
                await HelperUtils.moveSummaryCell(fix, 8, i, 'ArrowRight', true);
            }

            expect(selectionChangeSpy).toHaveBeenCalledTimes(3);

            await HelperUtils.moveSummaryCell(fix, 8, 5, 'ArrowUp', true);

            expect(selectionChangeSpy).toHaveBeenCalledTimes(4);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 7, 0, 5);

            // await HelperUtils.navigateVerticallyToIndexWithSummaries(grid, 7, 3, 0, true);
            // await wait(50);
            // fix.detectChanges();

            // expect(selectionChangeSpy).toHaveBeenCalledTimes(4);
        }));
    });

    describe('Features integration', () => {
        let fix;
        let grid;

        beforeEach(() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });


        it('Sorting -  selection should not change when sorting is performed', () => {
            const column = grid.getColumnByName('ID');
            column.sortable = true;
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const firstCell = grid.getCellByColumn(1, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 1, 3);
            HelperUtils.verifySelectedRange(grid, 1, 4, 1, 3);
            const selectedData = [ { ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014') },
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')} ];
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.sort({ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            const filteredSelectedData = [ { ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')},
                { ParentID: 17, Name: 'Casey Harper', HireDate: new Date('Mar 19, 2016') },
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')} ];
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            const rowID = grid.selectedCells[0].cellID.rowID;
            HelperUtils.verifySelectedRange(grid, 1, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 1, 3);
            const data = grid.getSelectedData();
            expect(data).not.toEqual(selectedData);
            expect(data).toEqual(filteredSelectedData);
            grid.clearSort();
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 1, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            expect(grid.selectedCells[0].cellID.rowID).not.toBe(rowID);
        });

        it('Sorting - selection containing selected cell out of the view should not change when sorting is performed', () => {
            const column = grid.getColumnByName('ID');
            column.sortable = true;
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 2, rowEnd: 7, columnStart: 'ID', columnEnd: 'OnPTO' };
            grid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014'), Age: 31, OnPTO: false },
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014'), Age: 44, OnPTO: true},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017'), Age: 25, OnPTO: false},
                { ID: 15, ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014'), Age: 44, OnPTO: true },
                { ID: 12, ParentID: 17, Name: 'Pedro Afonso', HireDate: new Date('Dec 18, 2007'), Age: 50, OnPTO: false},
                { ID: 101, ParentID: 17, Name: 'Casey Harper', HireDate: new Date('Mar 19, 2016'), Age: 27, OnPTO: false}
            ];

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid, 2, 7, 0, 5);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.sort({ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            const sortedData = [
                { ID: 101, ParentID: 17, Name: 'Casey Harper', HireDate: new Date('Mar 19, 2016'), Age: 27, OnPTO: false},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014'), Age: 44, OnPTO: true},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014'), Age: 31, OnPTO: false },
                { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 03 2011'), Age: 43, OnPTO: false},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017'), Age: 25, OnPTO: false},
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009'), Age: 29, OnPTO: true }
            ];
            HelperUtils.verifySelectedRange(grid, 2, 7, 0, 5);
            expect(grid.getSelectedData()).not.toEqual(selectedData);
            expect(grid.getSelectedData()).toEqual(sortedData);
            grid.clearSort();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 2, 7, 0, 5);
            expect(grid.getSelectedData().length).toBe(selectedData.length);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('Filtering - selected range should not change when filtering is performed', () => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            const firstCell = grid.getCellByColumn(0, 'ParentID');
            const secondCell = grid.getCellByColumn(3, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [ { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')},
                { ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014') },
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')}
            ];
            HelperUtils.verifySelectedRange(grid, 0, 3, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 3, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.filter('Name', 'm', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            const filteredSelectedData = [ { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')},
                { ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014') },
                { ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')}
            ];
            HelperUtils.verifySelectedRange(grid, 0, 3, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 3, 1, 3);
            expect(grid.getSelectedData()).not.toEqual(selectedData);
            expect(grid.getSelectedData()).toEqual(filteredSelectedData);
            grid.clearFilter();
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 0, 3, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 3, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

        });

        it('Filtering - selected range should not change when filtering result is smaller that selected range', () => {
            const range = { rowStart: 0, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();
            const selectedData = [
                { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 03 2011')},
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];

            HelperUtils.verifySelectedRange(grid, 0, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.filter('Name', 'm', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();
            const filteredSelectedData = [ { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')},
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014') },
                { ID: 15, ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')}
            ];

            HelperUtils.verifySelectedRange(grid, 0, 4, 0, 3);
            expect(grid.getSelectedData()).not.toEqual(selectedData);
            expect(grid.getSelectedData()).toEqual(filteredSelectedData);
            grid.clearFilter();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            // filtering in grid with enabled paging
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();

            const selectRange = { rowStart: 1, rowEnd: 2, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(selectRange);
            fix.detectChanges();
            const selData = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 2, 0, 3);
            expect(grid.getSelectedData()).toEqual(selData);
            grid.filter('Name', 'm', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();
            const fData = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014') },
            ];
            HelperUtils.verifySelectedRange(grid, 1, 2, 0, 3);
            expect(grid.getSelectedData()).toEqual(fData);
        });

        it('Filtering - selected range should not change when filtering result is empty that selected range', () => {
            const range = { rowStart: 0, rowEnd: 4, columnStart: 'ID', columnEnd: 'OnPTO' };
            grid.selectRange(range);
            const selectedData = [
                { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 03 2011'),  Age: 43, OnPTO: false},
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009'), Age: 29, OnPTO: true},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014'), Age: 31, OnPTO: false },
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014'), Age: 44, OnPTO: true},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017'), Age: 25, OnPTO: false}
            ];

            HelperUtils.verifySelectedRange(grid, 0, 4, 0, 5);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.filter('Name', 'leon', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 4, 0, 5);
            expect(grid.dataRowList.length).toBe(0);
            expect(grid.getSelectedData()).toEqual([]);
            grid.clearFilter();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 0, 4, 0, 5);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('Paging - selected range should be cleared on paging', () => {
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();

            const range = { rowStart: 1, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();
            const selectedData = [{ ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.paginate(1);
            fix.detectChanges();

            expect(grid.getSelectedRanges().length).toBe(0);
            expect(grid.getSelectedRanges()).toEqual([]);
            expect(grid.getSelectedData().length).toBe(0);
            expect(grid.getSelectedData()).toEqual([]);
        });

        it('Paging - selected range should be cleared when perPage items are changed', () => {
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();

            const range = { rowStart: 2, rowEnd: 4, columnStart: 'ID', columnEnd: 'OnPTO' };
            grid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014'), Age: 31, OnPTO: false },
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014'), Age: 44, OnPTO: true},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017'), Age: 25, OnPTO: false}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 0, 5);
            expect(grid.getSelectedData().length).toBe(selectedData.length);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.perPage = 7;
            fix.detectChanges();

            expect(grid.getSelectedRanges().length).toBe(0);
            expect(grid.getSelectedRanges()).toEqual([]);
            expect(grid.getSelectedData().length).toBe(0);
            expect(grid.getSelectedData()).toEqual([]);
        });

        it('Resizing - selected range should not change on resizing', fakeAsync(() => {
            const range = { rowStart: 2, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();
            const selectedData = [{ ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid,  2, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid,  2, 4, 0, 3);
            expect(grid.getSelectedData().length).toBe(selectedData.length);
            expect(grid.getSelectedData()).toEqual(selectedData);
            const columnName = grid.getColumnByName('Name');
            const initialWidth = columnName.width;
            columnName.resizable = true;
            fix.detectChanges();


            const headers = fix.debugElement.queryAll(By.css('.igx-grid__th'));
            const headerResArea = headers[2].parent.children[1].nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 15);
            tick();
            fix.detectChanges();

            const resizer = headers[2].parent.children[1].children[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 200, 15);
            tick();
            UIInteractions.simulateMouseEvent('mouseup', resizer, 200, 15);
            tick();
            fix.detectChanges();

            expect(columnName.width).not.toEqual(initialWidth);
            HelperUtils.verifySelectedRange(grid,  2, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid,  2, 4, 0, 3);
            expect(grid.getSelectedData().length).toBe(selectedData.length);
            expect(grid.getSelectedData()).toEqual(selectedData);
        }));

        it('Hiding - selection should be perserved on column hiding', () => {
            const range = { rowStart: 2, rowEnd: 3, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();
            const selectedData = [{ ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')}
            ];
            HelperUtils.verifySelectedRange(grid,  2, 3, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            const columnName = grid.getColumnByName('Name');
            columnName.hidden = true;
            fix.detectChanges();
            const newSelectedData = [{ ID: 317, ParentID: 147, HireDate: new Date('Sep 18, 2014'), Age: 31},
                { ID: 225, ParentID: 847, HireDate: new Date('May 4, 2014'), Age: 44 }
            ];

            HelperUtils.verifySelectedRange(grid,  2, 3, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid,  2, 3, 0, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
            columnName.hidden = false;
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid,  2, 3, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid,  2, 3, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('Hiding - when hide last column which is in selected range, selection range is changed', (async() => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            grid.dataRowList.first.virtDirRow.scrollTo(5);
            await wait(100);
            fix.detectChanges();

            const range = { rowStart: 2, rowEnd: 3, columnStart: 'HireDate', columnEnd: 'OnPTO' };
            grid.selectRange(range);
            fix.detectChanges();
            const selectedData = [{ HireDate: new Date('Sep 18, 2014'), Age: 31, OnPTO: false},
            { HireDate: new Date('May 4, 2014'), Age: 44, OnPTO: true }
            ];
            HelperUtils.verifySelectedRange(grid,  2, 3, 3, 5);
            HelperUtils.verifyCellsRegionSelected(grid,  2, 3, 3, 5);
            expect(grid.getSelectedData()).toEqual(selectedData);

            const columnName = grid.getColumnByName('OnPTO');
            columnName.hidden = true;
            await wait(20);
            fix.detectChanges();
            const newSelectedData = [{ HireDate: new Date('Sep 18, 2014'), Age: 31},
            { HireDate: new Date('May 4, 2014'), Age: 44}];
            HelperUtils.verifySelectedRange(grid,  2, 3, 3, 5);
            HelperUtils.verifyCellsRegionSelected(grid,  2, 3, 3, 4);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
            columnName.hidden = false;
            fix.detectChanges();
            grid.dataRowList.first.virtDirRow.scrollTo(5);
            await wait(100);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
            HelperUtils.verifySelectedRange(grid,  2, 3, 3, 5);
            HelperUtils.verifyCellsRegionSelected(grid,  2, 3, 3, 5);
            expect(grid.getSelectedData()).toEqual(selectedData);
        }));

        it('Pinning - should be able to select cells from unpinned cols to pinned', (async() => {
            const selectionChangeSpy = spyOn<any>(grid.onRangeSelection, 'emit').and.callThrough();
            grid.dataRowList.first.virtDirRow.scrollTo(5);
            await wait(100);
            fix.detectChanges();

            const columnName = grid.getColumnByName('OnPTO');
            columnName.pinned = true;
            fix.detectChanges();

            const firstCell = grid.getCellByColumn(2, 'OnPTO');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            fix.detectChanges();

            grid.dataRowList.first.virtDirRow.scrollTo(0);
            await wait(100);
            fix.detectChanges();

            const selectedData = [
                { OnPTO: false, ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { OnPTO: true, ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { OnPTO: false, ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 2, 4, 0, 4);
            expect(grid.getSelectedData()).toEqual(selectedData);
            columnName.pinned = false;
            fix.detectChanges();

            const newSelectedData = [
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014'), Age: 31},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014'), Age: 44},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017'), Age: 25}
            ];
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifySelectedRange(grid, 2, 4, 0, 4);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        }));

        it('Pinning - should be able to select cells from unpinned cols to pinned', (async() => {
            const columnName = grid.getColumnByName('Age');
            const secondCol = grid.getColumnByName('OnPTO');
            secondCol.pinned = true;
            columnName.pinned = true;
            fix.detectChanges();

            grid.dataRowList.first.virtDirRow.scrollTo(2);
            await wait(100);
            fix.detectChanges();

            const firstCell = grid.getCellByColumn(2, 'Age');
            const secondCell = grid.getCellByColumn(4, 'Name');

            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', Age: 31},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', Age: 44},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', Age: 25}
            ];

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 4);
            expect(grid.getSelectedData()).toEqual(selectedData);
        }));

        it('Pinning - should be able to select cells from unpinned cols to pinned', () => {
            const firstCell = grid.getCellByColumn(2, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            const column = grid.getColumnByName('Name');
            column.pinned = true;
            fix.detectChanges();
            const newSelectedData = [
                { ID: 317, ParentID: 147, HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, HireDate: new Date('Dec 9, 2017')}
            ];

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        });

        it('Pinning - selection should remains the same when unpin column from selected area', () => {
            const firstCol = grid.getColumnByName('ParentID');
            const secondCol =  grid.getColumnByName('HireDate');

            firstCol.pinned = true;
            secondCol.pinned = true;
            fix.detectChanges();

            const firstCell = grid.getCellByColumn(2, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 147, HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, HireDate: new Date('May 4, 2014')},
                { ParentID: 847,  HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 0, 1);
            expect(grid.getSelectedData()).toEqual(selectedData);
            firstCol.pinned = false;
            fix.detectChanges();

            const newSelData = [
                { HireDate: new Date('Sep 18, 2014'), ID: 317},
                { HireDate: new Date('May 4, 2014'), ID: 225},
                { HireDate: new Date('Dec 9, 2017'), ID: 663}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 0, 1);
            expect(grid.getSelectedData()).toEqual(newSelData);
        });

        it('GroupBy - should be able to select range when there is grouping applied ', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc, ignoreCase: true
            });

            const firstCell = grid.getCellByColumn(2, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.clearGrouping();
            fix.detectChanges();

            const newSelectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        });

        it('GroupBy - selected range should remain the same when perform grouping ', () => {
            const firstCell = grid.getCellByColumn(2, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc, ignoreCase: true
            });
            fix.detectChanges();

            const newSelectedData = [
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        });

        it('GroupBy - selected range should change when collapse a group row', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc, ignoreCase: true
            });
            const firstCell = grid.getCellByColumn(2, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.rowList.first.toggle();
            fix.detectChanges();

            const newSelectedData = [
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')},
                { ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        });

        it('Grouping - selected data should be empty when all group rows are collapsed', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc, ignoreCase: true
            });
            const firstCell = grid.getCellByColumn(2, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.toggleAllGroupRows();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.dataRowList.length).toBe(0);
            expect(grid.getSelectedData()).toEqual([]);
            grid.toggleAllGroupRows();
            fix.detectChanges();

            expect(grid.dataRowList.lenght).not.toBe(0);
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('Moving - selection should not change when move columns inside selected range', () => {
            const firstCell = grid.getCellByColumn(2, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.moveColumn(grid.getColumnByName('ParentID'), grid.getColumnByName('HireDate'));
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.primaryKey = 'ID';
            fix.detectChanges();

            grid.moveColumn(grid.getColumnByName('ParentID'), grid.getColumnByName('ID'));
            const newSelectedData = [
                { ID: 317, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        });

        it('Summaries - selection range should not change when enable/disable summaries', (async () => {
            grid.height = '600px';
            await wait(100);
            fix.detectChanges();
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc, ignoreCase: true
            });
            grid.summaryCalculationMode = 'childLevelsOnly';
            grid.getColumnByName('Name').hasSummary = true;
            fix.detectChanges();

            const firstCell = grid.getCellByColumn(1, 'ParentID');
            const secondCell = grid.getCellByColumn(5, 'HireDate');
            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 5, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.getColumnByName('Name').hasSummary = false;
            fix.detectChanges();

            const newSelectedData = [
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')},
                { ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 5, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        }));

        it('Summaries - selection range should not change when change summaryPosition', (async () => {
            grid.height = '600px';
            await wait(100);
            fix.detectChanges();
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Desc, ignoreCase: true
            });
            grid.summaryCalculationMode = 'childLevelsOnly';
            grid.getColumnByName('Name').hasSummary = true;
            fix.detectChanges();

            const firstCell = grid.getCellByColumn(1, 'ParentID');
            const secondCell = grid.getCellByColumn(5, 'HireDate');
            await HelperUtils.selectCellsRange(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 5, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.summaryPosition = 'top';
            fix.detectChanges();
            const newSelData = [
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 5, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelData);

            grid.getColumnByName('Name').hasSummary = false;
            fix.detectChanges();
            const newSelectedData = [
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')},
                { ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 5, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        }));

        it('CRUD - selection range should be preserved when delete a row', () => {
            const firstCell = grid.getCellByColumn(2, 'ParentID');
            const secondCell = grid.getCellByColumn(4, 'HireDate');
            HelperUtils.selectCellsRangeNoWait(fix, firstCell, secondCell);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            const row = grid.getRowByIndex(3);
            row.delete();
            fix.detectChanges();


            const newSelectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);

            grid.primaryKey = 'ID';
            fix.detectChanges();

            expect(grid.primaryKey).toBeDefined();

            grid.deleteRow(15);
            grid.deleteRow(101);
            fix.detectChanges();

            const newSelection = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 17, Name: 'Pedro Afonso', HireDate: new Date('Dec 18, 2007')}
            ];

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelection);

            grid.selectRange();
            fix.detectChanges();

            const range = { rowStart: 0, rowEnd: 4, columnStart: 'ID', columnEnd: 'OnPTO' };
            grid.selectRange(range);
            fix.detectChanges();

            let data = [
                { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011'), Age: 43, OnPTO: false},
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009'), Age: 29, OnPTO: true},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014'), Age: 31, OnPTO: false},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017'), Age: 25, OnPTO: false},
                { ID: 12, ParentID: 17, Name: 'Pedro Afonso', HireDate: new Date('Dec 18, 2007'), Age: 50, OnPTO: false}
            ];
            HelperUtils.verifySelectedRange(grid, 0, 4, 0, 5);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(data);

            grid.deleteRow(957);
            fix.detectChanges();

            data = [
                { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011'), Age: 43, OnPTO: false},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014'), Age: 31, OnPTO: false},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017'), Age: 25, OnPTO: false},
                { ID: 12, ParentID: 17, Name: 'Pedro Afonso', HireDate: new Date('Dec 18, 2007'), Age: 50, OnPTO: false}
            ];
            HelperUtils.verifySelectedRange(grid, 0, 3, 0, 5);
            HelperUtils.verifyCellsRegionSelected(grid, 0, 3, 1, 3);
            expect(grid.getSelectedData()).toEqual(data);
        });

        it('CRUD - selected range should not change when add row', () => {
            const range = { rowStart: 1, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();

            let selectedData = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];

            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.addRow({ ID: 112, ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017'), Age: 55, OnPTO: false});
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.sort({ fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            selectedData = [
                { ID: 101, ParentID: 17, Name: 'Casey Harper', HireDate: new Date('Mar 19, 2016')},
                { ID: 15, ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')},
                { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')},
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.addRow({ ID: 258, ParentID: 21, Name: 'Mario Lopez', HireDate: new Date('May 27, 2017'), Age: 33, OnPTO: false});
            fix.detectChanges();

            selectedData = [
                { ID: 101, ParentID: 17, Name: 'Casey Harper', HireDate: new Date('Mar 19, 2016')},
                { ID: 15, ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')},
                { ID: 258, ParentID: 21, Name: 'Mario Lopez', HireDate: new Date('May 27, 2017')},
                { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('CRUD - selected range should not change when update row', () => {
            const range = { rowStart: 1, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();

            let selectedData = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];

            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            const row = grid.getRowByIndex(2);
            row.update({ ID: 112, ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017'), Age: 55, OnPTO: false});
            fix.detectChanges();

            selectedData = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 112, ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];

            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('CRUD - selected range should not change when update row', () => {
            const range = { rowStart: 1, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);

            grid.getCellByColumn(0, 'ParentID').update(123);
            grid.getCellByColumn(2, 'ParentID').update(847);
            grid.getCellByColumn(3, 'Name').update('Paola Alicante');
            fix.detectChanges();

            let selectedData = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 847, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Paola Alicante', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.primaryKey = 'ID';
            fix.detectChanges();

            grid.getCellByKey(475, 'ParentID').update(741);
            grid.getCellByKey(317, 'ID').update(987);
            grid.getCellByKey(663, 'Name').update('Peter Lincoln');
            fix.detectChanges();

            selectedData = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 987, ParentID: 847, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Paola Alicante', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Peter Lincoln', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('Search - selection range should be preserved when perform search', () => {
            const range = { rowStart: 2, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.findNext('re');
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            expect(grid.nativeElement.querySelector('.igx-highlight__active')).toBeDefined();
            const cell = grid.getCellByColumn(3, 'Name');
            expect(cell.nativeElement.querySelector('.igx-highlight')).toBeDefined();
            expect(cell.nativeElement.classList.contains('igx-grid__td--selected')).toBeTruthy();
            grid.findNext('re');
            fix.detectChanges();

            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 0, 3);
            expect(cell.nativeElement.querySelector('.igx-highlight__active')).toBeDefined();
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('Row Selection', () => {
            grid.rowSelectable = true;
            const range = { rowStart: 2, rowEnd: 4, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ID: 663, ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            const row = grid.getRowByIndex(3);
            grid.selectRows([row.rowID]);
            fix.detectChanges();

            expect(row.isSelected).toBeTruthy();
            HelperUtils.verifySelectedRange(grid, 2, 4, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.getCellByColumn(3, 'ParentID');

        });

    });

    describe('CRUD - transaction enabled', () => {
        let fix;
        let grid;

        beforeEach(() => {
            fix = TestBed.createComponent(SelectionWithTransactionsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('CRUD - selected range should not change when delete row', () => {
            const range = { rowStart: 2, rowEnd: 4, columnStart: 'ParentID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();

            let selectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            const row = grid.getRowByIndex(3);
            row.delete();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.transactions.undo();
            fix.detectChanges();
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.transactions.redo();
            fix.detectChanges();
            grid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();
            selectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')},
                { ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')},
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });

        it('CRUD - selected range should not change when update row', () => {
            const range = { rowStart: 2, rowEnd: 4, columnStart: 'ParentID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            const row = grid.getRowByIndex(3);
            row.update({ ID: 112, ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017'), Age: 55, OnPTO: false});
            fix.detectChanges();

            const newSelectedData = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
            grid.transactions.clear();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.primaryKey = 'ID';
            fix.detectChanges();

            grid.updateRow({ ID: 112, ParentID: 147, Name: 'Ricardo Lalonso', HireDate: new Date('Dec 27, 2017')}, 225);
            fix.detectChanges();
            const data = [
                { ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ParentID: 147, Name: 'Ricardo Lalonso', HireDate: new Date('Dec 27, 2017')},
                { ParentID: 847, Name: 'Elizabeth Richards', HireDate: new Date('Dec 9, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(data);

            grid.transactions.undo();
            fix.detectChanges();
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);

            grid.transactions.redo();
            fix.detectChanges();
            grid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();
            HelperUtils.verifySelectedRange(grid, 2, 4, 1, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 2, 4, 1, 3);
            expect(grid.getSelectedData()).toEqual(data);
        });

        it('CRUD - selected range should not change when add row', () => {
            const range = { rowStart: 1, rowEnd: 3, columnStart: 'ID', columnEnd: 'HireDate' };
            grid.selectRange(range);
            fix.detectChanges();
            grid.addRow({ ID: 112, ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017'), Age: 55, OnPTO: false});
            fix.detectChanges();

            let selectedData = [
                { ID: 957, ParentID: 147, Name: 'Thomas Hardy', HireDate: new Date('Jul 19, 2009')},
                { ID: 317, ParentID: 147, Name: 'Monica Reyes', HireDate: new Date('Sep 18, 2014')},
                { ID: 225, ParentID: 847, Name: 'Laurence Johnson', HireDate: new Date('May 4, 2014')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 3, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.sort({ fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            const newSelectedData = [
                { ID: 101, ParentID: 17, Name: 'Casey Harper', HireDate: new Date('Mar 19, 2016')},
                { ID: 15, ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')},
                { ID: 475, ParentID: 147, Name: 'Michael Langdon', HireDate: new Date('Jul 3, 2011')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 3, 0, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
            grid.addRow({ ID: 258, ParentID: 21, Name: 'Mario Lopez', HireDate: new Date('May 27, 2017'), Age: 33, OnPTO: false});
            fix.detectChanges();

            selectedData = [
                { ID: 101, ParentID: 17, Name: 'Casey Harper', HireDate: new Date('Mar 19, 2016')},
                { ID: 15, ParentID: 19, Name: 'Antonio Moreno', HireDate: new Date('May 4, 2014')},
                { ID: 258, ParentID: 21, Name: 'Mario Lopez', HireDate: new Date('May 27, 2017')}
            ];
            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 3, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
            grid.transactions.undo();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 3, 0, 3);
            expect(grid.getSelectedData()).toEqual(newSelectedData);

            grid.transactions.redo();
            fix.detectChanges();
            grid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(grid, 1, 3, 0, 3);
            HelperUtils.verifyCellsRegionSelected(grid, 1, 3, 0, 3);
            expect(grid.getSelectedData()).toEqual(selectedData);
        });
    });
});
