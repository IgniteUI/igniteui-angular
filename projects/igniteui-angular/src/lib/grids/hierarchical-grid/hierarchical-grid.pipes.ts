import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { IGroupByResult } from '../../data-operations/sorting-strategy';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
/**
 *@hidden
 */
@Pipe({
    name: 'gridHierarchical',
    pure: true
})
export class IgxGridHierarchicalPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>) { }

    public transform(
        collection: IGroupByResult,
        state = [],
        id: string,
        primaryKey: any,
        childKey: string,
        pipeTrigger: number
        ): IGroupByResult {
        if (!childKey) {
            return collection;
        }
        const result: IGroupByResult = {
            data: DataUtil.addHierarchy(cloneArray(collection.data), state, primaryKey, childKey),
            metadata: DataUtil.addHierarchy(cloneArray(collection.metadata), state, primaryKey, childKey)
        };
        return result;
    }
}
