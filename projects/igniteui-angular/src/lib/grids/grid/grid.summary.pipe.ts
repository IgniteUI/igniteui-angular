import { Pipe, PipeTransform } from '@angular/core';
import { IgxGridAPIService } from './grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, GridSummaryPosition, GridSummaryCalculationMode } from '../grid-base.component';
import { IgxGridComponent } from './grid.component';
import { IgxSummaryResult } from '../summaries/grid-summary';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { DataUtil } from '../../data-operations/data-util';

/** @hidden */
@Pipe({
    name: 'gridSummary',
    pure: true
})
export class IgxGridSummaryPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    public transform(flatData: any[], summaryCalculationMode: GridSummaryCalculationMode,
        summaryPosition: GridSummaryPosition,
        id: string, pipeTrigger: number): any[] {

        if (summaryCalculationMode === GridSummaryCalculationMode.rootLevelOnly) {
            return flatData;
        }

        return this.addSummaryRows(id, flatData, summaryPosition);
    }

    private addSummaryRows(gridId: string, collection: any[], summaryPosition: GridSummaryPosition): any[] {
        const recordsWithSummary = [];
        const summariesMap = new Map<any, Map<string, IgxSummaryResult[]>[]>();
        const grid: IgxGridComponent = this.gridAPI.get(gridId);

        for (let i = 0; i < collection.length; i++) {
            const record = collection[i];
            recordsWithSummary.push(record);

            let recordId;
            let groupByRecord: IGroupByRecord = null;

            if (grid.isGroupByRecord(record)) {
                groupByRecord = record as IGroupByRecord;
                recordId = this.gridAPI.get_groupBy_record_id(groupByRecord);
            } else {
                recordId = this.gridAPI.get_row_id(gridId, record);
            }

            if (summaryPosition === GridSummaryPosition.bottom && summariesMap.has(recordId)) {
                const summaryRows = summariesMap.get(recordId);

                for (let j = 0; j < summaryRows.length; j++) {
                    const summaryRow = summaryRows[j];
                    recordsWithSummary.push(summaryRow);
                }
            }

            if (groupByRecord === null) {
                continue;
            }

            if (grid.isExpandedGroup(groupByRecord)) {
                const summaries = grid.summaryService.calculateSummaries(recordId, groupByRecord.records);

                if (summaries) {
                    if (summaryPosition === GridSummaryPosition.top) {
                        recordsWithSummary.push(summaries);
                    } else if (summaryPosition === GridSummaryPosition.bottom) {
                        let lastChild = groupByRecord;

                        while (lastChild.groups && lastChild.groups.length > 0 && grid.isExpandedGroup(lastChild)) {
                            lastChild = lastChild.groups[lastChild.groups.length - 1];
                        }

                        let lastChildId;
                        if (grid.isExpandedGroup(lastChild)) {
                            lastChildId = this.gridAPI.get_row_id(gridId, lastChild.records[lastChild.records.length - 1]);
                        } else {
                            lastChildId = this.gridAPI.get_groupBy_record_id(lastChild);
                        }

                        let summaryRows = summariesMap.get(lastChildId);
                        if (!summaryRows) {
                            summaryRows = [];
                            summariesMap.set(lastChildId, summaryRows);
                        }
                        summaryRows.unshift(summaries);
                    }
                }
            }
        }

        return recordsWithSummary;
    }
}
