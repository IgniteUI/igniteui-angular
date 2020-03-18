import { DebugElement, ViewChild, Component } from '@angular/core';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { ColumnPinningPosition, RowPinningPosition } from '../common/enums';
import { IPinningConfig } from '../common/grid.interface';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { verifyLayoutHeadersAreAligned, verifyDOMMatchesLayoutSettings } from '../../test-utils/helper-utils.spec';

describe('Row Pinning #grid', () => {
    const FIXED_ROW_CONTAINER = '.igx-grid__tr--pinned ';
    configureTestSuite();
    let fix;
    let grid: IgxGridComponent;

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridRowPinningComponent,
                GridRowPinningWithMRLComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        })
        .compileComponents();
    }));

    describe('', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should pin rows to top.', () => {
            // pin 2nd data row
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.getRowByIndex(0).nativeElement);

            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(2).rowID).toBe(fix.componentInstance.data[2]);

            // pin 3rd data row
            grid.pinRow(fix.componentInstance.data[2]);
            fix.detectChanges();

            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[1].context.rowID).toBe(fix.componentInstance.data[2]);

            expect(grid.getRowByIndex(2).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(3).rowID).toBe(fix.componentInstance.data[3]);

            // 2 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(2 * grid.renderedRowHeight + 2);
            const expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 -  grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should pin rows to bottom.', () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fix.detectChanges();

            // pin 2nd
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].context.index).toBe(fix.componentInstance.data.length - 1);
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(grid.getRowByIndex(fix.componentInstance.data.length - 1).nativeElement);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[2]);

            // pin 1st
            grid.pinRow(fix.componentInstance.data[0]);
            fix.detectChanges();

            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[1].context.rowID).toBe(fix.componentInstance.data[0]);

            // check last pinned is fully in view
            const last = pinRowContainer[0].children[1].context.nativeElement;
            expect(last.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom).toBe(0);

            // 2 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(2 * grid.renderedRowHeight + 2);
            const expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 -  grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should emit onRowPinning on pin/unpin.', () => {
            spyOn(grid.onRowPinning, 'emit').and.callThrough();

            let row = grid.getRowByIndex(0);
            let rowID = row.rowID;
            row.pin();
            fix.detectChanges();

            expect(grid.onRowPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowPinning.emit).toHaveBeenCalledWith({
                row: row,
                rowID: rowID,
                insertAtIndex: undefined,
                isPinned: true
            });

            row = grid.getRowByIndex(0);
            rowID = row.rowID;
            row.unpin();
            fix.detectChanges();

            expect(grid.onRowPinning.emit).toHaveBeenCalledTimes(2);
        });

        it('should pin/unpin via grid API methods.', () => {
            // pin 2nd row
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].context.index).toBe(0);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.getRowByIndex(0).nativeElement);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[0]);

            // unpin 2nd row
            grid.unpinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(0);
            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(0);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should pin/unpin via row API methods.', () => {
            // pin 2nd row
            let row = grid.getRowByIndex(1);
            row.pin();
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[0]);

            // unpin
            row = grid.getRowByIndex(0);
            row.unpin();
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(0);
            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(0);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should pin/unpin via row pinned setter.', () => {
              // pin 2nd row
              let row = grid.getRowByIndex(1);
              row.pinned = true;
              fix.detectChanges();

              expect(grid.pinnedRecords.length).toBe(1);
              let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
              expect(pinRowContainer.length).toBe(1);
              expect(pinRowContainer[0].children.length).toBe(1);
              expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);

              expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[1]);
              expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[0]);

              // unpin
              row = grid.getRowByIndex(0);
              row.pinned = false;
              fix.detectChanges();

              expect(grid.pinnedRecords.length).toBe(0);
              pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
              expect(pinRowContainer.length).toBe(0);

              expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[0]);
              expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[1]);
        });
    });
    describe('Row pinning with MRL', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningWithMRLComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should pin/unpin correctly to top', () => {
            // pin
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.getRowByIndex(0).nativeElement);

            expect(grid.getRowByIndex(0).pinned).toBeTruthy();
            const gridPinnedRow = grid.pinnedRows[0];
            const pinnedRowCells = gridPinnedRow.cells.toArray();
            const headerCells = grid.headerGroups.first.children.toArray();

            // headers are aligned to cells
            verifyLayoutHeadersAreAligned(headerCells, pinnedRowCells);
            verifyDOMMatchesLayoutSettings(gridPinnedRow, fix.componentInstance.colGroups);

            // unpin
            const row = grid.pinnedRows[0];
            row.pinned = false;
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(0);
            expect(row.pinned).toBeFalsy();

            const gridUnpinnedRow = grid.getRowByIndex(1);
            const unpinnedRowCells = gridUnpinnedRow.cells.toArray();

            verifyLayoutHeadersAreAligned(headerCells, unpinnedRowCells);
            verifyDOMMatchesLayoutSettings(gridUnpinnedRow, fix.componentInstance.colGroups);
        });

        it('should pin/unpin correctly to bottom', () => {

            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fix.detectChanges();

            // pin
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(grid.getRowByIndex(fix.componentInstance.data.length - 1).nativeElement);

            expect(grid.getRowByIndex(fix.componentInstance.data.length - 1).pinned).toBeTruthy();
            const gridPinnedRow = grid.pinnedRows[0];
            const pinnedRowCells = gridPinnedRow.cells.toArray();
            const headerCells = grid.headerGroups.first.children.toArray();

            // headers are aligned to cells
            verifyLayoutHeadersAreAligned(headerCells, pinnedRowCells);
            verifyDOMMatchesLayoutSettings(gridPinnedRow, fix.componentInstance.colGroups);

            // unpin
            const row = grid.pinnedRows[0];
            row.pinned = false;
            fix.detectChanges();

            expect(grid.pinnedRecords.length).toBe(0);
            expect(row.pinned).toBeFalsy();

            const gridUnpinnedRow = grid.getRowByIndex(1);
            const unpinnedRowCells = gridUnpinnedRow.cells.toArray();

            verifyLayoutHeadersAreAligned(headerCells, unpinnedRowCells);
            verifyDOMMatchesLayoutSettings(gridUnpinnedRow, fix.componentInstance.colGroups);
        });
    });
});

@Component({
    template: `
        <igx-grid
            [pinning]='pinningConfig'
            [width]='"800px"'
            [height]='"500px"'
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class GridRowPinningComponent {
    public data = SampleTestData.contactInfoDataFull();
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Top };

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" [pinning]='pinningConfig'>
        <igx-column-layout *ngFor='let group of colGroups'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class GridRowPinningWithMRLComponent extends GridRowPinningComponent {
    cols: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1 },
        { field: 'CompanyName', rowStart: 1, colStart: 2 },
        { field: 'ContactName', rowStart: 1, colStart: 3 },
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
    ];
    colGroups = [
        {
            group: 'group1',
            columns: this.cols
        }
    ];
}
