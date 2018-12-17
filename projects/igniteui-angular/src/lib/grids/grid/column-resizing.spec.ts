import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxAvatarModule } from '../../avatar/avatar.component';
import { Calendar } from '../../calendar';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { GridTemplateStrings, ColumnDefinitions, EventSubscriptions } from '../../test-utils/template-strings.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IColumnResized } from '../../test-utils/grid-interfaces.spec';
import { MultiColumnHeadersComponent } from '../../test-utils/grid-samples.spec';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxGrid - Deferred Column Resizing', () => {
    configureTestSuite();
    const COLUMN_HEADER_CLASS = '.igx-grid__th';
    const COLUMN_HEADER_GROUP_CLASS = '.igx-grid__thead-item';
    const COLUMN_FILTER_CELL_SELECTOR = 'igx-grid-filtering-cell';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ResizableColumnsComponent,
                PinnedColumnsComponent,
                GridFeaturesComponent,
                LargePinnedColGridComponent,
                NullColumnsComponent,
                MultiColumnHeadersComponent,
                ColGridComponent,
                ColPercentageGridComponent
            ],
            imports: [
                FormsModule,
                IgxAvatarModule,
                NoopAnimationsModule,
                IgxGridModule.forRoot()
            ]
        })
            .compileComponents();
    }));

    it('should define grid with resizable columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual('100px');
        expect(grid.columns[0].resizable).toBeTruthy();
        expect(grid.columns[2].resizable).toBeFalsy();

        const headerResArea = headers[0].parent.children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 15);
        tick();
        fixture.detectChanges();

        let resizer = headers[0].parent.children[1].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 15);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 15);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('250px');

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 250, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].parent.children[1].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 40, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 40, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('64px');

        expect(grid.columns[2].cells[0].value).toEqual('Brown');

        headers[2].nativeElement.dispatchEvent(new Event('click'));
        headers[2].nativeElement.dispatchEvent(new Event('click'));
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].cells[0].value).toEqual('Wilson');
    }));

    it('should resize column outside grid view.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual('100px');

        const headerResArea = headers[0].parent.children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].parent.children[1].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 700, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 700, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('700px');
    }));

    it('should resize column with preset min and max widths.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[1].width).toEqual('100px');
        expect(grid.columns[1].minWidth).toEqual('70px');
        expect(grid.columns[1].maxWidth).toEqual('250px');
        expect(grid.columns[1].resizable).toBeTruthy();

        const headerResArea = headers[1].parent.children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        let resizer = headers[1].parent.children[1].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 370, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 370, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('250px');

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 350, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[1].parent.children[1].children[0].nativeElement;
        UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('70px');
    }));

    it('should resize sortable columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[2].width).toEqual('150px');
        expect(grid.columns[2].sortable).toBeTruthy();
        expect(grid.columns[2].cells[0].value).toEqual(254);

        const headerResArea = headers[2].parent.children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 450, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[2].parent.children[1].children[0].nativeElement;
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
    }));

    it('should resize pinned columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PinnedColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual('100px');
        expect(grid.columns[1].width).toEqual('100px');

        const headerResArea = headers[0].parent.children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        let resizer = headers[0].parent.children[1].children[0].nativeElement;
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

        resizer = headers[0].parent.children[1].children[0].nativeElement;
        UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('100px');
    }));

    it('should resize columns with initial width of null.', fakeAsync(() => {
        const fixture = TestBed.createComponent(NullColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(parseInt(grid.columns[0].width, 10)).not.toBeNaN();

        let headerResArea = headers[0].parent.children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 126, 5);
        tick();
        fixture.detectChanges();

        let resizer = headers[0].parent.children[1].children[0].nativeElement;
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

        resizer = headers[0].parent.children[1].children[0].nativeElement;
        UIInteractions.simulateMouseEvent('mousemove', resizer, 50, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 50, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('70px');

        headerResArea = headers[1].parent.children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 197, 5);
        tick();
        fixture.detectChanges();

        expect(parseInt(grid.columns[1].width, 10)).not.toBeNaN();

        resizer = headers[1].parent.children[1].children[0].nativeElement;
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

        resizer = headers[1].parent.children[1].children[0].nativeElement;
        UIInteractions.simulateMouseEvent('mousemove', resizer, 50, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 50, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('64px');
    }));

    it('should resize pinned column with preset max width.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PinnedColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        grid.pinColumn('LastName');
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('100px');

        const headerResArea = headers[1].parent.children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[1].parent.children[1].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 350, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 350, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('150px');
    }));

    it('should autoresize column on double click.', fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));

        expect(grid.columns[0].width).toEqual('150px');
        expect(grid.columns[1].width).toEqual('150px');
        expect(grid.columns[2].width).toEqual('150px');

        let resizeArea = headers[0].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 148, 15);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('78px');

        resizeArea = headers[1].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mouseover', resizeArea, 248, 5);
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 248, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('195px');

        resizeArea = headers[2].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 305, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual('78px');

        resizeArea = headers[3].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 400, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[3].width).toEqual('73px');

        resizeArea = headers[5].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 486, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[5].width).toEqual('89px');
    }));

    it('should autoresize column wilth preset max width.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));

        expect(grid.columns[4].cells[0].nativeElement.getBoundingClientRect().width).toEqual(50);
        expect(grid.columns[4].maxWidth).toEqual('100px');

        const resizeArea = headers[4].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 448, 15);
        tick();
        fixture.detectChanges();

        expect(grid.columns[4].width).toEqual('100px');
    }));

    it('should autoresize templated column on double click.', fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));

        expect(grid.columns[5].width).toEqual('150px');

        const resizeArea = headers[5].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 898, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[5].width).toEqual('89px');
    }));

    it('should autoresize pinned column on double click.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));

        expect(grid.columns[2].width).toEqual('100px');

        const resizeArea = headers[2].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 298, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual('92px');
    }));

    it('should autoresize pinned column on double click - edge case.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));

        expect(grid.columns[0].width).toEqual('100px');
        expect(grid.columns[1].width).toEqual('100px');
        expect(grid.columns[2].width).toEqual('100px');

        const resizeArea = headers[1].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 198, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('100px');
        expect(grid.columns[1].width).toEqual('100px');
        expect(grid.columns[2].width).toEqual('100px');

        const headerResArea = headers[0].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].children[1].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 450, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 450, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('280px');
        expect(grid.columns[1].width).toEqual('100px');
        expect(grid.columns[2].width).toEqual('100px');
    }));

    it('should fire onColumnResized with correct event args.', fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));

        expect(grid.columns[0].width).toEqual('150px');
        expect(fixture.componentInstance.count).toEqual(0);

        const headerResArea = headers[0].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 150, 5);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].children[1].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('300px');
        expect(fixture.componentInstance.count).toEqual(1);
        expect(fixture.componentInstance.column).toBe(grid.columns[0]);
        expect(fixture.componentInstance.prevWidth).toEqual('150');
        expect(fixture.componentInstance.newWidth).toEqual('300px');

        expect(grid.columns[1].width).toEqual('150px');

        const resizeArea = headers[1].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('dblclick', resizeArea, 198, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual('195px');
        expect(fixture.componentInstance.count).toEqual(2);
        expect(fixture.componentInstance.column).toBe(grid.columns[1]);
        expect(fixture.componentInstance.prevWidth).toEqual('150');
        expect(fixture.componentInstance.newWidth).toEqual('195px');
    }));

    it('should update grid after resizing a column to be bigger.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
        const displayContainer: HTMLElement = fixture.componentInstance.grid.tbody.nativeElement.querySelector('igx-display-container');
        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        let colsRendered = rowsRendered[0].children;

        expect(grid.columns[0].width).toEqual('100px');
        expect(colsRendered.length).toEqual(4);

        // Resize first column
        const headerResArea = headers[0].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].children[1].children[0].nativeElement;
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
    }));

    it('should recalculate grid heights after resizing so the horizontal scrollbar appears.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
        const expectedHeight = fixture.debugElement.query(By.css('igx-grid')).nativeElement.getBoundingClientRect().height -
            grid.nativeElement.querySelector('.igx-grid__thead').getBoundingClientRect().height -
            grid.nativeElement.querySelector('.igx-grid__tfoot').getBoundingClientRect().height;

        expect(grid.calcHeight).toEqual(expectedHeight);
        expect(grid.columns[0].width).toEqual('100px');

        // Resize first column
        const headerResArea = headers[0].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].children[1].children[0].nativeElement;
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
    }));

    it('should autosize column programmatically.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'ID')[0];
        expect(column.width).toEqual('100px');

        column.autosize();
        tick();
        fixture.detectChanges();

        expect(column.width).toEqual('63px');
    }));

    it('should autosize pinned column programmatically.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'Released')[0];
        expect(column.width).toEqual('100px');

        column.autosize();
        tick();
        fixture.detectChanges();

        expect(column.width).toEqual('95px');
    }));

    it('should autosize last pinned column programmatically.', fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'Items')[0];
        expect(column.width).toEqual('100px');

        column.autosize();
        tick();
        fixture.detectChanges();

        expect(column.width).toEqual('92px');
    }));

    it('should autosize templated column programmatically.', fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'Category')[0];
        expect(column.width).toEqual('150px');

        column.autosize();
        tick();
        fixture.detectChanges();

        expect(column.width).toEqual('89px');
    }));

    it('should autosize filterable/sortable/resizable/movable column programmatically.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        const column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'Missing')[0];
        expect(column.width).toEqual('100px');

        column.autosize();
        tick();
        fixture.detectChanges();
        expect(column.width).toEqual('104px');
    }));

    it('should autosize MCHs programmatically.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        let column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'CompanyName')[0];
        expect(column.width).toEqual('130px');

        column.autosize();
        tick();
        fixture.detectChanges();
        expect(column.width).toEqual('239px');

        column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'ContactName')[0];
        expect(column.width).toEqual('100px');

        column.autosize();
        tick();
        fixture.detectChanges();
        expect(column.width).toEqual('148px');

        column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'Region')[0];
        expect(column.width).toEqual('150px');

        column.autosize();
        tick();
        fixture.detectChanges();
        expect(column.width).toEqual('85px');

        column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'Country')[0];
        expect(column.width).toEqual('90px');

        column.autosize();
        tick();
        fixture.detectChanges();
        expect(column.width).toEqual('111px');
    }));

    it('should size headers correctly when column width is below the allowed minimum.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColGridComponent);
        fixture.detectChanges();

        const headers = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        const headerGroups = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
        const filteringCells = fixture.debugElement.queryAll(By.css(COLUMN_FILTER_CELL_SELECTOR));

        expect(headers[0].nativeElement.getBoundingClientRect().width).toBe(49);
        expect(headers[1].nativeElement.getBoundingClientRect().width).toBe(50);
        expect(headers[2].nativeElement.getBoundingClientRect().width).toBe(49);

        expect(filteringCells[0].nativeElement.getBoundingClientRect().width).toBe(49);
        expect(filteringCells[1].nativeElement.getBoundingClientRect().width).toBe(50);
        expect(filteringCells[2].nativeElement.getBoundingClientRect().width).toBe(49);

        expect(headerGroups[0].nativeElement.getBoundingClientRect().width).toBe(48);
        expect(headerGroups[1].nativeElement.getBoundingClientRect().width).toBe(50);
        expect(headerGroups[2].nativeElement.getBoundingClientRect().width).toBe(48);
    }));

    it('should size headers correctly when column width is in %.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColPercentageGridComponent);
        fixture.detectChanges();

        const headers = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        const headerGroups = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
        const filteringCells = fixture.debugElement.queryAll(By.css(COLUMN_FILTER_CELL_SELECTOR));

        expect(headers[0].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(headers[1].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(headers[2].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(headers[3].nativeElement.getBoundingClientRect().width).toBe(100);

        expect(filteringCells[0].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(filteringCells[1].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(filteringCells[2].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(filteringCells[3].nativeElement.getBoundingClientRect().width).toBe(100);

        expect(headerGroups[0].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(headerGroups[1].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(headerGroups[2].nativeElement.getBoundingClientRect().width).toBe(100);
        expect(headerGroups[3].nativeElement.getBoundingClientRect().width).toBe(100);
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
    template: GridTemplateStrings.declareGrid(`width="600px" height="600px"`, ``,
        `<igx-column [field]="'Released'" [pinned]="true" width="100px" dataType="boolean" [resizable]="true"></igx-column>
        <igx-column [field]="'ReleaseDate'" [pinned]="true" width="100px" dataType="date" [resizable]="true"
            [formatter]="returnVal"></igx-column>
        <igx-column [field]="'Items'" [pinned]="true" width="100px" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'ID'" [width]="'100px'" [header]="'ID'" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" width="50px" [maxWidth]="'100px'" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'Test'" width="100px" dataType="string" [resizable]="true">
            <ng-template igxCell>
                <div></div>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Downloads'" width="100px" dataType="number" [resizable]="true"></igx-column>
        <igx-column [field]="'Category'" width="100px" dataType="string" [resizable]="true"></igx-column>`
    )
})
export class LargePinnedColGridComponent implements OnInit {

    timeGenerator: Calendar = new Calendar();
    today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    data = [];
    value: any;

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    ngOnInit() {
        this.data = SampleTestData.generateProductData(75);
    }

    public returnVal() {
        return this.value;
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

@Component({
    template: GridTemplateStrings.declareGrid(`width="400px" height="600px" [allowFiltering]="true"`, ``,
        `<igx-column [field]="'Items'" [width]="'40px'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'ID'" [width]="'50px'" [header]="'ID'" [filterable]="true"></igx-column>
         <igx-column [field]="'ProductName'" [width]="'30px'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'Test'" width="300px" dataType="string" [resizable]="true"></igx-column>
         <igx-column [field]="'Downloads'" width="300px" dataType="number" [resizable]="true"></igx-column>
         <igx-column [field]="'Category'" width="300px" dataType="string" [resizable]="true"></igx-column>`
    )
})
export class ColGridComponent implements OnInit {
    data = [];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    ngOnInit() {
        this.data = SampleTestData.generateProductData(10);
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="400px" height="600px" [allowFiltering]="true"`, ``,
        `<igx-column [field]="'Items'" [width]="'25%'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'ID'" [width]="'25%'" [header]="'ID'" [filterable]="true"></igx-column>
         <igx-column [field]="'ProductName'" [width]="'25%'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'Test'"[width]="'25%'" dataType="string" [resizable]="true"></igx-column>`
    )
})
export class ColPercentageGridComponent implements OnInit {
    data = [];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    ngOnInit() {
        this.data = SampleTestData.generateProductData(10);
    }
}
