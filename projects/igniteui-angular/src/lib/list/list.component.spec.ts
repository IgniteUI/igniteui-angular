import { QueryList } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxListItemComponent } from './list-item.component';
import { IgxListPanState } from './list.common';
import {
    IgxListActionDirective,
    IgxListComponent,
    IgxListLineDirective,
    IgxListLineSubTitleDirective,
    IgxListLineTitleDirective,
    IgxListThumbnailDirective,
    IListItemClickEventArgs
} from './list.component';

import {
    ListWithHeaderComponent,
    ListWithPanningComponent,
    EmptyListComponent,
    CustomEmptyListComponent,
    ListLoadingComponent,
    ListWithPanningTemplatesComponent,
    ListCustomLoadingComponent,
    ListWithIgxForAndScrollingComponent,
    TwoHeadersListComponent,
    TwoHeadersListNoPanningComponent,
    ListDirectivesComponent
} from '../test-utils/list-components.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { wait } from '../test-utils/ui-interactions.spec';
import { GridFunctions } from '../test-utils/grid-functions.spec';

describe('List', () => {
    configureTestSuite(() => {
        return TestBed.configureTestingModule({
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
                ListDirectivesComponent
            ]
        });
    });

    it('should initialize igx-list with item and header', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        const domList = fixture.debugElement.query(By.css('igx-list')).nativeElement;

        expect(list).toBeDefined();
        expect(list.id).toContain('igx-list-');
        expect(list instanceof IgxListComponent).toBeTruthy();
        expect(list.cssClass).toBeFalsy();
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

        spyOn(list.leftPan, 'emit').and.callThrough();
        spyOn(list.panStateChange, 'emit').and.callThrough();
        spyOn(list.rightPan, 'emit').and.callThrough();

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

        spyOn(list.startPan, 'emit').and.callThrough();
        spyOn(list.endPan, 'emit').and.callThrough();

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);

        expect(list.startPan.emit).toHaveBeenCalledTimes(2);
        expect(list.endPan.emit).toHaveBeenCalledTimes(2);
    });

    it('should pan right only.', () => {
        const fixture = TestBed.createComponent(ListWithPanningComponent);
        fixture.componentInstance.allowLeftPanning = false;

        fixture.detectChanges();

        const list: IgxListComponent = fixture.componentInstance.list;

        spyOn(list.leftPan, 'emit').and.callThrough();
        spyOn(list.panStateChange, 'emit').and.callThrough();
        spyOn(list.rightPan, 'emit').and.callThrough();

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

        spyOn(list.leftPan, 'emit').and.callThrough();
        spyOn(list.panStateChange, 'emit').and.callThrough();
        spyOn(list.rightPan, 'emit').and.callThrough();

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
        expect(list.cssClass).toBeFalsy();
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
        expect(list.cssClass).toBeFalsy();
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
        expect(list.cssClass).toBeFalsy();
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
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsParagraphEl = fixture.debugElement.query(By.css('h3'));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);
    });

    it('should fire ItemClicked on click.', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list: IgxListComponent = fixture.componentInstance.list;
        fixture.detectChanges();

        spyOn(list.itemClicked, 'emit').and.callThrough();

        const event = new Event('click');
        list.items[0].element.dispatchEvent(event);
        const args: IListItemClickEventArgs = {
            item: list.items[0],
            event: event,
            direction: IgxListPanState.NONE
        };
        expect(list.itemClicked.emit).toHaveBeenCalledOnceWith(args);

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

        spyOn(list.itemClicked, 'emit').and.callThrough();

        fixture.detectChanges();
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItemWithClick(itemNativeElements[1], -0.3); // operating over the second list item because the first one is a header

        const args: IListItemClickEventArgs = {
            item: list.items[0],
            event: null,
            direction: IgxListPanState.LEFT
        };
        expect(list.itemClicked.emit).toHaveBeenCalledOnceWith(args);
    });

    it('should emit ItemClicked with correct direction argument when swiping right', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;

        spyOn(list.itemClicked, 'emit').and.callThrough();

        fixture.detectChanges();
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItemWithClick(itemNativeElements[1], 0.3); // operating over the second list item because the first one is a header

        const args: IListItemClickEventArgs = {
            item: list.items[0],
            event: null,
            direction: IgxListPanState.RIGHT
        };
        expect(list.itemClicked.emit).toHaveBeenCalledOnceWith(args);
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

        spyOn(list.leftPan, 'emit').and.callThrough();
        spyOn(list.rightPan, 'emit').and.callThrough();
        spyOn(list.panStateChange, 'emit').and.callThrough();

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

        spyOn(list.startPan, 'emit').and.callThrough();
        spyOn(list.endPan, 'emit').and.callThrough();
        spyOn(list.resetPan, 'emit').and.callThrough();

        /* Pan item left */
        panItem(itemNativeElements[1], -0.3);

        expect(list.startPan.emit).toHaveBeenCalledTimes(1);
        expect(list.endPan.emit).toHaveBeenCalledTimes(1);
        expect(list.resetPan.emit).toHaveBeenCalledTimes(1);
    });

    it('checking the panLeftTemplate is not visible when releasing a list item.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item left */
        panItem(itemNativeElements[1], -0.3);
        tick(600);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
    }));

    it('checking the panRightTemplate is not visible when releasing a list item.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item right */
        panItem(itemNativeElements[1], 0.3);
        tick(600);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
    }));

    it('cancel left panning', fakeAsync(() => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        spyOn(list.startPan, 'emit').and.callThrough();
        spyOn(list.endPan, 'emit').and.callThrough();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item left */
        cancelItemPanning(itemNativeElements[1], -2, -8);
        tick(600);

        expect(firstItem.panState).toBe(IgxListPanState.NONE);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(list.startPan.emit).toHaveBeenCalledTimes(1);
        expect(list.endPan.emit).toHaveBeenCalledTimes(1);
    }));

    it('cancel right panning', fakeAsync(() => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        spyOn(list.startPan, 'emit').and.callThrough();
        spyOn(list.endPan, 'emit').and.callThrough();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item right */
        cancelItemPanning(itemNativeElements[1], 2, 8);
        tick(600);

        expect(firstItem.panState).toBe(IgxListPanState.NONE);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(list.startPan.emit).toHaveBeenCalledTimes(1);
        expect(list.endPan.emit).toHaveBeenCalledTimes(1);
    }));

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

    it('should allow setting the index of list items', (async () => {
        const fixture = TestBed.createComponent(ListWithIgxForAndScrollingComponent);
        fixture.detectChanges();
        await wait(50);

        fixture.componentInstance.igxFor.scrollTo(8);
        await wait(50);
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const len = items.length;
        expect(items[0].nativeElement.textContent).toContain('4');
        expect(fixture.componentInstance.forOfList.items[0].index).toEqual(3);
        expect(items[len - 1].nativeElement.textContent).toContain('10');
        expect(fixture.componentInstance.forOfList.items[len - 1].index).toEqual(9);
    }));

    it('should return items as they appear in the list with virtualization', (async () => {
        const fixture = TestBed.createComponent(ListWithIgxForAndScrollingComponent);
        fixture.detectChanges();
        await wait(50);

        fixture.componentInstance.igxFor.scrollTo(6);
        await wait(50);
        fixture.detectChanges();

        const dItems = GridFunctions.sortDebugElementsVertically(fixture.debugElement.queryAll(By.css('igx-list-item')));
        const pItems = fixture.componentInstance.forOfList.items;
        const len = dItems.length;
        for (let i = 0; i < len; i++) {
            expect(dItems[i].nativeElement).toEqual(pItems[i].element);
        }
    }));

    it('Initializes igxListThumbnail directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const thumbnail = fixture.debugElement.query(By.directive(IgxListThumbnailDirective));

        expect(thumbnail).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(thumbnail.nativeElement).toHaveClass('igx-icon');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(thumbnail.parent.nativeElement).toHaveClass('igx-list__item-thumbnail');
    });

    it('Initializes igxListLine directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(listLine.nativeElement).toHaveClass('text-line');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement).toHaveClass('igx-list__item-lines');
    });

    it('Initializes igxListAction directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListActionDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(listLine.nativeElement).toHaveClass('action-icon');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement).toHaveClass('igx-list__item-actions');
    });

    it('Initializes igxListLineTitle directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineTitleDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the custom classes from the target element
        expect(listLine.nativeElement).toHaveClass('custom');
        // Check if the directive add the correct class on the target element
        expect(listLine.nativeElement).toHaveClass('igx-list__item-line-title');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement).toHaveClass('igx-list__item-lines');
    });

    it('Initializes igxListLineSubTitle directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineSubTitleDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the custom classes from the target element
        expect(listLine.nativeElement).toHaveClass('custom');
        // Check if the directive add the correct class on the target element
        expect(listLine.nativeElement).toHaveClass('igx-list__item-line-subtitle');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement).toHaveClass('igx-list__item-lines');
    });

    /* factorX - the coefficient used to calculate deltaX.
    Pan left by providing negative factorX;
    Pan right - positive factorX.  */
    const panItem = (elementRefObject, factorX) => {
        const itemWidth = elementRefObject.nativeElement.offsetWidth;

        elementRefObject.triggerEventHandler('panstart', {
            deltaX: factorX < 0 ? -10 : 10
        });
        elementRefObject.triggerEventHandler('panmove', {
            deltaX: factorX * itemWidth, duration: 200
        });
        elementRefObject.triggerEventHandler('panend', null);
        return new Promise<void>(resolve => {
            resolve();
        });
    };

    const panItemWithClick = (elementRefObject, factorX) => {
        panItem(elementRefObject, factorX);
        elementRefObject.triggerEventHandler('click', null);
    };

    const clickAndDrag = (itemNativeElement, factorX) => {
        const itemWidth = itemNativeElement.nativeElement.offsetWidth;

        itemNativeElement.triggerEventHandler('panstart', {
            deltaX: factorX < 0 ? -10 : 10
        });
        itemNativeElement.triggerEventHandler('panmove', {
            deltaX: factorX * itemWidth, duration: 200
        });
    };

    const cancelItemPanning = (itemNativeElement, factorX, factorY) => {
        itemNativeElement.triggerEventHandler('panstart', {
            deltaX: factorX
        });
        itemNativeElement.triggerEventHandler('panmove', {
            deltaX: factorX,
            deltaY: factorY,
            additionalEvent: 'panup'
        });

        itemNativeElement.triggerEventHandler('pancancel', null);
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
