import { Pipe } from "@angular/core"

@Pipe({
	name: "contains"
})

export class ContainsPipe{
	transform(value: any, pattern: string, isCaseSensitive: boolean, metConditionFunction: any, overdueConditionFunction: any) {
		var result = value;

		result = value.filter((item) => {
				var innerText = item.element.nativeElement.textContent,
					expression = innerText.indexOf(pattern) > -1;

				if(!isCaseSensitive) {
					expression = innerText.toLowerCase().indexOf(pattern.toLowerCase()) > -1;
				}

				if(expression) {
					if(metConditionFunction) {
						metConditionFunction(item);						
					}						
				} else {
					if (overdueConditionFunction) {
						overdueConditionFunction(item);
					}
				}

				return expression;
			});

		return result;
	}
}