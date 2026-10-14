import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxListComponent, IgxListItemComponent } from 'igniteui-angular/list';
import { IgxFilterDirective, IgxFilterOptions, IgxFilterPipe } from './filter.directive';

describe('Filter', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [DeclarativeListTestComponent, DynamicListTestComponent],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        }).compileComponents();
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

    it('should filter a list by multiple keys', () => {
        const fixture = TestBed.createComponent(DynamicListTestComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();
        expect(list.items.length).toBe(4);
        const items = list.items;

        for (const item of items) {
            expect(item instanceof IgxListItemComponent).toBeTruthy();
        }

        fixture.componentInstance.key = 'key';
        fixture.componentInstance.filterValue = 'Nav3';
        fixture.detectChanges();

        expect(list.items.length).toBe(0);

        fixture.componentInstance.key = ['key', 'text'];
        fixture.detectChanges();

        expect(list.items.length).toBe(1);
        expect(list.items[0] instanceof IgxListItemComponent).toBeTruthy();

        fixture.componentInstance.filterValue = '2';
        fixture.detectChanges();

        expect(list.items.length).toBe(1);

        fixture.componentInstance.filterValue = '';
        fixture.detectChanges();

        expect(list.items.length).toBe(4);
    });

    it('should not filter declaratively created list when the input value is unchanged', () => {
        const fixture = TestBed.createComponent(DeclarativeListTestComponent);
        fixture.componentInstance.filterValue = '1';
        fixture.detectChanges();
        const filteringSpy = spyOn(fixture.componentInstance, 'filteringHandler').and.callThrough();

        // The `fo` getter returns a new options instance on every change detection
        fixture.detectChanges();
        fixture.detectChanges();

        expect(filteringSpy).not.toHaveBeenCalled();
    });

    it('should show all items of declaratively created list when the input value is cleared to undefined', () => {
        const fixture = TestBed.createComponent(DeclarativeListTestComponent);
        const list = fixture.componentInstance.list;

        fixture.componentInstance.filterValue = '1';
        fixture.detectChanges();
        expect(list.items.filter((listItem) => !listItem.hidden).length).toBe(1);

        fixture.componentInstance.filterValue = undefined;
        fixture.detectChanges();

        expect(list.items.filter((listItem) => !listItem.hidden).length).toBe(3);
        expect(fixture.componentInstance.filteredArgs.filteredItems.length).toBe(3);
    });

    it('should emit an empty array of filtered items when the items are empty', () => {
        const fixture = TestBed.createComponent(DeclarativeListTestComponent);
        fixture.componentInstance.useListItems = false;
        fixture.componentInstance.items = [];
        fixture.detectChanges();

        fixture.componentInstance.filterValue = '1';
        fixture.detectChanges();

        expect(fixture.componentInstance.filteringArgs.items).toEqual([]);
        expect(fixture.componentInstance.filteredArgs.filteredItems).toEqual([]);
    });

    it('should not filter declaratively created list when the options are set to or from null', () => {
        const fixture = TestBed.createComponent(DeclarativeListTestComponent);
        const filteringSpy = spyOn(fixture.componentInstance, 'filteringHandler').and.callThrough();

        fixture.componentInstance.noOptions = true;
        fixture.componentInstance.filterValue = '1';
        expect(() => fixture.detectChanges()).not.toThrow();

        fixture.componentInstance.noOptions = false;
        fixture.detectChanges();

        expect(filteringSpy).not.toHaveBeenCalled();
    });

    it('should not filter when the options are not changed', () => {
        const directive = new IgxFilterDirective();
        directive.filterOptions = new IgxFilterOptions();
        const filteringSpy = spyOn(directive.filtering, 'emit');

        directive.ngOnChanges({});

        expect(filteringSpy).not.toHaveBeenCalled();
    });

    it('should not emit filter events when there are no items to filter', () => {
        const fixture = TestBed.createComponent(DeclarativeListTestComponent);
        fixture.componentInstance.useListItems = false;
        fixture.detectChanges();
        const filteringSpy = spyOn(fixture.componentInstance, 'filteringHandler').and.callThrough();
        const filteredSpy = spyOn(fixture.componentInstance, 'filteredHandler').and.callThrough();

        fixture.componentInstance.filterValue = '1';
        fixture.detectChanges();

        expect(filteringSpy).not.toHaveBeenCalled();
        expect(filteredSpy).not.toHaveBeenCalled();
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

    describe('IgxFilterOptions', () => {
        let options: IgxFilterOptions;

        beforeEach(() => {
            options = new IgxFilterOptions();
        });

        it('should have correct defaults', () => {
            expect(options.inputValue).toBe('');
            expect(options.key).toBeUndefined();
            expect(options.items).toBeUndefined();
        });

        it('get_value should return the stringified value of the key property', () => {
            expect(options.get_value({ text: 'Some Text' }, 'text')).toBe('Some Text');
            expect(options.get_value({ id: 42 }, 'id')).toBe('42');
        });

        it('get_value should return the trimmed text content of an ElementRef', () => {
            const nativeElement = document.createElement('span');
            nativeElement.textContent = '  ElementRef Text  ';

            expect(options.get_value({ element: { nativeElement } }, undefined)).toBe('ElementRef Text');
        });

        it('get_value should return the trimmed text content of a DOM element', () => {
            const element = document.createElement('span');
            element.textContent = '  Element Text  ';

            expect(options.get_value({ element }, undefined)).toBe('Element Text');
        });

        it('get_value should fall back to the element text when the key property is missing', () => {
            const element = document.createElement('span');
            element.textContent = 'Element Text';

            expect(options.get_value({ element }, 'text')).toBe('Element Text');
        });

        it('get_value should return falsy values of the key property', () => {
            const element = document.createElement('span');
            element.textContent = 'Element Text';

            expect(options.get_value({ count: 0, element }, 'count')).toBe('0');
            expect(options.get_value({ flag: false, element }, 'flag')).toBe('false');
            expect(options.get_value({ text: '', element }, 'text')).toBe('');
        });

        it('get_value should return an empty string when there is no value to test', () => {
            expect(options.get_value({}, 'text')).toBe('');
            expect(options.get_value({ text: null }, 'text')).toBe('');
            expect(options.get_value({}, undefined)).toBe('');
            expect(options.get_value({ element: {} }, undefined)).toBe('');
            expect(options.get_value({ element: { nativeElement: null } }, undefined)).toBe('');
            expect(options.get_value({ element: document.createElement('span') }, undefined)).toBe('');
        });

        it('formatter should return the value in lower case', () => {
            expect(options.formatter('MiXeD Case')).toBe('mixed case');
        });

        it('matchFn should perform a case-insensitive "contains" match against the input value', () => {
            expect(options.matchFn('golden delicious', 'DELI')).toBeTrue();
            expect(options.matchFn('golden delicious', 'en de')).toBeTrue();
            expect(options.matchFn('golden delicious', 'crisp')).toBeFalse();
        });

        it('matchFn should match every value when the input value is empty', () => {
            expect(options.matchFn('golden delicious', '')).toBeTrue();
            expect(options.matchFn('golden delicious', null)).toBeTrue();
            expect(options.matchFn('golden delicious', undefined)).toBeTrue();
        });

        it('metConditionFn should show items that have a hidden property', () => {
            const item = { hidden: true };
            options.metConditionFn(item);
            expect(item.hidden).toBeFalse();
        });

        it('overdueConditionFn should hide items that have a hidden property', () => {
            const item = { hidden: false };
            options.overdueConditionFn(item);
            expect(item.hidden).toBeTrue();
        });

        it('metConditionFn and overdueConditionFn should not add a hidden property', () => {
            const item = {};
            options.metConditionFn(item);
            options.overdueConditionFn(item);
            expect(item.hasOwnProperty('hidden')).toBeFalse();
        });
    });

    describe('IgxFilterPipe', () => {
        let pipe: IgxFilterPipe;
        let options: IgxFilterOptions;
        let data: { key: string; text: string; hidden: boolean }[];

        beforeEach(() => {
            pipe = new IgxFilterPipe();
            options = new IgxFilterOptions();
            options.key = 'text';
            data = [
                { key: '1', text: 'Golden Delicious', hidden: false },
                { key: '2', text: 'Cosmic Crisp', hidden: false },
                { key: '3', text: 'Pinova', hidden: false }
            ];
        });

        it('should return the items that match the input value', () => {
            options.inputValue = 'crisp';
            expect(pipe.transform(data, options)).toEqual([data[1]]);

            options.inputValue = 'o';
            expect(pipe.transform(data, options)).toEqual(data);

            options.inputValue = 'fuji';
            expect(pipe.transform(data, options)).toEqual([]);
        });

        it('should return the items as they are when there is nothing to filter', () => {
            const empty = [];
            options.inputValue = 'crisp';

            expect(pipe.transform(null, options)).toBeNull();
            expect(pipe.transform(undefined, options)).toBeUndefined();
            expect(pipe.transform(empty, options)).toBe(empty);
        });

        it('should return the items unfiltered when no options are provided', () => {
            expect(pipe.transform(data, null)).toBe(data);
            expect(pipe.transform(data, undefined)).toBe(data);
            expect(pipe.transform(null, undefined)).toBeNull();
        });

        it('should filter options.items when the piped items are empty', () => {
            options.items = data;
            options.inputValue = 'crisp';

            expect(pipe.transform([], options)).toEqual([data[1]]);
            expect(pipe.transform(null, options)).toEqual([data[1]]);
        });

        it('should match falsy values of the key property', () => {
            const items = [{ count: 0 }, { count: 10 }, { count: 2 }];
            options.key = 'count';
            options.inputValue = '0';

            expect(pipe.transform(items, options)).toEqual([items[0], items[1]]);
        });

        it('should not mutate the source array', () => {
            const source = [...data];
            options.inputValue = 'crisp';

            pipe.transform(data, options);

            expect(data).toEqual(source);
        });

        it('should filter options.items instead of the piped items when provided', () => {
            const otherItems = [{ text: 'Crisp Other' }, { text: 'Other' }];
            options.items = otherItems;
            options.inputValue = 'crisp';

            expect(pipe.transform(data, options)).toEqual([otherItems[0]]);
        });

        it('should call metConditionFn for matched and overdueConditionFn for not matched items', () => {
            const metSpy = spyOn(options, 'metConditionFn').and.callThrough();
            const overdueSpy = spyOn(options, 'overdueConditionFn').and.callThrough();
            options.inputValue = 'crisp';

            pipe.transform(data, options);

            expect(metSpy).toHaveBeenCalledOnceWith(data[1]);
            expect(overdueSpy).toHaveBeenCalledTimes(2);
            expect(overdueSpy).toHaveBeenCalledWith(data[0]);
            expect(overdueSpy).toHaveBeenCalledWith(data[2]);
            expect(data.map(item => item.hidden)).toEqual([true, false, true]);
        });

        it('should not fail when metConditionFn and overdueConditionFn are not set', () => {
            options.metConditionFn = null;
            options.overdueConditionFn = null;
            options.inputValue = 'crisp';

            expect(pipe.transform(data, options)).toEqual([data[1]]);
            expect(data.map(item => item.hidden)).toEqual([false, false, false]);
        });

        it('should use custom get_value, formatter and matchFn', () => {
            options.get_value = (item: any) => item.key;
            options.formatter = (value: string) => `#${value}`;
            options.matchFn = (value: string, inputValue: string) => value === inputValue;
            options.inputValue = '#3';

            expect(pipe.transform(data, options)).toEqual([data[2]]);
        });

        it('should pass an empty string to matchFn when the input value is null or undefined', () => {
            options.matchFn = (value: string, inputValue: string) => value.includes(inputValue.toLowerCase());
            const matchSpy = spyOn(options, 'matchFn').and.callThrough();

            options.inputValue = undefined;
            expect(pipe.transform(data, options)).toEqual(data);

            options.inputValue = null;
            expect(pipe.transform(data, options)).toEqual(data);

            expect(matchSpy.calls.allArgs().map(args => args[1])).toEqual(['', '', '', '', '', '']);
        });

        it('should return the items that match the input value by any of multiple keys', () => {
            options.key = ['key', 'text'];

            options.inputValue = '2';
            expect(pipe.transform(data, options)).toEqual([data[1]]);

            options.inputValue = 'pinova';
            expect(pipe.transform(data, options)).toEqual([data[2]]);

            options.inputValue = 'fuji';
            expect(pipe.transform(data, options)).toEqual([]);
        });

        it('should show the items matched by any of multiple keys', () => {
            options.key = ['key', 'text'];
            options.inputValue = '2';

            pipe.transform(data, options);

            expect(data.map(item => item.hidden)).toEqual([true, false, true]);

            options.inputValue = 'pinova';
            pipe.transform(data, options);

            expect(data.map(item => item.hidden)).toEqual([true, true, false]);
        });

        it('should call metConditionFn and overdueConditionFn once per item for multiple keys', () => {
            const metSpy = spyOn(options, 'metConditionFn').and.callThrough();
            const overdueSpy = spyOn(options, 'overdueConditionFn').and.callThrough();
            options.key = ['key', 'text'];
            options.inputValue = '2';

            pipe.transform(data, options);

            expect(metSpy).toHaveBeenCalledOnceWith(data[1]);
            expect(overdueSpy).toHaveBeenCalledTimes(2);
            expect(overdueSpy).toHaveBeenCalledWith(data[0]);
            expect(overdueSpy).toHaveBeenCalledWith(data[2]);
        });
    });
});

@Component({
    template: `
    <igx-list [igxFilter]="fo" (filtering)="filteringHandler($event)" (filtered)="filteredHandler($event)" >
        <igx-list-item [isHeader]="true">Header</igx-list-item>
        <igx-list-item>Item 1</igx-list-item>
        <igx-list-item>Item 2</igx-list-item>
        <igx-list-item>Item 3</igx-list-item>
    </igx-list>
    <input #logInput />`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent, IgxFilterDirective]
})
class DeclarativeListTestComponent {
    @ViewChild(IgxListComponent, { static: true }) public list: IgxListComponent;
    @ViewChild('logInput', { static: true }) public logInput: any;

