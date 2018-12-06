import { DebugElement } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule } from './index';
import { IgxColumnGroupComponent } from '../column.component';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import {
    MovableColumnsComponent,
    MovableTemplatedColumnsComponent,
    MovableColumnsLargeComponent,
    MultiColumnHeadersComponent
 } from '../../test-utils/grid-samples.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxGridComponent } from './grid.component';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';

describe('IgxGrid - Column Moving', () => {
    configureTestSuite();
    const CELL_CSS_CLASS = '.igx-grid__td';
    const COLUMN_HEADER_CLASS = '.igx-grid__th';
    const COLUMN_GROUP_HEADER_CLASS = '.igx-grid__thead-title';

    let fixture, grid: IgxGridComponent;

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

    describe('', () => {
        configureTestSuite();
        beforeEach(() => {
            fixture = TestBed.createComponent(MovableColumnsComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('Should be able to reorder columns programmatically.', (() => {
            let columnsList = grid.columnList.toArray();

            grid.moveColumn(columnsList[0], columnsList[2]);

            columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('LastName');
            expect(columnsList[2].field).toEqual('ID');
        }));

        it('Should reorder only movable columns when dropping the ghost image on an interactive area.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(grid.columns[0].movable).toBeTruthy();
            expect(grid.columns[2].movable).toBeFalsy();

            // step 1 - verify columns are not reordered when
            // moving a column that is not movable
            const header = headers[2].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 450, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 455, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 100, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 100, 75);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        }));

        it('Should not reorder columns when dropping the ghost image on a non-interactive area.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - start moving a column, release the drag ghost over cells area
            // and verify columns are not reordered
            const header = headers[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 256, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 380, 350);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 380, 350);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        }));

        it('Should not reorder columns on hitting ESCAPE key.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 2 - start moving a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 130, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 136, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 270, 71);
            await wait();

            // step 2 - hit ESCAPE over the headers area and verify column moving is canceled
            document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));
            document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Escape' }));
            fixture.detectChanges();

            UIInteractions.simulatePointerEvent('pointerup', header, 270, 71);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        }));

        it('Should not break sorting and resizing when column moving is enabled.', (async() => {
            fixture.componentInstance.isFilterable = true;
            fixture.componentInstance.isResizable = true;
            fixture.componentInstance.isSortable = true;
            fixture.detectChanges();

            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            const header = headers[1].nativeElement;
            let columnsList = grid.columnList.toArray();

            // step 1 - move a column
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 244, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 100, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 100, 71);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');


            // step 2 - verify resizing is not broken
            const resizeHandle = headers[0].parent.nativeElement.children[2];
            UIInteractions.simulateMouseEvent('mousedown', resizeHandle, 200, 80);
            await wait();
            fixture.detectChanges();

            const resizer = headers[0].parent.nativeElement.children[2].children[0];
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
            await wait();
            UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
            await wait();
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('250px');


            // step 3 - verify sorting is not broken
            headers[0].triggerEventHandler('click', new Event('click'));
            headers[0].triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'ID').value).toEqual(6);
        }));

        it('Should not break vertical or horizontal scrolling after columns are reordered.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            const header = headers[1].nativeElement;
            let columnsList = grid.columnList.toArray();

            // step 1 - move a column
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 244, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 100, 71);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 100, 71);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');

            // step 2 - verify vertical scrolling is not broken
            grid.verticalScrollContainer.getVerticalScroll().scrollTop = 200;
            await wait(100);
            fixture.detectChanges();

            expect(grid.columnList.toArray()[0].cells[3].value).toBeTruthy('Rick');

            // step 3 - verify horizontal scrolling is not broken
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 200;
            await wait(100);
            fixture.detectChanges();

            expect(grid.columnList.toArray()[2].cells[3].value).toBeTruthy('BRown');
        }));

        it('Should fire onColumnMovingStart, onColumnMoving and onColumnMovingEnd with correct values of event arguments.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - start moving a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();

            // step 2 - verify onColumnMovingStart is fired correctly
            expect(fixture.componentInstance.countStart).toEqual(1);
            expect(fixture.componentInstance.source).toEqual(grid.columnList.toArray()[0]);
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await wait(50);

            // step 3 - verify onColumnMoving is fired correctly
            expect(fixture.componentInstance.count).toBeGreaterThan(1);
            expect(fixture.componentInstance.source).toEqual(grid.columnList.toArray()[0]);

            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await wait();
            fixture.detectChanges();

            // step 4 - verify onColumnMovingEnd is fired correctly
            expect(fixture.componentInstance.countEnd).toEqual(1);
            expect(fixture.componentInstance.source).toEqual(grid.columnList.toArray()[1]);
            expect(fixture.componentInstance.target).toEqual(grid.columnList.toArray()[0]);
        }));

        it('Should be able to cancel onColumnMoving event.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - try moving a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();

            if (fixture.componentInstance.source.field === 'ID') {
                fixture.componentInstance.cancel = true;
            }

            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await wait();
            fixture.detectChanges();

            // step 2 - verify the event was canceled
            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        }));

        xit('Should preserve filtering after columns are reordered.', async() => {
            pending('This scenario need to be reworked with new Filtering row');
            fixture.componentInstance.isFilterable = true;
            fixture.detectChanges();

            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            headers[0].triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            // step 1 - filter a column
            const filterUIContainer = fixture.debugElement.query(By.css('igx-grid-filter'));
            const filterIcon = filterUIContainer.query(By.css('igx-icon'));

            filterIcon.nativeElement.click();
            await wait();
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
            UIInteractions.simulatePointerEvent('pointerdown', header, 130, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 130, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 300, 71);
            await wait();
            fixture.detectChanges();

            expect(grid.columnList.toArray()[1].field).toEqual('ID');
            expect(grid.rowList.length).toEqual(1);
        });

        it('Should exit edit mode and commit the new value when column moving starts.', (async() => {
            fixture.componentInstance.isEditable = true;
            fixture.detectChanges();

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
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 244, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 100, 71);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 100, 71);
            await wait();
            fixture.detectChanges();

            // step 4 - verify cell has exited edit mode correctly
            expect(grid.columnList.toArray()[1].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ID').inEditMode).toBe(false);
            expect(grid.getCellByColumn(0, 'ID').value).toBe('4');
        }));

        it('Should preserve hidden columns order after columns are reordered.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - hide a column
            fixture.componentInstance.isHidden = true;
            fixture.detectChanges();

            // step 2 - move a column
            const header = headers[2].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 400, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 400, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 80, 71);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 80, 71);
            await wait();
            fixture.detectChanges();

            expect(grid.visibleColumns[0].field).toEqual('Region');

            // step 3 - show hidden columns and verify correct order
            fixture.componentInstance.isHidden = false;
            fixture.detectChanges();

            expect(grid.visibleColumns[0].field).toEqual('ID');
            expect(grid.visibleColumns[1].field).toEqual('Region');
        }));

        it('Should be able to reorder columns when a column is grouped.', (async() => {
            fixture.componentInstance.isGroupable = true;
            fixture.detectChanges();

            // step 1 - group a column
            grid.groupBy({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();

            // step 2 - move a column
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 180, 120);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 180, 126);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 350, 135);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 350, 135);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
        }));

        it('Should not break KB after columns are reordered - selection belongs to the moved column.', (async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - select a cell from 'ID' column
            let cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            // step 2 - move that column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');

            // step 3 - navigate right and verify cell selection is updated
            cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
            await wait(50);
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'LastName').selected).toBeTruthy();
        }));

        it('Should not break KB after columns are reordered - selection does not belong to the moved column.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - select a cell from 'ID' column
            let cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            // step 2 - move that column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 480, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 480, 75);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('LastName');
            expect(columnsList[2].field).toEqual('ID');

            // step 3 - navigate and verify cell selection is updated
            cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cell.nativeElement, true);
            await wait(50);
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'LastName').selected).toBeTruthy();
        }));

    });

    describe('', () => {
        configureTestSuite();
        beforeEach(() => {
            fixture = TestBed.createComponent(MovableTemplatedColumnsComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('Should reorder movable columns with templated headers.', (async() => {
            fixture.componentInstance.isResizable = true;
            fixture.componentInstance.isSortable = true;
            fixture.componentInstance.isFilterable = true;
            fixture.detectChanges();

            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - move a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 230, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 230, 30);
            await wait();
            fixture.detectChanges();

            // step 2 - verify column are reordered correctly
            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');
        }));
    });

    describe('', () => {
        configureTestSuite();
        beforeEach(() => {
            fixture = TestBed.createComponent(MovableColumnsLargeComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('Should be able to scroll forwards to reorder columns that are out of view.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - start moving a column and verify columns are scrolled into view,
            // when holding the drag ghost over the right edge of the grid
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            await wait(1000);
            fixture.detectChanges();

            // step 2 - verify the column being moved can be reordered among new columns
            UIInteractions.simulatePointerEvent('pointermove', header, 350, 30);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 350, 30);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');
        }));

        it('Should be able to scroll backwards to reorder columns that are out of view.', (async() => {

            // step 1 - scroll left to the end
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
            await wait(30);
            fixture.detectChanges();

            // step 2 - start moving a column and verify columns are scrolled into view,
            // when holding the drag ghost over the left edge of the grid
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[5].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 350, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 356, 56);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 10, 30);
            await wait(500);
            fixture.detectChanges();

            // step 3 - verify the column being moved can be reordered among new columns
            UIInteractions.simulatePointerEvent('pointermove', header, 130, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 130, 30);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[7].field).toEqual('Phone');
        }));

        it('Should be able to scroll/reorder columns that are out of view - with pinned columns.', (async() => {

            grid.getColumnByName('ID').pinned = true;
            fixture.detectChanges();

            // step 1 - scroll left to the end
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
            await wait(30);
            fixture.detectChanges();

            // step 2 - start moving a column and verify columns are scrolled into view,
            // when holding the drag ghost before pinned area edge
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[6].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 450, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 456, 56);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 110, 30);
            await wait(1000);
            fixture.detectChanges();

            // step 4 - verify the column being moved can be reordered among new columns
            UIInteractions.simulatePointerEvent('pointermove', header, 200, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 200, 30);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[7].field).toEqual('Fax');
        }));

        it('Should preserve cell selection after columns are reordered.', (async() => {
            let headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - select a cell from the 'ID' column
            const cell = grid.getCellByColumn(0, 'ID');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(cell.selected).toBeTruthy();

            // step 2 - move that column and verify selection is preserved
            let header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 70, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 64, 56);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 280, 25);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 280, 25);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[2].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ID')).toBeTruthy();

            // step 3 - move another column and verify selection is preserved
            headers = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
            header = headers[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 56);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 40, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 25);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.toArray();
            expect(columnsList[0].field).toEqual('ContactName');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ID')).toBeTruthy();
        }));

        it('Should preserve cell selection after columns are reordered - horizontal scrolling.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - select a visible cell from the 'ID' column
            const cell = grid.getCellByColumn(0, 'ID');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(cell.selected).toBeTruthy();

            // step 2 - reorder that column among columns that are currently out of view
            // and verify selection is preserved
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            await wait(1000);
            fixture.detectChanges();

            UIInteractions.simulatePointerEvent('pointermove', header, 350, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 350, 30);
            await wait();
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'ID').selected).toBeTruthy();
        }));

        it('Should preserve cell selection after columns are reordered - vertical scrolling.', (async() => {
            // step 1 - scroll left to the end
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
            await wait(50);
            fixture.detectChanges();

            // step 2 - scroll down vertically and select a cell that was initially out of view
            grid.verticalScrollContainer.getVerticalScroll().scrollTop = 1200;
            await wait(50);
            fixture.detectChanges();

            const cell = grid.columnList.toArray()[9].cells[4];
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(cell.selected).toBeTruthy();

            // step 3 - scroll up vertically so that the selected cell becomes out of view
            grid.verticalScrollContainer.getVerticalScroll().scrollTop = 0;
            await wait(50);
            fixture.detectChanges();

            // step 4 - reorder that column among columns that are currently out of view
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[5].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 350, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 356, 56);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 10, 30);
            await wait(1500);
            fixture.detectChanges();

            grid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));

            UIInteractions.simulatePointerEvent('pointermove', header, 40, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 30);
            await wait();
            fixture.detectChanges();

            // step 5 - verify selection is preserved
            expect(grid.columnList.toArray()[6].cells[4].selected).toBeFalsy();

            grid.verticalScrollContainer.getVerticalScroll().scrollTop = 1200;
            await wait(50);
            fixture.detectChanges();
            expect(grid.columnList.toArray()[4].cells[4].selected).toBeTruthy();
        }));

        it('Should affect all pages when columns are reordered and paging is enabled.', (async() => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();

            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - move a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 420, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 420, 31);
            await wait();
            fixture.detectChanges();

            // step 2 - navigate to page 2 and verify correct column order
            grid.paginate(1);
            fixture.detectChanges();

            const columnsList = grid.columnList.toArray();
            expect(columnsList[2].field).toEqual('ContactTitle');
            expect(columnsList[3].field).toEqual('ID');
            expect(columnsList[4].field).toEqual('Address');
        }));

        it('Should preserve sorting after columns are reordered.', (async() => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - sort the 'ID' column
            headers[0].triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            // step 2 - move that column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 420, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 420, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column remains sorted
            expect(grid.columnList.toArray()[3].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
        }));

        it('Pinning - should be able to reorder pinned columns among themselves.', (async() => {

            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('ContactTitle').pinned = true;
            fixture.detectChanges();

            // step 2 - move a pinned column
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 280, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 280, 31);
            await wait(50);
            fixture.detectChanges();

            // step 3 - verify pinned columns are reordered correctly
            expect(grid.pinnedColumns[0].field).toEqual('ID');
            expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
            expect(grid.pinnedColumns[2].field).toEqual('Address');
        }));

        it('Pinning - should pin an unpinned column when drag/drop it among pinned columns.', (async() => {

            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            fixture.detectChanges();

            // step 2 - drag/drop an unpinned column among pinned columns
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[3].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 350, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 350, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 130, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 130, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column is pinned at the correct place
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ContactName');
            expect(grid.pinnedColumns[2].field).toEqual('ID');
            expect(grid.getColumnByName('ContactName').pinned).toBeTruthy();
        }));

        it('Pinning - should unpin a pinned column when drag/drop it among unpinned columns.', (async() => {

            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('ContactTitle').pinned = true;
            fixture.detectChanges();

            // step 2 - drag/drop a pinned column among unpinned columns
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 330, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column is unpinned at the correct place
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
            expect(grid.unpinnedColumns[0].field).toEqual('ID');
            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
        }));

        it('Pinning - should not be able to pin a column if pinned area exceeds maximum allowed width.', (async() => {

            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('ContactTitle').pinned = true;
            grid.getColumnByName('ContactName').pinned = true;
            fixture.detectChanges();

            // step 2 - try drag/drop an unpinned column among pinned columns
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 450, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 450, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 180, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 180, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column cannot be pinned
            expect(grid.pinnedColumns.length).toEqual(4);
            expect(grid.unpinnedColumns[0].field).toEqual('CompanyName');
            expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
        }));

        it('Pinning - Should be able to pin/unpin columns both: programmatically and interactively via drag/drop.', (async() => {

            // step 1 - pin some columns
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('CompanyName').pinned = true;
            fixture.detectChanges();

            // step 2 - pin a column interactively via drag/drop
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[4].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 450, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 450, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 80, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 80, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - unpin that column programmatically and verify correct order
            grid.getColumnByName('ID').unpin();
            fixture.detectChanges();

            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.unpinnedColumns[0].field).toEqual('ID');
        }));
    });

    describe('', () => {
        configureTestSuite();
        beforeEach(() => {
            fixture = TestBed.createComponent(MultiColumnHeadersComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('MCH - should reorder only columns on the same level (top level simple column).', (async() => {

            // step 1 - try reordering simple column level 0 and simple column level 1
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 200, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 200, 81);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');

            // step 2 - try reordering simple column level 0 and group column level 1
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 380, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 380, 81);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');

            // step 3 - try reordering simple column level 0 and group column level 0
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 380, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 380, 25);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[3].field).toEqual('Missing');
        }));

        it('MCH - should reorder only columns on the same level (top level group column).', (async() => {

            // step 1 - try reordering group column level 0 and simple column level 1
            let header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 250, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 650, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 650, 75);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');
            expect(columnsList[5].field).toEqual('Country');

            // step 2 - try reordering group column level 0 and simple column level 0
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 250, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 570, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 570, 81);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('CompanyName');

            // step 3 - try reordering group column level 0 and group column level 0
            header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[2].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 700, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 700, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 200, 31);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 200, 31);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('Country');
            expect(columnsList[3].field).toEqual('Region');
        }));

        it('MCH - should reorder only columns on the same level (sub level simple column).', (async() => {

            // step 1 - try reordering simple column level 1 and simple column level 0
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 106);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 40, 106);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 106);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');

            // step 2 - try reordering simple column level 1 and simple column level 2
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 106);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 125);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 300, 125);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');

            // step 3 - try reordering simple column level 1 and group column level 0
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 106);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 700, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 700, 30);

            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');

            // step 4 - try reordering simple column level 1 and group column level 1
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 106);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 430, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 430, 75);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('CompanyName');
        }));

        it('MCH - should reorder only columns on the same level (sub level group column).', (async() => {

            // step 1 - try reordering group column level 1 and simple column level 0
            const header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[1].nativeElement;

            UIInteractions.simulatePointerEvent('pointerdown', header, 300, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 40, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 81);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');

            // step 2 - try reordering group column level 1 and group column level 0
            UIInteractions.simulatePointerEvent('pointerdown', header, 300, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 800, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 800, 25);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');

            // step 3 - try reordering group column level 1 and simple column level 1
            UIInteractions.simulatePointerEvent('pointerdown', header, 300, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 130, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 130, 81);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('CompanyName');
        }));

        it('MCH - should reorder only columns on the same level, with same parent.', (async() => {

            // step 1 - try reordering simple column level 1 and simple column level 1 (different parent)
            let header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 660, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 600, 100);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[5].field).toEqual('Country');

            // step 2 - try reordering simple column level 2 and simple column level 2 (same parent)
            header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[3].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 400, 125);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 400, 131);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 260, 131);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 260, 131);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[2].field).toEqual('ContactTitle');
            expect(columnsList[3].field).toEqual('ContactName');

            // step 3 - try reordering simple column level 0 and simple column level 0 (no parent)
            header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 580, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 580, 81);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[3].field).toEqual('ID');
            expect(columnsList[4].field).toEqual('Missing');
        }));

        it('MCH - should not break selection and keyboard navigation when reordering columns.', (async() => {

            // step 1 - select a cell from 'ContactName' column
            const cell = grid.getCellByColumn(0, 'ContactName');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait();
            fixture.detectChanges();

            // step 2 - reorder the parent column and verify selection is preserved
            const header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 300, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 31);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 580, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 580, 50);
            await wait();
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'ContactName').selected).toBeTruthy();

            // step 3 - navigate right and verify cell selection is updated
            const cellEl = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cellEl.nativeElement, true);
            await wait(50);
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'ContactTitle').selected).toBeTruthy();
        }));

        it('MCH - should pin only top level columns.', (async() => {

            fixture.componentInstance.isPinned = true;
            fixture.detectChanges();

            // step 2 - try pinning a sub level simple column
            let header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 30, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 30, 50);
            fixture.detectChanges();

            let columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');

            // step 3 - try pinning a top level group column
            header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 31);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 30, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 30, 50);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columnList.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[3].field).toEqual('Missing');
        }));
    });
});
