import { DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent, IgxColumnGroupComponent, IgxColumnMovingDragDirective } from 'igniteui-angular/grids/core';
import { MovableColumnsComponent, MovableTemplatedColumnsComponent, MovableColumnsLargeComponent, MultiColumnHeadersComponent } from '../../../test-utils/grid-samples.spec';
import { UIInteractions, frames, nextFrame, wait } from '../../../test-utils/ui-interactions.spec';
import { IgxGridComponent } from './grid.component';
import { GridSelectionFunctions, GridFunctions } from '../../../test-utils/grid-functions.spec';
import { ColumnPinningPosition, ColumnType, SortingDirection } from 'igniteui-angular/core';
import { advance, useFakeClock } from '../../../test-utils/helper-utils.spec';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/** Mousedown debounce of the header resize handle (`IgxResizeHandleDirective.DEBOUNCE_TIME`). */
const RESIZE_DEBOUNCE_TIME = 200;

const waitFrames = async (count = 1) => {
    for (let i = 0; i < count; i++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
};

describe('IgxGrid - Column Moving #grid', () => {
    const CELL_CSS_CLASS = '.igx-grid__td';
    const COLUMN_HEADER_CLASS = '.igx-grid-th';
    const COLUMN_GROUP_HEADER_CLASS = '.igx-grid-thead__title';
    const COLUMN_RESIZE_CLASS = '.igx-grid-th__resize-line';

    let fixture;
    let grid: IgxGridComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormsModule,
                NoopAnimationsModule,
                MovableColumnsComponent,
                MovableTemplatedColumnsComponent,
                MovableColumnsLargeComponent,
                MultiColumnHeadersComponent
            ]
        }).compileComponents();
    });

    describe('', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(MovableColumnsComponent);
            grid = fixture.componentInstance.grid;
            fixture.detectChanges();
        });

        it('Should be able to reorder columns.', async () => {
            let columnsList = grid.columns;
            grid.moveColumn(columnsList[0], columnsList[2]);
            await fixture.whenStable();
            fixture.detectChanges();
            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('LastName');
            expect(columnsList[2].field).toEqual('ID');
        });

        it('Should be able to reorder columns programmatically.', async () => {
            let columnsList = grid.columns;
            const column = columnsList[0] as IgxColumnComponent;
            column.move(2);
            await fixture.whenStable();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('LastName');
            expect(columnsList[2].field).toEqual('ID');
        });

        it('Should not reorder columns, if passed incorrect index.', async () => {
            let columnsList = grid.columns;

            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');

            const column = columnsList[0] as IgxColumnComponent;
            column.move(-1);
            await fixture.whenStable();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');

            column.move(columnsList.length);
            await fixture.whenStable();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should show hidden column on correct index', async () => {
            let columnsList = grid.columns;
            const column = columnsList[0] as IgxColumnComponent;

            column.hidden = true;
            fixture.detectChanges();

            column.move(2);
            await fixture.whenStable();
            column.hidden = false;
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('LastName');
            expect(columnsList[2].field).toEqual('ID');
        });

        it('Should fire columnMovingEnd with correct values of event arguments.', async () => {
            let columnsList = grid.columns;
            const column = columnsList[0] as IgxColumnComponent;

            vi.spyOn(grid.columnMovingEnd, 'emit');

            column.move(2);
            await fixture.whenStable();
            fixture.detectChanges();

            columnsList = grid.columns;
            const args = { source: grid.columns[2], target: grid.columns[1], cancel: false };
            expect(grid.columnMovingEnd.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnMovingEnd.emit).toHaveBeenCalledWith(args);
        });

        it('Should not move a column through moveColumn when columnMovingEnd is canceled', async () => {
            const id = grid.getColumnByName('ID');
            const lastName = grid.getColumnByName('LastName');
            grid.columnMovingEnd.subscribe((e) => e.cancel = true);

            grid.moveColumn(id, lastName);
            await fixture.whenStable();
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should change the pinning position when moving a column pinned at start onto a column pinned at end', async () => {
            const id = grid.getColumnByName('ID');
            const lastName = grid.getColumnByName('LastName');
            id.pin();
            lastName.pin(null, ColumnPinningPosition.End);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(grid.pinnedStartColumns.map(c => c.field)).toEqual(['ID']);
            expect(grid.pinnedEndColumns.map(c => c.field)).toEqual(['LastName']);

            grid.moveColumn(id, lastName);
            await fixture.whenStable();
            fixture.detectChanges();

            expect(id.pinned).toBe(true);
            expect(id.pinningPosition).toBe(ColumnPinningPosition.End);
            expect(grid.pinnedStartColumns.length).toBe(0);
            expect(grid.pinnedEndColumns.map(c => c.field)).toEqual(['LastName', 'ID']);
        });

        it('Should exit edit mode and commit the new value when column moving programmatically', async () => {
            fixture.componentInstance.isEditable = true;
            fixture.detectChanges();
            const cacheValue = grid.getCellByColumn(0, 'ID').value;

            // step 1 - enter edit mode on a cell
            const cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            cell.triggerEventHandler('dblclick', {});
            fixture.detectChanges();
            expect(grid.getCellByColumn(0, 'ID').editMode).toBe(true);

            // step 2 - enter some new value
            const editTemplate = cell.query(By.css('input'));
            editTemplate.nativeElement.value = '4';
            editTemplate.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            // step 3 - move a column
            const columnsList = grid.columns;
            const column = columnsList[0] as IgxColumnComponent;
            column.move(2);
            await fixture.whenStable();
            fixture.detectChanges();

            // step 4 - verify cell has exited edit mode correctly
            expect(grid.columns[2].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ID').editMode).toBe(false);
            expect(grid.getCellByColumn(0, 'ID').value).toBe(cacheValue);
        });

        it('Should preserve hidden columns order after columns are reordered programmatically', async () => {

            // step 1 - hide a column
            fixture.componentInstance.isHidden = true;
            fixture.detectChanges();
            fixture.detectChanges();

            // step 2 - move a column
            const columnsList = grid.columns;
            const column = columnsList[2] as IgxColumnComponent;
            column.move(1);
            await fixture.whenStable();
            fixture.detectChanges();


            expect(grid.visibleColumns[1].field).toEqual('LastName');

            // step 3 - show hidden columns and verify correct order
            fixture.componentInstance.isHidden = false;
            fixture.detectChanges();
            fixture.detectChanges();

            expect(grid.visibleColumns[0].field).toEqual('ID');
            expect(grid.visibleColumns[1].field).toEqual('Name');
            expect(grid.visibleColumns[2].field).toEqual('LastName');
        });

        it('Should not break vertical or horizontal scrolling after columns are reordered programmatically', async () => {
            let columnsList = grid.columns;

            // step 1 - move a column
            const column = columnsList[1] as IgxColumnComponent;
            column.move(2);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns;

            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('LastName');
            expect(columnsList[2].field).toEqual('Name');

            // step 2 - verify vertical scrolling is not broken
            grid.verticalScrollContainer.getScroll().scrollTop = 200;
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columns[0].cells[3].value).toBeTruthy();

            // step 3 - verify horizontal scrolling is not broken
            grid.headerContainer.getScroll().scrollLeft = 200;
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columns[2].cells[3].value).toBeTruthy();
        });

        it('Should be able to reorder columns programmatically when a column is grouped.', async () => {
            fixture.componentInstance.isGroupable = true;
            fixture.detectChanges();
            let columnsList = grid.columns;

            // step 1 - group a column
            grid.groupBy({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();

            // step 2 - move a column
            const column = columnsList[0] as IgxColumnComponent;
            column.move(2);
            await wait();
            fixture.detectChanges();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('LastName');
            expect(columnsList[2].field).toEqual('ID');
        });

        it('Should not break KB after columns are reordered programmatically - selection belongs to the moved column.', async () => {
            let columnsList = grid.columns;

            // step 1 - select a cell from 'ID' column
            const cell = grid.gridAPI.get_cell_by_index(0, 'ID');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fixture.detectChanges();

            // step 2 - move that column

            const column = columnsList[0] as IgxColumnComponent;
            column.move(1);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');

            // step 3 - navigate right and verify cell selection is updated
            const gridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, grid);
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', gridContent.nativeElement, true);
            await nextFrame();
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'ID').selected).toBeTruthy();
        });

        it('Should not reorder columns when dropping the ghost image on a non-interactive area.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - start moving a column, release the drag ghost over cells area
            // and verify columns are not reordered
            const header = headers[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 256, 71);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 380, 350);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 380, 350);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should not throw when the column move is cancelled in a ghostCreate handler.', async () => {
            const dragDir = fixture.debugElement.queryAll(By.directive(IgxColumnMovingDragDirective))[0]
                .injector.get(IgxColumnMovingDragDirective);
            const ghostCreateSub = dragDir.ghostCreate.subscribe(() => {
                ghostCreateSub.unsubscribe();
                dragDir.cancelDrag();
            });

            UIInteractions.simulatePointerEvent('pointerdown', dragDir.element.nativeElement, 130, 65);
            await wait();
            expect(() => dragDir.onPointerMove(UIInteractions.createPointerEvent('pointermove', { x: 140, y: 75 } as any)))
                .not.toThrow();
            await wait();
            fixture.detectChanges();

            expect(dragDir.ghostElement).toBeFalsy();
            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
        });

        it('Should end column moving without reordering when cancelDrag() is called during the move.', async () => {
            const dragDir = fixture.debugElement.queryAll(By.directive(IgxColumnMovingDragDirective))[0]
                .injector.get(IgxColumnMovingDragDirective);
            const header = dragDir.element.nativeElement;

            UIInteractions.simulatePointerEvent('pointerdown', header, 130, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 136, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', dragDir.ghostElement, 270, 71);
            await wait();
            fixture.detectChanges();
            expect(grid.columnInDrag).toBeTruthy();

            dragDir.cancelDrag();
            await wait();
            fixture.detectChanges();

            expect(grid.columnInDrag).toBeFalsy();
            expect(dragDir.ghostElement).toBeFalsy();

            // A later release does not move the column.
            UIInteractions.simulatePointerEvent('pointerup', header, 270, 71);
            await wait();
            fixture.detectChanges();
            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should not reorder columns on hitting ESCAPE key.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 2 - start moving a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 130, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 136, 71);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 270, 71);
            await wait();

            // step 2 - hit ESCAPE over the headers area and verify column moving is canceled
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
            fixture.detectChanges();

            UIInteractions.simulatePointerEvent('pointerup', header, 270, 71);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should reorder columns after a column move is cancelled with ESCAPE outside the headers.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
            const header = headers[0].nativeElement;

            // step 1 - start moving a column and hit ESCAPE over the cells area
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 380, 350);
            await wait();
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointerup', header, 380, 350);
            await wait();
            fixture.detectChanges();

            expect(grid.columnInDrag).toBeFalsy();
            let columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');

            // step 2 - move the column again and verify it is reordered
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            // Pointer moves are throttled to one per animation frame.
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await wait(50);
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should not reorder columns when ESCAPE is hit before the pointer moves past the drag tolerance.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
            const header = headers[0].nativeElement;

            // step 1 - move the pointer less than the drag tolerance and hit ESCAPE
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 151, 65);
            await wait();
            fixture.detectChanges();
            expect(grid.columnInDrag).toBeTruthy();

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }));
            // Pointer moves are throttled to one per animation frame.
            await wait(50);
            fixture.detectChanges();
            expect(grid.columnInDrag).toBeFalsy();

            // step 2 - continue the same gesture and verify the column is not dragged or reordered
            const dragDir = fixture.debugElement.queryAll(By.directive(IgxColumnMovingDragDirective))[0]
                .injector.get(IgxColumnMovingDragDirective);
            expect(dragDir.element.nativeElement).toBe(header);
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await wait(50);
            fixture.detectChanges();
            expect(dragDir.ghostElement).toBeFalsy();
            expect(grid.columnInDrag).toBeFalsy();

            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await wait(50);
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should not reorder columns when columnMoving is canceled before the pointer moves past the drag tolerance.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
            const header = headers[0].nativeElement;
            // Cancel only the first columnMoving notification.
            const columnMovingSub = grid.columnMoving.subscribe((e) => {
                columnMovingSub.unsubscribe();
                e.cancel = true;
            });

            // step 1 - move the pointer less than the drag tolerance
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 151, 65);
            // Pointer moves are throttled to one per animation frame.
            await wait(50);
            fixture.detectChanges();
            expect(columnMovingSub.closed).toBe(true);
            expect(grid.columnInDrag).toBeFalsy();

            // step 2 - continue the same gesture and verify the column is not dragged or reordered
            const dragDir = fixture.debugElement.queryAll(By.directive(IgxColumnMovingDragDirective))[0]
                .injector.get(IgxColumnMovingDragDirective);
            expect(dragDir.element.nativeElement).toBe(header);
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await wait(50);
            fixture.detectChanges();
            expect(dragDir.ghostElement).toBeFalsy();
            expect(grid.columnInDrag).toBeFalsy();

            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await wait(50);
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should not break sorting and resizing when column moving is enabled.', async () => {
            fixture.componentInstance.isFilterable = true;
            fixture.componentInstance.isResizable = true;
            fixture.componentInstance.isSortable = true;
            fixture.detectChanges();

            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            const header = headers[1].nativeElement;
            let columnsList = grid.columns;

            // step 1 - move a column
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 244, 71);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 100, 71);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 100, 71);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');

            // step 2 - verify resizing is not broken
            const resizeHandle = headers[0].parent.nativeElement.children[2];
            useFakeClock();
            UIInteractions.simulateMouseEvent('mousedown', resizeHandle, 200, 80);
            await advance(fixture, RESIZE_DEBOUNCE_TIME);
            fixture.detectChanges();

            const resizer = fixture.debugElement.queryAll(By.css(COLUMN_RESIZE_CLASS))[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('250px');

            // step 3 - verify sorting is not broken
            GridFunctions.clickHeaderSortIcon(headers[0]);
            GridFunctions.clickHeaderSortIcon(headers[0]);
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'ID').value).toEqual(6);
        });

        it('Should not break vertical or horizontal scrolling after columns are reordered.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            const header = headers[1].nativeElement;
            let columnsList = grid.columns;

            // step 1 - move a column
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 244, 71);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 100, 71);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 100, 71);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');

            // step 2 - verify vertical scrolling is not broken
            grid.verticalScrollContainer.getScroll().scrollTop = 200;
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columns[0].cells[3].value).toBeTruthy();

            // step 3 - verify horizontal scrolling is not broken
            grid.headerContainer.getScroll().scrollLeft = 200;
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columns[2].cells[3].value).toBeTruthy();
        });

        it('Should fire columnMovingStart, columnMoving and columnMovingEnd with correct values of event arguments.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - start moving a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();

            // step 2 - verify columnMovingStart is fired correctly
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await nextFrame();

            expect(fixture.componentInstance.countStart).toEqual(1);
            expect(fixture.componentInstance.source).toEqual(grid.columns[0]);

            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await nextFrame();

            // step 3 - verify columnMoving is fired correctly
            expect(fixture.componentInstance.count).toBeGreaterThan(1);
            expect(fixture.componentInstance.source).toEqual(grid.columns[0]);

            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await wait();
            fixture.detectChanges();

            // step 4 - verify columnMovingEnd is fired correctly
            expect(fixture.componentInstance.countEnd).toEqual(1);
            expect(fixture.componentInstance.source).toEqual(grid.columns[1]);
            expect(fixture.componentInstance.target).toEqual(grid.columns[0]);
            expect(fixture.componentInstance.cancel).toBe(false);
        });

        it('Should be able to cancel columnMoving event.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - try moving a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();

            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await wait();

            if (fixture.componentInstance.source.field === 'ID') {
                fixture.componentInstance.cancel = true;
            }

            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await wait();
            fixture.detectChanges();

            // step 2 - verify the event was canceled
            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should be able to cancel columnMovingEnd event.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - subscribe to the columnMovingEnd event in order to cancel it
            grid.columnMovingEnd.subscribe((e) => {
                if (fixture.componentInstance.target.field === 'Name') {
                    e.cancel = true;
                }
            });

            // step 2 - try moving a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await nextFrame();
            fixture.detectChanges();

            // step 3 - verify the event was canceled(in componentInstance)
            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Name');
            expect(columnsList[2].field).toEqual('LastName');
        });

        it('Should preserve filtering after columns are reordered.', async () => {
            fixture.componentInstance.isFilterable = true;
            grid.allowFiltering = true;
            fixture.detectChanges();
            await fixture.whenStable();

            // step 1 - filter the 'ID' column through the filter row
            GridFunctions.clickFilterCellChip(fixture, 'ID');
            await GridFunctions.applyFilter('2', fixture);
            await fixture.whenStable();
            fixture.detectChanges();

            expect(grid.filteringExpressionsTree.filteringOperands.length).toEqual(1);
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(2);

            GridFunctions.closeFilterRow(fixture);
            await fixture.whenStable();
            fixture.detectChanges();

            // step 2 - move the filtered column after 'Name' and verify it remains filtered
            const header = GridFunctions.getColumnHeader('ID', fixture).nativeElement as HTMLElement;
            const nameHeader = GridFunctions.getColumnHeader('Name', fixture).nativeElement as HTMLElement;
            const startRect = header.getBoundingClientRect();
            const targetRect = nameHeader.getBoundingClientRect();
            const startX = startRect.left + startRect.width / 2;
            const y = startRect.top + startRect.height / 2;
            const targetX = targetRect.right - 10;

            UIInteractions.simulatePointerEvent('pointerdown', header, startX, y);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, startX, y + 6);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, targetX, y + 6);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, targetX, y + 6);
            await wait();
            fixture.detectChanges();

            expect(grid.columns.map(c => c.field)).toEqual(['Name', 'ID', 'LastName', 'Region']);
            expect(grid.filteringExpressionsTree.filteringOperands.length).toEqual(1);
            expect(grid.getColumnByName('ID').filteringExpressionsTree.filteringOperands.length).toEqual(1);
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(2);
            expect(grid.getCellByColumn(0, 'Name').value).toEqual('Jane');
        });

        it('Should exit edit mode and discard the new value when column moving starts.', async () => {
            fixture.componentInstance.isEditable = true;
            fixture.detectChanges();

            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - enter edit mode on a cell
            const cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            const cacheValue = grid.getCellByColumn(0, 'ID').value;
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            cell.triggerEventHandler('dblclick', {});
            fixture.detectChanges();
            expect(grid.getCellByColumn(0, 'ID').editMode).toBe(true);

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
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 100, 71);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 100, 71);
            await wait();
            fixture.detectChanges();

            // step 4 - verify cell has exited edit mode correctly
            expect(grid.columns[1].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ID').editMode).toBe(false);
            expect(grid.getCellByColumn(0, 'ID').value).toBe(cacheValue);
        });

        it('Should preserve hidden columns order after columns are reordered.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - hide a column
            fixture.componentInstance.isHidden = true;
            fixture.detectChanges();
            fixture.detectChanges();

            // step 2 - move a column
            const header = headers[2].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 400, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 400, 71);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 80, 71);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 80, 71);
            await wait();
            fixture.detectChanges();

            expect(grid.visibleColumns[0].field).toEqual('Region');

            // step 3 - show hidden columns and verify correct order
            fixture.componentInstance.isHidden = false;
            fixture.detectChanges();
            fixture.detectChanges();

            expect(grid.visibleColumns[0].field).toEqual('ID');
            expect(grid.visibleColumns[1].field).toEqual('Region');
        });

        it('Should be able to reorder columns when a column is grouped.', async () => {
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
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 350, 135);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 350, 135);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
        });

        it('Should not break KB after columns are reordered - selection belongs to the moved column.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - select a cell from 'ID' column
            const cell = grid.gridAPI.get_cell_by_index(0, 'ID');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fixture.detectChanges();

            // step 2 - move that column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 330, 75);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');

            // step 3 - navigate right and verify cell selection is updated
            const gridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, grid);
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', gridContent.nativeElement, true);
            await nextFrame();
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'ID').selected).toBeTruthy();
        });

        it('Should not break KB after columns are reordered - selection does not belong to the moved column.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - select a cell from 'ID' column
            const cell = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            UIInteractions.simulateClickAndSelectEvent(cell);
            fixture.detectChanges();

            // step 2 - move that column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 65);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 156, 71);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 480, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 480, 75);
            await wait();
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('LastName');
            expect(columnsList[2].field).toEqual('ID');

            // step 3 - navigate and verify cell selection is updated
            const gridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, grid);
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', gridContent.nativeElement, true);
            await nextFrame();
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, 'LastName').selected).toBeTruthy();
        });

    });

    describe('', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(MovableTemplatedColumnsComponent);
            grid = fixture.componentInstance.grid;
            fixture.detectChanges();
        });

        it('Should reorder movable columns with templated headers.', async () => {
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
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 230, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 230, 30);
            await wait();
            fixture.detectChanges();

            // step 2 - verify column are reordered correctly
            const columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('Name');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('LastName');
        });
    });

    describe('', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(MovableColumnsLargeComponent);
            grid = fixture.componentInstance.grid;
            fixture.detectChanges();
        });

        it('Should be able to scroll forwards to reorder columns that are out of view.', async () => {

            // step 1 - start moving a column and verify columns are scrolled into view,
            // when holding the drag ghost over the right edge of the grid
            const header = grid.headerCellList[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            // pointermove is throttled to one per animation frame - let the next move through
            await waitFrames(2);
            // hover the right scroll area of the headers
            const scrollArea = grid.nativeElement.querySelector('.igx-grid__scroll-on-drag-right').getBoundingClientRect();
            UIInteractions.simulatePointerEvent('pointermove', header, Math.ceil(scrollArea.left) + 1, 30);
            // the headers are scrolled by 10px each animation frame while hovering - wait until the end is reached
            const hScroll = grid.headerContainer.getScroll();
            await vi.waitFor(() => expect(hScroll.scrollLeft).toBe(hScroll.scrollWidth - hScroll.clientWidth), { timeout: 5000 });
            fixture.detectChanges();

            // step 2 - verify the column being moved can be reordered among new columns
            // drop it on the left half of the last column (Fax), which was out of view initially
            const faxRect = GridFunctions.getColumnHeader('Fax', fixture).nativeElement.getBoundingClientRect();
            const dropX = faxRect.left + faxRect.width / 4;
            await waitFrames(2);
            UIInteractions.simulatePointerEvent('pointermove', header, dropX, 30);
            await waitFrames(2);
            UIInteractions.simulatePointerEvent('pointerup', header, dropX, 30);
            await wait();
            fixture.detectChanges();

            const list = grid.columns;
            expect(list[0].field).toEqual('CompanyName');
            expect(list[9].field).toEqual('ID');
            expect(list[10].field).toEqual('Fax');
        });

        it('Should be able to scroll backwards to reorder columns that are out of view.', async () => {

            // step 1 - scroll left to the end
            grid.headerContainer.getScroll().scrollLeft = 1000;
            await frames(2);
            fixture.detectChanges();

            // step 2 - start moving a column and verify columns are scrolled into view,
            // when holding the drag ghost over the left edge of the grid
            const header = grid.headerCellList[4].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 350, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 356, 56);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 10, 30);
            await wait(500);
            fixture.detectChanges();

            // step 3 - verify the column being moved can be reordered among new columns
            UIInteractions.simulatePointerEvent('pointermove', header, 130, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 130, 30);
            await wait();
            fixture.detectChanges();

            const list = grid.columns;
            expect(list[0].field).toEqual('ID');
            expect(list[7].field).toEqual('Region');
        });

        it('Should be able to scroll/reorder columns that are out of view - with pinned columns.', async () => {
            grid.getColumnByName('ID').pinned = true;
            fixture.detectChanges();

            // step 1 - scroll left to the end
            grid.headerContainer.getScroll().scrollLeft = 1000;
            await frames(2);
            fixture.detectChanges();

            // step 2 - start moving a column and verify columns are scrolled into view,
            // when holding the drag ghost before pinned area edge
            const header = grid.headerCellList[5].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 450, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 456, 56);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 110, 30);
            // the headers are scrolled back by 10px each animation frame while hovering - wait until the start is reached
            await vi.waitFor(() => expect(grid.headerContainer.getScroll().scrollLeft).toBe(0), { timeout: 5000, interval: 5 });
            fixture.detectChanges();

            // step 4 - verify the column being moved can be reordered among new columns
            UIInteractions.simulatePointerEvent('pointermove', header, 200, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 200, 30);
            await wait();
            fixture.detectChanges();

            const list = grid.columns;
            expect(list[0].field).toEqual('ID');
            expect(list[2].field).toEqual('Fax');
        });

        it('Should preserve cell selection after columns are reordered.', async () => {
            let headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - select a cell from the 'ID' column
            const cell = grid.gridAPI.get_cell_by_index(0, 'ID');
            cell.activate(null);
            fixture.detectChanges();
            expect(cell.selected).toBeTruthy();

            // step 2 - move that column and verify selection is preserved
            let header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 70, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 64, 56);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 280, 25);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 280, 25);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[2].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'CompanyName').selected).toBeTruthy();

            // step 3 - move another column and verify selection is preserved
            headers = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
            header = headers[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 56);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 40, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 25);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('ContactName');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ContactName').selected).toBeTruthy();
        });

        it('Should preserve cell selection after columns are reordered programatically.', async () => {
            let columnsList = grid.columns;

            // step 1 - select a cell from the 'ID' column
            const cell = grid.gridAPI.get_cell_by_index(0, 'ID');
            cell.activate(null);
            fixture.detectChanges();
            expect(cell.selected).toBeTruthy();

            // step 2 - move that column and verify selection is preserved
            const column = columnsList[0] as IgxColumnComponent;
            column.move(2);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[2].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'CompanyName').selected).toBeTruthy();
        });

        it('Should preserve cell selection after columns are reordered - horizontal scrolling.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - select a visible cell from the 'ID' column
            const cell = grid.gridAPI.get_cell_by_index(0, 'ID');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fixture.detectChanges();
            expect(cell.selected).toBeTruthy();

            GridSelectionFunctions.verifySelectedRange(grid, 0, 0, 0, 0);

            // step 2 - reorder that column among columns that are currently out of view
            // and verify selection is preserved
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            await wait(1000);
            fixture.detectChanges();

            UIInteractions.simulatePointerEvent('pointermove', header, 350, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 350, 30);
            await wait();
            fixture.detectChanges();

            GridSelectionFunctions.verifySelectedRange(grid, 0, 0, 0, 0);
        });

        it('Should preserve cell selection after columns are reordered - vertical scrolling.', async () => {
            // step 1 - scroll left to the end
            grid.headerContainer.getScroll().scrollLeft = 1000;
            await nextFrame();
            fixture.detectChanges();

            // step 2 - scroll down vertically and select a cell that was initially out of view
            grid.verticalScrollContainer.getScroll().scrollTop = 1200;
            await nextFrame();
            fixture.detectChanges();

            const cell = grid.gridAPI.get_cell_by_index(25, 'Phone');
            const selectedData = [{ Phone: '40.32.21.21' }];
            UIInteractions.simulateClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.selected).toBeTruthy();
            GridSelectionFunctions.verifySelectedRange(grid, 25, 25, 9, 9);
            expect(grid.getSelectedData()).toEqual(selectedData);

            // step 3 - scroll up vertically so that the selected cell becomes out of view
            grid.verticalScrollContainer.getScroll().scrollTop = 0;
            await nextFrame();
            fixture.detectChanges();

            // step 4 - reorder that "Phone" column
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[4].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 350, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 356, 56);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 10, 30);
            await nextFrame();
            fixture.detectChanges();

            UIInteractions.simulatePointerEvent('pointermove', header, 40, 30);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 30);
            await nextFrame();
            fixture.detectChanges();

            // step 5 - verify selection is preserved
            grid.verticalScrollContainer.getScroll().scrollTop = 1200;
            await nextFrame();
            fixture.detectChanges();

            const newSelectedData = [{ Country: 'France' }];
            GridSelectionFunctions.verifySelectedRange(grid, 25, 25, 9, 9);
            expect(grid.getSelectedData()).toEqual(newSelectedData);
        });

        it('Should affect all pages when columns are reordered programatically and paging is enabled.', async () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();

            let columnsList = grid.columns;

            // step 1 - move a column
            const column = columnsList[0] as IgxColumnComponent;
            column.move(2);
            await wait();
            fixture.detectChanges();

            // step 2 - navigate to page 2 and verify correct column order
            grid.paginator.paginate(1);
            fixture.detectChanges();

            columnsList = grid.columns;
            expect(columnsList[2].field).toEqual('ID');
            expect(columnsList[3].field).toEqual('ContactTitle');
            expect(columnsList[4].field).toEqual('Address');
        });

        it('Should affect all pages when columns are reordered and paging is enabled.', async () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();

            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - move a column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 420, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 420, 31);
            await wait();
            fixture.detectChanges();

            // step 2 - navigate to page 2 and verify correct column order
            grid.paginator.paginate(1);
            fixture.detectChanges();

            const columnsList = grid.columns;
            expect(columnsList[2].field).toEqual('ContactTitle');
            expect(columnsList[3].field).toEqual('ID');
            expect(columnsList[4].field).toEqual('Address');
        });

        it('Should preserve sorting after columns are reordered.', async () => {
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - sort the 'ID' column
            headers[0].triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            // step 2 - move that column
            const header = headers[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 420, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 420, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column remains sorted
            expect(grid.columns[3].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
        });

        it('Should preserve sorting after columns are reordered programatically.', async () => {
            const columnsList = grid.columns;
            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            // step 1 - sort the 'ID' column
            headers[0].triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            // step 2 - move that column
            const column = columnsList[0] as IgxColumnComponent;
            column.move(3);
            await wait();
            fixture.detectChanges();
            fixture.detectChanges();

            // step 3 - verify column remains sorted
            expect(grid.columns[3].field).toEqual('ID');
            expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
        });

        it('Pinning - should be able to reorder pinned columns among themselves.', async () => {

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
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 280, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 280, 31);
            await nextFrame();
            fixture.detectChanges();

            // step 3 - verify pinned columns are reordered correctly
            expect(grid.pinnedColumns[0].field).toEqual('ID');
            expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
            expect(grid.pinnedColumns[2].field).toEqual('Address');
        });

        it('Pinning - should be able to programatically reorder pinned columns among themselves.', async () => {
            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('ContactTitle').pinned = true;
            fixture.detectChanges();

            // step 2 - move a pinned column
            const column = grid.getColumnByName('ID');
            column.move(2);
            await wait();
            fixture.detectChanges();

            // step 3 - verify pinned columns are reordered correctly
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
            expect(grid.pinnedColumns[2].field).toEqual('ID');
        });

        it('Pinning - should pin an unpinned column when drag/drop it among pinned columns.', async () => {

            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            fixture.detectChanges();

            // step 2 - drag/drop an unpinned column among pinned columns
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[3].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 350, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 350, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 130, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 130, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column is pinned at the correct place
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ContactName');
            expect(grid.pinnedColumns[2].field).toEqual('ID');
            expect(grid.getColumnByName('ContactName').pinned).toBeTruthy();
        });

        it('Pinning - should unpin a pinned column when drag/drop it among unpinned columns.', async () => {

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
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 330, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 330, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column is unpinned at the correct place
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
            expect(grid.unpinnedColumns[0].field).toEqual('ID');
            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
        });

        it('Pinning - should not be able to pin a column if pinned area exceeds maximum allowed width.', async () => {

            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('ContactTitle').pinned = true;
            fixture.detectChanges();

            // step 2 - try drag/drop an unpinned column among pinned columns
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 450, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 450, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 180, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 180, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column cannot be pinned
            expect(grid.pinnedColumns.length).toEqual(3);
            expect(grid.unpinnedColumns[0].field).toEqual('CompanyName');
            expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
        });

        it('Pinning - Should be able to pin/unpin columns programmatically', async () => {
            const columnsList = grid.columns;

            // step 1 - pin some columns
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('CompanyName').pinned = true;
            fixture.detectChanges();

            // step 2 - pin a column interactively via drag/drop
            // step 2 - move that column and verify selection is preserved
            const column = columnsList[4] as IgxColumnComponent;
            column.move(2);
            await wait();
            fixture.detectChanges();

            // step 3 - unpin that column programmatically and verify correct order
            grid.getColumnByName('ID').unpin();
            fixture.detectChanges();

            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.unpinnedColumns[0].field).toEqual('ID');
        });

        it('Pinning - Should be able to pin/unpin columns both: programmatically and interactively via drag/drop.', async () => {

            // step 1 - pin some columns
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('CompanyName').pinned = true;
            fixture.detectChanges();

            // step 2 - pin a column interactively via drag/drop
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[4].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 450, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 450, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 80, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 80, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - unpin that column programmatically and verify correct order
            grid.getColumnByName('ID').unpin();
            fixture.detectChanges();

            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.unpinnedColumns[0].field).toEqual('ID');
        });

        it('Pinning - Should not be able to pin a column if disablePinning is enabled for that column', async () => {
            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('ContactName').disablePinning = true;
            fixture.detectChanges();

            // step 2 - drag/drop an unpinned column among pinned columns
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[3].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 350, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 350, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 130, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 130, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column is still unpinned
            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ID');
            expect(grid.unpinnedColumns[0].field).toEqual('CompanyName');
            expect(grid.unpinnedColumns[1].field).toEqual('ContactName');
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();
        });

        it('Pinning - Should not be able to pin a column programmaticaly if disablePinning is enabled for that column', async () => {

            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ID').pinned = true;
            grid.getColumnByName('ContactName').disablePinning = true;
            fixture.detectChanges();

            // step 2 - drag/drop an unpinned column among pinned columns
            // step 2 - move that column and verify selection is preserved
            const column = grid.getColumnByName('ContactName') as IgxColumnComponent;
            column.move(1);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column is still unpinned
            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ID');
            expect(grid.unpinnedColumns[0].field).toEqual('CompanyName');
            expect(grid.unpinnedColumns[1].field).toEqual('ContactName');
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();
        });

        it('Pinning - Should not be able to move unpinned column if disablePinning is enabled for all unpinned columns', async () => {
            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ContactTitle').pinned = true;

            grid.columns.forEach((column) => {
                if (column.field !== 'Address' && column.field !== 'ContactTitle') {
                    column.disablePinning = true;
                }
            });
            fixture.detectChanges();

            // step 2 - drag/drop a pinned column among unpinned columns
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[2].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 350, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 350, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 400, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 400, 31);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column is unpinned at the correct place
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
            expect(grid.unpinnedColumns[0].field).toEqual('CompanyName');
            expect(grid.unpinnedColumns[1].field).toEqual('ID');
            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
        });


        it('Pinning - Should not be able to programmatically move unpinned column if disablePinning is enabled for all unpinned columns', async () => {
            // step 1 - pin some columns
            grid.getColumnByName('Address').pinned = true;
            grid.getColumnByName('ContactTitle').pinned = true;
            fixture.detectChanges();

            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
            expect(grid.unpinnedColumns[0].field).toEqual('ID');
            expect(grid.unpinnedColumns[1].field).toEqual('CompanyName');

            grid.columns.forEach((col) => {
                if (col.field !== 'Address' && col.field !== 'ContactTitle') {
                    col.disablePinning = true;
                }
            });
            fixture.detectChanges();

            // step 2 - drag/drop a pinned column among unpinned columns
            const column = grid.getColumnByName('ID') as IgxColumnComponent;
            column.move(1);
            await wait();
            fixture.detectChanges();

            // step 3 - verify column is unpinned at the correct place
            expect(grid.pinnedColumns[0].field).toEqual('Address');
            expect(grid.pinnedColumns[1].field).toEqual('ContactTitle');
            expect(grid.unpinnedColumns[0].field).toEqual('ID');
            expect(grid.unpinnedColumns[1].field).toEqual('CompanyName');
            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
        });
    });

    describe('', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(MultiColumnHeadersComponent);
            grid = fixture.componentInstance.grid;
            grid.moving = true;
            // The pointer coordinates in these tests assume an 800px wide grid
            grid.width = '800px';
            fixture.detectChanges();
        });

        it('MCH - should reorder only columns on the same level (top level simple column).', async () => {

            // step 1 - try reordering simple column level 0 and simple column level 1
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 200, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 200, 81);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');

            // step 2 - try reordering simple column level 0 and group column level 1
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 380, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 380, 81);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');

            // step 3 - try reordering simple column level 0 and group column level 0
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 380, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 380, 25);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[3].field).toEqual('Missing');
        });

        it('MCH - should programmatically reorder columns', async () => {
            // step 1 - move level 0 column to first position
            let column = grid.getColumnByName('ID');
            column.move(0);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Missing');
            expect(columnsList[2].field).toEqual('CompanyName');

            // step 2 - try moving level 0 column into column group // not possible
            column.move(3);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Missing');
            expect(columnsList[2].field).toEqual('CompanyName');
            expect(columnsList[3].field).toEqual('ContactName');

            // step 3 - try moving level 0 column into column group // not possible
            column.move(5);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('ID');
            expect(columnsList[1].field).toEqual('Missing');
            expect(columnsList[2].field).toEqual('CompanyName');
            expect(columnsList[3].field).toEqual('ContactName');

            // step 4 - try moving level 0 column between two column groups
            column.move(4);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('ContactTitle');
            expect(columnsList[4].field).toEqual('ID');

            // step 5 - move level 0 column to last position
            column.move(8);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');
            expect(columnsList[8].field).toEqual('ID');

            // step 6 - move last column between two column groups
            column.move(4);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('ContactTitle');
            expect(columnsList[4].field).toEqual('ID');


            // step 7 - move level 1 column in the group
            column = grid.getColumnByName('Address');
            column.move(5);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[4].field).toEqual('ID');
            expect(columnsList[5].field).toEqual('Address');
            expect(columnsList[6].field).toEqual('Country');

            // step 8 - move level 1 column outside the group // not possible
            column.move(4);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[4].field).toEqual('ID');
            expect(columnsList[5].field).toEqual('Address');
            expect(columnsList[6].field).toEqual('Country');

            // step 9 - move level 2 column outsuide the group
            column = grid.getColumnByName('ContactName');
            column.move(0);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('ContactTitle');

            // step 10 - move level 2 column inside the group
            column = grid.getColumnByName('ContactTitle');
            column.move(2);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactTitle');
            expect(columnsList[3].field).toEqual('ContactName');

            // step 11 - move level 2 column inside the group
            column = grid.getColumnByName('Missing');
            column.move(8);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[1].field).toEqual('ContactTitle');
            expect(columnsList[2].field).toEqual('ContactName');
            expect(columnsList[7].field).toEqual('City');
            expect(columnsList[8].field).toEqual('Missing');

            column = grid.getColumnByName('CompanyName');
            column.move(1);
            await wait();
            fixture.detectChanges();

            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[1].field).toEqual('ContactTitle');
            expect(columnsList[2].field).toEqual('ContactName');

            column.move(2);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('ContactTitle');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[2].field).toEqual('CompanyName');
        });

        it('MCH - should not move group column to last position', async () => {
            let column: ColumnType = grid.getColumnByName('Missing');
            column.move(3);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('Missing');

            column = grid.getColumnByName('CompanyName').topLevelParent;
            column.move(8);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('Missing');
        });

        it('MCH - should be able to move group column to position lastIndex - group.children.length', async () => {
            let column: ColumnType = grid.getColumnByName('Missing');
            column.move(3);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('Missing');

            column = grid.getColumnByName('CompanyName').topLevelParent;
            column.move(6);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[6].field).toEqual('CompanyName');
            expect(columnsList[7].field).toEqual('ContactName');
            expect(columnsList[8].field).toEqual('ContactTitle');
        });

        it('MCH - trying to move level 1 column to last position should be impossible', async () => {

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');
            expect(columnsList[8].field).toEqual('Address');

            // step 1 - move level 0 column to first position
            const column = grid.getColumnByName('CompanyName');
            column.move(8);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');
            expect(columnsList[8].field).toEqual('Address');
        });

        it('MCH - should reorder only columns on the same level (top level group column).', async () => {

            // step 1 - try reordering group column level 0 and simple column level 1
            let header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 250, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 650, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 650, 75);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');
            expect(columnsList[5].field).toEqual('Country');

            // step 2 - try reordering group column level 0 and simple column level 0
            UIInteractions.simulatePointerEvent('pointerdown', header, 250, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 250, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 570, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointerup', header, 570, 81);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('CompanyName');

            // step 3 - try reordering group column level 0 and group column level 0
            header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[2].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 700, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 700, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 200, 31);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 200, 31);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('ID');
            expect(columnsList[2].field).toEqual('Country');
            expect(columnsList[3].field).toEqual('Region');
        });

        it('MCH - should reorder only columns on the same level (sub level simple column).', async () => {

            // step 1 - try reordering simple column level 1 and simple column level 0
            const header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 106);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 40, 106);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 106);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');

            // step 2 - try reordering simple column level 1 and simple column level 2
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 106);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 125);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 300, 125);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');

            // step 3 - try reordering simple column level 1 and group column level 0
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 106);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 700, 30);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 700, 30);

            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[4].field).toEqual('ID');

            // step 4 - try reordering simple column level 1 and group column level 1
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 106);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 430, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 430, 75);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('CompanyName');
        });

        it('MCH - should reorder only columns on the same level (sub level group column).', async () => {

            // step 1 - try reordering group column level 1 and simple column level 0
            const header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[1].nativeElement;

            UIInteractions.simulatePointerEvent('pointerdown', header, 300, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 40, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 81);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');

            // step 2 - try reordering group column level 1 and group column level 0
            UIInteractions.simulatePointerEvent('pointerdown', header, 300, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 800, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 800, 25);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[2].field).toEqual('ContactName');

            // step 3 - try reordering group column level 1 and simple column level 1
            UIInteractions.simulatePointerEvent('pointerdown', header, 300, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 130, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 130, 81);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('ContactName');
            expect(columnsList[3].field).toEqual('CompanyName');
        });

        it('MCH - should reorder only columns on the same level, with same parent.', async () => {

            // step 1 - try reordering simple column level 1 and simple column level 1 (different parent)
            let header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 660, 100);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 600, 100);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[1].field).toEqual('CompanyName');
            expect(columnsList[5].field).toEqual('Country');

            // step 2 - try reordering simple column level 2 and simple column level 2 (same parent)
            header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[3].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 400, 125);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 400, 131);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 260, 131);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 260, 131);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[2].field).toEqual('ContactTitle');
            expect(columnsList[3].field).toEqual('ContactName');

            // step 3 - try reordering simple column level 0 and simple column level 0 (no parent)
            header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 50, 81);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 580, 81);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 580, 81);
            await wait();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[3].field).toEqual('ID');
            expect(columnsList[4].field).toEqual('Missing');
        });

        it('MCH - should not break selection and keyboard navigation when reordering columns.', async () => {

            // step 1 - select a cell from 'ContactName' column
            const cell = grid.gridAPI.get_cell_by_index(0, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fixture.detectChanges();

            GridSelectionFunctions.verifySelectedRange(grid, 0, 0, 2, 2);

            // step 2 - reorder the parent column and verify selection is preserved
            const header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 300, 25);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 300, 31);
            await nextFrame();
            UIInteractions.simulatePointerEvent('pointermove', header, 580, 50);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 580, 50);
            await wait();
            fixture.detectChanges();

            GridSelectionFunctions.verifySelectedRange(grid, 0, 0, 2, 2);
            expect(grid.getSelectedData()).toEqual([{ CompanyName: 'Alfreds Futterkiste' }]);

            // step 3 - navigate right and verify cell selection is updated
            const cellEl = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2];
            UIInteractions.simulateClickAndSelectEvent(cellEl);
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', cellEl.nativeElement, true);
            await nextFrame();
            fixture.detectChanges();

            GridSelectionFunctions.verifySelectedRange(grid, 0, 0, 3, 3);
            expect(grid.getSelectedData()).toEqual([{ ContactName: 'Maria Anders' }]);
        });

        it('MCH - should pin only top level columns.', async () => {
            fixture.componentInstance.isPinned = true;
            await wait();
            fixture.detectChanges();

            // step 2 - try pinning a sub level simple column
            let header = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS))[1].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 75);
            await wait();
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 81);
            await wait();
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', header, 30, 50);
            await wait();
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointerup', header, 30, 50);
            await wait();
            fixture.detectChanges();

            let columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('Missing');
            expect(columnsList[1].field).toEqual('CompanyName');

            // step 3 - try pinning a top level group column
            header = fixture.debugElement.queryAll(By.css(COLUMN_GROUP_HEADER_CLASS))[0].nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 150, 25);
            await wait();
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', header, 150, 31);
            await nextFrame();
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', header, 40, 50);
            await nextFrame();
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointerup', header, 40, 50);
            await nextFrame();
            fixture.detectChanges();

            columnsList = grid.columns.filter((col) => !(col instanceof IgxColumnGroupComponent));
            expect(columnsList[0].field).toEqual('CompanyName');
            expect(columnsList[3].field).toEqual('Missing');
        });
    });
});
