import { QueryList } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxListItemComponent } from './list-item.component';
import { IgxListPanState } from './list.common';
import { IgxListComponent, IgxListModule } from './list.component';
import {
    ListWithHeaderComponent, ListWithPanningComponent,
    EmptyListComponent, CustomEmptyListComponent,
    ListLoadingComponent, ListWithPanningTemplatesComponent,
    ListCustomLoadingComponent,
    TwoHeadersListComponent, TwoHeadersListNoPanningComponent } from '../test-utils/list-components.spec';
import { configureTestSuite } from '../test-utils/configure-suite';

declare var Simulator: any;

describe('List', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CustomEmptyListComponent,
                EmptyListComponent,
                ListCustomLoadingComponent,
                ListLoadingComponent,
                ListWithHeaderComponent,
                ListWithPanningComponent,
                TwoHeadersListComponent,
                TwoHeadersListNoPanningComponent,
                ListWithPanningTemplatesComponent
            ],
            imports: [IgxListModule]
        }).compileComponents();
    }));

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
        let item;

        fixture.detectChanges();

        fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + 'px';

        fixture.detectChanges();
        expect(list.items.length).toBe(3);
        item = list.items[0];
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
        let fixture;
        let list: IgxListComponent;
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        fixture = TestBed.createComponent(ListWithPanningComponent);
        list = fixture.componentInstance.list;

        fixture.detectChanges();

        list.onLeftPan.subscribe(() => {
            timesCalledLeftPan++;
        });

        list.onPanStateChange.subscribe(() => {
            timesCalledStateChanged++;
        });

        list.onRightPan.subscribe(() => {
            timesCalledRightPan++;
        });

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.RIGHT);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.LEFT);

        expect(timesCalledLeftPan).toBe(1);
        expect(timesCalledStateChanged).toBe(2);
        expect(timesCalledRightPan).toBe(1);

        list.onLeftPan.unsubscribe();
        list.onPanStateChange.unsubscribe();
        list.onRightPan.unsubscribe();

        unsubscribeEvents(list);
    });

    it('should pan right only.', () => {
        let fixture;
        let list: IgxListComponent;
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        fixture = TestBed.createComponent(ListWithPanningComponent);
        fixture.componentInstance.allowLeftPanning = false;

        fixture.detectChanges();

        list = fixture.componentInstance.list;

        list.onLeftPan.subscribe(() => {
            timesCalledLeftPan++;
        });

        list.onPanStateChange.subscribe(() => {
            timesCalledStateChanged++;
        });

        list.onRightPan.subscribe(() => {
            timesCalledRightPan++;
        });

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.RIGHT);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.NONE);

        expect(timesCalledLeftPan).toBe(0);
        expect(timesCalledStateChanged).toBe(1);
        expect(timesCalledRightPan).toBe(1);

        unsubscribeEvents(list);
    });

    it('should pan left only.', () => {
        let fixture;
        let list: IgxListComponent;
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        fixture = TestBed.createComponent(ListWithPanningComponent);
        fixture.componentInstance.allowRightPanning = false;
        fixture.detectChanges();

        list = fixture.componentInstance.list;

        list.onLeftPan.subscribe(() => {
            timesCalledLeftPan++;
        });

        list.onPanStateChange.subscribe(() => {
            timesCalledStateChanged++;
        });

        list.onRightPan.subscribe(() => {
            timesCalledRightPan++;
        });

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item left */
        panItem(itemNativeElements[0], -0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.LEFT);

        /* Pan item right */
        panItem(itemNativeElements[1], 0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.NONE);

        expect(timesCalledLeftPan).toBe(1);
        expect(timesCalledStateChanged).toBe(1);
        expect(timesCalledRightPan).toBe(0);

        unsubscribeEvents(list);
    });

    it('Should have default no items template.', () => {
        const fixture = TestBed.createComponent(EmptyListComponent);
        const list = fixture.componentInstance.list;
        const listNoItemsMessage = 'There are no items in the list.';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsParagraphEl = fixture.debugElement.query(By.css('p'));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listNoItemsMessage);
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

        const noItemsParagraphEl = fixture.debugElement.query(By.css('p'));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);
    });

    it('Should show loading template when isLoading=\'true\' even when there are children.', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        list.isLoading = true;
        const listLoadingItemsMessage = 'Loading data from the server...';

        fixture.detectChanges();

        verifyItemsCount(list, 3);

        const noItemsParagraphEl = fixture.debugElement.query(By.css('p'));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);

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

    it('should fire ItemClicked on click.', (done) => {
        let fixture;
        let list: IgxListComponent;
        let listItem: IgxListItemComponent;
        let timesCalled = 0;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListWithHeaderComponent);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {

            list.onItemClicked.subscribe((value) => {
                timesCalled++;
                listItem = value.item;
            });

            return clickItem(list.items[0]);
        }).then(() => {
            expect(timesCalled).toBe(1);
            expect(listItem.index).toBe(1);
            expect(listItem.element.textContent.trim()).toBe('Item 1');

            // Click the same item again and verify click is fired again
            return clickItem(list.items[0]);
        }).then(() => {
            expect(timesCalled).toBe(2);
            expect(listItem.index).toBe(1);

            // Click the header and verify click is fired
            return clickItem(list.headers[0]);
        }).then(() => {
            expect(timesCalled).toBe(3);
            expect(listItem.index).toBe(0);
            expect(listItem.element.textContent.trim()).toBe('Header');
            unsubscribeEvents(list);
            done();
        });
    }, 5000);

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

    it('should not pan when panning is not allowed.', (done) => {
        let fixture;
        let list: IgxListComponent;
        let item: IgxListItemComponent;
        let itemNativeElement;
        let elementRefCollection;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(TwoHeadersListNoPanningComponent);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {

            item = list.items[0] as IgxListItemComponent;
            itemNativeElement = item.element;

            spyOn(list.onLeftPan, 'emit');
            spyOn(list.onRightPan, 'emit');
            spyOn(list.onPanStateChange, 'emit');

            elementRefCollection = fixture.debugElement.queryAll(By.css('igx-list-item'));
            return panItem(elementRefCollection[1], 0.8);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.NONE);

            elementRefCollection = fixture.debugElement.queryAll(By.css('igx-list-item'));
            return panItem(elementRefCollection[1], -0.8);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.onLeftPan.emit).toHaveBeenCalledTimes(0);
            expect(list.onRightPan.emit).toHaveBeenCalledTimes(0);
            expect(list.onPanStateChange.emit).toHaveBeenCalledTimes(0);
            done();
        });
    }, 5000);

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

    it('checking the header list item does not have panning and content containers.', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const headers = list.headers;
        let header;
        for (let i = 0; i < headers.length; i++) {
            header = headers[i] as IgxListItemComponent;
            expect(header.leftPanningTemplateElement).toBeUndefined();
            expect(header.rightPanningTemplateElement).toBeUndefined();
            expect(header.contentElement).toBe(null);
        }
    });

    it('checking the list item is returning back in the list when canceling the pan left event', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        list.onLeftPan.subscribe((args) => {
            args.keepItem = true;
        });

        const firstItem = list.items[0] as IgxListItemComponent;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItem(itemNativeElements[1], -0.6);
        expect(firstItem.panState).toBe(IgxListPanState.NONE);
    });

    it('checking the list item is returning back in the list when canceling the pan right event', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        list.onRightPan.subscribe((args) => {
            args.keepItem = true;
        });

        const firstItem = list.items[0] as IgxListItemComponent;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItem(itemNativeElements[1], 0.6);
        expect(firstItem.panState).toBe(IgxListPanState.NONE);
    });

    function panRight(item, itemHeight, itemWidth, duration) {
        const panOptions = {
            deltaX: itemWidth * 0.6,
            deltaY: 0,
            duration,
            pos: [0, itemHeight * 0.5]
        };

        return new Promise((resolve, reject) => {
            Simulator.gestures.pan(item, panOptions, () => {
                resolve();
            });
        });
    }

    function panLeft(item, itemHeight, itemWidth, duration) {
        const panOptions = {
            deltaX: -(itemWidth * 0.6),
            deltaY: 0,
            duration,
            pos: [itemWidth, itemHeight * 0.5]
        };

        return new Promise((resolve, reject) => {
            Simulator.gestures.pan(item, panOptions, () => {
                resolve();
            });
        });
    }

    /* factorX - the coefficient used to calculate deltaX.
    Pan left by providing negative factorX;
    Pan right - positive factorX.  */
    function panItem(elementRefObject, factorX) {
        const itemWidth = elementRefObject.nativeElement.offsetWidth;

        elementRefObject.triggerEventHandler('panstart', {
            deltaX : factorX < 0 ? -10 : 10
        });
        elementRefObject.triggerEventHandler('panmove', {
            deltaX : factorX * itemWidth, duration : 200
        });
        elementRefObject.triggerEventHandler('panend', null);
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    function clickAndDrag(itemNativeElement, factorX) {
        const itemWidth = itemNativeElement.nativeElement.offsetWidth;

        itemNativeElement.triggerEventHandler('panstart', {
            deltaX : factorX < 0 ? -10 : 10
        });
        itemNativeElement.triggerEventHandler('panmove', {
            deltaX : factorX * itemWidth, duration : 200
        });
    }

    function clickItem(currentItem: IgxListItemComponent) {
        return Promise.resolve(currentItem.element.click());
    }

    function verifyItemsCount(list, expectedCount) {
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(expectedCount);
    }

    function verifyHeadersCount(list, expectedCount) {
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(expectedCount);
    }

    function unsubscribeEvents(list) {
        list.onLeftPan.unsubscribe();
        list.onPanStateChange.unsubscribe();
        list.onRightPan.unsubscribe();
        list.onItemClicked.unsubscribe();
    }
});
