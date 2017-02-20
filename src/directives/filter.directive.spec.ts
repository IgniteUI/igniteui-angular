import { async, TestBed, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HammerGesturesManager } from '../core/touch';
import { IgxList, IgxListItem, IgxListModule } from '../list/list.component';
import { IgxFilterDirective, IgxFilterPipe, IgxFilterOptions, IgxFilterModule } from './filter.directive';
import { Component, ViewChild, ContentChildren } from '@angular/core';

describe("Filter", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [IgxFilterModule, IgxListModule],
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
                expect(item instanceof IgxListItem).toBeTruthy();
            }

            visibleItems = items.filter((listItem) => { return !listItem.hidden; });
            expect(visibleItems.length).toBe(3);

            fixture.componentInstance.filterValue = "1";
            fixture.detectChanges();

            visibleItems = items.filter((listItem) => { return !listItem.hidden; });
            expect(visibleItems.length).toBe(1);
            expect(visibleItems[0] instanceof IgxListItem).toBeTruthy();

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
            expect(item instanceof IgxListItem).toBeTruthy();
        }

        expect(list.items.length).toBe(4);

        fixture.componentInstance.filterValue = "1";
        fixture.detectChanges();

        expect(list.items.length).toBe(1);
        expect(list.items[0] instanceof IgxListItem).toBeTruthy();

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
        visibleItems = list.items.filter((listItem) => { return !(<IgxListItem>listItem).hidden; });
        expect(list.items.length).toBe(3);
        expect(visibleItems.length).toBe(3);

        logInput.nativeElement.value = "";
        fixture.componentInstance.filteredArgs = undefined;
        fixture.componentInstance.filteringArgs = undefined;
        fixture.componentInstance.filterValue = "2";
        fixture.detectChanges();

        visibleItems = list.items.filter((listItem) => { return !(<IgxListItem>listItem).hidden; });
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
        visibleItems = list.items.filter((listItem) => { return !(<IgxListItem>listItem).hidden; });
        expect(list.items.length).toBe(3);
        expect(visibleItems.length).toBe(3);

        logInput.nativeElement.value = "";
        fixture.componentInstance.filteredArgs = undefined;
        fixture.componentInstance.filteringArgs = undefined;
        fixture.componentInstance.isCanceled = true;
        fixture.componentInstance.filterValue = "2";
        fixture.detectChanges();

        visibleItems = list.items.filter((listItem) => { return !(<IgxListItem>listItem).hidden; });
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
    template: `<igx-list [igxFilter]="fo" (filtering)="filteringHandler($event)" (filtered)="filteredHandler($event)" >
                    <igx-list-item [isHeader]="true">Header</igx-list-item>
                    <igx-list-item>Item 1</igx-list-item>
                    <igx-list-item>Item 2</igx-list-item>
                    <igx-list-item>Item 3</igx-list-item>
                </igx-list>
                <input #logInput />`
})
class DeclarativeListTestComponent {
    filterValue: string;
    isCanceled: boolean = false;
    filteringArgs: Object;
    filteredArgs: Object;

    @ViewChild(IgxList) list: IgxList;
    @ViewChild("logInput") logInput: any;

    get fo() {
        var options = new IgxFilterOptions();
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
    template: `<igx-list>
                 <igx-list-item *ngFor="let item of dataSourceItems | igxFilter: fo">
                    {{item.text}}
                 </igx-list-item>
              </igx-list>`
})
class DynamicListTestComponent {
    filterValue: string;
    isCanceled: boolean = false;

    @ViewChild(IgxList) list: IgxList;

    protected dataSourceItems: Array<Object> = [
        { key: "1", text: "Nav1" },
        { key: "2", text: "Nav2" },
        { key: "3", text: "Nav3" },
        { key: "4", text: "Nav4" }
    ];

    get fo() {
        var options = new IgxFilterOptions();
        options.inputValue = this.filterValue;
        options.key = "text";
        return options;
    }
}