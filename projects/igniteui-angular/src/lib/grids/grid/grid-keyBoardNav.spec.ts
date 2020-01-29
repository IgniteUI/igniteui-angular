import { Component, ViewChild, TemplateRef } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxColumnComponent,
    IgxGridCellComponent,
    IgxGridModule,
    IgxGridRowComponent,
    IgxGridGroupByRowComponent,
} from './index';
import { IgxGridComponent } from './grid.component';
import { DataParent } from '../../test-utils/sample-test-data.spec';
import { IGridCellEventArgs } from '../common/events';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    VirtualGridComponent, IgxGridRowEditingWithFeaturesComponent,
    NoScrollsComponent
} from '../../test-utils/grid-samples.spec';
import { GridSelectionMode } from '../common/enums';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';

const DEBOUNCETIME = 30;

describe('IgxGrid - Keyboard navigation #grid', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NoScrollsComponent,
                VirtualGridComponent,
                IgxGridRowEditingWithFeaturesComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));


    describe('in not virtualized grid', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(NoScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('should move selected cell with arrow keys', () => {
            let selectedCell: IgxGridCellComponent;
            const firstCell = GridFunctions.getRowCells(fix, 0)[0];
            const secondCell = GridFunctions.getRowCells(fix, 1)[0];
            const thirdCell = GridFunctions.getRowCells(fix, 1)[1];
            const fourthCell = GridFunctions.getRowCells(fix, 0)[1];

            grid.onSelection.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });
            firstCell.triggerEventHandler('focus', null);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowdown', firstCell);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(2);
            expect(selectedCell.column.field).toMatch('ID');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowright', secondCell);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Gilberto Todd');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowup', thirdCell);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Casey Houston');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowleft', fourthCell);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');
        });

        it('should  jump to first/last cell with Ctrl', () => {
            let selectedCell: IgxGridCellComponent;
            const firstCell = GridFunctions.getRowCells(fix, 1)[0];
            const lastCell = GridFunctions.getRowCells(fix, 1)[3];

            grid.onSelection.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });

            firstCell.triggerEventHandler('focus', null);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowright', firstCell, false, false, true);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company C');
            expect(selectedCell.column.field).toMatch('Company');


            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowleft', lastCell, false, false, true);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(2);
            expect(selectedCell.column.field).toMatch('ID');
        });

        it('Should handle keydown events on cells properly even when primaryKey is specified', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');

            const targetCell = grid.getCellByKey(2, 'Name');
            const targetCellElement = GridFunctions.getRowCells(fix, 1)[1];
            spyOn(grid.getCellByKey(2, 'Name'), 'onFocus').and.callThrough();
            expect(targetCell.focused).toEqual(false);

            targetCellElement.triggerEventHandler('focus', null);
            fix.detectChanges();

            spyOn(grid.getCellByKey(3, 'Name'), 'onFocus').and.callThrough();
            fix.detectChanges();

            expect(targetCell.onFocus).toHaveBeenCalledTimes(1);
            expect(targetCell.focused).toEqual(true);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowdown', targetCellElement);
            fix.detectChanges();

            expect(grid.getCellByKey(3, 'Name').onFocus).toHaveBeenCalledTimes(1);
            expect(grid.getCellByKey(3, 'Name').focused).toEqual(true);
            expect(targetCell.focused).toEqual(false);
            expect(grid.selectedCells.length).toEqual(1);
            expect(grid.selectedCells[0].row.rowData[grid.primaryKey]).toEqual(3);
        });

        it('Should properly handle TAB / SHIFT + TAB on row selectors', fakeAsync(() => {
            grid.rowSelection = GridSelectionMode.multiple;
            tick(100);
            fix.detectChanges();

            const firstCell = GridFunctions.getRowCells(fix, 1)[0];
            const secondCell = GridFunctions.getRowCells(fix, 0)[3];
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);

            firstCell.triggerEventHandler('focus', null);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', firstCell, false, true);
            tick(100);
            fix.detectChanges();

            let cell = grid.getCellByColumn(0, 'Company');
            GridSelectionFunctions.verifyCellSelected(cell);
            GridSelectionFunctions.verifyRowCheckboxIsNotFocused(secondRow.nativeElement);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', secondCell);
            tick(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(1, 'ID');
            GridSelectionFunctions.verifyCellSelected(cell);
            GridSelectionFunctions.verifyRowCheckboxIsNotFocused(firstRow.nativeElement);
        }));

        it('should allow vertical keyboard navigation in pinned area.', fakeAsync(() => {
            grid.getColumnByName('Name').pinned = true;
            tick();
            fix.detectChanges();
            let selectedCell;
            const firstCell = GridFunctions.getRowCells(fix, 0)[0];
            const secondCell = GridFunctions.getRowCells(fix, 1)[0];

            grid.onSelection.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });
            firstCell.triggerEventHandler('focus', null);
            tick(100);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Casey Houston');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowdown', firstCell);
            tick(100);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Gilberto Todd');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowup', secondCell);
            tick(100);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Casey Houston');
            expect(selectedCell.column.field).toMatch('Name');
        }));

        it('should allow horizontal keyboard navigation between start pinned area and unpinned area.', fakeAsync(() => {
            grid.getColumnByName('Name').pinned = true;
            grid.getColumnByName('Company').pinned = true;
            tick();
            fix.detectChanges();

            let selectedCell;
            const firstPinnedCell = GridFunctions.getRowCells(fix, 0)[0];
            const secondPinnedCell = GridFunctions.getRowCells(fix, 0)[1];
            const firstUnPinnedCell = GridFunctions.getRowCells(fix, 0)[2];


            grid.onSelection.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });
            firstPinnedCell.triggerEventHandler('focus', null);
            tick(100);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowright', firstPinnedCell);
            tick(100);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company A');
            expect(selectedCell.column.field).toMatch('Company');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowright', secondPinnedCell);
            tick(100);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowleft', firstUnPinnedCell);
            tick(100);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company A');
            expect(selectedCell.column.field).toMatch('Company');
        }));

    });

    describe('in virtualized grid', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(VirtualGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
        }));

        it('Should properly blur the focused cell when scroll with mouse wheeel', (async () => {
            pending('This scenario need to be tested manually');
            const firstCell = grid.rowList.first.cells.toArray()[0];

            firstCell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(firstCell.selected).toBeTruthy();
            expect(firstCell.focused).toBeTruthy();

            const displayContainer = GridFunctions.getGridDisplayContainer(fix).nativeElement;
            const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 500 });
            displayContainer.dispatchEvent(event);
            await wait(300);

            expect(firstCell.selected).toBeFalsy();
            expect(firstCell.focused).toBeFalsy();
        }));

        it('Should properly handle TAB / SHIFT + TAB on edge cell, triggering virt scroll', (async () => {
            const cols = [];
            for (let i = 0; i < 10; i++) {
                cols.push({ field: 'col' + i });
            }
            fix.componentInstance.columns = cols;
            fix.componentInstance.gridWidth = '830px';
            fix.componentInstance.data = fix.componentInstance.generateData(30);
            fix.detectChanges();

            const virtualizationSpy = spyOn<any>(grid.parentVirtDir.onChunkLoad, 'emit').and.callThrough();
            // Focus left right cell
            const gridFirstRow = grid.rowList.first;

            const cell = grid.getCellByColumn(0, 'col3');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBeTruthy();
            UIInteractions.triggerKeyDownWithBlur('tab', cell.nativeElement, true);
            await wait(30);
            fix.detectChanges();
            expect(virtualizationSpy).toHaveBeenCalledTimes(1);

            const targetCell = grid.getCellByColumn(0, 'col3');
            targetCell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(30);
            fix.detectChanges();

            expect(targetCell.selected).toBeTruthy();

            // Focus second last right cell, TAB will NOT trigger virtualization;
            UIInteractions.triggerKeyDownWithBlur('tab', targetCell.nativeElement, true);
            await wait(30);
            fix.detectChanges();

            expect(virtualizationSpy).toHaveBeenCalledTimes(1);
            expect(cell.selected).toBeTruthy();

            // Focus leftmost cell, SHIFT + TAB will NOT trigger virtualization
            gridFirstRow.cells.first.nativeElement.dispatchEvent(new Event('focus'));
            await wait(30);
            fix.detectChanges();

            expect(gridFirstRow.cells.first.selected).toBeTruthy();
            UIInteractions.triggerKeyDownWithBlur('tab', gridFirstRow.cells.first.nativeElement, true, false, true);
            await wait(30);
            fix.detectChanges();

            // There are not cells prior to the first cell - no scrolling will be done, spy will not be called;
            expect(virtualizationSpy).toHaveBeenCalledTimes(1);
        }));

        it('should allow navigating down', async () => {
            let cell = GridFunctions.getRowCells(fix, 4)[0];
            cell.triggerEventHandler('focus', null);
            await wait();
            fix.detectChanges();

            // Navigate to the 10th row
            for (let index = 4; index < 10; index++) {
                cell = GridFunctions.getRowCells(fix, 4)[0];
                UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowdown', cell);
                await wait(30);
                fix.detectChanges();
            }
            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(10);
        });

        it('should allow navigating up', async () => {
            grid.verticalScrollContainer.scrollTo(104);

            await wait(200);
            fix.detectChanges();

            let cell = GridFunctions.getRowCells(fix, 0)[0];
            cell.triggerEventHandler('focus', null);
            await wait(30);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(100);
            // Navigate to the 94th row
            for (let index = 0; index < 10; index++) {
                cell = GridFunctions.getRowCells(fix, 0)[0];
                UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowup', cell);
                await wait(30);
                fix.detectChanges();
            }
            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(90);
        });

        it('should allow horizontal navigation', async () => {
            const cols = [];
            for (let i = 0; i < 10; i++) {
                cols.push({ field: 'col' + i });
            }
            fix.componentInstance.columns = cols;
            fix.detectChanges();
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const cell = grid.getCellByColumn(0, 'col3');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await GridFunctions.navigateHorizontallyToIndex(grid, cell, 9);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.columnIndex).toEqual(9);
            await GridFunctions.navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.columnIndex).toEqual(1);
        });

        it('should allow horizontal navigation in virtualized grid with pinned cols.', async () => {
            const cols = [];
            for (let i = 0; i < 10; i++) {
                cols.push({ field: 'col' + i });
            }
            fix.componentInstance.columns = cols;
            fix.detectChanges();
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            grid.pinColumn('col1');
            grid.pinColumn('col3');
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const cell = grid.getCellByColumn(0, 'col1');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await GridFunctions.navigateHorizontallyToIndex(grid, cell, 9);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(9);
            // Verify columns
            let cells = grid.getRowByIndex(0).cells.toArray();
            expect(cells.length).toEqual(5);
            expect(cells[0].column.field).toEqual('col1');
            expect(cells[1].column.field).toEqual('col3');
            expect(cells[3].column.field).toEqual('col8');
            expect(cells[4].column.field).toEqual('col9');

            await GridFunctions.navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(1);

            cells = grid.getRowByIndex(0).cells.toArray();
            expect(cells.length).toEqual(5);
            expect(cells[0].column.field).toEqual('col1');
            expect(cells[1].column.field).toEqual('col3');
            expect(cells[2].column.field).toEqual('col0');
            expect(cells[3].column.field).toEqual('col2');
        });

        it('should scroll into view the not fully visible cells when navigating down', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            const cell = GridFunctions.getRowCells(fix, 3)[1];
            const bottomRowHeight = rows[4].nativeElement.offsetHeight;
            const displayContainer = GridFunctions.getGridDisplayContainer(fix).nativeElement;
            const bottomCellVisibleHeight = displayContainer.parentElement.offsetHeight % bottomRowHeight;

            cell.triggerEventHandler('focus', null);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowdown', cell);
            await wait(DEBOUNCETIME);

            fix.detectChanges();
            expect(parseInt(displayContainer.style.top, 10)).toBeLessThanOrEqual(-1 * (grid.rowHeight - bottomCellVisibleHeight));
            expect(displayContainer.parentElement.scrollTop).toEqual(0);
            expect(fix.componentInstance.selectedCell.value).toEqual(40);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        });

        it('should scroll into view the not fully visible cells when navigating up', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);

            fix.detectChanges();
            const displayContainer = GridFunctions.getGridDisplayContainer(fix).nativeElement;
            fix.componentInstance.scrollTop(25);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(displayContainer.style.top).toEqual('-25px');
            const cell = GridFunctions.getRowCells(fix, 1)[1];
            cell.triggerEventHandler('focus', null);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowup', cell);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            fix.detectChanges();
            expect(displayContainer.style.top).toEqual('0px');
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        });

        it('should allow navigating first/last cell in column with down/up and Ctrl key.', async () => {
            let cell = grid.getCellByColumn(1, 'value');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowdown', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();
            cell = grid.getCellByColumn(999, 'value');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell);

            cell = grid.getCellByColumn(998, 'other');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowup', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'other');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell);
        });

        it('should allow navigating first/last cell in column with home/end and Cntr key.', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(50);
            fix.componentInstance.data = fix.componentInstance.generateData(500);
            fix.detectChanges();

            grid.verticalScrollContainer.addScrollTop(5000);

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let cell = grid.getCellByColumn(101, '2');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('home', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, '0');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell);
            expect(grid.verticalScrollContainer.getScroll().scrollTop).toEqual(0);

            cell = grid.getCellByColumn(4, '2');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('end', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(499, '49');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell);
        });

        it('should scroll into view the not fully visible cells when navigating left', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rowDisplayContainer = GridFunctions.getRowDisplayContainer(fix, 1).nativeElement;
            fix.componentInstance.scrollLeft(50);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(rowDisplayContainer.style.left).toEqual('-50px');
            const cell = GridFunctions.getRowCells(fix, 1)[1];
            cell.triggerEventHandler('focus', null);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

            const curCell = grid.getCellByColumn(1, '1');
            UIInteractions.triggerKeyDownWithBlur('arrowleft', curCell.nativeElement, true);
            await wait(DEBOUNCETIME);

            fix.detectChanges();
            expect(rowDisplayContainer.style.left).toEqual('0px');
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('0');
        });

        it('should scroll into view the not fully visible cells when navigating right', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rowDisplayContainer = GridFunctions.getRowDisplayContainer(fix, 1).nativeElement;
            expect(rowDisplayContainer.style.left).toEqual('0px');
            const cell = GridFunctions.getRowCells(fix, 1)[2];
            cell.triggerEventHandler('focus', null);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(20);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('2');

            const curCell = grid.getCellByColumn(1, '2');
            UIInteractions.triggerKeyDownWithBlur('arrowright', curCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('3');
            expect(parseInt(rowDisplayContainer.style.left, 10)).toBeLessThanOrEqual(-40);
        });

        it('should scroll first row into view when pressing arrow up', (async () => {
            grid.reflow();
            fix.componentInstance.scrollTop(25);
            await wait(100);
            fix.detectChanges();

            let scrollContainer = grid.verticalScrollContainer.dc.instance._viewContainer;
            let scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

            expect(scrollContainerOffset).toEqual(-25);

            const cell = GridFunctions.getRowCells(fix, 1)[1];
            cell.triggerEventHandler('focus', null);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('value');
            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowup', cell);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            scrollContainer = grid.verticalScrollContainer.dc.instance._viewContainer;
            scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

            expect(scrollContainerOffset).toEqual(0);
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('value');
        }));

        it('should allow pageup/pagedown navigation when the grid is focused', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();

            grid.nativeElement.dispatchEvent(new Event('focus'));
            await wait();
            fix.detectChanges();

            // testing the pagedown key
            UIInteractions.triggerKeyDownEvtUponElem('PageDown', grid.nativeElement, true);
            grid.cdr.detectChanges();

            await wait();
            let currScrollTop = grid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(grid.verticalScrollContainer.igxForContainerSize);

            // testing the pageup key
            UIInteractions.triggerKeyDownEvtUponElem('PageUp', grid.nativeElement, true);
            grid.cdr.detectChanges();
            await wait();
            currScrollTop = grid.headerContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(0);
        });

        it('Custom KB navigation: should be able to scroll to a random cell in the grid', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();

            grid.navigateTo(15, 1, (args) => { args.target.nativeElement.focus(); });
            fix.detectChanges();
            await wait(200);
            fix.detectChanges();

            const target = grid.getCellByColumn(15, '1');
            expect(target).toBeDefined();
            expect(document.activeElement).toBe(target.nativeElement);
        });

        it('Custom KB navigation: should be able to scroll horizontally and vertically to a cell in the grid', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(100);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            grid.navigateTo(50, 50, (args) => { args.target.nativeElement.focus(); });
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const target = grid.getCellByColumn(50, '50');
            expect(target).toBeDefined();
            expect(document.activeElement).toBe(target.nativeElement);
        });

        it('Custom KB navigation: onGridKeydown should be emitted', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.detectChanges();
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();
            const gridKeydown = spyOn<any>(grid.onGridKeydown, 'emit').and.callThrough();

            const cell = grid.getCellByColumn(1, '2');
            UIInteractions.triggerKeyDownWithBlur('arrowup', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(1);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'dataCell', target: cell, cancel: false, event: new KeyboardEvent('keydown')
            });
        });
    });

    fdescribe('Group By navigation ', () => {
        // configureTestSuite();
        let fix;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingWithFeaturesComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            fix.componentInstance.enableRowEditing = false;
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '600px';
            grid.columnWidth = '100px';
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
        }));

        it('should toggle expand/collapse state of group row with ArrowRight/ArrowLeft key.', () => {
            const gRow = grid.groupsRowList.toArray()[0];
            const gRowElement = GridFunctions.getGroupedRows(fix)[1];
            expect(gRow.expanded).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gRowElement, true);
            fix.detectChanges();

            expect(gRow.expanded).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gRowElement, true);
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);
        });

        it('should toggle expand/collapse state of group row with ArrowUp/ArrowDown key.', () => {
            const gRow = grid.groupsRowList.toArray()[0];
            const gRowElement = GridFunctions.getGroupedRows(fix)[1];
            expect(gRow.expanded).toBe(true);
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gRowElement, true);
            fix.detectChanges();

            expect(gRow.expanded).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gRowElement, true);
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);
        });

        it(`focus should stay over the group row when expanding/collapsing
        with keyboard and the grid is scrolled to the bottom`, (async () => {
            grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
            await wait(100);
            fix.detectChanges();

            let groupedRowsCount = grid.groupsRowList.length;
            let groupRow = grid.groupsRowList.toArray()[groupedRowsCount - 1];
            const groupRowElement = GridFunctions.getGroupedRows(fix)[groupedRowsCount - 1];
            groupRowElement.triggerEventHandler('focus', null);
            fix.detectChanges();

            GridFunctions.verifyGroupRowIsFocused(groupRow);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', groupRowElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            groupedRowsCount = grid.groupsRowList.length;
            groupRow = grid.groupsRowList.toArray()[groupedRowsCount - 1];
            expect(groupRow.index).toEqual(11);
            expect(groupRow.expanded).toBeFalsy();
            GridFunctions.verifyGroupRowIsFocused(groupRow);
        }));

        it(`should be able to navigate down to the next row when expand the last group row
    and grid is scrolled to bottom`, (async () => {
            grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
            await wait(100);
            fix.detectChanges();

            grid.groupsRowList.last.toggle();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(grid.groupsRowList.last.expanded).toBeFalsy();

            grid.groupsRowList.last.toggle();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(grid.groupsRowList.last.expanded).toBeTruthy();

            const groupRowIndex = grid.groupsRowList.last.index;
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', grid.groupsRowList.last.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            const cell = grid.getCellByColumn(groupRowIndex + 1 , 'Downloads');
            GridSelectionFunctions.verifyCellSelected(cell);
        }));

        fit('should allow keyboard navigation through group rows.', (async () => {
            fix.componentInstance.width = '400px';
            fix.componentInstance.height = '300px';
            await wait();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            await wait();
            fix.detectChanges();

            for (let index = 0; index < 6; index++) {
                const row1 = grid.getRowByIndex(index);
                if ( row1 instanceof IgxGridGroupByRowComponent ) {
                    UIInteractions.triggerKeyDownWithBlur('arrowDown', row1.nativeElement, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                } else {
                    UIInteractions.triggerKeyDownWithBlur('arrowDown', grid.selectedCells[0].nativeElement, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                }
            }
            // let row = grid.getRowByIndex(0);
            // row.nativeElement.dispatchEvent(new Event('focus'));
            // fix.detectChanges();


            // await GridFunctions.navigateVerticallyToIndex(grid, 0, 9);
            // await wait(DEBOUNCETIME);
            // fix.detectChanges();

        //    let row = grid.getRowByIndex(9);
        //     expect(row instanceof IgxGridRowComponent).toBe(true);
        //     expect(row.focused).toBe(true);
        //     expect(row.cells.toArray()[0].selected).toBe(true);

        //     await GridFunctions.navigateVerticallyToIndex(grid, 9, 0);
        //     await wait(DEBOUNCETIME);
        //     fix.detectChanges();
        //     row = grid.getRowByIndex(0);
        //     expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
        //     expect(row.focused).toBe(true);
        }));

        it('should persist last selected cell column index when navigation down through group rows.', async () => {
            fix.componentInstance.width = '400px';
            fix.componentInstance.height = '300px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            grid.headerContainer.getScroll().scrollLeft = 1000;
            await wait(DEBOUNCETIME);
            let cell = grid.getCellByColumn(2, 'Released');
            cell.nativeElement.dispatchEvent(new Event('focus'));

            await GridFunctions.navigateVerticallyToIndex(grid, 0, 9, 4);

            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(9);
            cell = grid.getCellByColumn(9, 'Released');
            expect(row instanceof IgxGridRowComponent).toBe(true);
            expect(row.focused).toBe(true);
            expect(cell.selected).toBe(true);
        });

        it('should focus grouped row when press Tab key and Shift + Tab on a cell', (async () => {

            let cell = grid.getCellByColumn(2, 'Released');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let groupRow = grid.groupsRowList.toArray()[1];
            cell = grid.getCellByColumn(2, 'Released');
            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', groupRow.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'Released');
            expect(groupRow.focused).toBe(false);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(false);
            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);

            cell = grid.getCellByColumn(7, 'Downloads');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fix.detectChanges();

            expect(groupRow.focused).toBe(false);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(false);
            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            groupRow = grid.groupsRowList.toArray()[2];
            cell = grid.getCellByColumn(7, 'Downloads');
            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);
        }));

        it('should correct work when press tab and sft+tab on a grouped row', (async () => {
            let groupRow = grid.groupsRowList.toArray()[0];
            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            groupRow = grid.groupsRowList.toArray()[0];
            expect(groupRow.focused).toBe(true);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('tab', groupRow.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            let cell = grid.getCellByColumn(1, 'Downloads');
            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);

            groupRow = grid.groupsRowList.toArray()[1];
            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(100);
            fix.detectChanges();

            groupRow = grid.groupsRowList.toArray()[1];
            expect(groupRow.focused).toBe(true);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
            groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'Released');
            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);
        }));

        it('should correct work when press tab and sft+tab on a grouped row when have row selectors', (async () => {
            grid.rowSelection = GridSelectionMode.multiple;
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const groupRow = grid.groupsRowList.toArray()[0];
            const firstRow = grid.getRowByIndex(1);
            const firstRowCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox');
            const cell = grid.getCellByColumn(1, 'Downloads');

            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(groupRow.focused).toBe(true);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('tab', groupRow.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBeTruthy();
            expect(cell.focused).toBeTruthy();
            expect(firstRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBeTruthy();
            expect(cell.focused).toBeFalsy();
            expect(firstRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);
        }));

        it('expand/colapse row with arrow keys', (async () => {
                const groupRow = grid.groupsRowList.toArray()[0];
            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await GridFunctions.expandCollapceGroupRow(fix, groupRow, null);
        }));

        it('should focus grouped row when press arrow keys up or down', (async () => {
            let cell = grid.getCellByColumn(1, 'ID');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', cell.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            let groupRow = grid.groupsRowList.toArray()[0];
            cell = grid.getCellByColumn(1, 'ID');
            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);

            cell = grid.getCellByColumn(2, 'ProductName');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(100);
            fix.detectChanges();

            expect(cell.focused).toBe(true);
            expect(cell.selected).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', cell.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'ProductName');
            groupRow = grid.groupsRowList.toArray()[1];

            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);
        }));

        it('should correct work when press tab and sft+tab when there is a horizontal scroll', (async () => {
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const groupRow = grid.groupsRowList.toArray()[1];
            let cell;

            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(groupRow.focused).toBe(true);
            groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'Released');
            expect(cell.focused).toBe(true);
            expect(cell.selected).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('Tab', cell.nativeElement, true);
            await wait(100);
            fix.detectChanges();
            expect(cell.selected).toBe(true);

            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Tab', groupRow.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(4, 'Downloads');
            expect(cell.focused).toBe(true);
            expect(cell.selected).toBe(true);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(groupRow.focused).toBe(true);
        }));


        it('should persist last selected cell column index when navigation up through group rows.', async () => {
            fix.componentInstance.width = '400px';
            fix.componentInstance.height = '300px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            grid.headerContainer.getScroll().scrollLeft = 1000;
            await wait(100);
            fix.detectChanges();
            grid.verticalScrollContainer.addScrollTop(1000);
            await wait(200);
            fix.detectChanges();
            const cell = grid.getCellByColumn(20, 'Released');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await GridFunctions.navigateVerticallyToIndex(grid, 20, 0, 4);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(0);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);
        });

        it('should NOT clear selection from data cells when a group row is focused via KB navigation.', async () => {
            fix.componentInstance.width = '800px';
            fix.componentInstance.height = '300px';
            grid.columnWidth = '200px';
            await wait(100);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            const cell = grid.getCellByColumn(2, 'Downloads');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(100);
            expect(cell.selected).toBe(true);
            await GridFunctions.navigateVerticallyToIndex(grid, 2, 0);

            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(0);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);
            expect(cell.selected).toBe(true);
        });

        it('Custom KB navigation:  should be able to scroll to a random row and pass a cb', async () => {
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '500px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.navigateTo(9, -1, (args) => { args.target.nativeElement.focus(); });
            await wait(100);
            fix.detectChanges();

            const target = grid.rowList.find(r => r.index === 9);
            expect(target).toBeDefined();
            expect(target.focused).toBe(true);
        });

        it('Custom KB navigation: onGridKeydown should be emitted for ', async () => {
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '500px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();
;
            const gridKeydown = spyOn<any>(grid.onGridKeydown, 'emit').and.callThrough();

            const rowEl = grid.rowList.find(r => r.index === 0);
            rowEl.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: false }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(1);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'groupRow', target: rowEl, cancel: false, event: new KeyboardEvent('keydown')
            });

            rowEl.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: false }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(2);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'groupRow', target: rowEl, cancel: false, event: new KeyboardEvent('keydown')
            });
        });

    });

});
