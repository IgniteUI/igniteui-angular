import { Pipe, PipeTransform } from '@angular/core';
import { FilterListItem, IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';
import { cloneArray } from '../../../core/utils';

/**
 * @hidden
 */
@Pipe({
    name: 'excelStyleSearchFilter'
})
export class IgxExcelStyleSearchFilterPipe implements PipeTransform {

    constructor(private esf: IgxGridExcelStyleFilteringComponent) { }

    transform(items: FilterListItem[], searchText: string): any[] {
        if (!items || !items.length) {
            return [];
        }

        if (!searchText) {
            if (this.esf.excelStyleSearch) {
                this.esf.excelStyleSearch.filteredData = null;
            }
            return items;
        }

        searchText = searchText.toLowerCase();
        const result = items.filter((it, i) => (i === 0 && it.isSpecial) ||
            (it.value !== null && it.value !== undefined) &&
            it.value.toString().toLowerCase().indexOf(searchText) > -1);

        // If 'result' contains the 'Select All' item and at least one more, we use it as a 'finalResult',
        // otherwise we use an empty array as a 'finalResult' of the filtering.
        const finalResult = result.length > 1 ? result : [];

        // Update the filteredData of the search component.
        if (this.esf.excelStyleSearch) {
            this.esf.excelStyleSearch.filteredData = cloneArray(finalResult);
            this.esf.cdr.detectChanges();
        }

        return finalResult;
    }
}
