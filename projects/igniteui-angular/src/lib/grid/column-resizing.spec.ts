import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { Calendar } from '../calendar';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { GridTemplateStrings, ColumnDefinitions, EventSubscriptions } from '../test-utils/template-strings.spec';
import { SampleTestData } from '../test-utils/sample-test-data.spec';
import { IColumnResized } from '../test-utils/grid-interfaces.spec';

describe('IgxGrid - Deferred Column Resizing', () => {
    const COLUMN_HEADER_CLASS = '.igx-grid__th';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ResizableColumnsComponent,
                PinnedColumnsComponent,
                GridFeaturesComponent,
                LargePinnedColGridComponent,
                NullColumnsComponent
            ],
            imports: [
                FormsModule,
                IgxAvatarModule,
                IgxGridModule.forRoot()
            ]
        })
            .compileComponents();
    }));

    it('Define grid with resizable columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual('100px');
        expect(grid.columns[0].resizable).toBeTruthy();
        expect(grid.columns[2].resizable).toBeFalsy();

        const headerResArea = headers[0].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mouseover', headerResArea, 100, 5);
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 5);
        UIInteractions.simulateMouseEvent('mousedup', headerResArea, 100, 5);
        tick(100);
        fixture.detectChanges();
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 5);
        tick(100);
        fixture.detectChanges();

        let resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 5);
        tick(100);

        UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('250px');

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 250, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 40, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 40, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('88px');

        expect(grid.columns[2].cells[0].value).toEqual('Brown');

        headers[2].nativeElement.dispatchEvent(new Event('click'));
        headers[2].nativeElement.dispatchEvent(new Event('click'));
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].cells[0].value).toEqual('Wilson');

        discardPeriodicTasks();
    }));

    it('Resize column outside grid view.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual('100px');

        const headerResArea = headers[0].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 700, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 700, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('700px');

        discardPeriodicTasks();
    }));

    it('Resize column with preset min and max widths.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[1].width).toEqual('100px');
        expect(grid.columns[1].minWidth).toEqual('70px');
        expect(grid.columns[1].maxWidth).toEqual('250px');
        expect(grid.columns[1].resizable).toBeTruthy();

        const headerResArea = headers[1].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        let resizer = headers[1].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 370, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 370, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('250px');

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 350, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[1].nativeElement.children[2].children[0];
        UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('88px');

        discardPeriodicTasks();
    }));

    it('Resize sortable columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[2].width).toEqual('150px');
        expect(grid.columns[2].sortable).toBeTruthy();
        expect(grid.columns[2].cells[0].value).toEqual(254);

        const headerResArea = headers[2].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 450, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[2].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 550, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 550, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual('250px');
        expect(grid.columns[2].cells[0].value).toEqual(254);

        headers[2].nativeElement.dispatchEvent(new Event('click'));
        headers[2].nativeElement.dispatchEvent(new Event('click'));
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].cells[0].value).toEqual(1000);

        discardPeriodicTasks();
    }));

    it('Resize pinned columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PinnedColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual('100px');
        expect(grid.columns[1].width).toEqual('100px');

        const headerResArea = headers[0].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        let resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 450, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 450, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('300px');
        expect(grid.columns[1].width).toEqual('100px');

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 300, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].nativeElement.children[2].children[0];
        UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('100px');

        discardPeriodicTasks();
    }));

    it('Resize columns with initial width of null.', fakeAsync(() => {
        const fixture = TestBed.createComponent(NullColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(parseInt(grid.columns[0].width, 10)).not.toBeNaN();

        let headerResArea = headers[0].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 126, 5);
        tick();
        fixture.detectChanges();

        let resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('200px');

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].nativeElement.children[2].children[0];
        UIInteractions.simulateMouseEvent('mousemove', resizer, 50, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 50, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('88px');

        headerResArea = headers[1].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 197, 5);
        tick();
        fixture.detectChanges();

        expect(parseInt(grid.columns[1].width, 10)).not.toBeNaN();

        resizer = headers[1].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
        tick(100);
        fixture.detectChanges();

        expect(parseInt(grid.columns[1].width, 10)).toBeGreaterThanOrEqual(100);

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 300, 5);
        tick();
        fixture.detectChanges();

        resizer = headers[1].nativeElement.children[2].children[0];
        UIInteractions.simulateMouseEvent('mousemove', resizer, 50, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 50, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('88px');

        discardPeriodicTasks();
    }));

    it('Resize pinned column with preset max width.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PinnedColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        grid.pinColumn('LastName');
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('100px');

        const headerResArea = headers[1].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[1].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 350, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 350, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('150px');

        discardPeriodicTasks();
    }));

    it('Autoresize column on double click.', fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const dblclick = new Event('dblclick');
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual('150px');
        expect(grid.columns[1].width).toEqual('150px');
        expect(grid.columns[2].width).toEqual('150px');

        headers[0].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('100px');

        headers[1].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('207px');

        headers[2].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual('97px');

        headers[3].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[3].width).toEqual('88px');

        headers[5].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[5].width).toEqual('89px');

        discardPeriodicTasks();
    }));

    it('Autoresize column wilth preset max width.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const dblclick = new Event('dblclick');
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[4].cells[0].nativeElement.getBoundingClientRect().width).toEqual(48);
        expect(grid.columns[4].maxWidth).toEqual('100px');

        headers[4].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[4].width).toEqual('100px');

        discardPeriodicTasks();
    }));

    it('Autoresize templated column on double click.', fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const dblclick = new Event('dblclick');
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[5].width).toEqual('150px');

        headers[5].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[5].width).toEqual('89px');

        discardPeriodicTasks();
    }));

    it('Autoresize pinned column on double click.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const dblclick = new Event('dblclick');
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[2].width).toEqual('100px');

        headers[2].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual('97px');

        discardPeriodicTasks();
    }));

    it('Autoresize pinned column on double click - edge case.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const dblclick = new Event('dblclick');
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual('100px');
        expect(grid.columns[1].width).toEqual('100px');
        expect(grid.columns[2].width).toEqual('100px');

        headers[1].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('100px');
        expect(grid.columns[1].width).toEqual('100px');
        expect(grid.columns[2].width).toEqual('100px');

        const headerResArea = headers[0].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 450, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 450, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('280px');
        expect(grid.columns[1].width).toEqual('100px');
        expect(grid.columns[2].width).toEqual('100px');

        discardPeriodicTasks();
    }));

    // it("onColumnResized is fired with correct event args.", fakeAsync(() => {
    //     const fixture = TestBed.createComponent(GridFeaturesComponent);
    //     fixture.detectChanges();

    //     const dblclick = new Event("dblclick");
    //     const grid = fixture.componentInstance.grid;
    //     const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

    //     expect(grid.columns[0].width).toEqual("150px");
    //     expect(fixture.componentInstance.count).toEqual(0);

    //     const headerResArea = headers[0].nativeElement.children[1];
    //     UIInteractions.simulateMouseEvent("mousedown", headerResArea, 150, 5);
    //     tick();
    //     fixture.detectChanges();

    //     const resizer = headers[0].nativeElement.children[1].children[0];
    //     expect(resizer).toBeDefined();
    //     UIInteractions.simulateMouseEvent("mousemove", resizer, 300, 5);
    //     tick();

    //     UIInteractions.simulateMouseEvent("mouseup", resizer, 300, 5);
    //     tick();
    //     fixture.detectChanges();

    //     expect(grid.columns[0].width).toEqual("300px");
    //     expect(fixture.componentInstance.count).toEqual(1);
    //     expect(fixture.componentInstance.column).toBe(grid.columns[0]);
    //     expect(fixture.componentInstance.prevWidth).toEqual("150");
    //     expect(fixture.componentInstance.newWidth).toEqual("300px");

    //     expect(grid.columns[1].width).toEqual("150px");

    //     headers[1].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
    //     tick();
    //     fixture.detectChanges();

    //     expect(grid.columns[1].width).toEqual("207px");
    //     expect(fixture.componentInstance.count).toEqual(2);
    //     expect(fixture.componentInstance.column).toBe(grid.columns[1]);
    //     expect(fixture.componentInstance.prevWidth).toEqual("150");
    //     expect(fixture.componentInstance.newWidth).toEqual("207px");

    //     discardPeriodicTasks();
    // }));

    it('should update grid after resizing a column to be bigger.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        const displayContainer: HTMLElement = fixture.componentInstance.grid.tbody.nativeElement.querySelector('igx-display-container');
        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        let colsRendered = rowsRendered[0].children;

        expect(grid.columns[0].width).toEqual('100px');
        expect(colsRendered.length).toEqual(4);

        // Resize first column
        const headerResArea = headers[0].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 700, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 700, 5);
        tick();
        fixture.detectChanges();

        // We call this again becuase for some reason in test it is not called the same amount of time as in real use.
        // To be investigated.
        grid.markForCheck();
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('700px');

        // Check grid has updated cells and scrollbar
        const hScroll = fixture.componentInstance.grid.parentVirtDir.getHorizontalScroll();
        const hScrollVisible = hScroll.offsetWidth < hScroll.children[0].offsetWidth;
        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        colsRendered = rowsRendered[0].children;

        expect(hScrollVisible).toBe(true);
        expect(colsRendered.length).toEqual(4);

        discardPeriodicTasks();
    }));

    it('should recalculate grid heights after resizing so the horizontal scrollbar appears.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        const expectedHeight = fixture.debugElement.query(By.css('igx-grid')).nativeElement.getBoundingClientRect().height -
            grid.nativeElement.querySelector('.igx-grid__thead').getBoundingClientRect().height -
            grid.nativeElement.querySelector('.igx-grid__tfoot').getBoundingClientRect().height;

        expect(grid.calcHeight).toEqual(expectedHeight);
        expect(grid.columns[0].width).toEqual('100px');

        // Resize first column
        const headerResArea = headers[0].nativeElement.children[2];
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 5);
        tick();
        fixture.detectChanges();

        // We call this again becuase for some reason in test it is not called the same amount of time as in real use.
        // To be investigated.
        grid.markForCheck();
        tick(500);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('250px');

        // Check grid has updated cells and scrollbar
        const hScroll = fixture.componentInstance.grid.parentVirtDir.getHorizontalScroll();
        const hScrollVisible = hScroll.offsetWidth < hScroll.children[0].offsetWidth;

        // Should 243 - 18, because the horizontal scrollbar has 18px height
        expect(grid.calcHeight).toEqual(expectedHeight - 18);
        expect(hScrollVisible).toBe(true);

        discardPeriodicTasks();
    }));
});

