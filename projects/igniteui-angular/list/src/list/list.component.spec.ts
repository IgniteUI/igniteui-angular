import { NgZone, QueryList } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxListItemComponent } from './list-item.component';
import { IgxListPanState } from './list.common';
import { IgxListActionDirective, IgxListComponent, IgxListLineDirective, IgxListLineSubTitleDirective, IgxListLineTitleDirective, IgxListThumbnailDirective, IListItemClickEventArgs } from './list.component';

import { ListWithHeaderComponent, ListWithPanningComponent, EmptyListComponent, CustomEmptyListComponent, ListLoadingComponent, ListWithPanningTemplatesComponent, ListCustomLoadingComponent, ListWithIgxForAndScrollingComponent, TwoHeadersListComponent, TwoHeadersListNoPanningComponent, ListDirectivesComponent, ListWithSelectedItemComponent, ListboxComponent, GroupedListboxComponent, ListWithOwnAttributesComponent, ListWithBoundAttributesComponent, EmptyListboxComponent, ListboxWithWrappedItemsComponent, NestedListboxComponent, GridListComponent, GridWithNestedListboxComponent } from '../../../test-utils/list-components.spec';
import { nextFrame } from '../../../test-utils/ui-interactions.spec';
import { advance, useFakeClock } from '../../../test-utils/helper-utils.spec';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import { ListResourceStringsEN, changei18n } from 'igniteui-angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

/** Delay before a released item hides its pan templates (`setTimeout(500)` in list-item.component.ts). */
const PAN_TEMPLATES_HIDE_DELAY = 500;

