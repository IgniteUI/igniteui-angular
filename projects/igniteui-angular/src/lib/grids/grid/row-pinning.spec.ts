import { DebugElement, ViewChild, Component } from '@angular/core';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IPinRowEventArgs } from '../common/events';
import { IgxGridModule } from './index';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { ColumnPinningPosition, RowPinningPosition } from '../common/enums';
import { IPinningConfig } from '../common/grid.interface';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

describe('Row Pinning #grid', () => {
    configureTestSuite();
    let fix;
    let grid: IgxGridComponent;

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridRowPinningComponent
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
        });

        it('should pin rows to bottom.', () => {
        });

        it('should emit onRowPinning on pin/unpin.', () => {

        });

        it('should pin/unpin via grid API methods.', () => {

        });

        it('should pin/unpin via row API methods.', () => {

        });

        it('should pin/unpin via row pinned setter.', () => {

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
