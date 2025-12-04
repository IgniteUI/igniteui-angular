import { PipeTransform, Pipe, Inject } from '@angular/core';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';

/** @hidden */
@Pipe({
    name: 'gridDetails',
    standalone: true
})
export class IgxGridDetailsPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any[], hasDetails: boolean, expansionStates: Map<any, boolean>, _pipeTrigger: number) {
        if (!hasDetails) {
            return collection;
        }
        const res = this.addDetailRows(collection, expansionStates);
        return res;
    }

    protected addDetailRows(collection: any[], _expansionStates: Map<any, boolean>) {
        const result = [];
        collection.forEach((v) => {
            result.push(v);
            if (!this.grid.isGroupByRecord(v) && !this.grid.isSummaryRow(v) &&
                this.grid.gridAPI.get_row_expansion_state(v)) {
                const detailsObj = { detailsData: v };
                result.push(detailsObj);
            }
        });
        return result;
    }
}
