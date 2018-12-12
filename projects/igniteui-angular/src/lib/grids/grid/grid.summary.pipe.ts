import { Pipe, PipeTransform } from '@angular/core';
import { IgxGridAPIService } from './grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, GridSummaryPosition, GridSummaryCalculationMode } from '../grid-base.component';
import { IgxGridComponent } from './grid.component';
import { IgxSummaryResult, ISummaryRecord } from '../summaries/grid-summary';
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

    public transform(flatData: any[],
        hasSummary: boolean,
        summaryCalculationMode: GridSummaryCalculationMode,
        summaryPosition: GridSummaryPosition,
        id: string, pipeTrigger: number, summaryPipeTrigger: number): any[] {

        if (!flatData || !hasSummary || summaryCalculationMode === GridSummaryCalculationMode.rootLevelOnly) {
            return flatData;
        }

        return this.addSummaryRows(id, flatData, summaryPosition);
    }

    private addSummaryRows(gridId: string, collection: any[], summaryPosition: GridSummaryPosition): any[] {
        const recordsWithSummary = [];
        const lastChildMap = new Map<any, IGroupByRecord[]>();
        const grid: IgxGridComponent = this.gridAPI.get(gridId);
        const maxSummaryHeight = grid.summaryService.calcMaxSummaryHeight();

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

            if (summaryPosition === GridSummaryPosition.bottom && lastChildMap.has(recordId)) {
                const groupRecords = lastChildMap.get(recordId);

                for (let j = 0; j < groupRecords.length; j++) {
                    const groupRecord = groupRecords[j];
                    const groupRecordId = this.gridAPI.get_groupBy_record_id(groupRecord);
                    const records = this.removeDeletedRecord(grid, groupRecord.records.slice());
                    const summaries = grid.summaryService.calculateSummaries(groupRecordId, records);
                    const summaryRecord: ISummaryRecord = {
                        summaries: summaries,
                        max: maxSummaryHeight
                    };
                    recordsWithSummary.push(summaryRecord);
                }
            }

            if (groupByRecord === null || !grid.isExpandedGroup(groupByRecord)) {
                continue;
            }

            if (summaryPosition === GridSummaryPosition.top) {
                const records = this.removeDeletedRecord(grid, groupByRecord.records.slice());
                const summaries = grid.summaryService.calculateSummaries(recordId, records);
                const summaryRecord: ISummaryRecord = {
                    summaries: summaries,
                    max:  maxSummaryHeight
                };
                recordsWithSummary.push(summaryRecord);
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

                let groupRecords = lastChildMap.get(lastChildId);
                if (!groupRecords) {
                    groupRecords = [];
                    lastChildMap.set(lastChildId, groupRecords);
                }
                groupRecords.unshift(groupByRecord);
            }
    }

        return recordsWithSummary;
    }

    private removeDeletedRecord(grid, data) {
        if (!grid.transactions.enabled) {
            return data;
        }
        const deletedRows = grid.transactions.getTransactionLog().filter(t => t.type === 'delete').map(t => t.id);
        deletedRows.forEach(rowID => {
            const tempData = grid.primaryKey ? data.map(rec => rec[grid.primaryKey]) : data;
            const index = tempData.indexOf(rowID);
            if (index !== -1) {
                data.splice(index, 1);
            }
        });
        return data;
    }
}
