import { DebugElement } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule } from './index';
import { IgxColumnGroupComponent } from './column.component';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import {
    MovableColumnsComponent,
    MovableTemplatedColumnsComponent,
    MovableColumnsLargeComponent,
    MultiColumnHeadersComponent
 } from '../test-utils/grid-samples.spec';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';

const CELL_CSS_CLASS = '.igx-grid__td';
const COLUMN_HEADER_CLASS = '.igx-grid__th';
const COLUMN_GROUP_HEADER_CLASS = '.igx-grid__th--fw';

describe('IgxGrid - Column Moving', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                MovableColumnsComponent,
                MovableTemplatedColumnsComponent,
                MovableColumnsLargeComponent,
                MultiColumnHeadersComponent
            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                IgxGridModule.forRoot()
            ]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    it('Should be able to reorder columns programmatically.', (() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        let columnsList = grid.columnList.toArray();

        grid.moveColumn(columnsList[0], columnsList[2]);

        columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('Name');
        expect(columnsList[1].field).toEqual('LastName');
        expect(columnsList[2].field).toEqual('ID');
    }));

    it('Should reorder only movable columns when dropping the ghost image on an interactive area.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].movable).toBeTruthy();
        expect(grid.columns[2].movable).toBeFalsy();

        // step 1 - verify columns are not reordered when
        // moving a column that is not movable
        const header = headers[2].nativeElement;
        simulatePointerEvent('pointerdown', header, 450, 75);
        simulatePointerEvent('pointermove', header, 455, 81);
        tick(15);
        simulatePointerEvent('pointermove', header, 100, 75);
        simulatePointerEvent('pointerup', header, 100, 75);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('ID');
        expect(columnsList[1].field).toEqual('Name');
        expect(columnsList[2].field).toEqual('LastName');
    }));

    it('Should not reorder columns when dropping the ghost image on a non-interactive area.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - start moving a column, release the drag ghost over cells area
        // and verify columns are not reordered
        const header = headers[1].nativeElement;
        simulatePointerEvent('pointerdown', header, 250, 65);
        simulatePointerEvent('pointermove', header, 256, 71);
        tick(15);
        simulatePointerEvent('pointermove', header, 380, 350);
        simulatePointerEvent('pointerup', header, 380, 350);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('ID');
        expect(columnsList[1].field).toEqual('Name');
        expect(columnsList[2].field).toEqual('LastName');
    }));

    it('Should not reorder columns on hitting ESCAPE key.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 2 - start moving a column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 130, 65);
        simulatePointerEvent('pointermove', header, 136, 71);
        tick(15);
        simulatePointerEvent('pointermove', header, 270, 71);

        // step 2 - hit ESCAPE over the headers area and verify column moving is canceled
        document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));
        document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Escape' }));
        fixture.detectChanges();

        simulatePointerEvent('pointerup', header, 270, 71);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('ID');
        expect(columnsList[1].field).toEqual('Name');
        expect(columnsList[2].field).toEqual('LastName');
    }));

    it('Should not break filtering, sorting and resizing when column moving is enabled.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        fixture.componentInstance.isFilterable = true;
        fixture.componentInstance.isResizable = true;
        fixture.componentInstance.isSortable = true;
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        const header = headers[1].nativeElement;
        let columnsList = grid.columnList.toArray();

        // step 1 - move a column
        simulatePointerEvent('pointerdown', header, 250, 65);
        simulatePointerEvent('pointermove', header, 244, 71);
        tick(20);
        simulatePointerEvent('pointermove', header, 100, 71);
        simulatePointerEvent('pointerup', header, 100, 71);
        fixture.detectChanges();

        columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('Name');
        expect(columnsList[1].field).toEqual('ID');
        expect(columnsList[2].field).toEqual('LastName');


        // step 2 - verify resizing is not broken
        const resizeHandle = headers[0].nativeElement.children[3];

        UIInteractions.simulateMouseEvent('mousedown', resizeHandle, 200, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[3].children[0];
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
        tick();
        UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual('250px');


        // step 3 - verify sorting is not broken
        headers[0].triggerEventHandler('click', new Event('click'));
        headers[0].triggerEventHandler('click', new Event('click'));
        fixture.detectChanges();

        expect(grid.getCellByColumn(0, 'ID').value).toEqual(6);


        // step 4 - verify filtering is not broken
        const filterUIContainer = fixture.debugElement.query(By.css('igx-grid-filter'));
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));

        filterIcon.nativeElement.click();
        tick(20);
        fixture.detectChanges();

        const dialog = filterUIContainer.query(By.directive(IgxToggleDirective));
        expect(dialog.nativeElement.classList).toContain('igx-toggle');
    }));

    it('Should not break vertical or horizontal scrolling after columns are reordered.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        const header = headers[1].nativeElement;
        let columnsList = grid.columnList.toArray();

        // step 1 - move a column
        simulatePointerEvent('pointerdown', header, 250, 65);
        simulatePointerEvent('pointermove', header, 244, 71);
        tick(20);
        simulatePointerEvent('pointermove', header, 100, 71);
        simulatePointerEvent('pointerup', header, 100, 71);
        fixture.detectChanges();

        columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('Name');
        expect(columnsList[1].field).toEqual('ID');
        expect(columnsList[2].field).toEqual('LastName');

        // step 2 - verify vertical scrolling is not broken
        grid.verticalScrollContainer.getVerticalScroll().scrollTop = 200;
        grid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        expect(grid.columnList.toArray()[0].cells[3].value).toBeTruthy('Rick');

        // step 3 - verify horizontal scrolling is not broken
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 200;
        grid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        expect(grid.columnList.toArray()[2].cells[3].value).toBeTruthy('BRown');
    }));

    it('Should close filter dialog, if opened, when column moving starts.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        fixture.componentInstance.isFilterable = true;
        fixture.detectChanges();

        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        headers[0].triggerEventHandler('click', new Event('click'));
        fixture.detectChanges();

        const filterUIContainer = fixture.debugElement.query(By.css('igx-grid-filter'));
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));

        // step 1 - open the filtering dialog
        filterIcon.nativeElement.click();
        tick(20);
        fixture.detectChanges();

        let dialog = filterUIContainer.query(By.directive(IgxToggleDirective));
        expect(dialog.nativeElement.classList.contains('igx-toggle')).toBeTruthy();

        // step 2 - move a column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 100, 65);
        simulatePointerEvent('pointermove', header, 106, 71);
        tick(15);
        simulatePointerEvent('pointermove', header, 300, 71);
        simulatePointerEvent('pointerup', header, 300, 71);
        fixture.detectChanges();

        // step 3 - verify the filtering dialog is closed
        dialog = filterUIContainer.query(By.directive(IgxToggleDirective));
        expect(dialog.nativeElement.classList.contains('igx-toggle--hidden')).toBeTruthy();
    }));

    it('Should reorder movable columns with templated headers.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableTemplatedColumnsComponent);
        fixture.detectChanges();

        fixture.componentInstance.isResizable = true;
        fixture.componentInstance.isSortable = true;
        fixture.componentInstance.isFilterable = true;
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - move a column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 50, 50);
        simulatePointerEvent('pointermove', header, 56, 56);
        tick(20);
        simulatePointerEvent('pointermove', header, 230, 30);
        simulatePointerEvent('pointerup', header, 230, 30);
        fixture.detectChanges();

        // step 2 - verify column are reordered correctly
        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('Name');
        expect(columnsList[1].field).toEqual('ID');
        expect(columnsList[2].field).toEqual('LastName');
    }));

    it('Should be able to scroll forwards to reorder columns that are out of view.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - start moving a column and verify columns are scrolled into view,
        // when holding the drag ghost over the right edge of the grid
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 50, 50);
        simulatePointerEvent('pointermove', header, 56, 56);
        tick(20);
        simulatePointerEvent('pointermove', header, 490, 30);
        tick(1000);
        fixture.detectChanges();

        // step 2 - verify the column being moved can be reordered among new columns
        simulatePointerEvent('pointermove', header, 350, 30);
        simulatePointerEvent('pointerup', header, 350, 30);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('CompanyName');
        expect(columnsList[3].field).toEqual('ID');
    }));

    it('Should be able to scroll backwards to reorder columns that are out of view.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 1 - scroll left to the end
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
        grid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        // step 2 - start moving a column and verify columns are scrolled into view,
        // when holding the drag ghost over the left edge of the grid
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[5].nativeElement;
        simulatePointerEvent('pointerdown', header, 350, 50);
        simulatePointerEvent('pointermove', header, 356, 56);
        tick(15);
        simulatePointerEvent('pointermove', header, 10, 30);
        tick(1000);
        fixture.detectChanges();

        // step 3 - verify the column being moved can be reordered among new columns
        simulatePointerEvent('pointermove', header, 130, 30);
        simulatePointerEvent('pointerup', header, 130, 30);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('ID');
        expect(columnsList[7].field).toEqual('Phone');
    }));

    it('Should be able to scroll/reorder columns that are out of view - with pinned columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        grid.getColumnByName('ID').pinned = true;
        fixture.detectChanges();

        // step 1 - scroll left to the end
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
        grid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        // step 2 - start moving a column and verify columns are scrolled into view,
        // when holding the drag ghost before pinned area edge
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[6].nativeElement;
        simulatePointerEvent('pointerdown', header, 450, 50);
        simulatePointerEvent('pointermove', header, 456, 56);
        tick(15);
        simulatePointerEvent('pointermove', header, 110, 30);
        tick(1000);
        fixture.detectChanges();

        // step 4 - verify the column being moved can be reordered among new columns
        simulatePointerEvent('pointermove', header, 200, 30);
        simulatePointerEvent('pointerup', header, 200, 30);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('ID');
        expect(columnsList[8].field).toEqual('Fax');
    }));

    it('Should fire onColumnMovingStart, onColumnMoving and onColumnMovingEnd with correct values of event arguments.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - start moving a column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 65);

        // step 2 - verify onColumnMovingStart is fired correctly
        expect(fixture.componentInstance.countStart).toEqual(1);
        expect(fixture.componentInstance.source).toEqual(grid.columnList.toArray()[0]);
        simulatePointerEvent('pointermove', header, 156, 71);
        tick(20);
        simulatePointerEvent('pointermove', header, 330, 75);

        // step 3 - verify onColumnMoving is fired correctly
        expect(fixture.componentInstance.count).toBeGreaterThan(1);
        expect(fixture.componentInstance.source).toEqual(grid.columnList.toArray()[0]);

        simulatePointerEvent('pointerup', header, 330, 75);
        fixture.detectChanges();

        // step 4 - verify onColumnMovingEnd is fired correctly
        expect(fixture.componentInstance.countEnd).toEqual(1);
        expect(fixture.componentInstance.source).toEqual(grid.columnList.toArray()[1]);
        expect(fixture.componentInstance.target).toEqual(grid.columnList.toArray()[0]);
    }));

    it('Should be able to cancel onColumnMoving event.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - try moving a column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 65);

        if (fixture.componentInstance.source.field === 'ID') {
            fixture.componentInstance.cancel = true;
        }

        simulatePointerEvent('pointermove', header, 156, 71);
        tick(20);
        simulatePointerEvent('pointermove', header, 330, 75);
        simulatePointerEvent('pointerup', header, 330, 75);
        fixture.detectChanges();

        // step 2 - verify the event was canceled
        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('ID');
        expect(columnsList[1].field).toEqual('Name');
        expect(columnsList[2].field).toEqual('LastName');
    }));

    it('Should be able to cancel onColumnMovingEnd event.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - start moving a column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 65);
        simulatePointerEvent('pointermove', header, 156, 71);
        tick(20);
        simulatePointerEvent('pointermove', header, 530, 75);
        simulatePointerEvent('pointerup', header, 530, 75);
        fixture.detectChanges();

        // step 2 - verify the event was canceled
        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('ID');
        expect(columnsList[1].field).toEqual('Name');
        expect(columnsList[2].field).toEqual('LastName');
    }));

    it('Should preserve cell selection after columns are reordered.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        let headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - select a cell from the 'ID' column
        const cell = grid.getCellByColumn(0, 'ID');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(cell.selected).toBeTruthy();

        // step 2 - move that column and verify selection is preserved
        let header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 70, 50);
        simulatePointerEvent('pointermove', header, 64, 56);
        tick(20);
        simulatePointerEvent('pointermove', header, 280, 25);
        simulatePointerEvent('pointerup', header, 280, 25);
        fixture.detectChanges();

        let columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('CompanyName');
        expect(columnsList[1].field).toEqual('ContactName');
        expect(columnsList[2].field).toEqual('ID');
        expect(grid.getCellByColumn(0, 'ID')).toBeTruthy();

        // step 3 - move another column and verify selection is preserved
        headers = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        header = headers[1].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 50);
        simulatePointerEvent('pointermove', header, 150, 56);
        tick(20);
        simulatePointerEvent('pointermove', header, 40, 25);
        simulatePointerEvent('pointerup', header, 40, 25);
        fixture.detectChanges();

        columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('ContactName');
        expect(columnsList[1].field).toEqual('CompanyName');
        expect(columnsList[2].field).toEqual('ID');
        expect(grid.getCellByColumn(0, 'ID')).toBeTruthy();
    }));

    it('Should preserve cell selection after columns are reordered - horizontal scrolling.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - select a visible cell from the 'ID' column
        const cell = grid.getCellByColumn(0, 'ID');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(cell.selected).toBeTruthy();

        // step 2 - reorder that column among columns that are currently out of view
        // and verify selection is preserved
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 50, 50);
        simulatePointerEvent('pointermove', header, 56, 56);
        tick(20);
        simulatePointerEvent('pointermove', header, 490, 30);
        tick(1500);
        fixture.detectChanges();

        simulatePointerEvent('pointermove', header, 350, 30);
        simulatePointerEvent('pointerup', header, 350, 30);
        fixture.detectChanges();

        expect(grid.getCellByColumn(0, 'ID').selected).toBeTruthy();
    }));

    it('Should preserve cell selection after columns are reordered - vertical scrolling.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        // const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - scroll left to the end
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
        grid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));

        // step 2 - scroll down vertically and select a cell that was initially out of view
        grid.verticalScrollContainer.getVerticalScroll().scrollTop = 1200;
        grid.verticalScrollContainer.getVerticalScroll().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        const cell = grid.columnList.toArray()[9].cells[4];
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(cell.selected).toBeTruthy();

        // step 3 - scroll up vertically so that the selected cell becomes out of view
        grid.verticalScrollContainer.getVerticalScroll().scrollTop = 0;
        grid.verticalScrollContainer.getVerticalScroll().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        // step 4 - reorder that column among columns that are currently out of view
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[5].nativeElement;
        simulatePointerEvent('pointerdown', header, 350, 50);
        simulatePointerEvent('pointermove', header, 356, 56);
        tick(15);
        simulatePointerEvent('pointermove', header, 10, 30);
        tick(1500);
        fixture.detectChanges();

        grid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));

        simulatePointerEvent('pointermove', header, 40, 30);
        simulatePointerEvent('pointerup', header, 40, 30);
        fixture.detectChanges();

        // step 5 - verify selection is preserved
        expect(grid.columnList.toArray()[6].cells[4].selected).toBeFalsy();

        grid.verticalScrollContainer.getVerticalScroll().scrollTop = 1200;
        grid.verticalScrollContainer.getVerticalScroll().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();
        expect(grid.columnList.toArray()[6].cells[4].selected).toBeTruthy();
    }));

    it('Should affect all pages when columns are reordered and paging is enabled.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        fixture.componentInstance.paging = true;
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - move a column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 50, 25);
        simulatePointerEvent('pointermove', header, 56, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 420, 31);
        simulatePointerEvent('pointerup', header, 420, 31);
        fixture.detectChanges();

        // step 2 - navigate to page 2 and verify correct column order
        grid.paginate(1);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[2].field).toEqual('ContactTitle');
        expect(columnsList[3].field).toEqual('ID');
        expect(columnsList[4].field).toEqual('Address');
    }));

    it('Should preserve sorting after columns are reordered.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - sort the 'ID' column
        headers[0].triggerEventHandler('click', new Event('click'));
        fixture.detectChanges();

        // step 2 - move that column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 50, 25);
        simulatePointerEvent('pointermove', header, 50, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 420, 31);
        simulatePointerEvent('pointerup', header, 420, 31);
        fixture.detectChanges();

        // step 3 - verify column remains sorted
        expect(grid.columnList.toArray()[3].field).toEqual('ID');
        expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
    }));

    it('Should preserve filtering after columns are reordered.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        fixture.componentInstance.isFilterable = true;
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        headers[0].triggerEventHandler('click', new Event('click'));
        fixture.detectChanges();

        // step 1 - filter a column
        const filterUIContainer = fixture.debugElement.query(By.css('igx-grid-filter'));
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));

        filterIcon.nativeElement.click();
        tick(20);
        fixture.detectChanges();

        const select = filterUIContainer.query(By.css('select'));
        const options = select.nativeElement.options;
        options[4].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        input.nativeElement.value = '2';
        input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        filterUIContainer.queryAll(By.css('button'))[1].nativeElement.click();
        fixture.detectChanges();

        // step 2 - move a column and verify column remains filtered
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 130, 65);
        simulatePointerEvent('pointermove', header, 130, 71);
        tick(20);
        simulatePointerEvent('pointermove', header, 300, 71);
        simulatePointerEvent('pointerup', header, 300, 71);
        fixture.detectChanges();

        expect(grid.columnList.toArray()[1].field).toEqual('ID');
        expect(grid.rowList.length).toEqual(1);
    }));

    it('Should exit edit mode and commit the new value when column moving starts.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        fixture.componentInstance.isEditable = true;
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - enter edit mode on a cell
        const cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        cell.triggerEventHandler('dblclick', {});
        fixture.detectChanges();
        expect(grid.getCellByColumn(0, 'ID').inEditMode).toBe(true);

        // step 2 - enter some new value
        const editTemplate = cell.query(By.css('input'));
        editTemplate.nativeElement.value = '4';
        editTemplate.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        // step 3 - move a column
        const header = headers[1].nativeElement;
        simulatePointerEvent('pointerdown', header, 250, 65);
        simulatePointerEvent('pointermove', header, 244, 71);
        tick(20);
        simulatePointerEvent('pointermove', header, 100, 71);
        simulatePointerEvent('pointerup', header, 100, 71);
        fixture.detectChanges();

        // step 4 - verify cell has exited edit mode correctly
        expect(grid.columnList.toArray()[1].field).toEqual('ID');
        expect(grid.getCellByColumn(0, 'ID').inEditMode).toBe(false);
        expect(grid.getCellByColumn(0, 'ID').value).toBe('4');
    }));

    it('Should preserve hidden columns order after columns are reordered.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - hide a column
        fixture.componentInstance.isHidden = true;
        fixture.detectChanges();

        // step 2 - move a column
        const header = headers[2].nativeElement;
        simulatePointerEvent('pointerdown', header, 400, 65);
        simulatePointerEvent('pointermove', header, 400, 71);
        tick(20);
        simulatePointerEvent('pointermove', header, 80, 71);
        simulatePointerEvent('pointerup', header, 80, 71);
        fixture.detectChanges();

        expect(grid.visibleColumns[0].field).toEqual('Region');

        // step 3 - show hidden columns and verify correct order
        fixture.componentInstance.isHidden = false;
        fixture.detectChanges();

        expect(grid.visibleColumns[0].field).toEqual('ID');
        expect(grid.visibleColumns[1].field).toEqual('Region');
    }));

    it('Should be able to reoreder columns when a column is grouped.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        fixture.componentInstance.isGroupable = true;
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 1 - group a column
        grid.groupBy({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
        fixture.detectChanges();

        // step 2 - move a column
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 180, 120);
        simulatePointerEvent('pointermove', header, 180, 126);
        tick(20);
        simulatePointerEvent('pointermove', header, 350, 135);
        simulatePointerEvent('pointerup', header, 350, 135);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('Name');
        expect(columnsList[1].field).toEqual('ID');
    }));

    it('Should not break KB after columns are reordered - selection belongs to the moved column.', (async () => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - select a cell from 'ID' column
        let cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        // step 2 - move that column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 65);
        simulatePointerEvent('pointermove', header, 156, 71);
        await wait();
        simulatePointerEvent('pointermove', header, 330, 75);
        simulatePointerEvent('pointerup', header, 330, 75);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('Name');
        expect(columnsList[1].field).toEqual('ID');
        expect(columnsList[2].field).toEqual('LastName');

        // step 3 - navigate right and verify cell selection is updated
        cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        await wait(20);

        expect(grid.getCellByColumn(0, 'LastName').selected).toBeTruthy();
    }));

    it('Should not break KB after columns are reordered - selection does not belong to the moved column.', (async() => {
        const fixture = TestBed.createComponent(MovableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        // step 1 - select a cell from 'ID' column
        let cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        // step 2 - move that column
        const header = headers[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 65);
        simulatePointerEvent('pointermove', header, 156, 71);
        await wait();
        simulatePointerEvent('pointermove', header, 480, 75);
        simulatePointerEvent('pointerup', header, 480, 75);
        fixture.detectChanges();

        const columnsList = grid.columnList.toArray();
        expect(columnsList[0].field).toEqual('Name');
        expect(columnsList[1].field).toEqual('LastName');
        expect(columnsList[2].field).toEqual('ID');

        // step 3 - navigate and verify cell selection is updated
        cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
        await wait(20);

        expect(grid.getCellByColumn(0, 'LastName').selected).toBeTruthy();
    }));

    it('Pinning - should be able to reorder pinned columns among themselves.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        // step 1 - pin some columns
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Address').pinned = true;
        grid.getColumnByName('ID').pinned = true;
        grid.getColumnByName('ContactTitle').pinned = true;
        fixture.detectChanges();

        // step 2 - move a pinned column
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 50, 25);
        simulatePointerEvent('pointermove', header, 50, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 280, 31);
        simulatePointerEvent('pointerup', header, 280, 31);
        fixture.detectChanges();

        // step 3 - verify pinned columns are reordered correctly
        expect(grid.pinnedColumns[0].field).toEqual('ID');
        expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
        expect(grid.pinnedColumns[2].field).toEqual('Address');
    }));

    it('Pinning - should pin an unpinned column when drag/drop it among pinned columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        // step 1 - pin some columns
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Address').pinned = true;
        grid.getColumnByName('ID').pinned = true;
        fixture.detectChanges();

        // step 2 - drag/drop an unpinned column among pinned columns
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[3].nativeElement;
        simulatePointerEvent('pointerdown', header, 350, 25);
        simulatePointerEvent('pointermove', header, 350, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 130, 31);
        simulatePointerEvent('pointerup', header, 130, 31);
        fixture.detectChanges();

        // step 3 - verify column is pinned at the correct place
        expect(grid.pinnedColumns[0].field).toEqual('Address');
        expect(grid.pinnedColumns[1].field).toEqual('ContactName');
        expect(grid.pinnedColumns[2].field).toEqual('ID');
        expect(grid.getColumnByName('ContactName').pinned).toBeTruthy();
    }));

    it('Pinning - should unpin a pinned column when drag/drop it among unpinned columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        // step 1 - pin some columns
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Address').pinned = true;
        grid.getColumnByName('ID').pinned = true;
        grid.getColumnByName('ContactTitle').pinned = true;
        fixture.detectChanges();

        // step 2 - drag/drop a pinned column among unpinned columns
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 25);
        simulatePointerEvent('pointermove', header, 150, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 330, 31);
        simulatePointerEvent('pointerup', header, 330, 31);
        fixture.detectChanges();

        // step 3 - verify column is unpinned at the correct place
        expect(grid.pinnedColumns[0].field).toEqual('Address');
        expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
        expect(grid.unpinnedColumns[0].field).toEqual('ID');
        expect(grid.getColumnByName('ID').pinned).toBeFalsy();
    }));

    it('Pinning - should not be able to pin a column if pinned area exceeds maximum allowed width.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        // step 1 - pin some columns
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Address').pinned = true;
        grid.getColumnByName('ID').pinned = true;
        grid.getColumnByName('ContactTitle').pinned = true;
        grid.getColumnByName('ContactName').pinned = true;
        fixture.detectChanges();

        // step 2 - try drag/drop an unpinned column among pinned columns
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
        simulatePointerEvent('pointerdown', header, 450, 25);
        simulatePointerEvent('pointermove', header, 450, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 180, 31);
        simulatePointerEvent('pointerup', header, 180, 31);
        fixture.detectChanges();

        // step 3 - verify column cannot be pinned
        expect(grid.pinnedColumns.length).toEqual(4);
        expect(grid.unpinnedColumns[0].field).toEqual('CompanyName');
        expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
    }));

    it('Pinning - Should be able to pin/unpin columns both: programmatically and interactively via drag/drop.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MovableColumnsLargeComponent);
        fixture.detectChanges();

        // step 1 - pin some columns
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('ID').pinned = true;
        grid.getColumnByName('CompanyName').pinned = true;
        fixture.detectChanges();

        // step 2 - pin a column interactively via drag/drop
        const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[4].nativeElement;
        simulatePointerEvent('pointerdown', header, 450, 25);
        simulatePointerEvent('pointermove', header, 450, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 80, 31);
        simulatePointerEvent('pointerup', header, 80, 31);
        fixture.detectChanges();

        // step 3 - unpin that column programmatically and verify correct order
        grid.getColumnByName('ID').unpin();
        fixture.detectChanges();

        expect(grid.getColumnByName('ID').pinned).toBeFalsy();
        expect(grid.unpinnedColumns[0].field).toEqual('ID');
    }));

    it('MCH - should reorder only columns on the same level (top level simple column).', fakeAsync(() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 1 - try reordering simple column level 0 and simple column level 1
        const header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 50, 75);
        simulatePointerEvent('pointermove', header, 50, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 200, 81);
        simulatePointerEvent('pointerup', header, 200, 81);
        tick(20);
        fixture.detectChanges();

        let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');

        // step 2 - try reordering simple column level 0 and group column level 1
        simulatePointerEvent('pointerdown', header, 50, 75);
        simulatePointerEvent('pointermove', header, 50, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 380, 81);
        simulatePointerEvent('pointerup', header, 380, 81);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');

        // step 3 - try reordering simple column level 0 and group column level 0
        simulatePointerEvent('pointerdown', header, 50, 75);
        simulatePointerEvent('pointermove', header, 50, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 380, 25);
        simulatePointerEvent('pointerup', header, 380, 25);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('CompanyName');
        expect(columnsList[3].field).toEqual('Missing');
    }));

    it('MCH - should reorder only columns on the same level (top level group column).', fakeAsync(() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 1 - try reordering group column level 0 and simple column level 1
        let header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[1].nativeElement;
        simulatePointerEvent('pointerdown', header, 250, 25);
        simulatePointerEvent('pointermove', header, 250, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 650, 75);
        simulatePointerEvent('pointerup', header, 650, 75);
        tick(20);
        fixture.detectChanges();

        let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');
        expect(columnsList[4].field).toEqual('ID');
        expect(columnsList[5].field).toEqual('Country');

        // step 2 - try reordering group column level 0 and simple column level 0
        simulatePointerEvent('pointerdown', header, 250, 25);
        simulatePointerEvent('pointermove', header, 250, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 560, 81);
        simulatePointerEvent('pointerup', header, 560, 81);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('ID');
        expect(columnsList[2].field).toEqual('CompanyName');

        // step 3 - try reordering group column level 0 and group column level 0
        header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[7].nativeElement;
        simulatePointerEvent('pointerdown', header, 800, 25);
        simulatePointerEvent('pointermove', header, 800, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 350, 31);
        simulatePointerEvent('pointerup', header, 350, 31);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('ID');
        expect(columnsList[2].field).toEqual('Country');
        expect(columnsList[3].field).toEqual('Region');
    }));

    it('MCH - should reorder only columns on the same level (sub level simple column).', fakeAsync(() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 1 - try reordering simple column level 1 and simple column level 0
        const header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[2].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 100);
        simulatePointerEvent('pointermove', header, 150, 106);
        tick(20);
        simulatePointerEvent('pointermove', header, 40, 106);
        simulatePointerEvent('pointerup', header, 40, 106);
        tick(20);
        fixture.detectChanges();

        let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');
        expect(columnsList[4].field).toEqual('ID');

        // step 2 - try reordering simple column level 1 and simple column level 2
        simulatePointerEvent('pointerdown', header, 150, 100);
        simulatePointerEvent('pointermove', header, 150, 106);
        tick(20);
        simulatePointerEvent('pointermove', header, 300, 125);
        simulatePointerEvent('pointerup', header, 300, 125);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');
        expect(columnsList[4].field).toEqual('ID');

        // step 3 - try reordering simple column level 1 and group column level 0
        simulatePointerEvent('pointerdown', header, 150, 100);
        simulatePointerEvent('pointermove', header, 150, 106);
        tick(20);
        simulatePointerEvent('pointermove', header, 700, 30);
        simulatePointerEvent('pointerup', header, 700, 30);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');
        expect(columnsList[4].field).toEqual('ID');

        // step 4 - try reordering simple column level 1 and group column level 1
        simulatePointerEvent('pointerdown', header, 150, 100);
        simulatePointerEvent('pointermove', header, 150, 106);
        tick(20);
        simulatePointerEvent('pointermove', header, 430, 75);
        simulatePointerEvent('pointerup', header, 430, 75);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('ContactName');
        expect(columnsList[3].field).toEqual('CompanyName');
    }));

    it('MCH - should reorder only columns on the same level (sub level group column).', fakeAsync(() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 1 - try reordering group column level 1 and simple column level 0
        const header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[3].nativeElement;
        simulatePointerEvent('pointerdown', header, 300, 75);
        simulatePointerEvent('pointermove', header, 300, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 40, 81);
        simulatePointerEvent('pointerup', header, 40, 81);
        tick(20);
        fixture.detectChanges();

        let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');
        expect(columnsList[2].field).toEqual('ContactName');

        // step 2 - try reordering group column level 1 and group column level 0
        simulatePointerEvent('pointerdown', header, 300, 75);
        simulatePointerEvent('pointermove', header, 300, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 800, 25);
        simulatePointerEvent('pointerup', header, 800, 25);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');
        expect(columnsList[2].field).toEqual('ContactName');

        // step 3 - try reordering group column level 1 and simple column level 1
        simulatePointerEvent('pointerdown', header, 300, 75);
        simulatePointerEvent('pointermove', header, 300, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 130, 81);
        simulatePointerEvent('pointerup', header, 130, 81);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('ContactName');
        expect(columnsList[3].field).toEqual('CompanyName');
    }));

    it('MCH - should reorder only columns on the same level, with same parent.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 1 - try reordering simple column level 1 and simple column level 1 (different parent)
        let header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[2].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 75);
        simulatePointerEvent('pointermove', header, 150, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 660, 100);
        simulatePointerEvent('pointerup', header, 600, 100);
        tick(20);
        fixture.detectChanges();

        let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[1].field).toEqual('CompanyName');
        expect(columnsList[5].field).toEqual('Country');

        // step 2 - try reordering simple column level 2 and simple column level 2 (same parent)
        header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[5].nativeElement;
        simulatePointerEvent('pointerdown', header, 400, 125);
        simulatePointerEvent('pointermove', header, 400, 131);
        tick(20);
        simulatePointerEvent('pointermove', header, 260, 131);
        simulatePointerEvent('pointerup', header, 260, 131);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[2].field).toEqual('ContactTitle');
        expect(columnsList[3].field).toEqual('ContactName');

        // step 3 - try reordering simple column level 0 and simple column level 0 (no parent)
        header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[0].nativeElement;
        simulatePointerEvent('pointerdown', header, 50, 75);
        simulatePointerEvent('pointermove', header, 50, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 560, 81);
        simulatePointerEvent('pointerup', header, 560, 81);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('CompanyName');
        expect(columnsList[3].field).toEqual('ID');
        expect(columnsList[4].field).toEqual('Missing');
    }));

    it('MCH - should not break selection and keyboard navigation navigation when reordering columns .', (async() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 1 - select a cell from 'ContactName' column
        const cell = grid.getCellByColumn(0, 'ContactName');
        cell.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        // step 2 - reorder the parent column and verify selection is preserved
        const header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[1].nativeElement;
        simulatePointerEvent('pointerdown', header, 300, 25);
        simulatePointerEvent('pointermove', header, 300, 31);
        await wait();
        simulatePointerEvent('pointermove', header, 560, 50);
        simulatePointerEvent('pointerup', header, 560, 50);
        fixture.detectChanges();

        expect(grid.getCellByColumn(0, 'ContactName').selected).toBeTruthy();

        // step 3 - navigate right and verify cell selection is updated
        const cellEl = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];
        UIInteractions.triggerKeyDownEvtUponElem('arrowright', cellEl.nativeElement, true);
        await wait(20);

        expect(grid.getCellByColumn(0, 'ContactTitle').selected).toBeTruthy();
    }));

    it('MCH - should pin only top level columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(MultiColumnHeadersComponent);
        fixture.detectChanges();

        fixture.componentInstance.isPinned = true;
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        // step 2 - try pinning a sub level simple column
        let header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[2].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 75);
        simulatePointerEvent('pointermove', header, 150, 81);
        tick(20);
        simulatePointerEvent('pointermove', header, 30, 50);
        simulatePointerEvent('pointerup', header, 30, 50);
        tick(20);
        fixture.detectChanges();

        let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('Missing');
        expect(columnsList[1].field).toEqual('CompanyName');

        // step 3 - try pinning a top level group column
        header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[1].nativeElement;
        simulatePointerEvent('pointerdown', header, 150, 25);
        simulatePointerEvent('pointermove', header, 150, 31);
        tick(20);
        simulatePointerEvent('pointermove', header, 30, 50);
        simulatePointerEvent('pointerup', header, 30, 50);
        tick(20);
        fixture.detectChanges();

        columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
        expect(columnsList[0].field).toEqual('CompanyName');
        expect(columnsList[3].field).toEqual('Missing');
    }));

    function simulatePointerEvent(eventName: string, element, x, y) {
        const options: PointerEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1
        };
        const pointerEvent = new PointerEvent(eventName, options);
        Object.defineProperty(pointerEvent, 'pageX', { value: x, enumerable: true });
        Object.defineProperty(pointerEvent, 'pageY', { value: y, enumerable: true });

        element.dispatchEvent(pointerEvent);
    }
});
