import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { Calendar } from '../calendar';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';

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
        simulateMouseEvent('mouseover', headerResArea, 100, 5);
        simulateMouseEvent('mousedown', headerResArea, 100, 5);
        simulateMouseEvent('mousedup', headerResArea, 100, 5);
        tick(100);
        fixture.detectChanges();
        simulateMouseEvent('mousedown', headerResArea, 100, 5);
        tick(100);
        fixture.detectChanges();

        let resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 250, 5);
        tick(100);

        simulateMouseEvent('mouseup', resizer, 250, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('250px');

        simulateMouseEvent('mousedown', headerResArea, 250, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 40, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 40, 5);
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
        simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 700, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 700, 5);
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
        simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        let resizer = headers[1].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 370, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 370, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('250px');

        simulateMouseEvent('mousedown', headerResArea, 350, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[1].nativeElement.children[2].children[0];
        simulateMouseEvent('mousemove', resizer, 100, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 100, 5);
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
        simulateMouseEvent('mousedown', headerResArea, 450, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[2].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 550, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 550, 5);
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
        simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        let resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 450, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 450, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('300px');
        expect(grid.columns[1].width).toEqual('100px');

        simulateMouseEvent('mousedown', headerResArea, 300, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].nativeElement.children[2].children[0];
        simulateMouseEvent('mousemove', resizer, 100, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 100, 5);
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
        simulateMouseEvent('mousedown', headerResArea, 126, 5);
        tick();
        fixture.detectChanges();

        let resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 250, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 250, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('200px');

        simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].nativeElement.children[2].children[0];
        simulateMouseEvent('mousemove', resizer, 50, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 50, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('88px');

        headerResArea = headers[1].nativeElement.children[2];
        simulateMouseEvent('mousedown', headerResArea, 197, 5);
        tick();
        fixture.detectChanges();

        expect(parseInt(grid.columns[1].width, 10)).not.toBeNaN();

        resizer = headers[1].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 300, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 300, 5);
        tick(100);
        fixture.detectChanges();

        expect(parseInt(grid.columns[1].width, 10)).toBeGreaterThanOrEqual(100);

        simulateMouseEvent('mousedown', headerResArea, 300, 5);
        tick();
        fixture.detectChanges();

        resizer = headers[1].nativeElement.children[2].children[0];
        simulateMouseEvent('mousemove', resizer, 50, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 50, 5);
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
        simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[1].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 350, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 350, 5);
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
        simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 450, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 450, 5);
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
    //     simulateMouseEvent("mousedown", headerResArea, 150, 5);
    //     tick();
    //     fixture.detectChanges();

    //     const resizer = headers[0].nativeElement.children[1].children[0];
    //     expect(resizer).toBeDefined();
    //     simulateMouseEvent("mousemove", resizer, 300, 5);
    //     tick();

    //     simulateMouseEvent("mouseup", resizer, 300, 5);
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
        simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 700, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 700, 5);
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
        expect(colsRendered.length).toEqual(3);

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
        simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[2].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent('mousemove', resizer, 250, 5);
        tick();

        simulateMouseEvent('mouseup', resizer, 250, 5);
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

function simulateMouseEvent(eventName: string, element, x, y) {
    const options: MouseEventInit = {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
    };

    return new Promise((resolve, reject) => {
        element.dispatchEvent(new MouseEvent(eventName, options));
        resolve();
    });
}

@Component({
    template: `
        <igx-grid [data]="data" width="500px" height="300px">
            <igx-column [resizable]="true" field="ID" width="100px"></igx-column>
            <igx-column [resizable]="true" [minWidth]="'70px'" [maxWidth]="'250px'" field="Name" width="100px"></igx-column>
            <igx-column [resizable]="false" [sortable]="true" field="LastName" width="100px"></igx-column>
            <igx-column [resizable]="true" field="Region" width="100px"></igx-column>
        </igx-grid>
    `
})
export class ResizableColumnsComponent {

