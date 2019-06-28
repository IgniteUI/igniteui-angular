import { Pipe, PipeTransform } from '@angular/core';
import { GridBaseAPIService } from './api.service';
import { IgxGridBaseComponent, IGridDataBindable } from './grid-base.component';
import { DataUtil } from '../data-operations/data-util';
import { cloneArray } from '../core/utils';

@Pipe({
    name: 'igxCellStyles'
})
export class IgxGridCellStylesPipe implements PipeTransform {

    transform(cssClasses: any, _value: any, data: any, field: string): string {
        if (!cssClasses) {
            return '';
        }

        const result = [];

        for (const cssClass of Object.keys(cssClasses)) {
            const callbackOrValue = cssClasses[cssClass];
            const apply = typeof callbackOrValue === 'function' ? callbackOrValue(data, field) : callbackOrValue;
            if (apply) {
                result.push(cssClass);
            }
        }

        return result.join(' ');
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxNotGrouped'
})
export class IgxGridNotGroupedPipe implements PipeTransform {

    transform(value: any[]): any[] {
        return value.filter(item => !item.columnGroup);
    }
}

@Pipe({
    name: 'igxTopLevel'
})
export class IgxGridTopLevelColumns implements PipeTransform {

    transform(value: any[]): any[] {
        return value.filter(item => item.level === 0);
    }
}
/**
 *@hidden
 */
@Pipe({
    name: 'filterCondition',
    pure: true
})
export class IgxGridFilterConditionPipe implements PipeTransform {

    public transform(value: string): string {
        return value.split(/(?=[A-Z])/).join(' ');
    }
}

/** @hidden */
@Pipe({
    name: 'gridTransaction',
    pure: true
})
export class IgxGridTransactionPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) { }

    transform(collection: any[], id: string, pipeTrigger: number) {
        const grid: IgxGridBaseComponent = this.gridAPI.grid;

        if (collection && grid.transactions.enabled) {
            const result = DataUtil.mergeTransactions(
                cloneArray(collection),
                grid.transactions.getAggregatedChanges(true),
                grid.primaryKey);
            return result;
        }
        return collection;
    }
}

/** @hidden */
@Pipe({
    name: 'paginatorOptions',
    pure: true,
})
export class IgxGridPaginatorOptionsPipe implements PipeTransform {
    public transform(values: Array<number>) {
        return Array.from(new Set([...values])).sort((a, b) => a - b);
    }
}
