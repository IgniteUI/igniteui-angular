import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridComponent } from './grid.component';
import { IGridEditEventArgs, IGridEditDoneEventArgs } from '../common/events';
import { IgxGridModule } from './public_api';
import { wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { first } from 'rxjs/operators';

const CELL_CSS_CLASS = '.igx-grid__td';

describe('IgxGrid - CRUD operations #grid', () => {
    configureTestSuite();

    let fix;
    let grid;
    let data;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultCRUDGridComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(DefaultCRUDGridComponent);
        fix.detectChanges();
        grid = fix.componentInstance.instance;
        data = fix.componentInstance.data;
    }));

    it('should support adding rows through the grid API', () => {
        expect(grid.data.length).toEqual(data.length);
        expect(grid.rowList.length).toEqual(grid.data.length);

        for (let i = 0; i < 10; i++) {
            grid.addRow({ index: i, value: i});
        }
        fix.detectChanges();

        expect(fix.componentInstance.rowsAdded).toEqual(10);
        expect(grid.data.length).toEqual(data.length);
        expect(grid.rowList.length).toEqual(grid.data.length);
    });

    it('should support adding rows by manipulating the `data` @Input of the grid', () => {
        // Add to the data array without changing the reference
        // with manual detection
        for (let i = 0; i < 10; i++) {
            fix.componentInstance.data.push({ index: i, value: i});
        }

        grid.cdr.markForCheck();
        fix.detectChanges();

        expect(grid.data.length).toEqual(fix.componentInstance.data.length);
        expect(grid.rowList.length).toEqual(fix.componentInstance.data.length);

        // Add to the data array with changing the reference
        // without manual detection

        for (let i = 0; i < 10; i++) {
            fix.componentInstance.data.push({ index: i, value: i});
        }
        fix.componentInstance.data = fix.componentInstance.data.slice();
        fix.detectChanges();

        expect(grid.data.length).toEqual(fix.componentInstance.data.length);
        expect(grid.rowList.length).toEqual(fix.componentInstance.data.length);
    });

    it('should support deleting rows through the grid API', () => {
        grid.deleteRow(1);
        fix.detectChanges();

        expect(grid.data.length).toEqual(0);
        expect(data.length).toEqual(0);
        expect(grid.rowList.length).toEqual(0);

        for (let i = 0; i < 10; i++) {
            grid.addRow({ index: i, value: i});
        }
        fix.detectChanges();

        // Delete first and last rows
        grid.deleteRow(grid.rowList.first.index);
        grid.deleteRow(grid.rowList.last.index);

        fix.detectChanges();

        expect(grid.data.length).toEqual(data.length);
        expect(grid.rowList.length).toEqual(data.length);
        expect(fix.componentInstance.rowsDeleted).toEqual(3);

        expect(grid.rowList.first.cells.first.value).toEqual(1);
        expect(grid.rowList.last.cells.first.value).toEqual(8);

        // Try to delete a non-existant row
        grid.deleteRow(-1e7);
        fix.detectChanges();

        expect(grid.data.length).toEqual(8);
        expect(fix.componentInstance.rowsDeleted).toEqual(3);
    });

    it('should support removing rows by manipulating the `data` @Input of the grid', () => {
        // Remove from the data array without changing the reference
        // with manual detection
        fix.componentInstance.data.pop();
        grid.cdr.markForCheck();
        fix.detectChanges();

        expect(grid.data.length).toEqual(0);
        expect(grid.rowList.length).toEqual(0);

        for (let i = 0; i < 10; i++) {
            fix.componentInstance.data.push({ index: i, value: i});
        }
        fix.componentInstance.data = fix.componentInstance.data.slice();
        fix.detectChanges();

        expect(grid.data.length).toEqual(fix.componentInstance.data.length);
        expect(grid.rowList.length).toEqual(fix.componentInstance.data.length);

        // Remove from the data array with changing the reference
        // without manual detection
        fix.componentInstance.data.splice(0, 5);
        fix.componentInstance.data = fix.componentInstance.data.slice();
        fix.detectChanges();

        expect(grid.data.length).toEqual(5);
        expect(grid.rowList.length).toEqual(5);
        expect(grid.rowList.first.cells.first.value).toEqual(5);
    });

    it('should support updating a row through the grid API', () => {
        spyOn(grid.rowEdit, 'emit').and.callThrough();
        const doneSpy = spyOn(grid.rowEditDone, 'emit').and.callThrough();

        // Update non-existing row
        grid.updateRow({ index: -100, value: -100 }, 100);
        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).not.toEqual(-100);
        expect(grid.data[0].index).not.toEqual(-100);
        const args: IGridEditEventArgs = {
            rowID: 1,
            rowData: { index: 1, value: 1 },
            oldValue: { index: 1, value: 1 },
            newValue: { index: 200, value: 200 },
            cancel: false,
            owner: grid,
            isAddRow: false,
            event: undefined
        };

        const doneArgs: IGridEditDoneEventArgs = {
            rowID: 200,
            rowData: { index: 200, value: 200 },
            oldValue: { index: 1, value: 1 },
            newValue: { index: 200, value: 200 },
            owner: grid,
            isAddRow: false,
            event: undefined
        };

        (grid as IgxGridComponent).rowEdit.pipe(first()).subscribe(e => {
            expect(e).toEqual(args);
            expect(e.rowData).toBe(grid.dataView[0]);
            expect(e.rowData).toBe(e.oldValue);
        });
        // Update an existing row
        grid.updateRow(args.newValue, 1);
        fix.detectChanges();

        expect(grid.rowEdit.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEditDone.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEditDone.emit).toHaveBeenCalledWith(doneArgs);

        const spyDoneArgs = doneSpy.calls.mostRecent().args[0] as IGridEditDoneEventArgs;
        expect(spyDoneArgs.rowData).toBe(grid.dataView[0]);
        expect(spyDoneArgs.rowData).toBe(spyDoneArgs.newValue);

        expect(grid.rowList.first.cells.first.value).toEqual(200);
        expect(grid.data[0].index).toEqual(200);
    });

    it('should support updating a row through the grid API and event handler', () => {
        spyOn(grid.rowEdit, 'emit').and.callThrough();
        spyOn(grid.rowEditDone, 'emit').and.callThrough();

        const args: IGridEditEventArgs = {
            rowID: 1,
            rowData: { index: 1, value: 1 },
            oldValue: { index: 1, value: 1 },
            newValue: { index: 777, value: 777 },
            cancel: false,
            owner: grid,
            isAddRow: false,
            event: undefined
        };

        (grid as IgxGridComponent).rowEdit.pipe(first()).subscribe(e => {
            expect(e).toEqual(args);
            expect(e.rowData).toBe(grid.dataView[0]);
            expect(e.rowData).toBe(e.oldValue);
        });

        const handlerUpdateArgs: IGridEditDoneEventArgs = {
            rowID: 777,
            rowData: { index: 777, value: 777 },
            oldValue: { index: 1, value: 1 },
            newValue: { index: 777, value: 777 },
            owner: grid,
            isAddRow: false,
            event: undefined
        };

        // Update an existing cell - changing the new value in the event
        grid.updateRow(666, 1, 'index');
        fix.detectChanges();

        expect(grid.rowEdit.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEditDone.emit).toHaveBeenCalledTimes(1);

        // expect(grid.rowEdit.emit).toHaveBeenCalledWith(args);
        expect(grid.rowEditDone.emit).toHaveBeenCalledWith(handlerUpdateArgs);
        expect(grid.rowList.first.cells.first.value).toEqual(777);
        expect(grid.data[0].index).toEqual(777);
    });

    it('should support updating a cell value through the grid API', () => {
        // Update a non-existing cell
        grid.updateCell(-100, 100, 'index');
        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).not.toEqual(-100);
        expect(grid.rowList.first.cells.first.nativeElement.textContent).not.toMatch('-100');

        // Update an existing cell
        grid.updateCell(200, 1, 'index');
        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).toEqual(200);
        expect(grid.rowList.first.cells.first.nativeElement.textContent).toMatch('200');
    });

    it('should support updating a cell value through the cell object', () => {
        const firstCell = grid.getCellByColumn(0, 'index');
        firstCell.update(100);

        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).toEqual(100);
        expect(grid.rowList.first.cells.first.nativeElement.textContent).toMatch('100');
    });

    it('should update row through row object when PK is defined', () => {
        let firstRow = grid.getRowByKey(1);
        firstRow.update({ index: 31, value: 51});

        fix.detectChanges();
        firstRow = grid.getRowByKey(31);
        expect(firstRow).toBeDefined();
        const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        const secondCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        expect(parseInt(firstCell.nativeElement.innerText, 10)).toBe(31);
        expect(parseInt(secondCell.nativeElement.innerText, 10)).toBe(51);
    });

    it('should update row through row object when PK is NOT defined', () => {
        grid.primaryKey = null;
        fix.detectChanges();
        expect(grid.primaryKey).toBeNull();
        let firstRow = grid.getRowByIndex(0);
        firstRow.update({ index: 100, value: 99});

        fix.detectChanges();
        firstRow = grid.getRowByIndex(0);
        expect(firstRow).toBeDefined();
        const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        const secondCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        expect(parseInt(firstCell.nativeElement.innerText, 10)).toBe(100);
        expect(parseInt(secondCell.nativeElement.innerText, 10)).toBe(99);
    });

    it('should delete row through row object when PK is defined', () => {
        let firstRow = grid.getRowByKey(1);
        firstRow.delete();
        fix.detectChanges();
        firstRow = grid.getRowByKey(1);
        expect(firstRow).toBeUndefined();
        expect(grid.rowList.length).toBe(0);
    });

    it('should delete row through row object when PK is defined and there is cell in edit mode', () => {
        const indexColumn = grid.getColumnByName('index');
        indexColumn.editable = true;
        fix.detectChanges();
        const cell = grid.getCellByKey(1, 'index');
        const cellDom = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        fix.detectChanges();
        cellDom.triggerEventHandler('dblclick', {});
        fix.detectChanges();
        expect(cell.editMode).toBe(true);
        grid.deleteRow(1);
        fix.detectChanges();
        const firstRow = grid.getRowByKey(1);
        expect(firstRow).toBeUndefined();
        expect(grid.rowList.length).toBe(0);
    });

    it('should delete row through row object when PK is NOT defined', () => {
        grid.primaryKey = null;
        fix.detectChanges();
        expect(grid.primaryKey).toBeNull();
        let firstRow = grid.getRowByIndex(0);
        firstRow.delete();
        fix.detectChanges();
        firstRow = grid.getRowByIndex(0);
        expect(firstRow).toBeUndefined();
        expect(grid.rowList.length).toBe(0);
    });

    it('should delete row through row object when PK is NOT defined and there is cell in edit mode', () => {
        const indexColumn = grid.getColumnByName('index');
        indexColumn.editable = true;
        grid.primaryKey = null;
        fix.detectChanges();
        expect(grid.primaryKey).toBeNull();
        const cell = grid.getCellByColumn(0, 'index');
        const cellDom = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        let firstRow;
        fix.detectChanges();
        cellDom.triggerEventHandler('dblclick', {});
        fix.detectChanges();
        expect(cell.editMode).toBe(true);
        firstRow = grid.getRowByIndex(0);
        firstRow.delete();
        fix.detectChanges();
        firstRow = grid.getRowByIndex(0);
        expect(firstRow).toBeUndefined();
        expect(grid.rowList.length).toBe(0);
    });

    it('should be able to updateRow when PK is defined outside displayContainer', async () => {
        grid.height = '250px';
        await wait(50);
        fix.detectChanges();
        const rowID = 9;
        const sampleData = [{ index: 2, value: 2},
        { index: 3, value: 3}, { index: 4, value: 4}, { index: 5, value: 5},
        { index: 6, value: 6}, { index: 7, value: 7}, { index: 8, value: 8},
        { index: 9, value: 9}, { index: 10, value: 10}, { index: 11, value: 11}];
        sampleData.forEach((record) => grid.addRow(record));
        fix.detectChanges();
        expect(grid.data.length).toBe(11);

        grid.updateRow({ index: 97, value: 87}, rowID);
        fix.detectChanges();
        expect(grid.data.map((record) => record[grid.primaryKey]).indexOf(rowID)).toBe(-1);
        expect(grid.data[grid.data.map((record) => record[grid.primaryKey]).indexOf(97)]).toBeDefined();
    });

    it('should be able to deleteRow when PK is defined outside displayContainer', async () => {
        grid.height = '250px';
        await wait(50);
        fix.detectChanges();
        const rowID = 9;
        const sampleData = [{ index: 2, value: 2},
        { index: 3, value: 3}, { index: 4, value: 4}, { index: 5, value: 5},
        { index: 6, value: 6}, { index: 7, value: 7}, { index: 8, value: 8},
        { index: 9, value: 9}, { index: 10, value: 10}, { index: 11, value: 11}];
        sampleData.forEach((record) => grid.addRow(record));
        fix.detectChanges();
        expect(grid.data.length).toBe(11);

        grid.deleteRow(rowID);
        fix.detectChanges();
        expect(grid.data.map((record) => record[grid.primaryKey]).indexOf(rowID)).toBe(-1);
        expect(grid.data.length).toBe(10);
    });

    it('should be able to updateCell when PK is defined outside displayContainer', async () => {
        grid.height = '250px';
        await wait(50);
        fix.detectChanges();
        const rowID = 9;
        const columnName = 'value';
        const sampleData = [{ index: 2, value: 2},
        { index: 3, value: 3}, { index: 4, value: 4}, { index: 5, value: 5},
        { index: 6, value: 6}, { index: 7, value: 7}, { index: 8, value: 8},
        { index: 9, value: 9}, { index: 10, value: 10}, { index: 11, value: 11}];
        sampleData.forEach((record) => grid.addRow(record));
        fix.detectChanges();

        const cell = grid.getCellByKey(rowID, columnName);
        expect(grid.data.length).toBe(11);
        expect(cell).toBeUndefined();

        grid.updateCell( 97, rowID, columnName);
        fix.detectChanges();
        const row = grid.data[grid.data.map((record) => record[grid.primaryKey]).indexOf(rowID)];
        expect(row).toBeDefined();
        expect(row['index']).toBe(rowID);
        expect(row['value']).toBe(97);
    });
});

@Component({
    template: `
        <igx-grid
            [data]="data"
            [height]="null"
            (onRowAdded)="rowAdded()"
            (onRowDeleted)="rowDeleted()"
            (cellEdit)="editDone($event)"
            (rowEdit)="editDone($event)"
            [autoGenerate]="true"
            [primaryKey]="'index'">
        </igx-grid>
    `
})
export class DefaultCRUDGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public data = [
        { index: 1, value: 1}
    ];

    public rowsAdded = 0;
    public rowsDeleted = 0;

    public rowAdded() {
        this.rowsAdded++;
    }

    public rowDeleted() {
        this.rowsDeleted++;
    }

    public editDone(event: IGridEditEventArgs) {
        if (event.newValue === 666) {
            event.newValue = event.cellID ? 777 : { index: 777, value: 777 };
        }
    }
}
