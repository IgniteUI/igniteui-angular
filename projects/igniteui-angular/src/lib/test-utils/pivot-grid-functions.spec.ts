import { IPivotGridRecord } from '../grids/pivot-grid/pivot-grid.interface';

export class PivotGridFunctions {

    public static checkUniqueValuesCount(data: any[], value: string, count:number) {
        expect(data.filter(x => x === data).length).toBe(count);
    }

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
