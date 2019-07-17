import { Component, ViewChildren, QueryList, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IgxDragDropModule, IgxDragDirective, IgxDropDirective } from './drag-drop.directive';
import { UIInteractions, wait} from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxDrag/IgxDrop', () => {
    let fix: ComponentFixture<TestDragDropComponent>;
    let dropArea: IgxDropDirective;
    let dropAreaRects = { top: 0, left: 0, right: 0, bottom: 0};
    let dragDirsRects = [{ top: 0, left: 0, right: 0, bottom: 0}];

    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestDragDropComponent
            ],
            imports: [
                FormsModule,
                IgxDragDropModule
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(TestDragDropComponent);
        fix.detectChanges();

        dragDirsRects = [];
        fix.componentInstance.dragElems.forEach((dragDir) => {
            const dragElem = dragDir.element.nativeElement;
            dragDirsRects.push({
                top: dragElem.getBoundingClientRect().top,
                left: dragElem.getBoundingClientRect().left,
                right: dragElem.getBoundingClientRect().right,
                bottom: dragElem.getBoundingClientRect().bottom
            });
        });

        dropArea = fix.componentInstance.dropArea;
        dropAreaRects = {
            top: dropArea.element.nativeElement.getBoundingClientRect().top,
            left: dropArea.element.nativeElement.getBoundingClientRect().left,
            right: dropArea.element.nativeElement.getBoundingClientRect().right,
            bottom: dropArea.element.nativeElement.getBoundingClientRect().bottom
        };
    });

    it('should correctly initialize drag and drop directives.', () => {
        expect(fix.componentInstance.dragElems.length).toEqual(3);
        expect(fix.componentInstance.dragElems.last.data).toEqual({ key: 3 });
        expect(fix.componentInstance.dropArea).toBeTruthy();
        expect(fix.componentInstance.dropArea.data).toEqual({ key: 333 });
    });

    it('should create drag ghost element and trigger onGhostCreate/onGhostDestroy.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        spyOn(firstDrag.onGhostCreate, 'emit');
        spyOn(firstDrag.onGhostDestroy, 'emit');
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.onGhostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        expect(firstDrag.onGhostCreate.emit).toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).not.toHaveBeenCalled();
        expect(firstDrag['dragGhost']).toBeDefined();
        expect(firstDrag['dragGhost'].id).toEqual('firstDrag');
        expect(firstDrag['dragGhost'].className).toEqual('dragElem');
        expect(document.getElementsByClassName('dragElem').length).toEqual(4);

        // Step 3.
        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        expect(firstDrag['dragGhost']).toBeNull();
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);
        expect(firstDrag.onGhostCreate.emit).toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).toHaveBeenCalled();
    }));

    it('should position ghost at the same position relative to the mouse when drag started.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should position ghost relative to the mouse using offsetX and offsetY correctly.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghostOffsetX = 0;
        firstDrag.ghostOffsetY = 0;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait(50);

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        // We have moved 20px but because the element has 10px margin we have to add it too to the position check.
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(startingX + 30);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(startingY + 30);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should position ghost at the same position relative to the mouse when drag started when host is defined.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        firstDrag.dragGhostHost = firstElement.parentElement;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should allow customizing of ghost element by passing template reference and position it correctly.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghostTemplate = fix.componentInstance.ghostTemplate;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);
        expect(firstDrag['dragGhost'].innerText).toEqual('Drag Template');
        expect(firstDrag['dragGhost'].className).toEqual('dragGhost');

        // Step 3.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should position custom ghost relative to the mouse using offsetX and offsetY correctly.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghostOffsetX = 0;
        firstDrag.ghostOffsetY = 0;
        firstDrag.ghostTemplate = fix.componentInstance.ghostTemplate;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        // + 10 margin to the final ghost position
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(startingX + 30);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(startingY + 30);
        expect(firstDrag['dragGhost'].innerText).toEqual('Drag Template');
        expect(firstDrag['dragGhost'].className).toEqual('dragGhost');

        // Step 3.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should trigger dragStart/dragMove/dragEnd events in correct order.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        spyOn(firstDrag.dragStart, 'emit');
        spyOn(firstDrag.dragMove, 'emit');
        spyOn(firstDrag.dragEnd, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 4.
        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).toHaveBeenCalled();
    }));

    it('should trigger onEnter, onDrop and onLeave events when element is dropped inside igxDrop element.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        const dropAreaTop = dropAreaRects.top;
        const dropAreaLeft = dropAreaRects.left;

        spyOn(dropArea.onEnter, 'emit');
        spyOn(dropArea.onLeave, 'emit');
        spyOn(dropArea.onDrop, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        const event = UIInteractions.simulatePointerEvent('pointermove',
            firstDrag['dragGhost'],
            dropAreaLeft  + 100,
            dropAreaRects.top  + 5
        );

        expect(dropArea.onEnter.emit).toHaveBeenCalledWith({
            originalEvent: event,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX:  dropAreaLeft  + 100,
            pageY: dropAreaTop  + 5,
            offsetX: 100,
            offsetY: 5
        });

        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        const eventUp = UIInteractions.simulatePointerEvent('pointerup',
            firstDrag['dragGhost'],
            dropAreaLeft + 100,
            dropAreaRects.top + 20
        );
        await wait();

        expect(dropArea.onDrop.emit).toHaveBeenCalledWith({
            originalEvent: eventUp,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            offsetX: 100,
            offsetY: 20,
            cancel: false
        });
        expect(dropArea.onLeave.emit).toHaveBeenCalledWith({
            originalEvent: eventUp,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX:  dropAreaLeft  + 100,
            pageY: dropAreaTop  + 20,
            offsetX: 100,
            offsetY: 20
        });
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(2);
        expect(dropArea.element.nativeElement.children.length).toEqual(1);
    }));
});

@Component({
    styles: [`
        .container {
            width: 500px;
            height: 100px;
            display: flex;
            flex-flow: row;
        }
        .dragElem {
            width: 100px;
            height: 50px;
            margin: 10px;
            background-color: #66cc99;
            text-align: center;
            user-select: none;
        }
        .dragGhost {
            width: 100px;
            height: 50px;
            margin: 10px;
            background-color: #66cc99;
            text-align: center;
            user-select: none;
        }
        .dropAreaStyle {
            width: 500px;
            height: 100px;
            background-color: #cccccc;
            display: flex;
            flex-flow: row;
        };
    `],
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }">Drag 3</div>
            <ng-template #ghostTemplate>
                <div class="dragGhost">Drag Template</div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }"></div>
    `
})
class TestDragDropComponent {
    @ViewChildren(IgxDragDirective)
    public dragElems: QueryList<IgxDragDirective>;

    @ViewChild('dropArea', { read: IgxDropDirective, static: true })
    public dropArea: IgxDropDirective;

    @ViewChild('container', { read: ElementRef, static: true })
    public container: ElementRef;

    @ViewChild('ghostTemplate', { read: TemplateRef, static: true })
    public ghostTemplate: TemplateRef<any>;
}
