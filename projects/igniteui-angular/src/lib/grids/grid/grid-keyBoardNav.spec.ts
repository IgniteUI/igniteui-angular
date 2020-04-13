import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxGridCellComponent,
    IgxGridModule,
    IgxGridGroupByRowComponent,
} from './index';
import { IgxGridComponent } from './grid.component';
import { IGridCellEventArgs } from '../common/events';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { setupGridScrollDetection, TestNgZone } from '../../test-utils/helper-utils.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    VirtualGridComponent,
    NoScrollsComponent,
    IgxGridGroupByComponent,
    SelectionWithScrollsComponent,
    MRLTestComponent,
    ColumnSelectionGroupTestComponent,
    CollapsibleColumnGroupTestComponent,
    ColumnGroupsNavigationTestComponent
} from '../../test-utils/grid-samples.spec';
import { GridSelectionMode } from '../common/enums';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { DebugElement } from '@angular/core';
import { ColumnLayoutTestComponent } from './grid-mrl-keyboard-nav.spec';

const DEBOUNCETIME = 30;

describe('IgxGrid - Keyboard navigation #grid', () => {

    describe('in not virtualized grid', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    NoScrollsComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(NoScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
        }));

        it('should move selected cell with arrow keys', () => {
            let selectedCell: IgxGridCellComponent;

            grid.onSelection.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });

            // Focus and select first cell
            GridFunctions.focusFirstCell(fix);

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(2);
            expect(selectedCell.column.field).toMatch('ID');

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Gilberto Todd');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Casey Houston');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');
        });

        it('should  jump to first/last cell with Ctrl', () => {
            let selectedCell: IgxGridCellComponent;
            grid.onSelection.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });

            GridFunctions.focusFirstCell(fix);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent, false, false, true);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company A');
            expect(selectedCell.column.field).toMatch('Company');

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent, false, false, true);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');
        });

        it('should allow vertical keyboard navigation in pinned area.', () => {
            grid.getColumnByName('Name').pinned = true;
            fix.detectChanges();

            let selectedCell;
            grid.onSelection.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });
            GridFunctions.focusFirstCell(fix);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Gilberto Todd');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Casey Houston');
            expect(selectedCell.column.field).toMatch('Name');
        });

        it('should allow horizontal keyboard navigation between start pinned area and unpinned area.', () => {
            grid.getColumnByName('Name').pinned = true;
            grid.getColumnByName('Company').pinned = true;
            fix.detectChanges();

            let selectedCell;
            grid.onSelection.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });
            GridFunctions.focusFirstCell(fix);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company A');
            expect(selectedCell.column.field).toMatch('Company');

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company A');
            expect(selectedCell.column.field).toMatch('Company');
        });
    });

    describe('in virtualized grid', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    VirtualGridComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(VirtualGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            gridContent = GridFunctions.getGridContent(fix);
        }));

        it('should allow navigating down', async () => {
            GridFunctions.focusFirstCell(fix);
            await wait();
            fix.detectChanges();

            // Navigate to the 10th row
            for (let index = 0; index < 10; index++) {
                UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(10);
        });

        it('should allow navigating up', async () => {
            grid.verticalScrollContainer.scrollTo(104);
            await wait();
            fix.detectChanges();

            const cell = grid.getCellByColumn(100, 'value');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(100);
            // Navigate to the 94th row
            for (let index = 0; index < 10; index++) {
                UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
                await wait(DEBOUNCETIME);
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
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.focusFirstCell(fix);
            await wait();
            fix.detectChanges();

            for (let index = 0; index < 9; index++) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            expect(fix.componentInstance.selectedCell.columnIndex).toEqual(9);

            for (let index = 9; index > 1; index--) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
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

            GridFunctions.focusFirstCell(fix);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            for (let index = 0; index < 9; index++) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(9);
            // Verify columns
            let cells = grid.getRowByIndex(0).cells.toArray();
            expect(cells.length).toEqual(5);
            expect(cells[0].column.field).toEqual('col1');
            expect(cells[1].column.field).toEqual('col3');
            expect(cells[3].column.field).toEqual('col8');
            expect(cells[4].column.field).toEqual('col9');

            for (let index = 9; index > 1; index--) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
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
            const cell = grid.getCellByColumn(3, '1');
            const bottomRowHeight = rows[4].nativeElement.offsetHeight;
            const displayContainer = GridFunctions.getGridDisplayContainer(fix).nativeElement;
            const bottomCellVisibleHeight = displayContainer.parentElement.offsetHeight % bottomRowHeight;
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
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
            const cell = grid.getCellByColumn(1, '1');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            fix.detectChanges();
            expect(displayContainer.style.top).toEqual('0px');
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        });

        it('should allow navigating first/last cell in column with down/up and Ctrl key.', async () => {
            let cell = grid.getCellByColumn(1, 'value');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();


            cell = grid.getCellByColumn(999, 'value');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell);

            cell = grid.getCellByColumn(998, 'other');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, false, false, true);
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
            await wait(100);
            fix.detectChanges();

            let cell = grid.getCellByColumn(101, '2');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('home', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, '0');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell);
            expect(grid.verticalScrollContainer.getScroll().scrollTop).toEqual(0);

            cell = grid.getCellByColumn(4, '2');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('end', cell.nativeElement, true, false, false, true);
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
            const curCell = grid.getCellByColumn(1, '1');
            UIInteractions.simulateClickAndSelectCellEvent(curCell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', curCell.nativeElement, true);
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
            const curCell = grid.getCellByColumn(1, '2');
            UIInteractions.simulateClickAndSelectCellEvent(curCell);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(20);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('2');

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', curCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('3');
            expect(parseInt(rowDisplayContainer.style.left, 10)).toBeLessThanOrEqual(-40);
        });

        it('should scroll first row into view when pressing arrow up', (async () => {
            grid.reflow();
            fix.componentInstance.scrollTop(25);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let scrollContainer = grid.verticalScrollContainer.dc.instance._viewContainer;
            let scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;
            expect(scrollContainerOffset).toEqual(-25);

            const cell = grid.getCellByColumn(1, 'value');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('value');
            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
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

            GridFunctions.focusFirstCell(fix);
            await wait();
            fix.detectChanges();

            // testing the pagedown key
            UIInteractions.triggerEventHandlerKeyDown('PageDown', gridContent);
            grid.cdr.detectChanges();
            await wait();

            let currScrollTop = grid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(grid.verticalScrollContainer.igxForContainerSize);

            // testing the pageup key
            UIInteractions.triggerEventHandlerKeyDown('PageUp', gridContent);
            grid.cdr.detectChanges();
            await wait();
            currScrollTop = grid.headerContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(0);
        });

        it('Custom KB navigation: should be able to scroll to a random cell in the grid', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();

            GridFunctions.focusFirstCell(fix);

            grid.navigateTo(15, 1, (args) => {
                args.target.activate();
            });
            fix.detectChanges();
            await wait(200);
            fix.detectChanges();


            const target = grid.getCellByColumn(15, '1');
            expect(target).toBeDefined();
            expect(target.selected).toBeTruthy();
        });

        it('Custom KB navigation: should be able to scroll horizontally and vertically to a cell in the grid', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(100);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            GridFunctions.focusFirstCell(fix);

            grid.navigateTo(50, 50, (args) => { args.target.activate(); });
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const target = grid.getCellByColumn(50, '50');
            expect(target).toBeDefined();
            expect(target.selected).toBeTruthy();
        });

        it('Custom KB navigation: onGridKeydown should be emitted', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();
            const gridKeydown = spyOn<any>(grid.onGridKeydown, 'emit').and.callThrough();

            const cell = grid.getCellByColumn(1, '2');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(1);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'dataCell', target: cell, cancel: false, event: new KeyboardEvent('keydown')
            });
        });
    });

    describe('Group By navigation ', () => {
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxGridGroupByComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        let fix;
        let grid: IgxGridComponent;
        let gridContent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridGroupByComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
        }));

        it('should toggle expand/collapse state of group row with ArrowRight/ArrowLeft key.', () => {
            const gRow = grid.groupsRowList.toArray()[0];
            const gRowElement = GridFunctions.getGroupedRows(fix)[0];
            gRowElement.triggerEventHandler('click', {});
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent, true);
            fix.detectChanges();

            expect(gRow.expanded).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent, true);
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);
        });

        it('should toggle expand/collapse state of group row with ArrowUp/ArrowDown key.', () => {
            const gRow = grid.groupsRowList.toArray()[0];
            const gRowElement = GridFunctions.getGroupedRows(fix)[0];
            gRowElement.triggerEventHandler('click', {});
            fix.detectChanges();

            expect(gRow.expanded).toBe(true);
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, true);
            fix.detectChanges();

            expect(gRow.expanded).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, true);
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);
        });

        it(`focus should stay over the group row when expanding/collapsing
        with keyboard and the grid is scrolled to the bottom`, (async () => {

            grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let groupedRowsCount = grid.groupsRowList.length;
            let groupRow = grid.groupsRowList.toArray()[groupedRowsCount - 1];
            const groupRowElement = GridFunctions.getGroupedRows(fix)[groupedRowsCount - 1];
            groupRowElement.triggerEventHandler('click', null);
            fix.detectChanges();

            GridFunctions.verifyGroupRowIsFocused(groupRow);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
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
            grid.groupsRowList.last.nativeElement.dispatchEvent(new Event('click'));
            await wait();
            fix.detectChanges();
            UIInteractions.triggerEventHandlerKeyDown('arrowDown', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const cell = grid.getCellByColumn(groupRowIndex + 1, 'Downloads');
            GridSelectionFunctions.verifyCellSelected(cell);
        }));

        it('should allow keyboard navigation through group rows.', (async () => {
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

            let row = grid.getRowByIndex(1);
            row.nativeElement.dispatchEvent(new Event('click'));
            await wait();
            fix.detectChanges();

            for (let index = 1; index < 9; index++) {
                UIInteractions.triggerEventHandlerKeyDown('arrowDown', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            row = grid.getRowByIndex(9);
            expect(row.cells.toArray()[0].selected).toBe(true);

            for (let index = 9; index > 1; index--) {
                UIInteractions.triggerEventHandlerKeyDown('arrowUp', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            row = grid.getRowByIndex(1);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            GridFunctions.verifyGroupRowIsFocused(row);

            row = grid.getRowByIndex(2);
            expect(row.cells.toArray()[0].selected).toBe(true);
        }));

        it('should persist last selected cell column index when navigate through group rows.', async () => {
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
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();
            let row;
            for (let index = 2; index < 9; index++) {
                row = grid.getRowByIndex(index);

                if (!(row instanceof IgxGridGroupByRowComponent)) {
                    const selectedCell = grid.selectedCells[0];
                    expect(selectedCell.rowIndex).toEqual(index);
                    expect(selectedCell.column.field).toEqual('Released');
                }
                UIInteractions.triggerEventHandlerKeyDown('arrowDown', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            cell = grid.getCellByColumn(9, 'Released');
            expect(cell.selected).toBe(true);

            for (let index = 9; index > 1; index--) {
                row = grid.getRowByIndex(index);
                if (!(row instanceof IgxGridGroupByRowComponent)) {
                    const selectedCell = grid.selectedCells[0];
                    expect(selectedCell.rowIndex).toEqual(index);
                    expect(selectedCell.column.field).toEqual('Released');
                }
                UIInteractions.triggerEventHandlerKeyDown('arrowUp', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            row = grid.getRowByIndex(1);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);

            cell = grid.getCellByColumn(2, 'Released');
            expect(cell.selected).toBe(true);
        });

        it('should focus grouped row when press arrow keys up or down', (async () => {
            let cell = grid.getCellByColumn(1, 'ID');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', cell.nativeElement, true);
            await wait();
            fix.detectChanges();

            let groupRow = grid.groupsRowList.toArray()[0];
            cell = grid.getCellByColumn(1, 'ID');
            GridFunctions.verifyGroupRowIsFocused(groupRow);

            cell = grid.getCellByColumn(2, 'ProductName');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            expect(cell.active).toBe(true);
            expect(cell.selected).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', cell.nativeElement, true);
            await wait();
            fix.detectChanges();

            groupRow = grid.groupsRowList.toArray()[1];
            GridFunctions.verifyGroupRowIsFocused(groupRow);
            expect(cell.selected).toBe(true);
        }));

        it('should keep selected cell when expand/collapse grouped row ', (async () => {
            const cell = grid.getCellByColumn(2, 'Released');
            UIInteractions.simulateClickAndSelectCellEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', cell.nativeElement, true);
            await wait();
            fix.detectChanges();

            const groupRow = grid.groupsRowList.toArray()[1];
            GridFunctions.verifyGroupRowIsFocused(groupRow);
            expect(cell.selected).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', groupRow.nativeElement, true, true);
            await wait();
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(groupRow.expanded).toBe(false);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', groupRow.nativeElement, true, true);
            await wait();
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(groupRow.expanded).toBe(true);
        }));

        it('Custom KB navigation:  should be able to scroll to a random row and pass a cb', async () => {
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '500px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.navigateTo(9, -1, (args) => { args.target.nativeElement.click(); });
            await wait(100);
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();

            const target = grid.rowList.find(r => r.index === 9);
            expect(target).toBeDefined();
            GridFunctions.verifyGroupRowIsFocused(target);
        });

        it('Custom KB navigation: onGridKeydown should be emitted for ', async () => {
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '500px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const rowEl = grid.rowList.find(r => r.index === 0);
            UIInteractions.simulateClickAndSelectCellEvent(rowEl);
            fix.detectChanges();

            const gridKeydown = spyOn<any>(grid.onGridKeydown, 'emit').and.callThrough();
            UIInteractions.triggerKeyDownEvtUponElem('Enter', rowEl.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(1);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'groupRow', target: rowEl, cancel: false, event: new KeyboardEvent('keydown')
            });

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', rowEl.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(2);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'groupRow', target: rowEl, cancel: false, event: new KeyboardEvent('keydown')
            });
        });
    });

    describe('Headers Navigation', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridHeader: DebugElement;
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    SelectionWithScrollsComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            gridHeader = GridFunctions.getGridHeader(fix);
        }));

        it('should allow horizontal navigation', async () => {
            // Focus grid header
            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            // Verify first header is focused
            let header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            for (let index = 0; index < 5; index++) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press arrow right again
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();
            GridFunctions.verifyHeaderIsFocused(header.parent);

            for (let index = 5; index > 1; index--) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigation to first last header', async () => {
            // Focus grid header
            let header = GridFunctions.getColumnHeader('ParentID', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press end key
            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press Home ket
            UIInteractions.triggerEventHandlerKeyDown('home', gridHeader);
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press Ctrl+ Arrow right
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, false, false, true);
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press Ctrl+ Arrow left
            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should not change active header on arrow up or down pressed', () => {
            // Focus grid header
            const header = GridFunctions.getColumnHeader('Name', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press arrow down key
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press arrow up key
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press pageUp key
            UIInteractions.triggerEventHandlerKeyDown('PageUp', gridHeader);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Press pageDown key
            UIInteractions.triggerEventHandlerKeyDown('PageUp', gridHeader);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('Verify navigation when there are pinned columns', async () => {
            grid.getColumnByName('ParentID').pinned = true;
            fix.detectChanges();

            // Focus grid header
            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            // Verify first header is focused
            let header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Navigate to last cell
            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Click on the pinned column
            header = GridFunctions.getColumnHeader('ParentID', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Start navigating right

            for (let index = 0; index < 5; index++) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            header = GridFunctions.getColumnHeader('OnPTO', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
            const hScroll = grid.headerContainer.getScroll().scrollLeft;

            // Navigate with home key
            UIInteractions.triggerEventHandlerKeyDown('Home', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
            expect(grid.headerContainer.getScroll().scrollLeft).toEqual(hScroll);
        });

        it('Sorting: Should be able to sort a column with the keyboard', () => {
            grid.getColumnByName('ID').sortable = true;
            fix.detectChanges();

            // Focus grid header
            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, true);
            expect(grid.sortingExpressions.length).toEqual(1);
            expect(grid.sortingExpressions[0].fieldName).toEqual('ID');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);

            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, false);
            expect(grid.sortingExpressions.length).toEqual(0);

            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, true);
            expect(grid.sortingExpressions.length).toEqual(1);
            expect(grid.sortingExpressions[0].fieldName).toEqual('ID');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, true);
            expect(grid.sortingExpressions.length).toEqual(1);
            expect(grid.sortingExpressions[0].fieldName).toEqual('ID');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Desc);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, false);
            expect(grid.sortingExpressions.length).toEqual(0);

            // select not sortable column
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, false, false);
            expect(grid.sortingExpressions.length).toEqual(0);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, false, false, true);
            fix.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, false, false);
            expect(grid.sortingExpressions.length).toEqual(0);
        });

        fit('Filtering: Should be able to open filter row with the keyboard', () => {
            // Focus grid header
            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Test when grid does not have filtering
            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
            fix.detectChanges();

            let filterRow = GridFunctions.getFilterRow(fix);
            expect(filterRow).toBeNull();

            // Allow filtering
            grid.allowFiltering = true;
            grid.getColumnByName('ID').filterable = false;
            fix.detectChanges();

            // Try to open filter row for not filterable column
            UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
            fix.detectChanges();

            filterRow = GridFunctions.getFilterRow(fix);
            expect(filterRow).toBeNull();

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();
            header = GridFunctions.getColumnHeader('ParentID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

             // Try to open filter row for not filterable column
             UIInteractions.triggerEventHandlerKeyDown('L', gridHeader, false, true, true);
             fix.detectChanges();

             filterRow = GridFunctions.getFilterRow(fix);
             expect(filterRow).not.toBeNull();
             expect(grid.filteringRow.column.field).toEqual('ParentID');
        });
    });

    describe('MRL Headers Navigation', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridHeader: DebugElement;
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    MRLTestComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(MRLTestComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            gridHeader = GridFunctions.getGridHeader(fix);
        }));

        it('should navigate through a layout with right and left arrow keys in first level', async () => {
            let header = GridFunctions.getColumnHeader('CompanyName', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Country', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Phone', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Country', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through a layout with right and left arrow keys in second level', async () => {
            let header = GridFunctions.getColumnHeader('ContactTitle', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Fax', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactTitle', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through a layout with home and end keys', async () => {
            let header = GridFunctions.getColumnHeader('ContactTitle', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Fax', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            header = GridFunctions.getColumnHeader('Address', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Fax', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('home', gridHeader);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Address', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through a layout with up and down arrow keys', () => {
            let header = GridFunctions.getColumnHeader('ContactTitle', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactTitle', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Address', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactTitle', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should focus the first element when focus the header', () => {
            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            const header =  GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });
    });

    describe('MCH Headers Navigation', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridHeader: DebugElement;
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    ColumnGroupsNavigationTestComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            }).compileComponents();
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnGroupsNavigationTestComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            gridHeader = GridFunctions.getGridHeader(fix);
              }));

        it('should navigate through groups with right and left arrow keys in first level', () => {
             let header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell( 'Address Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through groups with right and left arrow keys in child level', () => {
             let header = GridFunctions.getColumnHeader('ContactTitle', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Region', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Country', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('City Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Country', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Region', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ID', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('ContactTitle', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through groups with Home and End keys', () => {
            let header = GridFunctions.getColumnHeader('ID', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, false, false, true);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Address Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, false, false, true);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            header = GridFunctions.getColumnHeader('City', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('Home', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('End', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Address', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should navigate through groups with arrowUp and down keys', () => {
            let header = GridFunctions.getColumnHeader('City', fix);
            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            // Verify first header is focused
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('City Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Country Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Address Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('Country Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnGroupHeaderCell('City Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('City', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);

            // click on parent
            header = GridFunctions.getColumnGroupHeaderCell('Address Information', fix);

            UIInteractions.simulateClickAndSelectCellEvent(header);
            fix.detectChanges();

            GridFunctions.verifyHeaderIsFocused(header.parent);
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader);
            fix.detectChanges();

            header = GridFunctions.getColumnHeader('Region', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);
        });

        it('should focus the first element when focus the header', () => {
            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            let header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            // Verify children are not focused
            header = GridFunctions.getColumnGroupHeaderCell('Person Details', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent, false);

            header = GridFunctions.getColumnGroupHeaderCell('Person Details', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent, false);

            header = GridFunctions.getColumnHeader('CompanyName', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent, false);
        });

        it('should be able to expand collapse column group with the keyboard', () => {
            const getInfGroup = GridFunctions.getColGroup(grid, 'General Information');
            const personDetailsGroup = GridFunctions.getColGroup(grid, 'Person Details');
            const companyName = grid.getColumnByName('CompanyName');
            getInfGroup.collapsible = true;
            personDetailsGroup.visibleWhenCollapsed = true;
            companyName.visibleWhenCollapsed = false;
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 10);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup);

            gridHeader.triggerEventHandler('focus', null);
            fix.detectChanges();

            const header = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            GridFunctions.verifyHeaderIsFocused(header.parent);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridHeader, true);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, true, 11);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup, true, false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridHeader, true);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 10);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup);

            // set group not to be collapsible
            getInfGroup.collapsible = false;
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 13);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup, false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridHeader, true);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 13);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup, false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridHeader, true);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(companyName, false, 13);
            GridFunctions.verifyGroupIsExpanded(fix, getInfGroup, false);
        });
    });
});
