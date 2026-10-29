import { Component, ViewChildren, QueryList, ViewChild, ElementRef, TemplateRef, Renderer2, inject, ChangeDetectionStrategy } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UIInteractions, nextFrame, wait } from '../../../../test-utils/ui-interactions.spec';
import { first } from 'rxjs/operators';
import { IgxInsertDropStrategy, IgxAppendDropStrategy, IgxPrependDropStrategy } from './drag-drop.strategy';
import { IgxDragDirective, IgxDropDirective, IgxDragLocation, IDropDroppedEventArgs, DragDirection, IgxDragHandleDirective, IgxDragIgnoreDirective } from './drag-drop.directive';
import { IgxIconComponent } from '../../../../icon/src/icon/icon.component';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Waits until a transition back to the origin has moved the element left of where the drag ended, so a
 * mid-transition position check sees the element in motion rather than before the transition starts.
 */
const transitionStarted = (el: HTMLElement, dragEndLeft: number) =>
    vi.waitFor(() => expect(el.getBoundingClientRect().left).toBeLessThan(dragEndLeft), { interval: 5 });

describe('General igxDrag/igxDrop', () => {
    let fix: ComponentFixture<TestDragDropComponent>;
    let dropArea: IgxDropDirective;
    let dropAreaRects = { top: 0, left: 0, right: 0, bottom: 0 };
    let dragDirsRects = [{ top: 0, left: 0, right: 0, bottom: 0 }];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestDragDropComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fix = TestBed.createComponent(TestDragDropComponent);
        fix.detectChanges();

        dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        dropArea = fix.componentInstance.dropArea;
        dropAreaRects = getElemRects(dropArea.element.nativeElement);
    });

    afterEach(() => {
        fix = null;
        dragDirsRects = null;
        dropArea = null;
        dropAreaRects = null;
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

        vi.spyOn(firstDrag.ghostCreate, 'emit');
        vi.spyOn(firstDrag.ghostDestroy, 'emit');
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
        await nextFrame();

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

        vi.spyOn(firstDrag.dragStart, 'emit');
        vi.spyOn(firstDrag.dragMove, 'emit');
        vi.spyOn(firstDrag.dragEnd, 'emit');

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
        await nextFrame();

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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

        vi.spyOn(firstDrag.dragStart, 'emit');
        vi.spyOn(firstDrag.dragMove, 'emit');
        vi.spyOn(firstDrag.dragEnd, 'emit');

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
        await nextFrame();

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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

        vi.spyOn(firstDrag.ghostCreate, 'emit');
        vi.spyOn(firstDrag.ghostDestroy, 'emit');
        vi.spyOn(firstDrag.dragClick, 'emit');
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
        await nextFrame();

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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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

        vi.spyOn(firstDrag.dragStart, 'emit');
        vi.spyOn(firstDrag.dragMove, 'emit');
        vi.spyOn(firstDrag.dragEnd, 'emit');

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
        await nextFrame();

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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

        vi.spyOn(firstDrag.dragStart, 'emit');
        vi.spyOn(firstDrag.dragClick, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragClick.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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

        vi.spyOn(firstDrag.dragStart, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 3, startingY + 3);
        fix.detectChanges();
        await nextFrame();

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 3);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 3);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 4, startingY + 4);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

        expect(firstDrag.ghostElement).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        firstDrag.setLocation(new IgxDragLocation(initialPageX, initialPageY));

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
        await nextFrame();

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

        firstDrag.setLocation(new IgxDragLocation(initialPageX, initialPageY));
        fix.detectChanges();
        await nextFrame();

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

        vi.spyOn(thirdDrag.dragStart, 'emit');

        // Check if drag element itself is not draggable.
        UIInteractions.simulatePointerEvent('pointerdown', thirdElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', thirdElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', thirdElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await nextFrame();

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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        const event = UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        fix.detectChanges();
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalledWith({
            originalEvent: event,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX: dropAreaRects.left + 100,
            pageY: dropAreaRects.top + 5,
            offsetX: 100,
            offsetY: 5
        });

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        const eventUp = UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
        fix.detectChanges();
        await wait();

        expect(dropArea.dropped.emit).toHaveBeenCalledWith({
            originalEvent: eventUp,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX: dropAreaRects.left + 100,
            pageY: dropAreaRects.top + 20,
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
            pageX: dropAreaRects.left + 100,
            pageY: dropAreaRects.top + 20,
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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
        await transitionStarted(firstDrag.element.nativeElement, dragDirsRects[0].left + 20);


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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        expect(firstDrag.ghostElement).toBeTruthy();
        await transitionStarted(firstDrag.ghostElement, dragDirsRects[0].left + 20);

        expect(firstDrag.ghostElement).toBeTruthy();

        const currLeft = firstDrag.ghostElement.getBoundingClientRect().left;
        const currTop = firstDrag.ghostElement.getBoundingClientRect().top;
        expect(dragDirsRects[0].left < currLeft && currLeft <= (dragDirsRects[0].left + 20)).toBeTruthy();
        expect(dragDirsRects[0].top < currTop && currTop <= (dragDirsRects[0].top + 20)).toBeTruthy();
    });

    it('should not create ghost element when executing transitionToOrigin() when no dragging is performed without start.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;

        vi.spyOn(firstDrag.transitioned, 'emit');

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

        firstDrag.transitionTo(new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50), {}, new IgxDragLocation(dragDirsRects[0].left + 100, dragDirsRects[0].top + 100));
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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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
            firstDrag.transitionTo(new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50), {}, new IgxDragLocation(dragDirsRects[0].left + 100, dragDirsRects[0].top + 100));
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
        await nextFrame();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

        expect(firstDrag.ghostElement).toBeTruthy();
        expect(firstDrag.ghostElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag.ghostElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

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

        firstDrag.transitionTo(new IgxDragLocation(dragDirsRects[0].left + 50, dragDirsRects[0].top + 50), {}, new IgxDragLocation(dragDirsRects[0].left + 100, dragDirsRects[0].top + 100));
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

    it('should not transition when transitionToOrigin() start location equals the origin location.', () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        firstDrag.ghost = false;
        const origin = firstDrag.originLocation;
        // Ensure left and top differ, otherwise comparing pageY against the left origin would not be detected.
        expect(origin.pageX).not.toEqual(origin.pageY);

        firstDrag.transitionToOrigin({}, new IgxDragLocation(origin.pageX, origin.pageY));

        expect(firstDrag.animInProgress).toBe(false);
    });

    it('should not cancel the drag on Escape by default.', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        expect(firstDrag.cancelOnEscape).toBe(false);
        vi.spyOn(firstDrag.dragEnd, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
        document.body.dispatchEvent(escape);
        await wait();

        expect(escape.defaultPrevented).toBe(false);
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();
        expect(firstDrag.ghostElement).toBeTruthy();

        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();
    });

    describe('Cancel drag', () => {
        const escapeEvent = (key = 'Escape') => new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

        beforeEach(() => {
            fix.componentInstance.dragElems.forEach(drag => drag.cancelOnEscape = true);
        });

        /** Starts dragging the first igxDrag and moves its ghost over the drop area. Returns the pointer position. */
        const dragFirstOverDropArea = async (drag: IgxDragDirective) => {
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            UIInteractions.simulatePointerEvent('pointerdown', drag.element.nativeElement, startingX, startingY);
            fix.detectChanges();
            await wait();

            UIInteractions.simulatePointerEvent('pointermove', drag.element.nativeElement, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait();

            const moveTarget = drag.ghost ? drag.ghostElement : drag.element.nativeElement;
            UIInteractions.simulatePointerEvent('pointermove', moveTarget, dropAreaRects.left + 100, dropAreaRects.top + 5);
            fix.detectChanges();
            await wait(100);
            return { x: dropAreaRects.left + 100, y: dropAreaRects.top + 5 };
        };

        it('should end the drag without dropping when cancelDrag() is called over a drop area.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');
            vi.spyOn(firstDrag.dragClick, 'emit');
            vi.spyOn(firstDrag.dragMove, 'emit');
            vi.spyOn(firstDrag.transitioned, 'emit');
            vi.spyOn(dropArea.enter, 'emit');
            vi.spyOn(dropArea.leave, 'emit');
            vi.spyOn(dropArea.dropped, 'emit');

            const pos = await dragFirstOverDropArea(firstDrag);
            expect(dropArea.enter.emit).toHaveBeenCalledTimes(1);
            const ghost = firstDrag.ghostElement;
            expect(ghost).toBeTruthy();

            firstDrag.cancelDrag();
            fix.detectChanges();
            await wait();

            expect(dropArea.leave.emit).toHaveBeenCalledTimes(1);
            expect(dropArea.dropped.emit).not.toHaveBeenCalled();
            expect(dragEndSpy).toHaveBeenCalledTimes(1);
            const endArgs = dragEndSpy.mock.lastCall[0];
            expect(endArgs.cancelled).toBe(true);
            expect(endArgs.originalEvent).toBeNull();
            expect(endArgs.owner).toBe(firstDrag);
            expect(firstDrag.ghostElement).toBeNull();
            expect(ghost.isConnected).toBe(false);
            expect(firstDrag.transitioned.emit).toHaveBeenCalledTimes(1);
            expect(firstDrag.transitioned.emit).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }));
            expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
            expect(dropArea.element.nativeElement.children.length).toEqual(0);

            // Later pointer interactions must not continue or finish the drag.
            vi.mocked(firstDrag.dragMove.emit).mockClear();
            firstDrag.onPointerMove(UIInteractions.simulatePointerEvent('pointermove', firstDrag.element.nativeElement, pos.x + 10, pos.y));
            firstDrag.onPointerUp(UIInteractions.simulatePointerEvent('pointerup', firstDrag.element.nativeElement, pos.x + 10, pos.y));
            fix.detectChanges();
            await wait();

            expect(firstDrag.dragMove.emit).not.toHaveBeenCalled();
            expect(dragEndSpy).toHaveBeenCalledTimes(1);
            expect(firstDrag.dragClick.emit).not.toHaveBeenCalled();
            expect(dropArea.dropped.emit).not.toHaveBeenCalled();
            expect(dropArea.leave.emit).toHaveBeenCalledTimes(1);
            expect(firstDrag.ghostElement).toBeNull();
        });

        it('should end the drag with cancelled events and no ghost when cancelDrag() is called in a dragStart handler.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const firstElement = firstDrag.element.nativeElement;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            firstDrag.dragStart.pipe(first()).subscribe(() => firstDrag.cancelDrag());
            vi.spyOn(firstDrag.dragMove, 'emit');
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');
            vi.spyOn(firstDrag.ghostCreate, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
            fix.detectChanges();
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait(100);

            expect(firstDrag.ghostCreate.emit).not.toHaveBeenCalled();
            expect(firstDrag.ghostElement).toBeFalsy();
            expect(document.getElementsByClassName('dragElem').length).toEqual(3);
            expect(firstDrag.dragMove.emit).not.toHaveBeenCalled();
            // Every dragStart gets a matching dragEnd, so handlers can undo work started in dragStart.
            expect(dragEndSpy).toHaveBeenCalledTimes(1);
            expect(dragEndSpy.mock.lastCall[0].cancelled).toBe(true);
            // dragEnd reports the current pointer position, not the pointer down position.
            expect(dragEndSpy.mock.lastCall[0].pageX).toEqual(startingX + 10);
            expect(dragEndSpy.mock.lastCall[0].pageY).toEqual(startingY + 10);
            expect(transitionedSpy).toHaveBeenCalledTimes(1);
            expect(transitionedSpy.mock.lastCall[0].cancelled).toBe(true);

            // Later pointer interactions are ignored and no Escape listener is left behind.
            UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 30, startingY + 30);
            UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 30, startingY + 30);
            await wait(100);
            expect(dragEndSpy).toHaveBeenCalledTimes(1);
            expect(firstDrag.ghostElement).toBeFalsy();
            const escape = escapeEvent();
            document.body.dispatchEvent(escape);
            expect(escape.defaultPrevented).toBe(false);
        });

        it('should keep the pre-drag transform when cancelDrag() is called in a dragStart handler and ghost is disabled.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const elem = firstDrag.element.nativeElement;
            elem.style.transform = 'translate(5px, 6px) rotate(5deg)';
            const transformBefore = elem.style.transform;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            firstDrag.dragStart.pipe(first()).subscribe(() => firstDrag.cancelDrag());
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', elem, startingX, startingY);
            fix.detectChanges();
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', elem, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait(100);

            expect(dragEndSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ cancelled: true }));
            expect(elem.style.transform).toEqual(transformBefore);
        });

        it('should not create a ghost when cancelDrag() is called in a ghostCreate handler.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const firstElement = firstDrag.element.nativeElement;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            firstDrag.ghostCreate.pipe(first()).subscribe(() => firstDrag.cancelDrag());
            vi.spyOn(firstDrag.dragMove, 'emit');
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
            fix.detectChanges();
            await wait();
            expect(() => firstDrag.onPointerMove(
                UIInteractions.simulatePointerEvent('pointermove', document.body, startingX + 10, startingY + 10))).not.toThrow();
            fix.detectChanges();
            await wait(100);

            expect(firstDrag.ghostElement).toBeNull();
            expect(document.getElementsByClassName('dragElem').length).toEqual(3);
            expect(firstDrag.dragMove.emit).not.toHaveBeenCalled();
            expect(dragEndSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ cancelled: true }));
            expect(transitionedSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ cancelled: true }));
        });

        it('should animate the ghost back when cancelDrag() is called in a ghostCreate handler and dragEnd handler calls transitionToOrigin().', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const firstElement = firstDrag.element.nativeElement;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            firstDrag.ghostCreate.pipe(first()).subscribe(() => firstDrag.cancelDrag());
            firstDrag.dragEnd.pipe(first()).subscribe((args) => {
                if (args.cancelled) {
                    firstDrag.transitionToOrigin({ duration: 0.1 });
                }
            });
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
            fix.detectChanges();
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait(300);

            expect(transitionedSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ cancelled: true }));
            expect(firstDrag.animInProgress).toBe(false);
            expect(firstDrag.ghostElement).toBeNull();
            expect(document.getElementsByClassName('dragElem').length).toEqual(3);

            // The next drag starts normally.
            const dragStartSpy = vi.spyOn(firstDrag.dragStart, 'emit');
            UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
            fix.detectChanges();
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait(100);
            expect(dragStartSpy).toHaveBeenCalledTimes(1);
            UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait();
        });

        it('should finish right away when transitionTo() does not move the base element.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');

            firstDrag.transitionTo(firstDrag.location, { duration: 0.1 });
            await wait(300);

            expect(transitionedSpy).toHaveBeenCalledTimes(1);
            expect(firstDrag.animInProgress).toBe(false);
        });

        it('should finish right away when transitionTo() has no ghost because its creation was cancelled.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghostCreate.pipe(first()).subscribe((args) => args.cancel = true);
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');

            expect(() => firstDrag.transitionTo(new IgxDragLocation(dropAreaRects.left, dropAreaRects.top), { duration: 0.1 }))
                .not.toThrow();
            await wait(300);

            expect(firstDrag.ghostElement).toBeFalsy();
            expect(transitionedSpy).toHaveBeenCalledTimes(1);
            expect(firstDrag.animInProgress).toBe(false);
        });

        it('should finish the cancel when the ghostCreate handler also cancels the ghost and dragEnd handler calls transitionToOrigin().', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const firstElement = firstDrag.element.nativeElement;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            firstDrag.ghostCreate.pipe(first()).subscribe((args) => {
                args.cancel = true;
                firstDrag.cancelDrag();
            });
            firstDrag.dragEnd.pipe(first()).subscribe((args) => {
                if (args.cancelled) {
                    firstDrag.transitionToOrigin({ duration: 0.1 });
                }
            });
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
            fix.detectChanges();
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait(300);

            expect(transitionedSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ cancelled: true }));
            expect(firstDrag.animInProgress).toBe(false);
            expect(firstDrag.ghostElement).toBeFalsy();
            expect(document.getElementsByClassName('dragElem').length).toEqual(3);
        });

        it('should not create a ghost when cancelDrag() is called while the ghost template is created.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghostTemplate = fix.componentInstance.ghostTemplate;
            const firstElement = firstDrag.element.nativeElement;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            const createView = firstDrag.viewContainer.createEmbeddedView.bind(firstDrag.viewContainer);
            // Simulate code in the ghost template that cancels the drag while the template is created.
            vi.spyOn(firstDrag.viewContainer, 'createEmbeddedView').mockImplementation((...args: any[]) => {
                firstDrag.cancelDrag();
                return (createView as any)(...args);
            });
            vi.spyOn(firstDrag.ghostCreate, 'emit');
            vi.spyOn(firstDrag.dragMove, 'emit');
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
            fix.detectChanges();
            await wait();
            expect(() => firstDrag.onPointerMove(
                UIInteractions.simulatePointerEvent('pointermove', document.body, startingX + 10, startingY + 10))).not.toThrow();
            fix.detectChanges();
            await wait(100);

            expect(firstDrag.ghostCreate.emit).not.toHaveBeenCalled();
            expect(firstDrag.ghostElement).toBeFalsy();
            expect(document.body.querySelectorAll(':scope > .ghostElement').length).toEqual(0);
            expect(firstDrag.dragMove.emit).not.toHaveBeenCalled();
            expect(dragEndSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ cancelled: true }));
        });

        it('should not keep a reference to the ghost after a drag ends.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const pos = await dragFirstOverDropArea(firstDrag);
            expect((firstDrag as any)._pointerCaptureTarget).toBe(firstDrag.ghostElement);

            UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, pos.x, pos.y);
            fix.detectChanges();
            await wait();

            expect(firstDrag.ghostElement).toBeNull();
            expect((firstDrag as any)._pointerCaptureTarget).toBeNull();
        });

        it('should not move the base element with a container scroll step scheduled before the drag was cancelled.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const elem = firstDrag.element.nativeElement;
            await dragFirstOverDropArea(firstDrag);

            // A scroll step that is already scheduled when the drag is cancelled.
            const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
            (firstDrag as any).onScrollContainerStep(1 /* DragScrollDirection.DOWN */);
            firstDrag.cancelDrag();
            const transformAfterCancel = elem.style.transform;
            await wait(50);

            expect(scrollBySpy).not.toHaveBeenCalled();
            expect(elem.style.transform).toEqual(transformAfterCancel);
        });

        it('should finish the cancel when transitionToOrigin() is called and the base element is already at its origin.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const elem = firstDrag.element.nativeElement;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            // Cancelling in dragStart leaves the element where it was, so transitionToOrigin() has nothing to animate.
            firstDrag.dragStart.pipe(first()).subscribe(() => firstDrag.cancelDrag());
            firstDrag.dragEnd.pipe(first()).subscribe((args) => {
                if (args.cancelled) {
                    firstDrag.transitionToOrigin({ duration: 0.1 });
                }
            });
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', elem, startingX, startingY);
            fix.detectChanges();
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', elem, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait(300);

            expect(transitionedSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ cancelled: true }));
            expect(firstDrag.animInProgress).toBe(false);
            expect(elem.style.transform).toEqual('');

            // The next drag starts normally.
            const dragStartSpy = vi.spyOn(firstDrag.dragStart, 'emit');
            UIInteractions.simulatePointerEvent('pointerdown', elem, startingX, startingY);
            fix.detectChanges();
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', elem, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait(100);
            expect(dragStartSpy).toHaveBeenCalledTimes(1);
            UIInteractions.simulatePointerEvent('pointerup', elem, startingX + 10, startingY + 10);
            fix.detectChanges();
            await wait();
        });

        it('should stop drop area events when cancelDrag() is called in an enter handler.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            dropArea.enter.pipe(first()).subscribe(() => firstDrag.cancelDrag());
            vi.spyOn(dropArea.over, 'emit');
            vi.spyOn(dropArea.dropped, 'emit');
            const leaveSpy = vi.spyOn(dropArea.leave, 'emit');
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');

            const pos = await dragFirstOverDropArea(firstDrag);

            expect(dropArea.over.emit).not.toHaveBeenCalled();
            expect(leaveSpy).toHaveBeenCalledTimes(1);
            expect(dragEndSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ cancelled: true }));
            expect(firstDrag.ghostElement).toBeNull();

            // A later release does not drop.
            firstDrag.onPointerUp(UIInteractions.simulatePointerEvent('pointerup', firstDrag.element.nativeElement, pos.x, pos.y));
            fix.detectChanges();
            await wait();
            expect(dropArea.dropped.emit).not.toHaveBeenCalled();
            expect(dropArea.over.emit).not.toHaveBeenCalled();
            expect(dragEndSpy).toHaveBeenCalledTimes(1);
            expect(dropArea.element.nativeElement.children.length).toEqual(0);
        });

        it('should stop moving when cancelDrag() is called in a dragMove handler.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const elem = firstDrag.element.nativeElement;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            firstDrag.dragMove.pipe(first()).subscribe(() => firstDrag.cancelDrag());
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');
            vi.spyOn(firstDrag.transitioned, 'emit');
            vi.spyOn(dropArea.enter, 'emit');

            UIInteractions.simulatePointerEvent('pointerdown', elem, startingX, startingY);
            fix.detectChanges();
            await wait();
            // The first move starts the drag and moves the element right over the drop area.
            UIInteractions.simulatePointerEvent('pointermove', elem, dropAreaRects.left + 100, dropAreaRects.top + 5);
            fix.detectChanges();
            await wait(100);

            expect(dragEndSpy).toHaveBeenCalledTimes(1);
            expect(dragEndSpy.mock.lastCall[0].cancelled).toBe(true);
            // dragEnd reports the current pointer position, not the position before this move.
            expect(dragEndSpy.mock.lastCall[0].pageX).toEqual(dropAreaRects.left + 100);
            expect(dragEndSpy.mock.lastCall[0].pageY).toEqual(dropAreaRects.top + 5);
            expect(firstDrag.transitioned.emit).toHaveBeenCalledTimes(1);
            expect(dropArea.enter.emit).not.toHaveBeenCalled();
            expect(elem.style.transform).toEqual('');
            expect(elem.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
            expect(elem.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        });

        it('should release the pointer capture of the base element on cancel when ghost is disabled.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const elem = firstDrag.element.nativeElement;

            await dragFirstOverDropArea(firstDrag);
            // Synthetic pointer events do not keep a real capture, so simulate that the element still has it.
            vi.spyOn(elem, 'hasPointerCapture').mockReturnValue(true);
            const releaseSpy = vi.spyOn(elem, 'releasePointerCapture').mockImplementation(() => {});

            firstDrag.cancelDrag();
            await wait();

            expect(releaseSpy).toHaveBeenCalledExactlyOnceWith(1);
        });

        it('should do nothing when cancelDrag() is called after pointer down but before the drag starts.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const firstElement = firstDrag.element.nativeElement;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            vi.spyOn(firstDrag.dragClick, 'emit');
            vi.spyOn(firstDrag.dragEnd, 'emit');
            // Synthetic pointer events do not keep a real capture, so simulate that the element has it.
            vi.spyOn(firstElement, 'hasPointerCapture').mockReturnValue(true);
            const releaseSpy = vi.spyOn(firstElement, 'releasePointerCapture').mockImplementation(() => {});

            UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
            fix.detectChanges();
            await wait();

            firstDrag.cancelDrag();
            expect(releaseSpy).not.toHaveBeenCalled();

            UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX, startingY);
            fix.detectChanges();
            await wait();

            expect(firstDrag.dragClick.emit).toHaveBeenCalledTimes(1);
            expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();
        });

        it('should send leave only once when cancelDrag() is called in a leave handler.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
            const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
            dropArea.leave.pipe(first()).subscribe(() => firstDrag.cancelDrag());
            const leaveSpy = vi.spyOn(dropArea.leave, 'emit');
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');

            await dragFirstOverDropArea(firstDrag);
            // Move out of the drop area.
            UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, startingX, startingY);
            fix.detectChanges();
            await wait(100);

            expect(leaveSpy).toHaveBeenCalledTimes(1);
            expect(dragEndSpy).toHaveBeenCalledTimes(1);
            expect(dragEndSpy.mock.lastCall[0].cancelled).toBe(true);
            expect(firstDrag.ghostElement).toBeNull();
        });

        it('should not enter the next drop area when cancelDrag() is called in a leave handler.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            // A second drop area right below the first one.
            const secondArea = document.createElement('div');
            secondArea.setAttribute('droppable', 'true');
            Object.assign(secondArea.style, {
                position: 'absolute',
                left: `${dropAreaRects.left}px`,
                top: `${dropAreaRects.bottom + window.scrollY + 20}px`,
                width: '200px',
                height: '100px'
            });
            document.body.appendChild(secondArea);
            const secondAreaEvents: string[] = [];
            ['igxDragEnter', 'igxDragOver', 'igxDragLeave'].forEach(name =>
                secondArea.addEventListener(name, () => secondAreaEvents.push(name)));

            try {
                dropArea.leave.pipe(first()).subscribe(() => firstDrag.cancelDrag());
                const leaveSpy = vi.spyOn(dropArea.leave, 'emit');
                const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');

                await dragFirstOverDropArea(firstDrag);
                // Move from the first drop area straight into the second one.
                const secondRect = secondArea.getBoundingClientRect();
                UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement,
                    secondRect.left + 10 + window.scrollX, secondRect.top + 10 + window.scrollY);
                fix.detectChanges();
                await wait(100);

                expect(leaveSpy).toHaveBeenCalledTimes(1);
                expect(dragEndSpy).toHaveBeenCalledTimes(1);
                expect(secondAreaEvents).toEqual([]);
            } finally {
                secondArea.remove();
            }
        });

        it('should do nothing when cancelDrag() is called and no drag is in progress.', () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            vi.spyOn(firstDrag.dragEnd, 'emit');
            vi.spyOn(firstDrag.transitioned, 'emit');

            firstDrag.cancelDrag();

            expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();
            expect(firstDrag.transitioned.emit).not.toHaveBeenCalled();
            expect(firstDrag.ghostElement).toBeFalsy();
        });

        it('should cancel the drag when Escape is pressed while focus is on the body.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const dragEndSpy = vi.spyOn(firstDrag.dragEnd, 'emit');
            vi.spyOn(dropArea.dropped, 'emit');

            await dragFirstOverDropArea(firstDrag);

            const escape = escapeEvent();
            document.body.dispatchEvent(escape);
            fix.detectChanges();
            await wait();

            expect(escape.defaultPrevented).toBe(true);
            expect(dragEndSpy).toHaveBeenCalledTimes(1);
            const endArgs = dragEndSpy.mock.lastCall[0];
            expect(endArgs.cancelled).toBe(true);
            expect(endArgs.originalEvent).toBe(escape);
            expect(dropArea.dropped.emit).not.toHaveBeenCalled();
            expect(firstDrag.ghostElement).toBeNull();
        });

        it('should cancel the drag when the legacy "Esc" key is pressed.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            vi.spyOn(firstDrag.dragEnd, 'emit');

            await dragFirstOverDropArea(firstDrag);
            document.dispatchEvent(escapeEvent('Esc'));
            await wait();

            expect(firstDrag.dragEnd.emit).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }));
            expect(firstDrag.ghostElement).toBeNull();
        });

        it('should not cancel the drag on Escape when cancelOnEscape is false.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.cancelOnEscape = false;
            vi.spyOn(firstDrag.dragEnd, 'emit');
            vi.spyOn(dropArea.dropped, 'emit');

            const pos = await dragFirstOverDropArea(firstDrag);
            const escape = escapeEvent();
            document.body.dispatchEvent(escape);
            fix.detectChanges();
            await wait();

            expect(escape.defaultPrevented).toBe(false);
            expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();
            expect(firstDrag.ghostElement).toBeTruthy();

            UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, pos.x, pos.y);
            fix.detectChanges();
            await wait();

            expect(dropArea.dropped.emit).toHaveBeenCalledTimes(1);
            expect(firstDrag.dragEnd.emit).toHaveBeenCalledTimes(1);
            expect(vi.mocked(firstDrag.dragEnd.emit).mock.lastCall[0].cancelled).toBeUndefined();
        });

        it('should consume Escape only while a drag is in progress.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const bubbleListener = vi.fn();
            document.addEventListener('keydown', bubbleListener);

            try {
                const idleEscape = escapeEvent();
                document.body.dispatchEvent(idleEscape);
                expect(bubbleListener).toHaveBeenCalledTimes(1);
                expect(idleEscape.defaultPrevented).toBe(false);

                await dragFirstOverDropArea(firstDrag);
                // Other keys are not consumed during a drag.
                const otherKey = escapeEvent('Enter');
                document.body.dispatchEvent(otherKey);
                expect(bubbleListener).toHaveBeenCalledTimes(2);
                expect(otherKey.defaultPrevented).toBe(false);

                document.body.dispatchEvent(escapeEvent());
                expect(bubbleListener).toHaveBeenCalledTimes(2);
                await wait();

                // After the cancel the document listener is removed and Escape reaches other handlers again.
                const afterEscape = escapeEvent();
                document.body.dispatchEvent(afterEscape);
                expect(bubbleListener).toHaveBeenCalledTimes(3);
                expect(afterEscape.defaultPrevented).toBe(false);
            } finally {
                document.removeEventListener('keydown', bubbleListener);
            }
        });

        it('should stop listening for Escape after the drag is dropped.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            vi.spyOn(firstDrag.dragEnd, 'emit');
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');

            const pos = await dragFirstOverDropArea(firstDrag);
            UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, pos.x, pos.y);
            fix.detectChanges();
            await wait();

            const escape = escapeEvent();
            document.body.dispatchEvent(escape);
            expect(escape.defaultPrevented).toBe(false);
            expect(firstDrag.dragEnd.emit).toHaveBeenCalledTimes(1);
            // A drag that is not cancelled does not report cancelled.
            expect(transitionedSpy).toHaveBeenCalledTimes(1);
            expect(transitionedSpy.mock.lastCall[0].cancelled).toBeUndefined();
        });

        it('should not report cancelled for a drag following a cancelled one.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            const transitionedSpy = vi.spyOn(firstDrag.transitioned, 'emit');

            await dragFirstOverDropArea(firstDrag);
            firstDrag.cancelDrag();
            await wait();
            expect(transitionedSpy.mock.lastCall[0].cancelled).toBe(true);

            const pos = await dragFirstOverDropArea(firstDrag);
            UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, pos.x, pos.y);
            fix.detectChanges();
            await wait();

            expect(transitionedSpy).toHaveBeenCalledTimes(2);
            expect(transitionedSpy.mock.lastCall[0].cancelled).toBeUndefined();
        });

        it('should stop listening for Escape when the directive is destroyed during a drag.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            await dragFirstOverDropArea(firstDrag);

            fix.destroy();

            const escape = escapeEvent();
            document.body.dispatchEvent(escape);
            expect(escape.defaultPrevented).toBe(false);
        });

        it('should animate the ghost back and remove it when dragEnd handler calls transitionToOrigin() on cancel.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.dragEnd.pipe(first()).subscribe((args) => {
                if (args.cancelled) {
                    firstDrag.transitionToOrigin({ duration: 0.1 });
                }
            });
            vi.spyOn(firstDrag.transitioned, 'emit');

            await dragFirstOverDropArea(firstDrag);
            const ghost = firstDrag.ghostElement;

            firstDrag.cancelDrag();
            await wait();

            // The ghost stays while it animates back.
            expect(firstDrag.ghostElement).toBe(ghost);
            expect(firstDrag.animInProgress).toBe(true);
            expect(firstDrag.transitioned.emit).not.toHaveBeenCalled();

            await wait(300);

            expect(firstDrag.transitioned.emit).toHaveBeenCalledTimes(1);
            expect(firstDrag.transitioned.emit).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }));
            expect(firstDrag.ghostElement).toBeNull();
            expect(ghost.isConnected).toBe(false);
            expect(firstDrag.animInProgress).toBe(false);
        });

        it('should restore the base element position from before the drag on cancel when ghost is disabled.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const elem = firstDrag.element.nativeElement;
            // The element already has a transform before dragging starts.
            elem.style.transform = 'translate3d(5px, 5px, 0px)';
            const rectBefore = elem.getBoundingClientRect();
            vi.spyOn(firstDrag.transitioned, 'emit');
            vi.spyOn(dropArea.dropped, 'emit');

            await dragFirstOverDropArea(firstDrag);
            expect(elem.getBoundingClientRect().left).not.toEqual(rectBefore.left);

            document.body.dispatchEvent(escapeEvent());
            await wait();

            expect(dropArea.dropped.emit).not.toHaveBeenCalled();
            expect(firstDrag.transitioned.emit).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }));
            expect(elem.style.transform).toEqual('translate3d(5px, 5px, 0px)');
            expect(elem.getBoundingClientRect().left).toEqual(rectBefore.left);
            expect(elem.getBoundingClientRect().top).toEqual(rectBefore.top);
        });

        it('should restore any pre-drag transform on cancel when ghost is disabled.', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const elem = firstDrag.element.nativeElement;
            // A transform that is not a plain translate3d, so it cannot be restored from parsed X/Y values.
            elem.style.transform = 'translate(5px, 6px) rotate(5deg)';
            const transformBefore = elem.style.transform;

            await dragFirstOverDropArea(firstDrag);
            expect(elem.style.transform).not.toEqual(transformBefore);

            firstDrag.cancelDrag();
            await wait();

            expect(elem.style.transform).toEqual(transformBefore);
        });

        it('should animate the base element to its origin on cancel when ghost is disabled and dragEnd handler calls transitionToOrigin().', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            firstDrag.dragEnd.pipe(first()).subscribe((args) => {
                if (args.cancelled) {
                    firstDrag.transitionToOrigin({ duration: 0.1 });
                }
            });
            vi.spyOn(firstDrag.transitioned, 'emit');
            vi.spyOn(dropArea.dropped, 'emit');

            await dragFirstOverDropArea(firstDrag);
            const elem = firstDrag.element.nativeElement;
            expect(elem.getBoundingClientRect().left).not.toEqual(dragDirsRects[0].left);

            document.body.dispatchEvent(escapeEvent());
            await wait(300);

            expect(dropArea.dropped.emit).not.toHaveBeenCalled();
            expect(firstDrag.transitioned.emit).toHaveBeenCalledTimes(1);
            expect(elem.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
            expect(elem.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        });

        it('should animate the base element back to its pre-drag transform on cancel when dragEnd handler calls transitionToOrigin().', async () => {
            const firstDrag = fix.componentInstance.dragElems.first;
            firstDrag.ghost = false;
            const elem = firstDrag.element.nativeElement;
            elem.style.transform = 'translate(5px, 6px) rotate(5deg)';
            const transformBefore = elem.style.transform;
            const rectBefore = elem.getBoundingClientRect();
            firstDrag.dragEnd.pipe(first()).subscribe((args) => {
                if (args.cancelled) {
                    firstDrag.transitionToOrigin({ duration: 0.1 });
                }
            });
            vi.spyOn(firstDrag.transitioned, 'emit');

            await dragFirstOverDropArea(firstDrag);
            expect(elem.style.transform).not.toEqual(transformBefore);

            firstDrag.cancelDrag();
            await wait(300);

            expect(firstDrag.transitioned.emit).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }));
            expect(elem.style.transform).toEqual(transformBefore);
            expect(elem.getBoundingClientRect().left).toBeCloseTo(rectBefore.left, 0);
            expect(elem.getBoundingClientRect().top).toBeCloseTo(rectBefore.top, 0);
        });
    });
});

