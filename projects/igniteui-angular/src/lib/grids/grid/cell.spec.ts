import { Component, ViewChild, OnInit } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent, IgxGridCellComponent, IgxGridComponent, IgxGridModule, IGridCellEventArgs } from './index';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { HammerGesturesManager } from '../../core/touch';
import { PlatformUtil } from '../../core/utils';

describe('IgxGrid - Cell component #grid', () => {
    configureTestSuite();

    const CELL_CSS_CLASS = '.igx-grid__td';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                VirtualGridComponent,
                NoColumnWidthGridComponent,
                ConditionalCellStyleTestComponent,
                ColumnEditablePropertyTestComponent,
                GridColumnWidthsComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    it('@Input properties and getters', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const firstIndexCell = grid.getCellByColumn(0, 'index');

        expect(firstIndexCell.columnIndex).toEqual(grid.columnList.first.index);
        expect(firstIndexCell.rowIndex).toEqual(grid.rowList.first.index);
        expect(firstIndexCell.grid).toBe(grid);
        expect(firstIndexCell.nativeElement).toBeDefined();
        expect(firstIndexCell.nativeElement.textContent).toMatch('1');
        expect(firstIndexCell.readonly).toBe(true);
        expect(firstIndexCell.describedby).toMatch(`${grid.id}_${firstIndexCell.column.field}`);
    });

    it('selection and selection events', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cell = grid.getCellByColumn(0, 'index');

        expect(rv.nativeElement.getAttribute('aria-selected')).toMatch('false');

        spyOn(grid.onSelection, 'emit').and.callThrough();
        const event = new Event('focus');
        rv.nativeElement.dispatchEvent(event);
        const args: IGridCellEventArgs = {
            cell,
            event
        };

        fix.detectChanges();

        expect(grid.onSelection.emit).toHaveBeenCalledWith(args);
        expect(cell.focused).toBe(true);
        expect(cell.selected).toBe(true);
        expect(rv.nativeElement.getAttribute('aria-selected')).toMatch('true');
        expect(cell).toBe(fix.componentInstance.selectedCell);
    });

    it('Should not emit selection event for already selected cell', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const cell = grid.columns[0].cells[0];
        const spy = spyOn(grid.onSelection, 'emit');

        cell.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        expect(spy.calls.count()).toEqual(1);

        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter'}));
        fix.detectChanges();
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape'}));
        fix.detectChanges();

        expect(spy.calls.count()).toEqual(1);
    });

    it('Should trigger onCellClick event when click into cell', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const cellElem = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const firstCell = grid.getCellByColumn(0, 'index');

        spyOn(grid.onCellClick, 'emit').and.callThrough();
        const event = new Event('click');
        cellElem.nativeElement.dispatchEvent(event);
        const args: IGridCellEventArgs = {
            cell: firstCell,
            event
        };

        fix.detectChanges();

        expect(grid.onCellClick.emit).toHaveBeenCalledWith(args);
        expect(firstCell).toBe(fix.componentInstance.clickedCell);
    });

    it('Should trigger onDoubleClick event', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        grid.columns[0].editable = true;
        fix.detectChanges();

        const cellElem = fix.debugElement.query(By.css(CELL_CSS_CLASS));

        spyOn(grid.onDoubleClick, 'emit').and.callThrough();
        cellElem.triggerEventHandler('dblclick', new Event('dblclick'));
        fix.detectChanges();
        expect(fix.componentInstance.eventCounter).toBe(1);

        cellElem.triggerEventHandler('dblclick', new Event('dblclick'));
        fix.detectChanges();
        expect(fix.componentInstance.eventCounter).toBe(2);
    });

    it('Should trigger onContextMenu event when right click into cell', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const cellElem = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const firstCell = grid.getCellByColumn(0, 'index');

        spyOn(grid.onContextMenu, 'emit').and.callThrough();
        const event = new Event('contextmenu');
        cellElem.nativeElement.dispatchEvent(event);
        const args: IGridCellEventArgs = {
            cell: firstCell,
            event
        };

        fix.detectChanges();

        expect(grid.onContextMenu.emit).toHaveBeenCalledWith(args);
        expect(firstCell).toBe(fix.componentInstance.clickedCell);
    });

    it('Should trigger onDoubleClick event when double click into cell', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const cellElem = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const firstCell = grid.getCellByColumn(0, 'index');

        spyOn(grid.onDoubleClick, 'emit').and.callThrough();
        const event = new Event('dblclick');
        spyOn(event, 'preventDefault');
        cellElem.nativeElement.dispatchEvent(event);
        const args: IGridCellEventArgs = {
            cell: firstCell,
            event
        };

        fix.detectChanges();

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(grid.onDoubleClick.emit).toHaveBeenCalledWith(args);
        expect(firstCell).toBe(fix.componentInstance.clickedCell);
    });

    it('Should not attach doubletap handler for non-iOS', () => {
        const addListenerSpy = spyOn(HammerGesturesManager.prototype, 'addEventListener');
        spyOn(PlatformUtil.prototype, 'isIOS').and.returnValue(false);
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();
        expect(addListenerSpy).not.toHaveBeenCalled();
    });

    it('Should handle doubletap on iOS, trigger onDoubleClick event', () => {
        const addListenerSpy = spyOn(HammerGesturesManager.prototype, 'addEventListener');
        spyOn(PlatformUtil.prototype, 'isIOS').and.returnValue(true);
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const cellElem = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const firstCell = grid.getCellByColumn(0, 'index');

        // should attach 'doubletap'
        expect(addListenerSpy.calls.count()).toBeGreaterThan(1);
        expect(addListenerSpy).toHaveBeenCalledWith(firstCell.nativeElement, 'doubletap', firstCell.onDoubleClick, { cssProps: { } });

        spyOn(grid.onDoubleClick, 'emit').and.callThrough();

        const event = {
            type: 'doubletap',
            preventDefault: jasmine.createSpy('preventDefault')
        };
        firstCell.onDoubleClick(event as any);
        const args: IGridCellEventArgs = {
            cell: firstCell,
            event
        } as any;

        fix.detectChanges();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(grid.onDoubleClick.emit).toHaveBeenCalledWith(args);
        expect(firstCell).toBe(fix.componentInstance.clickedCell);
    });

    it('Should blur selected cell when scrolling with mouse wheel', (async () => {
        const fixture = TestBed.createComponent(GridColumnWidthsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.instance;
        const cell = grid.getCellByColumn(3, '1');
        cell.nativeElement.focus();
        cell.nativeElement.click();
        fixture.detectChanges();

        expect(document.activeElement).toEqual(cell.nativeElement);

        const displayContainer = grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement;
        await UIInteractions.simulateWheelEvent(displayContainer, 0, 200);
        fixture.detectChanges();

        expect(document.activeElement).toEqual(document.body);

        // height/width setter rAF
        await wait(16);
    }));

     it('should fit last cell in the available display container when there is vertical scroll.', async(() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual('200px');
        });
    }));

    it('should use default column width for cells with width in %.', fakeAsync(() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols.forEach(() => {
            // delete this.width;
        });
        fix.componentInstance.defaultWidth = '25%';
        tick();
        fix.detectChanges();
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual('25%');
        });
    }));

    it('should fit last cell in the available display container when there is vertical and horizontal scroll.', (async () => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        grid.ngAfterViewInit();
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const firsCell = rows[1].querySelectorAll('igx-grid-cell')[0];

        expect(firsCell.textContent.trim()).toEqual('0');

        fix.componentInstance.scrollLeft(999999);
        await wait(200);
        // This won't work always in debugging mode due to the angular native events behavior, so errors are expected
        fix.detectChanges();
        const cells = rows[1].querySelectorAll('igx-grid-cell');
        const lastCell = cells[cells.length - 1];
        expect(lastCell.textContent.trim()).toEqual('990');

        // Calculate where the end of the cell is. Relative left position should equal the grid calculated width
        expect(lastCell.getBoundingClientRect().left +
            lastCell.offsetWidth +
            grid.scrollWidth).toEqual(parseInt(grid.width, 10));
    }));

    it('should not reduce the width of last pinned cell when there is vertical scroll.', fakeAsync(() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const columns = fix.componentInstance.instance.columnList;
        const lastCol: IgxColumnComponent = columns.last;
        lastCol.pinned = true;
        tick();
        fix.detectChanges();
        lastCol.cells.forEach((cell) => {
            expect(cell.width).toEqual('200px');
        });
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual('200px');
        });
    }));

    it('should not make last column width 0 when no column width is set', async(() => {
        const fix = TestBed.createComponent(NoColumnWidthGridComponent);
        fix.detectChanges();
        const columns = fix.componentInstance.instance.columnList;
        const lastCol: IgxColumnComponent = columns.last;
        lastCol.cells.forEach((cell) => {
            expect(cell.nativeElement.clientWidth).toBeGreaterThan(100);
        });
    }));

    it('should not make last column smaller when vertical scrollbar is on the right of last cell',
    fakeAsync(/** height/width setter rAF */() => {
        GridColumnWidthsComponent.COLUMN_WIDTH = '30px';
        const fix = TestBed.createComponent(GridColumnWidthsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;

        const lastColumnCells = grid.columns[grid.columns.length - 1].cells;
        lastColumnCells.forEach(function (item) {
            expect(item.width).toEqual('30px');
        });
    }));

    it('should not make last column smaller when vertical scrollbar is on the left of last cell', async () => {
        GridColumnWidthsComponent.COLUMN_WIDTH = '500px';
        const fix = TestBed.createComponent(GridColumnWidthsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;

        const scrollbar = grid.parentVirtDir.getHorizontalScroll();
        scrollbar.scrollLeft = 10000;
        fix.detectChanges();

        await wait(100);

        const lastColumnCells = grid.columns[grid.columns.length - 1].cells;
        fix.detectChanges();
        lastColumnCells.forEach(function (item) {
            expect(item.width).toEqual('500px');
        });
    });

    it('should be able to conditionally style cells', async(() => {
        const fixture = TestBed.createComponent(ConditionalCellStyleTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        grid.getColumnByName('UnitsInStock').cells.forEach((cell) => {
            expect(cell.nativeElement.classList).toContain('test1');
        });

        const indexColCells = grid.getColumnByName('ProductID').cells;

        expect(indexColCells[3].nativeElement.classList).not.toContain('test');
        expect(indexColCells[4].nativeElement.classList).toContain('test2');
        expect(indexColCells[5].nativeElement.classList).toContain('test');
        expect(indexColCells[6].nativeElement.classList).toContain('test');

        expect(grid.getColumnByName('ProductName').cells[4].nativeElement.classList).toContain('test2');
        expect(grid.getColumnByName('InStock').cells[4].nativeElement.classList).toContain('test2');
        expect(grid.getColumnByName('OrderDate').cells[4].nativeElement.classList).toContain('test2');
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
    public eventCounter = 0;
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
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
        this.eventCounter++;
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

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public gridWidth = '700px';
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
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
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

    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

    public data = [
        { FirstName: 'John', LastName: 'Brown', age: 20 },
        { FirstName: 'Ben', LastName: 'Affleck', age: 30 },
        { FirstName: 'Tom', LastName: 'Riddle', age: 50 }
    ];
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" [width]="'900px'" [height]="'500px'" rowSelection = "multiple">
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

    @ViewChild('grid', { static: true }) public grid: IgxGridComponent;

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
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;
    public data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];
}

@Component({
    template: `
        <igx-grid #grid
            [data]="data"
            [primaryKey]="'0'"
            [height]="'300px'">
            <igx-column *ngFor="let column of columns;"
                        [field]="column.field"
                        [width]="column.width">
            </igx-column>
        </igx-grid>
    `
})
export class GridColumnWidthsComponent {
    public static COLUMN_WIDTH;
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;
    public data;
    public columns;
    private columnsLenght: Number = 4;

    constructor() {
        const mydata = [];

        const mycolumns = [];

        for (let i = 0; i < 10; i++) {
            const record = {};
            for (let j = 0; j < this.columnsLenght; j++) {
                record['' + j] = j + i;
            }
            mydata.push(record);
            this.data = mydata;
        }

        for (let i = 0; i < this.columnsLenght; i++) {
            mycolumns.push({ field: '' + i, width: GridColumnWidthsComponent.COLUMN_WIDTH });
        }

        this.columns = mycolumns;
    }
}
