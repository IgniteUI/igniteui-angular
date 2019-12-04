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
            if (!this.gridAPI.grid.isGroupByRecord(v) && this.isExpanded(expansionStates, v)) {
                const detailsObj = { detailsData: v };
                result.push(detailsObj);
            }
        });
        return result;
    }
    protected isExpanded(states:  Map<any, boolean>, record: any): boolean {
        const pk = this.gridAPI.grid.primaryKey;
        const rowID = pk ? record[pk] : record;
        return states.get(rowID);
   }
}
