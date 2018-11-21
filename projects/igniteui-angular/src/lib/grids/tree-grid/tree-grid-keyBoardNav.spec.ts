import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule, IgxTreeGridComponent } from './index';
import { IgxTreeGridWithNoScrollsComponent, IgxTreeGridWithScrollsComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';

const DEBOUNCETIME = 30;
const treeColumns = ['ID', 'Name', 'HireDate', 'Age', 'OnPTO'];

describe('IgxTreeGrid - Key Board Navigation', () => {
    let fix;
    let treeGrid: IgxTreeGridComponent;

    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridWithNoScrollsComponent,
                IgxTreeGridWithScrollsComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    describe('Navigation with no scroll', () => {
        configureTestSuite();

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridWithNoScrollsComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should navigate with arrow Up and Down keys on gridCells', async () => {
            await testNavigationUpDown(fix, treeGrid, 'Name');
        });

        it('should navigate with arrow Up and Down keys on treeCells', async () => {
            await testNavigationUpDown(fix, treeGrid, 'ID');
        });

        it('should navigate with arrow Left and Right keys on parent row', async () => {
            await testNavigationLeftRight(fix, treeGrid, 0, treeColumns);
        });

        it('should navigate with arrow Left and Right keys on child row', async () => {
            await testNavigationLeftRight(fix, treeGrid, 1, treeColumns);
        });

        it('should move to the top/bottom cell when navigate with Ctrl + arrow Up/Down keys on gridCells', async () => {
            await testNavigationTopBottom(fix, treeGrid, 'Name');
        });

        it('should move to the top/bottom cell when navigate with Ctrl + arrow Up/Down keys on treeCells', async () => {
            await testNavigationTopBottom(fix, treeGrid, 'ID');
        });

        it('should move to the leftmost/rightmost cell when navigate with Ctrl + arrow Left/Right keys on parent row', async () => {
            await testNavigationLeftmostRightmostCell(fix, treeGrid, 0, treeColumns);
        });

        it('should move to the leftmost/rightmost cell when navigate with Ctrl + arrow Left/Right keys on child row', async () => {
            await testNavigationLeftmostRightmostCell(fix, treeGrid, 2, treeColumns);
        });

        it('should move to the top left/bottom right cell when navigate with Ctrl + Home/End keys', async () => {
            await testNavigationHomeEnd(fix, treeGrid, treeColumns);
        });

        it('should move selection when Tab key is pressed ', async () => {
            await testNavigationTab(fix, treeGrid, treeColumns);
        });

        it('should move selection when Shift + Tab keys are pressed ', async () => {
            await testNavigationShiftTab(fix, treeGrid, treeColumns);
        });

        it('should expand/collapse row when Alt + arrow Left/Right keys are pressed on a treeCell', async () => {
            await testExpandCollapse(fix, treeGrid, 0, 'ID', 10, 4);
        });

        it('should expand/collapse row when Alt + arrow Left/Right keys are pressed on a gridCell', async () => {
            await testExpandCollapse(fix, treeGrid, 3, 'HireDate', 10, 7);
        });

        it('should not change selection when press Alt + arrow Left/Right keys on a cell in a row without children', async () => {
            spyOn(treeGrid.onRowToggle, 'emit').and.callThrough();
            const cell = treeGrid.getCellByColumn(1, 'Name');
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(0);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(0);
        });

        it('should change editable cell when Tab key is pressed', async () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            await testEditingNavigationTab(fix, treeGrid, treeColumns);
        });

        it('should change editable cell when Shift + Tab keys are pressed', async () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            await testEditingNavigationShiftTab(fix, treeGrid, treeColumns);
        });
    });

    describe('Navigation with scrolls', () => {
        configureTestSuite();

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridWithScrollsComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should navigate with arrow Up and Down keys on gridCells', async () => {
            await testNavigationUpDown(fix, treeGrid, 'Name');
        });

        it('should navigate with arrow Up and Down keys on treeCells', async () => {
            await testNavigationUpDown(fix, treeGrid, 'ID');
        });

        it('should navigate with arrow Left and Right keys on parent row', async () => {
            await testNavigationLeftRight(fix, treeGrid, 0, treeColumns);
        });

        it('should navigate with arrow Left and Right keys on child row', async () => {
            await testNavigationLeftRight(fix, treeGrid, 1, treeColumns);
        });

        it('should move to the top/bottom cell when navigate with Ctrl + arrow Up/Down keys on gridCells', async () => {
            await testNavigationTopBottom(fix, treeGrid, 'Name');
        });

        it('should move to the top/bottom cell when navigate with Ctrl + arrow Up/Down keys on treeCells', async () => {
            await testNavigationTopBottom(fix, treeGrid, 'ID');
        });

        it('should move to the leftmost/rightmost cell when navigate with Ctrl + arrow Left/Right keys on parent row', async () => {
            await testNavigationLeftmostRightmostCell(fix, treeGrid, 0, treeColumns);
        });

        it('should move to the leftmost/rightmost cell when navigate with Ctrl + arrow Left/Right keys on child row', async () => {
            await testNavigationLeftmostRightmostCell(fix, treeGrid, 2, treeColumns);
        });

        it('should move to the top left/bottom right cell when navigate with Ctrl + Home/End keys', async () => {
            await testNavigationHomeEnd(fix, treeGrid, treeColumns);
        });

        it('should move selection when Tab key is pressed ', async () => {
            await testNavigationTab(fix, treeGrid, treeColumns);
        });

        it('should move selection when Shift + Tab keys are pressed ', async () => {
            await testNavigationShiftTab(fix, treeGrid, treeColumns);
        });

        it('should expand/collapse row when Alt + arrow Left/Right keys are pressed on a treeCell', async () => {
            await testExpandCollapse(fix, treeGrid, 0, 'ID', 8, 4);
        });

        it('should expand/collapse row when Alt + arrow Left/Right keys are pressed on a gridCell', async () => {
            let cell = treeGrid.getCellByColumn(3, 'Name');

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(3, 'OnPTO');

            await testExpandCollapse(fix, treeGrid, 3, 'OnPTO', 8, 7);
        });

        it('should allow pageup/pagedown navigation when the treeGrid is focused', async () => {
            let currScrollTop;
            const virtualizationSpy = spyOn<any>(treeGrid.verticalScrollContainer.onChunkLoad, 'emit').and.callThrough();
            const cell = treeGrid.getCellByColumn(1, 'Name');

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // testing the pagedown key
            UIInteractions.triggerKeyDownEvtUponElem('PageDown', cell.nativeElement, true);
            treeGrid.cdr.detectChanges();

            await wait();
            currScrollTop = treeGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
            expect(currScrollTop).toBeGreaterThan(100);
            expect(virtualizationSpy).toHaveBeenCalledTimes(1);

            // testing the pageup key
            UIInteractions.triggerKeyDownEvtUponElem('PageUp', treeGrid.nativeElement, true);
            treeGrid.cdr.detectChanges();
            await wait();
            currScrollTop = treeGrid.parentVirtDir.getHorizontalScroll().scrollTop;
            expect(currScrollTop).toEqual(0);
            expect(virtualizationSpy).toHaveBeenCalledTimes(2);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
        });

        it('should change editable cell when Tab key is pressed', async () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await testEditingNavigationTab(fix, treeGrid, treeColumns);
        });

        it('should change editable cell and scroll down when Tab key is pressed', async () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();
            let cell = treeGrid.getCellByColumn(5, 'HireDate');

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.inEditMode).toBe(false);

            // Got ot the last row cell
            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(5, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Enter', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(5, 'OnPTO');
            expect(cell.inEditMode).toBe(true);
            // Press tab key and verify the correct cell is opened
            await TreeGridFunctions.moveEditableCellWithTab(fix, treeGrid, 5, 4, treeColumns);
        });

        it('should change editable cell when Shift + Tab keys are pressed', async () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            await testEditingNavigationShiftTab(fix, treeGrid, treeColumns);
        });

        it('should change correct selected cell when there are pinned columns and press tab', async () => {
            treeGrid.getColumnByName('HireDate').pinned = true;
            fix.detectChanges();

            await testNavigationTab(fix, treeGrid, ['HireDate', 'ID', 'Name', 'Age', 'OnPTO']);
        });

        it('should change correct selected cell when there are pinned columns and press shift + tab', async () => {
            treeGrid.getColumnByName('HireDate').pinned = true;
            fix.detectChanges();

            await testNavigationShiftTab(fix, treeGrid, ['HireDate', 'ID', 'Name', 'Age', 'OnPTO']);
        });

        it('should navigate with arrow Left and Right keys on parent row', async () => {
            treeGrid.getColumnByName('HireDate').pinned = true;
            const rowIndex = 0;
            fix.detectChanges();

            await testNavigationLeftRight(fix, treeGrid, rowIndex, ['HireDate', 'ID', 'Name', 'Age', 'OnPTO']);
        });

        it('should select row when press Space key on a cell', async () => {
            treeGrid.rowSelectable = true;
            fix.detectChanges();

            // Click Space on a treeGrid cell
            let cell = treeGrid.getCellByColumn(0, 'ID');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Space', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Space', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0], false);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // Go to the gridCell and verify selection
            cell = treeGrid.getCellByColumn(1, 'Name');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Space', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [1], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Space', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [1], false);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
        });

        it('should select correct cells after expand/collapse row', async () => {
            // Select first cell and expand collapse
            let rows;
            let cell = treeGrid.getCellByColumn(0, 'ID');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);

            await TreeGridFunctions.moveCellUpDown(fix, treeGrid, 0, 'ID', true);

            await TreeGridFunctions.moveCellUpDown(fix, treeGrid, 1, 'ID', false);

            await TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'ID', 'Name', true);

            await TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'Name', 'ID', false);

            cell = treeGrid.getCellByColumn(0, 'ID');
            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            cell = treeGrid.getCellByColumn(0, 'ID');
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);

            await TreeGridFunctions.moveCellUpDown(fix, treeGrid, 0, 'ID', true);

            await TreeGridFunctions.moveCellUpDown(fix, treeGrid, 1, 'ID', false);

            await TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'ID', 'Name', true);

            await TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'Name', 'ID', false);

            // Go to the last parent row and expand collapse
            cell = treeGrid.getCellByColumn(0, 'ID');
            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(9, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            await TreeGridFunctions.moveCellUpDown(fix, treeGrid, 9, 'ID', false);
            cell = treeGrid.getCellByColumn(8, 'ID');

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(8, 'ID');
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[7]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);

            await TreeGridFunctions.moveCellWithTab(fix, treeGrid, 8, 0, treeColumns);

            await TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 8, 'Name', 'ID', false);

            cell = treeGrid.getCellByColumn(8, 'ID');

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(8, 'ID');
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[6]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);
        });
    });

    const testNavigationUpDown =
        (fixture, treegrid: IgxTreeGridComponent, columnName: string) => new Promise(async (resolve, reject) => {
            spyOn(treegrid.onSelection, 'emit').and.callThrough();
            const firstCell = treegrid.getCellByColumn(0, columnName);

            firstCell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, firstCell);

            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(1);

            for (let i = 0; i < 9; i++) {
                await TreeGridFunctions.moveCellUpDown(fixture, treegrid, i, columnName);
                expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(i + 2);
            }

            for (let i = 9; i > 0; i--) {
                await TreeGridFunctions.moveCellUpDown(fixture, treegrid, i, columnName, false);
                expect(treegrid.onSelection.emit).toHaveBeenCalledTimes((10 - i) + 10);
            }
            resolve();
        });

    const testNavigationLeftRight =
        (fixture, treegrid: IgxTreeGridComponent, rowIndex, columns) => new Promise(async (resolve, reject) => {
            const firstCell = treegrid.getCellByColumn(0, columns[0]);
            spyOn(treegrid.onSelection, 'emit').and.callThrough();

            firstCell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, firstCell);

            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(1);

            for (let i = 0; i < columns.length - 1; i++) {
                await TreeGridFunctions.moveCellLeftRight(fixture, treegrid, rowIndex, columns[i], columns[i + 1]);
                expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(i + 2);
            }

            let cell = treegrid.getCellByColumn(rowIndex, columns[columns.length - 1]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(cell.focused).toEqual(true);

            for (let i = columns.length - 1; i > 0; i--) {
                await TreeGridFunctions.moveCellLeftRight(fixture, treegrid, rowIndex, columns[i], columns[i - 1], false);
                expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(2 * columns.length - i);
            }

            cell = treegrid.getCellByColumn(rowIndex, columns[0]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(2 * columns.length - 1);
            resolve();
        });

    const testNavigationTopBottom =
        (fixture, treegrid: IgxTreeGridComponent, columnName: string) => new Promise(async (resolve, reject) => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            const cell = treegrid.getCellByColumn(1, columnName);

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);

            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(1);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true }));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            let newCell = treegrid.getCellByColumn(9, columnName);
            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, newCell);
            expect(newCell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(2);

            newCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true }));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            newCell = treegrid.getCellByColumn(0, columnName);
            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, newCell);
            expect(newCell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(3);
            resolve();
        });

    const testNavigationLeftmostRightmostCell =
        (fixture, treegrid: IgxTreeGridComponent, rowIndex, columns) => new Promise(async (resolve, reject) => {
            spyOn(treegrid.onSelection, 'emit').and.callThrough();
            let cell = treegrid.getCellByColumn(rowIndex, columns[1]);

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(1);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            cell = treegrid.getCellByColumn(rowIndex, columns[columns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(2);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true }));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            cell = treegrid.getCellByColumn(rowIndex, columns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(3);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            cell = treegrid.getCellByColumn(rowIndex, columns[columns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(4);
            resolve();
        });

    const testNavigationHomeEnd =
        (fixture, treegrid: IgxTreeGridComponent, columns) => new Promise(async (resolve, reject) => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            let cell = treegrid.getCellByColumn(2, columns[2]);

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(1);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }));
            await wait(100);
            fixture.detectChanges();

            cell = treegrid.getCellByColumn(9, columns[columns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(2);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true }));
            await wait(100);
            fixture.detectChanges();

            cell = treegrid.getCellByColumn(0, columns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(3);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }));
            await wait(100);
            fixture.detectChanges();

            cell = treegrid.getCellByColumn(9, columns[columns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(4);

            resolve();
        });

    const testNavigationTab =
        (fixture, treegrid: IgxTreeGridComponent, columns) => new Promise(async (resolve, reject) => {
            spyOn(treegrid.onSelection, 'emit').and.callThrough();
            const cell = treegrid.getCellByColumn(2, columns[2]);

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(1);

            // Test tab on child row
            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 2, 2, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(2);

            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 2, 3, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(3);

            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 2, 4, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(4);

            // Test tab on parent row
            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 3, 0, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(5);

            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 3, 1, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(6);

            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 3, 2, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(7);

            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 3, 3, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(8);

            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 3, 4, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(9);

            await TreeGridFunctions.moveCellWithTab(fixture, treegrid, 4, 0, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(10);

            resolve();
        });

    const testNavigationShiftTab =
        (fixture, treegrid: IgxTreeGridComponent, columns) => new Promise(async (resolve, reject) => {
            spyOn(treegrid.onSelection, 'emit').and.callThrough();
            const cell = treegrid.getCellByColumn(3, columns[1]);

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);

            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(1);

            // Test tab on child row
            await TreeGridFunctions.moveCellWithShiftTab(fixture, treegrid, 3, 1, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(2);

            await TreeGridFunctions.moveCellWithShiftTab(fixture, treegrid, 3, 0, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(3);

            await TreeGridFunctions.moveCellWithShiftTab(fixture, treegrid, 2, 4, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(4);

            await TreeGridFunctions.moveCellWithShiftTab(fixture, treegrid, 2, 3, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(5);

            await TreeGridFunctions.moveCellWithShiftTab(fixture, treegrid, 2, 2, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(6);

            await TreeGridFunctions.moveCellWithShiftTab(fixture, treegrid, 2, 1, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(7);

            await TreeGridFunctions.moveCellWithShiftTab(fixture, treegrid, 2, 0, columns);
            expect(treegrid.onSelection.emit).toHaveBeenCalledTimes(8);

            resolve();
        });

    const testExpandCollapse =
        (fixture, treegrid: IgxTreeGridComponent, cellRowIndex, cellColumn, rowsCount, rowsCountAfterCollapse) =>
            new Promise(async (resolve, reject) => {
                spyOn(treegrid.onRowToggle, 'emit').and.callThrough();
                let cell = treegrid.getCellByColumn(cellRowIndex, cellColumn);
                let rows = TreeGridFunctions.getAllRows(fixture);
                expect(rows.length).toBe(rowsCount);

                cell.nativeElement.dispatchEvent(new Event('focus'));
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

                TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
                expect(cell.focused).toEqual(true);

                cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

                cell = treegrid.getCellByColumn(cellRowIndex, cellColumn);
                rows = TreeGridFunctions.getAllRows(fixture);
                expect(rows.length).toBe(rowsCountAfterCollapse);
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[cellRowIndex]);
                TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
                expect(cell.focused).toEqual(true);
                expect(treegrid.onRowToggle.emit).toHaveBeenCalledTimes(1);

                cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

                cell = treegrid.getCellByColumn(cellRowIndex, cellColumn);
                rows = TreeGridFunctions.getAllRows(fixture);
                expect(rows.length).toBe(rowsCountAfterCollapse);
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[cellRowIndex]);
                TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
                expect(cell.focused).toEqual(true);
                expect(treegrid.onRowToggle.emit).toHaveBeenCalledTimes(1);

                cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

                cell = treegrid.getCellByColumn(cellRowIndex, cellColumn);
                rows = TreeGridFunctions.getAllRows(fixture);
                expect(rows.length).toBe(rowsCount);
                TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[cellRowIndex]);
                TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
                expect(cell.focused).toEqual(true);
                expect(treegrid.onRowToggle.emit).toHaveBeenCalledTimes(2);

                cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

                cell = treegrid.getCellByColumn(cellRowIndex, cellColumn);
                rows = TreeGridFunctions.getAllRows(fixture);
                expect(rows.length).toBe(rowsCount);
                TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[cellRowIndex]);
                TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);
                expect(cell.focused).toEqual(true);
                expect(treegrid.onRowToggle.emit).toHaveBeenCalledTimes(2);
                resolve();
            });

    const testEditingNavigationTab =
        (fixture, treegrid: IgxTreeGridComponent, columns) => new Promise(async (resolve, reject) => {
            let cell = treegrid.getCellByColumn(2, columns[1]);

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Enter', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            cell = treeGrid.getCellByColumn(2, columns[1]);
            expect(cell.inEditMode).toBe(true);

            // Test tab on child row
            await TreeGridFunctions.moveEditableCellWithTab(fixture, treegrid, 2, 1, columns);

            await TreeGridFunctions.moveEditableCellWithTab(fixture, treegrid, 2, 2, columns);

            await TreeGridFunctions.moveEditableCellWithTab(fixture, treegrid, 2, 3, columns);

            await TreeGridFunctions.moveEditableCellWithTab(fixture, treegrid, 2, 4, columns);

            // Test tab on parent row
            await TreeGridFunctions.moveEditableCellWithTab(fixture, treegrid, 3, 0, columns);

            resolve();
        });

    const testEditingNavigationShiftTab =
        (fixture, treegrid: IgxTreeGridComponent, columns) => new Promise(async (resolve, reject) => {
            let cell = treeGrid.getCellByColumn(2, columns[2]);

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treegrid, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Enter', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            cell = treeGrid.getCellByColumn(2, columns[2]);
            expect(cell.inEditMode).toBe(true);

            // Test on parent row
            await TreeGridFunctions.moveEditableCellWithShiftTab(fixture, treegrid, 3, 1, columns);

            await TreeGridFunctions.moveEditableCellWithShiftTab(fixture, treegrid, 3, 0, columns);

            // Test on child row
            await TreeGridFunctions.moveEditableCellWithShiftTab(fixture, treegrid, 2, 4, columns);

            await TreeGridFunctions.moveEditableCellWithShiftTab(fixture, treegrid, 2, 3, columns);

            await TreeGridFunctions.moveEditableCellWithShiftTab(fixture, treegrid, 2, 2, columns);

            await TreeGridFunctions.moveEditableCellWithShiftTab(fixture, treegrid, 2, 1, columns);

            await TreeGridFunctions.moveEditableCellWithShiftTab(fixture, treegrid, 2, 0, columns);

            resolve();
        });
});
