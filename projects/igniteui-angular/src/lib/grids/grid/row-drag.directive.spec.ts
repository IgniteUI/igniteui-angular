import { Component, ViewChild, DebugElement } from '@angular/core';
import { TestBed, async, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { DataParent, SampleTestData } from '../../test-utils/sample-test-data.spec';
import { Point } from '../../services';

import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { IgxColumnComponent } from '../column.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxRowDragDirective } from '../row-drag.directive';
import { IRowDragStartEventArgs, IgxGridBaseComponent, IRowDragEndEventArgs } from '../grid-base.component';
import { IgxDropDirective } from '../../directives/dragdrop/dragdrop.directive';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxHierarchicalGridComponent, IgxHierarchicalGridModule, IgxRowComponent } from '../hierarchical-grid';
import { IgxRowIslandComponent } from '../hierarchical-grid/row-island.component';
import { IgxTreeGridComponent, IgxTreeGridModule } from '../tree-grid';


const DEBOUNCE_TIME = 50;
const CSS_CLASS_DRAG_INDICATOR = 'igx-grid__drag-indicator';
const CSS_CLASS_DRAG_INDICATOR_OFF = 'igx-grid__drag-indicator--off';
const CSS_CLASS_DRAG_ROW = 'igx-grid__tr--drag';
const CSS_CLASS_GHOST_ROW = 'igx-grid__tr--ghost';
const CSS_CLASS_SELECTED_ROW = 'igx-grid__tr--selected';
const CSS_CLASS_SELECTION_CHECKBOX = '.igx-grid__cbx-selection';
const CSS_CLASS_VIRTUAL_HSCROLLBAR = '.igx-vhelper--horizontal';
const CSS_CLASS_LAST_PINNED_HEADER = 'igx-grid__th--pinned-last';

