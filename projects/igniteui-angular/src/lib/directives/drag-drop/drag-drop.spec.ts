import { Component, ViewChildren, QueryList, ViewChild, ElementRef, TemplateRef, Renderer2 } from '@angular/core';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UIInteractions, wait} from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { first } from 'rxjs/operators';
import { IgxInsertDropStrategy, IgxAppendDropStrategy, IgxPrependDropStrategy } from './drag-drop.strategy';
import {
    IgxDragDirective,
    IgxDropDirective,
    IgxDragLocation,
    IDropDroppedEventArgs,
    DragDirection,
    IgxDragHandleDirective,
    IgxDragIgnoreDirective
} from './drag-drop.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { NgFor } from '@angular/common';

describe('General igxDrag/igxDrop', () => {
    let fix: ComponentFixture<TestDragDropComponent>;
    let dropArea: IgxDropDirective;
    let dropAreaRects = { top: 0, left: 0, right: 0, bottom: 0};
    let dragDirsRects = [{ top: 0, left: 0, right: 0, bottom: 0}];

    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [TestDragDropComponent]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(TestDragDropComponent);
        fix.detectChanges();

        dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        dropArea = fix.componentInstance.dropArea;
        dropAreaRects = getElemRects(dropArea.element.nativeElement);
    });

    it('should correctly initialize drag and drop directives.', () => {
        const ignoredElem = fix.debugElement.query(By.css('.ignoredElem')).nativeElement;

        expect(fix.componentInstance.dragElems.length).toEqual(3);
        expect(fix.componentInstance.dragElems.last.data).toEqual({ key: 3 });
        expect(fix.componentInstance.dropArea).toBeTruthy();
        expect(fix.componentInstance.dropArea.data).toEqual({ key: 333 });
        expect(fix.componentInstance.dragElems.last.dragIgnoredElems.length).toEqual(1);
        expect(fix.componentInstance.dragElems.last.dragIgnoredElems.first.element.nativeElement).toEqual(ignoredElem);
    });

    it('should create drag ghost element and trigger ghostCreate/ghostDestroy.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        spyOn(firstDrag.ghostCreate, 'emit');
        spyOn(firstDrag.ghostDestroy, 'emit');
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.ghostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.ghostDestroy.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostCreate.emit).toHaveBeenCalled();
        expect(firstDrag.ghostDestroy.emit).not.toHaveBeenCalled();
        expect(firstDrag.ghostElement).toBeDefined();
        expect(firstDrag.ghostElement.id).toEqual('firstDrag');
        expect(firstDrag.ghostElement.className).toEqual('dragElem igx-drag igx-drag--select-disabled');
        expect(document.getElementsByClassName('dragElem').length).toEqual(4);

        // Step 3.
        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        expect(firstDrag.ghostElement).toBeNull();
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);
        expect(firstDrag.ghostCreate.emit).toHaveBeenCalled();
        expect(firstDrag.ghostDestroy.emit).toHaveBeenCalled();
    });

    it('should trigger dragStart/dragMove/dragEnd events in that order.', async () => {
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
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 4.
        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).toHaveBeenCalled();
    });

    it('should trigger dragStart/dragMove/dragEnd events in that order when pointer is lost', async () => {
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
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 4.
        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('lostpointercapture', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).toHaveBeenCalled();
    });

    it('should not create drag ghost element when the dragged amount is less than dragTolerance.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.dragTolerance = 15;

        spyOn(firstDrag.ghostCreate, 'emit');
        spyOn(firstDrag.ghostDestroy, 'emit');
        spyOn(firstDrag.dragClick, 'emit');
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.ghostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.ghostDestroy.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragClick.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);
        expect(firstDrag.ghostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.ghostDestroy.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragClick.emit).not.toHaveBeenCalled();

        // Step 3.
        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);
        expect(firstDrag.ghostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.ghostDestroy.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragClick.emit).toHaveBeenCalled();
    });

    it('should position ghost at the same position relative to the mouse when drag started.', async () => {
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

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should move ghost only horizontally when drag direction is set to horizontal.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.dragDirection = DragDirection.HORIZONTAL;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should move ghost only vertically when drag direction is set to vertical.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.dragDirection = DragDirection.VERTICAL;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should position ghost relative to the mouse using offsetX and offsetY correctly.', async () => {
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

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(startingX + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(startingY + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should position ghost at the same position relative to the mouse when drag started when host is defined.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        firstDrag.ghostHost = firstElement.parentElement;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it(`should create ghost at the same position relative to the mouse
        when drag started when host has custom style position.`, async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        firstElement.parentElement.style.left = '50px';
        firstElement.parentElement.style.top = '50px';
        firstElement.parentElement.style.position = 'relative';
        firstDrag.ghostHost = firstElement.parentElement;

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        (firstDrag as any).createGhost(startingX + 10, startingY + 10);
        fix.detectChanges();

        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 60);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 60);
    });

    it('should allow customizing of ghost element by passing template reference and position it correctly.', async () => {
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

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);
        expect(firstDrag.ghostElement.innerText).toEqual('Drag Template');
        expect(firstDrag.ghostElement.className).toEqual('ghostElement');

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should position custom ghost relative to the mouse using offsetX and offsetY correctly.', async () => {
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

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        // + 10 margin to the final ghost position
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(startingX + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(startingY + 20);
        expect(firstDrag.ghostElement.innerText).toEqual('Drag Template');
        expect(firstDrag.ghostElement.className).toEqual('ghostElement');

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it(`should take first child when creating ghost from template that has display content`, async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghostOffsetX = 0;
        firstDrag.ghostOffsetY = 0;
        firstDrag.ghostTemplate = fix.componentInstance.ghostTemplateContents;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        // + 10 margin to the final ghost position
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(startingX + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(startingY + 20);
        expect(firstDrag.ghostElement.innerText).toEqual('Drag Template Content');
        expect(firstDrag.ghostElement.id).toEqual('contentsTemplate');
        expect(firstDrag.ghostElement.style.display).toEqual('block');

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should correctly move igxDrag element when ghost is disabled and trigger dragStart/dragMove/dragEnd events.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghost = false;

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

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).toHaveBeenCalled();
    });

    it('should move igxDrag element only horizontally when ghost is disabled and direction is set to horizontal.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghost = false;
        firstDrag.dragDirection = DragDirection.HORIZONTAL;
        fix.detectChanges();

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
    });

    it('should move igxDrag element only vertically when ghost is disabled and direction is set to vertical.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghost = false;
        firstDrag.dragDirection = DragDirection.VERTICAL;
        fix.detectChanges();

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);
    });

    it('should prevent dragging if it does not exceed dragTolerance and ghost is disabled.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghost = false;
        firstDrag.dragTolerance = 25;

        spyOn(firstDrag.dragStart, 'emit');
        spyOn(firstDrag.dragClick, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragClick.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragClick.emit).not.toHaveBeenCalled();

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragClick.emit).toHaveBeenCalled();
    });

    it('should correctly apply dragTolerance of 0 when it is set to 0 and ghost is disabled.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghost = false;
        firstDrag.dragTolerance = 0;

        spyOn(firstDrag.dragStart, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 3, startingY + 3);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 3);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 3);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 4, startingY + 4);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 4);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 4);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 4, startingY + 4);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 4);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 4);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
    });

    it('should position the base element relative to the mouse using offsetX and offsetY correctly.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghost = false;
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

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        // + 10 margin to the final ghost position
        expect(firstElement.getBoundingClientRect().left).toEqual(startingX + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(startingY + 20);
        expect(firstElement.innerText).toEqual('Drag 1');

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should correctly set location using setLocation() method when ghost is disabled', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        const initialPageX = firstDrag.pageX;
        const initialPageY = firstDrag.pageY;
        firstDrag.ghost = false;

        expect(initialPageX).toEqual(dragDirsRects[0].left);
        expect(initialPageY).toEqual(dragDirsRects[0].top);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        firstDrag.setLocation(new IgxDragLocation(initialPageX,  initialPageY));

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
    });

    it('should correctly set location using setLocation() method when ghost is rendered.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        const initialPageX = firstDrag.pageX;
        const initialPageY = firstDrag.pageY;

        expect(initialPageX).toEqual(dragDirsRects[0].left);
        expect(initialPageY).toEqual(dragDirsRects[0].top);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        firstDrag.setLocation(new IgxDragLocation(initialPageX,  initialPageY));
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstDrag.ghostElement).not.toBeTruthy();
    });

    it('should correctly drag using drag handle and not the whole element', async () => {
        const thirdDrag = fix.componentInstance.dragElems.last;
        const thirdElement = thirdDrag.element.nativeElement;
        const startingX = (dragDirsRects[2].left + dragDirsRects[2].right) / 2;
        const startingY = (dragDirsRects[2].top + dragDirsRects[2].bottom) / 2;
        thirdDrag.ghost = false;
        thirdDrag.dragTolerance = 0;

        spyOn(thirdDrag.dragStart, 'emit');

        // Check if drag element itself is not draggable.
        UIInteractions.simulatePointerEvent('pointerdown', thirdElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', thirdElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', thirdElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointerup', thirdElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(thirdElement.getBoundingClientRect().left).toEqual(dragDirsRects[2].left);
        expect(thirdElement.getBoundingClientRect().top).toEqual(dragDirsRects[2].top);
        expect(thirdDrag.dragStart.emit).not.toHaveBeenCalled();

        // Try dragging through drag handle.

        const dragHandle = thirdElement.children[0];
        const dragHandleRects = dragHandle.getBoundingClientRect();
        const handleStartX = (dragHandleRects.left + dragHandleRects.right) / 2;
        const handleStartY = (dragHandleRects.top + dragHandleRects.bottom) / 2;
        UIInteractions.simulatePointerEvent('pointerdown', dragHandle, handleStartX, handleStartY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 10, handleStartY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointerup', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await wait();

        expect(thirdElement.getBoundingClientRect().left).toEqual(dragDirsRects[2].left + 20);
        expect(thirdElement.getBoundingClientRect().top).toEqual(dragDirsRects[2].top + 20);
        expect(thirdDrag.dragStart.emit).toHaveBeenCalled();
    });

    it('should trigger enter, dropped and leave events when element is dropped inside igxDrop element.', async () => {
        fix.componentInstance.dropArea.dropStrategy = IgxInsertDropStrategy;
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        const event = UIInteractions.simulatePointerEvent('pointermove',
            firstDrag.ghostElement,
            dropAreaRects.left  + 100,
            dropAreaRects.top  + 5
        );
        fix.detectChanges();
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalledWith({
            originalEvent: event,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX:  dropAreaRects.left  + 100,
            pageY: dropAreaRects.top  + 5,
            offsetX: 100,
            offsetY: 5
        });

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        const eventUp = UIInteractions.simulatePointerEvent('pointerup',
            firstDrag.ghostElement,
            dropAreaRects.left + 100,
            dropAreaRects.top + 20
        );
        fix.detectChanges();
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalledWith({
            originalEvent: eventUp,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX:  dropAreaRects.left  + 100,
            pageY: dropAreaRects.top  + 20,
            offsetX: 100,
            offsetY: 20,
            cancel: false
        });
        expect(dropArea.leave.emit).toHaveBeenCalledWith({
            originalEvent: eventUp,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX:  dropAreaRects.left  + 100,
            pageY: dropAreaRects.top  + 20,
            offsetX: 100,
            offsetY: 20
        });
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(2);
        expect(dropArea.element.nativeElement.children.length).toEqual(1);
    });

    it('should return the base element to its original position with transitionToOrigin() after dragging.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghost = false;

        firstDrag.dragEnd.pipe(first()).subscribe(() => {
            firstDrag.transitionToOrigin();
        });

        firstDrag.transitioned.pipe(first()).subscribe(() => {
            expect(firstDrag.originLocation.pageX).toEqual(dragDirsRects[0].left);
            expect(firstDrag.originLocation.pageY).toEqual(dragDirsRects[0].top);
            expect(firstDrag.element.nativeElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
            expect(firstDrag.element.nativeElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        });

        expect(firstDrag.originLocation.pageX).toEqual(dragDirsRects[0].left);
        expect(firstDrag.originLocation.pageY).toEqual(dragDirsRects[0].top);
        expect(firstDrag.element.nativeElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstDrag.element.nativeElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        let currLeft = firstDrag.element.nativeElement.getBoundingClientRect().left;
        let currTop = firstDrag.element.nativeElement.getBoundingClientRect().top;

        expect(firstDrag.location.pageX).toEqual(currLeft);
        expect(firstDrag.location.pageY).toEqual(currTop);
        expect(firstDrag.originLocation.pageX).toEqual(dragDirsRects[0].left);
        expect(firstDrag.originLocation.pageY).toEqual(dragDirsRects[0].top);
        expect(currLeft).toEqual(dragDirsRects[0].left + 20);
        expect(currTop).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);


        currLeft = firstDrag.element.nativeElement.getBoundingClientRect().left;
        currTop = firstDrag.element.nativeElement.getBoundingClientRect().top;
        expect(dragDirsRects[0].left < currLeft && currLeft <= (dragDirsRects[0].left + 20)).toBeTruthy();
        expect(dragDirsRects[0].top < currTop && currTop <= (dragDirsRects[0].top + 20)).toBeTruthy();

    });

    it('should return the ghost element to its original position with transitionToOrigin() after dragging.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        firstDrag.dragEnd.pipe(first()).subscribe(() => {
            firstDrag.transitionToOrigin();
        });

        firstDrag.transitioned.pipe(first()).subscribe(() => {
            expect(firstDrag.ghostElement).not.toBeTruthy();
        });

        expect(firstDrag.ghostElement).not.toBeTruthy();

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).toBeTruthy();

        const currLeft = firstDrag.ghostElement.getBoundingClientRect().left;
        const currTop = firstDrag.ghostElement.getBoundingClientRect().top;
        expect(dragDirsRects[0].left < currLeft && currLeft <= (dragDirsRects[0].left + 20)).toBeTruthy();
        expect(dragDirsRects[0].top < currTop && currTop <= (dragDirsRects[0].top + 20)).toBeTruthy();
    });

    it('should not create ghost element when executing transitionToOrigin() when no dragging is performed without start.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;

        spyOn(firstDrag.transitioned, 'emit');

        expect(firstDrag.ghostElement).not.toBeTruthy();

        firstDrag.transitionToOrigin();
        await wait();

        expect(firstDrag.ghostElement).not.toBeTruthy();
        expect(firstDrag.transitioned.emit).not.toHaveBeenCalled();
    });


    it('should create ghost element when executing transitionToOrigin() when no dragging is performed with start.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;

        firstDrag.transitioned.pipe(first()).subscribe(() => {
            expect(firstDrag.ghostElement).not.toBeTruthy();
        });

        expect(firstDrag.ghostElement).not.toBeTruthy();

        firstDrag.transitionToOrigin({}, new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50));
        await wait();

        expect(firstDrag.ghostElement).toBeTruthy();

        const currLeft = firstDrag.ghostElement.getBoundingClientRect().left;
        const currTop = firstDrag.ghostElement.getBoundingClientRect().top;

        // origin left < current left <= start left
        expect(dragDirsRects[0].left).toBeLessThan(currLeft);
        expect(currLeft).toBeLessThanOrEqual(dragDirsRects[0].left + 50);

        // origin top < current top <= start top
        expect(dragDirsRects[0].top).toBeLessThan(currTop);
        expect(currTop).toBeLessThanOrEqual(dragDirsRects[0].top + 50);
    });

    it('should transition the base element to location with transitionTo().', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        firstDrag.ghost = false;

        firstDrag.transitioned.pipe(first()).subscribe(() => {
            expect(firstDrag.element.nativeElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 50);
            expect(firstDrag.element.nativeElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 50);
        });

        expect(firstDrag.element.nativeElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstDrag.element.nativeElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);

        firstDrag.transitionTo(new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50));
        await wait();

        const currLeft = firstDrag.element.nativeElement.getBoundingClientRect().left;
        const currTop = firstDrag.element.nativeElement.getBoundingClientRect().top;

        // start left <= current left < target left
        expect(dragDirsRects[0].left).toBeLessThanOrEqual(currLeft);
        expect(currLeft).toBeLessThan(dragDirsRects[0].left + 50);

        // start top <= current top < target top
        expect(dragDirsRects[0].top).toBeLessThanOrEqual(currTop);
        expect(currTop).toBeLessThan(dragDirsRects[0].top + 50);
    });

    it('should transition the base element to location with transitionTo() with starting location.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        firstDrag.ghost = false;

        firstDrag.transitioned.pipe(first()).subscribe(() => {
            expect(firstDrag.element.nativeElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 50);
            expect(firstDrag.element.nativeElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 50);
        });

        expect(firstDrag.element.nativeElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstDrag.element.nativeElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);

        firstDrag.transitionTo(
            new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50),
            {},
            new IgxDragLocation(dragDirsRects[0].left + 100, dragDirsRects[0].top + 100)
        );
        await wait();

        const currLeft = firstDrag.element.nativeElement.getBoundingClientRect().left;
        const currTop = firstDrag.element.nativeElement.getBoundingClientRect().top;

        // target left < current left <= start left
        expect(dragDirsRects[0].left + 50).toBeLessThan(currLeft);
        expect(currLeft).toBeLessThanOrEqual(dragDirsRects[0].left + 100);

        // target top < current top <= start top
        expect(dragDirsRects[0].top + 50).toBeLessThan(currTop);
        expect(currTop).toBeLessThanOrEqual(dragDirsRects[0].top + 100);
    });

    it('should transition the ghost element to location with transitionTo() after dragging.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        firstDrag.dragEnd.pipe(first()).subscribe(() => {
            firstDrag.transitionTo(new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50));
        });

        firstDrag.transitioned.pipe(first()).subscribe(() => {
            expect(firstDrag.ghostElement).not.toBeTruthy();
        });

        expect(firstDrag.ghostElement).not.toBeTruthy();

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).toBeTruthy();

        const currLeft = firstDrag.ghostElement.getBoundingClientRect().left;
        const currTop = firstDrag.ghostElement.getBoundingClientRect().top;

        // last left < current left <= target left
        expect(dragDirsRects[0].left + 20).toBeLessThanOrEqual(currLeft);
        expect(currLeft).toBeLessThan(dragDirsRects[0].left + 50);

        // last top < current top <= target top
        expect(dragDirsRects[0].top + 20).toBeLessThanOrEqual(currTop);
        expect(currTop).toBeLessThan(dragDirsRects[0].top + 50);
    });

    it('should transition the ghost element to location with transitionTo() after dragging with start location.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        firstDrag.dragEnd.pipe(first()).subscribe(() => {
            firstDrag.transitionTo(
                new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50),
                {},
                new IgxDragLocation(dragDirsRects[0].left + 100, dragDirsRects[0].top + 100)
            );
        });

        firstDrag.transitioned.pipe(first()).subscribe(() => {
            expect(firstDrag.ghostElement).not.toBeTruthy();
        });

        expect(firstDrag.ghostElement).not.toBeTruthy();

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.ghostElement).toBeTruthy();

        const currLeft = firstDrag.ghostElement.getBoundingClientRect().left;
        const currTop = firstDrag.ghostElement.getBoundingClientRect().top;

        // target left < current left <= start left
        expect(dragDirsRects[0].left + 50).toBeLessThan(currLeft);
        expect(currLeft).toBeLessThanOrEqual(dragDirsRects[0].left + 100);

        // target top < current top <= start top
        expect(dragDirsRects[0].top + 50).toBeLessThan(currTop);
        expect(currTop).toBeLessThanOrEqual(dragDirsRects[0].top + 100);
    });

    it('should create ghost element to location with transitionTo() and start location set.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;

        firstDrag.transitioned.pipe(first()).subscribe(() => {
            expect(firstDrag.ghostElement).not.toBeTruthy();
        });

        expect(firstDrag.ghostElement).not.toBeTruthy();

        firstDrag.transitionTo(
            new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50),
            {},
            new IgxDragLocation(dragDirsRects[0].left + 100, dragDirsRects[0].top + 100)
        );
        await wait();

        expect(firstDrag.ghostElement).toBeTruthy();

        const currLeft = firstDrag.ghostElement.getBoundingClientRect().left;
        const currTop = firstDrag.ghostElement.getBoundingClientRect().top;

        // target left < current left <= start left
        expect(dragDirsRects[0].left + 50).toBeLessThan(currLeft);
        expect(currLeft).toBeLessThanOrEqual(dragDirsRects[0].left + 100);

        // target left < current left <= start left
        expect(dragDirsRects[0].top + 50).toBeLessThan(currTop);
        expect(currTop).toBeLessThanOrEqual(dragDirsRects[0].top + 100);
    });
});

