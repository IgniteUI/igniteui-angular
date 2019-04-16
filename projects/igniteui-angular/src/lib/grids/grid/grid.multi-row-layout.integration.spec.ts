import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './grid.module';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { ViewChild, Component } from '@angular/core';
import { IgxColumnLayoutComponent } from './../column.component';
import { wait } from '../../test-utils/ui-interactions.spec';

fdescribe('IgxGrid - multi-row-layout Integration - ', () => {
    configureTestSuite();
    let fixture;
    let grid: IgxGridComponent;
    let colGroups: Array<any>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnLayouHidingTestComponent
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('Hiding ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(ColumnLayouHidingTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            colGroups = fixture.componentInstance.colGroups;
        }));

        it('should allow setting a whole group as hidden/shown.', () => {
        });

        it('should hide/show whole group if a single child column is hidden/shown.', () => {
        });

        it('should emit onColumnVisibilityChanged event with correct parameters', () => {
        });

        it('should work with horizontal virtualization when some groups are hidden/shown.', async() => {
        });

        it('UI - hidden columns count and drop-down items text in hiding toolbar should be correct when group is hidden/shown. ', () => {
        });

        it('UI - toggling column checkbox checked state successfully changes the column\'s hidden state. ', async(() => {
        }));

    });
});

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px">
        <igx-column-layout *ngFor='let group of colGroups' [field]='group.group' [hidden]='group.hidden'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class ColumnLayouHidingTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;
    cols1: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1},
        { field: 'CompanyName', rowStart: 1, colStart: 2},
        { field: 'ContactName', rowStart: 1, colStart: 3},
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd : 4},
    ];
    cols2: Array<any> = [
        { field: 'PostalCode', rowStart: 1, colStart: 1, colEnd: 3 },
        { field: 'City', rowStart: 2, colStart: 1},
        { field: 'Country', rowStart: 2, colStart: 2},
        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3}
    ];
    colGroups = [
        {
            group: 'group1',
            hidden: true,
            columns: this.cols2
        },
        {
            group: 'group2',
            hidden: false,
            columns: this.cols1
        }
    ];
    data = SampleTestData.contactInfoDataFull();
}
