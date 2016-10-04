import { async, TestBed, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HammerGesturesManager } from '../core/touch';
import { List, ListHeader, ListItem, ListModule } from '../list/list';
import { FilterDirective, FilterPipe, FilterOptions, FilterModule } from './filter';
import { Component, ViewChild, ContentChildren } from '@angular/core';

describe("Filter", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FilterModule, ListModule],
            declarations: [ListTestComponent],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        })
            .compileComponents();
    }));

    it('should filter declaratively created list', () => {
        let fixture = TestBed.createComponent(ListTestComponent),
            items, visibleItems,
            list = fixture.componentInstance.list,
            input = fixture.componentInstance.input;

            fixture.detectChanges();
            expect(list.items.length).toBe(3);
            items = list.items;

            for (let item of items) {
                expect(item instanceof ListItem).toBeTruthy();
            }

            visibleItems = items.filter((listItem) => { return !listItem.hidden; });            
            expect(visibleItems.length).toBe(3);

            fixture.componentInstance.filterValue = "1";
            //input.nativeElement.value = "1";
            //input.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            visibleItems = items.filter((listItem) => { return !listItem.hidden; });
            expect(visibleItems.length).toBe(1);
            expect(visibleItems[0] instanceof ListItem).toBeTruthy();
    });
});


//export function main() {
//    describe('Infragistics Angular2 List', function() {        
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
    template: `<input #input (input)="inputHandler($event)" />
                <ig-list [filter]="filterValue" (filtering)="filteringHandler($event)" (filtered)="filteredHandler($event)" [filterOptions]="fo">
                    <ig-list-header>Header</ig-list-header>
                    <ig-list-item>Item 1</ig-list-item>
                    <ig-list-item>Item 2</ig-list-item>
                    <ig-list-item>Item 3</ig-list-item>
                </ig-list>`
})
class ListTestComponent {
    filterValue: string = "";
    isCanceled: boolean = false;

    @ViewChild(List) list: List;
    @ViewChild("input") input;

    get fo() {
        var options = new FilterOptions();

        options.get_value = function (item: any) {
            return item.element.nativeElement.textContent.trim();
        };

        options.metConditionFn = function (item: any) {
            item.hidden = false;
        };

        options.overdueConditionFn = function (item: any) {
            item.hidden = true;
        };

        return options;
    }

    protected inputHandler = function(args) {
        this.filterValue = args.target.value;
    };

    protected filteringHandler = function (args) {
        args.cancel = this.isCanceled;
        //console.log(args);
    }

    protected filteredHandler = function (args) {
        //console.log(args);
    }
}