describe('Linked igxDrag/igxDrop ', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TestDragDropLinkedSingleComponent,
                TestDragDropLinkedMixedComponent,
                TestDragDropStrategiesComponent
            ]
        })
            .compileComponents();
    });

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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', secondDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).not.toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', secondDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', secondDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).not.toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', secondDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 150, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 150, dropAreaRects.top + 20);
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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');

        fix.componentInstance.dropArea.dropped.pipe(first()).subscribe(((e: IDropDroppedEventArgs) => e.cancel = true));

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
        fix.detectChanges();
        await nextFrame();

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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
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

        vi.spyOn(dropArea.enter, 'emit');
        vi.spyOn(dropArea.leave, 'emit');
        vi.spyOn(dropArea.dropped, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(1);
        expect(dropArea.element.nativeElement.children.length).toEqual(2);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 5);
        await nextFrame();

        expect(dropArea.enter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the ghostElement because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag.ghostElement, dropAreaRects.left + 100, dropAreaRects.top + 20);
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
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestDragDropNestedComponent]
        })
            .compileComponents();
    });

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

        vi.spyOn(rootList.dragStart, 'emit');
        vi.spyOn(firstCategory.dragStart, 'emit');
        vi.spyOn(firstMovie.dragStart, 'emit');

        const dragHandle = thirdElement.children[0].children[0];
        const dragHandleRects = dragHandle.getBoundingClientRect();
        const handleStartX = (dragHandleRects.left + dragHandleRects.right) / 2;
        const handleStartY = (dragHandleRects.top + dragHandleRects.bottom) / 2;
        UIInteractions.simulatePointerEvent('pointerdown', dragHandle, handleStartX, handleStartY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 10, handleStartY + 10);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointerup', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await wait();

        expect(thirdElement.getBoundingClientRect().left).toEqual(dragDirsRects.left + 20);
        expect(thirdElement.getBoundingClientRect().top).toEqual(dragDirsRects.top + 20);
        expect(firstMovie.dragStart.emit).toHaveBeenCalled();
        expect(rootList.dragStart.emit).not.toHaveBeenCalled();
        expect(firstCategory.dragStart.emit).not.toHaveBeenCalled();
    });
});

