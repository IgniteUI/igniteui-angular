import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule, IgxTreeGridComponent } from './index';
import { IgxTreeGridWithNoScrollsComponent, IgxTreeGridWithScrollsComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { setupGridScrollDetection, TestNgZone } from '../../test-utils/helper-utils.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { NgZone } from '@angular/core';
import { IgxGridCellComponent } from '../grid';

const DEBOUNCETIME = 30;


describe('IgxTreeGrid - Key Board Navigation #tGrid', () => {
    let zone;

    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridWithNoScrollsComponent,
                IgxTreeGridWithScrollsComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule],
            providers: [{ provide: NgZone, useFactory: () => zone = new TestNgZone() }]
        }).compileComponents();
    }));

    describe('Navigation with no scroll', () => {
        let fix;
        let treeGrid: IgxTreeGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridWithNoScrollsComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('should navigate with arrow keys', () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            const firstCell = GridFunctions.getRowCells(fix, 0)[0];
            const secondCell = GridFunctions.getRowCells(fix, 1)[0];
            const thirdCell = GridFunctions.getRowCells(fix, 1)[1];
            const fourthCell = GridFunctions.getRowCells(fix, 0)[1];

            firstCell.triggerEventHandler('focus', null);
            fix.detectChanges();

            let cell = treeGrid.getCellByColumn(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowdown', firstCell);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(1, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowright', secondCell);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(1, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowup', thirdCell);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowleft', fourthCell);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(5);
        });

        it('should move to the top/bottom cell when navigate with Ctrl + arrow Up/Down keys', () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            const firstCell = GridFunctions.getRowCells(fix, 0)[0];
            const middleCell = GridFunctions.getRowCells(fix, 5)[0];
            const lastCell = GridFunctions.getRowCells(fix, 9)[0];

            middleCell.triggerEventHandler('focus', null);
            fix.detectChanges();

            let cell = treeGrid.getCellByColumn(5, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowdown', middleCell, false, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(9, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+Arrow down on the last cell
            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowdown', lastCell, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowup', lastCell, false, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+Arrow up on the first cell
            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowup', firstCell, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(3);
        });

        it('should move to the leftmost/rightmost cell when navigate with Ctrl + arrow Left/Right keys', () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            const firstCell = GridFunctions.getRowCells(fix, 0)[0];
            const middleCell = GridFunctions.getRowCells(fix, 0)[2];
            const lastCell = GridFunctions.getRowCells(fix, 0)[4];

            middleCell.triggerEventHandler('focus', null);
            fix.detectChanges();

            let cell = treeGrid.getCellByColumn(0, 'HireDate');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowright', middleCell, false, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+Arrow right on the last cell
            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowright', lastCell, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowleft', lastCell, false, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+Arrow left on the first cell
            UIInteractions.triggerEventHandlerKeyDownWithBlur('arrowleft', firstCell, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(3);
        });

        it('should move to the top left/bottom right cell when navigate with Ctrl + Home/End keys', () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            const firstCell = GridFunctions.getRowCells(fix, 0)[0];
            const middleCell = GridFunctions.getRowCells(fix, 4)[1];
            const lastCell = GridFunctions.getRowCells(fix, 9)[4];

            middleCell.triggerEventHandler('focus', null);
            fix.detectChanges();

            let cell = treeGrid.getCellByColumn(4, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('end', middleCell, false, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(9, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+end on the last cell
            UIInteractions.triggerEventHandlerKeyDownWithBlur('end', lastCell, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('home', lastCell, false, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+home on the first cell
            UIInteractions.triggerEventHandlerKeyDownWithBlur('home', firstCell, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(3);
        });

        it('should move selection when Tab/Shift + Tab keys  key is pressed ', () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            let cellElement = GridFunctions.getRowCells(fix, 3)[3];
            let cell = treeGrid.getCellByColumn(3, 'Age');

            cellElement.triggerEventHandler('focus', null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', cellElement);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(3, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            cellElement = GridFunctions.getRowCells(fix, 3)[4];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('tab', cellElement);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(4, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            cellElement = GridFunctions.getRowCells(fix, 4)[0];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('tab', cellElement);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(4, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            cellElement = GridFunctions.getRowCells(fix, 4)[1];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('tab', cellElement, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(4, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            cellElement = GridFunctions.getRowCells(fix, 4)[0];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('tab', cellElement, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(3, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            cellElement = GridFunctions.getRowCells(fix, 3)[4];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('tab', cellElement, false, true);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(3, 'Age');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(7);
        });

        it('should expand/collapse row when Alt + arrow Left/Right keys are pressed', () => {
            spyOn(treeGrid.onRowToggle, 'emit').and.callThrough();
            const cell = treeGrid.getCellByColumn(0, 'ID');
            const cellElement = GridFunctions.getRowCells(fix, 0)[0];
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            cellElement.triggerEventHandler('focus', null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowLeft', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowLeft', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowRight', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(2);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowRight', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(2);
        });

        it('should expand/collapse row when Alt + arrow Up/Down keys are pressed', () => {
            spyOn(treeGrid.onRowToggle, 'emit').and.callThrough();
            const cell = treeGrid.getCellByColumn(3, 'HireDate');
            const cellElement = GridFunctions.getRowCells(fix, 3)[2];
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            cellElement.triggerEventHandler('focus', null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowUp', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[3]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowUp', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[3]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowDown', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[3]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(2);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowDown', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[3]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(2);
        });

        it('should not change selection when press Alt + arrow Left/Right keys on a cell in a row without children', () => {
            spyOn(treeGrid.onRowToggle, 'emit').and.callThrough();
            const cell = treeGrid.getCellByColumn(1, 'Name');
            const cellElement = GridFunctions.getRowCells(fix, 1)[1];
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            cellElement.triggerEventHandler('focus', null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowLeft', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(0);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('ArrowRight', cellElement, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onRowToggle.emit).toHaveBeenCalledTimes(0);
        });

        it('should change editable cell when Tab key is pressed', () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            let cellElement = GridFunctions.getRowCells(fix, 3)[3];
            let cell = treeGrid.getCellByColumn(3, 'Age');

            cellElement.triggerEventHandler('focus', null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('Enter', cellElement);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', cellElement);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.getCellByColumn(3, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            cellElement = GridFunctions.getRowCells(fix, 3)[4];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', cellElement);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.getCellByColumn(4, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            // Press tab when next cell is not editable
            cellElement = GridFunctions.getRowCells(fix, 4)[0];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', cellElement);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.getCellByColumn(4, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(false);
        });

        it('should change editable cell when Shift + Tab keys are pressed', () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            let cellElement = GridFunctions.getRowCells(fix, 3)[1];
            let cell = treeGrid.getCellByColumn(3, 'Name');

            cellElement.triggerEventHandler('focus', null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('Enter', cellElement);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', cellElement, false, true);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.getCellByColumn(3, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            cellElement = GridFunctions.getRowCells(fix, 3)[0];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', cellElement, false, true);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.getCellByColumn(2, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            // Press Shift+Tab when next cell is not editable
            cellElement = GridFunctions.getRowCells(fix, 2)[4];
            UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', cellElement, false, true);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.getCellByColumn(2, 'Age');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(false);
        });
    });

    describe('Navigation with scrolls', () => {
        let fix;
        let treeGrid: IgxTreeGridComponent;
        const treeColumns = ['ID', 'Name', 'HireDate', 'Age', 'OnPTO'];

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridWithScrollsComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
            setupGridScrollDetection(fix, treeGrid);
            tick(16);
        }));

        it('should navigate with arrow Up and Down keys', async () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            const firstCell: IgxGridCellComponent = treeGrid.getCellByColumn(5, 'ID');
            firstCell.onFocus(null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, firstCell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(1);

            for (let i = 5; i < 9; i++) {
                let cell = treeGrid.getCellByColumn(i, 'ID');
                GridFunctions.simulateCellKeydown(cell, 'ArrowDown');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(i + 1, 'ID');
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            for (let i = 9; i > 0; i--) {
                let cell = treeGrid.getCellByColumn(i, 'ID');
                GridFunctions.simulateCellKeydown(cell, 'ArrowUp');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(i - 1, 'ID');
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            }
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(14);
        });

        it('should navigate with arrow Left and Right', async () => {
            const firstCell = treeGrid.getCellByColumn(3, treeColumns[0]);
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();

            firstCell.onFocus(null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, firstCell);

            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(1);

            for (let i = 0; i < treeColumns.length - 1; i++) {
                let cell = treeGrid.getCellByColumn(3, treeColumns[i]);
                GridFunctions.simulateCellKeydown(cell, 'ArrowRight');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(3, treeColumns[i + 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
                expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(i + 2);
            }

            let lastCell = treeGrid.getCellByColumn(3, treeColumns[treeColumns.length - 1]);
            GridFunctions.simulateCellKeydown(lastCell, 'ArrowRight');
            await wait();
            zone.simulateOnStable();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, lastCell);

            for (let i = treeColumns.length - 1; i > 0; i--) {
                let cell = treeGrid.getCellByColumn(3, treeColumns[i]);
                GridFunctions.simulateCellKeydown(cell, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(3, treeColumns[i - 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
                expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(2 * treeColumns.length - i);
            }

            lastCell = treeGrid.getCellByColumn(3, treeColumns[0]);
            GridFunctions.simulateCellKeydown(lastCell, 'ArrowLeft');
            await wait();
            zone.simulateOnStable();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, lastCell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(2 * treeColumns.length - 1);
        });

        it('should move to the top/bottom cell when navigate with Ctrl + arrow Up/Down', async () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            let cell = treeGrid.getCellByColumn(1, 'Name');

            cell.onFocus(null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(1);

            GridFunctions.simulateCellKeydown(cell, 'ArrowDown', false, false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(9, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(2);

            GridFunctions.simulateCellKeydown(cell, 'ArrowUp', false, false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(3);
        });

        it('should move to the leftmost/rightmost cell when navigate with Ctrl + arrow Left/Right keys', async () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            let cell = treeGrid.getCellByColumn(4, treeColumns[1]);

            cell.onFocus(null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(1);

            GridFunctions.simulateCellKeydown(cell, 'ArrowRight', false, false, true);
            await wait();
            zone.simulateOnStable();
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(4, treeColumns[treeColumns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(2);

            GridFunctions.simulateCellKeydown(cell, 'ArrowLeft', false, false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(4, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(3);

            GridFunctions.simulateCellKeydown(cell, 'ArrowRight', false, false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(4, treeColumns[treeColumns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(4);
        });

        it('should move to the top left/bottom right cell when navigate with Ctrl + Home/End keys', async () => {
            spyOn(treeGrid.onSelection, 'emit').and.callThrough();
            let cell = treeGrid.getCellByColumn(2, treeColumns[2]);

            cell.onFocus(null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(1);

            GridFunctions.simulateCellKeydown(cell, 'End', false, false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(9, treeColumns[treeColumns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.focused).toEqual(true);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(2);

            GridFunctions.simulateCellKeydown(cell, 'Home', false, false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.onSelection.emit).toHaveBeenCalledTimes(3);
        });

        it('should move selection when Tab key is pressed ', async () => {
            const firstCell = treeGrid.getCellByColumn(5, treeColumns[2]);
            firstCell.onFocus(null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, firstCell);

            for (let i = 2; i < treeColumns.length - 1; i++) {
                let cell = treeGrid.getCellByColumn(5, treeColumns[i]);
                GridFunctions.simulateCellKeydown(cell, 'Tab');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(5, treeColumns[i + 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            let newCell = treeGrid.getCellByColumn(5, treeColumns[treeColumns.length - 1]);
            GridFunctions.simulateCellKeydown(newCell, 'Tab');
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            newCell = treeGrid.getCellByColumn(6, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);

            for (let i = 0; i < treeColumns.length - 1; i++) {
                let cell = treeGrid.getCellByColumn(6, treeColumns[i]);
                GridFunctions.simulateCellKeydown(cell, 'Tab');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(6, treeColumns[i + 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            newCell = treeGrid.getCellByColumn(6, treeColumns[treeColumns.length - 1]);
            GridFunctions.simulateCellKeydown(newCell, 'Tab');
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            newCell = treeGrid.getCellByColumn(7, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
        });

        it('should move selection when Shift + Tab keys are pressed ', async () => {
            // await wait(100);
            zone.simulateOnStable();
            fix.detectChanges();
            treeGrid.verticalScrollContainer.scrollTo(treeGrid.dataView.length - 1);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            let cell = treeGrid.getCellByColumn(4, treeColumns[0]);
            cell.onFocus(null);
            fix.detectChanges();

            GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            cell = treeGrid.getCellByColumn(3, treeColumns[4]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            for (let i = 4; i > 0; i--) {
                cell = treeGrid.getCellByColumn(3, treeColumns[i]);
                GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                cell = treeGrid.getCellByColumn(3, treeColumns[i - 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }
        });

        it('should expand/collapse row when Alt + arrow Left/Right keys are pressed', async () => {
            zone.simulateOnStable();
            fix.detectChanges();

            treeGrid.headerContainer.scrollTo(4);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            const cell = treeGrid.getCellByColumn(3, 'OnPTO');
            cell.onFocus(null);
            fix.detectChanges();

            GridFunctions.simulateCellKeydown(cell, 'ArrowLeft', true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[3]);

            GridFunctions.simulateCellKeydown(cell, 'ArrowRight', true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[3]);
        });

        it('should allow pageup/pagedown navigation when the treeGrid is focused', async () => {
            let currScrollTop;
            const virtualizationSpy = spyOn<any>(treeGrid.verticalScrollContainer.onChunkLoad, 'emit').and.callThrough();
            const cell = treeGrid.getCellByColumn(1, 'Name');
            cell.onFocus(null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // testing the pagedown key
            UIInteractions.triggerKeyDownEvtUponElem('PageDown', treeGrid.nativeElement, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            currScrollTop = treeGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrollTop).toBeGreaterThan(100);
            expect(virtualizationSpy).toHaveBeenCalledTimes(1);

            // testing the pageup key
            UIInteractions.triggerKeyDownEvtUponElem('PageUp', treeGrid.nativeElement, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            currScrollTop = treeGrid.headerContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(0);
            expect(virtualizationSpy).toHaveBeenCalledTimes(2);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
        });

        it('should change editable cell and scroll when Tab and Shift + Tab keys are pressed', async () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            const firstCell = treeGrid.getCellByColumn(5, treeColumns[2]);
            firstCell.onFocus(null);
            fix.detectChanges();

            GridFunctions.simulateCellKeydown(firstCell, 'Enter');
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, firstCell);
            expect(firstCell.editMode).toBe(true);

            for (let i = 2; i < treeColumns.length - 1; i++) {
                let cell = treeGrid.getCellByColumn(5, treeColumns[i]);
                GridFunctions.simulateCellKeydown(cell, 'Tab');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                cell = treeGrid.getCellByColumn(5, treeColumns[i + 1]);
                expect(cell.editMode).toBe(true);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            let newCell = treeGrid.getCellByColumn(5, treeColumns[4]);
            GridFunctions.simulateCellKeydown(newCell, 'Tab');
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            newCell = treeGrid.getCellByColumn(6, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
            expect(newCell.editMode).toBe(true);
            expect( treeGrid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(0);

            GridFunctions.simulateCellKeydown(newCell, 'Tab', false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            newCell = treeGrid.getCellByColumn(5, treeColumns[4]);
            expect(newCell.editMode).toBe(true);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);

            for (let i = 4; i > 0; i--) {
                let cell = treeGrid.getCellByColumn(5, treeColumns[i]);
                GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(5, treeColumns[i - 1]);
                expect(cell.editMode).toBe(true);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }
        });

        it('should change correct selected cell when there are pinned treeColumns and press tab or shift + tab', async () => {
            treeGrid.getColumnByName('HireDate').pinned = true;
            fix.detectChanges();

            const columns = ['HireDate', 'ID', 'Name', 'Age', 'OnPTO'];

            const firstCell = treeGrid.getCellByColumn(5, 'HireDate');
            GridFunctions.simulateCellKeydown(firstCell, 'End');
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            const lastCell = treeGrid.getCellByColumn(5, columns[4]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, lastCell);
            expect(treeGrid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(0);

            for (let i = 0; i < columns.length - 1; i++) {
                let cell = treeGrid.getCellByColumn(5, columns[i]);
                GridFunctions.simulateCellKeydown(cell, 'Tab');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(5, columns[i + 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            let newCell = treeGrid.getCellByColumn(5, columns[4]);
            GridFunctions.simulateCellKeydown(newCell, 'Tab');
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            newCell = treeGrid.getCellByColumn(6, columns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
            const scrollLeft = treeGrid.headerContainer.getScroll().scrollLeft;
            expect(scrollLeft).toBeGreaterThan(0);

            // Test Shift + Tab
            GridFunctions.simulateCellKeydown(newCell, 'Tab', false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            newCell = treeGrid.getCellByColumn(5, columns[4]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
            expect(treeGrid.headerContainer.getScroll().scrollLeft).toEqual(scrollLeft);

            for (let i = 4; i > 0 ; i--) {
                let cell = treeGrid.getCellByColumn(5, columns[i]);
                GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(5, columns[i - 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            expect(treeGrid.headerContainer.getScroll().scrollLeft).toEqual(0);
        });

        it('should navigate with arrow Left key when there is a pinned column', async () => {
            treeGrid.getColumnByName('HireDate').pinned = true;
            fix.detectChanges();

            const columns = ['HireDate', 'ID', 'Name', 'Age', 'OnPTO'];

            const firstCell = treeGrid.getCellByColumn(3, 'HireDate');
            GridFunctions.simulateCellKeydown(firstCell, 'End');
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            const lastCell = treeGrid.getCellByColumn(3, columns[4]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, lastCell);
            expect(treeGrid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(0);

            for (let i = 4; i > 0 ; i--) {
                let cell = treeGrid.getCellByColumn(3, columns[i]);
                GridFunctions.simulateCellKeydown(cell, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(3, columns[i - 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            expect(treeGrid.headerContainer.getScroll().scrollLeft).toEqual(0);
        });

        it('should navigate with arrow Right key when there is a pinned column', async () => {
            treeGrid.getColumnByName('HireDate').pinned = true;
            fix.detectChanges();

            const columns = ['HireDate', 'ID', 'Name', 'Age', 'OnPTO'];

            const firstCell = treeGrid.getCellByColumn(0, 'HireDate');
            GridFunctions.simulateCellKeydown(firstCell, 'End');
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            let newCell = treeGrid.getCellByColumn(0, columns[4]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
            const scrollLeft = treeGrid.headerContainer.getScroll().scrollLeft;
            expect(treeGrid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(0);

            for (let i = 0; i < columns.length - 1; i++) {
                let cell = treeGrid.getCellByColumn(0, columns[i]);
                GridFunctions.simulateCellKeydown(cell, 'ArrowRight');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.getCellByColumn(0, columns[i + 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            newCell = treeGrid.getCellByColumn(0, columns[4]);
            GridFunctions.simulateCellKeydown(newCell, 'Home');
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            newCell = treeGrid.getCellByColumn(0, columns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
            expect(treeGrid.headerContainer.getScroll().scrollLeft).toEqual(scrollLeft);
        });

        it('should select correct cells after expand/collapse row', async () => {
            // Select first cell and expand collapse
            let rows;
            let cell = treeGrid.getCellByColumn(0, 'ID');
            cell.onFocus(null);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            GridFunctions.simulateCellKeydown(cell, 'ArrowLeft', true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 0, 'ID', true);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 1, 'ID', false);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'ID', 'Name', true);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'Name', 'ID', false);

            GridFunctions.simulateCellKeydown(cell, 'ArrowRight', true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            cell = treeGrid.getCellByColumn(0, 'ID');
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 0, 'ID', true);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 1, 'ID', false);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'ID', 'Name', true);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'Name', 'ID', false);

            // Go to the last parent row and expand collapse
            GridFunctions.simulateCellKeydown(cell, 'ArrowDown', false, false, true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(9, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 9, 'ID', false);
            cell = treeGrid.getCellByColumn(8, 'ID');

            GridFunctions.simulateCellKeydown(cell, 'ArrowLeft', true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[7]);
            cell = treeGrid.getCellByColumn(8, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 8, 'ID', 'Name', true);
            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 8, 'Name', 'ID', false);

            GridFunctions.simulateCellKeydown(cell, 'ArrowRight', true);
            await wait(DEBOUNCETIME);
            zone.simulateOnStable();
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[6]);
            cell = treeGrid.getCellByColumn(8, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
        });
    });
});
