import { PipeTransform, Pipe } from '@angular/core';
import { GridType } from '../common/grid.interface';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxGridAPIService } from './grid-api.service';

/** @hidden */
@Pipe({
    name: 'gridDetails',
    pure: true
})
export class IgxGridDetailsPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;
    constructor(gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }
    public transform(collection: any[], hasDetails: boolean, expansionStates:  Map<any, boolean>, pipeTrigger: number) {
        if (!hasDetails) {
            return collection;
        }
        const res = this.addDetailRows(collection, expansionStates);
        return res;
    }

    protected addDetailRows(collection: any[], expansionStates: Map<any, boolean>) {
        const result = [];
        collection.forEach((v) => {
            result.push(v);
            if (!this.gridAPI.grid.isGroupByRecord(v) && !this.gridAPI.grid.isSummaryRow(v) &&
                this.gridAPI.get_row_expansion_state(v)) {
                const detailsObj = { detailsData: v };
                result.push(detailsObj);
            }
        });
        return result;
    }
}
