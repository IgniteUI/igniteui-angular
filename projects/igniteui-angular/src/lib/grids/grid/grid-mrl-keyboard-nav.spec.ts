import { Component, ViewChild, TemplateRef } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule, IgxGridCellComponent, IGridCellEventArgs } from './index';
import { IgxGridComponent } from './grid.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';
const ROW_CSS_CLASS = '.igx-grid__tr';
const CELL_BLOCK = '.igx-grid__mrl-block';

describe('IgxGrid Multi Row Layout - Keyboard navigation', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnLayoutTestComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    it('should navigate through a single layout with right and left arrow keys', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.detectChanges();

        let firstCell;
        let secondCell;
        let thirdCell;
        let fourthCell;
        [firstCell, secondCell, thirdCell, fourthCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // reached the end shouldn't stay on the same cell
        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');


        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
    }));

    it('should navigate between column layouts with right arrow key', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 1 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1, rowEnd: 3 }
            ]
        }];
        fix.detectChanges();

        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        secondCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it('should navigate between column layouts with right left key', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, rowEnd: 3 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 1 }
            ]
        }];
        fix.detectChanges();

        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        thirdCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
    }));

    it('should navigate down and up to a cell from the same column layout from a cell with bigger col span', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 }
            ]
        }];
        fix.detectChanges();
        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
    }));

    it('should navigate down and up to a cell from the same column layout to a cell with bigger col span', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1 },
                { field: 'City', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
            ]
        }];
        fix.detectChanges();
        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        secondCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it('should navigate down and up to a cell from the same column layout acording to its starting location', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1 },
                { field: 'City', rowStart: 1, colStart: 2, colEnd: 4 },
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 3 }
            ]
        }];
        fix.detectChanges();
        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        secondCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it('should allow navigating down to a cell from the next row', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1 },
                { field: 'City', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
            ]
        }];
        fix.detectChanges();
        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        thirdCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it('should allow navigating down to a cell from the next row with hidden column layout', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            hidden: true,
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1 },
                { field: 'City', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
            ]
        }];
        fix.detectChanges();
        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        thirdCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it('should allow navigating down with scrolling', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1 },
                { field: 'City', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
            ]
        }];
        fix.detectChanges();
        const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
        const penultRowCells = rows[rows.length - 2].queryAll(By.css(CELL_CSS_CLASS));
        const lastCell = penultRowCells[penultRowCells.length - 1];
        const rowIndex = parseInt(lastCell.nativeElement.getAttribute('data-rowindex'), 10);

        lastCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', lastCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[rowIndex + 1].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it('should retain the focus when the first cell is reached', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1 },
                { field: 'City', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
            ]
        }];
        fix.detectChanges();
        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        secondCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
    }));

    it('should navigate up correctly', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 }
            ]
        }];
        fix.detectChanges();
        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        thirdCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
    }));

    it('navigate to right and left with hidden columns', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            hidden: true,
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 }
            ]
        }];
        fix.detectChanges();
        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        secondCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it('should navigate to the last cell from the layout by pressing Home/End or Ctrl + ArrowLeft/ArrowRight key', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            hidden: true,
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'ContactName', rowStart: 2, colStart: 1 },
                { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1 },
                { field: 'PostalCode', rowStart: 3, colStart: 2 }
            ]
        }, {
            group: 'group4',
            columns: [
                { field: 'Country', rowStart: 1, colStart: 1 },
                { field: 'Phone', rowStart: 1, colStart: 2 },
                { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
            ]
        }];
        fix.detectChanges();
        const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        firstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        firstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        firstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }));
        await wait(100);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].Fax);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true }));
        await wait(100);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    }));

    it('should navigate from pinned to unpinned area and backwards', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            pinned: true,
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'ContactName', rowStart: 2, colStart: 1 },
                { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1 },
                { field: 'PostalCode', rowStart: 3, colStart: 2 }
            ]
        }];
        fix.detectChanges();
        const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', fix.componentInstance.selectedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    }));

    it(`Tab Navigation should move through each cell from the row once,
      moving through all cells with same rowStart, following the columnStart and column layout order,
      before moving on to the next rowStart.`, (async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        fix.detectChanges();
        const grid =  fix.componentInstance.grid;
        const order = ['ID', 'ContactName', 'Address', 'Phone', 'City', 'ContactTitle', 'PostalCode'];
        // check visible indexes are correct
        expect(grid.getCellByColumn(0, 'ID').visibleColumnIndex).toBe(0);
        expect(grid.getCellByColumn(0, 'ContactName').visibleColumnIndex).toBe(1);
        expect(grid.getCellByColumn(0, 'Address').visibleColumnIndex).toBe(2);
        expect(grid.getCellByColumn(0, 'Phone').visibleColumnIndex).toBe(3);
        expect(grid.getCellByColumn(0, 'City').visibleColumnIndex).toBe(4);
        expect(grid.getCellByColumn(0, 'ContactTitle').visibleColumnIndex).toBe(5);
        expect(grid.getCellByColumn(0, 'PostalCode').visibleColumnIndex).toBe(6);

        // focus 1st
        let cell = grid.getCellByColumn(0, 'ID');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();
        const dataCols = grid.columns.filter(x => !x.columnLayout);
        // tab thorugh all data cols and check cells are selected/focused.
        for (let i = 1; i < dataCols.length; i++) {
            UIInteractions.triggerKeyDownEvtUponElem('Tab', cell.nativeElement, true);
            await wait();
            fix.detectChanges();
            cell = grid.getCellByColumn(0, order[i]);
            expect(cell.focused).toBe(true);
            expect(cell.visibleColumnIndex).toBe(i);
        }
    }));

    it(`Shift+Tab Navigation should move through each cell from the row once, moving through all cells with same rowStart,
     following the columnStart and column layout setup order,
     before moving on to the previous cell with smaller rowStart.`, (async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        fix.detectChanges();
        const grid =  fix.componentInstance.grid;

        // focus last
        let cell = grid.getCellByColumn(0, 'PostalCode');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();
        const order = ['ID', 'ContactName', 'Address', 'Phone', 'City', 'ContactTitle', 'PostalCode'];

        const dataCols = grid.columns.filter(x => !x.columnLayout);
        // shift+tab through all data cols and check cells are selected/focused.
        for (let i = dataCols.length - 1; i >= 0; i--) {
            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
            await wait();
            fix.detectChanges();
            cell = grid.getCellByColumn(0, order[i]);
            expect(cell.focused).toBe(true);
            expect(cell.visibleColumnIndex).toBe(i);
        }
     }));

     it('Tab/Shift+Tab Navigation should allow moving to next/prev row when at last/first cell.',  (async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        fix.detectChanges();
        const grid =  fix.componentInstance.grid;

        // focus 1st cell in 2nd row
        let cell = grid.getCellByColumn(1, 'ID');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        // shift + tab into prev row
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait();
        fix.detectChanges();

        cell = grid.getCellByColumn(0, 'PostalCode');
        expect(cell.focused).toBe(true);
        expect(cell.visibleColumnIndex).toBe(6);

        // tab into next row
        UIInteractions.triggerKeyDownEvtUponElem('Tab', cell.nativeElement, true);
        await wait();
        fix.detectChanges();

        cell = grid.getCellByColumn(1, 'ID');
        expect(cell.focused).toBe(true);
        expect(cell.visibleColumnIndex).toBe(0);
     }));

     it('Tab Navigation should work in grid with horizontal virtualization.',  (async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        const grid =  fix.componentInstance.grid;
        grid.columnWidth = '300px';
        grid.width = '300px';
        setupGridScrollDetection(fix, grid);
        fix.detectChanges();

        const order = ['ID', 'ContactName', 'Address', 'Phone', 'City', 'ContactTitle', 'PostalCode'];

        // focus 1st
        let cell = grid.getCellByColumn(0, 'ID');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();
        const dataCols = grid.columns.filter(x => !x.columnLayout);
        // tab thorugh all data cols and check cells are selected/focused.
        for (let i = 1; i < dataCols.length; i++) {
           UIInteractions.triggerKeyDownEvtUponElem('Tab', cell.nativeElement, true);
           await wait(100);
           fix.detectChanges();
           cell = grid.getCellByColumn(0, order[i]);
           expect(cell.focused).toBe(true);
           expect(cell.visibleColumnIndex).toBe(i);
       }
     }));

     it('Shift+Tab Navigation should work in grid with horizontal virtualization.',  (async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        const grid =  fix.componentInstance.grid;
        setupGridScrollDetection(fix, grid);
        grid.columnWidth = '300px';
        grid.width = '300px';
        fix.detectChanges();
        const forOfDir = grid.headerContainer;
        forOfDir.scrollTo(2);
        await wait(200);
        fix.detectChanges();
        const dataCols = grid.columns.filter(x => !x.columnLayout);
        const order = ['ID', 'ContactName', 'Address', 'Phone', 'City', 'ContactTitle', 'PostalCode'];
         // focus last
         let cell = grid.getCellByColumn(0, 'PostalCode');
         cell.nativeElement.dispatchEvent(new Event('focus'));
         fix.detectChanges();
         // shift+tab through all data cols and check cells are selected/focused.
         for (let j = dataCols.length - 1; j >= 0; j--) {
             cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
             await wait(100);
             fix.detectChanges();
             cell = grid.getCellByColumn(0, order[j]);
             expect(cell.focused).toBe(true);
             expect(cell.visibleColumnIndex).toBe(j);
         }
     }));

     it('Shift+Tab Navigation should scroll last cell fully in view.',  async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }];
        const grid =  fix.componentInstance.grid;
        setupGridScrollDetection(fix, grid);
        grid.columnWidth = '300px';
        grid.width = '300px';
        fix.detectChanges();

        // focus 1st in 2nd row
        const cell = grid.getCellByColumn(1, 'ID');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        // shift + tab
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait(100);
        fix.detectChanges();
        const lastCell = grid.getCellByColumn(0, 'ContactTitle');
        expect(lastCell.focused).toBe(true);
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBe(600);
        const diff = lastCell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
        expect(diff).toBe(0);
     });

    it('should navigate to unpinned area when the column layout is bigger than the display container', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            pinned: true,
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                { field: 'ContactName', rowStart: 2, colStart: 1 },
                { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                { field: 'Region', rowStart: 3, colStart: 1 },
                { field: 'PostalCode', rowStart: 3, colStart: 2 }
            ]
        }];
        fix.componentInstance.grid.width = '600px';
        fix.detectChanges();
        const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', fix.componentInstance.selectedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    }));

    it('should navigate from pinned to unpinned area and backwards using Home/End', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            pinned: true,
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'ContactName', rowStart: 2, colStart: 1 },
                { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1 },
                { field: 'PostalCode', rowStart: 3, colStart: 2 }
            ]
        }];
        fix.detectChanges();
        const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('End', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownEvtUponElem('Home', fix.componentInstance.selectedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    }));

    it('should navigate from pinned to unpinned area and backwards using Ctrl+Left/Right', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            pinned: true,
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'ContactName', rowStart: 2, colStart: 1 },
                { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group2',
            columns: [
                { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1 },
                { field: 'PostalCode', rowStart: 3, colStart: 2 }
            ]
        }];
        fix.detectChanges();
        const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        firstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    }));

    it('should navigate using Arrow Left through bigger cell with same rowStart but bigger row span', async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 3 },
                { field: 'Country', rowStart: 3, colStart: 1 },
                { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
            ]
        }];
        fix.detectChanges();

        let firstCell;
        let secondCell;
        let thirdCell;
        [thirdCell, secondCell, firstCell ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
    });

    it('should navigate using Arrow Left through bigger cell with smaller rowStart and bigger rowEnd', async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 3 },
                { field: 'Country', rowStart: 3, colStart: 1 },
                { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
            ]
        }];
        fix.detectChanges();

        let dummyCell;
        let firstCell;
        let secondCell;
        let thirdCell;
        [
            thirdCell, secondCell, dummyCell,
            dummyCell,              firstCell
        ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
    });

    it('should navigate using Arrow Right through bigger cell with same rowStart but bigger row', async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 3 },
                { field: 'Country', rowStart: 3, colStart: 1 },
                { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
            ]
        }];
        fix.detectChanges();

        let firstCell;
        let secondCell;
        let thirdCell;
        [firstCell, secondCell, thirdCell ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
    });

    it('should scroll focused cell fully in view when navigating with arrow keys and row is partially visible.', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [
        {
            group: 'group1',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        },
        {
            group: 'group2',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        },
        {
            group: 'group3',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }];
        const grid = fix.componentInstance.grid;
        grid.height = '400px';
        fix.detectChanges();

        // focus 3rd row, first cell
        let cell = grid.getCellByColumn(2, 'ContactName');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        // arrow down
        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check next cell is focused and is fully in view
        cell = grid.getCellByColumn(2, 'Phone');
        expect(cell.focused).toBe(true);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(50);
        let diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        expect(diff).toBe(0);

        // focus 1st row, 2nd cell
        cell = grid.getCellByColumn(0, 'Phone');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        // arrow up
        UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check next cell is focused and is fully in view
        cell = grid.getCellByColumn(0, 'ContactName');
        expect(cell.focused).toBe(true);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBe(0);
        diff = cell.nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
        expect(diff).toBe(0);

        // focus 3rd row, first cell
        cell = grid.getCellByColumn(2, 'ContactName');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        // arrow right
        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check next cell is focused and is fully in view
        cell = grid.getCellByColumn(2, 'Address');
        expect(cell.focused).toBe(true);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(50);
        diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        expect(diff).toBe(0);

        // focus 1st row, Address
        cell = grid.getCellByColumn(0, 'Address');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        // arrow left
        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check next cell is focused and is fully in view
        cell = grid.getCellByColumn(0, 'ContactName');
        expect(cell.focused).toBe(true);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBe(0);
        diff = cell.nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
        expect(diff).toBe(0);
    }));

    it('should scroll focused cell fully in view when navigating with arrow keys and column is partially visible.', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 5 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                { field: 'Address', rowStart: 2, colStart: 3 },
                { field: 'Country', rowStart: 2, colStart: 4 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 5 }
            ]
        }];
        const grid =  fix.componentInstance.grid;
        grid.columnWidth = '300px';
        grid.width = '300px';
        setupGridScrollDetection(fix, grid);
        fix.detectChanges();

        // focus 1st row, 2nd row cell
        let cell = grid.getCellByColumn(0, 'Phone');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fix.detectChanges();

        // arrow right
        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check next cell is focused
        cell = grid.getCellByColumn(0, 'City');
        expect(cell.focused).toBe(true);
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(300);
        let diff = cell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
        expect(diff).toBe(0);

        // arrow left
        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check next cell is focused
        cell = grid.getCellByColumn(0, 'Phone');
        expect(cell.focused).toBe(true);
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBe(0);
        diff = cell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
        expect(diff).toBe(0);
    }));

    it('should navigate using Arrow Right through bigger cell with smaller rowStart and bigger rowEnd', async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 3 },
                { field: 'Country', rowStart: 3, colStart: 1 },
                { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
            ]
        }];
        fix.detectChanges();

        let dummyCell;
        let firstCell;
        let secondCell;
        let thirdCell;
        [
            dummyCell, secondCell, thirdCell,
            firstCell,              dummyCell
        ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
    });

    it('should navigate using Arrow Down through cell with same colStart but bigger colEnd', async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 3 },
                { field: 'Country', rowStart: 3, colStart: 1 },
                { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
            ]
        }];
        fix.detectChanges();

        let dummyCell;
        let firstCell;
        let secondCell;
        let thirdCell;
        [
            dummyCell, firstCell, dummyCell,
            dummyCell,            dummyCell,
            dummyCell, secondCell           ,
            dummyCell, thirdCell, dummyCell
        ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    });

    it('should navigate using Arrow Down through cell with smaller colStart and bigger colEnd', async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 3 },
                { field: 'Country', rowStart: 3, colStart: 1 },
                { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
            ]
        }];
        fix.detectChanges();

        let dummyCell;
        let firstCell;
        let secondCell;
        let thirdCell;
        let fourthCell;
        [
            dummyCell, fourthCell, dummyCell,
            dummyCell,              firstCell,
            dummyCell, secondCell           ,
            dummyCell, thirdCell, dummyCell
        ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    });

    it('should navigate using Arrow Up through cell with smaller colStart and bigger colEnd', async() => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 3 },
                { field: 'Country', rowStart: 3, colStart: 1 },
                { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
            ]
        }];
        fix.detectChanges();

        let dummyCell;
        let firstCell;
        let secondCell;
        let thirdCell;
        let fourthCell;
        [
            dummyCell, thirdCell, dummyCell,
            dummyCell,              dummyCell,
            dummyCell, secondCell           ,
            dummyCell, fourthCell, firstCell
        ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowup', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    });

    it('should navigate correctly by pressing Ctrl + ArrowUp/ArrowDown key', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            pinned: true,
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'ContactName', rowStart: 2, colStart: 1 },
                { field: 'ContactTitle', rowStart: 2, colStart: 2 }
            ]
        }];
        fix.detectChanges();

        let firstCell;
        let secondCell;
        let thirdCell;
        [
            firstCell, secondCell,
            thirdCell,
        ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        thirdCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

        thirdCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value)
            .toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
    }));

    it('should navigate correctly with column group is hidden.', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        fix.detectChanges();
        const grid =  fix.componentInstance.grid;
        // hide second group
        const secondGroup = grid.getColumnByName('group2');
        secondGroup.hidden = true;
        fix.detectChanges();

        // check visible indexes are correct
        expect(grid.getCellByColumn(0, 'ID').visibleColumnIndex).toBe(0);
        expect(grid.getCellByColumn(0, 'Address').visibleColumnIndex).toBe(1);
        expect(grid.getCellByColumn(0, 'PostalCode').visibleColumnIndex).toBe(2);
        // focus last
        let cell = grid.getCellByColumn(0, 'Address');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        // shift+tab
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait();
        fix.detectChanges();
        // check correct cell has focus
        cell = grid.getCellByColumn(0, 'ID');
        expect(cell.focused).toBe(true);

        // tab
        UIInteractions.triggerKeyDownEvtUponElem('Tab', cell.nativeElement, true);
        await wait();
        fix.detectChanges();
        // check correct cell has focus
        cell = grid.getCellByColumn(0, 'Address');
        expect(cell.focused).toBe(true);


        // arrow left
        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check correct cell has focus
        cell = grid.getCellByColumn(0, 'ID');
        expect(cell.focused).toBe(true);

        // arrow rigth
        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check correct cell has focus
        expect(grid.getCellByColumn(0, 'Address').focused).toBe(true);
    }));

    it('tab navigation should follow correct sequence if a column is pinned runtime.', () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        fix.detectChanges();
        const grid =  fix.componentInstance.grid;
        // hide second group
        const secondGroup = grid.getColumnByName('group2');
        secondGroup.pinned = true;
        fix.detectChanges();

        // check visible indexes are correct
        expect(grid.getCellByColumn(0, 'ContactName').visibleColumnIndex).toBe(0);
        expect(grid.getCellByColumn(0, 'ID').visibleColumnIndex).toBe(1);
        expect(grid.getCellByColumn(0, 'Address').visibleColumnIndex).toBe(2);
        expect(grid.getCellByColumn(0, 'Phone').visibleColumnIndex).toBe(3);
        expect(grid.getCellByColumn(0, 'City').visibleColumnIndex).toBe(4);
        expect(grid.getCellByColumn(0, 'ContactTitle').visibleColumnIndex).toBe(5);
        expect(grid.getCellByColumn(0, 'PostalCode').visibleColumnIndex).toBe(6);

    });

    it('should allow navigation through group rows with arrow keys.', async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        fix.detectChanges();
        // group by city
        const grid =  fix.componentInstance.grid;
        grid.groupBy({
            fieldName: 'City',
            dir: SortingDirection.Asc,
            ignoreCase: true,
            strategy: DefaultSortingStrategy.instance()
        });
        fix.detectChanges();

        let groupRow = grid.getRowByIndex(0);
        groupRow.nativeElement.focus();
        await wait();
        fix.detectChanges();

        // arrow down
        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', groupRow.nativeElement, true);
        await wait();
        fix.detectChanges();

        // check first data cell is focused
        let cell = grid.getCellByColumn(1, 'ID');
        expect(cell.focused).toBe(true);

        // arrow down
        UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true);
        await wait();
        fix.detectChanges();

        // check next group row is focused
        groupRow = grid.getRowByIndex(2);
        expect(groupRow.focused).toBe(true);

        // arrow up
        UIInteractions.triggerKeyDownEvtUponElem('arrowup', groupRow.nativeElement, true);
        await wait();
        fix.detectChanges();
        // check prev cell is focused
        cell = grid.getCellByColumn(1, 'ID');
        expect(cell.focused).toBe(true);

        // arrow up
        UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true);
        await wait();
        fix.detectChanges();

        // check first group row is focused
        groupRow = grid.getRowByIndex(0);
        expect(groupRow.focused).toBe(true);
    });

    it('tab navigation should follow correct sequence if a column is moved.', () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        fix.detectChanges();
        const grid =  fix.componentInstance.grid;
        // move second group
        const col1 = grid.getColumnByName('group3');
        const col2 = grid.getColumnByName('group1');
        grid.moveColumn(col2, col1);
        fix.detectChanges();

        // check visible indexes are correct
        expect(grid.getCellByColumn(0, 'ContactName').visibleColumnIndex).toBe(0);
        expect(grid.getCellByColumn(0, 'Address').visibleColumnIndex).toBe(1);
        expect(grid.getCellByColumn(0, 'ID').visibleColumnIndex).toBe(2);
        expect(grid.getCellByColumn(0, 'Phone').visibleColumnIndex).toBe(3);
        expect(grid.getCellByColumn(0, 'City').visibleColumnIndex).toBe(4);
        expect(grid.getCellByColumn(0, 'ContactTitle').visibleColumnIndex).toBe(5);
        expect(grid.getCellByColumn(0, 'PostalCode').visibleColumnIndex).toBe(6);

    });

    it(`should navigate to the last cell from the layout by pressing Ctrl + ArrowLeft/ArrowRight key
     in grid with horizontal virtualization`, async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        const grid =  fix.componentInstance.grid;
        grid.columnWidth = '300px';
        grid.width = '400px';
        setupGridScrollDetection(fix, grid);
        fix.detectChanges();

        let firstCell = grid.getCellByColumn(0, 'ID');

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        // ctrl+arrow right
        firstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check correct cell is focused and is fully in view
        const lastCell =  grid.getCellByColumn(0, 'Address');
        expect(lastCell.focused).toBe(true);
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(800);
        let diff = lastCell.nativeElement.getBoundingClientRect().right + 1 - grid.tbody.nativeElement.getBoundingClientRect().right;
        expect(diff).toBe(0);

        // ctrl+arrow left
        lastCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // first cell should be focused and is fully in view
        firstCell = grid.getCellByColumn(0, 'ID');
        expect(firstCell.focused).toBe(true);
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBe(0);
        diff = firstCell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
        expect(diff).toBe(0);
    });

    it('when navigating from pinned to unpinned area cell should be fully scrolled in view.', async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [{
            group: 'group1',
            // row span 3
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }, {
            group: 'group2',
            columns: [
                 // col span 2
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                // col span 2
                { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
            ]
        }, {
            group: 'group3',
            columns: [
                 // row span 2
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                { field: 'PostalCode', rowStart: 3, colStart: 1 }
            ]
        }];
        const grid =  fix.componentInstance.grid;
        grid.columnWidth = '300px';
        grid.width = '500px';
        setupGridScrollDetection(fix, grid);
        fix.detectChanges();

        // pin col
        grid.getColumnByName('ID').pinned = true;
        fix.detectChanges();

        // scroll right
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 800;
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // focus first pinned cell
        const firstCell = grid.getCellByColumn(0, 'ID');

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        // arrow right
        UIInteractions.triggerKeyDownEvtUponElem('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check if first unpinned cell is focused and is in view
        let firstUnpinnedCell = grid.getCellByColumn(0, 'ContactName');
        expect(firstUnpinnedCell.focused).toBe(true);
        let diff = firstUnpinnedCell.nativeElement.getBoundingClientRect().left -
         grid.pinnedWidth - grid.tbody.nativeElement.getBoundingClientRect().left;
        expect(diff).toBe(0);

        // arrow left
        UIInteractions.triggerKeyDownEvtUponElem('arrowleft', firstUnpinnedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(firstCell.focused).toBe(true);

        // scroll right
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 800;
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        firstCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        firstUnpinnedCell = grid.getCellByColumn(0, 'ContactName');
        expect(firstUnpinnedCell.focused).toBe(true);
        diff = firstUnpinnedCell.nativeElement.getBoundingClientRect().left -
         grid.pinnedWidth - grid.tbody.nativeElement.getBoundingClientRect().left;
        expect(diff).toBe(0);
    });

    describe('Pinning', () => {
        it('should navigate to the last block with one pinned group and unpinned area has scrollbar', async() => {
            const fix = TestBed.createComponent(ColumnLayoutTestComponent);
            fix.componentInstance.colGroups = [
                {
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                },
                {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                },
                {
                    group: 'group3',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                        { field: 'Fax', rowStart: 2, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }
            ];
            fix.componentInstance.grid.width = '600px';
            fix.detectChanges();
            const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
            const thirdBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[2];

            let secondCell;
            let thirdCell;
            let fourthCell;
            [   secondCell,
                thirdCell,
                fourthCell  ] = thirdBlock.queryAll(By.css(CELL_CSS_CLASS));
            const firstCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[0];

            fix.componentInstance.grid.parentVirtDir.getHorizontalScroll().scrollLeft = 500;
            await wait();
            fix.detectChanges();

            firstCell.nativeElement.dispatchEvent(new Event('focus'));
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            expect(document.activeElement).toEqual(secondCell.nativeElement);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', secondCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');
            expect(document.activeElement).toEqual(thirdCell.nativeElement);
        });
    });
});

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" (onSelection)="cellSelected($event)">
        <igx-column-layout *ngFor='let group of colGroups' [hidden]='group.hidden' [pinned]='group.pinned' [field]='group.group'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class ColumnLayoutTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;
    public selectedCell: IgxGridCellComponent;
    cols: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1 },
        { field: 'CompanyName', rowStart: 1, colStart: 2 },
        { field: 'ContactName', rowStart: 1, colStart: 3 },
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
    ];
    colGroups: Array<any> = [
        {
            group: 'group1',
            columns: this.cols
        }
    ];
    data = SampleTestData.contactInfoDataFull();

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
}
