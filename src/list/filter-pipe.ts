import { Pipe, PipeTransform  } from "@angular/core";
//import { ListItem } from './items';

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

		//if(!options.items || !options.items.length) {
		//	return;
  //      }

        if (!items || !items.length) {
            return;
        }

        //result = options.items.filter((item: Object) => {
        result = items.filter((item: Object) => {
            let match = options.matchFn(options.formatter(
                //this.get_filteringValue(item, options.elementSelector)), inputValue);
                this.get_value(item, options.key)), inputValue);

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
	// List item collection that will be filtered
    //public items: Object[];

    // item property, which value should be used for filtering
    public key: string;

	// function - select the element which text will be test to match the condition
	// default behavior - gets the native elemnt of the item
	//elementSelector(item: ListItem) {
	//	return item.element.nativeElement;
	//};

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

	// function - executed on each item that met the condition
	// Default behavior - shows item if hidden
    metConditionFn() {        
        //item.hidden = false;        
        //item.element.nativeElement.style.display = "";
	};

	// function - executed on each item that does not met the condition
	// Default behavior - hides item
    overdueConditionFn() {
        //item.hidden = true;
        //item.element.nativeElement.style.display = "none";
	};
}