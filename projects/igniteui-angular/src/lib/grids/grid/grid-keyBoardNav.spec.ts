import { Component, ViewChild, OnInit } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { IgxColumnComponent, IgxGridCellComponent, IgxGridModule,  } from './index';
import { IgxGridComponent } from './grid.component';
import { IGridCellEventArgs } from '../grid-base.component';
import { IgxStringFilteringOperand } from '../../../public_api';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { HelperUtils} from '../../test-utils/helper-utils.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';

describe('IgxGrid - Keyboard navigation', () => {
    configureTestSuite();
    const navigateHorizontallyToIndex = (
        grid: IgxGridComponent,
        cell: IgxGridCellComponent,
        index: number) => new Promise(async (resolve) => {
        // grid - the grid in which to navigate.
        // cell - current cell from which the navigation will start.
        // index - the index to which to navigate

            const currIndex = cell.visibleColumnIndex;
            const dir = currIndex < index ? 'ArrowRight' : 'ArrowLeft';
            const nextIndex = dir === 'ArrowRight' ? currIndex + 1 : currIndex - 1;
            const visibleColumns = grid.visibleColumns.sort((c1, c2) => c1.visibleIndex - c2.visibleIndex);
            const nextCol = visibleColumns[nextIndex];
            let nextCell = nextCol ? grid.getCellByColumn(0, nextCol.field) : null;
            const keyboardEvent = new KeyboardEvent('keydown', {
                code: dir,
                key: dir
            });
            if (!cell.focused) {
                cell.nativeElement.dispatchEvent(new Event('focus'));
                grid.cdr.detectChanges();
            }
            // if index reached return
            if (currIndex === index) { resolve(); return; }
            // else call arrow up/down
            // cell.nativeElement.dispatchEvent(keyboardEvent);
            if (dir === 'ArrowRight') {
                cell.nativeElement.dispatchEvent(keyboardEvent);
            } else {
                cell.nativeElement.dispatchEvent(keyboardEvent);
            }

            grid.cdr.detectChanges();
            // if next row exists navigate next
            if (nextCell) {
                await wait(10);
                grid.cdr.detectChanges();
                navigateHorizontallyToIndex(grid, nextCell, index).then(() => { resolve(); });
            } else {
                // else wait for chunk to load.
                grid.parentVirtDir.onChunkLoad.pipe(take(1)).subscribe({
                    next: () => {
                        grid.cdr.detectChanges();
                        nextCell = nextCol ? grid.getCellByColumn(0, nextCol.field) : null;
                        navigateHorizontallyToIndex(grid, nextCell, index).then(() => { resolve(); });
                    }
                });
            }
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                CtrlKeyKeyboardNagivationComponent,
                VirtualGridComponent,
                GridWithEditableColumnComponent,
                NoColumnWidthGridComponent,
                CellEditingTestComponent,
                CellEditingScrollTestComponent,
                ConditionalCellStyleTestComponent,
                ColumnEditablePropertyTestComponent,
                GridWithScrollsComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    it('keyboard navigation', (async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        let topLeft;
        let topRight;
        let bottomLeft;
        let bottomRight;
        [topLeft, topRight, bottomLeft, bottomRight] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        topLeft.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', topLeft.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(2);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', bottomLeft.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(2);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', bottomRight.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', topRight.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');
    }));

    it('keyboard navigation - first/last cell jump with Ctrl', (async () => {
        const fix = TestBed.createComponent(CtrlKeyKeyboardNagivationComponent);
        fix.detectChanges();

        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const rv2 = fix.debugElement.query(By.css(`${CELL_CSS_CLASS}:last-child`));

        rv.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        rv.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Arrowright', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('another');

        rv2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Arrowleft', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');
    }));

    xit('keyboard navigation - should allow navigating down in virtualized grid.', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const cell = grid.getCellByColumn(4, 'index');
        cell.onFocus(new Event('focus'));
        await wait(DEBOUNCETIME);
        fix.detectChanges();
        // navigate down to 100th row.
        await HelperUtils.navigateVerticallyToIndex(grid, 4, 100);
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.rowIndex).toEqual(100);
    });

   xit('keyboard navigation - should allow navigating up in virtualized grid.', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        grid.verticalScrollContainer.addScrollTop(5000);

        await wait(200);
        fix.detectChanges();

        const cell = grid.getCellByColumn(104, 'index');
        cell.onFocus(new Event('focus'));
        fix.detectChanges();

        await HelperUtils.navigateVerticallyToIndex(grid, 104, 0);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.rowIndex).toEqual(0);
    });

    it('keyboard navigation - should allow horizontal navigation in virtualized grid.', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        const cols = [];
        for (let i = 0; i < 10; i++) {
            cols.push({ field: 'col' + i });
        }
        fix.componentInstance.cols = cols;
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const cell = grid.getCellByColumn(0, 'col3');
        await navigateHorizontallyToIndex(grid, cell, 9);
        expect(fix.componentInstance.selectedCell.columnIndex).toEqual(9);
        await navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1);
        expect(fix.componentInstance.selectedCell.columnIndex).toEqual(1);
    });

    xit('keyboard navigation - should allow horizontal navigation in virtualized grid with pinned cols.', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        const cols = [];
        for (let i = 0; i < 10; i++) {
            cols.push({ field: 'col' + i });
        }
        fix.componentInstance.cols = cols;
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;

        grid.pinColumn('col1');
        grid.pinColumn('col3');
        fix.detectChanges();
        const cell = grid.getCellByColumn(0, 'col1');
        await navigateHorizontallyToIndex(grid, cell, 9);
        expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(9);
        await navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1);
        expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(1);
    });

    xit('keyboard navigation - should allow vertical navigation in virtualized grid with pinned cols.', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        grid.pinColumn('index');

        const cell = grid.getCellByColumn(4, 'index');
        cell.onFocus(new Event('focus'));
        fix.detectChanges();
        // navigate down to 100th row.
        await HelperUtils.navigateVerticallyToIndex(grid, 4, 100);
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.rowIndex).toEqual(100);
    });

    it('keyboard navigation - should scroll into view the not fully visible cells when navigating down', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const cell = rows[3].querySelectorAll('igx-grid-cell')[1];
        const bottomRowHeight = rows[4].offsetHeight;
        const displayContainer = fix.nativeElement.querySelectorAll('igx-display-container')[1];
        const bottomCellVisibleHeight = displayContainer.parentElement.offsetHeight % bottomRowHeight;

        cell.dispatchEvent(new Event('focus'));
        await wait(50);

        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual(30);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        const curCell = grid.getCellByColumn(3, '1');
        curCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        await wait(50);

        fix.detectChanges();
        expect(parseInt(displayContainer.style.top, 10)).toBeLessThanOrEqual(-1 * (grid.rowHeight - bottomCellVisibleHeight));
        expect(displayContainer.parentElement.scrollTop).toEqual(0);
        expect(fix.componentInstance.selectedCell.value).toEqual(40);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        });

    it('keyboard navigation - should scroll into view the not fully visible cells when navigating up', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);

        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const displayContainer = fix.nativeElement.querySelectorAll('igx-display-container')[1];
        fix.componentInstance.scrollTop(25);
        await wait(50);

        fix.detectChanges();
        expect(displayContainer.style.top).toEqual('-25px');
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const cell = rows[1].querySelectorAll('igx-grid-cell')[1];
        cell.dispatchEvent(new Event('focus'));
        await wait(50);

        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual(10);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

        const curCell = grid.getCellByColumn(1, '1');
        curCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp'}));
        await wait(50);
        fix.detectChanges();

        fix.detectChanges();
        expect(displayContainer.style.top).toEqual('0px');
        expect(fix.componentInstance.selectedCell.value).toEqual(0);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
    });

    it('keyboard navigation - should allow navigating first/last cell in column with down/up and Cntr key.', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        grid.verticalScrollContainer.addScrollTop(5000);

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        let cell = grid.getCellByColumn(104, 'value');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(cell.selected).toBe(true);
        expect(cell.focused).toBe(true);
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true }));
        await wait(200);
        fix.detectChanges();

        let selectedCellFromGrid = grid.selectedCells[0];
        expect(fix.componentInstance.selectedCell.value).toEqual(9990);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');
        expect(fix.componentInstance.selectedCell.rowIndex).toEqual(999);
        expect(selectedCellFromGrid.value).toEqual(9990);
        expect(selectedCellFromGrid.column.field).toMatch('value');
        expect(selectedCellFromGrid.rowIndex).toEqual(999);

        cell = grid.getCellByColumn(998, 'other');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(cell.selected).toBe(true);
        expect(cell.focused).toBe(true);
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true }));
        await wait(200);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(0);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('other');
        expect(fix.componentInstance.selectedCell.rowIndex).toEqual(0);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop ).toEqual(0);
        selectedCellFromGrid = grid.selectedCells[0];
        expect(selectedCellFromGrid.value).toEqual(0);
        expect(selectedCellFromGrid.column.field).toMatch('other');
        expect(selectedCellFromGrid.rowIndex).toEqual(0);
    });

    it('keyboard navigation - should allow navigating first/last cell in column with home/end and Cntr key.', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(50);
        fix.componentInstance.data = fix.componentInstance.generateData(500);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        grid.verticalScrollContainer.addScrollTop(5000);

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        let cell = grid.getCellByColumn(101, '2');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(cell.selected).toBe(true);
        expect(cell.focused).toBe(true);
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true }));
        await wait(200);
        fix.detectChanges();

        let selectedCellFromGrid = grid.selectedCells[0];
        expect(fix.componentInstance.selectedCell.value).toEqual(0);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('0');
        expect(fix.componentInstance.selectedCell.rowIndex).toEqual(0);
        expect(selectedCellFromGrid.value).toEqual(0);
        expect(selectedCellFromGrid.column.field).toMatch('0');
        expect(selectedCellFromGrid.rowIndex).toEqual(0);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop ).toEqual(0);

        cell = grid.getCellByColumn(4, '2');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }));
        await wait(200);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(244510);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('49');
        expect(fix.componentInstance.selectedCell.rowIndex).toEqual(499);

        selectedCellFromGrid = grid.selectedCells[0];
        expect(selectedCellFromGrid.value).toEqual(244510);
        expect(selectedCellFromGrid.column.field).toMatch('49');
        expect(selectedCellFromGrid.rowIndex).toEqual(499);
    });

    it('keyboard navigation - should scroll into view the not fully visible cells when navigating left', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);

        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const rowDisplayContainer = rows[1].querySelector('igx-display-container');
        fix.componentInstance.scrollLeft(50);
        await wait(50);
        fix.detectChanges();

        expect(rowDisplayContainer.style.left).toEqual('-50px');
        const cell = rows[1].querySelectorAll('igx-grid-cell')[1];
        cell.dispatchEvent(new Event('focus'));
        await wait(50);

        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual(10);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        const curCell = grid.getCellByColumn(1, '1');
        curCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: false }));
        await wait(50);

        fix.detectChanges();
        expect(rowDisplayContainer.style.left).toEqual('0px');
        expect(fix.componentInstance.selectedCell.value).toEqual(0);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('0');
    });

    it('keyboard navigation - should scroll into view the not fully visible cells when navigating right', async() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const rowDisplayContainer = rows[1].querySelector('igx-display-container');
        expect(rowDisplayContainer.style.left).toEqual('0px');
        const cell = rows[1].querySelectorAll('igx-grid-cell')[2];
        cell.dispatchEvent(new Event('focus'));
        await wait(50);
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual(20);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('2');
        const curCell = grid.getCellByColumn(1, '2');
        curCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: false }));
        await wait(50);

        fix.detectChanges();
        expect(rowDisplayContainer.style.left).toEqual('-25px');
        expect(fix.componentInstance.selectedCell.value).toEqual(30);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('3');
    });

    it('should scroll first row into view when pressing arrow up', (async () => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        // the 2nd sell on the row with index 1
        const cell = fix.debugElement.queryAll(By.css(`${CELL_CSS_CLASS}:nth-child(2)`))[1];

        fix.componentInstance.scrollTop(25);
        await wait(200);
        fix.detectChanges();

        let scrollContainer = fix.componentInstance.instance.verticalScrollContainer.dc.instance._viewContainer;
        let scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

        expect(scrollContainerOffset).toEqual(-25);

        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(10);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        scrollContainer = fix.componentInstance.instance.verticalScrollContainer.dc.instance._viewContainer;
        scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

        expect(scrollContainerOffset).toEqual(0);
        expect(fix.componentInstance.selectedCell.value).toEqual(0);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');
    }));

    it('keyboard navigation - Should properly blur the focused cell when scroll with mouse wheeel', (async () => {
        pending('This scenario need to be tested manually');
        const fix = TestBed.createComponent(GridWithScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection5;
        const firstCell = grid.rowList.first.cells.toArray()[0];

        firstCell.onFocus(new Event('focus'));
        await wait(30);
        fix.detectChanges();

        expect(firstCell.selected).toBeTruthy();
        expect(firstCell.focused).toBeTruthy();

        const displayContainer = grid.nativeElement.querySelector('.igx-grid__tbody >.igx-display-container');
        const event = new WheelEvent('wheel', {deltaX: 0, deltaY: 500});
        displayContainer.dispatchEvent(event);
        await wait(300);

        expect(firstCell.isSelected).toBeFalsy();
        expect(firstCell.selected).toBeFalsy();
        expect(firstCell.focused).toBeFalsy();
    }));

    it('keyboard navigation - Should properly handle TAB / SHIFT + TAB on row selectors', (async () => {
        const fix = TestBed.createComponent(GridWithScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection5;

        const firstRow = grid.getRowByIndex(0);
        const firstRowCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox');
        const secondRow = grid.getRowByIndex(1);
        const secondRowCheckbox: HTMLElement = secondRow.nativeElement.querySelector('.igx-checkbox');
        let cell = grid.getCellByColumn(1, 'ID');

        cell.onFocus(new Event('focus'));
        await wait(30);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
        await wait(30);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        expect(secondRow.isSelected).toBeTruthy();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--checked')).toBeTruthy();

        UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
        await wait(30);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        expect(secondRow.isSelected).toBeFalsy();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--checked')).toBeFalsy();

        cell = grid.getCellByColumn(1, 'ID');
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {key: 'tab', shiftKey: true}));
        await wait(100);
        fix.detectChanges();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

        cell = grid.getCellByColumn(0, 'Column 15');
        expect(cell.selected).toBeTruthy();
        expect(cell.focused).toBeTruthy();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

        UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
        await wait(30);
        fix.detectChanges();

        expect(firstRow.isSelected).toBeTruthy();
        expect(firstRowCheckbox.classList.contains('igx-checkbox--checked')).toBeTruthy();

        UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
        await wait(30);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        expect(firstRow.isSelected).toBeFalsy();
        expect(firstRowCheckbox.classList.contains('igx-checkbox--checked')).toBeFalsy();

        UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
        await wait(100);
        fix.detectChanges();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

        cell = grid.getCellByColumn(1, 'ID');
        expect(cell.selected).toBeTruthy();
        expect(cell.focused).toBeTruthy();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();
    }));

    it('keyboard navigation - Should properly blur the focused cell when scroll with mouse wheeel', (async () => {
        pending('This scenario need to be tested manually');
        const fix = TestBed.createComponent(GridWithScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection5;
        const firstCell = grid.rowList.first.cells.toArray()[0];

        firstCell.onFocus(new Event('focus'));
        await wait(30);
        fix.detectChanges();

        expect(firstCell.selected).toBeTruthy();
        expect(firstCell.focused).toBeTruthy();

        const displayContainer = grid.nativeElement.querySelector('.igx-grid__tbody >.igx-display-container');
        const event = new WheelEvent('wheel', {deltaX: 0, deltaY: 500});
        displayContainer.dispatchEvent(event);
        await wait(300);

        expect(firstCell.isSelected).toBeFalsy();
        expect(firstCell.selected).toBeFalsy();
        expect(firstCell.focused).toBeFalsy();
    }));

    it('Should properly handle TAB / SHIFT + TAB on edge cell, triggering virt scroll', (async () => {
        const fix = TestBed.createComponent(GridWithScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection5;
        const virtualizationSpy = spyOn<any>(grid.parentVirtDir.onChunkLoad, 'emit').and.callThrough();
        // Focus left right cell
        const gridFirstRow = grid.rowList.first;
        const cellsLength = grid.rowList.first.cells.length;
        const mockEvent = jasmine.createSpyObj('mockEvt', ['preventDefault', 'stopPropagation']);

        // Focus last right cell
        const lastVisibleCell = gridFirstRow.cells.toArray()[cellsLength - 3];

        lastVisibleCell.onFocus(mockEvent);
        await wait(30);
        fix.detectChanges();

        expect(lastVisibleCell.isSelected).toBeTruthy();
        UIInteractions.triggerKeyDownEvtUponElem('tab', lastVisibleCell, true);
        await wait(30);
        fix.detectChanges();
        expect(virtualizationSpy).toHaveBeenCalledTimes(1);

        const targetCell = gridFirstRow.cells.toArray()[cellsLength - 3];
        targetCell.onFocus(mockEvent);
        await wait(30);
        fix.detectChanges();

        expect(targetCell.isSelected).toBeTruthy();

        // Focus second last right cell, TAB will NOT trigger virtualization;
        UIInteractions.triggerKeyDownEvtUponElem('tab', targetCell, true);
        await wait(30);
        fix.detectChanges();

        expect(virtualizationSpy).toHaveBeenCalledTimes(1);
        expect(lastVisibleCell.isSelected).toBeTruthy();

        // Focus leftmost cell, SHIFT + TAB will NOT trigger virtualization
        gridFirstRow.cells.first.onFocus(mockEvent);
        await wait(30);
        fix.detectChanges();

        expect(gridFirstRow.cells.first.isSelected).toBeTruthy();
        gridFirstRow.cells.first.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {key: 'tab', shiftKey: true}));
        await wait(30);
        fix.detectChanges();

        // There are not cells prior to the first cell - no scrolling will be done, spy will not be called;
        expect(virtualizationSpy).toHaveBeenCalledTimes(1);
    }));

});


