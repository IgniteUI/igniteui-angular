import { Pipe, PipeTransform } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent } from '../grid-base.component';
import { DataUtil } from '../../data-operations/data-util';
import { cloneArray } from '../../core/utils';
import { GridType } from './grid.interface';
import { DatePipe, DecimalPipe } from '@angular/common';

/**
 * @hidden
 * @internal
 */
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

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxTopLevel'
})
export class IgxGridTopLevelColumns implements PipeTransform {

    transform(value: any[]): any[] {
        return value.filter(item => item.level === 0);
    }
}

/**
 * @hidden
 * @internal
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

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'gridTransaction',
    pure: true
})
export class IgxGridTransactionPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent & GridType>) { }

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

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'paginatorOptions',
    pure: true,
})
export class IgxGridPaginatorOptionsPipe implements PipeTransform {
    public transform(values: Array<number>) {
        return Array.from(new Set([...values])).sort((a, b) => a - b);
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'visibleColumns',
    pure: true
})
export class IgxHasVisibleColumnsPipe implements PipeTransform {
    transform(values: any[], hasVisibleColumns) {
        if (!(values && values.length)) {
            return values;
        }
        return hasVisibleColumns ? values : [];
    }

}


/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxdate'
})
export class IgxDatePipeComponent extends DatePipe implements PipeTransform {

    private readonly DEFAULT_DATE_FORMAT = 'mediumDate';

    // constructor(@Inject(LOCALE_ID) locale: string) {
    //     // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
    //     super(locale);
    // }
    transform(value: any, locale: string): string {
        if (value && value instanceof Date) {
            if (locale) {
                return super.transform(value, this.DEFAULT_DATE_FORMAT, undefined, locale);
            } else {
                return super.transform(value);
            }
        } else {
            return value;
        }
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxdecimal'
})
export class IgxDecimalPipeComponent extends DecimalPipe implements PipeTransform {
    // constructor(@Inject(LOCALE_ID) locale: string) {
    //     // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
    //     super(locale);
    // }
    transform(value: any, locale: string): string {
        if (value && typeof value === 'number') {
            if (locale) {
                return super.transform(value, undefined, locale);
            } else {
                return super.transform(value);
            }
        } else {
            return value;
        }
    }
}
