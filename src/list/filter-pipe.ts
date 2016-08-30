import { Pipe } from "@angular/core";
import { ListItem } from './items';

@Pipe({
	name: "filter"
})

export class FilterPipe{
	transform(
				// options - initial settings of filter functionality
				options: FilterOptions, 
				// inputValue - text value from input that condition is based on
				inputValue: string) {

		var result = [];		

		if(!options.items || !options.items.length) {
			return;
		}

		result = options.items.filter((item: ListItem) => {
			let match = options.matchFn(options.formatter(this.get_filteringValue(item, options.elementSelector)), inputValue);

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

	// Get text from filteringValue if exists or from textContent of DOM element
	private get_filteringValue(item: ListItem, elementSelector: any) : string {
		return item.filteringValue ? item.filteringValue : elementSelector(item).textContent;
	}
}

export class FilterOptions {
	// List item collection that will be filtered
	public items: ListItem[]

	// function - select the element which text will be test to match the condition
	// default behavior - gets the native elemnt of the item
	elementSelector(item: ListItem) {
		return item.element.nativeElement; 
	};

	// function - formats the original text before matching process
	// Default behavior - returns the unchanged text
	formatter(text: string) { 
		return text; 
	};	

	// function - determines whether the item met the condition
	// filteringValue - text value the should be tested
	// inputValue - text value from input that condition is based on
	// Default behavior - always met the condition
	matchFn(filteringValue: string, inputValue: string) { 
		return true; 
	};	

	// function - executed on each item that met the condition
	// Default behavior - shows item if hidden 
	metConditionFn(item: ListItem) { 
		item.hidden = false; 
	};

	// function - executed on each item that does not met the condition
	// Default behavior - hides item
	overdueConditionFn(item: ListItem) { 
		item.hidden = true; 
	};
}