describe('List', () => {

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CustomEmptyListComponent,
                EmptyListComponent,
                ListCustomLoadingComponent,
                ListLoadingComponent,
                ListWithHeaderComponent,
                ListWithPanningComponent,
                TwoHeadersListComponent,
                TwoHeadersListNoPanningComponent,
                ListWithPanningTemplatesComponent,
                ListWithIgxForAndScrollingComponent,
                ListDirectivesComponent,
                ListWithSelectedItemComponent,
                ListboxComponent,
                GroupedListboxComponent,
                ListWithOwnAttributesComponent,
                ListWithBoundAttributesComponent
            ]
        }).compileComponents();
    });

    it('should initialize igx-list with item and header', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        const domList = fixture.debugElement.query(By.css('igx-list')).nativeElement;

        expect(list).toBeDefined();
        expect(list.id).toContain('igx-list-');
        expect(list instanceof IgxListComponent).toBeTruthy();
        expect(list.cssClass).toBeTruthy();
        expect(list.isListEmpty).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(0);
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(0);

        fixture.detectChanges();
        expect(domList.id).toContain('igx-list-');
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.cssClass).toBeTruthy();
        expect(list.isListEmpty).toBeFalsy();
        expect(list.items.length).toBe(3);
        expect(list.items[0] instanceof IgxListItemComponent).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(1);
        expect(list.headers[0] instanceof IgxListItemComponent).toBeTruthy();

        list.id = 'customList';
        fixture.detectChanges();

        expect(list.id).toBe('customList');
        expect(domList.id).toBe('customList');
    });

    it('should set/get properly layout properties: width, left, maxLeft, maxRight', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        const testWidth = 400;
        const testLeft = 0;

        fixture.detectChanges();

        fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + 'px';

        fixture.detectChanges();
        expect(list.items.length).toBe(3);
        const item = list.items[0];
        expect(item instanceof IgxListItemComponent).toBeTruthy();
        expect(item.width).toBe(testWidth);
        expect(item.maxLeft).toBe(-testWidth);
        expect(item.maxRight).toBe(testWidth);
        expect(item.element.offsetLeft).toBe(testLeft);
    });

    it('should calculate properly item index', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        expect(list.children instanceof QueryList).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();

        expect(list.children.length).toBe(4);
        expect(list.items.length).toBe(3);
        expect(list.headers.length).toBe(1);

        for (let i = 0; i < list.children.length; i++) {
            const item: IgxListItemComponent = list.children.find(((child) => (child.index === i)));
            expect(item.index).toBe(i);
        }
    });

    it('should pan right and pan left.', () => {
        const fixture = TestBed.createComponent(ListWithPanningComponent);
        const list: IgxListComponent = fixture.componentInstance.list;

        fixture.detectChanges();

        vi.spyOn(list.leftPan, 'emit');
        vi.spyOn(list.panStateChange, 'emit');
        vi.spyOn(list.rightPan, 'emit');

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.RIGHT);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.LEFT);

        expect(list.leftPan.emit).toHaveBeenCalledTimes(1);
        expect(list.panStateChange.emit).toHaveBeenCalledTimes(2);
        expect(list.rightPan.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit startPan and endPan when panning left or right', () => {
        const fixture = TestBed.createComponent(ListWithPanningComponent);
        const list: IgxListComponent = fixture.componentInstance.list;

        fixture.detectChanges();

        vi.spyOn(list.startPan, 'emit');
        vi.spyOn(list.endPan, 'emit');

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);

        expect(list.startPan.emit).toHaveBeenCalledTimes(2);
        expect(list.endPan.emit).toHaveBeenCalledTimes(2);
    });

    it('should not track touch gestures when panning is disabled', () => {
        const fixture = TestBed.createComponent(TwoHeadersListNoPanningComponent);
        fixture.detectChanges();

        const nativeElement = fixture.debugElement.queryAll(By.css('igx-list-item'))[1].nativeElement;
        const captureSpy = vi.spyOn(nativeElement, 'setPointerCapture');
        const touchMove = new Event('touchmove', { bubbles: true, cancelable: true });

        dispatchPointer(nativeElement, 'pointerdown', 0);
        dispatchPointer(nativeElement, 'pointermove', 50);
        nativeElement.dispatchEvent(touchMove);

        /* The item should not interfere with the touch scrolling of the list */
        expect(captureSpy).not.toHaveBeenCalled();
        expect(touchMove.defaultPrevented).toBe(false);
    });

    it('should handle continuous panning outside the Angular zone', () => {
        const fixture = TestBed.createComponent(ListWithPanningComponent);
        const list: IgxListComponent = fixture.componentInstance.list;

        fixture.detectChanges();

        /* Track NgZone.run re-entry directly, so the check does not depend on zone.js being loaded */
        const zone = TestBed.inject(NgZone);
        const run = zone.run.bind(zone);
        let runDepth = 0;
        vi.spyOn(zone, 'run').mockImplementation((fn: (...args: any[]) => any, ...args: any[]) => {
            runDepth++;
            try {
                return run(fn, ...args);
            } finally {
                runDepth--;
            }
        });

        const listItem = list.items[0] as IgxListItemComponent;
        const zoneStates: { panStart?: boolean; panMove?: boolean; panEnd?: boolean } = {};

        vi.spyOn(listItem, 'panStart').mockImplementation(() => zoneStates.panStart = runDepth > 0);
        vi.spyOn(listItem, 'panMove').mockImplementation(() => zoneStates.panMove = runDepth > 0);
        vi.spyOn(listItem, 'panEnd').mockImplementation(() => zoneStates.panEnd = runDepth > 0);

        panItem(fixture.debugElement.queryAll(By.css('igx-list-item'))[0], 0.6);

        /* panMove fires for every pointer move, so it should not trigger change detection */
        expect(zoneStates.panMove).toBe(false);
        expect(zoneStates.panStart).toBe(true);
        expect(zoneStates.panEnd).toBe(true);
    });

    it('should not emit startPan on a tap without horizontal movement', () => {
        const fixture = TestBed.createComponent(ListWithPanningComponent);
        const list: IgxListComponent = fixture.componentInstance.list;

        fixture.detectChanges();

        vi.spyOn(list.startPan, 'emit');

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const nativeElement = itemNativeElements[0].nativeElement;

        /* Simulate a tap: press and release at the same position, no pan */
        dispatchPointer(nativeElement, 'pointerdown', 0);
        dispatchPointer(nativeElement, 'pointerup', 0);

        expect(list.startPan.emit).not.toHaveBeenCalled();
    });

    it('should pan right only.', () => {
        const fixture = TestBed.createComponent(ListWithPanningComponent);
        fixture.componentInstance.allowLeftPanning = false;

        fixture.detectChanges();

        const list: IgxListComponent = fixture.componentInstance.list;

        vi.spyOn(list.leftPan, 'emit');
        vi.spyOn(list.panStateChange, 'emit');
        vi.spyOn(list.rightPan, 'emit');

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.RIGHT);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.NONE);

        expect(list.leftPan.emit).toHaveBeenCalledTimes(0);
        expect(list.panStateChange.emit).toHaveBeenCalledTimes(1);
        expect(list.rightPan.emit).toHaveBeenCalledTimes(1);
    });

    it('should pan left only.', () => {
        const fixture = TestBed.createComponent(ListWithPanningComponent);
        fixture.componentInstance.allowRightPanning = false;
        fixture.detectChanges();

        const list: IgxListComponent = fixture.componentInstance.list;

        vi.spyOn(list.leftPan, 'emit');
        vi.spyOn(list.panStateChange, 'emit');
        vi.spyOn(list.rightPan, 'emit');

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item left */
        panItem(itemNativeElements[0], -0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.LEFT);

        /* Pan item right */
        panItem(itemNativeElements[1], 0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.NONE);

        expect(list.leftPan.emit).toHaveBeenCalledTimes(1);
        expect(list.panStateChange.emit).toHaveBeenCalledTimes(1);
        expect(list.rightPan.emit).toHaveBeenCalledTimes(0);
    });

    it('Should have default no items template.', () => {
        const fixture = TestBed.createComponent(EmptyListComponent);
        const list = fixture.componentInstance.list;
        const listNoItemsMessage = 'There are no items in the list.';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeTruthy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsMessage = fixture.debugElement.query(By.css('.igx-list__message'));
        expect(noItemsMessage.nativeElement.textContent.trim()).toBe(listNoItemsMessage);
    });

    it('Should have custom no items template.', () => {
        const fixture = TestBed.createComponent(CustomEmptyListComponent);
        const list = fixture.componentInstance.list;
        const listCustomNoItemsTemplateContent = 'Custom no items message.';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeTruthy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsParagraphEl = fixture.debugElement.query(By.css('h3'));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listCustomNoItemsTemplateContent);
    });

    it('Should have default loading template.', () => {
        const fixture = TestBed.createComponent(ListLoadingComponent);
        const list = fixture.componentInstance.list;
        const listLoadingItemsMessage = 'Loading data from the server...';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeTruthy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsMessage = fixture.debugElement.query(By.css('.igx-list__message'));
        expect(noItemsMessage.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);
    });

    it('Should show loading template when isLoading=\'true\' even when there are children.', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        list.isLoading = true;
        const listLoadingItemsMessage = 'Loading data from the server...';

        fixture.detectChanges();

        verifyItemsCount(list, 3);

        const noItemsMessage = fixture.debugElement.query(By.css('.igx-list__message'));
        expect(noItemsMessage.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);

        list.isLoading = false;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('p'))).toBeFalsy();
    });

    it('Should have custom loading template.', () => {
        const fixture = TestBed.createComponent(ListCustomLoadingComponent);
        const list = fixture.componentInstance.list;
        const listLoadingItemsMessage = 'Loading data...';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeTruthy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsParagraphEl = fixture.debugElement.query(By.css('h3'));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);
    });

    it('should fire ItemClicked on click.', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list: IgxListComponent = fixture.componentInstance.list;
        fixture.detectChanges();

        vi.spyOn(list.itemClicked, 'emit');

        const event = new Event('click');
        list.items[0].element.dispatchEvent(event);
        const args: IListItemClickEventArgs = {
            item: list.items[0],
            event: event,
            direction: IgxListPanState.NONE
        };
        expect(list.itemClicked.emit).toHaveBeenCalledTimes(1);
        expect(list.itemClicked.emit).toHaveBeenCalledWith(args);

        // Click the same item again and verify click is fired again
        list.items[0].element.dispatchEvent(event);

        expect(list.itemClicked.emit).toHaveBeenCalledTimes(2);
        expect(list.itemClicked.emit).toHaveBeenCalledWith(args);

        list.headers[0].element.dispatchEvent(event);

        expect(list.itemClicked.emit).toHaveBeenCalledTimes(3);
        expect(list.itemClicked.emit).toHaveBeenCalledWith(args);
    });

    it('should emit ItemClicked with correct direction argument when swiping left', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;

        vi.spyOn(list.itemClicked, 'emit');

        fixture.detectChanges();
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItemWithClick(itemNativeElements[1], -0.3); // operating over the second list item because the first one is a header

        const args: IListItemClickEventArgs = {
            item: list.items[0],
            event: null,
            direction: IgxListPanState.LEFT
        };
        expect(list.itemClicked.emit).toHaveBeenCalledTimes(1);
        expect(list.itemClicked.emit).toHaveBeenCalledWith(args);
    });

    it('should emit ItemClicked with correct direction argument when swiping right', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;

        vi.spyOn(list.itemClicked, 'emit');

        fixture.detectChanges();
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItemWithClick(itemNativeElements[1], 0.3); // operating over the second list item because the first one is a header

        const args: IListItemClickEventArgs = {
            item: list.items[0],
            event: null,
            direction: IgxListPanState.RIGHT
        };
        expect(list.itemClicked.emit).toHaveBeenCalledTimes(1);
        expect(list.itemClicked.emit).toHaveBeenCalledWith(args);
    });

    it('should display multiple headers properly.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        verifyItemsCount(list, 3);
        verifyHeadersCount(list, 2);

        const headerClasses = fixture.debugElement.queryAll(By.css('.igx-list__header'));
        expect(headerClasses.length).toBe(2);
    });

    it('should set items\' isHeader property properly.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        const childrenArray = list.children.toArray();
        expect(childrenArray[0].isHeader).toBe(true);
        expect(childrenArray[1].isHeader).toBe(false);
        expect(childrenArray[2].isHeader).toBe(true);
        expect(childrenArray[3].isHeader).toBeFalsy();
        expect(childrenArray[4].isHeader).toBeFalsy();
    });

    it('should set items\' role property properly.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        const childrenArray = list.children.toArray();
        expect(childrenArray[0].role).toBe('separator');
        expect(childrenArray[1].role).toBe('listitem');
        expect(childrenArray[2].role).toBe('separator');
        expect(childrenArray[3].role).toBe('listitem');
        expect(childrenArray[4].role).toBe('listitem');
    });

    it('should hide items when hidden is true.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        const hiddenItems = list.items.filter((item) => item.hidden === true);
        expect(hiddenItems.length).toBe(1);

        const hiddenTags = list.children.filter((item) => item.element.style.display === 'none');
        expect(hiddenTags.length).toBe(1);
    });

    it('should not pan when panning is not allowed.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListNoPanningComponent);
        const list: IgxListComponent = fixture.componentInstance.list;
        let elementRefCollection;

        fixture.detectChanges();

        const item = list.items[0] as IgxListItemComponent;

        vi.spyOn(list.leftPan, 'emit');
        vi.spyOn(list.rightPan, 'emit');
        vi.spyOn(list.panStateChange, 'emit');

        elementRefCollection = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItem(elementRefCollection[1], 0.8);

        expect(item.panState).toBe(IgxListPanState.NONE);

        elementRefCollection = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItem(elementRefCollection[1], -0.8);

        expect(item.panState).toBe(IgxListPanState.NONE);
        expect(list.leftPan.emit).toHaveBeenCalledTimes(0);
        expect(list.rightPan.emit).toHaveBeenCalledTimes(0);
        expect(list.panStateChange.emit).toHaveBeenCalledTimes(0);
    });

    it('checking the panLeftTemplate is visible when left-panning a list item.', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Click and drag item left */
        clickAndDrag(itemNativeElements[1], -0.3);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('visible');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
    });

    it('checking the panRightTemplate is visible when right-panning a list item.', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Click and drag item right */
        clickAndDrag(itemNativeElements[1], 0.3);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('visible');
    });

    it('should emit resetPan when releasing a list item before end threshold is triggered', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        vi.spyOn(list.startPan, 'emit');
        vi.spyOn(list.endPan, 'emit');
        vi.spyOn(list.resetPan, 'emit');

        /* Pan item left */
        panItem(itemNativeElements[1], -0.3);

        expect(list.startPan.emit).toHaveBeenCalledTimes(1);
        expect(list.endPan.emit).toHaveBeenCalledTimes(1);
        expect(list.resetPan.emit).toHaveBeenCalledTimes(1);
    });

    it('checking the panLeftTemplate is not visible when releasing a list item.', async () => {
        useFakeClock();
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item left */
        panItem(itemNativeElements[1], -0.3);
        await advance(fixture, PAN_TEMPLATES_HIDE_DELAY);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
    });

    it('checking the panRightTemplate is not visible when releasing a list item.', async () => {
        useFakeClock();
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item right */
        panItem(itemNativeElements[1], 0.3);
        await advance(fixture, PAN_TEMPLATES_HIDE_DELAY);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
    });

    it('cancel left panning', async () => {
        useFakeClock();
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        vi.spyOn(list.startPan, 'emit');
        vi.spyOn(list.endPan, 'emit');

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item left */
        cancelItemPanning(itemNativeElements[1], -2, -8);
        await advance(fixture, PAN_TEMPLATES_HIDE_DELAY);

        expect(firstItem.panState).toBe(IgxListPanState.NONE);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(list.startPan.emit).toHaveBeenCalledTimes(1);
        expect(list.endPan.emit).toHaveBeenCalledTimes(1);
    });

    it('cancel right panning', async () => {
        useFakeClock();
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        vi.spyOn(list.startPan, 'emit');
        vi.spyOn(list.endPan, 'emit');

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item right */
        cancelItemPanning(itemNativeElements[1], 2, 8);
        await advance(fixture, PAN_TEMPLATES_HIDE_DELAY);

        expect(firstItem.panState).toBe(IgxListPanState.NONE);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(list.startPan.emit).toHaveBeenCalledTimes(1);
        expect(list.endPan.emit).toHaveBeenCalledTimes(1);
    });

    it('checking the header list item does not have panning and content containers.', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const headers = list.headers;
        for (const header of headers) {
            expect(header.leftPanningTemplateElement).toBeUndefined();
            expect(header.rightPanningTemplateElement).toBeUndefined();
            expect(header.contentElement).toBe(null);
        }
    });

    it('checking the list item is returning back in the list when canceling the pan left event', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        list.leftPan.subscribe((args) => {
            args.keepItem = true;
        });

        const firstItem = list.items[0] as IgxListItemComponent;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItem(itemNativeElements[1], -0.6);
        expect(firstItem.panState).toBe(IgxListPanState.NONE);

        unsubscribeEvents(list);
    });

    it('checking the list item is returning back in the list when canceling the pan right event', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        list.rightPan.subscribe((args) => {
            args.keepItem = true;
        });

        const firstItem = list.items[0] as IgxListItemComponent;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItem(itemNativeElements[1], 0.6);
        expect(firstItem.panState).toBe(IgxListPanState.NONE);

        unsubscribeEvents(list);
    });

    it('should allow setting the index of list items', async () => {
        const fixture = TestBed.createComponent(ListWithIgxForAndScrollingComponent);
        fixture.detectChanges();
        await nextFrame();

        fixture.componentInstance.igxFor.scrollTo(8);
        await nextFrame();
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const len = items.length;
        expect(items[0].nativeElement.textContent).toContain('4');
        expect(fixture.componentInstance.forOfList.items[0].index).toEqual(3);
        expect(items[len - 1].nativeElement.textContent).toContain('10');
        expect(fixture.componentInstance.forOfList.items[len - 1].index).toEqual(9);
    });

    it('should return items as they appear in the list with virtualization', async () => {
        const fixture = TestBed.createComponent(ListWithIgxForAndScrollingComponent);
        fixture.detectChanges();
        await nextFrame();

        fixture.componentInstance.igxFor.scrollTo(6);
        await nextFrame();
        fixture.detectChanges();

        const dItems = GridFunctions.sortDebugElementsVertically(fixture.debugElement.queryAll(By.css('igx-list-item')));
        const pItems = fixture.componentInstance.forOfList.items;
        const len = dItems.length;
        for (let i = 0; i < len; i++) {
            expect(dItems[i].nativeElement).toEqual(pItems[i].element);
        }
    });

    it('should properly set and get the selected property of list items', () => {
        const fixture = TestBed.createComponent(ListWithSelectedItemComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        // Get all list items
        const items = list.children.toArray();
        const headerItem = items[0];
        const firstItem = items[1];
        const secondItem = items[2];

        // Verify initial selected state
        expect(headerItem.selected).toBe(false); // Headers should never be selected even if selected=true
        expect(firstItem.selected).toBe(true);
        expect(secondItem.selected).toBe(false);

        // Check if the selected class is applied correctly
        expect(headerItem.element.classList.contains('igx-list__item-base--selected')).toBe(false);
        expect(firstItem.element.classList.contains('igx-list__item-base--selected')).toBe(true);
        expect(secondItem.element.classList.contains('igx-list__item-base--selected')).toBe(false);

        // Change selected state programmatically
        secondItem.selected = true;
        fixture.detectChanges();
        expect(secondItem.selected).toBe(true);
        expect(secondItem.element.classList.contains('igx-list__item-base--selected')).toBe(true);

        // Try to select a header item (should not apply)
        headerItem.selected = true;
        fixture.detectChanges();
        expect(headerItem.selected).toBe(false);
        expect(headerItem.element.classList.contains('igx-list__item-base--selected')).toBe(false);
    });

    describe('Listbox', () => {
        let fixture: ComponentFixture<ListboxComponent>;
        let list: IgxListComponent;

        const pressKey = (target: HTMLElement, key: string, repeat = false): KeyboardEvent => {
            const event = new KeyboardEvent('keydown', { key, repeat, bubbles: true, cancelable: true, composed: true });
            target.dispatchEvent(event);
            return event;
        };

        beforeEach(() => {
            fixture = TestBed.createComponent(ListboxComponent);
            list = fixture.componentInstance.list;
            fixture.detectChanges();
        });

        it('should have no navigation by default', () => {
            const basic = TestBed.createComponent(ListWithSelectedItemComponent);
            basic.detectChanges();
            const basicList = basic.componentInstance.list;

            expect(basicList.navigation).toBe('none');
            expect(basicList.element.nativeElement.getAttribute('role')).toBe('list');
            expect(basicList.items[0].element.getAttribute('role')).toBe('listitem');
        });

        it('should leave a list with role listbox and no listbox navigation unchanged', () => {
            const ownFixture = TestBed.createComponent(ListWithOwnAttributesComponent);
            ownFixture.detectChanges();
            const ownList = ownFixture.componentInstance.list;
            const [header, item] = ownList.children.toArray();

            expect(ownList.element.nativeElement.getAttribute('tabindex')).toBe('0');
            expect(header.element.getAttribute('aria-hidden')).toBe('true');
            expect(item.element.getAttribute('tabindex')).toBe('-1');
            expect(item.element.getAttribute('aria-selected')).toBe('true');
            expect(item.element.classList).not.toContain('igx-list-item--focusable');

            ownList.isLoading = true;
            ownFixture.detectChanges();
            expect(ownList.element.nativeElement.hasAttribute('aria-busy')).toBe(false);

            const clickSpy = vi.fn();
            ownList.itemClicked.subscribe(clickSpy);
            expect(pressKey(item.element, 'ArrowDown').defaultPrevented).toBe(false);
            expect(pressKey(item.element, ' ').defaultPrevented).toBe(false);
            expect(clickSpy).not.toHaveBeenCalled();
        });

        it('should keep the attributes bound by the app when the list is not a listbox', () => {
            const boundFixture = TestBed.createComponent(ListWithBoundAttributesComponent);
            boundFixture.detectChanges();
            const boundList = boundFixture.componentInstance.list;
            const [header, item] = boundList.children.toArray();

            expect(boundList.element.nativeElement.getAttribute('tabindex')).toBe('0');
            expect(header.element.getAttribute('aria-hidden')).toBe('true');
            expect(item.element.getAttribute('tabindex')).toBe('0');
            expect(item.element.getAttribute('aria-selected')).toBe('true');
            expect(item.element.getAttribute('aria-describedby')).toBe('Note');

            boundFixture.componentInstance.tabIndex = '-1';
            boundFixture.componentInstance.selected = 'false';
            boundFixture.detectChanges();
            expect(boundList.element.nativeElement.getAttribute('tabindex')).toBe('-1');
            expect(item.element.getAttribute('tabindex')).toBe('-1');
            expect(item.element.getAttribute('aria-selected')).toBe('false');
        });

        it('should leave a list that is not a listbox unchanged, even when its items bind selected', () => {
            const plainFixture = TestBed.createComponent(ListboxComponent);
            plainFixture.componentInstance.listbox = false;
            plainFixture.detectChanges();
            const plainList = plainFixture.componentInstance.list;
            const listElement = plainList.element.nativeElement as HTMLElement;

            expect(listElement.getAttribute('role')).toBe('list');
            expect(listElement.hasAttribute('tabindex')).toBe(false);
            plainList.headers.forEach(header => {
                expect(header.element.getAttribute('role')).toBe('separator');
                expect(header.element.hasAttribute('aria-hidden')).toBe(false);
            });
            plainList.items.forEach(item => {
                expect(item.element.getAttribute('role')).toBe('listitem');
                expect(item.element.hasAttribute('tabindex')).toBe(false);
                expect(item.element.hasAttribute('aria-selected')).toBe(false);
                expect(item.element.hasAttribute('aria-describedby')).toBe(false);
            });
            expect(pressKey(plainList.items[0].element, 'ArrowDown').defaultPrevented).toBe(false);
        });

        it('should be a listbox that only owns options and hidden headers, and exposes their selected state', () => {
            const listElement = list.element.nativeElement as HTMLElement;
            const [header, ...items] = list.children.toArray();
            const owned = Array.from(listElement.children).filter(child => child.getAttribute('aria-hidden') !== 'true');

            expect(listElement.getAttribute('role')).toBe('listbox');
            expect(listElement.hasAttribute('tabindex')).toBe(false);
            expect(owned.map(child => child.getAttribute('role'))).toEqual(['option', 'option', 'option']);
            expect(header.element.hasAttribute('tabindex')).toBe(false);
            expect(header.element.classList).not.toContain('igx-list-item--focusable');
            expect(items.every(i => i.element.classList.contains('igx-list-item--focusable'))).toBe(true);
            expect(items.map(i => i.element.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);

            fixture.componentInstance.selectedId = 3;
            fixture.detectChanges();
            expect(items.map(i => i.element.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);
        });

        it('should keep a single tab stop on the option focused last, else the selected one, else the first one', () => {
            const items = list.items;
            const tabIndexes = () => list.items.map(i => i.element.getAttribute('tabindex'));
            expect(tabIndexes()).toEqual(['-1', '0', '-1']);

            fixture.componentInstance.selectedId = null;
            fixture.detectChanges();
            expect(tabIndexes()).toEqual(['0', '-1', '-1']);

            items[0].element.focus();
            pressKey(items[0].element, 'End');
            fixture.detectChanges();
            expect(document.activeElement).toBe(items[2].element);
            expect(tabIndexes()).toEqual(['-1', '-1', '0']);

            items[2].hidden = true;
            fixture.detectChanges();
            expect(tabIndexes()).toEqual(['0', '-1', '-1']);

            fixture.componentInstance.items = fixture.componentInstance.items.slice(1);
            fixture.detectChanges();
            expect(tabIndexes()).toEqual(['0', '-1']);
        });

        it('should reset the list and its items when its navigation is no longer listbox', () => {
            const header = list.children.first.element;
            expect(header.id).toMatch(/^igx-list-header-\d+$/);

            fixture.componentInstance.listbox = false;
            fixture.detectChanges();

            const listElement = list.element.nativeElement as HTMLElement;
            expect(listElement.getAttribute('role')).toBe('list');
            expect(header.hasAttribute('aria-hidden')).toBe(false);
            expect(header.hasAttribute('id')).toBe(false);
            list.items.forEach(item => {
                expect(item.element.getAttribute('role')).toBe('listitem');
                expect(item.element.hasAttribute('tabindex')).toBe(false);
                expect(item.element.hasAttribute('aria-selected')).toBe(false);
                expect(item.element.classList).not.toContain('igx-list-item--focusable');
            });
        });

        it('should keep the roles set by the app on a list without listbox navigation', () => {
            fixture.componentInstance.listbox = false;
            list.role = 'menu';
            list.items[0].role = 'menuitem';
            fixture.detectChanges();

            const listElement = list.element.nativeElement as HTMLElement;
            expect(listElement.getAttribute('role')).toBe('menu');
            expect(listElement.hasAttribute('tabindex')).toBe(false);
            expect(list.items[0].element.getAttribute('role')).toBe('menuitem');
            expect(list.items[1].element.getAttribute('role')).toBe('listitem');
            list.items.forEach(item => expect(item.element.hasAttribute('aria-selected')).toBe(false));
            expect(pressKey(list.items[1].element, 'ArrowDown').defaultPrevented).toBe(false);

            list.role = null;
            fixture.detectChanges();
            expect(listElement.hasAttribute('role')).toBe(false);
        });

        it('should follow the displayed order when the items are moved', () => {
            fixture.componentInstance.selectedId = null;
            fixture.detectChanges();
            expect(list.items[0].element.getAttribute('tabindex')).toBe('0');

            // Moving the views registers no item, so the list detects the new order after rendering.
            fixture.componentInstance.items = [...fixture.componentInstance.items].reverse();
            fixture.detectChanges();

            const elements = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('igx-list-item:not(.igx-list__header)'));
            expect(elements.map(element => element.textContent!.trim())).toEqual(['Item 3', 'Item 2', 'Item 1']);
            expect(elements.map(element => element.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
        });

        it('should describe every option with the header of its group, unless it has its own aria-describedby', () => {
            const groupedFixture = TestBed.createComponent(GroupedListboxComponent);
            groupedFixture.detectChanges();
            const groupedList = groupedFixture.componentInstance.list;
            const [employees, contractors] = groupedList.headers;
            const [ungrouped, item1, item2, item3, item4] = groupedList.items;

            expect(employees.element.id).toBeTruthy();
            expect(contractors.element.id).toBeTruthy();
            expect(ungrouped.element.hasAttribute('aria-describedby')).toBe(false);
            expect(item1.element.getAttribute('aria-describedby')).toBe(employees.element.id);
            expect(item2.element.getAttribute('aria-describedby')).toBe('item-2-note');
            expect(item3.element.getAttribute('aria-describedby')).toBe('item-3-note');
            expect(item4.element.getAttribute('aria-describedby')).toBe(contractors.element.id);

            groupedFixture.componentInstance.note = 'item-3-other-note';
            groupedFixture.detectChanges();
            expect(item3.element.getAttribute('aria-describedby')).toBe('item-3-other-note');

            // An app that binds its own aria-describedby owns it: the list does not watch for it to be removed.
        });

        it('should be the tab stop with its empty or loading message as an option while it has no options', () => {
            const emptyFixture = TestBed.createComponent(EmptyListboxComponent);
            emptyFixture.detectChanges();
            const emptyList = emptyFixture.componentInstance.list;
            const listElement = emptyList.element.nativeElement as HTMLElement;
            const message = () => listElement.querySelector('.igx-list__message-wrapper') as HTMLElement;
            const owned = () => Array.from(listElement.children).filter(child => child.getAttribute('aria-hidden') !== 'true');

            expect(listElement.getAttribute('tabindex')).toBe('0');
            expect(listElement.classList).toContain('igx-list--focusable');
            expect(owned()).toEqual([message()]);
            expect(message().getAttribute('role')).toBe('option');
            expect(message().textContent.trim()).toBe(emptyList.resourceStrings.igx_list_no_items);

            emptyFixture.componentInstance.isLoading = true;
            emptyFixture.detectChanges();
            expect(listElement.getAttribute('aria-busy')).toBe('true');
            expect(owned()).toEqual([message()]);
            expect(message().getAttribute('role')).toBe('option');
            expect(message().textContent.trim()).toBe('Loading data...');

            listElement.focus();
            emptyFixture.componentInstance.items = ['Item 1', 'Item 2'];
            emptyFixture.detectChanges();
            expect(listElement.hasAttribute('tabindex')).toBe(false);
            expect(listElement.classList).not.toContain('igx-list--focusable');
            expect(message().hasAttribute('role')).toBe(false);
            expect(message().getAttribute('aria-hidden')).toBe('true');
            expect(owned().map(child => child.getAttribute('role'))).toEqual(['option', 'option']);
            expect(document.activeElement).toBe(emptyList.items[0].element);

            emptyFixture.componentInstance.isLoading = false;
            emptyFixture.detectChanges();
            expect(listElement.hasAttribute('aria-busy')).toBe(false);
            expect(message()).toBeNull();

            emptyFixture.componentInstance.items = [];
            emptyFixture.componentInstance.listbox = false;
            emptyFixture.detectChanges();
            expect(listElement.hasAttribute('tabindex')).toBe(false);
            expect(listElement.classList).not.toContain('igx-list--focusable');
            expect(message().hasAttribute('role')).toBe(false);
            expect(message().hasAttribute('aria-hidden')).toBe(false);
        });

        describe('Keyboard navigation', () => {
            it('should move the focus with ArrowDown and ArrowUp without wrapping around', () => {
                const items = list.items;
                items[0].element.focus();

                const event = pressKey(items[0].element, 'ArrowDown');
                expect(document.activeElement).toBe(items[1].element);
                expect(event.defaultPrevented).toBe(true);

                pressKey(items[1].element, 'ArrowDown');
                pressKey(items[2].element, 'ArrowDown');
                expect(document.activeElement).toBe(items[2].element);

                pressKey(items[2].element, 'ArrowUp');
                expect(document.activeElement).toBe(items[1].element);

                pressKey(items[1].element, 'ArrowUp');
                pressKey(items[0].element, 'ArrowUp');
                expect(document.activeElement).toBe(items[0].element);
            });

            it('should keep moving the focus while an arrow key is held', () => {
                const items = list.items;
                items[0].element.focus();

                pressKey(items[0].element, 'ArrowDown');
                pressKey(items[1].element, 'ArrowDown', true);

                expect(document.activeElement).toBe(items[2].element);
            });

            it('should leave a key that the app already handled on the item', () => {
                const items = list.items;
                items[0].element.addEventListener('keydown', (event: KeyboardEvent) => event.preventDefault());
                items[0].element.focus();

                pressKey(items[0].element, 'ArrowDown');

                expect(document.activeElement).toBe(items[0].element);
            });

            it('should move the focus to the first and last item with Home and End', () => {
                const items = list.items;
                items[1].element.focus();

                pressKey(items[1].element, 'End');
                expect(document.activeElement).toBe(items[2].element);

                pressKey(items[2].element, 'Home');
                expect(document.activeElement).toBe(items[0].element);
            });

            it('should follow the displayed order of virtualized items', async () => {
                const forFixture = TestBed.createComponent(ListWithIgxForAndScrollingComponent);
                forFixture.componentInstance.listbox = true;
                forFixture.detectChanges();
                await nextFrame();
                // Scrolling down and back up reuses the views, so the children are no longer in the displayed order.
                for (const index of [8, 0]) {
                    forFixture.componentInstance.igxFor.scrollTo(index);
                    await nextFrame();
                    forFixture.detectChanges();
                }

                const items = forFixture.componentInstance.forOfList.items;
                items[0].element.focus();
                pressKey(items[0].element, 'ArrowDown');
                expect(document.activeElement).toBe(items[1].element);
                expect(items[1].index).toBe(1);
            });

            it('should include the items declared in the template of another component', () => {
                const wrappedFixture = TestBed.createComponent(ListboxWithWrappedItemsComponent);
                wrappedFixture.detectChanges();
                const elements = Array.from<HTMLElement>(wrappedFixture.nativeElement.querySelectorAll('igx-list-item'));

                expect(elements.map(element => element.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);

                elements[0].focus();
                pressKey(elements[0], 'ArrowDown');
                expect(document.activeElement).toBe(elements[1]);
                pressKey(elements[1], 'ArrowDown');
                expect(document.activeElement).toBe(elements[2]);
                pressKey(elements[2], 'End');
                expect(document.activeElement).toBe(elements[3]);
            });

            it('should keep the items of a listbox nested in an item to the listbox', () => {
                const nestedFixture = TestBed.createComponent(NestedListboxComponent);
                nestedFixture.detectChanges();
                const host: HTMLElement = nestedFixture.nativeElement;
                const outer = Array.from<HTMLElement>(host.querySelectorAll('igx-list:not(.inner) > igx-list-item'));
                const inner = Array.from<HTMLElement>(host.querySelectorAll('.inner > igx-list-item'));

                // The static outer list takes nothing from the listbox in its item.
                expect(outer.map(element => element.getAttribute('role'))).toEqual(['listitem', 'listitem', 'listitem']);
                expect(outer.some(element => element.hasAttribute('tabindex'))).toBe(false);
                expect(inner.map(element => element.getAttribute('role'))).toEqual(['option', 'option']);

                inner[0].focus();
                pressKey(inner[0], 'ArrowDown');
                expect(document.activeElement).toBe(inner[1]);
                pressKey(inner[1], 'End');
                expect(document.activeElement).toBe(inner[1]);
                // The nested list keeps its own tab stop, on its option focused last.
                expect(inner.map(element => element.getAttribute('tabindex'))).toEqual(['-1', '0']);
            });

            describe('Type-ahead', () => {
                const type = (text: string) => {
                    for (const key of text) {
                        pressKey(document.activeElement as HTMLElement, key);
                    }
                };

                it('should move to the next option that starts with the typed letters, Space included', () => {
                    const items = list.items;
                    const clicked = vi.fn();
                    list.itemClicked.subscribe(clicked);
                    items[0].element.focus();

                    const event = pressKey(items[0].element, 'i');
                    expect(event.defaultPrevented).toBe(true);
                    expect(document.activeElement).toBe(items[1].element);

                    type('tem 3');
                    expect(document.activeElement).toBe(items[2].element);
                    expect(clicked).not.toHaveBeenCalled();
                });

                it('should match the text of an option without a title', () => {
                    const groupedFixture = TestBed.createComponent(GroupedListboxComponent);
                    groupedFixture.detectChanges();
                    const [ungrouped, item1] = groupedFixture.componentInstance.list.items;
                    item1.element.focus();

                    type('u');

                    expect(document.activeElement).toBe(ungrouped.element);
                });

                it('should only search from an option of a listbox', () => {
                    const items = list.items;
                    const listElement = list.element.nativeElement as HTMLElement;

                    expect(pressKey(listElement, 'i').defaultPrevented).toBe(false);

                    fixture.componentInstance.listbox = false;
                    fixture.detectChanges();
                    expect(pressKey(items[0].element, 'i').defaultPrevented).toBe(false);
                });
            });

            it('should skip hidden items', () => {
                const items = list.items;
                items[1].hidden = true;
                fixture.detectChanges();

                items[0].element.focus();
                pressKey(items[0].element, 'ArrowDown');
                expect(document.activeElement).toBe(items[2].element);
            });

            it('should activate the focused item with Enter and Space like a click', () => {
                const items = list.items;
                const clickedItems: IgxListItemComponent[] = [];
                list.itemClicked.subscribe((args: IListItemClickEventArgs) => clickedItems.push(args.item));
                items[1].element.focus();

                expect(pressKey(items[1].element, 'Enter').defaultPrevented).toBe(true);
                expect(pressKey(items[1].element, ' ').defaultPrevented).toBe(true);
                expect(pressKey(items[1].element, ' ', true).defaultPrevented).toBe(true);
                expect(clickedItems).toEqual([items[1], items[1]]);
            });

            it('should not handle keys pressed in the content of an item, also inside a shadow root, or on the list', () => {
                const clickSpy = vi.fn();
                list.itemClicked.subscribe(clickSpy);
                const listElement = list.element.nativeElement as HTMLElement;
                const option = list.items[0].element;
                const title = option.querySelector('[igxListLineTitle]') as HTMLElement;
                const shadowHost = document.createElement('div');
                option.appendChild(shadowHost);
                const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
                shadowRoot.innerHTML = '<input type="text" />';
                const input = shadowRoot.querySelector('input')!;

                expect(pressKey(title, 'ArrowDown').defaultPrevented).toBe(false);
                expect(pressKey(title, 'Enter').defaultPrevented).toBe(false);
                expect(pressKey(input, 'ArrowDown').defaultPrevented).toBe(false);
                expect(pressKey(input, 'Enter').defaultPrevented).toBe(false);
                expect(pressKey(input, ' ').defaultPrevented).toBe(false);
                expect(pressKey(listElement, ' ').defaultPrevented).toBe(false);
                expect(clickSpy).not.toHaveBeenCalled();

                expect(pressKey(option, 'ArrowDown').defaultPrevented).toBe(true);
            });
        });
    });

    describe('Grid', () => {
        let fixture: ComponentFixture<GridListComponent>;
        let list: IgxListComponent;

        const pressKey = (target: HTMLElement, key: string): KeyboardEvent => {
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, composed: true });
            target.dispatchEvent(event);
            return event;
        };
        const host = () => list.element.nativeElement as HTMLElement;
        const rows = () => list.items.map(item => item.element as HTMLElement);

        beforeEach(() => {
            fixture = TestBed.createComponent(GridListComponent);
            list = fixture.componentInstance.list;
            fixture.detectChanges();
        });

        it('should be a grid of rows with one cell each, and hidden headers that describe them', () => {
            const [header] = list.headers;

            expect(host().getAttribute('role')).toBe('grid');
            expect(rows().map(row => row.getAttribute('role'))).toEqual(['row', 'row', 'row']);
            for (const row of rows()) {
                const cells = row.querySelectorAll('[role="gridcell"]');
                expect(cells.length).toBe(1);
                expect(cells[0].querySelector('.igx-list__item-line-title')).toBeTruthy();
                expect(row.getAttribute('aria-describedby')).toBe(header.element.id);
            }
            expect(header.element.getAttribute('aria-hidden')).toBe('true');
            expect(rows().every(row => row.classList.contains('igx-list-item--focusable'))).toBe(true);
            expect(header.element.classList).not.toContain('igx-list-item--focusable');
        });

        it('should show the focus ring on the cell of the row that the keyboard focuses', async () => {
            const cell = (row: HTMLElement) => row.querySelector<HTMLElement>('[role="gridcell"]')!;
            rows()[0].focus();

            await userEvent.keyboard('{ArrowDown}');

            expect(document.activeElement).toBe(rows()[1]);
            expect(getComputedStyle(rows()[1]).outlineStyle).toBe('none');
            expect(getComputedStyle(cell(rows()[1])).outlineStyle).toBe('solid');
            expect(getComputedStyle(cell(rows()[0])).outlineStyle).toBe('none');
        });

        it('should mark only the selected rows when the grid is not multiselectable', () => {
            expect(rows().map(row => row.getAttribute('aria-selected'))).toEqual([null, 'true', null]);
        });

        it('should mark every row when the grid sets aria-multiselectable', () => {
            fixture.componentInstance.multiselectable.set('true');
            fixture.detectChanges();
            expect(rows().map(row => row.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);

            fixture.componentInstance.multiselectable.set('false');
            fixture.componentInstance.selectedId.set(3);
            fixture.detectChanges();
            expect(rows().map(row => row.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);
        });

        it('should keep one tab stop and move between the rows with the arrows, Home and End', () => {
            expect(rows().map(row => row.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

            rows()[1].focus();
            pressKey(rows()[1], 'ArrowDown');
            expect(document.activeElement).toBe(rows()[2]);
            pressKey(rows()[2], 'Home');
            expect(document.activeElement).toBe(rows()[0]);
            pressKey(rows()[0], 'End');
            expect(document.activeElement).toBe(rows()[2]);
        });

        it('should click a row with Enter and move to a row by typing', () => {
            const clicked = vi.fn();
            list.itemClicked.subscribe(clicked);
            rows()[0].focus();

            pressKey(rows()[0], 'Enter');
            expect(clicked).toHaveBeenCalledTimes(1);

            pressKey(rows()[0], 'r');
            expect(document.activeElement).toBe(rows()[1]);
        });

        it('should be the tab stop with its empty message as a row with one cell', () => {
            fixture.componentInstance.items.set([]);
            fixture.detectChanges();
            const message = host().querySelector('.igx-list__message-wrapper') as HTMLElement;

            expect(host().getAttribute('tabindex')).toBe('0');
            expect(message.getAttribute('role')).toBe('row');
            expect(message.querySelectorAll('[role="gridcell"]').length).toBe(1);
        });

        describe('Controls', () => {
            const controls = (row: HTMLElement) => Array.from(row.querySelectorAll<HTMLElement>('button, input'));

            it('should move from a row to its first and last control with Right and Left', () => {
                const row = rows()[0];
                row.focus();

                pressKey(row, 'ArrowRight');
                expect(document.activeElement).toBe(controls(row)[0]);

                row.focus();
                pressKey(row, 'ArrowLeft');
                expect(document.activeElement).toBe(controls(row).at(-1));
            });

            it('should move between the controls with Right and Left, and back to the row past the ends', () => {
                const row = rows()[0];
                const [edit, remove] = controls(row);
                edit.focus();

                pressKey(edit, 'ArrowRight');
                expect(document.activeElement).toBe(remove);
                pressKey(remove, 'ArrowRight');
                expect(document.activeElement).toBe(row);

                edit.focus();
                pressKey(edit, 'ArrowLeft');
                expect(document.activeElement).toBe(row);
            });

            it('should mirror Right and Left in right-to-left', () => {
                host().dir = 'rtl';
                const row = rows()[0];
                row.focus();

                pressKey(row, 'ArrowRight');

                expect(document.activeElement).toBe(controls(row).at(-1));
            });

            it('should move to the next and previous row with Down and Up from a control', () => {
                const [edit] = controls(rows()[1]);
                edit.focus();

                pressKey(edit, 'ArrowDown');
                expect(document.activeElement).toBe(rows()[2]);

                controls(rows()[1])[0].focus();
                pressKey(document.activeElement as HTMLElement, 'ArrowUp');
                expect(document.activeElement).toBe(rows()[0]);
            });

            it('should go back to the row with Escape and F2, unless the control handled the key', () => {
                const row = rows()[0];
                const [edit, remove] = controls(row);

                edit.focus();
                pressKey(edit, 'Escape');
                expect(document.activeElement).toBe(row);

                remove.focus();
                pressKey(remove, 'F2');
                expect(document.activeElement).toBe(row);

                edit.addEventListener('keydown', (event: KeyboardEvent) => event.preventDefault());
                edit.focus();
                pressKey(edit, 'Escape');
                expect(document.activeElement).toBe(edit);
            });

            it('should leave Escape on a row to the page', () => {
                rows()[0].focus();

                expect(pressKey(rows()[0], 'Escape').defaultPrevented).toBe(false);
            });

            it('should leave Enter, Space and letters on a control to the control', () => {
                const clicked = vi.fn();
                list.itemClicked.subscribe(clicked);
                const [edit] = controls(rows()[0]);
                edit.focus();

                expect(pressKey(edit, 'Enter').defaultPrevented).toBe(false);
                expect(pressKey(edit, ' ').defaultPrevented).toBe(false);
                expect(pressKey(edit, 'r').defaultPrevented).toBe(false);
                expect(clicked).not.toHaveBeenCalled();
                expect(document.activeElement).toBe(edit);
            });

            it('should leave the arrows, Home and End to a control that uses them, but not Escape', () => {
                const row = rows()[2];
                const note = row.querySelector<HTMLElement>('.note')!;
                note.focus();

                for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Home', 'End']) {
                    expect(pressKey(note, key).defaultPrevented, key).toBe(false);
                    expect(document.activeElement).toBe(note);
                }

                pressKey(note, 'Escape');
                expect(document.activeElement).toBe(row);
            });

            it('should make the row of a focused control the tab stop', () => {
                controls(rows()[2])[0].focus();
                fixture.detectChanges();

                expect(rows().map(row => row.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
            });

            it('should leave the list with Tab and Shift+Tab from a control, and enter on the tab stop', async () => {
                const before = fixture.nativeElement.querySelector('#before') as HTMLElement;
                const after = fixture.nativeElement.querySelector('#after') as HTMLElement;

                controls(rows()[0])[0].focus();
                await userEvent.keyboard('{Tab}');
                expect(document.activeElement).toBe(after);

                // Leaving through the last row keeps the tab stop on the row of the control.
                await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
                expect(document.activeElement).toBe(rows()[0]);

                controls(rows()[2])[1].focus();
                await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
                expect(document.activeElement).toBe(before);

                await userEvent.keyboard('{Tab}');
                expect(document.activeElement).toBe(rows()[2]);
            });

            it('should treat a listbox in a row as one control', () => {
                const nestedFixture = TestBed.createComponent(GridWithNestedListboxComponent);
                nestedFixture.detectChanges();
                const nestedHost: HTMLElement = nestedFixture.nativeElement;
                const row = nestedHost.querySelector<HTMLElement>('igx-list:not(.inner) > igx-list-item')!;
                const [kate, lee] = Array.from(nestedHost.querySelectorAll<HTMLElement>('.inner > igx-list-item'));
                const add = nestedHost.querySelector<HTMLElement>('.add')!;

                row.focus();
                pressKey(row, 'ArrowRight');
                expect(document.activeElement).toBe(kate);

                // The listbox keeps its arrows.
                pressKey(kate, 'ArrowDown');
                expect(document.activeElement).toBe(lee);
                expect(pressKey(lee, 'ArrowRight').defaultPrevented).toBe(false);

                pressKey(lee, 'Escape');
                expect(document.activeElement).toBe(row);

                pressKey(row, 'ArrowLeft');
                expect(document.activeElement).toBe(add);
                pressKey(add, 'ArrowLeft');
                expect(document.activeElement).toBe(lee);
            });
        });

        describe('Removal', () => {
            const remove = (...ids: number[]) => {
                fixture.componentInstance.items.update(items => items.filter(item => !ids.includes(item.id)));
                fixture.detectChanges();
            };

            it('should move the focus to the row that takes the place of the removed one', () => {
                const [, review, release] = rows();
                review.focus();

                remove(2);

                expect(document.activeElement).toBe(release);
                expect(release.getAttribute('tabindex')).toBe('0');
            });

            it('should move the focus to the new last row when the last one is removed', () => {
                const [, review, release] = rows();
                release.focus();

                remove(3);

                expect(document.activeElement).toBe(review);
            });

            it('should move the focus to the row, not a control, when a focused control is removed with its row', () => {
                const [, review, release] = rows();
                review.querySelector<HTMLElement>('.edit')!.focus();

                remove(2);

                expect(document.activeElement).toBe(release);
            });

            it('should move the focus to the list when its last row is removed', () => {
                rows()[0].focus();

                remove(1, 2, 3);

                expect(document.activeElement).toBe(host());
            });

            it('should not move the focus when the removed row was only the tab stop', () => {
                const before = fixture.nativeElement.querySelector('#before') as HTMLElement;
                rows()[1].focus();
                before.focus();

                remove(2);

                expect(document.activeElement).toBe(before);
                expect(rows().map(row => row.getAttribute('tabindex'))).toEqual(['0', '-1']);
            });

            it('should not move the focus in a list without navigation', () => {
                fixture.componentInstance.navigation.set('none');
                fixture.detectChanges();
                const edit = rows()[1].querySelector<HTMLElement>('.edit')!;
                edit.focus();

                remove(2);

                expect(document.activeElement).toBe(document.body);
            });
        });

        it('should reset the list and its rows when the navigation is none', () => {
            fixture.componentInstance.navigation.set('none');
            fixture.detectChanges();

            expect(host().getAttribute('role')).toBe('list');
            for (const row of rows()) {
                expect(row.getAttribute('role')).toBe('listitem');
                expect(row.hasAttribute('tabindex')).toBe(false);
                expect(row.hasAttribute('aria-selected')).toBe(false);
                expect(row.querySelector('[role="gridcell"]')).toBeNull();
            }
        });
    });

    it('Initializes igxListThumbnail directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const thumbnail = fixture.debugElement.query(By.directive(IgxListThumbnailDirective));

        expect(thumbnail).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(thumbnail.nativeElement.classList.contains('igx-icon')).toBe(true);
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(thumbnail.parent.nativeElement.classList.contains('igx-list__item-thumbnail')).toBe(true);
    });

    it('Initializes igxListLine directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(listLine.nativeElement.classList.contains('text-line')).toBe(true);
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement.classList.contains('igx-list__item-lines')).toBe(true);
    });

    it('Initializes igxListAction directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListActionDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(listLine.nativeElement.classList.contains('action-icon')).toBe(true);
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement.classList.contains('igx-list__item-actions')).toBe(true);
    });

    it('Initializes igxListLineTitle directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineTitleDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the custom classes from the target element
        expect(listLine.nativeElement.classList.contains('custom')).toBe(true);
        // Check if the directive add the correct class on the target element
        expect(listLine.nativeElement.classList.contains('igx-list__item-line-title')).toBe(true);
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement.classList.contains('igx-list__item-lines')).toBe(true);
    });

    it('Initializes igxListLineSubTitle directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineSubTitleDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the custom classes from the target element
        expect(listLine.nativeElement.classList.contains('custom')).toBe(true);
        // Check if the directive add the correct class on the target element
        expect(listLine.nativeElement.classList.contains('igx-list__item-line-subtitle')).toBe(true);
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement.classList.contains('igx-list__item-lines')).toBe(true);
    });

    it('should return full resource strings when partial resourceStrings are set', () => {
        const fix = TestBed.createComponent(EmptyListComponent);
        fix.detectChanges();
        const list = fix.componentInstance.list;

        list.resourceStrings = { igx_list_no_items: 'No results found' };
        fix.detectChanges();

        expect(list.resourceStrings.igx_list_no_items).toBe('No results found');
        expect(list.resourceStrings.igx_list_loading).toBe('Loading data from the server...');
    });

    it('should update non-overridden resource strings when global i18n changes', () => {
        const fix = TestBed.createComponent(EmptyListComponent);
        fix.detectChanges();
        const list = fix.componentInstance.list;

        list.resourceStrings = { igx_list_no_items: 'Custom No Items' };
        fix.detectChanges();

        try {
            changei18n({ igx_list_loading: 'Fetching data...' });
            fix.detectChanges();

            expect(list.resourceStrings.igx_list_no_items).toBe('Custom No Items');
            expect(list.resourceStrings.igx_list_loading).toBe('Fetching data...');
        } finally {
            changei18n(ListResourceStringsEN);
        }
    });

    /* factorX - the coefficient used to calculate deltaX.
    Pan left by providing negative factorX;
    Pan right - positive factorX.  */
    const dispatchPointer = (nativeElement, type, clientX, clientY = 0) => {
        const event = new PointerEvent(type, {
            pointerType: 'touch',
            pointerId: 1,
            clientX,
            clientY,
            bubbles: true,
            cancelable: true
        });
        nativeElement.dispatchEvent(event);
    };

    const panItem = (elementRefObject, factorX) => {
        const nativeElement = elementRefObject.nativeElement;
        const itemWidth = nativeElement.offsetWidth;

        dispatchPointer(nativeElement, 'pointerdown', 0);
        dispatchPointer(nativeElement, 'pointermove', factorX * itemWidth);
        dispatchPointer(nativeElement, 'pointerup', factorX * itemWidth);
        return new Promise<void>(resolve => {
            resolve();
        });
    };

    const panItemWithClick = (elementRefObject, factorX) => {
        panItem(elementRefObject, factorX);
        elementRefObject.triggerEventHandler('click', null);
    };

    const clickAndDrag = (itemNativeElement, factorX) => {
        const nativeElement = itemNativeElement.nativeElement;
        const itemWidth = nativeElement.offsetWidth;

        dispatchPointer(nativeElement, 'pointerdown', 0);
        dispatchPointer(nativeElement, 'pointermove', factorX * itemWidth);
    };

    const cancelItemPanning = (itemNativeElement, factorX, factorY) => {
        const nativeElement = itemNativeElement.nativeElement;

        dispatchPointer(nativeElement, 'pointerdown', 0, 0);
        dispatchPointer(nativeElement, 'pointermove', factorX, factorY);
        dispatchPointer(nativeElement, 'pointercancel', factorX, factorY);
    };

    const verifyItemsCount = (list, expectedCount) => {
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(expectedCount);
    };

    const verifyHeadersCount = (list, expectedCount) => {
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(expectedCount);
    };

    const unsubscribeEvents = list => {
        list.leftPan.unsubscribe();
        list.panStateChange.unsubscribe();
        list.rightPan.unsubscribe();
        list.itemClicked.unsubscribe();
        list.startPan.unsubscribe();
        list.resetPan.unsubscribe();
        list.endPan.unsubscribe();
    };
});