describe('igxDrag touch, mouse, pointerLost and shadow root coverage', () => {
    let fix: ComponentFixture<TestDragDropComponent>;
    let dragDirsRects: { top: number; left: number; right: number; bottom: number }[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestDragDropComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fix = TestBed.createComponent(TestDragDropComponent);
        fix.detectChanges();
        dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
    });

    it('should handle touchstart event to initiate drag when touch events are used', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        vi.spyOn(firstDrag.dragStart, 'emit');

        // In Chrome headless, pointerEventsEnabled is true (PointerEvent is defined).
        // Mock the properties so the touch path is taken in ngAfterContentInit
        vi.spyOn(firstDrag, 'pointerEventsEnabled', 'get').mockReturnValue(false);
        vi.spyOn(firstDrag, 'touchEventsEnabled', 'get').mockReturnValue(true);

        // Re-bind events with the mocked touch path
        firstDrag.ngAfterContentInit();

        // Simulate touchstart — triggers onPointerDown via touchstart path
        UIInteractions.simulateTouchStartEvent(firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Simulate touch move via document.defaultView (bound by ngAfterContentInit touch path)
        UIInteractions.simulateTouchMoveEvent(document.defaultView, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

        // After a 20px move the drag should have started
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();

        UIInteractions.simulateTouchEndEvent(document.defaultView, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should handle mousedown event to initiate drag when mouse events are used', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        vi.spyOn(firstDrag.dragStart, 'emit');
        // Spy on pointerEventsEnabled to return false so the mousedown path is taken
        vi.spyOn(firstDrag, 'pointerEventsEnabled', 'get').mockReturnValue(false);
        vi.spyOn(firstDrag, 'touchEventsEnabled', 'get').mockReturnValue(false);

        // Re-init the event subscriptions with the mocked properties
        firstDrag.ngAfterContentInit();

        UIInteractions.simulateMouseEvent('mousedown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulateMouseEvent('mousemove', document.body, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();

        UIInteractions.simulateMouseEvent('mouseup', document.body, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    });

    it('should not initiate drag on secondary pointer button', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        vi.spyOn(firstDrag.dragStart, 'emit');
        vi.spyOn(firstDrag.dragClick, 'emit');

        const pointerDown = new PointerEvent('pointerdown', {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            button: 2
        });
        Object.defineProperty(pointerDown, 'pageX', { value: startingX, enumerable: true });
        Object.defineProperty(pointerDown, 'pageY', { value: startingY, enumerable: true });
        firstElement.dispatchEvent(pointerDown);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await nextFrame();

        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragClick.emit).not.toHaveBeenCalled();
        expect(firstDrag.ghostElement).not.toBeDefined();
    });

    it('should call onPointerLost early return when _clicked is false', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;

        vi.spyOn(firstDrag.dragEnd, 'emit');

        // _clicked starts as false — calling onPointerLost should return immediately
        firstDrag.onPointerLost({ pageX: 100, pageY: 100 } as unknown as PointerEvent);

        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();
    });

    it('should emit dragEnd on onPointerLost when drag was in progress', async () => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        vi.spyOn(firstDrag.dragEnd, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await nextFrame();

        // Ghost is now active — onPointerLost should emit dragEnd
        UIInteractions.simulatePointerEvent('lostpointercapture', firstDrag.ghostElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragEnd.emit).toHaveBeenCalled();
    });

    it('should return elements from shadow root via getFromShadowRoot', () => {
        const firstDrag = fix.componentInstance.dragElems.first;

        // Create a mock element with a shadowRoot that returns elements from point
        const innerElem = document.createElement('span');
        const shadowHost = document.createElement('div');
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(innerElem);

        const mockParentElems = [shadowHost];

        // Mock elementsFromPoint to return our inner element
        vi.spyOn(shadowRoot, 'elementsFromPoint').mockReturnValue([innerElem]);

        const result = (firstDrag as any).getFromShadowRoot(shadowHost, 100, 100, mockParentElems);

        expect(result).toContain(innerElem);
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxDragDirective, IgxDropDirective, IgxDragHandleDirective, IgxDragIgnoreDirective]
})
class TestDragDropComponent {
    public renderer = inject(Renderer2);

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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxDragDirective, IgxDropDirective]
})
class TestDragDropLinkedSingleComponent extends TestDragDropComponent {
}

