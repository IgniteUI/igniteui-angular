import { Component, ContentChildren, QueryList, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxListComponent, IgxListItemComponent, IgxListModule, IgxListPanState } from "./list.component";

declare var Simulator: any;

describe("List", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ListTestComponent, ListWithPanningAllowedComponent,
                ListWithLeftPanningAllowedComponent, ListWithRightPanningAllowedComponent,
                ListWithNoItemsComponent, ListWithCustomNoItemsTemplateComponent],
            imports: [IgxListModule]
        }).compileComponents();
    }));

    it("should initialize igx-list with item and header", () => {
        const fixture = TestBed.createComponent(ListTestComponent);
        const list = fixture.componentInstance.list;

        expect(list).toBeDefined();
        expect(list instanceof IgxListComponent).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(0);
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(0);

        fixture.detectChanges();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(3);
        expect(list.items[0] instanceof IgxListItemComponent).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(1);
        expect(list.headers[0] instanceof IgxListItemComponent).toBeTruthy();
    });

    it("should set/get properly layout properties: width, left, maxLeft", () => {
         const fixture = TestBed.createComponent(ListTestComponent);
         const list = fixture.componentInstance.list;
         const testWidth = 400;
         const testLeft = -100;
         let item;

         fixture.detectChanges();

         fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + "px";

         fixture.detectChanges();
         expect(list.items.length).toBe(3);
         item = list.items[0];
         expect(item instanceof IgxListItemComponent).toBeTruthy();
         expect(item.width).toBe(testWidth);
         expect(item.left).toBe(0);
         expect(item.maxLeft).toBe(-testWidth);
         item.left = testLeft;
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

    it("Should pan right and pan left.", (done) => {
        let fixture;
        let list: IgxListComponent;
        let item: IgxListItemComponent;
        let itemNativeElement;
        let itemHeight;
        let itemWidth;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListWithPanningAllowedComponent);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {

            item = list.items[0] as IgxListItemComponent;
            itemNativeElement = item.element.nativeElement;
            itemHeight = item.element.nativeElement.offsetHeight;
            itemWidth = item.element.nativeElement.offsetWidth;

            spyOn(list.onLeftPan, "emit");
            spyOn(list.onRightPan, "emit");
            spyOn(list.onPanStateChange, "emit");

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.RIGHT);

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.NONE);

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.LEFT);

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.onLeftPan.emit).toHaveBeenCalledTimes(1);
            expect(list.onRightPan.emit).toHaveBeenCalledTimes(1);
            expect(list.onPanStateChange.emit).toHaveBeenCalledTimes(4);

            done();
        });
    }, 5000);

    it("Should pan right only.", (done) => {
        let fixture;
        let list: IgxListComponent;
        let item: IgxListItemComponent;
        let itemNativeElement;
        let itemHeight;
        let itemWidth;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListWithRightPanningAllowedComponent);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            item = list.items[0] as IgxListItemComponent;
            itemNativeElement = item.element.nativeElement;
            itemHeight = item.element.nativeElement.offsetHeight;
            itemWidth = item.element.nativeElement.offsetWidth;

            spyOn(list.onRightPan, "emit");
            spyOn(list.onPanStateChange, "emit");

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.RIGHT);

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then (() => {
            expect(item.panState).toBe(IgxListPanState.NONE);

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then (() => {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.onRightPan.emit).toHaveBeenCalledTimes(1);
            expect(list.onPanStateChange.emit).toHaveBeenCalledTimes(2);

            done();
        });
    }, 5000);

    it("Should pan left only.", (done) => {
        let fixture;
        let list: IgxListComponent;
        let item: IgxListItemComponent;
        let itemNativeElement;
        let itemHeight;
        let itemWidth;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListWithLeftPanningAllowedComponent);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            item = list.items[0] as IgxListItemComponent;
            itemNativeElement = item.element.nativeElement;
            itemHeight = item.element.nativeElement.offsetHeight;
            itemWidth = item.element.nativeElement.offsetWidth;

            spyOn(list.onLeftPan, "emit");
            spyOn(list.onPanStateChange, "emit");

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.LEFT);

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then (() => {
            expect(item.panState).toBe(IgxListPanState.NONE);

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then (() => {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.onLeftPan.emit).toHaveBeenCalledTimes(1);
            expect(list.onPanStateChange.emit).toHaveBeenCalledTimes(2);

            done();
        });
    }, 5000);

    it("Should have default no items template.", () => {
        const fixture = TestBed.createComponent(ListWithNoItemsComponent);
        const list = fixture.componentInstance.list;
        const listNoItemsImgSrc = "https://example.com/noitems.png";
        const listNoItemsMessage = "Custom no items message.";
        const listNoItemsButtonText = "Custom Button Text";

        fixture.detectChanges();

        expect(list.hasNoItemsTemplate).toBeFalsy();
        expect(list.emptyListImage).toBe(listNoItemsImgSrc);
        expect(list.emptyListMessage).toBe(listNoItemsMessage);
        expect(list.emptyListButtonText).toBe(listNoItemsButtonText);

        const noItemsImgDebugEl = fixture.debugElement.query(By.css(".image"));
        expect(noItemsImgDebugEl.nativeElement.getAttributeNode("src").value).toBe(listNoItemsImgSrc);

        const noItemsTextDebugEl = fixture.debugElement.query(By.css(".message > p"));
        expect(noItemsTextDebugEl.nativeElement.textContent.trim()).toBe(listNoItemsMessage);

        const noItemsButtonDebugEl = fixture.debugElement.query(By.css("button"));
        expect(noItemsButtonDebugEl.nativeElement.textContent.trim()).toEqual(listNoItemsButtonText);

        spyOn(list.emptyListButtonClick, "emit");
        noItemsButtonDebugEl.nativeElement.click();
        expect(list.emptyListButtonClick.emit).toHaveBeenCalled();
    });

    it("Should have custom no items template.", () => {
        const fixture = TestBed.createComponent(ListWithCustomNoItemsTemplateComponent);
        const list = fixture.componentInstance.list;
        const listCustomNoItemsTemplateContent = "Custom no items message.";

        fixture.detectChanges();
        expect(list.hasNoItemsTemplate).toBeTruthy();
        const noItemsTemplateDebugEl = fixture.debugElement.query(By.css(".igx-list__empty--custom"));
        expect(noItemsTemplateDebugEl.nativeElement.textContent.trim()).toEqual(listCustomNoItemsTemplateContent);
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
                        <igx-list-item [options]="{}">Item 1</igx-list-item>
                        <igx-list-item [options]="{}">Item 2</igx-list-item>
                        <igx-list-item [options]="{}">Item 3</igx-list-item>
                    </igx-list>
                </div>`
})
class ListWithPanningAllowedComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    template: `<div #wrapper>
                <igx-list [allowRightPanning]="true" [allowLeftPanning]="false">
                    <igx-list-item [options]="{}">Item 1</igx-list-item>
                    <igx-list-item [options]="{}">Item 2</igx-list-item>
                    <igx-list-item [options]="{}">Item 3</igx-list-item>
                </igx-list>
            </div>`
})
class ListWithRightPanningAllowedComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    template: `<div #wrapper>
                <igx-list [allowLeftPanning]="true" [allowRightPanning]="false">
                    <igx-list-item [options]="{}">Item 1</igx-list-item>
                    <igx-list-item [options]="{}">Item 2</igx-list-item>
                    <igx-list-item [options]="{}">Item 3</igx-list-item>
                </igx-list>
            </div>`
})
class ListWithLeftPanningAllowedComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    template: `<div #wrapper>
                <igx-list [hasNoItemsTemplate]="false"
                    emptyListMessage="Custom no items message."
                    emptyListImage="https://example.com/noitems.png"
                    emptyListButtonText="Custom Button Text">
                </igx-list>
            </div>`
})
class ListWithNoItemsComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}

@Component({
    template: `<div #wrapper>
                <igx-list [hasNoItemsTemplate]="true">
                    <div class="igx-list__empty--custom">
                        Custom no items message.
                    </div>
                </igx-list>
            </div>`
})
class ListWithCustomNoItemsTemplateComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
}