@Component({
    template: `
        <igx-grid
            (onSelection)="cellSelected($event)"
            (onCellClick)="cellClick($event)"
            (onContextMenu)="cellRightClick($event)"
            (onDoubleClick)="doubleClick($event)"
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class DefaultGridComponent {

    public data = [
        { index: 1, value: 1 },
        { index: 2, value: 2 }
    ];

    public selectedCell: IgxGridCellComponent;
    public clickedCell: IgxGridCellComponent;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public cellClick(evt) {
        this.clickedCell = evt.cell;
    }

    public cellRightClick(evt) {
        this.clickedCell = evt.cell;
    }

    public doubleClick(evt) {
        this.clickedCell = evt.cell;
    }
}

@Component({
    template: `
        <igx-grid (onSelection)="cellSelected($event)" [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class CtrlKeyKeyboardNagivationComponent {

    public data = [
        { index: 1, value: 1, other: 1, another: 1 },
        { index: 2, value: 2, other: 2, another: 2 }
    ];

    public selectedCell: IgxGridCellComponent;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
}

@Component({
    template: `
        <igx-grid [height]="gridHeight" [columnWidth]="defaultWidth" [width]="gridWidth" [data]="data" (onSelection)="cellSelected($event)">
            <igx-column *ngFor="let c of cols" [field]="c.field" [header]="c.field" [width]="c.width">
            </igx-column>
        </igx-grid>
    `
})
export class VirtualGridComponent {

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public gridWidth = '800px';
    public gridHeight = '300px';
    public data = [];
    public cols = [
        { field: 'index' },
        { field: 'value' },
        { field: 'other' },
        { field: 'another' }
    ];
    public defaultWidth = '200px';
    public selectedCell: IgxGridCellComponent;

    constructor() {
        this.data = this.generateData(1000);
    }

    public generateCols(numCols: number, defaultColWidth = null) {
        const cols = [];
        for (let j = 0; j < numCols; j++) {
            cols.push({
                field: j.toString(),
                width: defaultColWidth !== null ? defaultColWidth : j % 8 < 2 ? 100 : (j % 6) * 125
            });
        }
        return cols;
    }

    public generateData(numRows: number) {
        const data = [];

        for (let i = 0; i < numRows; i++) {
            const obj = {};
            for (let j = 0; j < this.cols.length; j++) {
                const col = this.cols[j].field;
                obj[col] = 10 * i * j;
            }
            data.push(obj);
        }
        return data;
    }

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public scrollTop(newTop: number) {
        this.instance.verticalScrollContainer.getVerticalScroll().scrollTop = newTop;
    }

    public scrollLeft(newLeft: number) {
        this.instance.parentVirtDir.getHorizontalScroll().scrollLeft = newLeft;
    }
}

@Component({
    template: `
        <igx-grid [height]="'300px'" [width]="'800px'" [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class NoColumnWidthGridComponent {
    public data = [];
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;
    constructor() {
        this.data = this.generateData();
    }
    public generateData() {
        const data = [];
        for (let i = 0; i < 1000; i++) {
            data.push({ index: i, value: i, other: i, another: i });
        }
        return data;
    }
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [editable]="true" field="FirstName"></igx-column>
            <igx-column field="LastName"></igx-column>
            <igx-column field="age"></igx-column>
        </igx-grid>
        <input type="text" value="text" id="input-test" />
    `
})
export class GridWithEditableColumnComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public data = [
        { FirstName: 'John', LastName: 'Brown', age: 20 },
        { FirstName: 'Ben', LastName: 'Affleck', age: 30 },
        { FirstName: 'Tom', LastName: 'Riddle', age: 50 }
    ];
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [editable]="true" field="fullName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="true" [dataType]="'date'"></igx-column>
            <igx-column [editable]="true" field="personNumber" [dataType]="'number'"></igx-column>
        </igx-grid>
    `
})
export class CellEditingTestComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];
}
@Component({
    template: `
        <igx-grid [data]="data" width="300px" height="250px">
            <igx-column [editable]="true" field="firstName"></igx-column>
            <igx-column [editable]="true" field="lastName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="true" [dataType]="'date'"></igx-column>
            <igx-column field="fullName" [editable]="true"></igx-column>
        </igx-grid>
        <button class="btnTest">Test</button>
    `
})
export class CellEditingScrollTestComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public data = [
        { firstName: 'John', lastName: 'Brown', age: 20, isActive: true, birthday: new Date('08/08/2001'), fullName: 'John Brown' },
        { firstName: 'Ben', lastName: 'Hudson', age: 30, isActive: false, birthday: new Date('08/08/1991'), fullName: 'Ben Hudson' },
        { firstName: 'Tom', lastName: 'Riddle', age: 50, isActive: true, birthday: new Date('08/08/1967'), fullName: 'Tom Riddle' },
        { firstName: 'John', lastName: 'David', age: 27, isActive: true, birthday: new Date('08/08/1990'), fullName: 'John David' },
        { firstName: 'David', lastName: 'Affleck', age: 36, isActive: false, birthday: new Date('08/08/1982'), fullName: 'David Affleck' },
        { firstName: 'Jimmy', lastName: 'Johnson', age: 57, isActive: true, birthday: new Date('08/08/1961'), fullName: 'Jimmy Johnson' },
        { firstName: 'Martin', lastName: 'Brown', age: 31, isActive: true, birthday: new Date('08/08/1987'), fullName: 'Martin Brown' },
        { firstName: 'Tomas', lastName: 'Smith', age: 81, isActive: false, birthday: new Date('08/08/1931'), fullName: 'Tomas Smith' },
        { firstName: 'Michael', lastName: 'Parker', age: 48, isActive: true, birthday: new Date('08/08/1970'), fullName: 'Michael Parker' }
    ];

    public scrollTop(newTop: number) {
        this.grid.verticalScrollContainer.getVerticalScroll().scrollTop = newTop;
    }

    public scrollLeft(newLeft: number) {
        this.grid.parentVirtDir.getHorizontalScroll().scrollLeft = newLeft;
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" [width]="'900px'" [height]="'500px'" [rowSelectable]="true">
        <igx-column *ngFor="let c of columns" [field]="c.field"
                                              [header]="c.field"
                                              [width]="c.width"
                                              [movable]="true"
                                              [groupable]="true"
                                              [resizable]="true"
                                              [sortable]="true"
                                              [filterable]="true"
                                              [editable]="true"
                                              [cellClasses]="c.cellClasses">
        </igx-column>
    </igx-grid>`,
    styleUrls: ['../../test-utils/grid-cell-style-testing.scss'],
})
export class ConditionalCellStyleTestComponent implements OnInit {
    public data: Array<any>;
    public columns: Array<any>;

    @ViewChild('grid') public grid: IgxGridComponent;

    cellClasses;
    cellClasses1;

    callback = (rowData: any, columnKey: any) => {
        return rowData[columnKey] >= 5;
    }

    callback1 = (rowData: any) => {
        return rowData[this.grid.primaryKey] === 5;
    }

    public ngOnInit(): void {
        this.cellClasses = {
            'test': this.callback,
            'test2': this.callback1
        };

        this.cellClasses1 = {
            'test2': this.callback1
        };

        this.columns = [
            { field: 'ProductID', width: 100, cellClasses: this.cellClasses },
            { field: 'ProductName', width: 200, cellClasses: this.cellClasses1 },
            { field: 'InStock', width: 150, cellClasses: this.cellClasses1 },
            { field: 'UnitsInStock', width: 150, cellClasses: {'test1' : true } },
            { field: 'OrderDate', width: 150, cellClasses: this.cellClasses1 }
        ];
        this.data = SampleTestData.foodProductDataExtended();
    }
}

@Component({
    template: `
        <igx-grid [data]="data" width="300px" height="250px">
            <igx-column field="firstName"></igx-column>
            <igx-column field="lastName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="false" [dataType]="'date'"></igx-column>
            <igx-column field="fullName" [editable]="false"></igx-column>
        </igx-grid>
        <button class="btnTest">Test</button>
    `
})
export class ColumnEditablePropertyTestComponent {
     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
     public data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];
}

@Component({
    template: `
            <igx-grid #gridSelection3
            [data]="data"
            [primaryKey]="'ID'"
            [width]="'800px'"
            [height]="'600px'"
            [autoGenerate]="true"
            [rowSelectable]="true"
        >
        </igx-grid>
    `
})
export class GridWithScrollsComponent implements OnInit {
    public data = [];

    @ViewChild(IgxGridComponent, {read: IgxGridComponent})
    public gridSelection5: IgxGridComponent;

    ngOnInit() {
        this.data = this.getData();
    }

    public getData(rows: number = 16, cols: number = 16): any[] {
        const bigData = [];
        for (let i = 0; i < rows; i++) {
            const row = {};
            row['ID'] = i.toString();
            for (let j = 1; j < cols; j++) {
                row['Column ' + j] = i * j;
            }

            bigData.push(row);
        }
        return bigData;
    }
}

