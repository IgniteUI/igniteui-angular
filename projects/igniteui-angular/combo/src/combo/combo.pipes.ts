import { Pipe, PipeTransform, inject } from '@angular/core';
import { VirtualDataWindow } from 'igniteui-angular/virtual-scroll';
import { IComboFilteringOptions, IgxComboBase, IGX_COMBO_COMPONENT } from './combo.common';
import { SortingDirection } from 'igniteui-angular/core';

/**
 * @hidden @internal
 * Keeps the loaded records inside the remote total without changing their indices.
 * Runs before grouping, so headers do not count against the number of remote records.
 */
@Pipe({
    name: 'comboRecordWindow'
})
export class IgxComboRecordWindowPipe implements PipeTransform {
    public transform(collection: any[], totalItemCount: number, startIndex: number): any[] {
        const remaining = Math.max(0, totalItemCount - startIndex);
        return totalItemCount > 0 && collection.length > remaining
            ? collection.slice(0, remaining)
            : collection;
    }
}

/**
 * @hidden @internal
 * The items the drop-down has and where they sit in the collection they came from. Pure, so
 * the window keeps its identity while its inputs do.
 */
@Pipe({
    name: 'comboDataWindow',
    standalone: true
})
export class IgxComboDataWindowPipe implements PipeTransform {
    public transform(
        collection: any[], totalItemCount: number, startIndex: number
    ): VirtualDataWindow<any> {
        if (!(totalItemCount > 0)) {
            return { items: collection, startIndex: 0, totalCount: collection.length };
        }

        // An empty page has no position of its own, and anchoring one would stretch the
        // collection to reach it.
        return { items: collection, startIndex: collection.length ? startIndex : 0, totalCount: totalItemCount };
    }
}



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
        filterFunction: (collection: any[], searchValue: any, filteringOptions: IComboFilteringOptions) => any[] = defaultFilterFunction,
        disableFiltering: boolean = false) {
        if (!collection) {
            return [];
        }
        if (disableFiltering) {
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
    public combo = inject<IgxComboBase>(IGX_COMBO_COMPONENT);


    public transform(collection: any[], groupKey: any, valueKey: any, sortingDirection: SortingDirection, compareCollator: Intl.Collator) {
        // TODO: should filteredData be changed here?
        this.combo.filteredData = collection;
        if ((!groupKey && groupKey !== 0) || !collection.length) {
            return collection;
        }
        const groups = Object.entries(groupBy(collection, (item) => item[groupKey] ?? 'Other'));
        if (sortingDirection !== SortingDirection.None) {
            const reverse = sortingDirection === SortingDirection.Desc ? -1 : 1;
            groups.sort((a,b) => {
                return compareCollator.compare(a[0], b[0]) * reverse;
            });
        }
        const result = groups.flatMap(([_, items]) => {
            items.unshift({
                isHeader: true,
                [valueKey]: items[0][groupKey],
                [groupKey]: items[0][groupKey]
            })
            return items;
        });
        return result;
    }
}

function defaultFilterFunction<T>(collection: T[], searchValue: string, filteringOptions: IComboFilteringOptions): T[] {
    if (!searchValue) {
        return collection;
    }

    const { caseSensitive, filteringKey } = filteringOptions;
    const term = caseSensitive ? searchValue : searchValue.toLowerCase();

    return collection.filter(item => {
        const str = filteringKey ? `${(item as any)[filteringKey]}` : `${item}`;
        return (caseSensitive ? str : str.toLowerCase()).includes(term);
    });
}

function normalizeString(str: string, caseSensitive = false): string {
    return (caseSensitive ? str : str.toLocaleLowerCase())
        .normalize('NFKD')
        .replace(/\p{M}/gu, '');
}

function groupBy<T>(data: T[], key: keyof T | ((item: T) => any)) {
    const result: Record<string, T[]> = {};
    const _get = typeof key === 'function' ? key : (item: T) => item[key];

    for (const item of data) {
      const category = _get(item);
      const group = result[category];

      Array.isArray(group) ? group.push(item) : (result[category] = [item]);
    }

    return result;
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
        const str = filteringKey ? `${(item as any)[filteringKey]}` : `${item}`;
        return normalizeString(str, caseSensitive).includes(term);
    });
}
