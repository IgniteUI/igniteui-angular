import { expect } from 'vitest';
import { Component, OnInit, viewChild } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxGridComponent } from '../../grids/grid/public_api';
import { By } from '@angular/platform-browser';
import { wait } from '../../test-utils/ui-interactions.spec';
import { IgxGridPinningActionsComponent } from './grid-pinning-actions.component';
import { IgxColumnComponent } from '../../grids/public_api';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';


describe('igxGridPinningActions #grid ', () => {
    let actionStrip: IgxActionStripComponent;
    let grid: IgxGridComponent;
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                IgxActionStripTestingComponent,
                IgxActionStripPinMenuComponent
            ]
        }).compileComponents();
    }));

    describe('Base ', () => {
        let fixture: ComponentFixture<IgxActionStripTestingComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxActionStripTestingComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip();
            grid = fixture.componentInstance.grid();
        });

        it('should allow pinning and unpinning rows in a grid', () => {
            actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            let pinningButtons = fixture.debugElement.queryAll(By.css(`igx-grid-pinning-actions button`));
            expect(pinningButtons.length).toBe(1);
            expect(pinningButtons[0].componentInstance.iconName).toBe('pin');
            pinningButtons[0].triggerEventHandler('click', new Event('click'));
            actionStrip.hide();
            fixture.detectChanges();
            expect(grid.pinnedRows.length).toBe(1);

            actionStrip.show(grid.pinnedRows[0]);
            fixture.detectChanges();
            pinningButtons = fixture.debugElement.queryAll(By.css(`igx-grid-pinning-actions button`));
            expect(pinningButtons.length).toBe(2);
            expect(pinningButtons[1].componentInstance.iconName).toBe('unpin');
            pinningButtons[1].triggerEventHandler('click', new Event('click'));
            actionStrip.hide();
            fixture.detectChanges();
            expect(grid.pinnedRows.length).toBe(0);
        });

        it('should allow navigating to disabled row in unpinned area', async () => {
            grid.pinRow('FAMIA');
            fixture.detectChanges();

            actionStrip.show(grid.pinnedRows[0]);
            fixture.detectChanges();
            const pinningButtons = fixture.debugElement.queryAll(By.css(`igx-grid-pinning-actions button`));
            const jumpButton = pinningButtons[0];
            jumpButton.triggerEventHandler('click', new Event('click'));
            await wait();
            fixture.detectChanges();
            await wait();
            fixture.detectChanges();

            const secondToLastVisible = grid.rowList.toArray()[grid.rowList.length - 2];
            expect(secondToLastVisible.key).toEqual('FAMIA');
        });
    });

    describe('Menu ', () => {
        let fixture: ComponentFixture<IgxActionStripPinMenuComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxActionStripPinMenuComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip();
            grid = fixture.componentInstance.grid();
        });
        it('should allow pinning row via menu', async () => {
            const row = grid.rowList.toArray()[0];
            actionStrip.show(row);
            fixture.detectChanges();

            actionStrip.menu.open();
            fixture.detectChanges();
            expect(actionStrip.menu.items.length).toBe(1);
            const pinMenuItem = actionStrip.menu.items[0];
            // select pin
            actionStrip.menu.selectItem(pinMenuItem);
            fixture.detectChanges();
            expect(grid.pinnedRows.length).toBe(1);
        });
    });
});

@Component({
    template: `
    <igx-grid [data]="data" [width]="'800px'" [height]="'500px'"
        [rowEditable]="true" [primaryKey]="'ID'">
        @for (c of columns; track c.field) {
            <igx-column [sortable]="true" [field]="c.field" [header]="c.field"
                [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
            </igx-column>
        }

        <igx-action-strip>
            <igx-grid-pinning-actions></igx-grid-pinning-actions>
        </igx-action-strip>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxActionStripComponent, IgxGridPinningActionsComponent]
})
class IgxActionStripTestingComponent implements OnInit {
    public actionStrip = viewChild.required(IgxActionStripComponent);
    public grid = viewChild.required(IgxGridComponent);

    private data: any[];
    private columns: any[];

    public ngOnInit() {

        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', width: '200px' },
            { field: 'ContactName', width: '200px', pinned: false },
            { field: 'ContactTitle', width: '300px', pinned: false },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.data = SampleTestData.contactInfoDataFull();
    }
}

@Component({
    template: `
    <igx-grid [data]="data" [width]="'800px'" [height]="'500px'"
        [rowEditable]="true" [primaryKey]="'ID'">
        @for (c of columns; track c.field) {
            <igx-column [sortable]="true" [field]="c.field" [header]="c.field"
                [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
            </igx-column>
        }

        <igx-action-strip>
            <igx-grid-pinning-actions [asMenuItems]='true'></igx-grid-pinning-actions>
        </igx-action-strip>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxActionStripComponent, IgxGridPinningActionsComponent]
})
class IgxActionStripPinMenuComponent extends IgxActionStripTestingComponent {
}
