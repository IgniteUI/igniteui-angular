import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
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

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

        UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownWithBlur('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownWithBlur('arrowright', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // reached the end shouldn't stay on the same cell
        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');


        UIInteractions.triggerKeyDownWithBlur('arrowleft', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', secondCell.nativeElement, true);
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

        UIInteractions.clickElement(secondCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownWithBlur('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it('should navigate between column layouts with left key', (async () => {
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

        UIInteractions.clickElement(thirdCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', thirdCell.nativeElement, true);
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

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

        UIInteractions.triggerKeyDownWithBlur('arrowup', secondCell.nativeElement, true);
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

        UIInteractions.clickElement(secondCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownWithBlur('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
    }));

    it('should navigate down and up to a cell from the same column layout according to its starting location', (async () => {
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

        UIInteractions.clickElement(secondCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownWithBlur('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
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

        UIInteractions.clickElement(thirdCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', thirdCell.nativeElement, true);
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

        UIInteractions.clickElement(thirdCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', thirdCell.nativeElement, true);
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
        const secondCell = penultRowCells[1];
        const rowIndex = parseInt(secondCell.nativeElement.getAttribute('data-rowindex'), 10);

        UIInteractions.clickElement(secondCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', fix.componentInstance.selectedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[rowIndex + 1].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
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

        UIInteractions.clickElement(secondCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowup', secondCell.nativeElement, true);
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

        UIInteractions.clickElement(thirdCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowup', thirdCell.nativeElement, true);
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

        UIInteractions.clickElement(secondCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', thirdCell.nativeElement, true);
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

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('end', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

        UIInteractions.triggerKeyDownWithBlur('home', fix.componentInstance.selectedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', fix.componentInstance.selectedCell.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownWithBlur('end', firstCell.nativeElement, true, false, false, true);
        await wait(100);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].Fax);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        UIInteractions.triggerKeyDownWithBlur('home', fix.componentInstance.selectedCell.nativeElement, true, false, false, true);
        await wait(100);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    }));

    it(`should navigate to the last cell from the layout by pressing Home/End or Ctrl + ArrowLeft/ArrowRight key
            and keep same rowStart from the first selection when last cell spans more rows`, (async () => {
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
        // last cell from first layout
        const lastCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];

        UIInteractions.clickElement(lastCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('end', lastCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        UIInteractions.triggerKeyDownWithBlur('home', fix.componentInstance.selectedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');

        UIInteractions.triggerKeyDownWithBlur('arrowright', lastCell.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', fix.componentInstance.selectedCell.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');

        UIInteractions.triggerKeyDownWithBlur('end', lastCell.nativeElement, true, false, false, true);
        await wait(100);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].Fax);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        UIInteractions.triggerKeyDownWithBlur('home', fix.componentInstance.selectedCell.nativeElement, true, false, false, true);
        await wait(100);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    }));

    it(`should navigate to the last cell from the layout by pressing Ctrl + Arrow Right key
        and then Arrow Down + Up to same cell`, (async () => {
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

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

        UIInteractions.triggerKeyDownWithBlur('arrowdown', fix.componentInstance.selectedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        UIInteractions.triggerKeyDownWithBlur('arrowup', fix.componentInstance.selectedCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it(`should navigate to the last cell from the layout by pressing Ctrl + Arrow Right key
        and then Arrow Up + Down to same cell`, (async () => {
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
        const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
        const firstCell = rows[2].queryAll(By.css(CELL_CSS_CLASS))[0];

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        firstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: false }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: false }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
    }));

    it(`should navigate to the first cell from the layout by pressing Ctrl + Arrow Left key
        and then Arrow Up + Down to same cell`, (async () => {
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
        const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
        const firstRowCell = rows[1].queryAll(By.css(CELL_CSS_CLASS));
        const lastCell = firstRowCell[firstRowCell.length - 1];

        UIInteractions.clickElement(lastCell);
        await wait();
        fix.detectChanges();

        lastCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: false }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: false }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        fix.componentInstance.selectedCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: false }));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
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
        UIInteractions.clickElement(cell);
        await wait();
        fix.detectChanges();
        const dataCols = grid.columns.filter(x => !x.columnLayout);
        // tab thorugh all data cols and check cells are selected/focused.
        for (let i = 1; i < dataCols.length; i++) {
            UIInteractions.triggerKeyDownWithBlur('Tab', cell.nativeElement, true);
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
        UIInteractions.clickElement(cell);
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
        UIInteractions.clickElement(cell);
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
        UIInteractions.triggerKeyDownWithBlur('Tab', cell.nativeElement, true);
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
        UIInteractions.clickElement(cell);
        await wait();
        fix.detectChanges();
        const dataCols = grid.columns.filter(x => !x.columnLayout);
        // tab thorugh all data cols and check cells are selected/focused.
        for (let i = 1; i < dataCols.length; i++) {
           UIInteractions.triggerKeyDownWithBlur('Tab', cell.nativeElement, true);
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
         UIInteractions.clickElement(cell);
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
        UIInteractions.clickElement(cell);
        await wait();
        fix.detectChanges();

        // shift + tab
        cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait(100);
        fix.detectChanges();
        const lastCell = grid.getCellByColumn(0, 'ContactTitle');
        expect(lastCell.focused).toBe(true);
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(600);
        // check if cell right edge is visible
        const diff = lastCell.nativeElement.getBoundingClientRect().right + 1 - grid.tbody.nativeElement.getBoundingClientRect().right;
        expect(diff).toBe(0);
     });

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

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowleft', secondCell.nativeElement, true);
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

        UIInteractions.clickElement(firstCell);

        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowleft', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
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

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

        UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowright', secondCell.nativeElement, true);
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
        setupGridScrollDetection(fix, grid);
        fix.detectChanges();

        // focus 3rd row, first cell
        let cell = grid.getCellByColumn(2, 'ContactName');
        UIInteractions.clickElement(cell);
        fix.detectChanges();

        // arrow down
        UIInteractions.triggerKeyDownWithBlur('arrowdown', cell.nativeElement, true);
        await wait(DEBOUNCETIME * 2);
        fix.detectChanges();

        // check next cell is focused and is fully in view
        cell = grid.getCellByColumn(2, 'Phone');
        expect(cell.focused).toBe(true);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(50);
        let diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        expect(diff).toBe(0);

        // focus 1st row, 2nd cell
        cell = grid.getCellByColumn(0, 'Phone');
        UIInteractions.clickElement(cell);
        fix.detectChanges();

        // arrow up
        UIInteractions.triggerKeyDownWithBlur('arrowup', cell.nativeElement, true);
        await wait(DEBOUNCETIME * 2);
        fix.detectChanges();

        // check next cell is focused and is fully in view
        cell = grid.getCellByColumn(0, 'ContactName');
        expect(cell.focused).toBe(true);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBe(0);
        diff = cell.nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
        expect(diff).toBe(0);

        // focus 3rd row, first cell
        cell = grid.getCellByColumn(2, 'ContactName');
        UIInteractions.clickElement(cell);
        fix.detectChanges();

        // arrow right
        UIInteractions.triggerKeyDownWithBlur('arrowright', cell.nativeElement, true);
        await wait(DEBOUNCETIME * 2);
        fix.detectChanges();

        // check next cell is focused and is fully in view
        cell = grid.getCellByColumn(2, 'Address');
        expect(cell.focused).toBe(true);
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(50);
        diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        expect(diff).toBe(0);

        // focus 1st row, Address
        cell = grid.getCellByColumn(0, 'Address');
        UIInteractions.clickElement(cell);
        fix.detectChanges();

        // arrow left
        UIInteractions.triggerKeyDownWithBlur('arrowleft', cell.nativeElement, true);
        await wait(DEBOUNCETIME * 2);
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
        UIInteractions.clickElement(cell);
        fix.detectChanges();

        // arrow right
        UIInteractions.triggerKeyDownWithBlur('arrowright', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check next cell is focused
        cell = grid.getCellByColumn(0, 'City');
        expect(cell.focused).toBe(true);
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(300);
        let diff = cell.nativeElement.getBoundingClientRect().right + 1 - grid.tbody.nativeElement.getBoundingClientRect().right;
        expect(diff).toBe(0);

        // arrow left
        UIInteractions.triggerKeyDownWithBlur('arrowleft', cell.nativeElement, true);
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

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

        UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowright', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
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

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownWithBlur('arrowdown', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownWithBlur('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowup', secondCell.nativeElement, true);
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
            dummyCell, dummyCell, thirdCell
        ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownWithBlur('arrowdown', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownWithBlur('arrowup', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowup', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
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
        [
            dummyCell, dummyCell,   dummyCell,
            dummyCell,              thirdCell,
            dummyCell, secondCell           ,
            dummyCell, dummyCell,  firstCell
        ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        UIInteractions.clickElement(firstCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownWithBlur('arrowup', firstCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowup', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

        UIInteractions.triggerKeyDownWithBlur('arrowdown', thirdCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowdown', secondCell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
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

        UIInteractions.clickElement(thirdCell);
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

        UIInteractions.triggerKeyDownWithBlur('arrowdown', thirdCell.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value)
            .toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].ContactTitle);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

        UIInteractions.triggerKeyDownWithBlur('arrowup', fix.componentInstance.selectedCell.nativeElement, true, false, false, true);
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
        UIInteractions.clickElement(cell);
        await wait();
        fix.detectChanges();

        // shift+tab
        UIInteractions.triggerKeyDownWithBlur('tab', cell.nativeElement, true, false, true);
        await wait();
        fix.detectChanges();
        // check correct cell has focus
        cell = grid.getCellByColumn(0, 'ID');
        expect(cell.focused).toBe(true);

        // tab
        UIInteractions.triggerKeyDownWithBlur('Tab', cell.nativeElement, true);
        await wait();
        fix.detectChanges();
        // check correct cell has focus
        cell = grid.getCellByColumn(0, 'Address');
        expect(cell.focused).toBe(true);


        // arrow left
        UIInteractions.triggerKeyDownWithBlur('arrowleft', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check correct cell has focus
        cell = grid.getCellByColumn(0, 'ID');
        expect(cell.focused).toBe(true);

        // arrow rigth
        UIInteractions.triggerKeyDownWithBlur('arrowright', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // check correct cell has focus
        expect(grid.getCellByColumn(0, 'Address').focused).toBe(true);
    }));

    it('should allow navigation through group rows with arrow keys starting from group row.', async () => {
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
        UIInteractions.triggerKeyDownWithBlur('arrowdown', groupRow.nativeElement, true);
        await wait();
        fix.detectChanges();

        // check first data cell is focused
        let cell = grid.getCellByColumn(1, 'ID');
        expect(cell.focused).toBe(true);

        // arrow down
        UIInteractions.triggerKeyDownWithBlur('arrowdown', cell.nativeElement, true);
        await wait();
        fix.detectChanges();

        // check next group row is focused
        groupRow = grid.getRowByIndex(2);
        expect(groupRow.focused).toBe(true);

        // arrow up
        UIInteractions.triggerKeyDownWithBlur('arrowup', groupRow.nativeElement, true);
        await wait();
        fix.detectChanges();
        // check prev cell is focused
        cell = grid.getCellByColumn(1, 'ID');
        expect(cell.focused).toBe(true);

        // arrow up
        UIInteractions.triggerKeyDownWithBlur('arrowup', cell.nativeElement, true);
        await wait();
        fix.detectChanges();

        // check first group row is focused
        groupRow = grid.getRowByIndex(0);
        expect(groupRow.focused).toBe(true);
    });

    it('should allow navigation through group rows with arrow keys starting from middle of grid row', async () => {
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
        grid.height = '700px';
        grid.groupBy({
            fieldName: 'City',
            dir: SortingDirection.Asc,
            ignoreCase: true,
            strategy: DefaultSortingStrategy.instance()
        });
        fix.detectChanges();

         const firstBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[0].queryAll(By.css(CELL_BLOCK))[1];
        const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];
        let dummyCell;
        let firstCell;
        let secondCell;
        [   dummyCell               ,
            dummyCell  , dummyCell  ,
            firstCell               ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
        [   secondCell               ,
            dummyCell  , dummyCell  ,
            dummyCell               ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

         firstCell.nativeElement.focus();
        await wait();
        fix.detectChanges();

         // arrow down
        UIInteractions.triggerKeyDownWithBlur('arrowdown', firstCell.nativeElement, true);
        await wait();
        fix.detectChanges();

         // check next group row is focused
        let groupRow = grid.getRowByIndex(2);
        expect(groupRow.focused).toBe(true);

         // arrow down
        UIInteractions.triggerKeyDownWithBlur('arrowdown', groupRow.nativeElement, true);
        await wait();
        fix.detectChanges();

         // check first data cell is focused
        expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
        expect(document.activeElement).toEqual(secondCell.nativeElement);

         // arrow up
        UIInteractions.triggerKeyDownWithBlur('arrowup', secondCell.nativeElement, true);
        await wait();
        fix.detectChanges();

         // check group row is focused
        groupRow = grid.getRowByIndex(2);
        expect(groupRow.focused).toBe(true);

         // arrow up
        UIInteractions.triggerKeyDownWithBlur('arrowup', groupRow.nativeElement, true);
        await wait();
        fix.detectChanges();

         // check last cell in group 1 layout is focused
        expect(fix.componentInstance.selectedCell.value).toEqual('Order Administrator');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
        expect(document.activeElement).toEqual(firstCell.nativeElement);
    });

    it('should allow navigation through group rows with Tab/Shift+Tab key', async () => {
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
                { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 4 }
            ]
        }];
        fix.detectChanges();
        // group by city
        const grid =  fix.componentInstance.grid;
        grid.height = '700px';
        grid.groupBy({
            fieldName: 'City',
            dir: SortingDirection.Asc,
            ignoreCase: true,
            strategy: DefaultSortingStrategy.instance()
        });
        fix.detectChanges();

         const firstBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[0].queryAll(By.css(CELL_BLOCK))[1];
        const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[0];
        let dummyCell;
        let firstCell;
        let secondCell;
        [   dummyCell               ,
            dummyCell  , dummyCell  ,
            firstCell               ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
        [   secondCell  ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

         firstCell.nativeElement.focus();
        await wait();
        fix.detectChanges();

         // Tab
        firstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false }));
        await wait();
        fix.detectChanges();

         // check next group row is focused
        let groupRow = grid.getRowByIndex(2);
        expect(groupRow.focused).toBe(true);

         // Tab
        groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false }));
        await wait();
        fix.detectChanges();

         // check first data cell is focused
        expect(fix.componentInstance.selectedCell.value).toEqual('ALFKI');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
        expect(document.activeElement).toEqual(secondCell.nativeElement);

         // Shift + Tab
        secondCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait();
        fix.detectChanges();

         // check group row is focused
        groupRow = grid.getRowByIndex(2);
        expect(groupRow.focused).toBe(true);

         // Shift + Tab
        groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait();
        fix.detectChanges();

         // check last cell in group 1 layout is focused
        expect(fix.componentInstance.selectedCell.value).toEqual('Order Administrator');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
        expect(document.activeElement).toEqual(firstCell.nativeElement);
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

        UIInteractions.clickElement(firstCell);
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

    describe('Pinning', () => {
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

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

            UIInteractions.triggerKeyDownWithBlur('arrowleft', fix.componentInstance.selectedCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
        }));

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

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            // arrow right
            UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            // check if first unpinned cell is focused and is in view
            let firstUnpinnedCell = grid.getCellByColumn(0, 'ContactName');
            expect(firstUnpinnedCell.focused).toBe(true);
            let diff = firstUnpinnedCell.nativeElement.getBoundingClientRect().left -
            grid.pinnedWidth - grid.tbody.nativeElement.getBoundingClientRect().left;
            expect(diff).toBe(0);

            // arrow left
            UIInteractions.triggerKeyDownWithBlur('arrowleft', firstUnpinnedCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(firstCell.focused).toBe(true);

            // scroll right
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 800;
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('tab', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            firstUnpinnedCell = grid.getCellByColumn(0, 'ContactName');
            expect(firstUnpinnedCell.focused).toBe(true);
            diff = firstUnpinnedCell.nativeElement.getBoundingClientRect().left -
            grid.pinnedWidth - grid.tbody.nativeElement.getBoundingClientRect().left;
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

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

            UIInteractions.triggerKeyDownWithBlur('arrowleft', fix.componentInstance.selectedCell.nativeElement, true);
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
            const secondCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

            UIInteractions.clickElement(secondCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('End', secondCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

            UIInteractions.triggerKeyDownWithBlur('Home', fix.componentInstance.selectedCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
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
            const secondCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

            UIInteractions.clickElement(secondCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowright', secondCell.nativeElement, true, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

            UIInteractions.triggerKeyDownWithBlur('arrowleft', fix.componentInstance.selectedCell.nativeElement, true,
                false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
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

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            expect(document.activeElement).toEqual(secondCell.nativeElement);

            UIInteractions.triggerKeyDownWithBlur('arrowdown', secondCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');
            expect(document.activeElement).toEqual(thirdCell.nativeElement);
        });

        it('should navigate left from unpinned to pinned area when pinning second block in template', async() => {
            const fix = TestBed.createComponent(ColumnLayoutTestComponent);
            fix.componentInstance.colGroups = [
                {
                    group: 'group1',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                },
                {
                    group: 'group2',
                    pinned: true,
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
            const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
            const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
            let dummyCell;
            let firstCell;
            let secondCell;
            [   secondCell
                                        ,
                dummyCell  , dummyCell ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
            [   dummyCell               ,
                firstCell  , dummyCell  ,
                dummyCell               ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowleft', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            expect(document.activeElement).toEqual(secondCell.nativeElement);
        });

        it('should navigate down to next row inside pinned area when pinning second block in template', async() => {
            const fix = TestBed.createComponent(ColumnLayoutTestComponent);
            fix.componentInstance.colGroups = [
                {
                    group: 'group1',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                },
                {
                    group: 'group2',
                    pinned: true,
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
            const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
            const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[0];
            let dummyCell;
            let firstCell;
            let secondCell;
            [   dummyCell               ,
                firstCell  , dummyCell ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
            [   secondCell               ,
                dummyCell  , dummyCell ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowdown', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].City);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            expect(document.activeElement).toEqual(secondCell.nativeElement);
        });

        it('should navigate down to next row inside unpinned area when pinning second block in template', async() => {
            const fix = TestBed.createComponent(ColumnLayoutTestComponent);
            fix.componentInstance.colGroups = [
                {
                    group: 'group1',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                },
                {
                    group: 'group2',
                    pinned: true,
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
            const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
            const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];
            let dummyCell;
            let firstCell;
            let secondCell;
            [   firstCell               ,
                secondCell  , dummyCell ,
                firstCell               ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
            [   secondCell               ,
                dummyCell  , dummyCell  ,
                dummyCell               ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowdown', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            expect(document.activeElement).toEqual(secondCell.nativeElement);
        });

        it('should navigate up to next row inside pinned area when pinning second block in template', async() => {
            const fix = TestBed.createComponent(ColumnLayoutTestComponent);
            fix.componentInstance.colGroups = [
                {
                    group: 'group1',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                },
                {
                    group: 'group2',
                    pinned: true,
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
            const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
            const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[0];
            let dummyCell;
            let firstCell;
            let secondCell;
            [   dummyCell               ,
                secondCell  , dummyCell ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
            [   firstCell               ,
                dummyCell  , dummyCell ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowup', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Region);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('Region');
            expect(document.activeElement).toEqual(secondCell.nativeElement);
        });


        it('should navigate up to next row inside unpinned area when pinning second block in template', async() => {
            const fix = TestBed.createComponent(ColumnLayoutTestComponent);
            fix.componentInstance.colGroups = [
                {
                    group: 'group1',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                },
                {
                    group: 'group2',
                    pinned: true,
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
            const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
            const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];
            let dummyCell;
            let firstCell;
            let secondCell;
            [   dummyCell               ,
                dummyCell  , dummyCell  ,
                secondCell              ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
            [   firstCell               ,
                dummyCell  , dummyCell  ,
                dummyCell               ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowup', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');
            expect(document.activeElement).toEqual(secondCell.nativeElement);
        });

        it('should navigate up to next row inside unpinned area when pinning second block in template', async() => {
            const fix = TestBed.createComponent(ColumnLayoutTestComponent);
            fix.componentInstance.colGroups = [
                {
                    group: 'group1',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 },
                    ]
                },
                {
                    group: 'group2',
                    pinned: true,
                    columns: [
                        { field: 'Col1', rowStart: 1, colStart: 1 },
                        { field: 'Col2', rowStart: 1, colStart: 2 },
                        { field: 'Col3', rowStart: 1, colStart: 3 },
                        { field: 'City', rowStart: 2, colStart: 1, colEnd: 4, width: '400px' },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 4 }
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
            fix.componentInstance.grid.width = '1000px';
            fix.detectChanges();
            const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
            const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[2];
            let dummyCell;
            let firstCell;
            let secondCell;
            [   dummyCell               ,
                dummyCell  , firstCell  ,
                dummyCell              ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
            [   dummyCell,
                secondCell,
                dummyCell   ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

            UIInteractions.clickElement(firstCell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('arrowright', firstCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');
            expect(document.activeElement).toEqual(secondCell.nativeElement);
        });
    });

    it('shift+tab navigation should go through edit row buttons when navigating in row edit mode. ', async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [
            {
                group: 'group1',
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px', editable: true },
                    { field: 'ContactName', rowStart: 2, colStart: 1, editable: true  },
                    { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true  },
                    { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true  }
                ]
            },
            {
                group: 'group2',
                columns: [
                    { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                    { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                ]
            },
            {
                group: 'group3',
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                    { field: 'Fax', rowStart: 2, colStart: 1, editable: true  },
                    { field: 'ID', rowStart: 3, colStart: 1, editable: true  }
                ]
            }
        ];
        const grid = fix.componentInstance.grid;
        grid.primaryKey = 'ID';
        grid.rowEditable = true;
        fix.detectChanges();

        let targetCell = grid.getCellByColumn(0, 'CompanyName');
        targetCell.nativeElement.focus();
        fix.detectChanges();
        targetCell.onKeydownEnterEditMode();
        fix.detectChanges();
        await wait(100);

        const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
        const doneButtonElement = rowEditingBannerElement.lastElementChild;
        const cancelButtonElement = rowEditingBannerElement.firstElementChild;

        // shift+tab into Done button
        UIInteractions.triggerKeyDownWithBlur('tab', targetCell.nativeElement, true, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(doneButtonElement);

        // shift+ tab into Cancel
        UIInteractions.triggerKeyDownWithBlur('tab', doneButtonElement, true, false, true);
        fix.detectChanges();

        // shift+ tab into last cell
        UIInteractions.triggerKeyDownWithBlur('tab', cancelButtonElement, true, false, true);
        await wait(100);
        fix.detectChanges();

        targetCell = grid.getCellByColumn(0, 'ID');
        expect(targetCell.focused).toBe(true);
    });

    it('tab navigation should should skip non-editable cells when navigating in row edit mode. ', async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [
            {
                group: 'group1',
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px', editable: true },
                    { field: 'ContactName', rowStart: 2, colStart: 1, editable: false  },
                    { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true  },
                    { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true  }
                ]
            },
            {
                group: 'group2',
                columns: [
                    { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                    { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                ]
            },
            {
                group: 'group3',
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                    { field: 'Fax', rowStart: 2, colStart: 1, editable: true  },
                    { field: 'ID', rowStart: 3, colStart: 1, editable: true  }
                ]
            }
        ];
        const grid = fix.componentInstance.grid;
        grid.primaryKey = 'ID';
        grid.rowEditable = true;
        fix.detectChanges();

        let cell = grid.getCellByColumn(0, 'CompanyName');
        cell.nativeElement.focus();
        fix.detectChanges();
        cell.onKeydownEnterEditMode();
        await wait(DEBOUNCETIME);
        fix.detectChanges();
        const order = ['CompanyName', 'City', 'Phone', 'ContactTitle'];
        // tab through cols and check order is correct - ContactName should be skipped.
        for (let i = 1; i < order.length; i++) {
            UIInteractions.triggerKeyDownWithBlur('Tab', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            cell = grid.getCellByColumn(0, order[i]);
            expect(cell.editMode).toBe(true);
        }

        // shift+tab through  cols and check order is correct - ContactName should be skipped.
        for (let j = order.length - 2; j >= 0; j--) {
            UIInteractions.triggerKeyDownWithBlur('tab', cell.nativeElement, true, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            cell = grid.getCellByColumn(0, order[j]);
            expect(cell.editMode).toBe(true);
        }
    });

    it('Shift + tab navigation should scroll to the appropriate cell', async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [
            {
                group: 'group1', pinned: true,
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px', editable: true },
                    { field: 'ContactName', rowStart: 2, colStart: 1, editable: false  },
                    { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true  },
                    { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true  }
                ]
            },
            {
                group: 'group2',
                columns: [
                    { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                    { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                ]
            },
            {
                group: 'group3',
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                    { field: 'Fax', rowStart: 2, colStart: 1, editable: true  },
                    { field: 'ID', rowStart: 3, colStart: 1, editable: true  }
                ]
            }
        ];
        fix.componentInstance.grid.width = '500px';
        fix.detectChanges();

        const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
        const firstRowCells = rows[1].queryAll(By.css(CELL_CSS_CLASS));
        const secondRowCells = rows[2].queryAll(By.css(CELL_CSS_CLASS));

        UIInteractions.clickElement(secondRowCells[0]);
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('tab', secondRowCells[0].nativeElement, true, false, true);
        await wait(100);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
        expect(document.activeElement).toEqual(firstRowCells[firstRowCells.length - 1].nativeElement);
    });

    it('navigateTo method should work in multi-row layout grid.', async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        fix.componentInstance.colGroups = [
            {
                group: 'group1',
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, editable: true },
                    { field: 'ContactName', rowStart: 2, colStart: 1, editable: false, width: '100px'  },
                    { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true, width: '100px'  },
                    { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true, width: '100px'  }
                ]
            },
            {
                group: 'group2',
                columns: [
                    { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                    { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                ]
            },
            {
                group: 'group3',
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                    { field: 'Fax', rowStart: 2, colStart: 1, editable: true, width: '200px' },
                    { field: 'ID', rowStart: 3, colStart: 1, editable: true, width: '200px'  }
                ]
            }
        ];
        const grid = fix.componentInstance.grid;
        grid.width = '500px';
        setupGridScrollDetection(fix, grid);
        fix.detectChanges();

        // navigate down to cell in a row that is in the DOM but is not in view (half-visible row)
        let col = grid.getColumnByName('ContactTitle');
        grid.navigateTo(2, col.visibleIndex);

        await wait(DEBOUNCETIME);
        fix.detectChanges();
        // cell should be at bottom of grid
        let cell =  grid.getCellByColumn(2, 'ContactTitle');
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(50);
        let diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        // there is 2px border at the bottom now
        expect(diff).toBe(0);

        // navigate up to cell in a row that is in the DOM but is not in view (half-visible row)
        col = grid.getColumnByName('CompanyName');
        grid.navigateTo(0, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();
        // cell should be at top of grid
        cell =  grid.getCellByColumn(0, 'CompanyName');
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBe(0);
        diff = cell.nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
        expect(diff).toBe(0);

        // navigate to cell in a row is not in the DOM
        col = grid.getColumnByName('CompanyName');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();
        // cell should be at bottom of grid
        cell =  grid.getCellByColumn(10, 'CompanyName');
        expect(grid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(50 * 10);
        diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        // there is 2px border at the bottom now
        expect(diff).toBe(0);

        // navigate right to cell in column that is in DOM but is not in view
        col = grid.getColumnByName('City');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at right edge of grid
        cell =  grid.getCellByColumn(10, 'City');
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(100);
        // check if cell right edge is visible
        diff = cell.nativeElement.getBoundingClientRect().right + 1 - grid.tbody.nativeElement.getBoundingClientRect().right;
        expect(diff).toBe(0);

        // navigate left to cell in column that is in DOM but is not in view
        col = grid.getColumnByName('CompanyName');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at left edge of grid
        cell =  grid.getCellByColumn(10, 'CompanyName');
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBe(0);
        // check if cell right left is visible
        diff = cell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
        expect(diff).toBe(0);

        // navigate to cell in column that is not in DOM

        col = grid.getColumnByName('ID');
        grid.navigateTo(9, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at right edge of grid
        cell =  grid.getCellByColumn(9, 'ID');
        expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(250);
        // check if cell right right is visible
        diff = cell.nativeElement.getBoundingClientRect().right + 1 - grid.tbody.nativeElement.getBoundingClientRect().right;
        expect(diff).toBe(0);

    });
});

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" (onSelection)="cellSelected($event)">
        <igx-column-layout *ngFor='let group of colGroups' [hidden]='group.hidden' [pinned]='group.pinned' [field]='group.group'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field' [editable]='col.editable'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class ColumnLayoutTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
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