    public data = [
        { ID: 2, Name: 'Jane', LastName: 'Brown', Region: 'AD' },
        { ID: 1, Name: 'Brad', LastName: 'Williams', Region: 'BD' },
        { ID: 6, Name: 'Rick', LastName: 'Jones', Region: 'ACD' },
        { ID: 7, Name: 'Rick', LastName: 'BRown', Region: 'DD' },
        { ID: 5, Name: 'ALex', LastName: 'Smith', Region: 'MlDs' },
        { ID: 4, Name: 'Alex', LastName: 'Wilson', Region: 'DC' },
        { ID: 3, Name: 'Connor', LastName: 'Walker', Region: 'OC' }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid [data]="data" width="500px">
            <igx-column [pinned]="true" [resizable]="true" field="ID" width="100px"></igx-column>
            <igx-column [pinned]="true" [resizable]="true" field="Name" width="100px" [maxWidth]="'150px'"></igx-column>
            <igx-column [resizable]="true" field="LastName" width="100px"></igx-column>
            <igx-column [resizable]="true" field="Region" width="100px"></igx-column>
        </igx-grid>
    `
})
export class PinnedColumnsComponent {

    public data = [
        { ID: 2, Name: 'Jane', LastName: 'Brown', Region: 'AD' },
        { ID: 1, Name: 'Brad', LastName: 'Williams', Region: 'BD' },
        { ID: 6, Name: 'Rick', LastName: 'Jones', Region: 'ACD' },
        { ID: 7, Name: 'Rick', LastName: 'BRown', Region: 'DD' },
        { ID: 5, Name: 'ALex', LastName: 'Smith', Region: 'MlDs' },
        { ID: 4, Name: 'Alex', LastName: 'Wilson', Region: 'DC' },
        { ID: 3, Name: 'Connor', LastName: 'Walker', Region: 'OC' }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid width="600px" height="600px" [data]="data" [autoGenerate]="false">
        <igx-column [field]="'Released'" [pinned]="true" width="100px" dataType="boolean" [resizable]="true"></igx-column>
        <igx-column [field]="'ReleaseDate'" [pinned]="true" width="100px" dataType="date" [resizable]="true"></igx-column>
        <igx-column [field]="'Items'" [pinned]="true" width="100px" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'ID'" [width]="'100px'" [header]="'ID'" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" width="25px" [maxWidth]="'100px'" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'Test'" width="100px" dataType="string" [resizable]="true">
            <ng-template igxCell>
                <div></div>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Downloads'" width="100px" dataType="number" [resizable]="true"></igx-column>
        <igx-column [field]="'Category'" width="100px" dataType="string" [resizable]="true"></igx-column>
  </igx-grid>
    `
})
export class LargePinnedColGridComponent implements OnInit {

    timeGenerator: Calendar = new Calendar();
    today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    data = [];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    ngOnInit() {
        this.createData();
    }

    createData() {
        for (let i = 0; i < 75; i++) {
            const item = {
                Downloads: 100 + i,
                ID: i,
                ProductName: 'ProductName' + i,
                ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', -1),
                Released: true,
                Category: 'Category' + i,
                Items: 'Items' + i,
                Test: 'test' + i
            };
            this.data.push(item);
        }
    }
}

@Component({
    template: `<igx-grid [data]="data" (onColumnResized)="handleResize($event)">
        <igx-column [field]="'ID'" [width]="'150px'" [sortable]="true" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" [width]="'150px'" [resizable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [sortable]="true" [header]="'D'" [width]="'150px'" [resizable]="true" dataType="number">
        </igx-column>
        <igx-column [field]="'Released'" [header]="'Re'" [resizable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [resizable]="true" dataType="date"></igx-column>
        <igx-column [field]="'Category'" [width]="'150px'" [resizable]="true" dataType="string">
            <ng-template igxCell igxHeader>
                <igx-avatar initials="JS"></igx-avatar>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Items'" [width]="'60px'" [hasSummary]="true" [resizable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Test'" [resizable]="true" dataType="string"></igx-column>
    </igx-grid>`
})
export class GridFeaturesComponent {
    public count = 0;
    public column;
    public prevWidth;
    public newWidth;

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 15),
            Released: false,
            Category: 'Category 1',
            Items: 'Item 1',
            Test: 'Test 1'
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', -1),
            Released: true,
            Category: 'Category 2',
            Items: 'Item 2',
            Test: 'Test 2'
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null,
            Category: 'Category 3',
            Items: 'Item 3',
            Test: 'Test 3'
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', -1),
            Released: true,
            Category: 'Category 4',
            Items: 'Item 4',
            Test: 'Test 4'
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: '',
            Category: 'Category 5',
            Items: 'Item 5',
            Test: 'Test 5'
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 1),
            Released: null,
            Category: 'Category 6',
            Items: 'Item 6',
            Test: 'Test 6'
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', 1),
            Released: true,
            Category: 'Category 7',
            Items: 'Item 7',
            Test: 'Test 7'
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: false,
            Category: 'Category 8',
            Items: 'Item 8',
            Test: 'Test 8'
        }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    handleResize(event) {
        this.count++;
        this.column = event.column;
        this.prevWidth = event.prevWidth;
        this.newWidth = event.newWidth;
    }
}

