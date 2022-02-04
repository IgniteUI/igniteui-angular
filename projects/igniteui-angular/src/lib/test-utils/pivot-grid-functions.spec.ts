import { DEFAULT_PIVOT_KEYS, IPivotDimension } from '../grids/pivot-grid/pivot-grid.interface';
import { PivotUtil } from '../grids/pivot-grid/pivot-util';

export class PivotGridFunctions {
    /* Extract the value populated for each record for the given dimension and its children.*/
    public static getDimensionData(data: any[], dimensions: IPivotDimension[]) {
       return data.map(x => {
           const obj = {};
            for (let dim of dimensions) {
                const dimData = PivotUtil.getDimensionLevel(dim, x, DEFAULT_PIVOT_KEYS);
                const field = dimData.dimension.memberName;
                const value = x[field];
                obj[field] = value;
            }
            return obj;
       });
    }

    public static checkUniqueValuesCount(data: any[], value: string, count:number) {
        expect(data.filter(x => x === data).length).toBe(count);
    }
}