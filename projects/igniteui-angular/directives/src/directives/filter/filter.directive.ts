import {
    Directive,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    Pipe,
    PipeTransform,
    SimpleChanges
} from '@angular/core';

/**
 * Collects the configuration of the `igxFilter` directive and pipe.
 *
 * @example
 * ```typescript
 * public get filterOptions() {
 *     const options = new IgxFilterOptions();
 *     options.key = 'text';
 *     options.inputValue = this.searchValue;
 *     return options;
 * }
 * ```
 */
export class IgxFilterOptions {
    /**
     * Input text value that will be used as a filtering pattern (matching condition is based on it).
     */
    public inputValue = '';

    /**
     * Item property (or properties), which value should be used for filtering.
     * When multiple keys are provided, an item matches when the value of any of them matches.
     */
    public key!: string | string[];

    /**
     * Represents the items of the list. It should be used to handle declaratively defined widgets.
     * When set, these items are filtered instead of the ones passed to the pipe.
     */
    public items!: any[];

    /**
     * Gets the value to be tested from the item.
     * By default returns the `key`-named property value of the item as a string if a key is provided
     * and the value is not `null` or `undefined` (falsy values like `0` or `false` are returned as well).
     * Otherwise returns the trimmed text content of the item's element, or an empty string if there is none.
     *
     * @param item - single item of the list to be filtered
     * @param key - property name of the item, which value should be tested; `undefined` when no `key` is set
     * @returns the text value to be tested
     * @example
     * ```typescript
     * options.get_value = (item, key) => item.data[key];
     * ```
     */
    public get_value(item: any, key: string | undefined): string {
        const value = key ? item[key] : undefined;

        if (value !== undefined && value !== null) {
            return value.toString();
        }

        // The element can be either an ElementRef or the DOM element itself
        const element = item.element?.nativeElement ?? item.element;
        return element?.textContent?.trim() ?? '';
    }

    /**
     * Formats the original text before the matching process.
     * By default returns the text in lower case.
     *
     * @param valueToTest - the text value returned by `get_value`
     * @returns the formatted text value
     * @example
     * ```typescript
     * options.formatter = (valueToTest) => valueToTest.normalize('NFD').toLowerCase();
     * ```
     */
    public formatter(valueToTest: string): string {
        return valueToTest.toLowerCase();
    }

    /**
     * Determines whether the item meets the condition.
     * By default performs a case-insensitive "contains" match.
     *
     * @param valueToTest - text value that should be tested
     * @param inputValue - text value from the input that the condition is based on;
     * the filter pipe passes an empty string when `inputValue` is `null` or `undefined`
     * @returns `true` if the value meets the condition, otherwise `false`
     * @example
     * ```typescript
     * options.matchFn = (valueToTest, inputValue) => valueToTest.startsWith(inputValue.toLowerCase());
     * ```
     */
    public matchFn(valueToTest: string, inputValue: string): boolean {
        return valueToTest.indexOf(inputValue && inputValue.toLowerCase() || '') > -1;
    }

    /**
     * Executed after the matching test for every matched item.
     * By default shows the item if it has a `hidden` property.
     *
     * @param item - the matched item
     * @example
     * ```typescript
     * options.metConditionFn = (item) => item.highlighted = true;
     * ```
     */
    public metConditionFn(item: any) {
        if (item.hasOwnProperty('hidden')) {
            item.hidden = false;
        }
    }

    /**
     * Executed after the matching test for every item that is NOT matched.
     * By default hides the item if it has a `hidden` property.
     *
     * @param item - the item that is not matched
     * @example
     * ```typescript
     * options.overdueConditionFn = (item) => item.highlighted = false;
     * ```
     */
    public overdueConditionFn(item: any) {
        if (item.hasOwnProperty('hidden')) {
            item.hidden = true;
        }
    }
}

/**
 * Filters the `items` of the provided `IgxFilterOptions` whenever their `inputValue` changes.
 *
 * @example
 * ```html
 * <igx-list [igxFilter]="filterOptions" (filtered)="onFiltered($event)">
 *     <igx-list-item>Golden Delicious</igx-list-item>
 *     <igx-list-item>Cosmic Crisp</igx-list-item>
 * </igx-list>
 * ```
 */
@Directive({
    selector: '[igxFilter]',
    standalone: true
})
export class IgxFilterDirective implements OnChanges {
    /**
     * Emitted synchronously before the filtering is performed.
     * Setting the `cancel` property of the event arguments to `true` cancels the filtering.
     *
     * @example
     * ```html
     * <igx-list [igxFilter]="filterOptions" (filtering)="onFiltering($event)"></igx-list>
     * ```
     */
    @Output()
    public filtering = new EventEmitter<{ cancel: boolean; items: any[] }>();

    /**
     * Emitted after the filtering is performed with the matched items as `filteredItems`.
     *
     * @example
     * ```html
     * <igx-list [igxFilter]="filterOptions" (filtered)="onFiltered($event)"></igx-list>
     * ```
     */
    @Output()
    public filtered = new EventEmitter<{ filteredItems: any[] }>();

    /**
     * The options that the filtering is based on.
     *
     * @example
     * ```html
     * <igx-list [igxFilter]="filterOptions"></igx-list>
     * ```
     */
    @Input('igxFilter')
    public filterOptions!: IgxFilterOptions;

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges) {
        const current = changes.filterOptions?.currentValue;
        const previous = changes.filterOptions?.previousValue;

        // Detect only changes of the input value, including changes to `null` or `undefined`
        if (current && previous && current.inputValue !== previous.inputValue) {
            this.filter();
        }
    }

    private filter() {
        if (!this.filterOptions.items) {
            return;
        }

        const args = { cancel: false, items: this.filterOptions.items };
        this.filtering.emit(args);

        if (args.cancel) {
            return;
        }

        const filteredItems = new IgxFilterPipe().transform(this.filterOptions.items, this.filterOptions);
        this.filtered.emit({ filteredItems });
    }
}

/**
 * Filters the piped items based on the provided `IgxFilterOptions`.
 *
 * @example
 * ```html
 * @for (item of items | igxFilter: filterOptions; track item.id) {
 *     <igx-list-item>{{ item.text }}</igx-list-item>
 * }
 * ```
 */
@Pipe({
    name: 'igxFilter',
    pure: false,
    standalone: true
})
export class IgxFilterPipe implements PipeTransform {
    /**
     * Filters the items based on the provided options.
     *
     * @param items - the items to be filtered; ignored when `options.items` is set
     * @param options - the options that the filtering is based on
     * @returns the items that match the options, or the items as they are (including `null` or `undefined`)
     * when no options are provided or there are no items to filter
     * @example
     * ```typescript
     * const filteredItems = new IgxFilterPipe().transform(items, filterOptions);
     * ```
     */
    public transform(items: any[], options: IgxFilterOptions | null | undefined): any[];
    public transform(items: any[] | null | undefined, options: IgxFilterOptions | null | undefined): any[] | null | undefined;
    public transform(items: any[] | null | undefined, options: IgxFilterOptions | null | undefined): any[] | null | undefined {
        if (!options) {
            return items;
        }

        const source = options.items || items;
        if (!source?.length) {
            return source;
        }

        const keys = Array.isArray(options.key) ? options.key : [options.key];
        const inputValue = options.inputValue ?? '';

        return source.filter((item: any) => {
            const match = keys.some(key =>
                options.matchFn(options.formatter(options.get_value(item, key)), inputValue));

            if (match) {
                options.metConditionFn?.(item);
            } else {
                options.overdueConditionFn?.(item);
            }

            return match;
        });
    }
}
