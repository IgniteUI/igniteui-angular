import type { KeyOfOrString } from '../core/types';
import { IBaseEventArgs } from '../core/utils';
import { GridType } from '../grids/common/grid.interface';

/* mustCoerceToInt */
export enum SortingDirection {
    None = 0,
    Asc = 1,
    Desc = 2
}

/* marshalByValue */
/* tsPlainInterface */
export interface ISortingExpression<T = any> extends IBaseEventArgs {
    fieldName: KeyOfOrString<T> & string;
    /* mustCoerceToInt */
    dir: SortingDirection;
    ignoreCase?: boolean;
    strategy?: ISortingStrategy;
}

export interface ISortingStrategy {
    /* blazorSuppress */
    sort: (
        data: any[],
        fieldName: string,
        dir: SortingDirection,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean) => any,
        isDate?: boolean,
        isTime?: boolean,
        grid?: GridType
    ) => any[];
}

export class DefaultSortingStrategy implements ISortingStrategy {
    protected static _instance: DefaultSortingStrategy = null;

    protected constructor() { }

    public static instance(): DefaultSortingStrategy {
        return this._instance || (this._instance = new this());
    }

    /* blazorSuppress */
    public sort(
        data: any[],
        fieldName: string,
        dir: SortingDirection,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean) => any,
        isDate?: boolean,
        isTime?: boolean
    ) {
        const key = fieldName;
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1: any, obj2: any) => this.compareObjects(obj1, obj2, key, reverse, ignoreCase, valueResolver, isDate, isTime);
        return this.arraySort(data, cmpFunc);
    }

    public compareValues(a: any, b: any): number {
        const an = (a === null || a === undefined);
        const bn = (b === null || b === undefined);
        if (an) {
            if (bn) {
                return 0;
            }
            return -1;
        } else if (bn) {
            return 1;
        }
        return a > b ? 1 : a < b ? -1 : 0;
    }

    protected compareObjects(
        obj1: any,
        obj2: any,
        key: string,
        reverse: number,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean, isTime?: boolean) => any,
        isDate: boolean,
        isTime: boolean
    ) {
        let a = valueResolver.call(this, obj1, key, isDate, isTime);
        let b = valueResolver.call(this, obj2, key, isDate, isTime);
        if (ignoreCase) {
            a = a && a.toLowerCase ? a.toLowerCase() : a;
            b = b && b.toLowerCase ? b.toLowerCase() : b;
        }
        return reverse * this.compareValues(a, b);
    }

    protected arraySort(data: any[], compareFn?: (arg0: any, arg1: any) => number): any[] {
        return data.sort(compareFn);
    }
}

export class GroupMemberCountSortingStrategy implements ISortingStrategy {
    protected static _instance: GroupMemberCountSortingStrategy = null;

    protected constructor() { }

    public static instance(): GroupMemberCountSortingStrategy {
        return this._instance || (this._instance = new this());
    }

    public sort(data: any[], fieldName: string, dir: SortingDirection) {
        const groupedArray = this.groupBy(data, fieldName);
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);

        const cmpFunc = (a, b) => {
            return this.compareObjects(a, b, groupedArray, fieldName, reverse);
        };

        return data
            .sort((a, b) => a[fieldName].localeCompare(b[fieldName]))
            .sort(cmpFunc);
    }

    public groupBy(data, key) {
        return data.reduce((acc, curr) => {
            (acc[curr[key]] = acc[curr[key]] || []).push(curr);
            return acc;
        }, {})
    }

    protected compareObjects(obj1: any, obj2: any, data: any[], fieldName: string, reverse: number) {
        const firstItemValuesLength = data[obj1[fieldName]].length;
        const secondItemValuesLength = data[obj2[fieldName]].length;

        return reverse * (firstItemValuesLength - secondItemValuesLength);
    }
}

export class FormattedValuesSortingStrategy extends DefaultSortingStrategy {
    protected static override _instance: FormattedValuesSortingStrategy = null;

    constructor() {
        super();
    }

    public static override instance(): FormattedValuesSortingStrategy {
        return this._instance || (this._instance = new this());
    }

    public override sort(
        data: any[],
        fieldName: string,
        dir: SortingDirection,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean) => any,
        isDate?: boolean,
        isTime?: boolean,
        grid?: GridType
    ) {
        const key = fieldName;
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1: any, obj2: any) => this.compareObjects(obj1, obj2, key, reverse, ignoreCase, valueResolver, isDate, isTime, grid);
        return this.arraySort(data, cmpFunc);
    }

    protected override compareObjects(
        obj1: any,
        obj2: any,
        key: string,
        reverse: number,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean, isTime?: boolean) => any,
        isDate: boolean,
        isTime: boolean,
        grid?: GridType
    ) {
        let a = valueResolver.call(this, obj1, key, isDate, isTime);
        let b = valueResolver.call(this, obj2, key, isDate, isTime);

        if (grid) {
            const col = grid.getColumnByName(key);
            if (col && col.formatter) {
                a = col.formatter(a);
                b = col.formatter(b);
            }
        }

        if (ignoreCase) {
            a = a && a.toLowerCase ? a.toLowerCase() : a;
            b = b && b.toLowerCase ? b.toLowerCase() : b;
        }
        return reverse * this.compareValues(a, b);
    }
}
