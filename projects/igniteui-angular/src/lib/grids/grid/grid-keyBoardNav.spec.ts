import { Component, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { async, TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { IgxColumnComponent, IgxGridCellComponent, IgxGridModule, IgxGridRowComponent, IgxGridGroupByRowComponent,  } from './index';
import { IgxGridComponent } from './grid.component';
import { DataParent } from '../../test-utils/sample-test-data.spec';
import { IGridCellEventArgs } from '../grid-base.component';

import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { HelperUtils} from '../../test-utils/helper-utils.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { PinOnInitAndSelectionComponent, PinningComponent } from '../../test-utils/grid-samples.spec';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';

describe('IgxGrid - Keyboard navigation', () => {
    configureTestSuite();
    const expandCollapceGroupRow =
    (fix: ComponentFixture<DefaultGroupBYGridComponent>,
        groupRow: IgxGridGroupByRowComponent,
        cell: IgxGridCellComponent) => new Promise(async (resolve, reject) => {
        expect(groupRow.focused).toBe(true);
        expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
        if (cell != null) {
            expect(cell.selected).toBe(true);
        }

        groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowleft', code: 'arrowleft', altKey: true }));
        await wait(300);
        fix.detectChanges();

        expect(groupRow.expanded).toBe(false);
        expect(groupRow.focused).toBe(true);
        expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
        if (cell != null) {
            expect(cell.selected).toBe(true);
        }

        groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowright', code: 'arrowright', altKey: true }));
        await wait(100);
        fix.detectChanges();

        expect(groupRow.expanded).toBe(true);
        expect(groupRow.focused).toBe(true);
        expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
        if (cell != null) {
            expect(cell.selected).toBe(true);
        }
        resolve();
    });


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
                GridWithScrollsComponent,
                GridWithSelectionComponent,
                PinOnInitAndSelectionComponent,
                PinningComponent
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

    it('Should handle keydown events on cells properly even when primaryKey is specified', (async () => {
        const fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection1;
        expect(grid.primaryKey).toBeTruthy();
        expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
        const targetCell = grid.getCellByKey(2, 'Name');
        const targetCellElement: HTMLElement = grid.getCellByKey(2, 'Name').nativeElement;
        spyOn(grid.getCellByKey(2, 'Name'), 'onFocus').and.callThrough();
        expect(targetCell.focused).toEqual(false);
        targetCellElement.dispatchEvent(new FocusEvent('focus'));
        await wait(30);
        spyOn(grid.getCellByKey(3, 'Name'), 'onFocus').and.callThrough();
        fix.detectChanges();
        expect(targetCell.onFocus).toHaveBeenCalledTimes(1);
        expect(targetCell.focused).toEqual(true);

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
        await wait(30);
        fix.detectChanges();

        expect(grid.getCellByKey(3, 'Name').onFocus).toHaveBeenCalledTimes(1);
        expect(grid.getCellByKey(3, 'Name').focused).toEqual(true);
        expect(targetCell.focused).toEqual(false);
        expect(grid.selectedCells.length).toEqual(1);
        expect(grid.selectedCells[0].row.rowData[grid.primaryKey]).toEqual(3);
    }));

    it('Should properly move focus when loading new row chunk', (async() => {
        const fix = TestBed.createComponent(GridWithSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection3;
        const lastRowIndex = grid.rowList.length - 2;
        let targetCell = grid.getCellByColumn(lastRowIndex, 'Column1');
        const initialValue = targetCell.value;
        const targetCellElement: HTMLElement = targetCell.nativeElement;
        spyOn(targetCell, 'onFocus').and.callThrough();
        expect(targetCell.focused).toEqual(false);
        targetCellElement.focus();
        spyOn(targetCell.gridAPI, 'get_cell_by_visible_index').and.callThrough();
        fix.detectChanges();
        targetCell = grid.getCellByColumn(lastRowIndex, 'Column1');
        expect(targetCell.focused).toEqual(true);
        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
        await wait(200);
        fix.detectChanges();
        const newLastRowIndex = lastRowIndex + 1;
        expect(grid.getCellByColumn(newLastRowIndex, 'Column1').value === initialValue).toBeFalsy();
        expect(grid.getCellByColumn(newLastRowIndex, 'Column1').focused).toEqual(true);
        expect(grid.getCellByColumn(newLastRowIndex, 'Column1').selected).toEqual(true);
        expect(grid.getCellByColumn(newLastRowIndex, 'Column1').nativeElement.classList).toContain('igx-grid__td--selected');
        expect(grid.getCellByColumn(lastRowIndex, 'Column1').focused).toEqual(false);
        expect(grid.selectedCells.length).toEqual(1);
    }));

    it('should toggle expand/collapse state of group row with ArrowRight/ArrowLeft key.', async(() => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '400px';
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();
        const gRow = grid.groupsRowList.toArray()[0];
        expect(gRow.expanded).toBe(true);
        const evtArrowLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true });

        const evtArrowRight = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true });
        gRow.element.nativeElement.dispatchEvent(evtArrowLeft);
        fix.detectChanges();

        expect(gRow.expanded).toBe(false);

        gRow.element.nativeElement.dispatchEvent(evtArrowRight);
        fix.detectChanges();
        expect(gRow.expanded).toBe(true);
    }));

    it(`focus should stays over the group row when expand/collapse
        with ArrowRight/ArrowLeft keys and grid is scrolled to bottom`, (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '500px';
        await wait(30);
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        fix.detectChanges();

        const groupRows = grid.nativeElement.querySelectorAll('igx-grid-groupby-row');
        let lastGroupRow = groupRows[groupRows.length - 1];
        const lastGroupRowIndex = parseInt(lastGroupRow.dataset.rowindex, 10);
        lastGroupRow.dispatchEvent(new FocusEvent('focus'));
        await wait(30);
        fix.detectChanges();

        expect(lastGroupRow.classList.contains('igx-grid__group-row--active')).toBeTruthy();
        lastGroupRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));

        await wait(100);
        fix.detectChanges();
        lastGroupRow =  grid.nativeElement.querySelector(`igx-grid-groupby-row[data-rowindex="${lastGroupRowIndex}"]`);
        expect(lastGroupRow).toBeDefined();
        expect(lastGroupRow.classList.contains('igx-grid__group-row--active')).toBeTruthy();
        expect(lastGroupRow.getAttribute('aria-expanded')).toBe('false');
    }));

    it(`should be able to navigate down to the next row when expand the last group row
    and grid is scrolled to bottom`, (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '500px';
        await wait(30);
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        fix.detectChanges();

        grid.groupsRowList.last.toggle();
        await wait(30);
        fix.detectChanges();
        expect(grid.groupsRowList.last.expanded).toBeFalsy();

        grid.groupsRowList.last.toggle();
        await wait(30);
        fix.detectChanges();
        expect(grid.groupsRowList.last.expanded).toBeTruthy();

        const groupRowIndex = grid.groupsRowList.last.index;
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', grid.groupsRowList.last.nativeElement, true);
        await wait(100);
        fix.detectChanges();

        const selectedCell = grid.nativeElement.querySelector('.igx-grid__td--selected');
        expect(selectedCell).toBeDefined();
        expect(parseInt(selectedCell.dataset.rowindex, 10)).toBe(groupRowIndex + 1);
        expect(parseInt(selectedCell.dataset.visibleindex, 10)).toBe(0);

    }));

    xit('should allow keyboard navigation through group rows.', (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '400px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        await wait();
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();
        await HelperUtils.navigateVerticallyToIndex(grid, 0, 9);

        let row = grid.getRowByIndex(9);
        expect(row instanceof IgxGridRowComponent).toBe(true);
        expect(row.focused).toBe(true);
        expect(row.cells.toArray()[0].selected).toBe(true);

        await HelperUtils.navigateVerticallyToIndex(grid, 9, 0);

        row = grid.getRowByIndex(0);
        expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
        expect(row.focused).toBe(true);
    }));


    describe('IgxGrid - keyboard navigation tests', () => {
        configureTestSuite();
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxGridDefaultRenderingComponent
                ],
                imports: [
                    NoopAnimationsModule, IgxGridModule.forRoot()]
            }).compileComponents();
        }));

        it('should allow pageup/pagedown navigation when the grid is focused', async () => {
            const fix = TestBed.createComponent(IgxGridDefaultRenderingComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;
            const pageDownKeyEvent = new KeyboardEvent('keydown', {
                code: 'PageDown',
                key: 'PageDown'
            });
            const pageUpKeyEvent = new KeyboardEvent('keydown', {
                code: 'PageUp',
                key: 'PageUp'
            });
            let currScrollTop;
            grid.width = '800px';
            grid.height = '500px';
            fix.componentInstance.initColumnsRows(25, 25);
            await wait();
            fix.detectChanges();
            grid.nativeElement.dispatchEvent(new Event('focus'));

            // testing the pagedown key
            grid.nativeElement.dispatchEvent(pageDownKeyEvent);
            grid.cdr.detectChanges();

            await wait();
            currScrollTop = grid.verticalScrollContainer.getVerticalScroll().scrollTop;
            expect(currScrollTop).toEqual(grid.verticalScrollContainer.igxForContainerSize);

            // testing the pageup key
            grid.nativeElement.dispatchEvent(pageUpKeyEvent);
            grid.cdr.detectChanges();
            await wait();
            currScrollTop = grid.parentVirtDir.getHorizontalScroll().scrollTop;
            expect(currScrollTop).toEqual(0);
        });
    });

    describe('Row Editing - Navigation - Keyboard', () => {
        it(`Should jump from first editable columns to overlay buttons`, fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            const targetCell = fixture.componentInstance.focusGridCell(0, 'Downloads');
            const firstCellElement = targetCell.nativeElement;
            fixture.detectChanges();
            targetCell.onKeydownEnterEditMode({});
            fixture.detectChanges();
            // TO button
            fixture.componentInstance.moveNext(true);
            fixture.detectChanges();
            expect(document.activeElement.outerHTML).toContain('igxrowedittabstop=');
            expect(document.activeElement.textContent).toContain('Done');
            // FROM button to first
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'tab',
                code: 'tab',
                shiftKey: false
            }));
            tick();
            fixture.detectChanges();
            expect(fixture.componentInstance.getCurrentEditCell().column.field).toEqual('Downloads');
            expect(document.activeElement).toEqual(firstCellElement);
        }));

        it(`Should jump from last editable columns to overlay buttons`, (async () => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = grid.parentVirtDir.getHorizontalScroll().clientWidth;
            await wait(DEBOUNCETIME);
            const targetCell = fixture.componentInstance.getCell(0, 'Test');
            const lastCellElement = targetCell.nativeElement;
            targetCell.nativeElement.focus();
            fixture.detectChanges();
            targetCell.onKeydownEnterEditMode({});
            fixture.detectChanges();
            // TO button
            fixture.componentInstance.moveNext(false);
            fixture.detectChanges();
            expect(document.activeElement.outerHTML).toContain('igxrowedittabstop=');
            expect(document.activeElement.textContent).toContain('Cancel');
            // FROM button to first
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'tab',
                code: 'tab',
                shiftKey: true
            }));
            fixture.detectChanges();
            expect(fixture.componentInstance.getCurrentEditCell().column.field).toEqual('Test');
            expect(document.activeElement).toEqual(lastCellElement);
        }));

        it(`Should scroll editable column into view when navigating from buttons`, (async () => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            let currentEditCell: IgxGridCellComponent;
            const grid = fixture.componentInstance.grid;
            const targetCell = fixture.componentInstance.focusGridCell(0, 'Downloads');
            fixture.detectChanges();
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 0;
            await wait(500);
            targetCell.onKeydownEnterEditMode({});
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            fixture.detectChanges();
            // go to 'Cancel'
            (<HTMLElement>document.activeElement.previousElementSibling).focus();
            fixture.detectChanges();
            // go to LAST editable cell
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', code: 'tab', shiftKey: true }));
            fixture.detectChanges();
            await wait(500);
            currentEditCell = fixture.componentInstance.getCurrentEditCell();
            expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(0);
            expect(currentEditCell.column.field).toEqual('Test');
            // move to Cancel
            fixture.componentInstance.moveNext(false);
            fixture.detectChanges();
            // move to DONE
            (<HTMLElement>document.activeElement.nextElementSibling).focus();
            fixture.detectChanges();
            // move to FIRST editable cell
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', code: 'tab', shiftKey: false }));
            fixture.detectChanges();
            await wait(500);
            currentEditCell = fixture.componentInstance.getCurrentEditCell();
            expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toEqual(0);
            expect(currentEditCell.column.field).toEqual('Downloads');
        }));

        it(`Should skip non-editable columns`, fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            const targetCell = fixture.componentInstance.focusGridCell(0, 'Downloads');
            fixture.detectChanges();
            targetCell.onKeydownEnterEditMode({});
            tick();
            fixture.detectChanges();
            const navSpyR = spyOn((<any>grid).navigation, 'moveNextEditable').and.callThrough();
            const navSpyL = spyOn((<any>grid).navigation, 'movePreviousEditable').and.callThrough();
            // Move forwards
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            expect(navSpyR).toHaveBeenCalledTimes(1);
            const newCell = (<any>grid).gridAPI.get_cell_inEditMode(grid.id);
            expect(newCell.cellID.columnID).toEqual(targetCell.columnIndex + 3);
            expect(newCell.cell.column.editable).toEqual(true);
            // Move backwards
            fixture.componentInstance.moveNext(true);
            tick();
            fixture.detectChanges();
            expect(navSpyL).toHaveBeenCalledTimes(1);
            expect((<any>grid).gridAPI.get_cell_inEditMode(grid.id).cellID.columnID).toEqual(targetCell.columnIndex);
            expect((<any>grid).gridAPI.get_cell_inEditMode(grid.id).cell.column.editable).toEqual(true);

        }));

        it(`Should skip non-editable columns when column pinning is enabled`, fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fixture.componentInstance.pinnedFlag = true;
            fixture.detectChanges();
            // from pinned to pinned
            targetCell = fixture.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.onKeydownEnterEditMode({});
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            // from pinned to unpinned
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            // EXPECT focused cell to be 'ReleaseDate'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('ReleaseDate');
            expect(editedCell.inEditMode).toEqual(true);
            // from unpinned to pinned
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            tick();
            fixture.detectChanges();
            // EXPECT edited cell to be 'Released'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
        }));

        it(`Should skip non-editable columns when column hiding is enabled`, fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fixture.componentInstance.hiddenFlag = true;
            fixture.detectChanges();
            // jump over 3 hidden, both editable and not
            targetCell = fixture.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.onKeydownEnterEditMode({});
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            // jump over 1 hidden, editable
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            // EXPECT focused cell to be 'Items'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Items');
            expect(editedCell.inEditMode).toEqual(true);
            // jump over 1 hidden, editable
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            tick();
            fixture.detectChanges();
            // EXPECT edited cell to be 'Released'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            // jump over 3 hidden, both editable and not
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            tick();
            fixture.detectChanges();
            // EXPECT edited cell to be 'Downloads'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Downloads');
            expect(editedCell.inEditMode).toEqual(true);
        }));

        it(`Should skip non-editable columns when column pinning & hiding is enabled`, fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fixture.componentInstance.hiddenFlag = true;
            fixture.componentInstance.pinnedFlag = true;
            fixture.detectChanges();
            // jump over 1 hidden, pinned
            targetCell = fixture.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.onKeydownEnterEditMode({});
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            // jump from pinned to unpinned
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            // EXPECT focused cell to be 'Items'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Items');
            expect(editedCell.inEditMode).toEqual(true);
            // jump back to pinned
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            tick();
            fixture.detectChanges();
            // EXPECT edited cell to be 'Released'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            // jump over 1 hidden, pinned
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            tick();
            fixture.detectChanges();
            // EXPECT edited cell to be 'Downloads'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Downloads');
            expect(editedCell.inEditMode).toEqual(true);
        }));

        it(`Should skip non-editable columns when column grouping is enabled`, (async () => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fixture.componentInstance.columnGroupingFlag = true;
            fixture.detectChanges();
            targetCell = fixture.componentInstance.focusGridCell(0, 'ReleaseDate');
            targetCell.onKeydownEnterEditMode({});
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            fixture.detectChanges();
            // Should disregards the Igx-Column-Group component
            // EXPECT focused cell to be 'Released'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            // Go forwards, jump over Category and group end
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            await wait(DEBOUNCETIME);
            fixture.detectChanges();
            // EXPECT focused cell to be 'Items'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Items');
            expect(editedCell.inEditMode).toEqual(true);
            // Go backwards, jump over group end and return to 'Released'
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            fixture.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            await wait(DEBOUNCETIME);
            // Go to release date
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            fixture.detectChanges();
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('ReleaseDate');
            expect(editedCell.inEditMode).toEqual(true);
        }));

        it(`Should skip non-editable columns when column when all column features are enabled`, fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fixture.componentInstance.hiddenFlag = true;
            fixture.componentInstance.pinnedFlag = true;
            fixture.componentInstance.columnGroupingFlag = true;
            fixture.detectChanges();
            targetCell = fixture.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.onKeydownEnterEditMode({});
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            // Move from Downloads over hidden to Released in Column Group
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(false);
            tick();
            fixture.detectChanges();
            // Move from pinned 'Released' (in Column Group) to unpinned 'Items'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Items');
            expect(editedCell.inEditMode).toEqual(true);
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            tick();
            fixture.detectChanges();
            // Move back to pinned 'Released' (in Column Group)
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.inEditMode).toEqual(true);
            editedCell.nativeElement.focus();
            fixture.detectChanges();
            fixture.componentInstance.moveNext(true);
            tick();
            fixture.detectChanges();
            // Move back to pinned 'Downloads'
            editedCell = fixture.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Downloads');
            expect(editedCell.inEditMode).toEqual(true);
        }));
    });

    
    xit('should persist last selected cell column index when navigation down through group rows.', async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '400px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
        await wait();
        let cell = grid.getCellByColumn(2, 'Released');
        cell.onFocus(new Event('focus'));

        await HelperUtils.navigateVerticallyToIndex(grid, 0, 9, 4);

        grid.markForCheck();
        fix.detectChanges();
        const row = grid.getRowByIndex(9);
        cell = grid.getCellByColumn(9, 'Released');
        expect(row instanceof IgxGridRowComponent).toBe(true);
        expect(row.focused).toBe(true);
        expect(cell.selected).toBe(true);
    });

    it('keyboard navigation - should focus grouped row when press Tab key and Shift + Tab on a cell', (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '600px';
        grid.columnWidth = '100px';
        await wait(100);
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();
        let cell = grid.getCellByColumn(2, 'Released');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(100);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
        await wait(100);
        fix.detectChanges();

        let groupRow = grid.groupsRowList.toArray()[1];
        cell = grid.getCellByColumn(2, 'Released');
        await expandCollapceGroupRow(fix, groupRow, cell);

        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', groupRow.nativeElement, true);
        await wait(300);
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
        await wait(500);
        fix.detectChanges();

        groupRow = grid.groupsRowList.toArray()[2];
        cell = grid.getCellByColumn(7, 'Downloads');
        await expandCollapceGroupRow(fix, groupRow, cell);
    }));

    it('keyboard navigation - should correct work when press tab and sft+tab on a grouped row', (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '600px';
        grid.columnWidth = '100px';
        await wait(50);
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        let groupRow = grid.groupsRowList.toArray()[0];
        groupRow.nativeElement.dispatchEvent(new Event('focus'));
        await wait(50);
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

    it('keyboard navigation - should correct work when press tab and sft+tab on a grouped row when have row selectors', (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '600px';
        grid.columnWidth = '100px';
        grid.rowSelectable = true;
        await wait(30);
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        await wait(30);
        fix.detectChanges();

        const groupRow = grid.groupsRowList.toArray()[0];
        const firstRow = grid.getRowByIndex(1);
        const firstRowCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox');
        const cell = grid.getCellByColumn(1, 'Downloads');

        groupRow.nativeElement.dispatchEvent(new Event('focus'));
        await wait(30);
        fix.detectChanges();

        expect(groupRow.focused).toBe(true);
        expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);

        UIInteractions.triggerKeyDownEvtUponElem('tab', groupRow.nativeElement, true);
        await wait(100);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        expect(cell.focused).toBeTruthy();
        expect(firstRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
        await wait(30);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        expect(cell.focused).toBeFalsy();
        expect(firstRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

        await expandCollapceGroupRow(fix, groupRow, cell);
    }));

    it('keyboard navigation - expand/colapse row with arrow keys', (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '600px';
        grid.columnWidth = '100px';
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        const groupRow = grid.groupsRowList.toArray()[0];
        groupRow.nativeElement.dispatchEvent(new Event('focus'));
        await wait(50);
        fix.detectChanges();

        await expandCollapceGroupRow(fix, groupRow, null);
    }));

    it('keyboard navigation - should focus grouped row when press arrow keys up or down', (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '600px';
        grid.columnWidth = '100px';
        await wait(50);
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();
        let cell = grid.getCellByColumn(1, 'ID');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(50);
        fix.detectChanges();

        expect(cell.selected).toBe(true);
        expect(cell.focused).toBe(true);
        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', cell.nativeElement, true);
        await wait(100);
        fix.detectChanges();

        let groupRow = grid.groupsRowList.toArray()[0];
        cell = grid.getCellByColumn(1, 'ID');
        await expandCollapceGroupRow(fix, groupRow, cell);

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

        await expandCollapceGroupRow(fix, groupRow, cell);
    }));

    it('keyboard navigation - should correct work when press tab and sft+tab when there is a horizontal scroll', (async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '600px';
        grid.columnWidth = '200px';
        await wait(30);
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        await wait(30);
        fix.detectChanges();

        const groupRow = grid.groupsRowList.toArray()[1];
        const secondRow = grid.getRowByIndex(2);
        let cell;

        groupRow.nativeElement.dispatchEvent(new Event('focus'));
        await wait(30);
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

        await expandCollapceGroupRow(fix, groupRow, cell);

        UIInteractions.triggerKeyDownEvtUponElem('Tab', groupRow.nativeElement, true);
        await wait(100);
        fix.detectChanges();

        cell = grid.getCellByColumn(4, 'Downloads');
        expect(cell.focused).toBe(true);
        expect(cell.selected).toBe(true);

        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
        await wait(30);
        fix.detectChanges();

        expect(cell.selected).toBe(true);
        expect(groupRow.focused).toBe(true);
    }));


    xit('should persist last selected cell column index when navigation up through group rows.', async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '400px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        await wait();
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
        await wait(100);
        fix.detectChanges();
        grid.verticalScrollContainer.addScrollTop(1000);
        await wait(200);
        fix.detectChanges();
        const cell = grid.getCellByColumn(20, 'Released');
        cell.onFocus(new Event('focus'));
        await wait(50);
        fix.detectChanges();
        // await HelperUtils.navigateVerticallyToIndex(grid, 20, 0, 4);
        const row = grid.getRowByIndex(0);
        expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
        expect(row.focused).toBe(true);
    });

    xit('should NOT clear selection from data cells when a group row is focused via KB navigation.', async () => {
        const fix = TestBed.createComponent(DefaultGroupBYGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '800px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();
        const cell = grid.getCellByColumn(2, 'Downloads');
        cell.onClick(null);
        await wait();
        expect(cell.selected).toBe(true);
        await HelperUtils.navigateVerticallyToIndex(grid, 2, 0);

        fix.detectChanges();
        const row = grid.getRowByIndex(0);
        expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
        expect(row.focused).toBe(true);
        expect(cell.selected).toBe(true);
    });

    it('should allow keyboard navigation to first/last cell with Ctrl when there are the pinned columns.', async () => {
        const fix = TestBed.createComponent(GridPinningComponent);
        fix.detectChanges();

        await wait();
        const grid = fix.componentInstance.instance;
        grid.getColumnByName('CompanyName').pinned = true;
        grid.getColumnByName('ContactName').pinned = true;
        fix.detectChanges();
        const cells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        let cell = cells[0];

        cell.triggerEventHandler('focus', {});
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowright', ctrlKey: true }));
        await wait(30);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('030-0076545');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        cell = cells[cells.length - 1];
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowleft', ctrlKey: true }));
        await wait(30);
        fix.detectChanges();

        // It won't scroll left since the next selected cell will be in the pinned area
        expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
    });

    
    it('should allow horizontal keyboard navigation between start pinned area and unpinned area.', fakeAsync (() => {
        const fix = TestBed.createComponent(PinningComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        fix.detectChanges();
        tick();

        grid.getColumnByName('CompanyName').pinned = true;
        grid.getColumnByName('ContactName').pinned = true;

        const cells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        let cell = cells[0];

        cell.triggerEventHandler('focus', {});
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        tick();
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual('Alfreds Futterkiste');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
        cell = cells[1];

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        tick();

        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual('ALFKI');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
        cell = cells[2];

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true);
        tick();
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual('Alfreds Futterkiste');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
        cell.triggerEventHandler('blur', {});
        tick();
        cell = cells[0];

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        tick();
        fix.detectChanges();
        cell = cells[1];

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        tick();
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual('ALFKI');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
    }));

    it('should allow vertical keyboard navigation in pinned area.', fakeAsync (() => {
        const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        fix.detectChanges();
        const cells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        let cell = cells[0];

        cell.triggerEventHandler('focus', {});

        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Alfreds Futterkiste');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true);

        tick();
        grid.cdr.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Ana Trujillo Emparedados y helados');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
        cell = cells[6];

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true);

        tick();
        grid.cdr.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Alfreds Futterkiste');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
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

@Component({
    template: `
        <igx-grid #gridSelection3 [data]="data" [primaryKey]="'ID'" [width]="'800px'" [height]="'600px'"
                  [autoGenerate]="true" [rowSelectable]="true">
        </igx-grid>
    `
})
export class GridWithSelectionComponent implements OnInit {
    public data = [];

    @ViewChild('gridSelection3', {read: IgxGridComponent})
    public gridSelection3: IgxGridComponent;

    ngOnInit() {
        const bigData = [];
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 5; j++) {
                bigData.push({
                    ID: i.toString() + '_' + j.toString(),
                    Column1: i * j,
                    Column2: i * j * Math.pow(10, i),
                    Column3: i * j * Math.pow(100, i)
                });
            }
        }
        this.data = bigData;
    }
}

@Component({
    template: `
        <igx-grid #gridSelection1 [data]="data" [primaryKey]="'ID'">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name"></igx-column>
            <igx-column field="JobTitle"></igx-column>
            <igx-column field="HireDate"></igx-column>
        </igx-grid>
    `
})
export class GridWithPrimaryKeyComponent {
    public data = data;

    @ViewChild('gridSelection1', {read: IgxGridComponent})
    public gridSelection1: IgxGridComponent;
}

let data = [
    {ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z'},
    {ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z'},
    {ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z'},
    {ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z'},
    {ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software Developer', HireDate: '2007-12-19T11:23:17.714Z'},
    {ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z'},
    {ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z'},
    {ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z'},
    {ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z'},
    {ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z'}
];


@Component({
    template: `<igx-grid #grid [data]="data" (onColumnInit)="initColumns($event)">
        <igx-column *ngFor="let col of columns" [field]="col.key" [header]="col.key" [dataType]="col.dataType">
        </igx-column>
    </igx-grid>`
})
export class IgxGridDefaultRenderingComponent {
    public columns = [];
    public data = [];

    public changeInitColumns = false;

    @ViewChild('grid', { read: IgxGridComponent })
    public grid: IgxGridComponent;

    public initColumnsRows(rowsNumber: number, columnsNumber: number): void {
        this.columns = [];
        this.data = [];
        let i, j: number;
        for (i = 0; i < columnsNumber; i++) {
            this.columns.push({
                key: 'col' + i,
                dataType: 'number'
            });
        }
        for (i = 0; i < rowsNumber; i++) {
            const record = {};
            for (j = 0; j < columnsNumber; j++) {
                record[this.columns[j].key] = j * i;
            }
            this.data.push(record);
        }
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }

    public initColumns(column) {
        if (this.changeInitColumns) {
            switch (this.grid.columnList.length) {
                case 5:
                    if (column.index === 0 || column.index === 4) {
                        column.width = '100px';
                    }
                    break;
                case 30:
                    if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
                        column.width = '200px';
                    }
                    break;
                case 150:
                    if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
                        column.width = '500px';
                    }
                    break;
            }
        }
    }
}


@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column
        field="Downloads" header="Downloads" [dataType]="'number'" [pinned]="pinnedFlag" [editable]="true">
        </igx-column>
        <igx-column field="ID" header="ID" [dataType]="'number'"
        [editable]="false" [pinned]="pinnedFlag" [hidden]="hiddenFlag" width="60px">
        </igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" [editable]="false" [hidden]="hiddenFlag" width="150px">
        </igx-column>
        <igx-column field="ReleaseDate" header="Release Date" [dataType]="'date'" [editable]="true" [hidden]="hiddenFlag" width="150px">
        </igx-column>
        <igx-column-group [movable]="true" header="Column Group 1" *ngIf="columnGroupingFlag">
            <igx-column field="Released" header="Released" [dataType]="'boolean'" [pinned]="pinnedFlag" [editable]="true" width="100px">
            </igx-column>
            <igx-column field="Category" header="Category" [dataType]="'string'" [editable]="false" [hidden]="hiddenFlag" width="150px">
            </igx-column>
        </igx-column-group>
        <ng-container *ngIf="!columnGroupingFlag">
            <igx-column field="Released" header="Released" [dataType]="'boolean'" [pinned]="pinnedFlag" [editable]="true" width="100px">
            </igx-column>
            <igx-column field="Category" header="Category" [dataType]="'string'" [editable]="true" [hidden]="hiddenFlag" width="150px">
            </igx-column>
        </ng-container>
        <igx-column field="Items" header="Items" [dataType]="'string'" [editable]="true" width="150px">
        </igx-column>
        <igx-column field="Test" header="Test" [dataType]="'string'" [editable]="true" [hidden]="hiddenFlag" width="150px">
        </igx-column>
    </igx-grid>`
})
export class IgxGridWithEditingAndFeaturesComponent {
    /* Data fields: Downloads:number, ID: number, ProductName: string, ReleaseDate: Date,
                Released: boolean, Category: string, Items: string, Test: string. */
    public pinnedFlag = false;
    public hiddenFlag = false;
    public columnGroupingFlag = false;
    public data = SampleTestData.generateProductData(11);
    @ViewChild('grid', { read: IgxGridComponent }) public grid: IgxGridComponent;
    public moveNext(shiftKey: boolean): void {
        this.getCurrentEditCell().dispatchEvent(new KeyboardEvent('keydown', {
            key: 'tab',
            code: 'tab',
            shiftKey
        }));
    }
    public focusGridCell(rowIndex: number, columnName: string): IgxGridCellComponent {
        const targetCell = this.getCell(rowIndex, columnName);
        targetCell.onFocus(new Event('focus'));
        return targetCell;
    }

    public getCell(rowIndex: number, columnName: string): IgxGridCellComponent {
        return this.grid.getCellByColumn(rowIndex, columnName);
    }

    public getCurrentEditCell(): IgxGridCellComponent {
        const grid = this.grid as any;
        const currentCell = grid.gridAPI.get_cell_inEditMode(this.grid.id);
        return this.grid.getCellByColumn(currentCell.cellID.rowIndex, currentCell.cell.column.field);
    }

    public get gridAPI() {
        return (<any>this.grid).gridAPI;
    }

    public get cellInEditMode() {
        return this.gridAPI.get_cell_inEditMode(this.grid.id).cell;
    }
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)">
        </igx-grid>
        <ng-template #dropArea>
            <span> Custom template </span>
        </ng-template>
    `
})
export class DefaultGroupBYGridComponent extends DataParent {
    public width = '800px';
    public height = null;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    @ViewChild('dropArea', { read: TemplateRef })
    public dropAreaTemplate: TemplateRef<any>;

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = false;
    public enableGrouping = true;
    public currentSortExpressions;

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
        column.filterable = this.enableFiltering;
        column.resizable = this.enableResizing;
        column.editable = this.enableEditing;
        column.groupable = this.enableGrouping;
    }
    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
}

@Component({
    template: `
        <igx-grid
            [width]='"800px"'
            [height]='"300px"'
            [data]="data"
            (onSelection)="cellSelected($event)"
            (onColumnPinning)="columnPinningHandler($event)"
          >
        <igx-column  *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width">
        </igx-column>
        </igx-grid>
    `
})
export class GridPinningComponent {
    public selectedCell;
    public data = [{
        ID: 'ALFKI',
        CompanyName: 'Alfreds Futterkiste',
        ContactName: 'Maria Anders',
        ContactTitle: 'Sales Representative',
        Address: 'Obere Str. 57',
        City: 'Berlin',
        Region: null,
        PostalCode: '12209',
        Country: 'Germany',
        Phone: '030-0074321',
        Fax: '030-0076545'
    }];
    public columns = [
        { field: 'ID', width: 100 },
        { field: 'CompanyName', width: 300 },
        { field: 'ContactName', width: 200 },
        { field: 'ContactTitle', width: 200 },
        { field: 'Address', width: 300 },
        { field: 'City', width: 100 },
        { field: 'Region', width: 100 },
        { field: 'PostalCode', width: 100 },
        { field: 'Phone', width: 150 },
        { field: 'Fax', width: 150 }
    ];

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public columnPinningHandler($event) {
        $event.insertAtIndex = 0;
    }
    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
}