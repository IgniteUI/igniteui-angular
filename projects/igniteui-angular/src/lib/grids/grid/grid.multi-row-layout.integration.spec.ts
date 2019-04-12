import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './grid.module';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { ViewChild, Component } from '@angular/core';
import { verifyLayoutHeadersAreAligned, verifyDOMMatchesLayoutSettings } from '../../test-utils/helper-utils.spec';

describe('IgxGrid - multi-row-layout Integration - ', () => {
    configureTestSuite();
    let fixture;
    let grid: IgxGridComponent;
    let colGroups: Array<any>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnLayoutPinningTestComponent
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('Pinning ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(ColumnLayoutPinningTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            colGroups = fixture.componentInstance.colGroups;
        }));

        it('should allow pinning/unpinning a whole group.', () => {
            // group 1 should be pinned - all child columns should be pinned
            expect(grid.getColumnByName('PostalCode').pinned).toBeTruthy();
            expect(grid.getColumnByName('City').pinned).toBeTruthy();
            expect(grid.getColumnByName('Country').pinned).toBeTruthy();
            expect(grid.getColumnByName('Address').pinned).toBeTruthy();

            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();

            const gridFirstRow = grid.rowList.first;
            const firstRowCells = gridFirstRow.cells.toArray();
            const headerCells = grid.headerGroups.first.children.toArray();

            // headers are aligned to cells
            verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

            // verifyDOMMatchesLayoutSettings(gridFirstRow, fixture.componentInstance.colGroups);
        });
        it('should pin/unpin whole group if a single child column is pinned/unpinned.', () => {});
        it('should not allow pinning if group width exceeds max allowed.', () => {});
        it('should work with horizontal virtualization on the unpinned groups.', () => {});
    });
});

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px">
        <igx-column-layout *ngFor='let group of colGroups' [pinned]='group.pinned'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width' [pinned]='col.pinned'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class ColumnLayoutPinningTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;
    cols1: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1},
        { field: 'CompanyName', rowStart: 1, colStart: 2},
        { field: 'ContactName', rowStart: 1, colStart: 3},
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 'span 2', colEnd : 'span 3'},
    ];
    cols2: Array<any> = [
        { field: 'PostalCode', rowStart: 1, colStart: 1, colEnd: 'span 2' },
        { field: 'City', rowStart: 2, colStart: 1},
        { field: 'Country', rowStart: 2, colStart: 2},
        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 'span 2'}
    ];
    colGroups = [
        {
            group: 'group1',
            pinned: false,
            columns: this.cols1
        },
        {
            group: 'group2',
            pinned: true,
            columns: this.cols2
        }
    ];
    data = SampleTestData.contactInfoDataFull();
}

