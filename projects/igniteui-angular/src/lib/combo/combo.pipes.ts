import { Pipe, PipeTransform, Inject } from '@angular/core';
import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IFilteringState } from '../data-operations/filtering-state.interface';
import { FilteringStrategy } from '../data-operations/filtering-strategy';
import { FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IGX_COMBO_COMPONENT, IgxComboBase } from './combo.common';


/**
 * @hidden
 */
@Pipe({
    name: 'comboFiltering'
})
export class IgxComboFilteringPipe implements PipeTransform {
    public transform(collection: any[], expressions: IFilteringExpression[],
                     logic: FilteringLogic) {
        const filteringExpressionsTree =  new FilteringExpressionsTree(logic);
        filteringExpressionsTree.filteringOperands = expressions;
        const state: IFilteringState = { expressionsTree: filteringExpressionsTree, strategy: new SimpleFilteringStrategy()};

        if (!state.expressionsTree.filteringOperands.length) {
            return collection;
        }

        const result = DataUtil.filter(cloneArray(collection), state);
        return result;
    }
}

/** @hidden */
export class SimpleFilteringStrategy extends FilteringStrategy {
    public findMatchByExpression(rec: object, expr: IFilteringExpression): boolean {
        const cond = expr.condition;
        const val = expr.fieldName === undefined ? rec : rec[expr.fieldName];
        return cond.logic(val, expr.searchVal, expr.ignoreCase);
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'comboSorting',
    pure: true
})
export class IgxComboSortingPipe implements PipeTransform {
    public transform(collection: any[], expressions: ISortingExpression []) {
        if (!expressions.length) {
            return collection;
        }
        const result = DataUtil.sort(cloneArray(collection), expressions);
        return result;
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
        const data = cloneArray(collection);
        let inserts = 0;
        let currentHeader = null;
        for (let i = 0; i < collection.length; i++) {
            let insertFlag = 0;
            if (currentHeader !== collection[i][groupKey]) {
                currentHeader = collection[i][groupKey];
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
