import { parseDate } from '../core/utils';
import { PivotGridType } from '../grids/common/grid.interface';
import { IPivotGridRecord } from '../grids/pivot-grid/pivot-grid.interface';
import { PivotUtil } from '../grids/pivot-grid/pivot-util';
import { GridColumnDataType } from './data-util';
import { DefaultSortingStrategy, SortingDirection } from './sorting-strategy';

export class DefaultPivotGridRecordSortingStrategy extends DefaultSortingStrategy {
    protected static override _instance: DefaultPivotGridRecordSortingStrategy = null;
    public static override instance(): DefaultPivotGridRecordSortingStrategy {
        return this._instance || (this._instance = new this());
    }
    public override sort(data: any[],
        fieldName: string,
        dir: SortingDirection,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean) => any,
        isDate?: boolean,
        isTime?: boolean,
        _grid?: PivotGridType) {
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => this.compareObjects(obj1, obj2, fieldName, reverse, ignoreCase, this.getFieldValue, isDate, isTime);
        return this.arraySort(data, cmpFunc);
    }

    protected getFieldValue(obj: IPivotGridRecord, key: string, _isDate = false, _isTime = false): any {
        return obj.aggregationValues.get(key);
    }
}


export class DefaultPivotSortingStrategy extends DefaultSortingStrategy {
    protected static override _instance: DefaultPivotSortingStrategy = null;
    protected dimension;
    public static override instance(): DefaultPivotSortingStrategy {
        return this._instance || (this._instance = new this());
    }
    public override sort(data: any[],
        fieldName: string,
        dir: SortingDirection,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean) => any,
        isDate?: boolean,
        isTime?: boolean,
        grid?: PivotGridType) {
        const key = fieldName;
        const allDimensions = grid.allDimensions;
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        this.dimension = PivotUtil.flatten(enabledDimensions).find(x => x.memberName === key);
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => this.compareObjects(obj1, obj2, key, reverse, ignoreCase, this.getFieldValue, isDate, isTime);
        return this.arraySort(data, cmpFunc);
    }

    protected getFieldValue(obj: any, key: string, _isDate = false, isTime = false): any {
        let resolvedValue = PivotUtil.extractValueFromDimension(this.dimension, obj) || obj[0];
        const formatAsDate = this.dimension.dataType === GridColumnDataType.Date || this.dimension.dataType === GridColumnDataType.DateTime;
        if (formatAsDate) {
            const date = parseDate(resolvedValue);
            resolvedValue = isTime && date ?
                new Date().setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()) : date;

        }
        return resolvedValue;
    }
}