describe('IgxGrid - Row Drag Tests', () => {
    let fixture: ComponentFixture<any>;
    let dropAreaElement: Element;
    let dragIndicatorElements: DebugElement[];
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridRowDraggableComponent,
                IgxGridFeaturesRowDragComponent,
                IgxHierarchicalGridTestComponent,
                IgxTreeGridTestComponent,
                IgxTreeGridDeleteRowTestComponent
            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                IgxGridModule,
                IgxHierarchicalGridModule,
                IgxTreeGridModule
            ]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe('General Tests', () => {
        let grid: IgxGridComponent;
        let dropArea: IgxDropDirective;
        let nonDroppableAreaElement: Element;
        let rows: IgxGridRowComponent[];
        let dragRows: DebugElement[];
        // configureTestSuite();
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxGridRowDraggableComponent);
            grid = fixture.componentInstance.instance;
            dropArea = fixture.componentInstance.dropArea;
            fixture.detectChanges();
            rows = grid.rowList.toArray();
            dropAreaElement = fixture.debugElement.query(By.css('.droppable-area')).nativeElement;
            nonDroppableAreaElement = fixture.debugElement.query(By.css('.non-droppable-area')).nativeElement;
            dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
        }));

        it('should drag and drop draggable row over droppable container', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(rows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');

            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(grid, row, rowDragDirective);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();

            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(grid, row, rowDragDirective, false);
        }));
        it('should be able to drag row only by drag icon', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const row = rows[1];
            const rowElement = row.nativeElement;

            const dragIndicatorPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            const rowPoint = UIInteractions.getPointFromElement(rowElement);
            const movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
            spyOn(grid.onRowDragStart, 'emit');

            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();

            await pointerDown(rowElement, rowPoint, fixture);
            await pointerMove(rowElement, movePoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(0);

            await pointerDown(dragIndicatorElement, dragIndicatorPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(grid, row, rowDragDirective);
            await pointerUp(dragIndicatorElement, movePoint, fixture);
        }));
        it('should not be able to drag grid header', (async () => {
            const headerDragIndicatorElement = dragIndicatorElements[0].nativeElement;
            const startPoint: Point = UIInteractions.getPointFromElement(headerDragIndicatorElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);
            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');

            await pointerDown(headerDragIndicatorElement, startPoint, fixture);
            await pointerMove(headerDragIndicatorElement, dropPoint, fixture);
            expect(grid.rowDragging).toBeFalsy();
            expect(grid.onRowDragStart.emit).not.toHaveBeenCalled();
        }));
        it('should cancel dragging when ESCAPE key is pressed.', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[1];

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(rows[4].nativeElement);
            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(grid.rowDragging).toBeTruthy();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);

            UIInteractions.simulateKeyDownEvent(dragIndicatorElement, 'Escape');
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(grid.rowDragging).toBeFalsy();
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(1);
        }));
        it('should create ghost element upon row dragging', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(rows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);
            let ghostElements: HTMLCollection;

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
            expect(ghostElements.length).toEqual(1);

            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
            expect(ghostElements.length).toEqual(0);
        }));
        it('should apply drag class to row upon row dragging', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[1];

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(rows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            expect(row.element.nativeElement.classList.contains(CSS_CLASS_DRAG_ROW)).toBeFalsy();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            expect(row.element.nativeElement.classList.contains(CSS_CLASS_DRAG_ROW)).toBeTruthy();

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            expect(row.element.nativeElement.classList.contains(CSS_CLASS_DRAG_ROW)).toBeFalsy();
        }));
        it('should align horizontal scrollbar with first column when column pinning is disabled', fakeAsync(() => {
            // has no draggable and selectable rows
            grid.rowSelectable = false;
            grid.rowDraggable = false;
            tick();
            fixture.detectChanges();
            let rowSelectElement: DebugElement = fixture.debugElement.query(By.css(CSS_CLASS_SELECTION_CHECKBOX));
            let dragIndicatorElement: DebugElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            let horizontalScrollbarElement: DebugElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
            expect(rowSelectElement).toBeNull();
            expect(dragIndicatorElement).toBeNull();

            // has draggable rows and has no selectable rows
            grid.rowSelectable = false;
            grid.rowDraggable = true;
            tick();
            fixture.detectChanges();
            rowSelectElement = fixture.debugElement.query(By.css(CSS_CLASS_SELECTION_CHECKBOX));
            dragIndicatorElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            horizontalScrollbarElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
            const dragIndicatorRect = dragIndicatorElement.nativeElement.getBoundingClientRect();
            let horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();
            expect(rowSelectElement).toBeNull();
            expect(dragIndicatorRect.right).toBe(horizontalScrollbarRect.left);

            // has draggable and selectable rows
            grid.rowSelectable = true;
            grid.rowDraggable = true;
            fixture.detectChanges();
            horizontalScrollbarElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
            horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();

            // The horizontal scrollbar should not be visible
            expect(horizontalScrollbarRect.left).toBe(0);
        }));
        it('should align horizontal scrollbar with first non-pinned column when column pinning is enabled', fakeAsync(() => {
            grid.pinColumn('ProductName');
            tick();
            fixture.detectChanges();

            // selectable rows disabled
            let horizontalScrollbarElement: DebugElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
            let horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();
            let pinnedColumnHeaderElement: DebugElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_LAST_PINNED_HEADER));
            let pinnedColumnHeaderRect = pinnedColumnHeaderElement.nativeElement.getBoundingClientRect();

            // The horizontal scrollbar should not be visible
            expect(horizontalScrollbarRect.left).toBe(0);

            // selectable rows enabled
            grid.rowSelectable = true;
            fixture.detectChanges();
            horizontalScrollbarElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
            horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();
            pinnedColumnHeaderElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_LAST_PINNED_HEADER));
            pinnedColumnHeaderRect = pinnedColumnHeaderElement.nativeElement.getBoundingClientRect();
            expect(pinnedColumnHeaderRect.right).toBe(horizontalScrollbarRect.left);
        }));
        it('should fire drag events with correct values of event arguments.', (async () => {
            const rowToDrag: IgxGridRowComponent = rows[2];
            const rowDragDirective = dragRows[2].injector.get(IgxRowDragDirective);
            const dragIndicatorElement: Element = dragIndicatorElements[3].nativeElement;

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const endPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(grid.onRowDragStart, 'emit').and.callThrough();
            spyOn(grid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, endPoint, fixture);
            verifyRowDragStartEvent(grid, rowToDrag, rowDragDirective);

            await pointerMove(dragIndicatorElement, endPoint, fixture);
            await pointerUp(dragIndicatorElement, endPoint, fixture);
            verifyRowDragEndEvent(grid, rowToDrag, rowDragDirective, false);
        }));
        it('should emit dragdrop events if dropping a row on a non-interactive area', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const dragRow = rows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(rows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(nonDroppableAreaElement);

            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');

            expect(dragRow.dragging).toBeFalsy();
            expect(dragRow.grid.rowDragging).toBeFalsy();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(dragRow.dragging).toBeTruthy();
            expect(dragRow.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(grid, dragRow, rowDragDirective);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            expect(dragRow.dragging).toBeTruthy();
            expect(dragRow.grid.rowDragging).toBeTruthy();

            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(dragRow.dragging).toBeFalsy();
            expect(dragRow.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(grid, dragRow, rowDragDirective, false);
        }));

        it('should destroy the drag ghost if dropping a row on a non-interactive area when animations are enabled', (async () => {
            grid.onRowDragEnd.subscribe((e: IRowDragEndEventArgs) => {
                e.animation = true;
            });
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const dragRow = rows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(rows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(nonDroppableAreaElement);

            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');

            expect(dragRow.dragging).toBeFalsy();
            expect(dragRow.grid.rowDragging).toBeFalsy();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(dragRow.dragging).toBeTruthy();
            expect(dragRow.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(grid, dragRow, rowDragDirective);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            expect(dragRow.dragging).toBeTruthy();
            expect(dragRow.grid.rowDragging).toBeTruthy();

            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(dragRow.dragging).toBeFalsy();
            expect(dragRow.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(grid, dragRow, rowDragDirective, false);
            const ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
            expect(ghostElements.length).toEqual(0);
            const dragIndicatorsOff = document.getElementsByClassName(CSS_CLASS_DRAG_INDICATOR_OFF);
            expect(dragIndicatorsOff.length).toEqual(0);
        }));

        it('should be able to cancel onRowDragStart event.', (async () => {
            grid.onRowDragStart.subscribe((e: IRowDragStartEventArgs) => {
                e.cancel = true;
            });
            const rowToDrag: IgxGridRowComponent = rows[2];
            const dragIndicatorElement: Element = dragIndicatorElements[rowToDrag.index].nativeElement;

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const endPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(grid.onRowDragStart, 'emit').and.callThrough();
            spyOn(grid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, endPoint, fixture);
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);

            await pointerMove(dragIndicatorElement, endPoint, fixture);
            await pointerUp(dragIndicatorElement, endPoint, fixture);
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(0);
            const ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
            expect(ghostElements.length).toEqual(0);
        }));
    });
    describe('Grid Features Integration Tests', () => {
        let dragGrid: IgxGridComponent;
        let dropGrid: IgxGridComponent;
        let dragGridRows: IgxGridRowComponent[];
        let dropGridRows: IgxGridRowComponent[];
        let dragRows: DebugElement[];
        // configureTestSuite();
        function verifyDragAndDropRowCellValues(dragRowIndex: number, dropRowIndex: number) {
            const dragRow = dragGrid.getRowByIndex(dragRowIndex);
            const dragRowCells = dragRow.cells.toArray();

            const dropRow = dropGrid.getRowByIndex(dropRowIndex);
            const dropRowCells = dropRow.cells.toArray();
            for (let cellIndex = 0; cellIndex < dropRowCells.length; cellIndex++) {
                expect(dropRowCells[cellIndex].value).toEqual(dragRowCells[cellIndex].value);
            }
        }
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxGridFeaturesRowDragComponent);
            dragGrid = fixture.componentInstance.dragGrid;
            dropGrid = fixture.componentInstance.dropGrid;
            fixture.detectChanges();
            dragGridRows = dragGrid.rowList.toArray();
            dropAreaElement = fixture.debugElement.query(By.directive(IgxDropDirective)).nativeElement;
            dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
        }));

        it('should drop row data in the proper grid columns', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            verifyDragAndDropRowCellValues(1, 0);
        }));
        it('should be able to drag grid row when column moving is enabled', (async () => {
            const dragGridColumns = dragGrid.columnList.toArray();
            dragGrid.moveColumn(dragGridColumns[0], dragGridColumns[2]);
            fixture.detectChanges();

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const dragRowCells = row.cells.toArray();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);

            dropGridRows = dropGrid.rowList.toArray();
            const dropRowCells = dropGridRows[0].cells.toArray();
            expect(dropRowCells[0].value).toEqual(dragRowCells[2].value);
            expect(dropRowCells[1].value).toEqual(dragRowCells[0].value);
            expect(dropRowCells[2].value).toEqual(dragRowCells[1].value);
            expect(dropRowCells[3].value).toEqual(dragRowCells[3].value);
            expect(dropRowCells[4].value).toEqual(dragRowCells[4].value);
        }));
        it('should be able to drag grid row when column pinning is enabled', (async () => {
            dragGrid.pinColumn('ProductName');

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const dragRowCells = row.cells.toArray();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);

            dropGridRows = dropGrid.rowList.toArray();
            const dropRowCells = dropGridRows[0].cells.toArray();
            expect(dropRowCells[0].value).toEqual(dragRowCells[1].value);
            expect(dropRowCells[1].value).toEqual(dragRowCells[2].value);
            expect(dropRowCells[2].value).toEqual(dragRowCells[0].value);
            expect(dropRowCells[3].value).toEqual(dragRowCells[3].value);
            expect(dropRowCells[4].value).toEqual(dragRowCells[4].value);
        }));
        it('should be able to drag grid row when column hiding is enabled', (async () => {
            const hiddenDragCellValue = dragGrid.getCellByColumn(1, 'Downloads').value;
            dragGrid.columnHiding = true;
            const column = dragGrid.getColumnByName('Downloads');
            column.hidden = true;

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(dragGrid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(dragGrid.rowDragging).toBeFalsy();
            expect(dropGrid.rowList.length).toEqual(1);
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);

            const hiddenDropCellValue = dropGrid.getCellByColumn(0, 'Downloads').value;
            expect(hiddenDropCellValue).toEqual(hiddenDragCellValue);

        }));
        it('should be able to drag sorted grid row', (async () => {
            dragGrid.sort({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true });

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            verifyDragAndDropRowCellValues(1, 0);
        }));
        it('should be able to drag filtered grid row', (async () => {
            dragGrid.filter('ProductName', 'Advantage', IgxStringFilteringOperand.instance().condition('contains'), true);

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            verifyDragAndDropRowCellValues(1, 0);
        }));
        it('should be able to drag selected grid row', (async () => {
            dragGrid.rowSelectable = true;
            fixture.detectChanges();
            dragGrid.selectRows([2], false);
            fixture.detectChanges();

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            expect(row.isSelected).toBeTruthy();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            expect(row.isSelected).toBeTruthy();
        }));
        it('should not apply selection class to ghost element when dragging selected grid row', (async () => {
            dragGrid.rowSelectable = true;
            fixture.detectChanges();
            dragGrid.selectRows([2], false);
            fixture.detectChanges();

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            expect(row.isSelected).toBeTruthy();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();

            const ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
            const ghostElement = ghostElements[0];
            expect(ghostElements.length).toEqual(1);
            expect(ghostElement.classList.contains(CSS_CLASS_SELECTED_ROW)).toBeFalsy();

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
        }));
        it('should be able to drag grid row with selected cells', (async () => {
            const range = { rowStart: 1, rowEnd: 1, columnStart: 0, columnEnd: 2 };
            dragGrid.selectRange(range);
            fixture.detectChanges();

            const verifyCellSelection = function () {
                for (let index = 0; index < rowCells.length; index++) {
                    const cellSelected = index <= 2 ? true : false;
                    expect(rowCells[index].selected).toEqual(cellSelected);
                }
            };

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const rowCells = row.cells.toArray();
            verifyCellSelection();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            verifyCellSelection();
        }));
        it('should be able to drag grouped grid row', (async () => {
            dragGrid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            const dragIndicatorElement = dragIndicatorElements[3].nativeElement;
            const row = dragGridRows[2];
            const rowDragDirective = dragRows[2].injector.get(IgxRowDragDirective);
            const rowCells = row.cells.toArray();
            const groupHeader = dragGrid.groupsRecords.find(function (element) {
                return element.value === rowCells[2].value;
            });
            let groupRow = groupHeader.records.find(function (element) {
                return element['ID'] === rowCells[1].value;
            });
            expect(groupHeader.records.length).toEqual(2);
            expect(groupRow).toBeDefined();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            expect(groupHeader.records.length).toEqual(2);
            groupRow = groupHeader.records.find(function (element) {
                return element['ID'] === rowCells[1].value;
            });
            expect(groupRow).toBeDefined();
        }));
        it('should exit edit mode and commit changes on row dragging', (async () => {
            dragGrid.rowEditable = true;
            fixture.detectChanges();

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            const dragCell = dragGrid.getCellByColumn(1, 'Downloads');
            const cellElement = dragCell.nativeElement;
            let cellInput = null;

            spyOn(dragGrid, 'endEdit').and.callThrough();

            cellElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            cellElement.dispatchEvent(new Event('dblclick'));
            fixture.detectChanges();

            const newCellValue = 2000;
            cellInput = cellElement.querySelector('[igxinput]');
            cellInput.value = newCellValue;
            cellInput.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(row.inEditMode).toBeTruthy();
            expect(dragCell.editMode).toEqual(true);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            expect(dragGrid.endEdit).toHaveBeenCalled();
            expect(row.inEditMode).toBeFalsy();
            expect(dragCell.editMode).toEqual(false);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();

            const dropCell = dropGrid.getCellByColumn(0, 'Downloads');
            expect(dropCell.value).toEqual(newCellValue);
            expect(dragCell.value).toEqual(newCellValue);
        }));
    });
    describe('Hiearchical Grid Tests', () => {
        let dragGrid: IgxHierarchicalGridComponent;
        let dropGrid: IgxHierarchicalGridComponent;
        let dragRows: DebugElement[];
        // configureTestSuite();
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestComponent);
            fixture.detectChanges();
            dragGrid = fixture.componentInstance.hDragGrid;
            dropGrid = fixture.componentInstance.hDropGrid;
            dropAreaElement = fixture.debugElement.query(By.directive(IgxDropDirective)).nativeElement;
            dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
        }));

        it('should be able to drag row on every hiearchical level', (async () => {
            // first level row
            let dragIndicatorElement: Element = dragIndicatorElements[1].nativeElement;
            let rowToDrag = dragGrid.getRowByIndex(0);
            let rowDragDirective = dragRows[0].injector.get(IgxRowDragDirective);

            let startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGrid.getRowByIndex(3).nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            verifyRowDragStartEvent(dragGrid, rowToDrag, rowDragDirective, 1);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            verifyRowDragEndEvent(dragGrid, rowToDrag, rowDragDirective, false, 1);

            // second level row
            dragIndicatorElement = dragIndicatorElements[8].nativeElement;
            const childGrid = dragGrid.hgridAPI.getChildGrids(false)[0];
            rowToDrag = childGrid.getRowByIndex(0);
            rowDragDirective = dragRows[4].injector.get(IgxRowDragDirective);
            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);

            spyOn(childGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(childGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            verifyRowDragStartEvent(childGrid, rowToDrag, rowDragDirective, 1);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            verifyRowDragEndEvent(childGrid, rowToDrag, rowDragDirective, false, 1);

            // third level row
            dragIndicatorElement = dragIndicatorElements[10].nativeElement;
            const nestedChildGrid = childGrid.hgridAPI.getChildGrids(false)[0];
            rowToDrag = nestedChildGrid.getRowByIndex(0);
            rowDragDirective = dragRows[5].injector.get(IgxRowDragDirective);
            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);

            spyOn(nestedChildGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(nestedChildGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            verifyRowDragStartEvent(nestedChildGrid, rowToDrag, rowDragDirective, 1);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            verifyRowDragEndEvent(nestedChildGrid, rowToDrag, rowDragDirective, false, 1);
        }));
    });
    describe('Tree Grid Tests', () => {
        let dragGrid: IgxTreeGridComponent;
        let dropGrid: IgxGridComponent;
        let dragRows: DebugElement[];
        // configureTestSuite();
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxTreeGridTestComponent);
            fixture.detectChanges();
            dragGrid = fixture.componentInstance.treeGrid;
            dropGrid = fixture.componentInstance.dropGrid;
            dropAreaElement = fixture.debugElement.query(By.directive(IgxDropDirective)).nativeElement;
            dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
        }));

        it('should be able to drag row on every hiearchical level', (async () => {
            // first level row
            let dragIndicatorElement: Element = dragIndicatorElements[1].nativeElement;
            let rowToDrag = dragGrid.getRowByIndex(0);
            let rowDragDirective = dragRows[0].injector.get(IgxRowDragDirective);

            let startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGrid.getRowByIndex(3).nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            verifyRowDragStartEvent(dragGrid, rowToDrag, rowDragDirective, 1);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            verifyRowDragEndEvent(dragGrid, rowToDrag, rowDragDirective, false, 1);

            // second level row
            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            rowToDrag = dragGrid.getRowByIndex(1);
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            verifyRowDragStartEvent(dragGrid, rowToDrag, rowDragDirective, 2);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            verifyRowDragEndEvent(dragGrid, rowToDrag, rowDragDirective, false, 2);

            // third level row
            dragIndicatorElement = dragIndicatorElements[3].nativeElement;
            rowToDrag = dragGrid.getRowByIndex(2);
            rowDragDirective = dragRows[2].injector.get(IgxRowDragDirective);
            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            verifyRowDragStartEvent(dragGrid, rowToDrag, rowDragDirective, 3);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            verifyRowDragEndEvent(dragGrid, rowToDrag, rowDragDirective, false, 3);
        }));
    });
    describe('Tree Grid Deleting Tests', () => {
        let dragGrid: IgxTreeGridComponent;
        let dragRows: DebugElement[];
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxTreeGridDeleteRowTestComponent);
            fixture.detectChanges();
            dragGrid = fixture.componentInstance.treeGrid;
            dropAreaElement = fixture.debugElement.query(By.directive(IgxDropDirective)).nativeElement;
            dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
        }));
        configureTestSuite();
        it('should be able to delete the last root', (async () => {
            const movePoint: Point = UIInteractions.getPointFromElement(dragGrid.getRowByIndex(2).nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);
            let error = '';

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            // delete the last parent node
            const dragIndicatorElement = dragIndicatorElements[3].nativeElement;
            const startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            try {
                await pointerMove(dragIndicatorElement, dropPoint, fixture);
                await pointerUp(dragIndicatorElement, dropPoint, fixture);
            } catch (ex) {
                error = ex.message;
            }

            expect(error).toBe('');
            expect(dragGrid.rowList.length).toEqual(2);

            const nameCell = dragGrid.getCellByColumn(1, 'Name');
            expect(nameCell.value).toEqual('Yang Wang');
        }));
    });
});