@Component({
    styles: generalStyles,
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }" [dragChannel]="1">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }" [dragChannel]="$any([2, 6, '3'])">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }" [dragChannel]="3">Drag 3</div>
            <ng-template #ghostTemplate>
                <div class="ghostElement">Drag Template</div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }" [dropChannel]="[1, 3]"></div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxDragDirective, IgxDropDirective]
})
class TestDragDropLinkedMixedComponent extends TestDragDropComponent {
}

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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxDragDirective, IgxDropDirective]
})
class TestDragDropStrategiesComponent extends TestDragDropLinkedSingleComponent {
}

@Component({
    styles: generalStyles,
    template: `
        <div class="rootList movieListItem" igxDrag [ghost]="false">
            <div>
                <igx-icon igxDragHandle>drag_indicator</igx-icon>
                <span>Movies list</span>
            </div>
            @for (category of categoriesNotes; track category.text) {
                <div class="movieListItem" igxDrag [ghost]="false">
                    <div>
                        <igx-icon igxDragHandle>drag_indicator</igx-icon>
                        <span>{{category.text}}</span>
                    </div>
                    @for (note of getCategoryMovies(category.text); track note.text) {
                        <div class="movieListItem" igxDrag [ghost]="false">
                            <div>
                                <igx-icon igxDragHandle>drag_indicator</igx-icon>
                                <span>{{note.text}}</span>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxIconComponent, IgxDragDirective, IgxDragHandleDirective]
})
class TestDragDropNestedComponent extends TestDragDropComponent {
    protected categoriesNotes = [
        { text: 'Action', dragged: false },
        { text: 'Fantasy', dragged: false }
    ];
    protected listNotes = [
        { text: 'Avengers: Endgame', category: 'Action', dragged: false },
        { text: 'Avatar', category: 'Fantasy', dragged: false },
        { text: 'Titanic', category: 'Drama', dragged: false },
        { text: 'Star Wars: The Force Awakens', category: 'Fantasy', dragged: false },
        { text: 'Avengers: Infinity War', category: 'Action', dragged: false },
        { text: 'Jurassic World', category: 'Fantasy', dragged: false },
        { text: 'The Avengers', category: 'Action', dragged: false }
    ];

    protected getCategoryMovies(inCategory: string) {
        return this.listNotes.filter(item => item.category === inCategory);
    }
}
