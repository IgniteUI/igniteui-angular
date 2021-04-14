import { Pipe, PipeTransform } from '@angular/core';
import { IgxGridAPIService } from './grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxGridComponent } from './grid.component';
import { ISummaryRecord } from '../summaries/grid-summary';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IGroupByResult } from '../../data-operations/grouping-result.interface';
import { GridSummaryCalculationMode, GridSummaryPosition } from '../common/enums';
import { GridType } from '../common/grid.interface';

/** @hidden */
interface ISkipRecord {
    skip?: boolean;
}

/** @hidden */
@Pipe({
    name: 'gridSummary',
    pure: true
})
export class IgxGridSummaryPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        this.gridAPI = gridAPI as IgxGridAPIService;
    }

    public transform(collection: IGroupByResult,
        hasSummary: boolean,
        summaryCalculationMode: GridSummaryCalculationMode,
        summaryPosition: GridSummaryPosition,
        id: string, showSummary, pipeTrigger: number, summaryPipeTrigger: number): any[] {

        if (!collection.data || !hasSummary || summaryCalculationMode === GridSummaryCalculationMode.rootLevelOnly) {
            return collection.data;
        }
        return this.addSummaryRows(id, collection, summaryPosition, showSummary);
    }

    private addSummaryRows(gridId: string, collection: IGroupByResult, summaryPosition: GridSummaryPosition, showSummary): any[] {
        const recordsWithSummary = [];
        const lastChildMap = new Map<any, IGroupByRecord[]>();
        const grid: IgxGridComponent = this.gridAPI.grid;
        const maxSummaryHeight = grid.summaryService.calcMaxSummaryHeight();

        if (collection.metadata.length && !grid.isGroupByRecord(collection.data[0]) &&
            grid.isGroupByRecord(collection.metadata[0]) && summaryPosition === GridSummaryPosition.bottom) {
            const groups: Array<IGroupByRecord & ISkipRecord> = [];
            groups.push(collection.metadata[0]);
            while (groups[groups.length - 1].groupParent) {
                groups.push(groups[groups.length - 1].groupParent);
            }
            groups.reverse();
            groups.forEach(g => g.skip = true);
            collection.data.splice(0, 0, ...groups);
        }
        for (const record of collection.data) {
            let skipAdd = false;
            let recordId;
            let groupByRecord: IGroupByRecord = null;
            if (grid.isGroupByRecord(record)) {
                skipAdd = !!record.skip;
                record.skip = null;
                groupByRecord = record as IGroupByRecord;
                recordId = this.gridAPI.get_groupBy_record_id(groupByRecord);
            } else {
                recordId = this.gridAPI.get_row_id(record);
            }
            if (!skipAdd) {
                recordsWithSummary.push(record);
            }

            if (summaryPosition === GridSummaryPosition.bottom && showSummary && (groupByRecord && !grid.isExpandedGroup(groupByRecord))) {
                const records = this.removeDeletedRecord(grid, groupByRecord.records.slice());
                const summaries = grid.summaryService.calculateSummaries(recordId, records);
                const summaryRecord: ISummaryRecord = {
                    summaries,
                    max: maxSummaryHeight
                };
                recordsWithSummary.push(summaryRecord);
            }
            if (summaryPosition === GridSummaryPosition.bottom && lastChildMap.has(recordId)) {
                const groupRecords = lastChildMap.get(recordId);

                for (const groupRecord of groupRecords) {
                    const groupRecordId = this.gridAPI.get_groupBy_record_id(groupRecord);
                    const records = this.removeDeletedRecord(grid, groupRecord.records.slice());
                    const summaries = grid.summaryService.calculateSummaries(groupRecordId, records);
                    const summaryRecord: ISummaryRecord = {
                        summaries,
                        max: maxSummaryHeight
                    };
                    recordsWithSummary.push(summaryRecord);
                }
            }

            const showSummaries = showSummary ? false : (groupByRecord && !grid.isExpandedGroup(groupByRecord));
            if (groupByRecord === null || showSummaries) {
                continue;
            }

            if (summaryPosition === GridSummaryPosition.top) {
                const records = this.removeDeletedRecord(grid, groupByRecord.records.slice());
                const summaries = grid.summaryService.calculateSummaries(recordId, records);
                const summaryRecord: ISummaryRecord = {
                    summaries,
                    max: maxSummaryHeight
                };
                recordsWithSummary.push(summaryRecord);
            } else if (summaryPosition === GridSummaryPosition.bottom) {
                let lastChild = groupByRecord;

                while (lastChild.groups && lastChild.groups.length > 0 && grid.isExpandedGroup(lastChild)) {
                    lastChild = lastChild.groups[lastChild.groups.length - 1];
                }

                let lastChildId;
                if (grid.isExpandedGroup(lastChild)) {
                    lastChildId = this.gridAPI.get_row_id(lastChild.records[lastChild.records.length - 1]);
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
