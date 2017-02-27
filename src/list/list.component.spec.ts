import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HammerGesturesManager } from '../core/touch';
import { IgxList, IgxListItem, IgxListModule, IgxListPanState } from './list.component';
import { Component, ViewChild, ContentChildren, QueryList } from '@angular/core';
import { Observable } from 'rxjs/Rx';

declare var Simulator: any;

describe("List", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [IgxListModule],
            declarations: [ListTestComponent, ListWithPanningAllowed,
                ListWithLeftPanningAllowed, ListWithRightPanningAllowed,
                ListWithNoItems, ListWithCustomNoItemsTemplate]
        }).compileComponents();
    }));

    it('should initialize igx-list with item and header', () => {
        let fixture = TestBed.createComponent(ListTestComponent),
            list = fixture.componentInstance.list;

        expect(list).toBeDefined();
        expect(list instanceof IgxList).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(0);
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(0);

        fixture.detectChanges();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(3);
        expect(list.items[0] instanceof IgxListItem).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(1);
        expect(list.headers[0] instanceof IgxListItem).toBeTruthy();
    });

     it('should set/get properly layout properties: width, left, maxLeft', () => {
         let fixture = TestBed.createComponent(ListTestComponent),
             list = fixture.componentInstance.list, item,
             testWidth = 400, testLeft = -100;
             
         fixture.detectChanges();

         fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + "px";

         fixture.detectChanges();
         expect(list.items.length).toBe(3);
         item = list.items[0];
         expect(item instanceof IgxListItem).toBeTruthy();
         expect(item.width).toBe(testWidth);
         expect(item.left).toBe(0);
         expect(item.maxLeft).toBe(-testWidth);
         item.left = testLeft;
         expect(item.left).toBe(testLeft);
     });

    it('should calculate properly item index', () => {
        let fixture = TestBed.createComponent(ListTestComponent),
            list = fixture.componentInstance.list;
        fixture.detectChanges();

        expect(list.children instanceof QueryList).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();

        expect(list.children.length).toBe(4);
        expect(list.items.length).toBe(3);
        expect(list.headers.length).toBe(1);

        for (let i = 0; i < list.children.length; i++) {
            var item: IgxListItem = list.children.find((child => ( child.index === i)));
            expect(item.index).toBe(i);
        }
    });

    it('Should pan right and pan left.', (done) => {
        var fixture, list: IgxList, item: IgxListItem, 
            itemNativeElement, itemHeight, itemWidth;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListWithPanningAllowed);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(function() {

            item = list.items[0] as IgxListItem;
            itemNativeElement = item.element.nativeElement;
            itemHeight = item.element.nativeElement.offsetHeight;
            itemWidth = item.element.nativeElement.offsetWidth;

            spyOn(list.onLeftPan, "emit");
            spyOn(list.onRightPan, "emit");
            spyOn(list.onPanStateChange, "emit");

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(function() {
            expect(item.panState).toBe(IgxListPanState.RIGHT);
            
            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);            
        }).then(function() {
            expect(item.panState).toBe(IgxListPanState.NONE);
            
            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(function() {
            expect(item.panState).toBe(IgxListPanState.LEFT);

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(function() {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.onLeftPan.emit).toHaveBeenCalledTimes(1);
            expect(list.onRightPan.emit).toHaveBeenCalledTimes(1);
            expect(list.onPanStateChange.emit).toHaveBeenCalledTimes(4);

            done();
        });
    }, 5000);

    it('Should pan right only.', (done) => {
        var fixture, list: IgxList, item: IgxListItem, 
            itemNativeElement, itemHeight, itemWidth;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListWithRightPanningAllowed);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(function() {
            item = list.items[0] as IgxListItem;
            itemNativeElement = item.element.nativeElement;
            itemHeight = item.element.nativeElement.offsetHeight;
            itemWidth = item.element.nativeElement.offsetWidth;

            spyOn(list.onRightPan, "emit");
            spyOn(list.onPanStateChange, "emit");

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(function() {
            expect(item.panState).toBe(IgxListPanState.RIGHT);

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then (function() {
            expect(item.panState).toBe(IgxListPanState.NONE);

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then (function() {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.onRightPan.emit).toHaveBeenCalledTimes(1);
            expect(list.onPanStateChange.emit).toHaveBeenCalledTimes(2);

            done();
        });
    }, 5000);

    it('Should pan left only.', (done) => {
        var fixture, list: IgxList, item: IgxListItem, 
            itemNativeElement, itemHeight, itemWidth;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListWithLeftPanningAllowed);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(function() {            
            item = list.items[0] as IgxListItem;
            itemNativeElement = item.element.nativeElement;
            itemHeight = item.element.nativeElement.offsetHeight;
            itemWidth = item.element.nativeElement.offsetWidth;

            spyOn(list.onLeftPan, "emit");
            spyOn(list.onPanStateChange, "emit");

            return panLeft(itemNativeElement, itemHeight, itemWidth, 200);
        }).then(function() {
            expect(item.panState).toBe(IgxListPanState.LEFT);

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then (function() {
            expect(item.panState).toBe(IgxListPanState.NONE);

            return panRight(itemNativeElement, itemHeight, itemWidth, 200);
        }).then (function() {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.onLeftPan.emit).toHaveBeenCalledTimes(1);
            expect(list.onPanStateChange.emit).toHaveBeenCalledTimes(2);

            done();
        });
    }, 5000);

    it("Should have default no items template.", () => {
        let fixture = TestBed.createComponent(ListWithNoItems),
            list = fixture.componentInstance.list,
            listNoItemsImgSrc = "https://example.com/noitems.png",
            listNoItemsMessage = "Custom no items message.",
            listNoItemsButtonText = "Custom Button Text";

        fixture.detectChanges();

        expect(list.hasNoItemsTemplate).toBeFalsy();
        expect(list.emptyListImage).toBe(listNoItemsImgSrc);
        expect(list.emptyListMessage).toBe(listNoItemsMessage);
        expect(list.emptyListButtonText).toBe(listNoItemsButtonText);

        let noItemsImgDebugEl = fixture.debugElement.query(By.css(".image"));
        expect(noItemsImgDebugEl.nativeElement.getAttributeNode("src").value).toBe(listNoItemsImgSrc);

        let noItemsTextDebugEl = fixture.debugElement.query(By.css(".message > p"));
        expect(noItemsTextDebugEl.nativeElement.textContent.trim()).toBe(listNoItemsMessage);

        let noItemsButtonDebugEl = fixture.debugElement.query(By.css("button"));
        expect(noItemsButtonDebugEl.nativeElement.textContent.trim()).toEqual(listNoItemsButtonText);

        spyOn(list.emptyListButtonClick, "emit");
        noItemsButtonDebugEl.nativeElement.click();
        expect(list.emptyListButtonClick.emit).toHaveBeenCalled();
    })

    it("Should have custom no items template.", () => {
        let fixture = TestBed.createComponent(ListWithCustomNoItemsTemplate),
            list = fixture.componentInstance.list,
            listCustomNoItemsTemplateContent = "Custom no items message.";

        fixture.detectChanges();
        expect(list.hasNoItemsTemplate).toBeTruthy();
        let noItemsTemplateDebugEl = fixture.debugElement.query(By.css(".igx-list__empty--custom"));
        expect(noItemsTemplateDebugEl.nativeElement.textContent.trim()).toEqual(listCustomNoItemsTemplateContent);
    })

    function panRight(item, itemHeight, itemWidth, duration) {
        var panOptions = { 
            pos: [0, itemHeight * 0.5], 
            duration: duration, 
            deltaX: itemWidth * 0.6,
            deltaY: 0
        };

        return new Promise(function(resolve, reject) {
             Simulator.gestures.pan(item, panOptions, function() {
                resolve();
            });
        });
    }

    function panLeft(item, itemHeight, itemWidth, duration) {
        var panOptions = {
            pos: [itemWidth, itemHeight * 0.5],
            duration: duration,
            deltaX: -(itemWidth * 0.6),
            deltaY: 0
        };

        return new Promise(function(resolve, reject) {
             Simulator.gestures.pan(item, panOptions, function() {
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
     @ViewChild(IgxList) list: IgxList;
     @ViewChild("wrapper") wrapper;
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
class ListWithPanningAllowed { 
    @ViewChild(IgxList) list: IgxList;
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
class ListWithRightPanningAllowed {
    @ViewChild(IgxList) list: IgxList;
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
class ListWithLeftPanningAllowed {
    @ViewChild(IgxList) list: IgxList;
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
class ListWithNoItems {
    @ViewChild(IgxList) list: IgxList;
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
class ListWithCustomNoItemsTemplate {
    @ViewChild(IgxList) list: IgxList;
}