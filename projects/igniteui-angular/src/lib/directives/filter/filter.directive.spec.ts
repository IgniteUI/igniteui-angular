import { Component, ViewChild } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxListItemComponent } from '../../list/list-item.component';
import { IgxListComponent, IgxListModule } from '../../list/list.component';
import { IgxFilterModule, IgxFilterOptions } from './filter.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('Filter', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DeclarativeListTestComponent, DynamicListTestComponent],
            imports: [IgxFilterModule, IgxListModule],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        })
            .compileComponents();
    }));

    it('should filter declaratively created list', () => {
        const fixture = TestBed.createComponent(DeclarativeListTestComponent);
        const list = fixture.componentInstance.list;
        let visibleItems;

        fixture.detectChanges();
        expect(list.items.length).toBe(3);
        const items = list.items;

        for (const item of items) {
                expect(item instanceof IgxListItemComponent).toBeTruthy();
            }

        visibleItems = items.filter((listItem) => !listItem.hidden);
        expect(visibleItems.length).toBe(3);

        fixture.componentInstance.filterValue = '1';
        fixture.detectChanges();

        visibleItems = items.filter((listItem) => !listItem.hidden);
        expect(visibleItems.length).toBe(1);
        expect(visibleItems[0] instanceof IgxListItemComponent).toBeTruthy();

        fixture.componentInstance.filterValue = '';
        fixture.detectChanges();

        visibleItems = items.filter((listItem) => !listItem.hidden);
        expect(visibleItems.length).toBe(3);
    });

    it('should filter dynamically created list', () => {
        const fixture = TestBed.createComponent(DynamicListTestComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();
        expect(list.items.length).toBe(4);

        for (const item of list.items) {
            expect(item instanceof IgxListItemComponent).toBeTruthy();
        }

        expect(list.items.length).toBe(4);

        fixture.componentInstance.filterValue = '1';
        fixture.detectChanges();

        expect(list.items.length).toBe(1);
        expect(list.items[0] instanceof IgxListItemComponent).toBeTruthy();

        fixture.componentInstance.filterValue = '';
        fixture.detectChanges();

        expect(list.items.length).toBe(4);
    });

    it('should emit filter events on declaratively created list', () => {
        let visibleItems;
        const fixture = TestBed.createComponent(DeclarativeListTestComponent);
        const list = fixture.componentInstance.list;
        const logInput = fixture.componentInstance.logInput;

        fixture.detectChanges();
        visibleItems = list.items.filter((listItem) => !(listItem as IgxListItemComponent).hidden);
        expect(list.items.length).toBe(3);
        expect(visibleItems.length).toBe(3);

        logInput.nativeElement.value = '';
        fixture.componentInstance.filteredArgs = undefined;
        fixture.componentInstance.filteringArgs = undefined;
        fixture.componentInstance.filterValue = '2';
        fixture.detectChanges();

        visibleItems = list.items.filter((listItem) => !(listItem as IgxListItemComponent).hidden);
        expect(visibleItems.length).toBe(1);

        expect(logInput.nativeElement.value).toBe('filtering;filtered;');
        expect(fixture.componentInstance.filteringArgs).toBeDefined();
        expect(fixture.componentInstance.filteringArgs.cancel).toBeDefined();
        expect(fixture.componentInstance.filteringArgs.cancel).toBeFalsy();
        expect(fixture.componentInstance.filteringArgs.items).toBeDefined();
        expect(fixture.componentInstance.filteringArgs.items instanceof Array).toBeTruthy();
        expect(fixture.componentInstance.filteringArgs.items.length).toBe(3);

        expect(fixture.componentInstance.filteredArgs).toBeDefined();
        expect(fixture.componentInstance.filteredArgs.filteredItems).toBeDefined();
        expect(fixture.componentInstance.filteredArgs.filteredItems instanceof Array).toBeTruthy();
        expect(fixture.componentInstance.filteredArgs.filteredItems.length).toBe(1);
        expect(fixture.componentInstance.filteredArgs.filteredItems[0]).toBe(visibleItems[0]);
    });

    it('should cancel filtering on declaratively created list', () => {
        let visibleItems;
        const fixture = TestBed.createComponent(DeclarativeListTestComponent);
        const list = fixture.componentInstance.list;
        const logInput = fixture.componentInstance.logInput;

        fixture.detectChanges();
        visibleItems = list.items.filter((listItem) => !(listItem as IgxListItemComponent).hidden);
        expect(list.items.length).toBe(3);
        expect(visibleItems.length).toBe(3);

        logInput.nativeElement.value = '';
        fixture.componentInstance.filteredArgs = undefined;
        fixture.componentInstance.filteringArgs = undefined;
        fixture.componentInstance.isCanceled = true;
        fixture.componentInstance.filterValue = '2';
        fixture.detectChanges();

        visibleItems = list.items.filter((listItem) => !(listItem as IgxListItemComponent).hidden);
        expect(visibleItems.length).toBe(3);

        expect(logInput.nativeElement.value).toBe('filtering;');
        expect(fixture.componentInstance.filteringArgs).toBeDefined();
        expect(fixture.componentInstance.filteringArgs.cancel).toBeDefined();
        expect(fixture.componentInstance.filteringArgs.cancel).toBeTruthy();
        expect(fixture.componentInstance.filteringArgs.items).toBeDefined();
        expect(fixture.componentInstance.filteringArgs.items instanceof Array).toBeTruthy();
        expect(fixture.componentInstance.filteringArgs.items.length).toBe(3);

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
    @ViewChild(IgxListComponent, { static: true }) public list: IgxListComponent;
    @ViewChild('logInput', { static: true }) public logInput: any;

    public filterValue: string;
    public isCanceled = false;
    public filteringArgs: FilteringArgs;
    public filteredArgs: FilteringArgs;

    public get fo() {
        const options = new IgxFilterOptions();
        options.items = this.list.items;
        options.inputValue = this.filterValue;

        return options;
    }

    public filteringHandler = function(args) {
        args.cancel = this.isCanceled;
        this.logInput.nativeElement.value += 'filtering;';
        this.filteringArgs = args;
    };

    public filteredHandler = function(args) {
        this.logInput.nativeElement.value += 'filtered;';
        this.filteredArgs = args;
    };
}

@Component({
    template: `<igx-list>
                 <igx-list-item *ngFor="let item of dataSourceItems | igxFilter: fo">
                    {{item.text}}
                 </igx-list-item>
              </igx-list>`
})
class DynamicListTestComponent {
    @ViewChild(IgxListComponent, { static: true }) public list: IgxListComponent;

    public filterValue: string;
    public isCanceled = false;

    protected dataSourceItems = [
        { key: '1', text: 'Nav1' },
        { key: '2', text: 'Nav2' },
        { key: '3', text: 'Nav3' },
        { key: '4', text: 'Nav4' }
    ];

    public get fo() {
        const options = new IgxFilterOptions();
        options.inputValue = this.filterValue;
        options.key = 'text';
        return options;
    }
}

class FilteringArgs {
    public cancel: boolean;
    public items: IgxListItemComponent[];
    public filteredItems: IgxListItemComponent[];
}
