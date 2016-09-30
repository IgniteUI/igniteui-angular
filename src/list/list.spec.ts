import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HammerGesturesManager } from '../core/touch';
import { List, ListHeader, ListItem, ListModule } from './list';
import { Component, ViewChild, ContentChildren } from '@angular/core';

describe("List", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ListModule],
            declarations: [ListTestComponent]
        })
            .compileComponents();
    }));

    it('should initialize ig-list with item and header', () => {
        let fixture = TestBed.createComponent(ListTestComponent),
            list = fixture.componentInstance.viewChild;

        expect(list).toBeDefined();
        expect(list instanceof List).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(0);
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(0);

        fixture.detectChanges();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(3);
        expect(list.items[0] instanceof ListItem).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(1);
        expect(list.headers[0] instanceof ListHeader).toBeTruthy();
    });

    //it('should set/get properly layout properties: width, left, maxLeft', () => {
    //    let fixture = TestBed.createComponent(ListTestComponent),
    //        item, visibleAreaOnFullPan,
    //        testWidth = 400, testLeft = -100,
    //        list = fixture.componentInstance.viewChild;
    //    fixture.detectChanges();

    //    fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + "px";

    //    fixture.detectChanges();
    //    expect(list.items.length).toBe(3);
    //    item = list.items[0];
    //    visibleAreaOnFullPan = item._VISIBLE_AREA_ON_FULL_PAN;
    //    expect(item instanceof ListItem).toBeTruthy();
    //    expect(item.width).toBe(testWidth);
    //    expect(item.left).toBe(0);
    //    expect(item.maxLeft).toBe(visibleAreaOnFullPan - testWidth);
    //    item.left = testLeft;
    //    expect(item.left).toBe(testLeft);
    //})
});


//export function main() {
//    describe('Infragistics Angular2 List', function() {
//         it('should filter properly',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//              var template = '<ig-list><ig-list-item>Item 1</ig-list-item><ig-list-item>Item 2</ig-list-item><ig-list-item>Item 3</ig-list-item></ig-list>';
//                return tcb.overrideTemplate(ListTestComponent, template)
//                .createAsync(ListTestComponent)
//                .then((fixture) => {
//                    var items, visibleItems,
//                      list = fixture.componentInstance.viewChild;

//                    fixture.detectChanges();
//                    expect(list.items.length).toBe(3);
//                    items = list.items;

//                    for (let item of items) {
//                        expect(item instanceof Infragistics.ListItem).toBeTruthy();
//                    }

//                    visibleItems = items.filter((listItem) => { return !listItem.hidden; });
//                    expect(visibleItems.length).toBe(3);

//                    list.searchInputElement = document.createElement('input');
//                    list.searchInputElement.value = "1";

//                    fixture.detectChanges();
//                    list.filter();

//                    fixture.detectChanges();
//                    visibleItems = items.filter((listItem) => { return !listItem.hidden; });
//                    expect(visibleItems.length).toBe(1);
//                    expect(visibleItems[0] instanceof Infragistics.ListItem).toBeTruthy();
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//         it('should emit filter events',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//            var template = '<ig-list><ig-list-item>Item 1</ig-list-item><ig-list-item>Item 2</ig-list-item><ig-list-item>Item 3</ig-list-item></ig-list>';
//                return tcb.overrideTemplate(ListTestComponent, template)
//                .createAsync(ListTestComponent)
//                .then((fixture) => {
//                      var items, visibleItems,
//                          list = fixture.componentInstance.viewChild;

//                      spyOn(list.filtering, 'emit');
//                      spyOn(list.filtered, 'emit');

//                      fixture.detectChanges();
//                      items = list.items;
//                      visibleItems = items.filter((listItem) => { return !listItem.hidden; });
//                      expect(list.items.length).toBe(3);
//                      expect(visibleItems.length).toBe(3);

//                      list.searchInputElement = document.createElement('input');
//                      list.searchInputElement.value = "2";
//                      list.filter();

//                      fixture.detectChanges();
//                      visibleItems = items.filter((listItem) => { return !listItem.hidden; });
//                      expect(visibleItems.length).toBe(1);
//                      expect(list.filtering.emit).toHaveBeenCalledWith({ cancel: false });
//                      expect(list.filtered.emit).toHaveBeenCalledWith({ result: [visibleItems[0]] });
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//         /*it('should cancel emitted filter events',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//            var template = '<ig-list (filtering)="filteringHandler($event)"><ig-list-item>Item 1</ig-list-item><ig-list-item>Item 2</ig-list-item><ig-list-item>Item 3</ig-list-item></ig-list>';
//                return tcb.overrideTemplate(ListTestComponent, template)
//                .createAsync(ListTestComponent)
//                .then((fixture) => {
//                      var items, visibleItems,
//                          list = fixture.componentInstance.viewChild;

//                      spyOn(list.filtering, 'emit');
//                      spyOn(list.filtered, 'emit');

//                      fixture.detectChanges();
//                      items = list.items;
//                      visibleItems = items.filter((listItem) => { return !listItem.hidden; });
//                      expect(list.items.length).toBe(3);
//                      expect(visibleItems.length).toBe(3);

//                      list.searchInputElement = document.createElement('input');
//                      fixture.componentInstance.filteringHandler = (args: any) => { args.cancel = true; };
//                      list.searchInputElement.value = "3";
//                      fixture.detectChanges();
//                      list.filter();
//                      fixture.detectChanges();

//                      visibleItems = items.filter((listItem) => { return !listItem.hidden; });
//                      expect(visibleItems.length).toBe(3);
//                      expect(list.filtering.emit).toHaveBeenCalledWith({ cancel: false });
//                      expect(list.filtered.emit).not.toHaveBeenCalledWith({ result: [visibleItems[0]] });
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));*///         
//         // end of tests
//    });
//}

@Component({
    template: `<div #wrapper>
                    <ig-list>
                        <ig-list-header>Header</ig-list-header>
                        <ig-list-item>Item 1</ig-list-item>
                        <ig-list-item>Item 2</ig-list-item>
                        <ig-list-item>Item 3</ig-list-item>
                    </ig-list>
                </div>`
})
class ListTestComponent {
     @ViewChild(List) viewChild: List;
     @ViewChild("wrapper") wrapper;

     public filteringHandler: Function;
}

@Component({
    template: '<div></div>'
})
class ListHeaderTestComponent {
     @ViewChild(ListHeader) public viewChild: ListHeader;
}

@Component({
    template: '<div></div>'
})
class ListItemTestComponent {
     @ViewChild(ListItem) public viewChild: ListItem;
}

//class TestComponentPin extends TestComponentDI {
     //pin: boolean = true;
     //enableGestures: string = "";
//}