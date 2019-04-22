import { Component, ViewChild, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TestBed, async, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { DataParent } from '../../test-utils/sample-test-data.spec';

import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { IgxColumnComponent } from '../column.component';
import { IRowDragStartEventArgs, IRowDragEndEventArgs } from '../grid-base.component';
import { IgxDropDirective} from '../../directives/dragdrop/dragdrop.directive';

const CSS_CLASS_DRAG_INDICATOR = 'igx-grid__tr--drag-indicator';
const CSS_CLASS_GRID_ROW = 'igx-grid__tr';

describe('IgxGrid - Row Drag', () => {
    let fixture;
    let grid: IgxGridComponent;
    let dropArea: IgxDropDirective;
    let dropAreaElement;
    let rows: any;
    let dragIndicatorElements: any;
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridRowDraggableComponent
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

    describe('', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxGridRowDraggableComponent);
            grid = fixture.componentInstance.instance;
            dropArea = fixture.componentInstance.dropArea;
            fixture.detectChanges();
            rows = grid.rowList.toArray();
            dropAreaElement = fixture.debugElement.query(By.css('.dropable-area')).nativeElement;
            dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
        }));
        configureTestSuite();

        fit('should drag and drop draggable row over droppable container', fakeAsync(() => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[2];

            const startPoint = getElementsCenterCoordinates(dragIndicatorElement);
            const movePoint = getElementsCenterCoordinates(rows[4].nativeElement);
            const dropPoint = getElementsCenterCoordinates(dropAreaElement);

            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');
            const dragStartArgs: IRowDragStartEventArgs = {
                source: row
            };
            const dragEndArgs: IRowDragEndEventArgs = {
                source: row,
                cancel: false
            };

            UIInteractions.simulatePointerEvent('pointerdown', dragIndicatorElement, startPoint.x, startPoint.y);
            fixture.detectChanges();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);
            // expect(grid.onRowDragStart.emit).toHaveBeenCalledWith(dragStartArgs);
            UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, movePoint.x, movePoint.y);
            tick(50);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, dropPoint.x, dropPoint.y);
            tick(50);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointerup', dragIndicatorElement, dropPoint.x, dropPoint.y);
            fixture.detectChanges();
            expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(1);
            // expect(grid.onRowDragEnd.emit).toHaveBeenCalledWith(dragEndArgs);
        }));

        it('should be able to drag row only by drag icon', fakeAsync(() => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[2];
            const rowElement = row.nativeElement;

            const row_x = rowElement.getBoundingClientRect().x + rowElement.getBoundingClientRect.width / 2;
            const row_y = rowElement.getBoundingClientRect().y + rowElement.getBoundingClientRect.height / 2;
            const dragIcon_x = dragIndicatorElement.getBoundingClientRect().x + dragIndicatorElement.getBoundingClientRect().width / 2;
            const dragIcon_y = dragIndicatorElement.getBoundingClientRect().y + dragIndicatorElement.getBoundingClientRect().height / 2;

            spyOn(grid.onRowDragStart, 'emit');
            const dragStartArgs: IRowDragStartEventArgs = {
                source: row
            };

            UIInteractions.simulatePointerEvent('pointerdown', rowElement, row_x, row_y);
            fixture.detectChanges();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(0);

            UIInteractions.simulatePointerEvent('pointerdown', dragIndicatorElement, dragIcon_x, dragIcon_y);
            fixture.detectChanges();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragStart.emit).toHaveBeenCalledWith(dragStartArgs);
        }));

        it('should emit drop events', fakeAsync(() => {
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = rows[2];

            const startPoint = getElementsCenterCoordinates(dragIndicatorElement);
            const movePoint = getElementsCenterCoordinates(rows[4].nativeElement);
            const dropPoint = getElementsCenterCoordinates(dropAreaElement);

            spyOn(dropArea.onEnter, 'emit');
            spyOn(dropArea.onLeave, 'emit');
            // spyOn(dropArea.onDrop, 'emit');
            spyOn(dropArea, 'onDragEnter').and.callThrough();
            spyOn(dropArea, 'onDragLeave').and.callThrough();
            spyOn(dropArea, 'onDragOver').and.callThrough();
            // spyOn(dropArea, 'onDragDrop').and.callThrough();
            // const dropEnterArgs: IgxDropEnterEventArgs = {
            //     owner: dropArea,
            //     drag: rowDragDirective,
            //     dragData: row,
            //     startX: 0,
            //     startY: 0,
            //     pageX: 0,
            //     pageY: 0
            // };

            UIInteractions.simulatePointerEvent('pointerdown', dragIndicatorElement, startPoint.x, startPoint.y);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, movePoint.x, movePoint.y);
            tick(50);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, dropPoint.x, dropPoint.y);
            tick(50);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointerup', dragIndicatorElement, dropPoint.x, dropPoint.y);
            fixture.detectChanges();
            expect(dropArea.onEnter.emit).toHaveBeenCalledTimes(1);
            expect(dropArea.onDragEnter).toHaveBeenCalledTimes(1);
            expect(dropArea.onLeave.emit).toHaveBeenCalledTimes(1);
            expect(dropArea.onDragLeave).toHaveBeenCalledTimes(1);
            expect(dropArea.onDragOver).toHaveBeenCalledTimes(1);
            // expect(dropArea.onEnter.emit).toHaveBeenCalledWith(dropEnterArgs);
        }));

        xit('Start dragging programmatically using API.', (async () => {


        }));

        it('Should cancel dragging when ESCAPE key is pressed.', (async () => {

        }));

        it('Scroll start should be correctly aligned with first column and not with drag indicator ', (async () => {
            // Test if drag indicator width = 0
        }));

        it('Should fire onDragStart and onDragEnd with correct values of event arguments.', (async () => {

        }));

        fit('Should be able to cancel onRowDragStart event.', (async () => {
            grid.onRowDragStart.subscribe(e => {
                e.cancel = true;
            });

            const dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;

            const startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            const endPoint = UIInteractions.getPointFromElement(dropAreaElement);

            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', dragIndicatorElement, startPoint.x, startPoint.y);
            await wait();
            fixture.detectChanges();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);

            UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, endPoint.x, endPoint.y);
            await wait();
            fixture.detectChanges();

            UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, endPoint.x, endPoint.y);
            await wait();
            fixture.detectChanges();

            UIInteractions.simulatePointerEvent('pointerup', dragIndicatorElement, endPoint.x, endPoint.y);
            await wait();
            fixture.detectChanges();

            expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(0);
        }));

        it('Multi-row layout integration.', (async () => {

        }));

    });
});

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="true" [rowDrag]="enableRowDraggable"
            (onRowDragStart)="handleRowDrag($event)"
            (onRowDragEnd)="handleRowDrop($event)">
        </igx-grid>
        <div #dropArea class="dropable-area" igxDrop [ngStyle]="{width:'100px', height:'100px', backgroundColor:'red'}"></div>
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
    handleRowDrag(args) {
        console.log('RowDrag started!');
    }

    handleRowDrop(args) {
        console.log('Row Drag End!');
    }
}

function getElementsCenterCoordinates(element: Element) {
    const x = element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2;
    const y = element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2;
    return { x: x, y: y };
}