describe('Linked igxDrag/igxDrop ', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                TestDragDropLinkedSingleComponent,
                TestDragDropLinkedMixedComponent,
                TestDragDropStrategiesComponent
            ]
        })
        .compileComponents();
    }));

    it('should trigger enter/onDrop/leave events when element is dropped inside and is linked with it.', async () => {
        const fix = TestBed.createComponent(TestDragDropLinkedSingleComponent);
        fix.componentInstance.dropArea.dropStrategy = IgxInsertDropStrategy;
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalled();
        expect(dropArea.leave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(2);
        expect(dropArea.element.nativeElement.children.length).toEqual(1);
    });

    it('should not trigger enter/onDrop/leave events when element is dropped inside and is not linked with it.', async () => {
        const fix = TestBed.createComponent(TestDragDropLinkedSingleComponent);
        fix.detectChanges();

        const secondDrag = fix.componentInstance.dragElems.toArray()[1];
        const firstElement = secondDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[1].left + dragDirsRects[1].right) / 2;
        const startingY = (dragDirsRects[1].top + dragDirsRects[1].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', secondDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).not.toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', secondDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).not.toHaveBeenCalled();
        expect(dropArea.leave.emit).not.toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);
    });

    it(`should not trigger enter/onDrop/leave events when element is dropped inside and is not linked with it
            but linked with multiple other types of channels.`, async () => {
        const fix = TestBed.createComponent(TestDragDropLinkedMixedComponent);
        fix.detectChanges();

        const secondDrag = fix.componentInstance.dragElems.toArray()[1];
        const firstElement = secondDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[1].left + dragDirsRects[1].right) / 2;
        const startingY = (dragDirsRects[1].top + dragDirsRects[1].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', secondDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).not.toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', secondDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).not.toHaveBeenCalled();
        expect(dropArea.leave.emit).not.toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);
    });

    it('Should not perform any action by default when an element is dropped inside.', async () => {
        const fix = TestBed.createComponent(TestDragDropStrategiesComponent);
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalled();
        expect(dropArea.leave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        expect(fix.componentInstance.container.nativeElement.children[0]).toEqual(firstDrag.element.nativeElement);
        expect(dropArea.element.nativeElement.children[0]).not.toEqual(firstDrag.element.nativeElement);
        expect(dropArea.element.nativeElement.children[1]).not.toEqual(firstDrag.element.nativeElement);
    });

    it('Should put dropped element as a last child when Append drop strategy is used.', async () => {
        const fix = TestBed.createComponent(TestDragDropStrategiesComponent);
        fix.componentInstance.dropArea.dropStrategy = IgxAppendDropStrategy;
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalled();
        expect(dropArea.leave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(0);
        expect(dropArea.element.nativeElement.children.length).toEqual(3);
        // Should be appended at the end
        expect(dropArea.element.nativeElement.children[2]).toEqual(firstDrag.element.nativeElement);
    });

    it('Should put dropped element as a first child when Prepend drop strategy is used.', async () => {
        const fix = TestBed.createComponent(TestDragDropStrategiesComponent);
        fix.componentInstance.dropArea.dropStrategy = IgxPrependDropStrategy;
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalled();
        expect(dropArea.leave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(0);
        expect(dropArea.element.nativeElement.children.length).toEqual(3);
        // Should be appended at the end
        expect(dropArea.element.nativeElement.children[0]).toEqual(firstDrag.element.nativeElement);
    });

    it(`Should put dropped element as a second child when Insert drop strategy is used
     and element is dropped over the second child already in the igxDrop area.`, async () => {
        const fix = TestBed.createComponent(TestDragDropStrategiesComponent);
        fix.componentInstance.dropArea.dropStrategy = IgxInsertDropStrategy;
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left  + 150, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 150, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalled();
        expect(dropArea.leave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(0);
        expect(dropArea.element.nativeElement.children.length).toEqual(3);
        // Should be inserted between other chips
        expect(dropArea.element.nativeElement.children[1]).toEqual(firstDrag.element.nativeElement);
    });

    it('Should cancel drop strategy when the dropped event is canceled.', async () => {
        const fix = TestBed.createComponent(TestDragDropStrategiesComponent);
        fix.componentInstance.dropArea.dropStrategy = IgxInsertDropStrategy;
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');

        fix.componentInstance.dropArea.dropped.pipe(first()).subscribe(((e: IDropDroppedEventArgs) => e.cancel = true));

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup',
            firstDrag.ghostElement,
            dropAreaRects.left + 100,
            dropAreaRects.top + 20
        );
        fix.detectChanges();
        await wait(100);

        expect(dropArea.leave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        expect(fix.componentInstance.container.nativeElement.children[0]).toEqual(firstDrag.element.nativeElement);
        expect(dropArea.element.nativeElement.children[0]).not.toEqual(firstDrag.element.nativeElement);
        expect(dropArea.element.nativeElement.children[1]).not.toEqual(firstDrag.element.nativeElement);
    });


    it('Should allow dragging when the dragChannel is array and dropChannel is primitive.', async () => {
        const fix = TestBed.createComponent(TestDragDropStrategiesComponent);
        fix.componentInstance.dropArea.dropStrategy = IgxAppendDropStrategy;
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        firstDrag.dragChannel = [1, 2, 3];
        fix.detectChanges();

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalled();
        expect(dropArea.leave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(0);
        expect(dropArea.element.nativeElement.children.length).toEqual(3);
        // Should be appended at the end
        expect(dropArea.element.nativeElement.children[2]).toEqual(firstDrag.element.nativeElement);
    });

    it('Should allow dragging when the dragChannel is primitive and dropChannel is array.', async () => {
        const fix = TestBed.createComponent(TestDragDropStrategiesComponent);
        fix.componentInstance.dropArea.dropStrategy = IgxAppendDropStrategy;
        fix.componentInstance.dropArea.dropChannel = [1, 2, 3];
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        fix.detectChanges();

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.enter, 'emit');
        spyOn(dropArea.leave, 'emit');
        spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalled();
        expect(dropArea.leave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(0);
        expect(dropArea.element.nativeElement.children.length).toEqual(3);
        // Should be appended at the end
        expect(dropArea.element.nativeElement.children[2]).toEqual(firstDrag.element.nativeElement);
    });
});

describe('Nested igxDrag elements', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [TestDragDropNestedComponent]
        })
        .compileComponents();
    }));

    it('should correctly move nested element using drag handle.', async () => {
        const fix = TestBed.createComponent(TestDragDropNestedComponent);
        fix.detectChanges();

        const rootList = fix.componentInstance.dragElems.get(0);
        const firstCategory = fix.componentInstance.dragElems.get(1);
        const firstMovie = fix.componentInstance.dragElems.get(2);
        const thirdElement = firstMovie.element.nativeElement;
        const dragDirsRects = getElemRects(thirdElement);
        firstMovie.ghost = false;
        firstMovie.dragTolerance = 0;

        spyOn(rootList.dragStart, 'emit');
        spyOn(firstCategory.dragStart, 'emit');
        spyOn(firstMovie.dragStart, 'emit');

        const dragHandle = thirdElement.children[0].children[0];
        const dragHandleRects = dragHandle.getBoundingClientRect();
        const handleStartX = (dragHandleRects.left + dragHandleRects.right) / 2;
        const handleStartY = (dragHandleRects.top + dragHandleRects.bottom) / 2;
        UIInteractions.simulatePointerEvent('pointerdown', dragHandle, handleStartX, handleStartY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 10, handleStartY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointerup', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await wait();

        expect(thirdElement.getBoundingClientRect().left).toEqual(dragDirsRects.left + 20);
        expect(thirdElement.getBoundingClientRect().top).toEqual(dragDirsRects.top + 20);
        expect(firstMovie.dragStart.emit).toHaveBeenCalled();
        expect(rootList.dragStart.emit).not.toHaveBeenCalled();
        expect(firstCategory.dragStart.emit).not.toHaveBeenCalled();
    });
})

