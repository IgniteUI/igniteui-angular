import { Component, ContentChildren, QueryList, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxListItemComponent } from "./list-item.component";
import { IgxListPanState } from "./list.common";
import { IgxListComponent, IgxListModule } from "./list.component";

declare var Simulator: any;

describe("List", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ListTestComponent, ListWithPanningAllowedComponent,
                ListWithLeftPanningAllowedComponent, ListWithRightPanningAllowedComponent,
                ListWithNoItemsComponent, ListWithCustomNoItemsTemplateComponent, TwoHeadersListComponent],
            imports: [IgxListModule]
        }).compileComponents();
    }));

    it("should initialize igx-list with item and header", () => {
        const fixture = TestBed.createComponent(ListTestComponent);
        const list = fixture.componentInstance.list;

        expect(list).toBeDefined();
        expect(list instanceof IgxListComponent).toBeTruthy();
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(0);
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(0);

        fixture.detectChanges();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.cssClass).toBeTruthy();
        expect(list.isListEmpty).toBeFalsy();
        expect(list.items.length).toBe(3);
        expect(list.items[0] instanceof IgxListItemComponent).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(1);
        expect(list.headers[0] instanceof IgxListItemComponent).toBeTruthy();
    });

    it("should set/get properly layout properties: width, left, maxLeft, maxRight", () => {
        const fixture = TestBed.createComponent(ListTestComponent);
        const list = fixture.componentInstance.list;
        const testWidth = 400;
        const testLeft = 0;
        let item;

        fixture.detectChanges();

        fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + "px";

        fixture.detectChanges();
        expect(list.items.length).toBe(3);
        item = list.items[0];
        expect(item instanceof IgxListItemComponent).toBeTruthy();
        expect(item.width).toBe(testWidth);
        expect(item.maxLeft).toBe(-testWidth);
        expect(item.maxRight).toBe(testWidth);
        expect(item.left).toBe(testLeft);
     });

    it("should calculate properly item index", () => {
        const fixture = TestBed.createComponent(ListTestComponent);
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

    it("should pan right and pan left.", () => {
        let fixture;
        let list: IgxListComponent;
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        fixture = TestBed.createComponent(ListWithPanningAllowedComponent);
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

        const itemNativeElements = fixture.debugElement.queryAll(By.css("igx-list-item"));
        const listItems = list.items;

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);

        fixture.detectChanges();

        expect(listItems[0].panState).toBe(IgxListPanState.RIGHT);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);

        fixture.detectChanges();

        expect(listItems[1].panState).toBe(IgxListPanState.LEFT);
        expect(timesCalledLeftPan).toBe(1);
        expect(timesCalledStateChanged).toBe(2);
        expect(timesCalledRightPan).toBe(1);
    });

    it("should pan right only.", () => {
        let fixture;
        let list: IgxListComponent;
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        fixture = TestBed.createComponent(ListWithRightPanningAllowedComponent);
        list = fixture.componentInstance.list;

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

        const itemNativeElements = fixture.debugElement.queryAll(By.css("igx-list-item"));
        const listItems = list.items;

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);

        fixture.detectChanges();

        expect(listItems[0].panState).toBe(IgxListPanState.RIGHT);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);

        fixture.detectChanges();

        expect(listItems[1].panState).toBe(IgxListPanState.NONE);
        expect(timesCalledLeftPan).toBe(0);
        expect(timesCalledStateChanged).toBe(1);
        expect(timesCalledRightPan).toBe(1);
    });

    it("should pan left only.", () => {
        let fixture;
        let list: IgxListComponent;
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        fixture = TestBed.createComponent(ListWithLeftPanningAllowedComponent);
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

        const itemNativeElements = fixture.debugElement.queryAll(By.css("igx-list-item"));
        const listItems = list.items;

        /* Pan item left */
        panItem(itemNativeElements[0], -0.6);

        fixture.detectChanges();

        expect(listItems[0].panState).toBe(IgxListPanState.LEFT);

        /* Pan item right */
        panItem(itemNativeElements[1], 0.6);

        fixture.detectChanges();

        expect(listItems[1].panState).toBe(IgxListPanState.NONE);
        expect(timesCalledLeftPan).toBe(1);
        expect(timesCalledStateChanged).toBe(1);
        expect(timesCalledRightPan).toBe(0);
    });

    it("Should have default no items template.", () => {
        const fixture = TestBed.createComponent(ListWithNoItemsComponent);
        const list = fixture.componentInstance.list;
        const listNoItemsMessage = "There are no items in the list.";

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsParagraphEl = fixture.debugElement.query(By.css("p"));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listNoItemsMessage);
    });

    it("Should have custom no items template.", () => {
        const fixture = TestBed.createComponent(ListWithCustomNoItemsTemplateComponent);
        const list = fixture.componentInstance.list;
        const listCustomNoItemsTemplateContent = "Custom no items message.";

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsParagraphEl = fixture.debugElement.query(By.css("h3"));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listCustomNoItemsTemplateContent);
    });

    it("should fire ItemClicked on click.", (done) => {
        let fixture;
        let list: IgxListComponent;
        let listItem: IgxListItemComponent;
        let timesCalled = 0;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListTestComponent);
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
            expect(listItem.element.textContent.trim()).toBe("Item 1");

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
            expect(listItem.element.textContent.trim()).toBe("Header");
            done();
        });
    }, 5000);

    it("should display multiple headers properly.", () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        verifyItemsCount(list, 3);
        verifyHeadersCount(list, 2);

        const headerClasses = fixture.debugElement.queryAll(By.css(".igx-list__header"));
        expect(headerClasses.length).toBe(2);
    });

    it("should set items' isHeader property properly.", () => {
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

    it("should set items' role property properly.", () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        const childrenArray = list.children.toArray();
        expect(childrenArray[0].role).toBe("separator");
        expect(childrenArray[1].role).toBe("listitem");
        expect(childrenArray[2].role).toBe("separator");
        expect(childrenArray[3].role).toBe("listitem");
        expect(childrenArray[4].role).toBe("listitem");
    });

    it("should hide items when hidden is true.", () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        const hiddenItems = list.items.filter((item) => item.hidden === true);
        expect(hiddenItems.length).toBe(1);

        const hiddenTags = list.children.filter((item) => item.element.style.display === "none");
        expect(hiddenTags.length).toBe(1);
    });

    it("should not pan when panning is not allowed.", (done) => {
        let fixture;
        let list: IgxListComponent;
        let item: IgxListItemComponent;
        let itemNativeElement;
        let itemHeight;
        let itemWidth;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(TwoHeadersListComponent);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {

            item = list.items[0] as IgxListItemComponent;
            itemNativeElement = item.element;
            itemHeight = itemNativeElement.offsetHeight;
            itemWidth = itemNativeElement.offsetWidth;

            spyOn(list.onLeftPan, "emit");
            spyOn(list.onRightPan, "emit");
            spyOn(list.onPanStateChange, "emit");

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.NONE);

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.onLeftPan.emit).toHaveBeenCalledTimes(0);
            expect(list.onRightPan.emit).toHaveBeenCalledTimes(0);
            expect(list.onPanStateChange.emit).toHaveBeenCalledTimes(0);
            done();
        });
    }, 5000);

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
    function panItem(itemNativeElement, factorX) {
        const itemWidth = itemNativeElement.nativeElement.offsetWidth;

        itemNativeElement.triggerEventHandler("panstart", null);
        itemNativeElement.triggerEventHandler("panmove", {
            deltaX : factorX * itemWidth, duration : 200
        });
        itemNativeElement.triggerEventHandler("panend", null);
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
});

