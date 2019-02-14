import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    IgxTreeGridSelectionKeyComponent,
    IgxTreeGridSelectionComponent,
    IgxTreeGridSelectionWithTransactionComponent,
    IgxTreeGridFKeySelectionWithTransactionComponent
} from '../../test-utils/tree-grid-components.spec';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxTreeGridModule } from '.';
import { HelperUtils } from '../../test-utils/helper-utils.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';

describe('IgxTreeGrid - Multi Cell selection', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSelectionKeyComponent,
                IgxTreeGridSelectionComponent,
                IgxTreeGridSelectionWithTransactionComponent,
                IgxTreeGridFKeySelectionWithTransactionComponent
            ],
            imports: [NoopAnimationsModule, IgxTreeGridModule]
        }).compileComponents();
    }));

    describe('Flat Data', () => {
        let fix;
        let treeGrid;
        let detect;

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSelectionKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            detect = () => treeGrid.cdr.detectChanges();
        });

        it('Should select a region', () => {
            verifySelectingRegion(fix, treeGrid);
        });

        it('Should return correct data when expand and collapse rows', () => {
            verifySelectingExpandCollapse(fix, treeGrid);
        });

        it('Should be able to select a range with mouse dragging', () => {
            verifySelectingRangeWithMouseDrag(fix, treeGrid, detect);
        });

        it('Should be able to select a range with holding Shift key', (async () => {
            const selectionChangeSpy = spyOn<any>(treeGrid.onRangeSelection, 'emit').and.callThrough();
            const firstCell = treeGrid.getCellByColumn(6, 'Age');

            UIInteractions.simulateClickAndSelectCellEvent(firstCell);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(firstCell);

            treeGrid.verticalScrollContainer.scrollTo(treeGrid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fix.detectChanges();

            treeGrid.dataRowList.first.virtDirRow.scrollTo(4);
            await wait(100);
            fix.detectChanges();

            const secondCell = treeGrid.getCellByColumn(16, 'HireDate');
            UIInteractions.simulateClickAndSelectCellEvent(secondCell, true);
            await wait();
            fix.detectChanges();

            let range = { rowStart: 6, rowEnd: 16, columnStart: 2, columnEnd: 4 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            expect(treeGrid.getSelectedRanges()).toEqual([range]);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 6, 16, 2, 4);

            treeGrid.verticalScrollContainer.scrollTo(0);
            await wait(100);
            fix.detectChanges();

            treeGrid.dataRowList.first.virtDirRow.scrollTo(0);
            await wait(100);
            fix.detectChanges();

            const thirdCell = treeGrid.getCellByColumn(4, 'ID');
            UIInteractions.simulateClickAndSelectCellEvent(thirdCell, true);
            await wait();
            fix.detectChanges();

            range = { rowStart: 4, rowEnd: 6, columnStart: 0, columnEnd: 2 };
            expect(selectionChangeSpy).toHaveBeenCalledTimes(2);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            expect(treeGrid.getSelectedRanges()).toEqual([range]);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 4, 6, 0, 2);
        }));

        it('Should be able to select a range with keyboard', (async () => {
            const selectionChangeSpy = spyOn<any>(treeGrid.onRangeSelection, 'emit').and.callThrough();
            let cell = treeGrid.getCellByColumn(9, 'Age');

            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyCellSelected(cell);

            await HelperUtils.navigateVerticallyToIndex(treeGrid, 9, 17, 2, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(8);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 9, 17, 2, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 9, 9, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 9, 19, 2, 2, 1, 2);

            cell = treeGrid.getCellByColumn(17, 'Age');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            await wait(100);
            fix.detectChanges();
            expect(selectionChangeSpy).toHaveBeenCalledTimes(9);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 9, 17, 2, 3);
            // HelperUtils.verifySelectedRange(treeGrid, 9, 9, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 9, 19, 2, 3, 1, 2);

            cell = treeGrid.getCellByColumn(17, 'OnPTO');
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true, true);
            await wait(100);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(10);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 9, 17, 2, 4);
            // HelperUtils.verifySelectedRange(treeGrid, 9, 9, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 9, 19, 2, 4, 1, 2);

            await HelperUtils.navigateVerticallyToIndex(treeGrid, 17, 3, 4, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(24);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 3, 9, 2, 4);
            // HelperUtils.verifySelectedRange(treeGrid, 9, 9, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 3, 9, 2, 4, 1, 2);

            for (let i = 4; i > 2; i--) {
                cell = treeGrid.getCellByColumn(3, treeGrid.columns[i].field);
                UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true, true);
                await wait(100);
                fix.detectChanges();
            }
            expect(selectionChangeSpy).toHaveBeenCalledTimes(28);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 3, 9, 2, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 9, 9, 2, 2, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 3, 9, 0, 2, 1, 2);

            await HelperUtils.navigateVerticallyToIndex(treeGrid, 3, 9, 2, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(32);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 9, 9, 2, 2);
            HelperUtils.verifySelectedRange(treeGrid, 9, 9, 2, 2);
        }));

        it('Summaries: should select correct data when summaries are enabled', () => {
            const selectionChangeSpy = spyOn<any>(treeGrid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 0, rowEnd: 10, columnStart: 0, columnEnd: 2 };
            const expectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55 },
                { ID: 475, Name: 'Michael Langdon', Age: 43 },
                { ID: 957, Name: 'Thomas Hardy', Age: 29 },
                { ID: 317, Name: 'Monica Reyes', Age: 31 },
                { ID: 711, Name: 'Roland Mendel', Age: 35 },
                { ID: 998, Name: 'Sven Ottlieb', Age: 44 },
                { ID: 847, Name: 'Ana Sanders', Age: 42 },
                { ID: 225, Name: 'Laurence Johnson', Age: 44 }
            ];
            const startCell = treeGrid.getCellByColumn(0, 'ID');

            treeGrid.getColumnByName('Name').hasSummary = true;
            treeGrid.summaryCalculationMode = 'childLevelsOnly';
            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            UIInteractions.simulateClickAndSelectCellEvent(startCell);
            fix.detectChanges();

            expect(startCell.focused).toBe(true);

            for (let i = 1; i < 11; i++) {
                let cell = treeGrid.getCellByColumn(i, 'ID');
                if (!cell) {
                    const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, i);
                    cell = HelperUtils.getSummaryCellByVisibleIndex(summaryRow, 0);
                }
                UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
                detect();
                HelperUtils.verifyCellsRegionSelected(treeGrid, 0, i, 0, 0);
            }
            expect(selectionChangeSpy).toHaveBeenCalledTimes(0);

            let newCell = treeGrid.getCellByColumn(10, 'Name');
            UIInteractions.simulatePointerOverCellEvent('pointerenter', newCell.nativeElement);
            detect();
            HelperUtils.verifyCellsRegionSelected(treeGrid, 0, 10, 0, 1);

            newCell = treeGrid.getCellByColumn(10, 'Age');
            UIInteractions.simulatePointerOverCellEvent('pointerenter', newCell.nativeElement);
            UIInteractions.simulatePointerOverCellEvent('pointerup', newCell.nativeElement);
            detect();
            HelperUtils.verifyCellsRegionSelected(treeGrid, 0, 10, 0, 2);
            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            expect(selectionChangeSpy).toHaveBeenCalledWith(range);
            HelperUtils.verifySelectedRange(treeGrid, 0, 0, 0, 0, 0, 2);
            HelperUtils.verifySelectedRange(treeGrid, 0, 10, 0, 2, 1, 2);
            expect(treeGrid.getSelectedData()).toEqual(expectedData);
        });

        it('Summaries: verify selected data when change summaries position', () => {
            const selectionChangeSpy = spyOn<any>(treeGrid.onRangeSelection, 'emit').and.callThrough();
            const range = { rowStart: 0, rowEnd: 10, columnStart: 0, columnEnd: 2 };
            const expectedData1 = [
                { ID: 147, Name: 'John Winchester', Age: 55 },
                { ID: 475, Name: 'Michael Langdon', Age: 43 },
                { ID: 957, Name: 'Thomas Hardy', Age: 29 },
                { ID: 317, Name: 'Monica Reyes', Age: 31 },
                { ID: 711, Name: 'Roland Mendel', Age: 35 },
                { ID: 998, Name: 'Sven Ottlieb', Age: 44 },
                { ID: 847, Name: 'Ana Sanders', Age: 42 },
                { ID: 225, Name: 'Laurence Johnson', Age: 44 }
            ];

            const expectedData2 = [
                { ID: 147, Name: 'John Winchester', Age: 55 },
                { ID: 475, Name: 'Michael Langdon', Age: 43 },
                { ID: 957, Name: 'Thomas Hardy', Age: 29 },
                { ID: 317, Name: 'Monica Reyes', Age: 31 },
                { ID: 711, Name: 'Roland Mendel', Age: 35 },
                { ID: 998, Name: 'Sven Ottlieb', Age: 44 },
                { ID: 847, Name: 'Ana Sanders', Age: 42 },
                { ID: 225, Name: 'Laurence Johnson', Age: 44 },
                { ID: 663, Name: 'Elizabeth Richards', Age: 25 }
            ];

            treeGrid.getColumnByName('Name').hasSummary = true;
            treeGrid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();

            treeGrid.selectRange(range);
            HelperUtils.verifySelectedRange(treeGrid, 0, 10, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(expectedData2);

            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 0, 10, 0, 2);
            HelperUtils.verifySelectedRange(treeGrid, 0, 10, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(expectedData1);
        });

        it('Summaries: should select range with keyboard', (async () => {
            const selectionChangeSpy = spyOn<any>(treeGrid.onRangeSelection, 'emit').and.callThrough();
            treeGrid.getColumnByName('Name').hasSummary = true;
            treeGrid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();

            const cell = treeGrid.getCellByColumn(8, 'Name');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fix.detectChanges();

            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifySelectedRange(treeGrid, 8, 8, 1, 1);

            await HelperUtils.navigateVerticallyToIndex(treeGrid, 8, 24, 1, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(11);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 8, 23, 1, 1);
            // HelperUtils.verifySelectedRange(treeGrid, 8, 8, 1, 1, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 8, 23, 1, 1, 1, 2);

            for (let i = 1; i < 4; i++) {
                await HelperUtils.moveSummaryCell(fix, 24, i, 'ArrowRight');
            }

            HelperUtils.verifySummaryCellActive(fix, 24, 4);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 8, 23, 1, 1);
            // HelperUtils.verifySelectedRange(treeGrid, 8, 8, 1, 1, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 8, 23, 1, 1, 1, 2);

            await HelperUtils.moveSummaryCell(fix, 24, 4, 'ArrowUp');

            expect(selectionChangeSpy).toHaveBeenCalledTimes(12);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 8, 23, 1, 4);
            // HelperUtils.verifySelectedRange(treeGrid, 8, 8, 1, 1, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 8, 23, 1, 4, 1, 2);

            await HelperUtils.navigateVerticallyToIndex(treeGrid, 23, 7, 4, true);
            await wait(50);
            fix.detectChanges();

            expect(selectionChangeSpy).toHaveBeenCalledTimes(23);
            HelperUtils.verifyCellsRegionSelected(treeGrid, 8, 8, 1, 4);
            // HelperUtils.verifySelectedRange(treeGrid, 8, 8, 1, 1, 0, 2);
            // HelperUtils.verifySelectedRange(treeGrid, 8, 8, 1, 4, 1, 2);
        }));

        it('Filtering: selection should not change when perform filtering', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.filter('Name', 'la', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            const filterData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(filterData);
        });

        it('CRUD: selected range should not change when delete row', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            const row = treeGrid.getRowByIndex(2);
            row.delete();
            fix.detectChanges();

            const newSelectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
        });

        it('CRUD: selected range should not change when update row', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            const row = treeGrid.getRowByIndex(2);
            row.update({ ID: 258, Name: 'Michael Cooper', Age: 33, OnPTO: false});
            fix.detectChanges();

            const newSelectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 258, Name: 'Michael Cooper', Age: 33},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
        });

        it('CRUD: selected range should not change when add row', () => {
            const range = { rowStart: 3, rowEnd: 6, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
                { ID: 998, Name: 'Sven Ottlieb', Age: 44},
                { ID: 847, Name: 'Ana Sanders', Age: 42}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.addRow({ ID: 13, Name: 'Michael Cooper', Age: 33, OnPTO: false}, 317);
            fix.detectChanges();

            const newSelectedData = [
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
                { ID: 998, Name: 'Sven Ottlieb', Age: 44},
                { ID: 13, Name: 'Michael Cooper', Age: 33}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
        });
    });

    describe('ChildDataKey', () => {
        let fix;
        let treeGrid;
        let detect;

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSelectionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            detect = () => treeGrid.cdr.detectChanges();
        });

        it('Should select a region', () => {
            verifySelectingRegion(fix, treeGrid);
        });

        it('Should return correct data when expand and collapse rows', () => {
            verifySelectingExpandCollapse(fix, treeGrid);
        });

        it('Should be able to select a range with mouse dragging', () => {
            verifySelectingRangeWithMouseDrag(fix, treeGrid, detect);
        });

        it('Filtering: selection should not change when perform filtering', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.filter('Name', 'la', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            const filterData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(filterData);
        });

        it('CRUD: selected range should not change when update row', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            const row = treeGrid.getRowByIndex(2);
            row.update({ ID: 258, Name: 'Michael Cooper', Age: 33, OnPTO: false});
            fix.detectChanges();

            const newSelectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 258, Name: 'Michael Cooper', Age: 33},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
        });

        it('CRUD: selected range should not change when add row', () => {
            treeGrid.primaryKey = 'ID';
            const range = { rowStart: 3, rowEnd: 6, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
                { ID: 998, Name: 'Sven Ottlieb', Age: 44},
                { ID: 847, Name: 'Ana Sanders', Age: 42}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.addRow({ ID: 13, ParentID: 317, Name: 'Michael Cooper', Age: 33, OnPTO: false}, 317);
            fix.detectChanges();

            const newSelectedData = [
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
                { ID: 998, Name: 'Sven Ottlieb', Age: 44},
                { ID: 13, Name: 'Michael Cooper', Age: 33}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
        });
    });

    describe('ChildDataKeyGrid with transactions enabled', () => {
        let fix;
        let treeGrid;

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSelectionWithTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('CRUD: selected range should not change when delete row', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            const row = treeGrid.getRowByIndex(2);
            row.delete();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.transactions.undo();
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.transactions.redo();
            fix.detectChanges();
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            const nesSelData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(nesSelData);
        });

        it('CRUD: selected range should not change when update row', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            const row = treeGrid.getRowByIndex(2);
            row.update({ ID: 258, Name: 'Michael Cooper', Age: 33, OnPTO: false,  Employees: []});
            fix.detectChanges();

            const newSelectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 258, Name: 'Michael Cooper', Age: 33},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);

            treeGrid.transactions.undo();
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.transactions.redo();
            fix.detectChanges();
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
        });

        it('CRUD: selected range should not change when add row', () => {
            const range = { rowStart: 3, rowEnd: 6, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
                { ID: 998, Name: 'Sven Ottlieb', Age: 44},
                { ID: 847, Name: 'Ana Sanders', Age: 42}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.addRow({ ID: 1234, Name: 'Michael Cooper', Age: 33, OnPTO: false, HireDate: null, Employees: []}, 147);
            fix.detectChanges();

            const newSelectedData = [
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
                { ID: 998, Name: 'Sven Ottlieb', Age: 44},
                { ID: 13, Name: 'Michael Cooper', Age: 33}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();
        });

    });

    describe('FlatGrid with transactions enabled', () => {
        let fix;
        let treeGrid;

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridFKeySelectionWithTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('CRUD: selected range should not change when delete row', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);
            const row = treeGrid.getRowByIndex(2);
            row.delete();
            fix.detectChanges();

            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.transactions.undo();
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.transactions.redo();
            fix.detectChanges();
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            const nesSelData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(nesSelData);
        });

        it('CRUD: selected range should not change when update row', () => {
            const range = { rowStart: 0, rowEnd: 3, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 957, Name: 'Thomas Hardy', Age: 29},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);
            const row = treeGrid.getRowByIndex(2);
            row.update({ ID: 258, Name: 'Michael Cooper', Age: 33, OnPTO: false,  Employees: []});
            fix.detectChanges();

            const newSelectedData = [
                { ID: 147, Name: 'John Winchester', Age: 55},
                { ID: 475, Name: 'Michael Langdon', Age: 43},
                { ID: 258, Name: 'Michael Cooper', Age: 33},
                { ID: 317, Name: 'Monica Reyes', Age: 31}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);

            treeGrid.transactions.undo();
            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.transactions.redo();
            fix.detectChanges();
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(treeGrid,  0, 3, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
        });

        it('CRUD: selected range should not change when add row', () => {
            const range = { rowStart: 3, rowEnd: 6, columnStart: 'ID', columnEnd: 'Age' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedData = [
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
                { ID: 998, Name: 'Sven Ottlieb', Age: 44},
                { ID: 847, Name: 'Ana Sanders', Age: 42}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);
            treeGrid.addRow({ ID: 13, Name: 'Michael Cooper', Age: 33, OnPTO: false, HireDate: null, Employees: []}, 147);
            fix.detectChanges();

            const newSelectedData = [
                { ID: 317, Name: 'Monica Reyes', Age: 31},
                { ID: 711, Name: 'Roland Mendel', Age: 35},
                { ID: 998, Name: 'Sven Ottlieb', Age: 44},
                { ID: 13, Name: 'Michael Cooper', Age: 33}
            ];
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);

            treeGrid.transactions.undo();
            fix.detectChanges();
            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(selectedData);

            treeGrid.transactions.redo();
            fix.detectChanges();
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            HelperUtils.verifySelectedRange(treeGrid,  3, 6, 0, 2);
            expect(treeGrid.getSelectedData()).toEqual(newSelectedData);
        });
    });


    function verifySelectingRegion(fix, treeGrid) {
        const selectionChangeSpy = spyOn<any>(treeGrid.onRangeSelection, 'emit').and.callThrough();
        const range1 = { rowStart: 0, rowEnd: 6, columnStart: 'ID', columnEnd: 'Age' };
        const range2 = { rowStart: 11, rowEnd: 16, columnStart: 'ID', columnEnd: 'OnPTO' };
        const expectedData1 = [
            { ID: 147, Name: 'John Winchester', Age: 55 },
            { ID: 475, Name: 'Michael Langdon', Age: 43 },
            { ID: 957, Name: 'Thomas Hardy', Age: 29 },
            { ID: 317, Name: 'Monica Reyes', Age: 31 },
            { ID: 711, Name: 'Roland Mendel', Age: 35 },
            { ID: 998, Name: 'Sven Ottlieb', Age: 44 },
            { ID: 847, Name: 'Ana Sanders', Age: 42 }
        ];
        const expectedData2 = [
            { ID: 15, Name: 'Antonio Moreno', Age: 44, OnPTO: true },
            { ID: 17, Name: 'Yang Wang', Age: 61, OnPTO: false },
            { ID: 12, Name: 'Pedro Afonso', Age: 50, OnPTO: false },
            { ID: 109, Name: 'Patricio Simpson', Age: 25, OnPTO: false },
            { ID: 99, Name: 'Francisco Chang', Age: 39, OnPTO: true },
            { ID: 299, Name: 'Peter Lewis', Age: 25, OnPTO: false }
        ];
        treeGrid.selectRange(range1);
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 0, 6, 0, 2);
        HelperUtils.verifySelectedRange(treeGrid, 0, 6, 0, 2);
        expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
        expect(treeGrid.getSelectedData()).toEqual(expectedData1);

        treeGrid.selectRange();
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 0, 6, 0, 2, false);
        expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
        expect(treeGrid.getSelectedRanges().length).toBe(0);

        treeGrid.selectRange(range2);
        fix.detectChanges();

        HelperUtils.verifySelectedRange(treeGrid, 11, 16, 0, 3);
        expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
        expect(treeGrid.getSelectedData()).toEqual(expectedData2);
    }

    function verifySelectingExpandCollapse(fix, treeGrid) {
        const range = { rowStart: 1, rowEnd: 6, columnStart: 'ID', columnEnd: 'Age' };
        const expectedData1 = [
            { ID: 475, Name: 'Michael Langdon', Age: 43 },
            { ID: 957, Name: 'Thomas Hardy', Age: 29 },
            { ID: 317, Name: 'Monica Reyes', Age: 31 },
            { ID: 711, Name: 'Roland Mendel', Age: 35 },
            { ID: 998, Name: 'Sven Ottlieb', Age: 44 },
            { ID: 847, Name: 'Ana Sanders', Age: 42 }
        ];
        const expectedData2 = [
            { ID: 475, Name: 'Michael Langdon', Age: 43 },
            { ID: 957, Name: 'Thomas Hardy', Age: 29 },
            { ID: 317, Name: 'Monica Reyes', Age: 31 },
            { ID: 847, Name: 'Ana Sanders', Age: 42 },
            { ID: 225, Name: 'Laurence Johnson', Age: 44 },
            { ID: 663, Name: 'Elizabeth Richards', Age: 25 }
        ];

        const expectedData3 = [
            { ID: 847, Name: 'Ana Sanders', Age: 42 },
            { ID: 225, Name: 'Laurence Johnson', Age: 44 },
            { ID: 663, Name: 'Elizabeth Richards', Age: 25 },
            { ID: 141, Name: 'Trevor Ashworth', Age: 39 },
            { ID: 19, Name: 'Victoria Lincoln', Age: 49 },
            { ID: 15, Name: 'Antonio Moreno', Age: 44 }
        ];

        const expectedData4 = [
            { ID: 847, Name: 'Ana Sanders', Age: 42 },
            { ID: 19, Name: 'Victoria Lincoln', Age: 49 },
            { ID: 17, Name: 'Yang Wang', Age: 61 }
        ];

        treeGrid.selectRange(range);
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 1, 6, 0, 2);
        HelperUtils.verifySelectedRange(treeGrid, 1, 6, 0, 2);
        expect(treeGrid.getSelectedData()).toEqual(expectedData1);

        treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 1, 6, 0, 2);
        HelperUtils.verifySelectedRange(treeGrid, 1, 6, 0, 2);
        expect(treeGrid.getSelectedData()).toEqual(expectedData2);

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 1, 6, 0, 2);
        HelperUtils.verifySelectedRange(treeGrid, 1, 6, 0, 2);
        expect(treeGrid.getSelectedData()).toEqual(expectedData3);

        treeGrid.collapseAll();
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 1, 3, 0, 2);
        HelperUtils.verifySelectedRange(treeGrid, 1, 6, 0, 2);
        expect(treeGrid.getSelectedData()).toEqual(expectedData4);

        treeGrid.expandAll();
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 1, 6, 0, 2);
        HelperUtils.verifySelectedRange(treeGrid, 1, 6, 0, 2);
        expect(treeGrid.getSelectedData()).toEqual(expectedData1);
    }

    function verifySelectingRangeWithMouseDrag(fix, treeGrid, detect) {
        const selectionChangeSpy = spyOn<any>(treeGrid.onRangeSelection, 'emit').and.callThrough();
        const startCell = treeGrid.getCellByColumn(4, 'Name');
        const endCell = treeGrid.getCellByColumn(7, 'Age');
        const range = { rowStart: 4, rowEnd: 7, columnStart: 1, columnEnd: 2 };
        const expectedData = [
            { Name: 'Ana Sanders', Age: 42 },
            { Name: 'Victoria Lincoln', Age: 49 },
            { Name: 'Antonio Moreno', Age: 44 },
            { Name: 'Yang Wang', Age: 61 }
        ];

        treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);
        fix.detectChanges();

        treeGrid.toggleRow(treeGrid.getRowByIndex(4).rowID);
        fix.detectChanges();

        UIInteractions.simulateClickAndSelectCellEvent(startCell);
        fix.detectChanges();

        expect(startCell.focused).toBe(true);

        for (let i = 5; i < 7; i++) {
            const cell = treeGrid.getCellByColumn(i, treeGrid.columns[i - 3].field);
            UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
            detect();
            HelperUtils.verifyCellsRegionSelected(treeGrid, 4, i, 1, i - 3);
        }

        for (let i = 5; i > 0; i--) {
            const cell = treeGrid.getCellByColumn(i, 'OnPTO');
            UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
            detect();
            HelperUtils.verifyCellsRegionSelected(treeGrid, 4, i, 1, 3);
        }

        for (let i = 2; i >= 0; i--) {
            const cell = treeGrid.getCellByColumn(1, treeGrid.columns[i].field);
            UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
            detect();
            HelperUtils.verifyCellsRegionSelected(treeGrid, 4, 1, 1, i);
        }

        for (let i = 2; i < 10; i++) {
            const cell = treeGrid.getCellByColumn(i, 'ID');
            UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
            detect();
            HelperUtils.verifyCellsRegionSelected(treeGrid, 4, i, 1, 0);
        }

        for (let i = 8; i > 6; i--) {
            const cell = treeGrid.getCellByColumn(i, treeGrid.columns[9 - i].field);
            UIInteractions.simulatePointerOverCellEvent('pointerenter', cell.nativeElement);
            detect();
            HelperUtils.verifyCellsRegionSelected(treeGrid, 4, i, 1, 9 - i);
        }

        UIInteractions.simulatePointerOverCellEvent('pointerup', endCell.nativeElement);
        detect();

        expect(startCell.focused).toBe(true);
        HelperUtils.verifyCellsRegionSelected(treeGrid, 4, 7, 1, 2);
        HelperUtils.verifySelectedRange(treeGrid, 4, 7, 1, 2);

        expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
        expect(selectionChangeSpy).toHaveBeenCalledWith(range);
        expect(treeGrid.getSelectedData()).toEqual(expectedData);
    }
});
