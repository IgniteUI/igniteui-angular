import { Pipe, PipeTransform } from '@angular/core';
import { GridBaseAPIService } from './api.service';
import { IgxGridBaseComponent, IGridDataBindable } from './grid-base.component';
import { DataUtil } from '../data-operations/data-util';
import { cloneArray } from '../core/utils';

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
