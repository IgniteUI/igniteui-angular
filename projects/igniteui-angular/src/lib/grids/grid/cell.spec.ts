import { Component, ViewChild, OnInit } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { IgxColumnComponent, IgxGridCellComponent, IgxGridComponent, IgxGridModule, IGridCellEventArgs } from './index';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { HelperUtils} from '../../test-utils/helper-utils.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

const DEBOUNCETIME = 30;

describe('IgxGrid - Cell component', () => {
    configureTestSuite();

    const CELL_CSS_CLASS = '.igx-grid__td';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                VirtualGridComponent,
                NoColumnWidthGridComponent,
                CellEditingTestComponent,
                CellEditingScrollTestComponent,
                ConditionalCellStyleTestComponent,
                ColumnEditablePropertyTestComponent,
                GridColumnWidthsComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule.forRoot()]
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

    describe('Cell Editing', () => {
        configureTestSuite();

        describe('Cell Editing - test edit templates, sorting and filtering', () => {
            configureTestSuite();
            let fixture;
            let grid: IgxGridComponent;
            beforeEach(() => {
                fixture = TestBed.createComponent(CellEditingTestComponent);
                fixture.detectChanges();
                grid = fixture.componentInstance.grid;
            });

            it('should be able to enter edit mode on dblclick, enter and f2', (async () => {
                const rv = fixture.debugElement.query(By.css(CELL_CSS_CLASS));
                const cell = grid.getCellByColumn(0, 'fullName');

                rv.nativeElement.dispatchEvent(new Event('focus'));
                fixture.detectChanges();

                rv.triggerEventHandler('dblclick', {});
                await wait();
                expect(cell.inEditMode).toBe(true);

                UIInteractions.triggerKeyDownEvtUponElem('escape', rv.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false);

                UIInteractions.triggerKeyDownEvtUponElem('enter', rv.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true);

                UIInteractions.triggerKeyDownEvtUponElem('escape', rv.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false);

                UIInteractions.triggerKeyDownEvtUponElem('f2', rv.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true);

                UIInteractions.triggerKeyDownEvtUponElem('escape', rv.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false);
            }));

            it('should be able to edit cell which is a Primary Key', (async () => {
                grid.primaryKey = 'personNumber';
                fixture.detectChanges();

                const cell = grid.getCellByColumn(0, 'personNumber');
                const cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[4];

                fixture.detectChanges();
                cellDomPK.triggerEventHandler('dblclick', {});
                await wait();
                expect(cell.inEditMode).toBe(true);

                const editTemplate = cellDomPK.query(By.css('input[type=\'number\']'));
                UIInteractions.sendInput(editTemplate, 87);
                await wait();

                fixture.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomPK.nativeElement, true);
                await wait(DEBOUNCETIME);

                fixture.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(cell.value).toBe(87);
            }));

            it('edit template should be accourding column data type -- number', (async () => {
                const cell = grid.getCellByColumn(0, 'age');
                const cellDomNumber = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

                cellDomNumber.triggerEventHandler('dblclick', {});
                await wait();

                expect(cell.inEditMode).toBe(true);
                const editTemplate = cellDomNumber.query(By.css('input[type=\'number\']'));
                expect(editTemplate).toBeDefined();

                UIInteractions.sendInput(editTemplate, 0.3698);
                await wait();
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);

                fixture.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(parseFloat(cell.value)).toBe(0.3698);
                expect(editTemplate.nativeElement.type).toBe('number');
            }));

            it('should validate input data when edit numeric column', (async () => {
                const cell = grid.getCellByColumn(0, 'age');
                const cellDomNumber = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
                const expectedValue = 0;
                let editValue = 'some696';

                cellDomNumber.triggerEventHandler('dblclick', {});
                await wait();


                const editTemplate = cellDomNumber.query(By.css('input[type=\'number\']'));
                UIInteractions.sendInput(editTemplate, editValue);
                await wait();
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);

                fixture.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(parseFloat(cell.value)).toBe(expectedValue);

                cellDomNumber.triggerEventHandler('dblclick', {});
                await wait();

                editValue = '';
                UIInteractions.sendInput(editTemplate, editValue);
                await wait();
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);

                fixture.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(parseFloat(cell.value)).toBe(expectedValue);
            }));

            it('edit template should be accourding column data type -- boolean', (async () => {
                const cell = grid.getCellByColumn(0, 'isActive');
                const cellDomBoolean = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2];

                cellDomBoolean.triggerEventHandler('dblclick', {});
                await wait();

                expect(cell.inEditMode).toBe(true);

                const editTemplate = cellDomBoolean.query(By.css('.igx-checkbox')).query(By.css('.igx-checkbox__label'));
                expect(editTemplate).toBeDefined();
                expect(cell.value).toBe(true);

                editTemplate.nativeElement.click();
                await wait();

                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomBoolean.nativeElement, true);
                await wait(DEBOUNCETIME);

                fixture.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(cell.value).toBe(false);
            }));

            it('edit template should be accourding column data type -- date', (async () => {
                const cell = grid.getCellByColumn(0, 'birthday');
                const cellDomDate = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];
                const selectedDate = new Date('04/12/2017');

                cellDomDate.triggerEventHandler('dblclick', {});
                await wait();

                expect(cell.inEditMode).toBe(true);
                const datePicker = cellDomDate.query(By.css('igx-datepicker')).componentInstance;
                expect(datePicker).toBeDefined();

                datePicker.selectDate(selectedDate);
                await wait();

                expect(datePicker.value).toBe(selectedDate);
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomDate.nativeElement, true);
                await wait(DEBOUNCETIME);

                fixture.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(cell.value.getTime()).toBe(selectedDate.getTime());
            }));

            it('should exit edit mode on filtering', (async () => {
                const cell = grid.getCellByColumn(0, 'fullName');
                const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
                const cellValue = cell.value;

                cellDom.triggerEventHandler('dblclick', {});
                await wait();

                const editTemplate = cellDom.query(By.css('input'));
                expect(cell.inEditMode).toBe(true);

                UIInteractions.sendInput(editTemplate, 'Rick Gilmore');
                await wait();

                grid.filter('fullName', 'Al', IgxStringFilteringOperand.instance().condition('equals'));
                fixture.detectChanges();
                cell.gridAPI.clear_filter(cell.gridID, 'fullName');
                fixture.detectChanges();

                expect(cell.inEditMode).toBe(false);
                expect(cell.value).toBe(cellValue);
            }));

            it('should not throw errors when update cell to value, which does not match filter criteria', (async () => {
                grid.filter('personNumber', 1, IgxStringFilteringOperand.instance().condition('equals'));
                fixture.detectChanges();

                const cell = grid.getCellByColumn(0, 'personNumber');
                const cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[4];
                const previousCell = grid.getCellByColumn(0, 'birthday');

                cellDomPK.triggerEventHandler('dblclick', {});
                await wait();
                expect(cell.inEditMode).toBe(true);

                const editTemplate = cellDomPK.query(By.css('input[type=\'number\']'));
                UIInteractions.sendInput(editTemplate, 9);
                await wait();

                expect (() => previousCell.onClick({})).not.toThrow();
            }));

            it('should exit edit mode on sorting', (async () => {
                const cell = grid.getCellByColumn(0, 'fullName');
                const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                cellDom.triggerEventHandler('dblclick', {});
                await wait();

                const editTemplate = cellDom.query(By.css('input'));
                expect(cell.inEditMode).toBe(true);
                UIInteractions.sendInput(editTemplate, 'Rick Gilmore');
                await wait();

                grid.sort({ fieldName: 'age', dir: SortingDirection.Desc, ignoreCase: false });
                fixture.detectChanges();

                expect(cell.gridAPI.get_cell_inEditMode(cell.gridID)).toBeNull();
            }));

            it('should update correct cell when sorting is applied', (async () => {
                grid.sort( {fieldName: 'age',  dir: SortingDirection.Desc, ignoreCase: false});
                fixture.detectChanges();

                const cell = grid.getCellByColumn(0, 'fullName');
                const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
                cellDom.triggerEventHandler('dblclick', {});
                await wait();

                const editTemplate = cellDom.query(By.css('input'));
                expect(cell.inEditMode).toBe(true);
                expect(cell.editValue).toBe('Tom Riddle');
                UIInteractions.sendInput(editTemplate, 'Rick Gilmore');
                await wait();

                expect(cell.gridAPI.get_cell_inEditMode(cell.gridID).cell.editValue).toBe('Rick Gilmore');
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDom.nativeElement, true);
                await wait(DEBOUNCETIME);

                fixture.detectChanges();
                expect(cell.value).toBe('Rick Gilmore');
                expect(cell.gridAPI.get_cell_inEditMode(cell.gridID)).toBeNull();
            }));
        });

        describe('EditMode - on scroll, pin, blur', () => {
            configureTestSuite();
            let fixture;
            let grid;
            const CELL_CLASS_IN_EDIT_MODE = 'igx_grid__cell--edit';
            beforeEach(async() => {
                fixture = TestBed.createComponent(CellEditingScrollTestComponent);
                fixture.detectChanges();

                grid = fixture.componentInstance.grid;
            });

            it('edit mode - leaves edit mode on blur', (async () => {
                const rv = fixture.debugElement.query(By.css(CELL_CSS_CLASS));
                const cell = grid.getCellByColumn(0, 'firstName');
                const button = fixture.debugElement.query(By.css('.btnTest'));

                cell.column.editable = true;
                rv.nativeElement.dispatchEvent(new Event('focus'));
                await wait();
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('enter', rv.nativeElement, true);
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

                expect(cell.inEditMode).toBe(true);

                button.nativeElement.dispatchEvent(new Event('click'));
                await wait();
                fixture.detectChanges();

                expect(cell.inEditMode).toBe(true);
            }));

            it('edit mode - exit edit mode and submit when pin/unpin unpin column', (async () => {
                let cell = grid.getCellByColumn(0, 'firstName');
                const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                cellDom.triggerEventHandler('dblclick', {});
                await wait();
                fixture.detectChanges();

                expect(cell.gridAPI.get_cell_inEditMode(grid.id)).toBeDefined();
                const editTemplate = cellDom.query(By.css('input'));
                UIInteractions.sendInput(editTemplate, 'Gary Martin');
                await wait();
                fixture.detectChanges();

                grid.pinColumn('firstName');
                expect(cell.gridAPI.get_cell_inEditMode(grid.id)).toBeNull();
                expect(grid.pinnedColumns.length).toBe(1);
                cell = grid.getCellByColumn(0, 'firstName');
                expect(cell.value).toBe('Gary Martin');
                cell = grid.getCellByColumn(1, 'firstName');
                const cellValue = cell.value;
                cell.inEditMode = true;
                await wait();
                fixture.detectChanges();

                expect(cell.gridAPI.get_cell_inEditMode(grid.id)).toBeDefined();
                grid.unpinColumn('firstName');
                expect(grid.pinnedColumns.length).toBe(0);
                expect(cell.gridAPI.get_cell_inEditMode(grid.id)).toBeNull();
                expect(cell.inEditMode).toBe(false);
                expect(cell.value).toBe(cellValue);
            }));


            it('edit mode - leaves cell in edit mode on scroll', (async () => {
                const cell = grid.getCellByColumn(0, 'firstName');
                const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
                const editableCellId = cell.cellID;
                cellDom.triggerEventHandler('dblclick', {});
                await wait();
                fixture.detectChanges();

                let editCellID = cell.gridAPI.get_cell_inEditMode(cell.gridID).cellID;
                expect(editableCellId.columnID).toBe(editCellID.columnID);
                expect(editableCellId.rowIndex).toBe(editCellID.rowIndex);
                expect(JSON.stringify(editableCellId.rowID)).toBe(JSON.stringify(editCellID.rowID));

                fixture.componentInstance.scrollTop(1000);
                await wait(100);
                fixture.detectChanges();
                fixture.componentInstance.scrollLeft(800);
                await wait(100);
                fixture.detectChanges();

                editCellID = cell.gridAPI.get_cell_inEditMode(cell.gridID).cellID;
                expect(editableCellId.columnID).toBe(editCellID.columnID);
                expect(editableCellId.rowIndex).toBe(editCellID.rowIndex);
                expect(JSON.stringify(editableCellId.rowID)).toBe(JSON.stringify(editCellID.rowID));
            }));

            it('When cell in editMode and try to navigate with `ArrowDown` - focus should remain over the input.', (async () => {
                const verticalScroll = grid.verticalScrollContainer.getVerticalScroll();
                const cellElem = fixture.debugElement.query(By.css(CELL_CSS_CLASS)).nativeElement;
                expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(false);

                cellElem.dispatchEvent(new Event('focus'));
                cellElem.dispatchEvent(new MouseEvent('dblclick'));
                await wait(50);
                fixture.detectChanges();

                let inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
                let elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
                expect(cellElem).toBe(elem);
                expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', inputElem, true);
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

                inputElem = document.activeElement as HTMLInputElement;
                elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
                expect(cellElem).toBe(elem);
                expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
                expect(verticalScroll.scrollTop).toBe(0);
            }));

            it('When cell in editMode and try to navigate with `ArrowUp` - focus should remain over the input.', (async () => {
                const verticalScroll = grid.verticalScrollContainer.getVerticalScroll();
                let expectedScroll;
                let cellElem;
                fixture.componentInstance.scrollTop(1000);
                await wait(500);
                fixture.detectChanges();

                const testCells = grid.getColumnByName('firstName').cells;
                cellElem = testCells[testCells.length - 1].nativeElement;

                cellElem.dispatchEvent(new Event('focus'));
                cellElem.dispatchEvent(new MouseEvent('dblclick'));
                await wait(50);
                fixture.detectChanges();

                let inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
                let elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
                expect(cellElem).toBe(elem);
                expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
                expectedScroll = verticalScroll.scrollTop;

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', inputElem, true);
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

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
                await wait(50);
                fixture.detectChanges();

                const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
                let elem = UIInteractions.findCellByInputElem(cellElem, inputElem);
                expect(cellElem).toBe(elem);
                expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);

                UIInteractions.triggerKeyDownEvtUponElem('arrowright', inputElem, true);
                await wait(DEBOUNCETIME);
                fixture.detectChanges();

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

                fixture.componentInstance.scrollLeft(800);
                await wait(100);
                fixture.detectChanges();

                const testCells = fixture.debugElement.query(By.css('igx-grid-row')).queryAll(By.css('igx-grid-cell'));
                cellElem = testCells[testCells.length - 1].nativeElement;

                cellElem.dispatchEvent(new Event('focus'));
                cellElem.dispatchEvent(new MouseEvent('dblclick'));
                await wait(50);
                fixture.detectChanges();

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
        });
    });

    it('should fit last cell in the available display container when there is vertical scroll.', async(() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual('182px');
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
        const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
        const firsCell = rows[1].querySelectorAll('igx-grid-cell')[0];

        expect(firsCell.textContent.trim()).toEqual('0');

        fix.componentInstance.scrollLeft(999999);
        await wait(200);
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
            expect(item.cells.last.width).toEqual('182px');
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

    it('should not make last column smaller when vertical scrollbar is on the right of last cell', () => {
        GridColumnWidthsComponent.COLUMN_WIDTH = '30px';
        const fix = TestBed.createComponent(GridColumnWidthsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;

        const lastColumnCells = grid.columns[grid.columns.length - 1].cells;
        lastColumnCells.forEach(function (item) {
            expect(item.width).toEqual('30px');
        });
    });

    it('should make last column smaller when vertical scrollbar is on the left of last cell', async () => {
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
            expect(item.width).toEqual('482px');
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
        <igx-grid [height]="gridHeight" [columnWidth]="defaultWidth" [width]="gridWidth" [data]="data" (onSelection)="cellSelected($event)">
            <igx-column *ngFor="let c of cols" [field]="c.field" [header]="c.field" [width]="c.width">
            </igx-column>
        </igx-grid>
    `
})
export class VirtualGridComponent {

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
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
     @ViewChild('grid', { read: IgxGridComponent })
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
