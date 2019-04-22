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
import { IgxDropDirective } from '../../directives/dragdrop/dragdrop.directive';

const CSS_CLASS_DRAG_INDICATOR = 'igx-grid__tr--drag-indicator';
const CSS_CLASS_GRID_ROW = 'igx-grid__tr';

describe('IgxGrid - Row Drag', () => {
    let fixture;
    let grid: IgxGridComponent;
    let dropArea: IgxDropDirective;
    let dropAreaElement;
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
            dropAreaElement = fixture.debugElement.query(By.css('.dropable-area')).nativeElement;
        }));
        configureTestSuite();

        it('should drag and drop draggable row over droppable container', (done) => {
            const dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = grid.rowList.toArray()[2];

            const dragIcon_x = dragIndicatorElement.getBoundingClientRect().x + dragIndicatorElement.getBoundingClientRect().width / 2;
            const dragIcon_y = dragIndicatorElement.getBoundingClientRect().y + dragIndicatorElement.getBoundingClientRect().height / 2;
            const dropArea_x = dropAreaElement.getBoundingClientRect().x + 10;
            const dropArea_y = dropAreaElement.getBoundingClientRect().y + 10;

            spyOn(grid.onRowDragStart, 'emit');
            spyOn(grid.onRowDragEnd, 'emit');
            const dragStartArgs: IRowDragStartEventArgs = {
                source: row
            };
            const dragEndArgs: IRowDragEndEventArgs = {
                source: row,
                cancel: false
            };

            UIInteractions.simulatePointerEvent('pointerdown', dragIndicatorElement, dragIcon_x, dragIcon_y);
            // tick(100);
            setTimeout(() => {
                fixture.detectChanges();
                expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);
                // expect(grid.onRowDragStart.emit).toHaveBeenCalledWith(dragStartArgs);
                fixture.detectChanges();
                UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, dropArea_x, dropArea_y);
                // tick(100);
                setTimeout(function () {
                    UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, dropArea_x, dropArea_y);
                    setTimeout(function () {
                        fixture.detectChanges();
                        UIInteractions.simulatePointerEvent('pointerup', dragIndicatorElement, dropArea_x, dropArea_y);
                        setTimeout(function () {
                            fixture.detectChanges();
                            expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(1);
                            done();
                        }, 3000);
                    }, 50);
                }, 50);
            }, 50);
            // expect(grid.onRowDragEnd.emit).toHaveBeenCalledWith(dragEndArgs);
        });

        it('should be able to drag row only by drag icon', fakeAsync(() => {
            const dragIconElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            const dragIconElement = dragIconElements[2].nativeElement;
            const row = grid.rowList.toArray()[2];
            const rowElement = row.nativeElement;

            const row_x = rowElement.getBoundingClientRect().x + rowElement.getBoundingClientRect.width / 2;
            const row_y = rowElement.getBoundingClientRect().y + rowElement.getBoundingClientRect.height / 2;
            const dragIcon_x = dragIconElement.getBoundingClientRect().x + dragIconElement.getBoundingClientRect().width / 2;
            const dragIcon_y = dragIconElement.getBoundingClientRect().y + dragIconElement.getBoundingClientRect().height / 2;

            spyOn(grid.onRowDragStart, 'emit');
            const dragStartArgs: IRowDragStartEventArgs = {
                source: row
            };

            UIInteractions.simulatePointerEvent('pointerdown', rowElement, row_x, row_y);
            fixture.detectChanges();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(0);

            UIInteractions.simulatePointerEvent('pointerdown', dragIconElement, dragIcon_x, dragIcon_y);
            fixture.detectChanges();
            expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowDragStart.emit).toHaveBeenCalledWith(dragStartArgs);
        }));

        it('should emit drop events', fakeAsync(() => {
            const dragIndicatorElements = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DRAG_INDICATOR));
            const dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = grid.rowList.toArray()[2];
            const rowElement = row.nativeElement;

            const dragIcon_x = dragIndicatorElement.getBoundingClientRect().x + dragIndicatorElement.getBoundingClientRect().width / 2;
            const dragIcon_y = dragIndicatorElement.getBoundingClientRect().y + dragIndicatorElement.getBoundingClientRect().height / 2;
            const dropArea_x = dropAreaElement.getBoundingClientRect().x + dropAreaElement.getBoundingClientRect().width / 2;
            const dropArea_y = dropAreaElement.getBoundingClientRect().y + dropAreaElement.getBoundingClientRect().height / 2;

            spyOn(dropArea.onDrop, 'emit');
            spyOn(dropArea.onEnter, 'emit');
            spyOn(dropArea.onLeave, 'emit');
            spyOn(dropArea, 'onDragDrop').and.callThrough();
            spyOn(dropArea, 'onDragEnter').and.callThrough();
            spyOn(dropArea, 'onDragLeave').and.callThrough();
            spyOn(dropArea, 'onDragOver').and.callThrough();
            const dragStartArgs: IRowDragStartEventArgs = {
                source: row
            };

            UIInteractions.simulatePointerEvent('pointerdown', dragIndicatorElement, dragIcon_x, dragIcon_y);
            tick(100);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', dragIndicatorElement, dropArea_x, dropArea_y);
            tick(100);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointerup', dragIndicatorElement, dropArea_x, dropArea_y);
            tick(100);
            fixture.detectChanges();
            expect(dropArea.onEnter.emit).toHaveBeenCalledTimes(1);
            expect(dropArea.onDrop.emit).toHaveBeenCalledTimes(1);
            expect(dropArea.onLeave.emit).toHaveBeenCalledTimes(1);
            // expect(grid.onRowDragStart.emit).toHaveBeenCalledWith(dragStartArgs);
        }));

        it('Start dragging programmatically using API.', (async () => {


        }));

        it('Should cancel dragging when ESCAPE key is pressed.', (async () => {

        }));

        it('Scroll start should be correctly aligned with first column and not with drag indicator ', (async () => {
            // Test if drag indicator width = 0
        }));

        it('Should fire onDragStart and onDragEnd with correct values of event arguments.', (async () => {

        }));

        it('Should be able to cancel onColumnMoving event.', (async () => {

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
