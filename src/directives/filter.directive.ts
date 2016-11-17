import { Directive, Pipe, PipeTransform, NgModule, Output, EventEmitter, ElementRef, Renderer, Input, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";

@Directive({
    selector: '[igxFilter]',
})
export class IgxFilterDirective implements OnChanges {
    @Output() filtering = new EventEmitter(false); // synchronous event emitter
    @Output() filtered = new EventEmitter();

    @Input("igxFilter") filterOptions: IgxFilterOptions;

    constructor(private element: ElementRef, renderer: Renderer) {
    }

    ngOnChanges(changes: SimpleChanges) {
        // Detect only changes of input value
        if (changes["filterOptions"] &&
            changes["filterOptions"].currentValue &&
            changes["filterOptions"].currentValue["inputValue"] !== undefined &&
            changes["filterOptions"].previousValue &&
            changes["filterOptions"].currentValue["inputValue"] !== changes["filterOptions"].previousValue["inputValue"]) {
            this.filter();
        }
    }

    private filter() {
        if (!this.filterOptions.items) {
            return;
        }

        var args = { cancel: false, items: this.filterOptions.items };
        this.filtering.emit(args);

        if (args.cancel) {
            return;
        }

        var pipe = new IgxFilterPipe();

        var filtered = pipe.transform(this.filterOptions.items, this.filterOptions);
        this.filtered.emit({ filteredItems: filtered });
    }
}

@Pipe({
    name: "igxFilter",
    pure: false
})

export class IgxFilterPipe implements PipeTransform {
    transform(items: Array<any>,
        // options - initial settings of filter functionality
        options: IgxFilterOptions) {

        var result = [];

        if (!items || !items.length || !options) {
            return;
        }

        if (options.items) {
            items = options.items;
        }

        result = items.filter((item: any) => {
            let match = options.matchFn(options.formatter(options.get_value(item, options.key)), options.inputValue);

            if (match) {
                if (options.metConditionFn) {
                    options.metConditionFn(item);
                }
            } else {
                if (options.overdueConditionFn) {
                    options.overdueConditionFn(item);
                }
            }

            return match;
        });

        return result;
    }
}

export class IgxFilterOptions {
    // Input text value that will be used as a filtering pattern (matching condition is based on it)
    public inputValue: string = "";

    // Item property, which value should be used for filtering
    public key: string;

    // Represent items of the list. It should be used to handle decalaratevely defined widgets
    public items: Array<any>;

    // Function - get value to be tested from the item
    // item - single item of the list to be filtered
    // key - property name of item, which value should be tested
    // Default behavior - returns "key"- named property value of item if key si provided, otherwise textContent of the item's html element
    public get_value(item: any, key: string): string {
        var result: string = "";

        if (key) {
            result = item[key].toString();
        } else if (item.element && item.element.nativeElement) {
            result = item.element.nativeElement.textContent.trim();
        }

        return result;
    }

	// Function - formats the original text before matching process
	// Default behavior - returns text to lower case
    formatter(valueToTest: string): string {
        return valueToTest.toLowerCase();
	};

	// Function - determines whether the item met the condition
	// valueToTest - text value that should be tested
	// inputValue - text value from input that condition is based on
    // Default behavior - "contains"
    matchFn(valueToTest: string, inputValue: string): boolean {
        return valueToTest.indexOf(inputValue && inputValue.toLowerCase() || "") > -1;
	};

	// Function - executed after matching test for every matched item
	// Default behavior - shows the item
    metConditionFn(item: any) {
        if (item.hasOwnProperty("hidden")) {
            item.hidden = false;
        }
    };

	// Function - executed for every NOT matched item after matching test
	// Default behavior - hides the item
    overdueConditionFn(item: any) {
        if (item.hasOwnProperty("hidden")) {
            item.hidden = true;
        }
    };
}

@NgModule({
    declarations: [IgxFilterDirective, IgxFilterPipe],
    imports: [CommonModule],
    exports: [IgxFilterDirective, IgxFilterPipe]
})
export class IgxFilterModule {
}