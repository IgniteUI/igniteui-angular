import { Inject, Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { DefaultSortingStrategy, SortingDirection } from '../data-operations/sorting-strategy';
import { IComboFilteringOptions, IgxComboBase, IGX_COMBO_COMPONENT } from './combo.common';

/** @hidden */
@Pipe({
    name: 'comboFiltering',
    standalone: true
})
export class IgxComboFilteringPipe implements PipeTransform {
    public transform(
        collection: any[],
        searchValue: any,
        displayKey: any,
        filteringOptions: IComboFilteringOptions,
        filterFunction: (collection: any[], searchValue: any, filteringOptions: IComboFilteringOptions) => any[] = defaultFilterFunction) {
        if (!collection) {
            return [];
        }
        if (!filteringOptions.filterable) {
            return collection;
        }
        filteringOptions.filteringKey = filteringOptions.filteringKey ?? displayKey;
        return filterFunction(collection, searchValue, filteringOptions);
    }
}

/** @hidden */
@Pipe({
    name: 'comboGrouping',
    standalone: true
})
export class IgxComboGroupingPipe implements PipeTransform {

    constructor(@Inject(IGX_COMBO_COMPONENT) public combo: IgxComboBase) { }

    public transform(collection: any[], groupKey: any, valueKey: any, sortingDirection: SortingDirection) {
        // TODO: should filteredData be changed here?
        this.combo.filteredData = collection;
        if ((!groupKey && groupKey !== 0) || !collection.length) {
            return collection;
        }
        const sorted = DataUtil.sort(cloneArray(collection), [{
            fieldName: groupKey,
            dir: sortingDirection,
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

function defaultFilterFunction<T>(collection: T[], searchValue: string, filteringOptions: IComboFilteringOptions): T[] {
    if (!searchValue) {
        return collection;
    }

    const { caseSensitive, filteringKey } = filteringOptions;
    const term = caseSensitive ? searchValue : searchValue.toLowerCase();

    return collection.filter(item => {
        const str = filteringKey ? `${item[filteringKey]}` : `${item}`;
        return (caseSensitive ? str : str.toLowerCase()).includes(term);
    });
}

function normalizeString(str: string, caseSensitive = false): string {
    return (caseSensitive ? str : str.toLocaleLowerCase())
        .normalize('NFKD')
        .replace(/\p{M}/gu, '');
}

/**
 * Combo filter function which does not distinguish between accented letters and their base letters.
 * For example, when filtering for "resume", this function will match both "resume" and "résumé".
 *
 * @example
 * ```html
 * <igx-combo [filterFunction]="comboIgnoreDiacriticFilterFunction"></igx-combo>
 * ```
 */
export function comboIgnoreDiacriticsFilter<T>(collection: T[], searchValue: string, filteringOptions: IComboFilteringOptions): T[] {
    if (!searchValue) {
        return collection;
    }

    const { caseSensitive, filteringKey } = filteringOptions;
    const term = normalizeString(searchValue, caseSensitive);

    return collection.filter(item => {
        const str = filteringKey ? `${item[filteringKey]}` : `${item}`;
        return normalizeString(str, caseSensitive).includes(term);
    });
}
