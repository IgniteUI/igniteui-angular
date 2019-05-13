import { Component, ViewChild, TemplateRef } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule, IgxGridCellComponent, IGridCellEventArgs } from './index';
import { IgxGridComponent } from './grid.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';
const ROW_CSS_CLASS = '.igx-grid__tr';

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
});

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" (onSelection)="cellSelected($event)">
        <igx-column-layout *ngFor='let group of colGroups' [hidden]='group.hidden' [pinned]='group.hidden'>
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