@Component({
    template: `
        <igx-grid #grid
            [width]='width'
            [height]='height'
            primaryKey="ID"
            [data]="data"
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="true" [rowDraggable]="enableRowDraggable"
            >
        </igx-grid>
        <div #dropArea class="droppable-area" igxDrop (onDrop)="onRowDrop($event)"
        [ngStyle]="{width:'100px', height:'100px', backgroundColor:'red'}">
        </div>
        <div #nonDroppableArea class="non-droppable-area"
        [ngStyle]="{width:'100px', height:'100px', backgroundColor:'yellow'}">
        </div>
    `
})
export class IgxGridRowDraggableComponent extends DataParent {
    public width = '800px';
    public height = null;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    @ViewChild('dropArea', { read: IgxDropDirective, static: true })
    public dropArea: IgxDropDirective;

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = true;
    public enableGrouping = true;
    public enableRowEditing = true;
    public enableRowDraggable = true;
    public currentSortExpressions;

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
        column.filterable = this.enableFiltering;
        column.resizable = this.enableResizing;
        column.editable = this.enableEditing;
        column.groupable = this.enableGrouping;
    }
    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
    public onRowDrop(args) {
        args.cancel = true;
    }
}

@Component({
    template: `
        <igx-grid #dragGrid
            [width]="'800px'"
            [height]="'300px'"
            [data]="data"
            primaryKey="ID"
            [autoGenerate]="true" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="true" [rowDraggable]="true"
            >
        </igx-grid>
        <div class="droppable-area" igxDrop (onDrop)="onRowDrop($event)">
        <igx-grid #dropGrid [data]="newData" [primaryKey]="'ID'"
            [width]="'800px'" [height]="'300px'">
            <igx-column [field]="'Downloads'"></igx-column>
            <igx-column [field]="'ID'"></igx-column>
            <igx-column [field]="'ProductName'"></igx-column>
            <igx-column [field]="'ReleaseDate'"></igx-column>
            <igx-column [field]="'Released'"></igx-column>
        </igx-grid></div>
    `
})
export class IgxGridFeaturesRowDragComponent extends DataParent {
    @ViewChild('dragGrid', { read: IgxGridComponent, static: true })
    public dragGrid: IgxGridComponent;
    @ViewChild('dropGrid', { read: IgxGridComponent, static: true })
    public dropGrid: IgxGridComponent;
    newData = [];
    public currentSortExpressions;

    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
    public onRowDrop(args) {
        args.cancel = true;
        this.dropGrid.addRow(args.dragData.rowData);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #hierarchicalDragGrid [data]="data"
     [autoGenerate]="true" [height]="'500px'" [width]="'1500px'"
      primaryKey="ID" [expandChildren]='true' [rowDraggable]="true">
        <igx-row-island [key]="'childData'" [expandChildren]='true' [autoGenerate]="true" [rowDraggable]="true" #rowIsland>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [rowDraggable]="true" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>
    <div class="droppable-area" igxDrop (onDrop)="onRowDrop($event)">
        <igx-hierarchical-grid #hierarchicalDropGrid [data]="newData" [primaryKey]="'ID'"
            [width]="'1500px'" [height]="'500px'">
            <igx-column [field]="'ID'"></igx-column>
            <igx-column [field]="'ChildLevels'"></igx-column>
            <igx-column [field]="'ProductName'"></igx-column>
            <igx-column [field]="'Col1'"></igx-column>
            <igx-column [field]="'Col2'"></igx-column>
            <igx-column [field]="'Col3'"></igx-column>
        </igx-hierarchical-grid>
        </div>`
})
export class IgxHierarchicalGridTestComponent {
    public data;
    newData = [];
    @ViewChild('hierarchicalDragGrid', { read: IgxHierarchicalGridComponent, static: true }) public hDragGrid: IgxHierarchicalGridComponent;
    @ViewChild('hierarchicalDropGrid', { read: IgxHierarchicalGridComponent, static: true }) public hDropGrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;

    constructor() {
        this.data = this.generateData(2, 3);
    }
    generateData(count: number, level: number) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const item = {
                ID: i, ChildLevels: currLevel, ProductName: 'Product: A' + i, 'Col1': i,
                'Col2': i, 'Col3': i
            };
            if (currLevel > 1) {
                children = this.generateData(count / 2, currLevel - 1);
                const childProp = currLevel === 3 ? 'childData' : 'childData2';
                item[childProp] = children;
            }
            prods.push(item);
        }
        return prods;
    }
    public onRowDrop(args) {
        args.cancel = true;
        this.hDropGrid.addRow(args.dragData.rowData);
    }
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="employeeID" foreignKey="PID" width="900px" height="500px" [rowDraggable]="true">
        <igx-column [field]="'employeeID'" dataType="number"></igx-column>
        <igx-column [field]="'firstName'"></igx-column>
        <igx-column [field]="'lastName'"></igx-column>
        <igx-column [field]="'Salary'" dataType="number" ></igx-column>
    </igx-tree-grid>
    <div class="droppable-area" igxDrop (onDrop)="onRowDrop($event)">
    <igx-grid #dropGrid [data]="newData" [primaryKey]="'employeeID'"
        [width]="'900px'" [height]="'300px'">
        <igx-column [field]="'employeeID'" dataType="number"></igx-column>
        <igx-column [field]="'firstName'"></igx-column>
        <igx-column [field]="'lastName'"></igx-column>
        <igx-column [field]="'Salary'" dataType="number" ></igx-column>
    </igx-grid></div>
    `
})
export class IgxTreeGridTestComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    @ViewChild(IgxGridComponent, { static: true }) public dropGrid: IgxGridComponent;
    public data = SampleTestData.employeeScrollingData();
    newData = [];

    public onRowDrop(args) {
        args.cancel = true;
        this.dropGrid.addRow(args.dragData.rowData);
    }
}

