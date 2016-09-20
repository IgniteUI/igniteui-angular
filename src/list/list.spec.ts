//// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
///// <reference path="../../typings/globals/jasmine/index.d.ts" />
///// <reference path="../../typings/globals/es6-shim/index.d.ts" />

//import { TestComponentBuilder, ComponentFixture, inject, async, tick } from '@angular/core/testing';
//import { Component, ViewChild, ContentChildren } from '@angular/core';
//import * as Infragistics from '../../src/main';

//// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
//declare var Simulator: any;

//export function main() {
//    describe('Infragistics Angular2 List', function() {
//         it('should initialize ig-list with item and header',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//              var template = '<ig-list><ig-list-header></ig-list-header><ig-list-item></ig-list-item></ig-list>';
//                return tcb.overrideTemplate(ListTestComponent, template)
//                .createAsync(ListTestComponent)
//                .then((fixture) => {
//                    var list = fixture.componentInstance.viewChild;

//                    expect(list).toBeDefined();
//                    expect(list instanceof Infragistics.List).toBeTruthy();
//                    expect(list.items instanceof Array).toBeTruthy();
//                    expect(list.items.length).toBe(0);
//                    expect(list.headers instanceof Array).toBeTruthy();
//                    expect(list.headers.length).toBe(0);

//                    fixture.detectChanges();
//                    expect(list.items instanceof Array).toBeTruthy();
//                    expect(list.items.length).toBe(1);
//                    expect(list.items[0] instanceof Infragistics.ListItem).toBeTruthy();
//                    expect(list.headers instanceof Array).toBeTruthy();
//                    expect(list.headers.length).toBe(1);
//                    expect(list.headers[0] instanceof Infragistics.ListHeader).toBeTruthy();
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//         it('should initialize ig-list with search input attached',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//              var template = '<input id="searchInput"/><ig-list searchInputId="searchInput"></ig-list>';
//                return tcb.overrideTemplate(ListTestComponent, template)
//                .createAsync(ListTestComponent)
//                .then((fixture) => {
//                    var inputElement,
//                        list = fixture.componentInstance.viewChild;

//                    expect(list).toBeDefined();
//                    fixture.detectChanges();

//                    inputElement = document.getElementById(list.searchInputId);
//                    expect(list.searchInputElement instanceof HTMLInputElement).toBeTruthy();
//                    expect(list.searchInputElement).toBe(inputElement);
//                    expect(list.searchInputId).toBe("searchInput");
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
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
//         })));*/
//         it('should set/get properly layout properties: width, left, maxLeft',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//              var template = '<div #wrapper><ig-list><ig-list-item></ig-list-item></ig-list></div>';
//                return tcb.overrideTemplate(ListTestComponent, template)
//                .createAsync(ListTestComponent)
//                .then((fixture) => {
//                    var item, visibleAreaOnFullPan,
//                    testWidth = 400, testLeft = -100,
//                    list = fixture.componentInstance.viewChild;

//                    fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + "px";

//                    fixture.detectChanges();
//                    expect(list.items.length).toBe(1);
//                    item = list.items[0];
//                    visibleAreaOnFullPan = item._VISIBLE_AREA_ON_FULL_PAN;
//                    expect(item instanceof Infragistics.ListItem).toBeTruthy();
//                    expect(item.width).toBe(testWidth);
//                    expect(item.left).toBe(0);
//                    expect(item.maxLeft).toBe(visibleAreaOnFullPan - testWidth);
//                    item.left = testLeft;
//                    expect(item.left).toBe(testLeft);
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));

//         // end of tests
//    });
//}

//@Component({
//    selector: 'test-cmp',
//    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
//    directives: [
//        Infragistics.List,
//        Infragistics.ListItem,
//        Infragistics.ListHeader]
//})
//class ListTestComponent {
//     @ViewChild(Infragistics.List) viewChild: Infragistics.List;
//     @ViewChild("wrapper") wrapper;

//     public filteringHandler: Function;
//}

//@Component({
//    selector: 'test-cmp',
//    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
//    directives: [Infragistics.ListHeader]
//})
//class ListHeaderTestComponent {
//     @ViewChild(Infragistics.ListHeader) public viewChild: Infragistics.ListHeader;
//}

//@Component({
//    selector: 'test-cmp',
//    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
//    directives: [Infragistics.ListItem]
//})
//class ListItemTestComponent {
//     @ViewChild(Infragistics.ListItem) public viewChild: Infragistics.ListItem;
//}

////class TestComponentPin extends TestComponentDI {
//     //pin: boolean = true;
//     //enableGestures: string = "";
////}