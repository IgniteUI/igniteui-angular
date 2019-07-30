import { Component, OnInit, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../../calendar';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule, IgxColumnComponent } from './index';
import { wait } from '../../test-utils/ui-interactions.spec';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    ScrollsComponent,
    GridWithPrimaryKeyComponent,
    SelectionComponent,
    SelectionAndPagingComponent,
    SummariesComponent,
    SelectionCancellableComponent
} from '../../test-utils/grid-samples.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxHierarchicalGridMultiLayoutComponent } from '../hierarchical-grid/hierarchical-grid.spec';
import { IgxHierarchicalGridModule } from '../hierarchical-grid/hierarchical-grid.module';

describe('IgxGrid - Row Selection', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridWithPrimaryKeyComponent,
                SelectionAndPagingComponent,
                SelectionComponent,
                GridWithSelectionFilteringComponent,
                ScrollsComponent,
                SummariesComponent,
                SelectionCancellableComponent,
                HierarchicalGridRowSelectableIslandComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxHierarchicalGridModule
            ]
        })
            .compileComponents();
    }));

    describe('Base tests', () => {
        let fix;
        let grid;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should persist through scrolling', (async () => {
            const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
            const selectedRow = grid.getRowByIndex(0);
            expect(selectedRow).toBeDefined();
            const checkboxElement: HTMLElement = selectedRow.nativeElement.querySelector('.igx-checkbox__input');
            expect(selectedRow.isSelected).toBeFalsy();
            checkboxElement.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeTruthy();
            expect(grid.selectedRows()).toBeDefined();
            expect(grid.rowList.first).toBeDefined();
            expect(grid.rowList.first.isSelected).toBeTruthy();
            const scrollBar = gridElement.querySelector('.igx-vhelper--vertical');
            scrollBar.scrollTop = 500;
            await wait(100);
            fix.detectChanges();
            expect(grid.selectedRows()).toBeDefined();
            expect(grid.rowList.first).toBeDefined();
            expect(grid.rowList.first.isSelected).toBeFalsy();
            scrollBar.scrollTop = 0;
            await wait(100);
            fix.detectChanges();

            expect(selectedRow.isSelected).toBeTruthy();
            expect(grid.selectedRows()).toBeDefined();
            expect(grid.rowList.first).toBeDefined();
            expect(grid.rowList.first.isSelected).toBeTruthy();
            // expect(selectedRow.nativeElement.class).toContain("igx-grid__tr--selected");
        }));

        it('Should handle the deleteion on a selected row propertly', (async () => {
            const headerRow: HTMLElement = fix.nativeElement.querySelector('.igx-grid__thead');
            const firstRow = grid.getRowByKey('0_0');
            const firstRowCheckbox: HTMLInputElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');
            const headerCheckboxElement: HTMLInputElement = headerRow.querySelector('.igx-checkbox__input');

            firstRowCheckbox.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(headerCheckboxElement.checked).toBeFalsy();
            expect(headerCheckboxElement.indeterminate).toBeTruthy();

            grid.deleteRow('0_0');
            fix.detectChanges();

            expect(grid.getRowByKey('0_0')).toBeUndefined();
            expect(headerCheckboxElement.checked).toBeFalsy();
            expect(headerCheckboxElement.indeterminate).toBeFalsy();
        }));


        it('Should be able to select/deselect rows programatically', fakeAsync(() => {
            let rowsCollection = [];
            const firstRow = grid.getRowByKey('0_0');
            const secondRow = grid.getRowByKey('0_1');
            const thirdRow = grid.getRowByKey('0_2');

            spyOn(grid, 'triggerRowSelectionChange').and.callThrough();
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();

            rowsCollection = grid.selectedRows();

            expect(rowsCollection).toEqual([]);
            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();
            expect(thirdRow.isSelected).toBeFalsy();

            grid.deselectRows(['0_0', '0_1', '0_2']);
            tick();
            fix.detectChanges();

            expect(rowsCollection).toEqual([]);

            grid.selectRows(['0_0', '0_1', '0_2'], false);
            tick();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(secondRow.isSelected).toBeTruthy();
            expect(thirdRow.isSelected).toBeTruthy();

            rowsCollection = grid.selectedRows();
            expect(rowsCollection.length).toEqual(3);

            grid.deselectRows(['0_0', '0_1', '0_2']);
            tick();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();
            expect(thirdRow.isSelected).toBeFalsy();

            rowsCollection = grid.selectedRows();

            expect(rowsCollection.length).toEqual(0);
            expect(grid.triggerRowSelectionChange).toHaveBeenCalledTimes(3);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);
        }));

        it('Should be able to select/deselect ALL rows programatically', fakeAsync(() => {
            let rowsCollection = [];
            const firstRow = grid.getRowByKey('0_0');

            rowsCollection = grid.selectedRows();

            expect(rowsCollection).toEqual([]);
            expect(firstRow.isSelected).toBeFalsy();
            spyOn(grid, 'triggerRowSelectionChange').and.callThrough();
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();

            grid.selectAllRows();
            tick();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();

            rowsCollection = grid.selectedRows();

            expect(rowsCollection.length).toEqual(500);

            grid.deselectAllRows();
            tick();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();

            rowsCollection = grid.selectedRows();

            expect(rowsCollection.length).toEqual(0);
            expect(grid.triggerRowSelectionChange).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
        }));

        it('Should have persistent selection through data operations - sorting', fakeAsync(() => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);

            expect(firstRow).toBeDefined();
            expect(secondRow).toBeDefined();

            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();

            let rowsCollection = [];
            rowsCollection = grid.selectedRows();

            expect(rowsCollection).toEqual([]);

            grid.selectRows(['0_0', '0_1'], false);
            tick();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(secondRow.isSelected).toBeTruthy();
            expect(grid.rowList.find((row) => row === firstRow)).toBeTruthy();

            grid.sort({ fieldName: 'Column1', dir: SortingDirection.Desc, ignoreCase: true });
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();

            grid.clearSort('Column1');
            tick();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(secondRow.isSelected).toBeTruthy();
        }));

        it('Should be able to correctly select all rows programatically', fakeAsync(() => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            const firstRowCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');

            expect(firstRow.isSelected).toBeFalsy();

            grid.selectAllRows();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(secondRow.isSelected).toBeTruthy();

            firstRowCheckbox.dispatchEvent(new Event('click', {}));
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
        }));

        it('Hide row checkboxes, when all columns are hidden', fakeAsync(/** height/width setter rAF */() => {
            let headerCheck: HTMLElement = fix.nativeElement.querySelector('.igx-grid__thead').querySelector('.igx-checkbox__input');
            let rowCheck: HTMLElement = grid.getRowByIndex(0).nativeElement.querySelector('.igx-checkbox__input');
            expect(headerCheck).toBeDefined();
            expect(rowCheck).toBeDefined();

            grid.columns.forEach(c => c.hidden = true);
            fix.detectChanges();
            headerCheck = fix.nativeElement.querySelector('.igx-checkbox__input');
            expect(headerCheck).toBeNull();

            grid.columns.forEach(c => c.hidden = false);
            fix.detectChanges();
            headerCheck = fix.nativeElement.querySelector('.igx-grid__thead').querySelector('.igx-checkbox__input');
            rowCheck = grid.getRowByIndex(0).nativeElement.querySelector('.igx-checkbox__input');
            expect(headerCheck).toBeDefined();
            expect(rowCheck).toBeDefined();
        }));
    });

    describe('Selection with primaryKey', () => {
        let fix;
        let grid;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should be able to select row through primaryKey and index', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).rowData['Name']).toMatch('Gilberto Todd');
            expect(grid.getRowByIndex(1).rowData['Name']).toMatch('Gilberto Todd');
        });

        it('Should be able to update a cell in a row through primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).rowData['JobTitle']).toMatch('Director');
            grid.updateCell('Vice President', 2, 'JobTitle');
            fix.detectChanges();
            expect(grid.getRowByKey(2).rowData['JobTitle']).toMatch('Vice President');
        });

        it('Should be able to update row through primaryKey', () => {
            spyOn(grid.cdr, 'markForCheck').and.callThrough();
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).rowData['JobTitle']).toMatch('Director');
            grid.updateRow({ ID: 2, Name: 'Gilberto Todd', JobTitle: 'Vice President' }, 2);
            expect(grid.cdr.markForCheck).toHaveBeenCalledTimes(1);
            fix.detectChanges();
            expect(grid.getRowByIndex(1).rowData['JobTitle']).toMatch('Vice President');
            expect(grid.getRowByKey(2).rowData['JobTitle']).toMatch('Vice President');
        });

        it('Should be able to delete a row through primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2)).toBeDefined();
            grid.deleteRow(2);
            fix.detectChanges();
            expect(grid.getRowByKey(2)).toBeUndefined();
            expect(grid.getRowByIndex(2)).toBeDefined();
        });

        it('Should handle update by not overwriting the value in the data column specified as primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2)).toBeDefined();
            grid.updateRow({ ID: 7, Name: 'Gilberto Todd', JobTitle: 'Vice President' }, 2);
            fix.detectChanges();
            expect(grid.getRowByKey(7)).toBeDefined();
            expect(grid.getRowByIndex(1)).toBeDefined();
            expect(grid.getRowByIndex(1).rowData[grid.primaryKey]).toEqual(7);
        });

        it('Should be able to programatically select all rows with a correct reference, #1297', () => {
            grid.selectAllRows();
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    describe('Integration with paging', () => {
        let fix;
        let grid;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SelectionAndPagingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should persist through paging', (async () => {
            const nextBtn: HTMLElement = fix.nativeElement.querySelector('.nextPageBtn');
            const prevBtn: HTMLElement = fix.nativeElement.querySelector('.prevPageBtn');
            const selectedRow = grid.getRowByIndex(5);
            expect(selectedRow).toBeDefined();
            const checkboxElement: HTMLElement = selectedRow.nativeElement.querySelector('.igx-checkbox__input');
            expect(selectedRow.isSelected).toBeFalsy();
            checkboxElement.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeTruthy();
            nextBtn.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeFalsy();
            prevBtn.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeTruthy();
        }));

        it('Should persist through paging - multiple', (async () => {
            const nextBtn: HTMLElement = fix.nativeElement.querySelector('.nextPageBtn');
            const prevBtn: HTMLElement = fix.nativeElement.querySelector('.prevPageBtn');
            const firstRow = grid.getRowByIndex(0);
            const middleRow = grid.getRowByIndex(4);
            const lastRow = grid.getRowByIndex(9);
            expect(firstRow).toBeDefined();
            expect(middleRow).toBeDefined();
            expect(lastRow).toBeDefined();
            const checkboxElement1: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');
            const checkboxElement2: HTMLElement = middleRow.nativeElement.querySelector('.igx-checkbox__input');
            const checkboxElement3: HTMLElement = lastRow.nativeElement.querySelector('.igx-checkbox__input');
            expect(firstRow.isSelected).toBeFalsy();
            expect(middleRow.isSelected).toBeFalsy();
            expect(lastRow.isSelected).toBeFalsy();
            checkboxElement1.click();
            checkboxElement2.click();
            checkboxElement3.click();
            await wait();
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            expect(middleRow.isSelected).toBeTruthy();
            expect(lastRow.isSelected).toBeTruthy();
            nextBtn.click();
            await wait();
            fix.detectChanges();
            expect(firstRow.isSelected).toBeFalsy();
            expect(middleRow.isSelected).toBeFalsy();
            expect(lastRow.isSelected).toBeFalsy();
            prevBtn.click();
            await wait();
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            expect(middleRow.isSelected).toBeTruthy();
            expect(lastRow.isSelected).toBeTruthy();
        }));

        it('Should persist through paging - multiple selection', (async () => {
            const nextBtn: HTMLElement = fix.nativeElement.querySelector('.nextPageBtn');
            const prevBtn: HTMLElement = fix.nativeElement.querySelector('.prevPageBtn');
            const selectedRow1 = grid.getRowByIndex(5);
            const selectedRow2 = grid.getRowByIndex(3);
            const selectedRow3 = grid.getRowByIndex(0);

            expect(selectedRow1).toBeDefined();
            expect(selectedRow2).toBeDefined();
            expect(selectedRow3).toBeDefined();
            const checkboxElement1: HTMLElement = selectedRow1.nativeElement.querySelector('.igx-checkbox__input');
            const checkboxElement2: HTMLElement = selectedRow2.nativeElement.querySelector('.igx-checkbox__input');
            const checkboxElement3: HTMLElement = selectedRow3.nativeElement.querySelector('.igx-checkbox__input');

            expect(selectedRow1.isSelected).toBeFalsy();
            expect(selectedRow2.isSelected).toBeFalsy();
            expect(selectedRow3.isSelected).toBeFalsy();
            checkboxElement1.click();
            checkboxElement2.click();
            checkboxElement3.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow1.isSelected).toBeTruthy();
            expect(selectedRow2.isSelected).toBeTruthy();
            expect(selectedRow3.isSelected).toBeTruthy();
            nextBtn.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow1.isSelected).toBeFalsy();
            expect(selectedRow2.isSelected).toBeFalsy();
            expect(selectedRow3.isSelected).toBeFalsy();
            prevBtn.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow1.isSelected).toBeTruthy();
            expect(selectedRow2.isSelected).toBeTruthy();
            expect(selectedRow3.isSelected).toBeTruthy();
        }));

        it('Header checkbox should select/deselect all rows', (async () => {
            const headerRow: HTMLElement = fix.nativeElement.querySelector('.igx-grid__thead');
            const firstRow = grid.getRowByIndex(0);
            const middleRow = grid.getRowByIndex(5);
            const lastRow = grid.getRowByIndex(9);

            expect(headerRow).toBeDefined();
            expect(firstRow).toBeDefined();
            expect(middleRow).toBeDefined();
            expect(lastRow).toBeDefined();

            const headerCheckboxElement: HTMLElement = headerRow.querySelector('.igx-checkbox__input');
            expect(firstRow.isSelected).toBeFalsy();
            expect(middleRow.isSelected).toBeFalsy();
            expect(lastRow.isSelected).toBeFalsy();

            headerCheckboxElement.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(middleRow.isSelected).toBeTruthy();
            expect(lastRow.isSelected).toBeTruthy();

            headerCheckboxElement.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
            expect(middleRow.isSelected).toBeFalsy();
            expect(lastRow.isSelected).toBeFalsy();
        }));

        it('Header checkbox should deselect all rows - scenario when clicking first row, while header checkbox is clicked', (async () => {
            const headerRow: HTMLElement = fix.nativeElement.querySelector('.igx-grid__thead');
            const firstRow = grid.getRowByIndex(0);

            expect(headerRow).toBeDefined();
            expect(firstRow).toBeDefined();

            const headerCheckboxElement: HTMLInputElement = headerRow.querySelector('.igx-checkbox__input');

            expect(firstRow.isSelected).toBeFalsy();

            headerCheckboxElement.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(headerCheckboxElement.checked).toBeTruthy();
            expect(headerCheckboxElement.indeterminate).toBeFalsy();

            const targetCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');
            targetCheckbox.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
            expect(headerCheckboxElement.checked).toBeFalsy();
            expect(headerCheckboxElement.indeterminate).toBeTruthy();

            targetCheckbox.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(headerCheckboxElement.checked).toBeTruthy();
            expect(headerCheckboxElement.indeterminate).toBeFalsy();

            headerCheckboxElement.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
            expect(headerCheckboxElement.checked).toBeFalsy();
            expect(headerCheckboxElement.indeterminate).toBeFalsy();
        }));

        it('Checkbox should select/deselect row', (async () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);

            spyOn(grid, 'triggerRowSelectionChange').and.callThrough();
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            expect(firstRow).toBeDefined();
            expect(secondRow).toBeDefined();

            const targetCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');
            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();

            targetCheckbox.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
            expect(secondRow.isSelected).toBeFalsy();

            targetCheckbox.click();
            await wait();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();
            expect(grid.triggerRowSelectionChange).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
        }));

        it('Clicking any other cell is not selecting the row', fakeAsync(/** height/width setter rAF */() => {
            const firstRow = grid.getRowByIndex(0);
            const rv = fix.debugElement.query(By.css('.igx-grid__td'));

            expect(firstRow).toBeDefined();
            expect(firstRow.isSelected).toBeFalsy();

            rv.nativeElement.dispatchEvent(new Event('focus'));
            fix.detectChanges();
            rv.triggerEventHandler('click', {});
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
        }));

        it('Clicking any other cell is not deselecting the row', fakeAsync(/** height/width setter rAF */() => {
            const firstRow = grid.getRowByIndex(0);
            const rv = fix.debugElement.query(By.css('.igx-grid__td'));

            expect(rv).toBeDefined();
            expect(firstRow).toBeDefined();

            const targetCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');
            expect(firstRow.isSelected).toBeFalsy();

            targetCheckbox.click();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();

            rv.nativeElement.dispatchEvent(new Event('focus'));
            rv.triggerEventHandler('click', {});
            fix.detectChanges();

            expect(firstRow.isSelected).toBeTruthy();
        }));

        it('Should be able to programatically select all rows and keep the header checkbox intact,  #1298',
            fakeAsync(/** height/width setter rAF */() => {
                const headerRow: HTMLElement = fix.nativeElement.querySelector('.igx-grid__thead');
                const headerCheckboxElement: HTMLElement = headerRow.querySelector('.igx-checkbox');
                const firstRow = grid.getRowByIndex(0);
                const thirdRow = grid.getRowByIndex(2);

                expect(firstRow.isSelected).toBeFalsy();
                expect(thirdRow.isSelected).toBeFalsy();

                grid.selectAllRows();
                fix.detectChanges();

                expect(firstRow.isSelected).toBeTruthy();
                expect(thirdRow.isSelected).toBeTruthy();
                expect(headerCheckboxElement.classList.contains('igx-checkbox--checked')).toBeTruthy();

                grid.selectAllRows();
                fix.detectChanges();

                expect(firstRow.isSelected).toBeTruthy();
                expect(thirdRow.isSelected).toBeTruthy();
                expect(headerCheckboxElement.classList.contains('igx-checkbox--checked')).toBeTruthy();
            }));

        it('Should be able to programatically get a collection of all selected rows', fakeAsync(/** height/width setter rAF */() => {
            const firstRow = grid.getRowByIndex(0);
            const thirdRow = grid.getRowByIndex(2);
            const thirdRowCheckbox: HTMLElement = thirdRow.nativeElement.querySelector('.igx-checkbox__input');

            expect(firstRow.isSelected).toBeFalsy();
            expect(thirdRow.isSelected).toBeFalsy();
            expect(grid.selectedRows()).toEqual([]);

            thirdRowCheckbox.click();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
            expect(thirdRow.isSelected).toBeTruthy();
            expect(grid.selectedRows()).toEqual(['0_2']);

            thirdRowCheckbox.click();
            fix.detectChanges();

            expect(firstRow.isSelected).toBeFalsy();
            expect(thirdRow.isSelected).toBeFalsy();
            expect(grid.selectedRows()).toEqual([]);
        }));
    });

    describe('Integration with filtering', () => {
        let fix;
        let grid;
        let headerCheckbox: HTMLInputElement;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(GridWithSelectionFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.gridSelection4;
            headerCheckbox = fix.nativeElement.querySelector('.igx-grid__thead').querySelector('.igx-checkbox__input');
        }));

        it('Simple row selection', fakeAsync(/** height/width setter rAF */() => {
            const secondRow = grid.getRowByIndex(1);
            const targetCheckbox: HTMLElement = secondRow.nativeElement.querySelector('.igx-checkbox__input');

            targetCheckbox.click();
            fix.detectChanges();

            expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
            spyOn(grid.onRowSelectionChange, 'emit').and.callFake((args) => {
                args.newSelection = args.oldSelection;
            });

            targetCheckbox.click();
            fix.detectChanges();

            expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
        }));

        it('Filtering and row selection', fakeAsync(() => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();

            const secondRow = grid.getRowByIndex(1);
            expect(secondRow).toBeDefined();

            const targetCheckbox: HTMLElement = secondRow.nativeElement.querySelector('.igx-checkbox__input');
            expect(secondRow.isSelected).toBeFalsy();

            let rowsCollection = [];

            rowsCollection = grid.selectedRows();
            expect(rowsCollection).toEqual([]);

            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeFalsy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);

            rowsCollection = grid.selectedRows();

            expect(rowsCollection).toEqual([]);
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all filtered');

            grid.clearFilter('ProductName');
            fix.detectChanges();

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);

            targetCheckbox.click();
            fix.detectChanges();

            expect(secondRow.isSelected).toBeTruthy();
            expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeTruthy();
            expect(secondRow.isSelected).toBeTruthy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeFalsy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

            headerCheckbox.click();
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeTruthy();
            expect(headerCheckbox.indeterminate).toBeFalsy();
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Deselect all filtered');
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);

            grid.clearFilter('ProductName');
            fix.detectChanges();
            // expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeTruthy();
            expect(grid.getRowByIndex(0).isSelected).toBeTruthy();
            expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
            expect(grid.getRowByIndex(2).isSelected).toBeTruthy();

            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeTruthy();
            expect(headerCheckbox.indeterminate).toBeFalsy();

            headerCheckbox.click();
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeFalsy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeTruthy();
            expect(grid.getRowByIndex(0).isSelected).toBeFalsy();
            expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
            expect(grid.getRowByIndex(2).isSelected).toBeFalsy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);

            grid.getRowByIndex(0).nativeElement.querySelector('.igx-checkbox__input').click();
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeTruthy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);

            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeTruthy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);

            headerCheckbox.click();
            fix.detectChanges();

            headerCheckbox.click();
            fix.detectChanges();

            expect(headerCheckbox.checked).toBeFalsy();
            expect(headerCheckbox.indeterminate).toBeFalsy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(6);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            expect(grid.getRowByIndex(0).isSelected).toBeFalsy();
            expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(6);
        }));

        it('ARIA support', fakeAsync(/** height/width setter rAF */() => {
            const firstRow = grid.getRowByIndex(0).nativeElement;

            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all');

            headerCheckbox.click();
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Deselect all');

            headerCheckbox.click();
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all');
        }));

        it('Should properly check the header checkbox state when filtering, #2469', fakeAsync(() => {
            grid.primaryKey = 'ID';
            fix.detectChanges();
            tick();
            headerCheckbox.click();
            tick();
            fix.detectChanges();
            tick();
            expect(headerCheckbox.parentElement.classList).toContain('igx-checkbox--checked');
            grid.filter('Downloads', 0, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
            tick();
            fix.detectChanges();
            tick();
            expect(headerCheckbox.parentElement.classList).toContain('igx-checkbox--checked');
        }));
    });

    it('Should have checkbox on each row if rowSelectable is true', (async () => {
        const fix = TestBed.createComponent(ScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        grid.rowSelectable = false;

        for (const row of grid.rowList.toArray()) {
            const checkBoxElement = row.nativeElement.querySelector('div.igx-grid__cbx-selection');
            expect(checkBoxElement).toBeNull();
        }

        grid.rowSelectable = true;
        for (const row of grid.rowList.toArray()) {
            const checkBoxElement = row.nativeElement.querySelector('div.igx-grid__cbx-selection');
            expect(checkBoxElement).toBeDefined();

            const checkboxInputElement = checkBoxElement.querySelector('.igx-checkbox__input');
            expect(checkboxInputElement).toBeDefined();
        }

        const horScroll = grid.parentVirtDir.getHorizontalScroll();
        horScroll.scrollLeft = 1000;
        await wait(100);
        fix.detectChanges();

        for (const row of grid.rowList.toArray()) {

            // ensure we were scroll - the first cell's column index should not be 0
            const firstCellColumnIndex = row.cells.toArray()[0].columnIndex;
            expect(firstCellColumnIndex).not.toEqual(0);

            const checkBoxElement = row.nativeElement.querySelector('div.igx-grid__cbx-selection');
            expect(checkBoxElement).toBeDefined();

            const checkboxInputElement = checkBoxElement.querySelector('.igx-checkbox__input');
            expect(checkboxInputElement).toBeDefined();
        }
    }));

    // API Methods

    it('Summaries integration', () => {
        const fixture = TestBed.createComponent(SummariesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        expect(grid.summariesMargin).toBe(grid.featureColumnsWidth);
    });

    it('Should be able to programatically overwrite the selection using onRowSelectionChange event', () => {
        const fixture = TestBed.createComponent(SelectionCancellableComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const firstRow = grid.getRowByIndex(0);
        const firstRowCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');
        const secondRow = grid.getRowByIndex(1);
        const secondRowCheckbox: HTMLElement = secondRow.nativeElement.querySelector('.igx-checkbox__input');
        const thirdRow = grid.getRowByIndex(2);

        expect(firstRow.isSelected).toBeFalsy();
        expect(secondRow.isSelected).toBeFalsy();
        expect(thirdRow.isSelected).toBeFalsy();

        firstRowCheckbox.dispatchEvent(new Event('click', {}));
        fixture.detectChanges();

        expect(firstRow.isSelected).toBeTruthy();
        expect(secondRow.isSelected).toBeFalsy();
        expect(thirdRow.isSelected).toBeFalsy();

        firstRowCheckbox.dispatchEvent(new Event('click', {}));
        secondRowCheckbox.dispatchEvent(new Event('click', {}));
        fixture.detectChanges();

        expect(firstRow.isSelected).toBeFalsy();
        expect(secondRow.isSelected).toBeFalsy();
        expect(thirdRow.isSelected).toBeFalsy();
    });


    it('Set rowSelectable on HGrid row island', fakeAsync(() => {
        expect(() => {
            const fix = TestBed.createComponent(HierarchicalGridRowSelectableIslandComponent);
            fix.detectChanges();
        }).not.toThrow();
    }));

});



@Component({
    template: `
        <igx-grid #gridSelection4 [data]="data" height="500px" [rowSelectable]="true">
            <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
            <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
            <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
            <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
                        [filterable]="true" dataType="date">
            </igx-column>
        </igx-grid>`
})
export class GridWithSelectionFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    @ViewChild('gridSelection4', { read: IgxGridComponent, static: true })
    public gridSelection4: IgxGridComponent;

    public data = SampleTestData.productInfoData();

    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false" [height]="'400px'" [width]="'500px'" #hierarchicalGrid>
    <igx-column field="ID"></igx-column>
    <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" [height]="height" #rowIsland1 [rowSelectable]="true">
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="false" [height]="height" #rowIsland2 [rowSelectable]="true">
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class HierarchicalGridRowSelectableIslandComponent extends IgxHierarchicalGridMultiLayoutComponent { }
