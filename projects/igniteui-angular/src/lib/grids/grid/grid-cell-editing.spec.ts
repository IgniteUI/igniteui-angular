import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent,  IgxGridComponent, IgxGridModule, IGridEditEventArgs } from './index';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { ColumnEditablePropertyTestComponent } from './cell.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { CellEditingTestComponent, CellEditingScrollTestComponent } from '../../test-utils/grid-samples.spec';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';
const CELL_CLASS_IN_EDIT_MODE = 'igx-grid__td--editing';

describe('IgxGrid - Cell Editing #grid', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CellEditingTestComponent,
                CellEditingScrollTestComponent,
                ColumnEditablePropertyTestComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('Base Tests', () => {
        let fixture;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CellEditingTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            grid.ngAfterViewInit();
        }));

        it('should be able to enter edit mode on dblclick, enter and f2', () => {
            const rv = fixture.debugElement.query(By.css(CELL_CSS_CLASS));
            const cell = grid.getCellByColumn(0, 'fullName');

            rv.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            rv.triggerEventHandler('dblclick', {});
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('escape', rv.nativeElement, true);
            fixture.detectChanges();
            expect(cell.editMode).toBe(false);

            UIInteractions.triggerKeyDownEvtUponElem('enter', rv.nativeElement, true);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('escape', rv.nativeElement, true);
            fixture.detectChanges();
            expect(cell.editMode).toBe(false);

            UIInteractions.triggerKeyDownEvtUponElem('f2', rv.nativeElement, true);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('escape', rv.nativeElement, true);
            fixture.detectChanges();
            expect(cell.editMode).toBe(false);
        });

        it('should be able to edit cell which is a Primary Key', () => {
            grid.primaryKey = 'personNumber';
            fixture.detectChanges();

            const cell = grid.getCellByColumn(0, 'personNumber');
            const cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[4];

            fixture.detectChanges();
            cellDomPK.triggerEventHandler('dblclick', {});
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            const editTemplate = cellDomPK.query(By.css('input[type=\'number\']'));
            UIInteractions.sendInput(editTemplate, 87);

            fixture.detectChanges();
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomPK.nativeElement, true);

            fixture.detectChanges();
            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe(87);
        });

        it('edit template should be according column data type -- number', () => {
            const cell = grid.getCellByColumn(0, 'age');
            const cellDomNumber = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

            cellDomNumber.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const editTemplate = cellDomNumber.query(By.css('input[type=\'number\']'));
            expect(editTemplate).toBeDefined();

            UIInteractions.sendInput(editTemplate, 0.3698);
            fixture.detectChanges();
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(parseFloat(cell.value)).toBe(0.3698);
            expect(editTemplate.nativeElement.type).toBe('number');
        });

        it('should validate input data when edit numeric column', () => {
            const cell = grid.getCellByColumn(0, 'age');
            const cellDomNumber = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
            const expectedValue = 0;
            let editValue = 'some696';

            cellDomNumber.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            const editTemplate = cellDomNumber.query(By.css('input[type=\'number\']'));

            UIInteractions.sendInput(editTemplate, editValue);
            fixture.detectChanges();
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(parseFloat(cell.value)).toBe(expectedValue);

            cellDomNumber.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            editValue = '';
            UIInteractions.sendInput(editTemplate, editValue);
            fixture.detectChanges();
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(parseFloat(cell.value)).toBe(expectedValue);
        });

        it('edit template should be according column data type -- boolean', () => {
            const cell = grid.getCellByColumn(0, 'isActive');
            const cellDomBoolean = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2];

            cellDomBoolean.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);

            const editTemplate = cellDomBoolean.query(By.css('.igx-checkbox')).query(By.css('.igx-checkbox__label'));
            expect(editTemplate).toBeDefined();
            expect(cell.value).toBe(true);

            editTemplate.nativeElement.click();
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomBoolean.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe(false);
        });

        it('edit template should be according column data type -- date', () => {
            const cell = grid.getCellByColumn(0, 'birthday');
            const cellDomDate = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];
            const selectedDate = new Date('04/12/2017');

            cellDomDate.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const datePicker = cellDomDate.query(By.css('igx-date-picker')).componentInstance;
            expect(datePicker).toBeDefined();

            datePicker.selectDate(selectedDate);
            fixture.detectChanges();

            expect(datePicker.value).toBe(selectedDate);
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomDate.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value.getTime()).toBe(selectedDate.getTime());
        });

        it('should be able to change value form date picker input-- date', () => {
            const cell = grid.getCellByColumn(0, 'birthday');
            const cellDomDate = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];
            const selectedDate = new Date('04/12/2017');
            const editValue = '04/12/2017';

            cellDomDate.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const datePicker = cellDomDate.query(By.css('igx-date-picker')).componentInstance;
            expect(datePicker).toBeDefined();

            const editTemplate = cellDomDate.query(By.css('.igx-date-picker__input-date'));
            UIInteractions.sendInput(editTemplate, editValue);
            fixture.detectChanges();

            expect(datePicker.value).toEqual(selectedDate);
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomDate.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value.getTime()).toEqual(selectedDate.getTime());
        });

        it('should be able to clear value -- date', () => {
            const cell = grid.getCellByColumn(0, 'birthday');
            const cellDomDate = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];

            cellDomDate.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const datePicker = cellDomDate.query(By.css('igx-date-picker')).componentInstance;
            expect(datePicker).toBeDefined();

            const clear = cellDomDate.queryAll(By.css('.igx-icon'))[1];
            UIInteractions.clickElement(clear);

            expect(datePicker.value).toBeNull();
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomDate.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value).toBeNull();
        });

        it('Should not revert cell\' value when onDoubleClick while in editMode', (async () => {
            const cellElem = fixture.debugElement.query(By.css(CELL_CSS_CLASS));
            const firstCell = grid.getCellByColumn(0, 'fullName');

            expect(firstCell.nativeElement.textContent).toBe('John Brown');
            expect(firstCell.editMode).toBeFalsy();

            cellElem.triggerEventHandler('dblclick', new Event('dblclick'));
            fixture.detectChanges();
            const editCell = cellElem.query(By.css('input'));
            expect(editCell.nativeElement.value).toBe('John Brown');
            expect(firstCell.editMode).toBeTruthy();

            UIInteractions.sendInput(editCell, 'test');
            fixture.detectChanges();
            cellElem.triggerEventHandler('dblclick', new Event('dblclick'));
            fixture.detectChanges();
            expect(editCell.nativeElement.value).toBe('test');
            expect(firstCell.editMode).toBeTruthy();
        }));
    });

    describe('Scroll, pin and blur', () => {
        let fixture;
        let grid;

        beforeEach(() => {
            fixture = TestBed.createComponent(CellEditingScrollTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            grid.ngAfterViewInit();
        });

        it('edit mode - leaves edit mode on blur', fakeAsync(/** height/width setter rAF */() => {
            const rv = fixture.debugElement.query(By.css(CELL_CSS_CLASS));
            const cell = grid.getCellByColumn(0, 'firstName');
            const button = fixture.debugElement.query(By.css('.btnTest'));

            cell.column.editable = true;
            rv.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('enter', rv.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);

            button.nativeElement.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
        }));

        it('edit mode - exit edit mode and submit when pin/unpin unpin column', fakeAsync(/** height/width setter rAF */() => {
            let cell = grid.getCellByColumn(0, 'firstName');
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

            cellDom.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            expect(cell.gridAPI.get_cell_inEditMode()).toBeDefined();
            const editTemplate = cellDom.query(By.css('input'));
            UIInteractions.sendInput(editTemplate, 'Gary Martin');
            fixture.detectChanges();

            grid.pinColumn('firstName');
            fixture.detectChanges();
            expect(cell.gridAPI.get_cell_inEditMode()).toBeNull();
            expect(grid.pinnedColumns.length).toBe(1);
            cell = grid.getCellByColumn(0, 'firstName');
            expect(cell.value).toBe('Gary Martin');
            cell = grid.getCellByColumn(1, 'firstName');
            const cellValue = cell.value;
            cell.setEditMode(true);
            fixture.detectChanges();

            expect(cell.gridAPI.get_cell_inEditMode()).toBeDefined();
            grid.unpinColumn('firstName');
            fixture.detectChanges();
            cell = grid.getCellByColumn(1, 'firstName');
            expect(grid.pinnedColumns.length).toBe(0);
            expect(cell.gridAPI.get_cell_inEditMode()).toBeNull();
            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe(cellValue);
        }));

        it('edit mode - leaves cell in edit mode on scroll', (async () => {
            const cell = grid.getCellByColumn(0, 'firstName');
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            const editableCellId = cell.cellID;
            cellDom.triggerEventHandler('dblclick', {});
            await wait();
            fixture.detectChanges();

            let editCellID = cell.gridAPI.get_cell_inEditMode().id;
            expect(editableCellId.columnID).toBe(editCellID.columnID);
            expect(editableCellId.rowIndex).toBe(editCellID.rowIndex);
            expect(JSON.stringify(editableCellId.rowID)).toBe(JSON.stringify(editCellID.rowID));

            GridFunctions.scrollTop(grid, 1000);
            await wait(100);
            fixture.detectChanges();
            GridFunctions.scrollLeft(grid, 800);
            await wait(100);
            fixture.detectChanges();

            editCellID = cell.gridAPI.get_cell_inEditMode().id;
            expect(editableCellId.columnID).toBe(editCellID.columnID);
            expect(editableCellId.rowIndex).toBe(editCellID.rowIndex);
            expect(JSON.stringify(editableCellId.rowID)).toBe(JSON.stringify(editCellID.rowID));
        }));

        it('When cell in editMode and try to navigate with `ArrowDown` - focus should remain over the input.', async () => {
            const verticalScroll = grid.verticalScrollContainer.getVerticalScroll();
            const cellElem = fixture.debugElement.query(By.css(CELL_CSS_CLASS)).nativeElement;
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(false);

            cellElem.dispatchEvent(new Event('focus'));
            cellElem.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();
            await wait(50);

            let inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            let elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', inputElem, true);
            fixture.detectChanges();
            await wait(DEBOUNCETIME);

            inputElem = document.activeElement as HTMLInputElement;
            elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expect(verticalScroll.scrollTop).toBe(0);
        });

        it('When cell in editMode and try to navigate with `ArrowUp` - focus should remain over the input.', (async () => {
            const verticalScroll = grid.verticalScrollContainer.getVerticalScroll();
            let expectedScroll;
            let cellElem;
            GridFunctions.scrollTop(grid, 1000);
            await wait(500);
            fixture.detectChanges();

            const testCells = grid.getColumnByName('firstName').cells;
            cellElem = testCells[testCells.length - 1].nativeElement;

            cellElem.dispatchEvent(new Event('focus'));
            cellElem.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();
            await wait(50);

            let inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            let elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expectedScroll = verticalScroll.scrollTop;

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', inputElem, true);
            fixture.detectChanges();
            await wait(DEBOUNCETIME);

            inputElem = document.activeElement as HTMLInputElement;
            elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expect(verticalScroll.scrollTop).toBe(expectedScroll);
        }));

        it('When cell in editMode and try to navigate with `ArrowRight` - focus should remain over the input.', (async () => {
            const cellElem = fixture.debugElement.query(By.css(CELL_CSS_CLASS)).nativeElement;
            const virtRow = grid.getRowByIndex(0).virtDirRow;
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(false);

            cellElem.dispatchEvent(new Event('focus'));
            cellElem.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();
            await wait(50);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            let elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', inputElem, true);
            fixture.detectChanges();
            await wait(DEBOUNCETIME);

            const displayContainer = parseInt(virtRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            elem = UIInteractions.findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expect(displayContainer).toBe(0);
        }));

        it('When cell in editMode and try to navigate with `ArrowLeft` - focus should remain over the input.', (async () => {
            let cellElem;
            const virtRow = grid.getRowByIndex(0).virtDirRow;
            let virtRowStyle;

            GridFunctions.scrollLeft(grid, 800);
            await wait(100);
            fixture.detectChanges();

            const testCells = fixture.debugElement.query(By.css('igx-grid-row')).queryAll(By.css('igx-grid-cell'));
            cellElem = testCells[testCells.length - 1].nativeElement;

            cellElem.dispatchEvent(new Event('focus'));
            cellElem.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();
            await wait(50);

            let inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            let elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            virtRowStyle = parseInt(virtRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', inputElem, fixture);
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            inputElem = document.activeElement as HTMLInputElement;
            elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
            expect(cellElem).toBe(elem);
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expect(parseInt(virtRow.dc.instance._viewContainer.element.nativeElement.style.left, 10))
                .toBe(virtRowStyle);
        }));

        it('edit mode - should close calendar when scroll', (async () => {
            GridFunctions.scrollLeft(grid, 800);
            await wait(100);
            fixture.detectChanges();

            let cell = grid.getCellByColumn(1, 'birthday');
            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            const domDatePicker = fixture.debugElement.query(By.css('igx-date-picker'));
            const iconDate = domDatePicker.query(By.css('.igx-icon'));
            expect(iconDate).toBeDefined();

            UIInteractions.clickElement(iconDate);
            fixture.detectChanges();

            // Verify calendar is opened
            let picker = document.getElementsByClassName('igx-calendar-picker');
            expect(picker.length).toBe(1);

            GridFunctions.scrollTop(grid, 10);
            await wait(100);
            fixture.detectChanges();

            // Verify calendar is closed
            picker = document.getElementsByClassName('igx-calendar-picker');
            expect(picker.length).toBe(0);

            // Verify cell is still in edit mode
            cell = grid.getCellByColumn(1, 'birthday');
            expect(cell.nativeElement.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            const editCellID = cell.gridAPI.get_cell_inEditMode().id;
            expect(4).toBe(editCellID.columnID);
            expect(1).toBe(editCellID.rowIndex);
        }));
    });

    describe('Events', () => {
        let fixture;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CellEditingTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            grid.ngAfterViewInit();
        }));

        it(`Should properly emit 'onCellEditEnter' event`, () => {
            spyOn(grid.onCellEditEnter, 'emit').and.callThrough();
            let cell = grid.getCellByColumn(0, 'fullName');
            expect(cell.editMode).toBeFalsy();

            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            let cellArgs: IGridEditEventArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: 'John Brown', cancel: false };
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledTimes(1);
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(cell.editMode).toBeTruthy();

            // press tab on edited cell
            UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBeFalsy();
            cell = grid.getCellByColumn(0, 'age');
            cellArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: 20, cancel: false };
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledTimes(2);
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(cell.editMode).toBeTruthy();
        });

        it(`Should be able to cancel 'onCellEditEnter' event`, () => {
            spyOn(grid.onCellEditEnter, 'emit').and.callThrough();
            grid.onCellEditEnter.subscribe((e: IGridEditEventArgs) => {
                e.cancel = true;
            });
            let cell = grid.getCellByColumn(0, 'fullName');
            expect(cell.editMode).toBeFalsy();

            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            let cellArgs: IGridEditEventArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: 'John Brown', cancel: true };
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledTimes(1);
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(cell.editMode).toBeFalsy();

            // press enter on a cell
            cell = grid.getCellByColumn(0, 'age');
            UIInteractions.triggerKeyDownEvtUponElem('enter', cell.nativeElement, true);
            fixture.detectChanges();

            cellArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: 20, cancel: true };
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledTimes(2);
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should properly emit 'onCellEdit' event`, () => {
            spyOn(grid.onCellEdit, 'emit').and.callThrough();
            let cellArgs: IGridEditEventArgs;
            let cell = grid.getCellByColumn(0, 'fullName');

            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            let editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.sendInput(editTemplate, 'New Name');
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
            fixture.detectChanges();

            cellArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: 'John Brown', newValue: 'New Name', cancel: false };
            expect(grid.onCellEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.onCellEdit.emit).toHaveBeenCalledWith(cellArgs);

            cell = grid.getCellByColumn(0, 'age');
            expect(cell.editMode).toBe(true);
            editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.sendInput(editTemplate, 1);
            fixture.detectChanges();

            // press enter on edited cell
            UIInteractions.triggerKeyDownEvtUponElem('enter', cell.nativeElement, true);
            fixture.detectChanges();

            cellArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: 20, newValue: 1, cancel: false };
            expect(grid.onCellEdit.emit).toHaveBeenCalledTimes(2);
            expect(grid.onCellEdit.emit).toHaveBeenCalledWith(cellArgs);
        });

        it(`Should be able to cancel 'onCellEdit' event`, () => {
            spyOn(grid.onCellEdit, 'emit').and.callThrough();
            grid.onCellEdit.subscribe((e: IGridEditEventArgs) => {
                e.cancel = true;
            });
            let cellArgs: IGridEditEventArgs;
            let cell = grid.getCellByColumn(0, 'fullName');

            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            let editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.sendInput(editTemplate, 'New Name');
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
            fixture.detectChanges();

            cellArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: 'John Brown', newValue: 'New Name', cancel: true };
            expect(grid.onCellEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.onCellEdit.emit).toHaveBeenCalledWith(cellArgs);

            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe('John Brown');

            cell = grid.getCellByColumn(0, 'age');
            expect(cell.editMode).toBe(true);
            editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.sendInput(editTemplate, 1);
            fixture.detectChanges();

            // press enter on edited cell
            UIInteractions.triggerKeyDownEvtUponElem('enter', cell.nativeElement, true);
            fixture.detectChanges();

            cellArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: 20, newValue: '1', cancel: true };
            expect(grid.onCellEdit.emit).toHaveBeenCalledTimes(2);
            expect(grid.onCellEdit.emit).toHaveBeenCalledWith(cellArgs);

            expect(cell.editMode).toBe(true);
        });

        it(`Should be able to update other cell in 'onCellEdit' event`, () => {
            grid.primaryKey = 'personNumber';
            fixture.detectChanges();

            spyOn(grid.onCellEdit, 'emit').and.callThrough();
            grid.onCellEdit.subscribe((e: IGridEditEventArgs) => {
                if (e.cellID.columnID === 0) {
                    grid.updateCell(1, e.rowID, 'age' );
                }
            });

            let cell = grid.getCellByColumn(0, 'fullName');

            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fixture.detectChanges();

            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            let editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.sendInput(editTemplate, 'New Name');
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerKeyDownWithBlur('tab', cell.nativeElement, true);
            fixture.detectChanges();

            expect(grid.onCellEdit.emit).toHaveBeenCalledTimes(2);
            cell = grid.getCellByColumn(0, 'age');
            expect(cell.editMode).toBe(true);
            expect(cell.value).toEqual(1);
            expect(cell.editValue).toEqual(1);
            editTemplate = fixture.debugElement.query(By.css('input'));
            expect(editTemplate.nativeElement.value).toEqual('1');

            cell = grid.getCellByColumn(0, 'fullName');
            expect(cell.value).toEqual('New Name');
        });

        it(`Should properly emit 'onCellEditCancel' event`, () => {
            spyOn(grid.onCellEditCancel, 'emit').and.callThrough();
            const cell = grid.getCellByColumn(0, 'fullName');

            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.sendInput(editTemplate, 'New Name');
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerKeyDownEvtUponElem('escape', cell.nativeElement, true);
            fixture.detectChanges();

            const cellArgs: IGridEditEventArgs = { cellID: cell.cellID,
                rowID: cell.row.rowID, oldValue: 'John Brown', newValue: 'New Name', cancel: false };
            expect(grid.onCellEditCancel.emit).toHaveBeenCalledTimes(1);
            expect(grid.onCellEditCancel.emit).toHaveBeenCalledWith(cellArgs);

            expect(cell.editMode).toBe(false);
        });

        it(`Should be able to cancel 'onCellEditCancel' event`, () => {
            spyOn(grid.onCellEditCancel, 'emit').and.callThrough();
            grid.onCellEditCancel.subscribe((e: IGridEditEventArgs) => {
                e.cancel = true;
            });
            const cell = grid.getCellByColumn(0, 'fullName');

            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.sendInput(editTemplate, 'New Name');
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerKeyDownEvtUponElem('escape', cell.nativeElement, true);
            fixture.detectChanges();

            const cellArgs: IGridEditEventArgs = { cellID: cell.cellID,
                rowID: cell.row.rowID, oldValue: 'John Brown', newValue: 'New Name', cancel: true };
            expect(grid.onCellEditCancel.emit).toHaveBeenCalledTimes(1);
            expect(grid.onCellEditCancel.emit).toHaveBeenCalledWith(cellArgs);

            expect(cell.editMode).toBe(true);
        });
    });

    describe('Integration tests', () => {
        let fixture;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CellEditingTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            grid.ngAfterViewInit();
        }));

        it(`Should exit edit mode when rowEditable changes`, () => {
            const cell = grid.getCellByColumn(0, 'personNumber');
            expect(cell.editMode).toBeFalsy();

            cell.setEditMode(true);
            fixture.detectChanges();

            expect(cell.editMode).toBeTruthy();

            grid.rowEditable = true;
            fixture.detectChanges();

            expect(cell.editMode).toBeFalsy();
        });

        it('should exit edit mode on filtering', () => {
            let cell = grid.getCellByColumn(0, 'fullName');
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            const cellValue = cell.value;

            cellDom.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            const editTemplate = cellDom.query(By.css('input'));
            expect(cell.editMode).toBe(true);

            UIInteractions.sendInput(editTemplate, 'Rick Gilmore');
            fixture.detectChanges();

            grid.filter('fullName', 'Al', IgxStringFilteringOperand.instance().condition('equals'));
            fixture.detectChanges();
            cell.gridAPI.clear_filter('fullName');
            fixture.detectChanges();

            cell = grid.getCellByColumn(0, 'fullName');
            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe(cellValue);
        });

        it('should not throw errors when update cell to value, which does not match filter criteria', () => {
            grid.filter('personNumber', 1, IgxStringFilteringOperand.instance().condition('equals'));
            fixture.detectChanges();

            const cell = grid.getCellByColumn(0, 'personNumber');
            const cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[4];
            const previousCell = grid.getCellByColumn(0, 'birthday');

            cellDomPK.triggerEventHandler('dblclick', {});
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            const editTemplate = cellDomPK.query(By.css('input[type=\'number\']'));
            UIInteractions.sendInput(editTemplate, 9);
            fixture.detectChanges();

            expect(() => previousCell.onClick(new MouseEvent('click'))).not.toThrow();
        });

        it('should exit edit mode on sorting', () => {
            const cell = grid.getCellByColumn(0, 'fullName');
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

            cellDom.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            const editTemplate = cellDom.query(By.css('input'));
            expect(cell.editMode).toBe(true);
            UIInteractions.sendInput(editTemplate, 'Rick Gilmore');
            fixture.detectChanges();

            grid.sort({ fieldName: 'age', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();

            expect(cell.gridAPI.get_cell_inEditMode()).toBeNull();
        });

        it('should update correct cell when sorting is applied', () => {
            grid.sort({ fieldName: 'age', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();

            const cell = grid.getCellByColumn(0, 'fullName');
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            cellDom.triggerEventHandler('dblclick', {});
            fixture.detectChanges();

            const editTemplate = cellDom.query(By.css('input'));
            expect(cell.editMode).toBe(true);
            expect(cell.editValue).toBe('Tom Riddle');
            UIInteractions.sendInput(editTemplate, 'Rick Gilmore');
            fixture.detectChanges();

            expect(cell.gridAPI.get_cell_inEditMode().editValue).toBe('Rick Gilmore');
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDom.nativeElement, true);

            fixture.detectChanges();
            expect(cell.value).toBe('Rick Gilmore');
            expect(cell.gridAPI.get_cell_inEditMode()).toBeNull();
        });
    });

    it('Cell editing (when rowEditable=false) - default column editable value is false', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnEditablePropertyTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const columns: IgxColumnComponent[] = grid.columnList.toArray();
        expect(columns[0].editable).toBeFalsy();
        expect(columns[1].editable).toBeFalsy();
        expect(columns[2].editable).toBeTruthy();
        expect(columns[3].editable).toBeTruthy();
        expect(columns[4].editable).toBeFalsy();
        expect(columns[5].editable).toBeFalsy();
    }));
});