    public filterValue: string;
    public isCanceled = false;
    public useListItems = true;
    public noOptions = false;
    public items: any[];
    public filteringArgs: FilteringArgs;
    public filteredArgs: FilteringArgs;

    public get fo() {
        if (this.noOptions) {
            return null as IgxFilterOptions;
        }

        const options = new IgxFilterOptions();
        options.items = this.useListItems ? this.list.items : this.items;
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
    template: `
    <igx-list>
        @for (item of dataSourceItems | igxFilter: fo; track item.key) {
            <igx-list-item> {{item.text}} </igx-list-item>
        }
    </igx-list>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent, IgxFilterPipe]
})
class DynamicListTestComponent {
    @ViewChild(IgxListComponent, { static: true }) public list: IgxListComponent;

    public filterValue: string;
    public key: string | string[] = 'text';

    protected dataSourceItems = [
        { key: '1', text: 'Nav1' },
        { key: '2', text: 'Nav2' },
        { key: '3', text: 'Nav3' },
        { key: '4', text: 'Nav4' }
    ];

    public get fo() {
        const options = new IgxFilterOptions();
        options.inputValue = this.filterValue;
        options.key = this.key;
        return options;
    }
}

class FilteringArgs {
    public cancel: boolean;
    public items: IgxListItemComponent[];
    public filteredItems: IgxListItemComponent[];
}
