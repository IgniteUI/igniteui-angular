import { Pipe, PipeTransform } from '@angular/core';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent } from '../grid-base.component';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridComponent } from './tree-grid.component';

/** @hidden */
@Pipe({
    name: 'treeGridSummaries',
    pure: true
})
export class IgxTreeGridFilteringPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
     }

    public transform(hierarchyData: ITreeGridRecord[],
        id: string, pipeTrigger: number): ITreeGridRecord[] {
        const grid: IgxTreeGridComponent = this.gridAPI.get(id);

        return hierarchyData;
    }

}
