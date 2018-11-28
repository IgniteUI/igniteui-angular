import { Injectable } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { GridSummaryCalculationMode } from '../grid-base.component';

/** @hidden */
@Injectable()
export class IgxGridSummaryService {
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, IgxSummaryResult[]>>();
    public grid;
    public rootSummaryID = 'igxGridRootSummary';

    public clearSummaryCache() {
        this.summaryCacheMap.clear();
    }

    public removeSummaries(rowID, columnName?) {
        if (this.grid.summaryCalculationMode === GridSummaryCalculationMode.rootLevelOnly) {
            this.deleteSummaryCache(this.rootSummaryID, columnName);
            return;
        }
        if (this.isTreeGrid) {
            this.removeAllTreeGridSummaries(rowID, columnName);
        } else {
           const summaryIds = this.getSummaryID(rowID, this.grid.groupingExpressions);
           summaryIds.forEach(id => {
               this.deleteSummaryCache(id, columnName);
           });
        }
        if (this.grid.summaryCalculationMode === GridSummaryCalculationMode.rootAndChildLevels) {
            this.deleteSummaryCache(this.rootSummaryID, columnName);
        }
    }

    public calcMaxSummaryHeight() {
        let maxSummaryLength = 0;
        this.grid.columnList.filter((col) => col.hasSummary && !col.hidden).forEach((column) => {
            (this.grid as any).gridAPI.set_summary_by_column_name(this.grid.id, column.field);
            const getCurrentSummaryColumn = (this.grid as any).gridAPI.get_summaries(this.grid.id).get(column.field);
            if (getCurrentSummaryColumn) {
                if (maxSummaryLength < getCurrentSummaryColumn.length) {
                    maxSummaryLength = getCurrentSummaryColumn.length;
                }
            }
        });
        return maxSummaryLength * this.grid.defaultRowHeight;
    }

    public calculateSummaries(rowID, data) {
        if (!this.hasSummarizedColumns) {
            return;
        }
        if (!this.summaryCacheMap.get(rowID)) {
            this.summaryCacheMap.set(rowID, new Map<string, IgxSummaryResult[]>());
            this.grid.columnList.filter(col => col.hasSummary).forEach((column) => {
                if (!this.summaryCacheMap.get(rowID).get(column.field)) {
                    const records = data.map(record => record[column.field]);
                    this.summaryCacheMap.get(rowID).set(column.field,
                        column.summaries.operate(records));
                }
            });
        }
        return this.summaryCacheMap.get(rowID);
    }

    public get hasSummarizedColumns(): boolean {
        const summarizedColumns = this.grid.columnList.filter(col => col.hasSummary && !col.hidden);
        return summarizedColumns.length > 0;
    }

    private deleteSummaryCache(id, columnName) {
        if (this.summaryCacheMap.get(id)) {
            if (columnName && this.summaryCacheMap.get(id).get(columnName)) {
                this.summaryCacheMap.get(id).delete(columnName);
            } else {
                this.summaryCacheMap.delete(id);
            }
        }
    }

    private getSummaryID(rowID, groupingExpressions) {
        const summaryIDs = [];
        const rowData = this.grid.primaryKey ? this.grid.getRowByKey(rowID).rowData : rowID;
        let id = '{ ';
        groupingExpressions.forEach(expr => {
                id += `'${expr.fieldName}': '${rowData[expr.fieldName]}'`;
                summaryIDs.push(id.concat(' }'));
                id += ', ';
        });
        return summaryIDs;
    }

    private removeAllTreeGridSummaries(rowID, columnName?) {
        let row = this.grid.records.get(rowID);
        row = row.children ? row : row.parent;
        while (row) {
            rowID = row.rowID;
            this.deleteSummaryCache(rowID, columnName);
            row = row.parent;
        }
    }

    private get isTreeGrid() {
        return this.grid.nativeElement.tagName.toLowerCase() === 'igx-tree-grid';
    }

}
