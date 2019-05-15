import { Component, ViewChild, DebugElement } from '@angular/core';
import { TestBed, async, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { DataParent } from '../../test-utils/sample-test-data.spec';
import { Point } from '../../services';

import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { IgxColumnComponent } from '../column.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxRowDragDirective } from '../row-drag.directive';
import { IRowDragStartEventArgs, IRowDragEndEventArgs } from '../grid-base.component';
import {
    IgxDropDirective,
    IgxDropEventArgs,
    IgxDropEnterEventArgs
} from '../../directives/dragdrop/dragdrop.directive';

const DEBOUNCE_TIME = 50;
const CSS_CLASS_DRAG_INDICATOR = 'igx-grid__drag-indicator';
const CSS_CLASS_GRID_ROW = 'igx-grid__tr';
const CSS_CLASS_DRAG_ROW = 'igx-grid__tr--drag';
const CSS_CLASS_GHOST_ROW = 'igx-grid__tr--ghost';
const CSS_CLASS_SELECTION_CHECKBOX = '.igx-grid__cbx-selection';
const CSS_CLASS_VIRTUAL_HSCROLLBAR = '.igx-vhelper--horizontal';

describe('IgxGrid - Row Drag Tests', () => {
    let fixture: ComponentFixture<any>;
    let dropAreaElement: Element;
    let dragIndicatorElements: DebugElement[];
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridRowDraggableComponent,
                IgxGridFeaturesRowDragComponent
            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                IgxGridModule
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
        configureTestSuite();

        it('should drag and drop draggable row over droppable container', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(rows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');
            const dragStartArgs: IRowDragStartEventArgs = {
                owner: rowDragDirective,
                dragData: row,
                cancel: false
            };
            const dragEndArgs: IRowDragEndEventArgs = {
                owner: rowDragDirective,
                dragData: row
            };
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragStart.emit).toHaveBeenCalledWith(dragStartArgs);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();

            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledWith(dragEndArgs);
        }));
        xit('should be able to drag row only by drag icon', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const row = rows[1];
            const rowElement = row.nativeElement;

            const dragIndicatorPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            const rowPoint = UIInteractions.getPointFromElement(rowElement);
            const movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
            spyOn(grid.onRowDragStart, 'emit');
            const dragStartArgs: IRowDragStartEventArgs = {
                owner: rowDragDirective,
                dragData: row,
                cancel: false
            };

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
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragStart.emit).toHaveBeenCalledWith(dragStartArgs);
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
        it('should not change row data if the data in the drop area has been changed', fakeAsync(() => {
            // TODO
        }));
        it('should cancel dragging when ESCAPE key is pressed.', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[1];

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);
            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);

            UIInteractions.simulateKeyDownEvent(dragIndicatorElement, 'Escape');
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
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
        it('should align horizontal scrollbar with first non-pinned data cell', fakeAsync(() => {
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
            rowSelectElement = fixture.debugElement.query(By.css('.igx-grid__cbx-selection'));
            dragIndicatorElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            horizontalScrollbarElement = fixture.debugElement.query(By.css('.igx-vhelper--horizontal'));
            const rowSelectRect = rowSelectElement.nativeElement.getBoundingClientRect();
            horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();
            expect(rowSelectRect.right).toBe(horizontalScrollbarRect.left);
        }));
        it('should fire drag events with correct values of event arguments.', (async () => {
            const rowToDrag: IgxGridRowComponent = rows[2];
            const dragIndicatorElement: Element = dragIndicatorElements[rowToDrag.index].nativeElement;
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const endPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(grid.onRowDragStart, 'emit').and.callThrough();
            spyOn(grid.onRowDragEnd, 'emit').and.callThrough();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, endPoint, fixture);
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragStart.emit).toHaveBeenCalledWith({
                dragData: jasmine.any(IgxGridRowComponent),
                owner: rowDragDirective,
                cancel: false
            });

            await pointerMove(dragIndicatorElement, endPoint, fixture);
            await pointerUp(dragIndicatorElement, endPoint, fixture);
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledWith({
                owner: rowDragDirective,
                dragData: jasmine.any(IgxGridRowComponent)
            });
        }));
        it('should emit dragdrop events if dropping a row on a non-interactive area', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[1];
            const rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(rows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(nonDroppableAreaElement);

            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');
            const dragStartArgs: IRowDragStartEventArgs = {
                owner: rowDragDirective,
                dragData: row,
                cancel: false
            };
            const dragEndArgs: IRowDragEndEventArgs = {
                owner: rowDragDirective,
                dragData: row
            };
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragStart.emit).toHaveBeenCalledWith(dragStartArgs);

            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();

            await pointerUp(dragIndicatorElement, dropPoint, fixture);
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledWith(dragEndArgs);
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
        }));
        it('multi-row layout integration.', (async () => {
        }));
    });
    describe('Grid Features Integration Tests', () => {
        let dragGrid: IgxGridComponent;
        let dropGrid: IgxGridComponent;
        let dragGridRows: IgxGridRowComponent[];
        let dropGridRows: IgxGridRowComponent[];
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxGridFeaturesRowDragComponent);
            dragGrid = fixture.componentInstance.dragGrid;
            dropGrid = fixture.componentInstance.dropGrid;
            fixture.detectChanges();
            dragGridRows = dragGrid.rowList.toArray();
            dropAreaElement = fixture.debugElement.query(By.directive(IgxDropDirective)).nativeElement;
            // nonDroppableAreaElement = fixture.debugElement.query(By.css('.non-droppable-area')).nativeElement;
            dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            // dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
        }));
        configureTestSuite();
        it('should drop data in the proper drop grid columns', (async () => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const dragRowCells = row.cells.toArray();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);

            dropGridRows = dropGrid.rowList.toArray();
            const dropRowCells = dropGridRows[0].cells.toArray();
            for ( let cellIndex = 0; cellIndex < dropRowCells.length; cellIndex++) {
                expect(dropRowCells[cellIndex].value).toEqual(dragRowCells[cellIndex].value);
            }
        }));
        it('column moving - should drop row data in correct columns', (async () => {
            const dragGridColumns = dragGrid.columnList.toArray();
            dragGrid.moveColumn(dragGridColumns[0], dragGridColumns[2]);

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const dragRowCells = row.cells.toArray();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);

            dropGridRows = dropGrid.rowList.toArray();
            const dropRowCells = dropGridRows[0].cells.toArray();
            expect(dropRowCells[0].value).toEqual(dragRowCells[2].value);
            expect(dropRowCells[1].value).toEqual(dragRowCells[0].value);
            expect(dropRowCells[2].value).toEqual(dragRowCells[1].value);
            expect(dropRowCells[3].value).toEqual(dragRowCells[3].value);
            expect(dropRowCells[4].value).toEqual(dragRowCells[4].value);
        }));
        it('column pinning - should drop row data in correct columns', (async () => {
            dragGrid.pinColumn('ProductName');

            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            const dragRowCells = row.cells.toArray();

            const startPoint: Point = UIInteractions.getPointFromElement(dragIndicatorElement);
            const movePoint: Point = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            const dropPoint: Point = UIInteractions.getPointFromElement(dropAreaElement);

            await pointerDown(dragIndicatorElement, startPoint, fixture);
            await pointerMove(dragIndicatorElement, movePoint, fixture);
            await pointerMove(dragIndicatorElement, dropPoint, fixture);
            await pointerUp(dragIndicatorElement, dropPoint, fixture);

            dropGridRows = dropGrid.rowList.toArray();
            const dropRowCells = dropGridRows[0].cells.toArray();
            expect(dropRowCells[0].value).toEqual(dragRowCells[1].value);
            expect(dropRowCells[1].value).toEqual(dragRowCells[2].value);
            expect(dropRowCells[2].value).toEqual(dragRowCells[0].value);
            expect(dropRowCells[3].value).toEqual(dragRowCells[3].value);
            expect(dropRowCells[4].value).toEqual(dragRowCells[4].value);
        }));
    });
});


@Component({
    template: `
        <igx-grid #grid
            [width]='width'
            [height]='height'
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

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    @ViewChild('dropArea', { read: IgxDropDirective })
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
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="true" [rowDraggable]="enableRowDraggable"
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
    @ViewChild('dragGrid', { read: IgxGridComponent })
    public dragGrid: IgxGridComponent;
    @ViewChild('dropGrid', { read: IgxGridComponent })
    public dropGrid: IgxGridComponent;
    newData = [];
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
        this.dropGrid.addRow(args.dragData.rowData);
        this.dragGrid.deleteRow(args.dragData.rowID);
    }
}

function getWindowScrollLeft() {
    return window.scrollX ? window.scrollX : (window.pageXOffset ? window.pageXOffset : 0);
}
function getWindowScrollTop() {
    return window.scrollY ? window.scrollY : (window.pageYOffset ? window.pageYOffset : 0);
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