@Component({
    template: GridTemplateStrings.declareGrid(`width="500px" height="300px"`, ``, ColumnDefinitions.resizableThreeOfFour)
})
export class ResizableColumnsComponent {

    public data = SampleTestData.personIDNameRegionData();

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: GridTemplateStrings.declareGrid(`[width]="width"`, ``, ColumnDefinitions.pinnedTwoOfFour)
})
export class PinnedColumnsComponent {

    public data = SampleTestData.personIDNameRegionData();
    public width = '500px';
    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="600px" height="600px"`, ``, ColumnDefinitions.pinnedThreeOfEight)
})
export class LargePinnedColGridComponent implements OnInit {

    timeGenerator: Calendar = new Calendar();
    today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    data = [];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    ngOnInit() {
        this.data = SampleTestData.generateProductData(75);
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(``, EventSubscriptions.onColumnResized, ColumnDefinitions.gridFeatures)
})
export class GridFeaturesComponent implements IColumnResized {
    public count = 0;
    public column;
    public prevWidth;
    public newWidth;

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public data = SampleTestData.productInfoDataFull();

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    columnResized(event) {
        this.count++;
        this.column = event.column;
        this.prevWidth = event.prevWidth;
        this.newWidth = event.newWidth;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="800px"`, ``, ColumnDefinitions.resizableColsComponent)
})
export class NullColumnsComponent implements OnInit {

    public data = [];
    public columns = [];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', resizable: true, maxWidth: 200, minWidth: 70 },
            { field: 'CompanyName', resizable: true },
            { field: 'ContactName', resizable: true },
            { field: 'ContactTitle', resizable: true },
            { field: 'Address', resizable: true },
            { field: 'City', resizable: true },
            { field: 'Region', resizable: true },
            { field: 'PostalCode', resizable: true },
            { field: 'Phone', resizable: true },
            { field: 'Fax', resizable: true }
        ];

        this.data = SampleTestData.contactInfoData();
    }
}
