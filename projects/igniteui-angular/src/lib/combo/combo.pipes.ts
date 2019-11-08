import { Inject, Pipe, PipeTransform} from '@angular/core';
import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IGX_COMBO_COMPONENT, IgxComboBase } from './combo.common';
import { DefaultSortingStrategy } from '../data-operations/sorting-strategy';


/**
 * @hidden
 */
@Pipe({
    name: 'comboFiltering'
})
export class IgxComboFilteringPipe implements PipeTransform {
    public transform(collection: any[], searchValue: any, displayKey: any, shouldFilter: boolean) {
        if (!collection) {
            return [];
        }
        if (!searchValue || !shouldFilter) {
            return collection;
        } else {
            const searchTerm = searchValue.toLowerCase().trim();
            if (displayKey != null) {
                return collection.filter(e => e[displayKey].toLowerCase().includes(searchTerm));
            } else {
                return collection.filter(e => e.toLowerCase().includes(searchTerm));
            }
        }
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'comboGrouping'
})
export class IgxComboGroupingPipe implements PipeTransform {

    constructor(@Inject(IGX_COMBO_COMPONENT) public combo: IgxComboBase) { }

    public transform(collection: any[], groupKey: any, valueKey: any) {
        this.combo.filteredData = collection;
        if ((!groupKey && groupKey !== 0) || !collection.length) {
            return collection;
        }
        const sorted = DataUtil.sort(cloneArray(collection), [{
            fieldName: groupKey,
            dir: SortingDirection.Asc,
            ignoreCase: true,
            strategy: DefaultSortingStrategy.instance()
        }]);
        const data = cloneArray(sorted);
        let inserts = 0;
        let currentHeader = null;
        for (let i = 0; i < sorted.length; i++) {
            let insertFlag = 0;
            if (currentHeader !== sorted[i][groupKey]) {
                currentHeader = sorted[i][groupKey];
                insertFlag = 1;
            }
            if (insertFlag) {
                data.splice(i + inserts, 0, {
                    [valueKey]: currentHeader,
                    [groupKey]: currentHeader,
                    isHeader: true
                });
                inserts++;
            }
        }
        return data;
    }
}