const getDragDirsRects = (dragDirs: QueryList<IgxDragDirective>) => {
    const dragDirsRects = [];
    dragDirs.forEach((dragDir) => {
        const dragElem = dragDir.element.nativeElement;
        dragDirsRects.push(getElemRects(dragElem));
    });

    return dragDirsRects;
};

const getElemRects = (nativeElem) => ({
    top: nativeElem.getBoundingClientRect().top,
    left: nativeElem.getBoundingClientRect().left,
    right: nativeElem.getBoundingClientRect().right,
    bottom: nativeElem.getBoundingClientRect().bottom
});


const generalStyles = [`
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
    .ghostElement {
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
    }
    .dragHandle {
        width: 10px;
        height: 10px;
        background-color: red;
        float: right;
        margin: 5px;
    }
    .rootList {
        width: 300px;
        height: 800px;
    }
    .movieListItem {
        padding: 5px;
        margin-top: 5px;
        margin-left: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 6px 0 gray;
        background-color: rgba(232, 232, 232, .5);
    }
`];

@Component({
    styles: generalStyles,
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }">
                Drag 3
                <div igxDragHandle class="dragHandle"></div>
                <div>
                    <div igxDragIgnore class="ignoredElem"></div>
                </div>
            </div>
            <ng-template #ghostTemplate>
                <div class="ghostElement">Drag Template</div>
            </ng-template>
            <ng-template #ghostTemplateContents>
                <div id="contentsTemplate" class="ghostElement" style="display: contents">
                    Drag Template Content
                </div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }"></div>
    `,
    imports: [IgxDragDirective, IgxDropDirective, IgxDragHandleDirective, IgxDragIgnoreDirective]
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

    @ViewChild('ghostTemplateContents', { read: TemplateRef, static: true })
    public ghostTemplateContents: TemplateRef<any>;

    constructor(public renderer: Renderer2) { }
}

@Component({
    styles: generalStyles,
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }" [dragChannel]="1">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }" [dragChannel]="2">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }" [dragChannel]="3">Drag 3</div>
            <ng-template #ghostTemplate>
                <div class="ghostElement">Drag Template</div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }" [dropChannel]="1"></div>
    `,
    imports: [IgxDragDirective, IgxDropDirective]
})
class TestDragDropLinkedSingleComponent extends TestDragDropComponent { }

