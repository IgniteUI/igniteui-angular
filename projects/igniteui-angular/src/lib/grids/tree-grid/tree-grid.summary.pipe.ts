import { Pipe, PipeTransform } from '@angular/core';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, GridSummaryPosition, GridSummaryCalculationMode } from '../grid-base.component';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxSummaryResult, ISummaryRecord } from '../summaries/grid-summary';

/** @hidden */
@Pipe({
    name: 'treeGridSummary',
    pure: true
})
export class IgxTreeGridSummaryPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
     }

    public transform(flatData: ITreeGridRecord[],
        hasSummary: boolean,
        summaryCalculationMode: GridSummaryCalculationMode,
        summaryPosition: GridSummaryPosition,
        id: string, pipeTrigger: number): any[] {
        const grid: IgxTreeGridComponent = this.gridAPI.get(id);

        if (!flatData || !hasSummary || summaryCalculationMode === GridSummaryCalculationMode.rootLevelOnly) {
            return flatData;
        }

        return this.addSummaryRows(grid, flatData, summaryPosition);
    }

    private addSummaryRows(grid: IgxTreeGridComponent, collection: ITreeGridRecord[], summaryPosition: GridSummaryPosition): any[] {
        const recordsWithSummary = [];

        for (let i = 0; i < collection.length; i++) {
            const record = collection[i];
            recordsWithSummary.push(record);

            const isExpanded = record.children && record.children.length > 0 && record.expanded;

            if (summaryPosition === GridSummaryPosition.bottom && !isExpanded) {
                let childRecord = record;
                let parent = record.parent;

                while (parent) {
                    const children = parent.children;

                    if (children[children.length - 1] === childRecord ) {
                        const childData = children.filter(r => !r.isFilteredOutParent).map(r => r.data);
                        const summaries = grid.summaryService.calculateSummaries(parent.rowID, childData);
                        const summaryRecord: ISummaryRecord = {
                            summaries: summaries,
                            cellIndentation: parent.level + 1
                        };
                        recordsWithSummary.push(summaryRecord);

                        childRecord = parent;
                        parent = childRecord.parent;
                    } else {
                        break;
                    }
                }
            } else if (summaryPosition === GridSummaryPosition.top && isExpanded) {
                const childData = record.children.map(r => r.data);
                const summaries = grid.summaryService.calculateSummaries(record.rowID, childData);
                const summaryRecord: ISummaryRecord = {
                    summaries: summaries,
                    cellIndentation: record.level + 1
                };
                recordsWithSummary.push(summaryRecord);
            }
        }
        return recordsWithSummary;
    }

}
