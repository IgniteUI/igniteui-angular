import { Pipe, PipeTransform } from '@angular/core';
import { FilterListItem, IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';
import { IgxExcelStyleSearchComponent } from './excel-style-search.component';
import { cloneArray } from '../../../core/utils';

/**
 * @hidden
 */
@Pipe({
    name: 'excelStyleSearchFilter'
})
export class IgxExcelStyleSearchFilterPipe implements PipeTransform {

    constructor(private excelStyleSearch: IgxExcelStyleSearchComponent,
                private esf: IgxGridExcelStyleFilteringComponent) { }

    transform(items: FilterListItem[], searchText: string): any[] {
        if (!items || !items.length) {
            return [];
        }

        if (!searchText) {
            this.excelStyleSearch.filteredData = cloneArray(items);
            return items;
        }

        searchText = searchText.toLowerCase();
        const result = items.filter((it, i) => (i === 0 && it.isSpecial) ||
            (it.value || it.value === 0) &&
            it.value.toString().toLowerCase().indexOf(searchText) > -1);

        // If 'result' contains the 'Select All' item and at least one more, we use it as a 'finalResult',
        // otherwise we use an empty array as a 'finalResult' of the filtering.
        const finalResult = result.length > 1 ? result : [];

        // Update the filteredData of the search component.
        this.excelStyleSearch.filteredData = cloneArray(finalResult);
        this.esf.cdr.detectChanges();

        return finalResult;
    }
}