@Component({
    styles: generalStyles,
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }" [dragChannel]="1">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }" [dragChannel]="[2, 6, '3']">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }" [dragChannel]="3">Drag 3</div>
            <ng-template #ghostTemplate>
                <div class="ghostElement">Drag Template</div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }" [dropChannel]="[1, 3]"></div>
    `,
    imports: [IgxDragDirective, IgxDropDirective]
})
class TestDragDropLinkedMixedComponent extends TestDragDropComponent { }

@Component({
    styles: generalStyles,
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }" [dragChannel]="1">Drag 1</div>
            <ng-template #ghostTemplate>
                <div class="ghostElement">Drag Template</div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }" [dropChannel]="1">
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }" [dragChannel]="2">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }" [dragChannel]="3">Drag 3</div>
        </div>
    `,
    imports: [IgxDragDirective, IgxDropDirective]
})
class TestDragDropStrategiesComponent extends TestDragDropLinkedSingleComponent { }

@Component({
    styles: generalStyles,
    template: `
        <div class="rootList movieListItem" igxDrag [ghost]="false">
            <div>
                <igx-icon igxDragHandle>drag_indicator</igx-icon>
                <span>Movies list</span>
            </div>
            <div class="movieListItem" *ngFor="let category of categoriesNotes" igxDrag [ghost]="false">
                <div>
                    <igx-icon igxDragHandle>drag_indicator</igx-icon>
                    <span>{{category.text}}</span>
                </div>
                <div class="movieListItem" *ngFor="let note of getCategoryMovies(category.text)" igxDrag [ghost]="false">
                    <div>
                        <igx-icon igxDragHandle>drag_indicator</igx-icon>
                        <span>{{note.text}}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    imports: [NgFor, IgxIconComponent, IgxDragDirective, IgxDragHandleDirective]
})
class TestDragDropNestedComponent extends TestDragDropComponent {
    public categoriesNotes = [
        { text: 'Action', dragged: false },
        { text: 'Fantasy', dragged: false }
    ];
    public listNotes = [
        { text: 'Avengers: Endgame', category: 'Action', dragged: false },
        { text: 'Avatar', category: 'Fantasy', dragged: false },
        { text: 'Titanic', category: 'Drama', dragged: false },
        { text: 'Star Wars: The Force Awakens', category: 'Fantasy', dragged: false },
        { text: 'Avengers: Infinity War', category: 'Action', dragged: false },
        { text: 'Jurassic World', category: 'Fantasy', dragged: false },
        { text: 'The Avengers', category: 'Action', dragged: false }
    ];

    public getCategoryMovies(inCategory: string){
        return this.listNotes.filter(item => item.category === inCategory);
    }
 }