@Component({
    template: `
    <div #dropDiv class="drop-area" igxDrop (onDrop)="onDropAllowed($event)">
        <igx-icon>delete</igx-icon>
        <div>Drag a row here to delete it</div>
    </div>
    <igx-tree-grid #treeGrid [data]="data" expansionDepth="0"
        childDataKey="Employees" width="800px" height="540px" [autoGenerate]="false"
        [rowDraggable]="true" [paging]="true" [allowFiltering]="true" [columnHiding]="true" [columnPinning]="true"
        [exportExcel]="true" [exportCsv]="true" exportExcelText="To Excel" [primaryKey]="'ID'" exportCsvText="To CSV"
        (onRowDragEnd)="onRowDragEnd($event)">
        <igx-column field="Name" dataType="string" [sortable]="true" [editable]="true" [movable]="true" [resizable]="true">
        </igx-column>
        <igx-column field="Title" dataType="string" [sortable]="true" [editable]="true" [movable]="true" [resizable]="true">
        </igx-column>
        <igx-column field="HireDate" header="Hire Date" dataType="date" [sortable]="true" [editable]="true" [movable]="true"
            [resizable]="true" width="150px"></igx-column>
        <igx-column field="Age" dataType="number" [sortable]="true" [editable]="true" [movable]="true" [resizable]="true"
            width="100px"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridDeleteRowTestComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;

    public data = SampleTestData.employeeSmallTreeData();
    newData = [];

    constructor() {
    }

    public onRowDragEnd(args) {
        args.animation = true;
    }

    public onDropAllowed(args) {
        args.cancel = true;
        const draggedRow = args.dragData;
        draggedRow.delete();
    }
}

/**
 * Move pointer to the provided point and calls pointerdown event over provided element
 * @param element Element to fire event on
 * @param startPoint Point on which to move the pointer to
 * @param fixture Test's ComponentFixture
 * @returns Promise with reference to the generated event
 */
async function pointerDown(element: Element, startPoint: Point, fixture: ComponentFixture<any>): Promise<PointerEvent> {
    const pointerEvent = UIInteractions.simulatePointerEvent('pointerdown', element, startPoint.x, startPoint.y);
    await wait(DEBOUNCE_TIME);
    fixture.detectChanges();
    return pointerEvent;
}

/**
 * Move pointer to the provided point and calls pointermove event over provided element
 * @param element Element to fire event on
 * @param startPoint Point on which to move the pointer to
 * @param fixture Test's ComponentFixture
 * @returns Promise with reference to the generated event
 */
async function pointerMove(element: Element, startPoint: Point, fixture: ComponentFixture<any>): Promise<PointerEvent> {
    const pointerEvent = UIInteractions.simulatePointerEvent('pointermove', element, startPoint.x, startPoint.y);
    await wait(DEBOUNCE_TIME);
    fixture.detectChanges();
    return pointerEvent;
}

/**
 * Move pointer to the provided point and calls pointerup event over provided element
 * @param element Element to fire event on
 * @param startPoint Point on which to move the pointer to
 * @param fixture Test's ComponentFixture
 * @returns Promise with reference to the generated event
 */
async function pointerUp(element: Element, startPoint: Point, fixture: ComponentFixture<any>): Promise<PointerEvent> {
    const pointerEvent = UIInteractions.simulatePointerEvent('pointerup', element, startPoint.x, startPoint.y);
    await wait(DEBOUNCE_TIME);
    fixture.detectChanges();
    return pointerEvent;
}

/**
 * Verifies weather the onRowDragStart event has been emitted with the correct arguments
 * @param grid IgxGrid from which a row is being dragged
 * @param dragRow Grid row which is being dragged
 * @param dragDirective IgxRowDragDirective of the dragged row
 * @param timesCalled The number of times the onRowDragStart event has been emitted. Defaults to 1.
 * @param cancel Indicates weather the onRowDragStart event is cancelled. Default value is false.
 */
function verifyRowDragStartEvent(
    grid: IgxGridBaseComponent,
    dragRow: IgxRowComponent<any>,
    dragDirective: IgxRowDragDirective,
    timesCalled: number = 1,
    cancel = false) {
    expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(timesCalled);
    expect(grid.onRowDragStart.emit).toHaveBeenCalledWith({
        dragData: dragRow,
        owner: dragDirective,
        cancel: cancel
    });
}

/**
 * Verifies weather the onRowDragEnd event has been emitted with the correct arguments
 * @param grid IgxGrid from which a row is being dragged
 * @param dragRow Grid row which is being dragged
 * @param dragDirective IgxRowDragDirective of the dragged row
 * @param timesCalled The number of times the onRowDragEnd event has been emitted. Defaults to 1.
 */
function verifyRowDragEndEvent(
    grid: IgxGridBaseComponent,
    dragRow: IgxRowComponent<any>,
    dragDirective: IgxRowDragDirective,
    animations: boolean,
    timesCalled: number = 1) {
    expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(timesCalled);
    expect(grid.onRowDragEnd.emit).toHaveBeenCalledWith({
        owner: dragDirective,
        dragData: dragRow,
        animation: animations
    });
}
