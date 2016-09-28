import { Directive, Pipe, PipeTransform, NgModule, Output, EventEmitter, ElementRef, Renderer, Input, Host, Optional, ContentChildren, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { List, ListItem } from "./list"

@Directive({
    selector: '[filter]',
})
export class FilterDirective implements OnChanges {
    @Output() filtering = new EventEmitter(false); // synchronous event emitter
    @Output() filtered = new EventEmitter();

    @Input("filter") inputValue: string;
    @ContentChildren(ListItem) items: any;

    list: List;

    constructor( @Optional() @Host() parent: List) {
        this.list = parent;

        this.inputValue = this.inputValue || "";
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.items) {
            this.filter();
        }    
    }

    filter() {
        var pipe = new FilterPipe();
        var fo = new FilterOptions();

        fo.get_value = (item: Object) => {
            return item.element.nativeElement.textContent.trim();
        };

        fo.metConditionFn = (item: Object) => {
            item.element.nativeElement.hidden = false;
        };

        fo.overdueConditionFn = (item: Object) => {
            item.element.nativeElement.hidden = true;
        };

        var filtered = pipe.transform(this.items.toArray(), fo, this.inputValue);
    }
}

@Pipe({
    name: "filter",
    pure: false
})

export class FilterPipe implements PipeTransform {
    transform(
                items: Object[],
				// options - initial settings of filter functionality
				options: FilterOptions,
				// inputValue - text value from input that condition is based on
				inputValue: string) {

		var result = [];

        if (!items || !items.length) {
            return;
        }

        if (!inputValue) {
            inputValue = "";
        }

        result = items.filter((item: Object) => {
            let match = options.matchFn(options.formatter(options.get_value(item, options.key)), inputValue);

			if(match) {
				if(options.metConditionFn) {
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

export class FilterOptions {
    // Item property, which value should be used for filtering
    public key: string;

    // Function - get value to be tested from the item
    // item - single item of the list to be filtered
    // key - property name of item, which value should be tested
    // Default behavior - returns "key"- named property value of item 
    public get_value(item: Object, key: string): string {
        var result: string = "";

        if (key) {
            result = item[key];
        } else {
            var objKeys = Object.keys(item);

            if (objKeys.length) {
                result = item[objKeys[0]];
            }
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
        return valueToTest.indexOf(inputValue.toLowerCase()) > -1;
	};

	// Function - executed after matching test for every matched item
	// Default behavior - none
    metConditionFn(item: Object) { };

	// Function - executed for every NOT matched item after matching test
	// Default behavior - none
    overdueConditionFn(item: Object) { };
}

@NgModule({
    declarations: [FilterDirective, FilterPipe],
    imports: [CommonModule],
    exports: [FilterDirective, FilterPipe]
})
export class FilterModule {
}