@Component({
    template: `
    <igx-grid [data]="data" [height]="'800px'">
        <igx-column *ngFor="let c of columns" [field]="c.field"
                                              [header]="c.field"
                                              [resizable]="c.resizable"
                                              [width]="c.width"
                                              [minWidth]="c.minWidth"
                                              [maxWidth]="c.maxWidth">
        </igx-column>
    </igx-grid>
    `
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
        this.data = [
            {
                ID: 'ALFKI',
                CompanyName: 'Alfreds Futterkiste',
                ContactName: 'Maria Anders',
                ContactTitle: 'Sales Representative',
                Address: 'Obere Str. 57',
                City: 'Berlin',
                Region: null,
                PostalCode: '12209',
                Country: 'Germany',
                Phone: '030-0074321',
                Fax: '030-0076545'
            },
            {
                ID: 'ANATR',
                CompanyName: 'Ana Trujillo Emparedados y helados',
                ContactName: 'Ana Trujillo',
                ContactTitle: 'Owner',
                Address: 'Avda. de la Constitución 2222',
                City: 'México D.F.',
                Region: null,
                PostalCode: '05021',
                Country: 'Mexico',
                Phone: '(5) 555-4729',
                Fax: '(5) 555-3745'
            },
            {
                ID: 'ANTON',
                CompanyName: 'Antonio Moreno Taquería',
                ContactName: 'Antonio Moreno',
                ContactTitle: 'Owner',
                Address: 'Mataderos 2312',
                City: 'México D.F.',
                Region: null,
                PostalCode: '05023',
                Country: 'Mexico',
                Phone: '(5) 555-3932',
                Fax: null
            },
            {
                ID: 'AROUT',
                CompanyName: 'Around the Horn',
                ContactName: 'Thomas Hardy',
                ContactTitle: 'Sales Representative',
                Address: '120 Hanover Sq.',
                City: 'London',
                Region: null,
                PostalCode: 'WA1 1DP',
                Country: 'UK',
                Phone: '(171) 555-7788',
                Fax: '(171) 555-6750'
            },
            {
                ID: 'BERGS',
                CompanyName: 'Berglunds snabbköp',
                ContactName: 'Christina Berglund',
                ContactTitle: 'Order Administrator',
                Address: 'Berguvsvägen 8',
                City: 'Luleå',
                Region: null,
                PostalCode: 'S-958 22',
                Country: 'Sweden',
                Phone: '0921-12 34 65',
                Fax: '0921-12 34 67'
            },
            {
                ID: 'BLAUS',
                CompanyName: 'Blauer See Delikatessen',
                ContactName: 'Hanna Moos',
                ContactTitle: 'Sales Representative',
                Address: 'Forsterstr. 57',
                City: 'Mannheim',
                Region: null,
                PostalCode: '68306',
                Country: 'Germany',
                Phone: '0621-08460',
                Fax: '0621-08924'
            },
            {
                ID: 'BLONP',
                CompanyName: 'Blondesddsl père et fils',
                ContactName: 'Frédérique Citeaux',
                ContactTitle: 'Marketing Manager',
                Address: '24, place Kléber',
                City: 'Strasbourg',
                Region: null,
                PostalCode: '67000',
                Country: 'France',
                Phone: '88.60.15.31',
                Fax: '88.60.15.32'
            },
            {
                ID: 'BOLID',
                CompanyName: 'Bólido Comidas preparadas',
                ContactName: 'Martín Sommer',
                ContactTitle: 'Owner',
                Address: 'C/ Araquil, 67',
                City: 'Madrid',
                Region: null,
                PostalCode: '28023',
                Country: 'Spain',
                Phone: '(91) 555 22 82',
                Fax: '(91) 555 91 99'
            },
            {
                ID: 'BONAP',
                CompanyName: 'Bon app\'',
                ContactName: 'Laurence Lebihan',
                ContactTitle: 'Owner',
                Address: '12, rue des Bouchers',
                City: 'Marseille',
                Region: null,
                PostalCode: '13008',
                Country: 'France',
                Phone: '91.24.45.40',
                Fax: '91.24.45.41'
            },
            {
                ID: 'BOTTM',
                CompanyName: 'Bottom-Dollar Markets',
                ContactName: 'Elizabeth Lincoln',
                ContactTitle: 'Accounting Manager',
                Address: '23 Tsawassen Blvd.',
                City: 'Tsawassen',
                Region: 'BC',
                PostalCode: 'T2F 8M4',
                Country: 'Canada',
                Phone: '(604) 555-4729',
                Fax: '(604) 555-3745'
            },
            {
                ID: 'BSBEV',
                CompanyName: 'B\'s Beverages',
                ContactName: 'Victoria Ashworth',
                ContactTitle: 'Sales Representative',
                Address: 'Fauntleroy Circus', City: 'London',
                Region: null, PostalCode: 'EC2 5NT',
                Country: 'UK',
                Phone: '(171) 555-1212',
                Fax: null
            }
        ];
    }
}
