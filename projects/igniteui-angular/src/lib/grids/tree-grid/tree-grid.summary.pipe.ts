import { Pipe, PipeTransform } from '@angular/core';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, GridSummaryPosition, GridSummaryCalculationMode } from '../grid-base.component';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxSummaryResult } from '../summaries/grid-summary';

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

    public transform(flatData: ITreeGridRecord[], summaryCalculationMode: GridSummaryCalculationMode,
        summaryPosition: GridSummaryPosition,
        id: string, pipeTrigger: number): any[] {
        const grid: IgxTreeGridComponent = this.gridAPI.get(id);

        if (!flatData || summaryCalculationMode === GridSummaryCalculationMode.rootLevelOnly) {
            return flatData;
        }

        return this.addSummaryRows(grid, flatData, summaryPosition);
    }

    private addSummaryRows(grid: IgxTreeGridComponent, collection: ITreeGridRecord[], summaryPosition: GridSummaryPosition): any[] {
        const recordsWithSummary = [];
        const summariesMap = new Map<any, Map<string, IgxSummaryResult[]>[]>();

        for (let i = 0; i < collection.length; i++) {
            const record = collection[i];
            recordsWithSummary.push(record);

            if (record.children && record.children.length > 0 && record.expanded) {
                const childData = record.children.map(r => r.data);
                const summaries = grid.summaryService.calculateSummaries(record.rowID, childData);

                if (summaries) {
                    if (summaryPosition === GridSummaryPosition.top) {
                        recordsWithSummary.push(summaries);
                    } else if (summaryPosition === GridSummaryPosition.bottom) {
                        let lastChild = record;
                        do {
                            lastChild = lastChild.children[lastChild.children.length - 1];
                        }
                        while (lastChild.children && lastChild.children.length > 0 && lastChild.expanded);

                        let summaryRows = summariesMap.get(lastChild.rowID);
                        if (!summaryRows) {
                            summaryRows = [];
                            summariesMap.set(lastChild.rowID, summaryRows);
                        }
                        summaryRows.unshift(summaries);
                    }
                }
            }

            if (summaryPosition === GridSummaryPosition.bottom && summariesMap.has(record.rowID)) {
                const summaryRows = summariesMap.get(record.rowID);

                for (let j = 0; j < summaryRows.length; j++) {
                    const summaryRow = summaryRows[j];
                    recordsWithSummary.push(summaryRow);
                }
            }
        }

        return recordsWithSummary;
    }

}
