import { Directive, Pipe, PipeTransform, NgModule, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

@Directive({
    selector: 'filter',
})
export class FilterDirective {
    @Output() filtering = new EventEmitter(false); // synchronous event emitter
    @Output() filtered = new EventEmitter();
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
            let match = options.matchFn(options.formatter(this.get_value(item, options.key)), inputValue);

			if(match) {
				if(options.metConditionFn) {
					options.metConditionFn();
				}
			} else {
				if (options.overdueConditionFn) {
					options.overdueConditionFn();
				}
			}

			return match;
		});

		return result;
	}

    private get_value(item: Object, key: string): string {
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
}

export class FilterOptions {
    // item property, which value should be used for filtering
    public key: string;

	// function - formats the original text before matching process
	// Default behavior - returns text to lower case
	formatter(text: string) {
		return text.toLowerCase();
	};

	// function - determines whether the item met the condition
	// filteringValue - text value the should be tested
	// inputValue - text value from input that condition is based on
	// Default behavior - "contains"
	matchFn(filteringValue: string, inputValue: string) {
		return filteringValue.indexOf(inputValue.toLowerCase()) > -1;
	};

	// function - executed after matching each item
	// Default behavior - none
    metConditionFn() { };

	// function - executed after NOT matching each item
	// Default behavior - none
    overdueConditionFn() { };
}

@NgModule({
    declarations: [FilterDirective, FilterPipe],
    imports: [CommonModule],
    exports: [FilterDirective, FilterPipe]
})
export class FilterModule {
}