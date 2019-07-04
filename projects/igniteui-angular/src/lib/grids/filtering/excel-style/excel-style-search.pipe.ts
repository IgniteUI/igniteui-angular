import { Pipe, PipeTransform } from '@angular/core';
import { FilterListItem } from './grid.excel-style-filtering.component';

/**
 * @hidden
 */
@Pipe({
    name: 'excelStyleSearchFilter'
})
export class IgxExcelStyleSearchFilterPipe implements PipeTransform {
    transform(items: FilterListItem[], searchText: string): any[] {
        if (!items || !items.length) {
            return [];
        }

        if (!searchText) {
            return items;
        }

        searchText = searchText.toLowerCase();
        const result = items.filter((it, i) => (i === 0 && it.isSpecial) ||
            (it.value || it.value === 0) &&
            it.value.toString().toLowerCase().indexOf(searchText) > -1);

        return result.length > 1 ? result : [];
    }
}