@Component({
    template: `<div #wrapper>
                    <igx-list>
                        <igx-list-item [isHeader]="true">Header</igx-list-item>
                        <igx-list-item>Item 1</igx-list-item>
                        <igx-list-item>Item 2</igx-list-item>
                        <igx-list-item>Item 3</igx-list-item>
                    </igx-list>
                </div>`
})
class ListTestComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
    @ViewChild("wrapper") public wrapper;
}

@Component({
    template: `<div #wrapper>
                    <igx-list [allowRightPanning]="true" [allowLeftPanning]="true">
                        <igx-list-item>Item 1</igx-list-item>
                        <igx-list-item>Item 2</igx-list-item>
                        <igx-list-item>Item 3</igx-list-item>
                    </igx-list>
                </div>`
})
class ListWithPanningAllowedComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    template: `<div #wrapper>
                <igx-list [allowLeftPanning]="false" [allowRightPanning]="true">
                    <igx-list-item>Item 1</igx-list-item>
                    <igx-list-item>Item 2</igx-list-item>
                    <igx-list-item>Item 3</igx-list-item>
                </igx-list>
            </div>`
})
class ListWithRightPanningAllowedComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    template: `<div #wrapper>
                <igx-list [allowLeftPanning]="true" [allowRightPanning]="false">
                    <igx-list-item>Item 1</igx-list-item>
                    <igx-list-item>Item 2</igx-list-item>
                    <igx-list-item>Item 3</igx-list-item>
                </igx-list>
            </div>`
})
class ListWithLeftPanningAllowedComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    /* template: `<div #wrapper>
                <igx-list [hasNoItemsTemplate]="false">
                <!--emptyListMessage="Custom no items message."
                    emptyListImage="https://example.com/noitems.png"
                    emptyListButtonText="Custom Button Text">-->
                </igx-list>
            </div>` */
    template: `<div #wrapper>
            <igx-list>
            </igx-list>
        </div>`
})
class ListWithNoItemsComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    /*template: `<div #wrapper>
                <igx-list [hasNoItemsTemplate]="true">
                    <div class="igx-list__empty--custom">
                        Custom no items message.
                    </div>
                </igx-list>
            </div>`*/
    template: `<div #wrapper>
                <igx-list >
                    <ng-template igxEmptyList>
                        <h3>Custom no items message.</h3>
                    </ng-template>
                </igx-list>
            </div>`
})
class ListWithCustomNoItemsTemplateComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    template: `<div #wrapper>
                    <igx-list [allowRightPanning]="false" [allowLeftPanning]="false">
                        <igx-list-item [isHeader]="true">Header 1</igx-list-item>
                        <igx-list-item [isHeader]="false" [hidden]="false">Item 1</igx-list-item>
                        <igx-list-item [isHeader]="true">Header 2</igx-list-item>
                        <igx-list-item [hidden]="true">Item 2</igx-list-item>
                        <igx-list-item>Item 3</igx-list-item>
                    </igx-list>
                </div>`
})
class TwoHeadersListComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
    @ViewChild("wrapper") public wrapper;
}
