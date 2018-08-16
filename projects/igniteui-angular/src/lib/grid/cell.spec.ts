import { Component, DebugElement, ViewChild, AfterViewInit, EventEmitter, OnDestroy } from '@angular/core';
import { async, fakeAsync, TestBed, tick, discardPeriodicTasks } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { DataType } from '../data-operations/data-util';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IGridCellEventArgs, IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxStringFilteringOperand } from '../../public_api';
import { SortingDirection } from '../data-operations/sorting-expression.interface';

describe('IgxGrid - Cell component', () => {

    const CELL_CSS_CLASS = '.igx-grid__td';
    const navigateVerticallyToIndex = (grid: IgxGridComponent, cell: IgxGridCellComponent, index: number, cb?) => {
            // grid - the grid in which to navigate.
            // cell - current cell from which the navigation will start.
            // index - the index to which to navigate
            // cb - callback function that will be called when index is reached.
            const currIndex = cell.rowIndex;
            const dir = currIndex < index ? 'ArrowDown' : 'ArrowUp';
            const nextIndex = dir === 'ArrowDown' ? currIndex + 1 : currIndex - 1;
            const nextRow = grid.getRowByIndex(nextIndex);
            const keyboardEvent = new KeyboardEvent('keydown', {
                code: dir,
                key: dir
            });
            if (!cell.focused) {
                cell.nativeElement.dispatchEvent(new Event('focus'));
                grid.cdr.detectChanges();
            }
            // if index reached return
            if (currIndex === index) { if (cb) { cb(); } return; }
            // else call arrow up/down
            // cell.nativeElement.dispatchEvent(keyboardEvent);
            if (dir === 'ArrowDown') {
                cell.onKeydownArrowDown(keyboardEvent);
            } else {
                cell.onKeydownArrowUp(keyboardEvent);
            }
            grid.cdr.detectChanges();
            // if next row exists navigate next
            if (nextRow) {
                const nextCell = nextRow.cells.toArray()[0];
                nextCell.cdr.detectChanges();
                if (nextCell.focused) {
                    navigateVerticallyToIndex(grid, nextCell, index, cb);
                } else {
                    grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe({
                        next: () => {
                            grid.cdr.detectChanges();
                            navigateVerticallyToIndex(grid, nextCell, index, cb);
                        }
                    });
                }
            } else {
                // else wait for chunk to load.
                grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe({
                    next: () => {
                        grid.cdr.detectChanges();
                        cell = grid.selectedCells[0];
                        navigateVerticallyToIndex(grid, cell, index, cb);
                    }
                });
            }
        };
    const navigateHorizontallyToIndex = (grid: IgxGridComponent, cell: IgxGridCellComponent, index: number, cb?) => {
        // grid - the grid in which to navigate.
        // cell - current cell from which the navigation will start.
        // index - the index to which to navigate
        // cb - callback function that will be called when index is reached.

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
            if (currIndex === index) { if (cb) { cb(); } return; }
            // else call arrow up/down
            // cell.nativeElement.dispatchEvent(keyboardEvent);
            if (dir === 'ArrowRight') {
                cell.onKeydownArrowRight(keyboardEvent);
            } else {
                cell.onKeydownArrowLeft(keyboardEvent);
            }

            grid.cdr.detectChanges();
            // if next row exists navigate next
            if (nextCell) {
                nextCell.cdr.detectChanges();
                setTimeout(() => {
                    navigateHorizontallyToIndex(grid, nextCell, index, cb);
                }, 100);
            } else {
                // else wait for chunk to load.
                cell.row.virtDirRow.onChunkLoad.pipe(take(1)).subscribe({
                    next: () => {
                        grid.cdr.detectChanges();
                        nextCell = nextCol ? grid.getCellByColumn(0, nextCol.field) : null;
                        navigateHorizontallyToIndex(grid, nextCell, index, cb);
                    }
                });
            }
    };
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
                CellEditingPrimaryKeyTestComponent
            ],
            imports: [BrowserAnimationsModule, IgxGridModule.forRoot()]
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
        cellElem.nativeElement.dispatchEvent(event);
        const args: IGridCellEventArgs = {
            cell: firstCell,
            event
        };

        fix.detectChanges();

        expect(grid.onDoubleClick.emit).toHaveBeenCalledWith(args);
        expect(firstCell).toBe(fix.componentInstance.clickedCell);
    });

    it('edit mode', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cell = grid.getCellByColumn(0, 'index');

        cell.column.editable = true;
        rv.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        rv.triggerEventHandler('dblclick', {});
        fix.detectChanges();
        expect(cell.inEditMode).toBe(true);
        rv.triggerEventHandler('keydown.escape', null);

        fix.detectChanges();
        expect(cell.inEditMode).toBe(false);
        rv.triggerEventHandler('keydown.enter', null);

        fix.detectChanges();
        expect(cell.inEditMode).toBe(true);
        rv.triggerEventHandler('keydown.escape', null);

        fix.detectChanges();
        expect(cell.inEditMode).toBe(false);
        rv.triggerEventHandler('keydown.f2', null);

        fix.detectChanges();
        expect(cell.inEditMode).toBe(true);

        rv.triggerEventHandler('keydown.escape', null);
        expect(cell.inEditMode).toBe(false);
    });

    it('edit cell which is a Primary Key', () => {
        const fixture = TestBed.createComponent(CellEditingPrimaryKeyTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const cell = grid.getCellByColumn(0, 'personNumber');
        const cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        let editTemplate;

        fixture.detectChanges();

        cellDomPK.triggerEventHandler('dblclick', {});
        fixture.detectChanges();
        expect(cell.inEditMode).toBe(true);

        editTemplate = cellDomPK.query(By.css('input[type=\'number\']'));
        sendInput(editTemplate, 87, fixture);
        cellDomPK.triggerEventHandler('keydown.enter', null);
        fixture.detectChanges();
        expect(cell.inEditMode).toBe(false);
        expect(cell.value).toBe(87);
    });

    it('edit template should be accourding column data type -- number', () => {
        const fixture = TestBed.createComponent(CellEditingTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const cell = grid.getCellByColumn(0, 'age');
        const cellDomNumber = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        let editTemplate;

        fixture.detectChanges();
        cellDomNumber.triggerEventHandler('dblclick', {});
        fixture.detectChanges();

        expect(cell.inEditMode).toBe(true);
        editTemplate = cellDomNumber.query(By.css('input[type=\'number\']'));
        expect(editTemplate).toBeDefined();

        sendInput(editTemplate, 0.3698, fixture);
        cellDomNumber.triggerEventHandler('keydown.enter', null);
        fixture.detectChanges();
        expect(cell.inEditMode).toBe(false);
        expect(parseFloat(cell.value)).toBe(0.3698);
        expect(editTemplate.nativeElement.type).toBe('number');
    });

    it('edit numeric column should validate input data', () => {
        const fixture = TestBed.createComponent(CellEditingTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const cell = grid.getCellByColumn(0, 'age');
        const cellDomNumber = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        let editTemplate;
        const expectedValue = 0;
        let editValue = 'some696';

        fixture.detectChanges();
        cellDomNumber.triggerEventHandler('dblclick', {});
        fixture.detectChanges();

        editTemplate = cellDomNumber.query(By.css('input[type=\'number\']'));
        sendInput(editTemplate, editValue, fixture);
        cellDomNumber.triggerEventHandler('keydown.enter', null);
        fixture.detectChanges();

        expect(cell.inEditMode).toBe(false);
        expect(parseFloat(cell.value)).toBe(expectedValue);

        cellDomNumber.triggerEventHandler('dblclick', {});
        fixture.detectChanges();

        editValue = '';
        sendInput(editTemplate, editValue, fixture);
        cellDomNumber.triggerEventHandler('keydown.enter', null);
        fixture.detectChanges();

        expect(cell.inEditMode).toBe(false);
        expect(parseFloat(cell.value)).toBe(expectedValue);
    });

    it('edit template should be accourding column data type -- boolean', fakeAsync(() => {
        const fixture = TestBed.createComponent(CellEditingTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const cell = grid.getCellByColumn(0, 'isActive');
        const cellDomBoolean = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2];
        let editTemplate;
        fixture.detectChanges();

        cellDomBoolean.triggerEventHandler('dblclick', {});
        tick();
        fixture.detectChanges();

        expect(cell.inEditMode).toBe(true);
        editTemplate = cellDomBoolean.query(By.css('.igx-checkbox')).query(By.css('.igx-checkbox__label'));
        expect(editTemplate).toBeDefined();
        expect(cell.value).toBe(true);
        editTemplate.nativeElement.click();
        fixture.detectChanges();

        cellDomBoolean.triggerEventHandler('keydown.enter', null);
        tick();
        fixture.detectChanges();

        expect(cell.inEditMode).toBe(false);
        expect(cell.value).toBe(false);
    }));

    it('edit template should be accourding column data type -- date', fakeAsync(() => {
        const fixture = TestBed.createComponent(CellEditingTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const cell = grid.getCellByColumn(0, 'birthday');
        const cellDomDate = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];
        const selectedDate = new Date('04/12/2017');
        let datePicker;
        fixture.detectChanges();

        cellDomDate.triggerEventHandler('dblclick', {});
        tick();
        fixture.detectChanges();

        expect(cell.inEditMode).toBe(true);
        datePicker = cellDomDate.query(By.css('igx-datepicker')).componentInstance;
        expect(datePicker).toBeDefined();

        datePicker.selectDate(selectedDate);
        fixture.detectChanges();

        expect(datePicker.value).toBe(selectedDate);
        cellDomDate.triggerEventHandler('keydown.enter', null);
        tick();
        fixture.detectChanges();

        expect(cell.inEditMode).toBe(false);
        expect(cell.value).toBe(selectedDate);
    }));

    it('edit mode - leaves cell in edit mode on scroll', (done) => {
        const fixture = TestBed.createComponent(CellEditingScrollTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const cell = grid.getCellByColumn(0, 'firstName');
        const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        const editableCellId = cell.cellID;
        fixture.whenStable().then(() => {
            fixture.detectChanges();

            cellDom.triggerEventHandler('dblclick', {});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            let editCellID = cell.gridAPI.get_cell_inEditMode(cell.gridID).cellID;
            expect(editableCellId.columnID).toBe(editCellID.columnID);
            expect(editableCellId.rowIndex).toBe(editCellID.rowIndex);
            expect(JSON.stringify(editableCellId.rowID)).toBe(JSON.stringify(editCellID.rowID));
            fixture.componentInstance.scrollTop(1000);
            grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe(() => {
                fixture.detectChanges();
                fixture.componentInstance.scrollLeft(400);
                grid.rowList.toArray()[1].virtDirRow.onChunkLoad.pipe(take(1)).subscribe(() => {
                    fixture.detectChanges();
                    editCellID = cell.gridAPI.get_cell_inEditMode(cell.gridID).cellID;
                    expect(editableCellId.columnID).toBe(editCellID.columnID);
                    expect(editableCellId.rowIndex).toBe(editCellID.rowIndex);
                    expect(JSON.stringify(editableCellId.rowID)).toBe(JSON.stringify(editCellID.rowID));
                    done();
                });
            });
        });
    });

    it('edit mode - exit edit mode and submit when pin/unpin unpin column', fakeAsync(() => {
        const fixture = TestBed.createComponent(CellEditingScrollTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        let cell = grid.getCellByColumn(0, 'firstName');
        const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        cellDom.triggerEventHandler('dblclick', {});
        tick();
        fixture.detectChanges();

        expect(cell.gridAPI.get_cell_inEditMode(grid.id)).toBeDefined();
        const editTemplate = cellDom.query(By.css('input'));
        sendInput(editTemplate, 'Gary Martin', fixture);
        grid.pinColumn('firstName');
        fixture.detectChanges();

        expect(cell.gridAPI.get_cell_inEditMode(grid.id)).toBeNull();
        expect(grid.pinnedColumns.length).toBe(1);
        cell = grid.getCellByColumn(0, 'firstName');
        expect(cell.value).toBe('Gary Martin');
        cell = grid.getCellByColumn(1, 'firstName');
        cell.inEditMode = true;
        tick();
        fixture.detectChanges();

        expect(cell.gridAPI.get_cell_inEditMode(grid.id)).toBeDefined();
        grid.unpinColumn('firstName');
        expect(grid.pinnedColumns.length).toBe(0);
        expect(cell.gridAPI.get_cell_inEditMode(grid.id)).toBeNull();
    }));

    it('edit mode - exit on filtering', fakeAsync(() => {
        const fixture = TestBed.createComponent(CellEditingTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const cell = grid.getCellByColumn(0, 'fullName');
        const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        const cellValue = cell.value;
        let editTemplate;

        cellDom.triggerEventHandler('dblclick', {});
        tick();
        fixture.detectChanges();

        editTemplate = cellDom.query(By.css('input'));
        expect(cell.inEditMode).toBe(true);
        sendInput(editTemplate, 'Rick Gilmore', fixture);
        tick();
        fixture.detectChanges();

        grid.filter('fullName', 'Al', IgxStringFilteringOperand.instance().condition('equals'));
        fixture.detectChanges();
        cell.gridAPI.clear_filter(cell.gridID, 'fullName');
        fixture.detectChanges();

        expect(cell.inEditMode).toBe(false);
        expect(cell.value).toBe(cellValue);
    }));

    it('edit mode - exit on sorting', fakeAsync(() => {
        const fixture = TestBed.createComponent(CellEditingTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const cell = grid.getCellByColumn(0, 'fullName');
        const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        let editTemplate;

        cellDom.triggerEventHandler('dblclick', {});
        tick();
        fixture.detectChanges();

        editTemplate = cellDom.query(By.css('input'));
        expect(cell.inEditMode).toBe(true);
        sendInput(editTemplate, 'Rick Gilmore', fixture);
        fixture.detectChanges();

        grid.sort({ fieldName: 'age', dir: SortingDirection.Desc });
        fixture.detectChanges();

        expect(cell.gridAPI.get_cell_inEditMode(cell.gridID)).toBeNull();
    }));

    it('edit mode - update correct cell when sorting is applied', fakeAsync(() => {
        const fixture = TestBed.createComponent(CellEditingTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        grid.sort( {fieldName: 'age',  dir: SortingDirection.Desc});
        fixture.detectChanges();

        const cell = grid.getCellByColumn(0, 'fullName');
        const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        let editTemplate;


        cellDom.triggerEventHandler('dblclick', {});
        tick();
        fixture.detectChanges();
        editTemplate = cellDom.query(By.css('input'));
        expect(cell.inEditMode).toBe(true);
        expect(cell.editValue).toBe('Tom Riddle');
        sendInput(editTemplate, 'Rick Gilmore', fixture);
        fixture.detectChanges();

        expect(cell.gridAPI.get_cell_inEditMode(cell.gridID).cell.editValue).toBe('Rick Gilmore');
        cellDom.triggerEventHandler('keydown.enter', {});
        tick();
        fixture.detectChanges();

        expect(cell.value).toBe('Rick Gilmore');
        expect(cell.gridAPI.get_cell_inEditMode(cell.gridID)).toBeNull();
    }));

    function sendInput(element, text, fix) {
        element.nativeElement.value = text;
        element.nativeElement.dispatchEvent(new Event('input'));
    }

    it('edit mode - leaves edit mode on blur', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const rv2 = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        const cell = grid.getCellByColumn(0, 'index');
        const cell2 = grid.getCellByColumn(1, 'index');

        cell.column.editable = true;
        rv.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        rv.triggerEventHandler('keydown.enter', null);
        tick();
        fix.detectChanges();

        expect(cell.inEditMode).toBe(true);

        rv2.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        expect(cell.inEditMode).toBe(false);
    }));

    it('keyboard navigation', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const mockEvent = { preventDefault: () => { }, stopPropagation: () => { } };

        let topLeft;
        let topRight;
        let bottomLeft;
        let bottomRight;
        [topLeft, topRight, bottomLeft, bottomRight] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        topLeft.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');

        topLeft.triggerEventHandler('keydown.arrowdown', mockEvent);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(2);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');

        bottomLeft.triggerEventHandler('keydown.arrowright', mockEvent);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(2);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

        bottomRight.triggerEventHandler('keydown.arrowup', mockEvent);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

        topRight.triggerEventHandler('keydown.arrowleft', mockEvent);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');
    });

    it('keyboard navigation - first/last cell jump with Ctrl', () => {
        const fix = TestBed.createComponent(CtrlKeyKeyboardNagivationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const rv2 = fix.debugElement.query(By.css(`${CELL_CSS_CLASS}:last-child`));

        rv.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();
        rv.triggerEventHandler('keydown.control.arrowright', null);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('another');

        rv2.triggerEventHandler('keydown.control.arrowleft', null);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');
    });

    it('should fit last cell in the available display container when there is vertical scroll.', () => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual('182px');
        });
    });

    it('should use default column width for cells with width in %.', () => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols.forEach(() => {
            delete this.width;
        });
        fix.componentInstance.defaultWidth = '25%';
        fix.detectChanges();
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual('25%');
        });
    });

    it('should fit last cell in the available display container when there is vertical and horizontal scroll.', async(() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const firsCell = rows[1].querySelectorAll('igx-grid-cell')[0];

        expect(firsCell.textContent.trim()).toEqual('0');

        fix.componentInstance.scrollLeft(999999);
        fix.whenStable().then(() => {
            // This won't work always in debugging mode due to the angular native events behavior, so errors are expected
            fix.detectChanges();
            const cells = rows[1].querySelectorAll('igx-grid-cell');
            const lastCell = cells[cells.length - 1];
            const verticalScroll = grid.verticalScrollContainer.getVerticalScroll();

            expect(lastCell.textContent.trim()).toEqual('990');

            // Calculate where the end of the cell is. Relative left position should equal the grid calculated width
            expect(lastCell.getBoundingClientRect().left +
                lastCell.offsetWidth +
                verticalScroll.offsetWidth).toEqual(grid.calcWidth);
        });
    }));

    it('should scroll first row into view when pressing arrow up', (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();

        // the 2nd sell on the row with index 1
        const cell = fix.debugElement.queryAll(By.css(`${CELL_CSS_CLASS}:nth-child(2)`))[1];

        fix.componentInstance.scrollTop(25);
        fix.whenStable().then(() => {
            fix.detectChanges();
            const scrollContainer = fix.componentInstance.instance.verticalScrollContainer.dc.instance._viewContainer;
            const scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

            expect(scrollContainerOffset).toEqual(-25);

            cell.nativeElement.dispatchEvent(new Event('focus'));

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowup', code: '38' }));

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            fix.componentInstance.instance.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe(() => {
                const scrollContainer = fix.componentInstance.instance.verticalScrollContainer.dc.instance._viewContainer;
                const scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

                expect(scrollContainerOffset).toEqual(0);
                expect(fix.componentInstance.selectedCell.value).toEqual(0);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('value');
                done();
            });
        });
    });

    it('should not reduce the width of last pinned cell when there is vertical scroll.', () => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const columns = fix.componentInstance.instance.columnList;
        const lastCol: IgxColumnComponent = columns.last;
        lastCol.pinned = true;
        fix.detectChanges();
        lastCol.cells.forEach((cell) => {
            expect(cell.width).toEqual('200px');
        });
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual('182px');
        });
    });

    it('should not make last column width 0 when no column width is set', () => {
        const fix = TestBed.createComponent(NoColumnWidthGridComponent);
        fix.detectChanges();
        const columns = fix.componentInstance.instance.columnList;
        const lastCol: IgxColumnComponent = columns.last;
        lastCol.cells.forEach((cell) => {
            expect(cell.nativeElement.clientWidth).toBeGreaterThan(100);
        });
    });

    it('keyboard navigation - should allow navigating down in virtualized grid.', (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const cell = grid.getCellByColumn(4, 'index');
        const cbFunc = () => {
            fix.detectChanges();
            // verify first cell 100th row is selected.
            setTimeout( () => {
                expect(fix.componentInstance.selectedCell.rowIndex).toEqual(100);
                done();
            }, 10);
        };
        // navigate down to 100th row.
        navigateVerticallyToIndex(grid, cell, 100, cbFunc);
    });

    it('keyboard navigation - should allow navigating up in virtualized grid.', (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        grid.verticalScrollContainer.addScrollTop(5000);
        fix.detectChanges();
        setTimeout(() => {
            const cell = grid.getCellByColumn(104, 'index');
            const cbFunc = () => {
                fix.detectChanges();
                // verify first cell 0 row is selected.
                setTimeout( () => {
                    expect(fix.componentInstance.selectedCell.rowIndex).toEqual(0);
                    done();
                }, 10);
            };
            // navigate to 0.
            navigateVerticallyToIndex(grid, cell, 0, cbFunc);
        }, 100);
    });

    it('keyboard navigation - should allow horizontal navigation in virtualized grid.', (done) => {
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

        const cbFunc = () => {
            expect(fix.componentInstance.selectedCell.columnIndex).toEqual(9);
            fix.detectChanges();
            const cbFunc2 = () => {
                expect(fix.componentInstance.selectedCell.columnIndex).toEqual(1);
                done();
            };
            navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1, cbFunc2);
        };
        navigateHorizontallyToIndex(grid, cell, 9, cbFunc);
    });
    it('keyboard navigation - should allow horizontal navigation in virtualized grid with pinned cols.', (done) => {
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
        const cbFunc = () => {
            expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(9);
            const cbFunc2 = () => {
                expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(1);
                done();
            };
            navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1, cbFunc2);
        };
        navigateHorizontallyToIndex(grid, cell, 9, cbFunc);

    });

    it('keyboard navigation - should allow vertical navigation in virtualized grid with pinned cols.', (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        grid.pinColumn('index');
        const cell = grid.getCellByColumn(4, 'index');
        const cbFunc = () => {
            // verify first cell 100th row is selected.
            fix.detectChanges();
            setTimeout(() => {
                expect(fix.componentInstance.selectedCell.rowIndex).toEqual(100);
                done();
            }, 10);
        };
        // navigate down to 100th row.
        navigateVerticallyToIndex(grid, cell, 100, cbFunc);
    });

    it('keyboard navigation - should scroll into view the not fully visible cells when navigating down', (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const cell = rows[3].querySelectorAll('igx-grid-cell')[1];
        const displayContainer = fix.nativeElement.querySelectorAll('igx-display-container')[1];
        const bottomCellVisibleHeight = displayContainer.parentElement.offsetHeight % grid.rowHeight;

        cell.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(30);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

        const curCell = grid.getCellByColumn(3, '1');
        curCell.onKeydownArrowDown(new KeyboardEvent('keydown', { key: 'arrowdown', code: '40' }));

        grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe(() => {
            expect(parseInt(displayContainer.style.top, 10)).toEqual(-1 * (grid.rowHeight - bottomCellVisibleHeight));
            expect(displayContainer.parentElement.scrollTop).toEqual(0);
            expect(fix.componentInstance.selectedCell.value).toEqual(40);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
            done();
        });
    });

    it('keyboard navigation - should scroll into view the not fully visible cells when navigating up', (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const displayContainer = fix.nativeElement.querySelectorAll('igx-display-container')[1];

        fix.componentInstance.scrollTop(25);
        grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe(() => {
            fix.detectChanges();

            expect(displayContainer.style.top).toEqual('-25px');

            const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
            const cell = rows[1].querySelectorAll('igx-grid-cell')[1];

            cell.dispatchEvent(new Event('focus'));
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

            const curCell = grid.getCellByColumn(1, '1');
            curCell.onKeydownArrowUp(new KeyboardEvent('keydown', { key: 'arrowup', code: '38' }));

            grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe(() => {
                expect(displayContainer.style.top).toEqual('0px');

                expect(fix.componentInstance.selectedCell.value).toEqual(0);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

                done();
            });
        });
    });

    it('keyboard navigation - should scroll into view the not fully visible cells when navigating left', (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.cols = fix.componentInstance.generateCols(100);
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const rowDisplayContainer = rows[1].querySelector('igx-display-container');

        fix.componentInstance.scrollLeft(50);
        grid.rowList.toArray()[1].virtDirRow.onChunkLoad.pipe(take(1)).subscribe(() => {
            fix.detectChanges();

            expect(rowDisplayContainer.style.left).toEqual('-50px');

            const cell = rows[1].querySelectorAll('igx-grid-cell')[1];
            cell.dispatchEvent(new Event('focus'));
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

            const curCell = grid.getCellByColumn(1, '1');
            curCell.onKeydownArrowLeft(new KeyboardEvent('keydown', { key: 'arrowleft', code: '37' }));

            grid.rowList.toArray()[1].virtDirRow.onChunkLoad.pipe(take(1)).subscribe(() => {
                fix.detectChanges();
                expect(rowDisplayContainer.style.left).toEqual('0px');
                expect(fix.componentInstance.selectedCell.value).toEqual(0);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('0');
                done();
            });
        });
    });

    it('keyboard navigation - should scroll into view the not fully visible cells when navigating right', (done) => {
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
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(20);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('2');

        const curCell = grid.getCellByColumn(1, '2');
        curCell.onKeydownArrowRight(new KeyboardEvent('keydown', { key: 'arrowright', code: '39' }));

        grid.rowList.toArray()[1].virtDirRow.onChunkLoad.pipe(take(1)).subscribe(() => {
            fix.detectChanges();
            expect(rowDisplayContainer.style.left).toEqual('-43px');
            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('3');
            done();
        });
    });

    it('When cell in edit mode and try to navigate the caret around the cell text the focus should remain.', async(() => {
        const fix = TestBed.createComponent(GridWithEditableColumnComponent);
        fix.detectChanges();
        // const firstCellOfColumn: DebugElement = fix.componentInstance.grid.columnList.first.cells[0];
        const CELL_CLASS_IN_EDIT_MODE = 'igx_grid__cell--edit';
        const firstCell: DebugElement = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cellElem = firstCell.nativeElement;
        const component = fix.debugElement.query(By.css('igx-grid'));

        component.triggerEventHandler('keydown.home', null);
        fix.detectChanges();

        expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(false);

        fix.whenStable().then(() => {
            fix.detectChanges();
            cellElem.dispatchEvent(new MouseEvent('dblclick'));
            fix.detectChanges();
            return fix.whenStable();
        }).then(() => {
            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            fix.detectChanges();
            const elem = findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);

            triggerKeyDownEvtUponElem('ArrowRight', inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            triggerKeyDownEvtUponElem('ArrowLeft', inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;

            const elem = findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
        }).then(() => {
            fix.detectChanges();
            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            const elem = findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);

            triggerKeyDownEvtUponElem('control.ArrowLeft', inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            const elem = findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            triggerKeyDownEvtUponElem('control.ArrowRight', inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            const elem = findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            triggerKeyDownEvtUponElem('ArrowUp', inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            triggerKeyDownEvtUponElem('ArrowDown', inputElem);

            return fix.whenStable();
        });

        function triggerKeyDownEvtUponElem(evtName, elem) {
            const evtArgs: KeyboardEventInit = { key: evtName, bubbles: true };
            elem.dispatchEvent(new KeyboardEvent('keydown', evtArgs));
            fix.detectChanges();
        }

        function findCellByInputElem(elem, focusedElem) {
            if (!focusedElem.parentElement) {
                return null;
            }

            if (elem === focusedElem) {
                return elem;
            }

            return findCellByInputElem(elem, focusedElem.parentElement);
        }
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
        </igx-grid>
    `
})
export class CellEditingTestComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public data = [
        { fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];
}
@Component({
    template: `
        <igx-grid [data]="data" [primaryKey]="'personNumber'">
            <igx-column [editable]="true" field="personNumber" [dataType]="'number'"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="true" [dataType]="'date'"></igx-column>
        </igx-grid>
    `
})
export class CellEditingPrimaryKeyTestComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30,  birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50,  birthday: new Date('08/08/1961') }
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
        </igx-grid>
    `
})
export class CellEditingScrollTestComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public data = [
        { firstName: 'John', lastName: 'Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { firstName: 'Ben', lastName: 'Hudson', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { firstName: 'Tom', lastName: 'Riddle', age: 50, isActive: true, birthday: new Date('08/08/1967') },
        { firstName: 'John', lastName: 'David', age: 27, isActive: true, birthday: new Date('08/08/1990') },
        { firstName: 'David', lastName: 'Affleck', age: 36, isActive: false, birthday: new Date('08/08/1982') },
        { firstName: 'Jimmy', lastName: 'Johnson', age: 57, isActive: true, birthday: new Date('08/08/1961') },
        { firstName: 'Martin', lastName: 'Brown', age: 31, isActive: true, birthday: new Date('08/08/1987') },
        { firstName: 'Tomas', lastName: 'Smith', age: 81, isActive: false, birthday: new Date('08/08/1931') },
        { firstName: 'Michael', lastName: 'Parker', age: 48, isActive: true, birthday: new Date('08/08/1970') }
    ];

    public scrollTop(newTop: number) {
        this.grid.verticalScrollContainer.getVerticalScroll().scrollTop = newTop;
    }

    public scrollLeft(newLeft: number) {
        this.grid.parentVirtDir.getHorizontalScroll().scrollLeft = newLeft;
    }
}
