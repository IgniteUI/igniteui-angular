import { Injectable } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { GridSummaryCalculationMode } from '../grid-base.component';

/** @hidden */
@Injectable()
export class IgxGridSummaryService {
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, IgxSummaryResult[]>>();
    public grid;
    public rootSummaryID = 'igxGridRootSummary';
    public summaryHeight = 0;
    public maxSummariesLenght = 0;
    public groupingExpressions = [];

    public clearSummaryCache() {
        this.summaryCacheMap.clear();
    }

    public removeSummaries(rowID, columnName?) {
        if (this.summaryCacheMap.size === 0) { return; }
        this.deleteSummaryCache(this.rootSummaryID, columnName);
        if (this.summaryCacheMap.size === 1 && this.summaryCacheMap.has(this.rootSummaryID)) { return; }
        if (this.isTreeGrid) {
            this.removeAllTreeGridSummaries(rowID, columnName);
        } else {
           const summaryIds = this.getSummaryID(rowID, this.grid.groupingExpressions);
           summaryIds.forEach(id => {
               this.deleteSummaryCache(id, columnName);
           });
        }
    }

    public removeSummariesCachePerColumn(columnName) {
        this.summaryCacheMap.forEach((cache) => {
            if (cache.get(columnName)) {
                cache.delete(columnName);
            }
        });
    }

    public calcMaxSummaryHeight() {
        if (this.summaryHeight) {
            return this.summaryHeight;
        }
        let maxSummaryLength = 0;
        this.grid.columnList.filter((col) => col.hasSummary && !col.hidden).forEach((column) => {
            const getCurrentSummaryColumn = column.summaries.operate([]).length;
            if (getCurrentSummaryColumn) {
                if (maxSummaryLength < getCurrentSummaryColumn) {
                    maxSummaryLength = getCurrentSummaryColumn;
                }
            }
        });
        this.maxSummariesLenght = maxSummaryLength;
        this.summaryHeight =  maxSummaryLength * this.grid.defaultRowHeight;
        return this.summaryHeight;
    }

    public calculateSummaries(rowID, data) {
        if (!this.hasSummarizedColumns) { return; }
        let rowSummaries = this.summaryCacheMap.get(rowID);
        if (!rowSummaries) {
            rowSummaries = new Map<string, IgxSummaryResult[]>();
            this.summaryCacheMap.set(rowID, rowSummaries);
        }
        this.grid.columnList.filter(col => col.hasSummary).forEach((column) => {
            if (!rowSummaries.get(column.field)) {
                const columnValues = data.map(record => record[column.field]);
                rowSummaries.set(column.field,
                    column.summaries.operate(columnValues));
            }
        });
        return rowSummaries;
    }

    public shouldRecalculateHeight(column): boolean {
        if (this.summaryHeight === 0) { return false; }
        const summaryLenght = column.summaries.operate([]).length;
        const shouldRecalc = (!column.hasSummary && this.maxSummariesLenght <= summaryLenght) ||
        (column.hasSummary && this.maxSummariesLenght < summaryLenght);
        if (shouldRecalc) {
            this.summaryHeight = 0;
            return true;
        }
        return false;
    }

    public updateSummaryCache(groupingArgs) {
        if (this.groupingExpressions.length === 0) {
            this.groupingExpressions = groupingArgs.expressions.map(record => record.fieldName);
            return;
        }
        if (groupingArgs.length === 0) {
            this.groupingExpressions = [];
            this.clearSummaryCache();
            return;
        }
        this.compareGroupingExpressions(this.groupingExpressions, groupingArgs);
        this.groupingExpressions = groupingArgs.expressions.map(record => record.fieldName);
    }

    public get groupingIdentation(): boolean {
        return !this.isTreeGrid && this.grid.groupingExpressions.length > 0;
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
        if (groupingExpressions.length === 0) { return []; }
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
        if (!row) { return; }
        row = row.children ? row : row.parent;
        while (row) {
            rowID = row.rowID;
            this.deleteSummaryCache(rowID, columnName);
            row = row.parent;
        }
    }

    private compareGroupingExpressions(current, groupingArgs) {
        if (this.summaryCacheMap.size === 0) { return ; }
        const newExpressions = groupingArgs.expressions.map(record => record.fieldName);
        const removedCols = groupingArgs.ungroupedColumns;
        if (current.length <= newExpressions.length) {
            const newExpr = newExpressions.slice(0, current.length).toString();
            if (current.toString() !== newExpr) {
                this.clearSummaryCache();
            }
            return;
        }
        if (current.length > newExpressions.length) {
            const currExpr = current.slice(0, newExpressions.length).toString();
            if (currExpr !== newExpressions.toString()) {
                this.clearSummaryCache();
                return;
            }
            removedCols.map(col => col.field).forEach(colName => {
                this.summaryCacheMap.forEach((cache, id) => {
                   if (id.indexOf(colName) !== -1) {
                       this.summaryCacheMap.delete(id);
                   }});
            });
        }
    }

    private get isTreeGrid() {
        return this.grid.nativeElement.tagName.toLowerCase() === 'igx-tree-grid';
    }

}
