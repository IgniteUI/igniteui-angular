import { PipeTransform, Pipe } from '@angular/core';
import { IGroupByResult } from '../../data-operations/grouping-result.interface';
import { GridBaseAPIService, IgxGridBaseDirective } from '../tree-grid';
import { GridType } from '../common/grid.interface';
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
    public transform(collection: [], hasDetails: boolean, expansionStates:  Map<any, boolean>) {
        if (!hasDetails) {
            return collection;
        }
        const res = this.addDetailRows(collection, expansionStates);
        return res;
    }

    protected addDetailRows(collection: [], expansionStates: Map<any, boolean>) {
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
