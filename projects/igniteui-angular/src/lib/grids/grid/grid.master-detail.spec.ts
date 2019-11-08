import { Component, ViewChild, EventEmitter } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { UIInteractions, wait} from '../../test-utils/ui-interactions.spec';
import { IgxGridModule } from './index';
import { IgxGridComponent } from './grid.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxGridRowComponent } from './grid-row.component';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

const COLLAPSED_ICON_NAME = 'chevron_right';
const EXPANDED_ICON_NAME = 'expand_more';

describe('IgxGrid Master Detail', () => {
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;

    describe('Basic', () => {
        configureTestSuite();
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    DefaultGridMasterDetailComponent
                ],
                imports: [IgxGridModule, NoopAnimationsModule]
            }).compileComponents();
        }));

        beforeEach(async(() => {
            fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should render an expand icon for all rows', () => {
            const expandIcons = grid.rowList.map((row) => {
                const icon = row.element.nativeElement.querySelector('igx-icon');
                if (icon.innerText === 'chevron_right') {
                    return icon;
                }
                return null;
            }).filter(icon => icon !== null);
            expect(grid.rowList.length).toEqual(expandIcons.length);
        });

        it('Should correctly expand a basic detail view, update expansionStates and the context proved should be correct', (async() => {
            await GridFunctions.expandMasterRowByClick(fix, grid.rowList.first);

            const firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);

            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.expansionStates.get(grid.rowList.first.rowID)).toBeTruthy();
            expect(firstRowIcon.innerText).toEqual(EXPANDED_ICON_NAME);
            expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
        }));
    });
});

@Component({
    template: `
        <igx-grid [data]="data" [width]="width" [height]="height" [primaryKey]="'ID'" [paging]="paging" [rowSelectable]="rowSelectable">
            <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width" [dataType]='c.dataType'
                [hidden]='c.hidden' [sortable]="c.sortable" [movable]='c.movable' [groupable]='c.groupable' [editable]="c.editable"
                [hasSummary]="c.hasSummary" [pinned]='c.pinned'>
            </igx-column>

            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                        <igx-checkbox (change)="onCheckboxClicked($event, dataItem)" [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <div class="inputArea"><input type="text" name="Comment"></div>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class DefaultGridMasterDetailComponent {

    public width = '800px';
    public height = '500px';
    public data = SampleTestData.contactInfoDataFull();
    public columns = [
        { field: 'ContactName', width: 400, dataType: 'string' },
        { field: 'CompanyName', width: 400, dataType: 'string' }
    ];
    public paging = false;
    public rowSelectable = false;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    public checkboxChanged: EventEmitter<any>;

    public checkboxClicked(event, context) {
        this.checkboxChanged.emit({ event: event, context: context });
    }
}
