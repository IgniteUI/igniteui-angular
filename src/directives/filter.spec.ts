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
            declarations: [DeclarativeListTestComponent, DynamicListTestComponent],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        })
            .compileComponents();
    }));

    it('should filter declaratively created list', () => {
        let fixture = TestBed.createComponent(DeclarativeListTestComponent),
            items, visibleItems,
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            expect(list.items.length).toBe(3);
            items = list.items;

            for (let item of items) {
                expect(item instanceof ListItem).toBeTruthy();
            }

            visibleItems = items.filter((listItem) => { return !listItem.hidden; });            
            expect(visibleItems.length).toBe(3);

            fixture.componentInstance.filterValue = "1";
            fixture.detectChanges();

            visibleItems = items.filter((listItem) => { return !listItem.hidden; });
            expect(visibleItems.length).toBe(1);
            expect(visibleItems[0] instanceof ListItem).toBeTruthy();

            fixture.componentInstance.filterValue = "";
            fixture.detectChanges();

            visibleItems = items.filter((listItem) => { return !listItem.hidden; });
            expect(visibleItems.length).toBe(3);
    });

    it('should filter dynamically created list', () => {
        let fixture = TestBed.createComponent(DynamicListTestComponent),
            list = fixture.componentInstance.list;

        fixture.detectChanges();
        expect(list.items.length).toBe(4);

        for (let item of list.items) {
            expect(item instanceof ListItem).toBeTruthy();
        }
                
        expect(list.items.length).toBe(4);

        fixture.componentInstance.filterValue = "1";
        fixture.detectChanges();
        
        expect(list.items.length).toBe(1);
        expect(list.items[0] instanceof ListItem).toBeTruthy();

        fixture.componentInstance.filterValue = "";
        fixture.detectChanges();

        expect(list.items.length).toBe(4);
    });

    it('should emit filter events on declaratively created list', () => {
        let visibleItems,
            fixture = TestBed.createComponent(DeclarativeListTestComponent),
            list = fixture.componentInstance.list,
            logInput = fixture.componentInstance.logInput;

        fixture.detectChanges();
        visibleItems = list.items.filter((listItem) => { return !(<ListItem>listItem).hidden; });
        expect(list.items.length).toBe(3);
        expect(visibleItems.length).toBe(3);

        logInput.nativeElement.value = "";
        fixture.componentInstance.filteredArgs = undefined;
        fixture.componentInstance.filteringArgs = undefined;
        fixture.componentInstance.filterValue = "2";
        fixture.detectChanges();

        visibleItems = list.items.filter((listItem) => { return !(<ListItem>listItem).hidden; });
        expect(visibleItems.length).toBe(1);

        expect(logInput.nativeElement.value).toBe("filtering;filtered;");
        expect(fixture.componentInstance.filteringArgs).toBeDefined();
        expect(fixture.componentInstance.filteringArgs["cancel"]).toBeDefined();
        expect(fixture.componentInstance.filteringArgs["cancel"]).toBeFalsy();
        expect(fixture.componentInstance.filteringArgs["items"]).toBeDefined();
        expect(fixture.componentInstance.filteringArgs["items"] instanceof Array).toBeTruthy();
        expect(fixture.componentInstance.filteringArgs["items"].length).toBe(3);

        expect(fixture.componentInstance.filteredArgs).toBeDefined();
        expect(fixture.componentInstance.filteredArgs["filteredItems"]).toBeDefined();
        expect(fixture.componentInstance.filteredArgs["filteredItems"] instanceof Array).toBeTruthy();
        expect(fixture.componentInstance.filteredArgs["filteredItems"].length).toBe(1);
        expect(fixture.componentInstance.filteredArgs["filteredItems"][0]).toBe(visibleItems[0]);
    });

    it('should cancel filtering on declaratively created list', () => {
        let visibleItems,
            fixture = TestBed.createComponent(DeclarativeListTestComponent),
            list = fixture.componentInstance.list,
            logInput = fixture.componentInstance.logInput;

        fixture.detectChanges();
        visibleItems = list.items.filter((listItem) => { return !(<ListItem>listItem).hidden; });
        expect(list.items.length).toBe(3);
        expect(visibleItems.length).toBe(3);

        logInput.nativeElement.value = "";
        fixture.componentInstance.filteredArgs = undefined;
        fixture.componentInstance.filteringArgs = undefined;
        fixture.componentInstance.isCanceled = true;
        fixture.componentInstance.filterValue = "2";
        fixture.detectChanges();

        visibleItems = list.items.filter((listItem) => { return !(<ListItem>listItem).hidden; });
        expect(visibleItems.length).toBe(3);

        expect(logInput.nativeElement.value).toBe("filtering;");
        expect(fixture.componentInstance.filteringArgs).toBeDefined();
        expect(fixture.componentInstance.filteringArgs["cancel"]).toBeDefined();
        expect(fixture.componentInstance.filteringArgs["cancel"]).toBeTruthy();
        expect(fixture.componentInstance.filteringArgs["items"]).toBeDefined();
        expect(fixture.componentInstance.filteringArgs["items"] instanceof Array).toBeTruthy();
        expect(fixture.componentInstance.filteringArgs["items"].length).toBe(3);

        expect(fixture.componentInstance.filteredArgs).toBeUndefined();
    });
});

@Component({
    template: `<ig-list [filter]="fo" (filtering)="filteringHandler($event)" (filtered)="filteredHandler($event)" >
                    <ig-list-header>Header</ig-list-header>
                    <ig-list-item>Item 1</ig-list-item>
                    <ig-list-item>Item 2</ig-list-item>
                    <ig-list-item>Item 3</ig-list-item>
                </ig-list>
                <input #logInput />`
})
class DeclarativeListTestComponent {
    filterValue: string;
    isCanceled: boolean = false;
    filteringArgs: Object;
    filteredArgs: Object;

    @ViewChild(List) list: List;
    @ViewChild("logInput") logInput: any;

    get fo() {
        var options = new FilterOptions();
        options.items = this.list.items;
        options.inputValue = this.filterValue;

        return options;
    }

    filteringHandler = function (args) {
        args.cancel = this.isCanceled;
        this.logInput.nativeElement.value += "filtering;";
        this.filteringArgs = args;
    }

    filteredHandler = function (args) {
        this.logInput.nativeElement.value += "filtered;";
        this.filteredArgs = args;
    }
}

@Component({
    template: `<ig-list>
                 <ig-list-item *ngFor="let item of dataSourceItems | filter: fo">
                    {{item.text}}
                 </ig-list-item>
              </ig-list>`
})
class DynamicListTestComponent {
    filterValue: string;
    isCanceled: boolean = false;

    @ViewChild(List) list: List;

    protected dataSourceItems: Array<Object> = [
        { key: "1", text: "Nav1" },
        { key: "2", text: "Nav2" },
        { key: "3", text: "Nav3" },
        { key: "4", text: "Nav4" }
    ];

    get fo() {
        var options = new FilterOptions();
        options.inputValue = this.filterValue;
        options.key = "text";
        return options;
    }
}