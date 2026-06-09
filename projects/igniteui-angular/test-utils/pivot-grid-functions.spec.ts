import { IPivotGridRecord } from 'igniteui-angular/grids/core';

export class PivotGridFunctions {
    public static getDimensionValues(records: IPivotGridRecord[]) {
        return records.map(x => this.transformMapToObject(x.dimensionValues));
    }

    public static getAggregationValues(records: IPivotGridRecord[]) {
        return records.map(x => this.transformMapToObject(x.aggregationValues));
    }
    public static transformMapToObject(map: Map<string, any>) {
        const obj = {};
        map.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
}
