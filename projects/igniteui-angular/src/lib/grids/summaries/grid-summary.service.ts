import { Injectable } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { GridSummaryCalculationMode } from '../grid-base.component';

/** @hidden */
@Injectable()
export class IgxGridSummaryService {
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, IgxSummaryResult[]>>();
    public grid;

    public deleteSummaryCache() {
        this.summaryCacheMap.clear();
    }

    public removeSummaries(rowID, columnName?) {
        if (this.isTreeGrid) {
            if (this.grid.summaryCalculationMode === GridSummaryCalculationMode.rootLevelOnly) {
                this.removeRootSummaryForColumn(rowID, columnName);
            } else {
                this.removeAllSummariesForColumn(rowID, columnName);
            }
        }
    }

    public removeRootSummaryForColumn(rowID, columnName?) {
        let row = this.grid.records.get(rowID);
        while (row.level !== 0) {
            row = row.parent;
        }
        rowID = row.rowID;
        if (columnName) {
            if (this.summaryCacheMap.get(rowID)) {
                this.summaryCacheMap.get(rowID).delete(columnName);
            }
        } else {
            this.summaryCacheMap.delete(rowID);
        }
    }

    public removeAllSummariesForColumn(rowID, columnName?) {
        if (this.isTreeGrid && (this.grid.summaryCalculationMode === GridSummaryCalculationMode.childLevelsOnly
            || this.grid.summaryCalculationMode === GridSummaryCalculationMode.rootAndChildLevels)) {
            let row = this.grid.records.get(rowID);
            row = row.children ? row : row.parent;
            while (row) {
                rowID = row.rowID;
                if (columnName) {
                    if (this.summaryCacheMap.get(rowID)) {
                        this.summaryCacheMap.get(rowID).delete(columnName);
                    }
                } else {
                    console.log(rowID);
                    this.summaryCacheMap.delete(rowID);
                }
                row = row.parent;
            }
        }
    }

    public calculateMaxSummaryHeight() {
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
        if (!this.summaryCacheMap.get(rowID)) {
            this.summaryCacheMap.set(rowID, new Map<string, IgxSummaryResult[]>());
            this.grid.columnList.filter(col => col.hasSummary).forEach((column) => {
                if (!this.summaryCacheMap.get(rowID).get(column.field)) {
                        this.summaryCacheMap.get(rowID).set(column.field,
                            column.summaries.operate(data));
                }
            });
        }
        return this.summaryCacheMap.get(rowID);
    }

    private get isTreeGrid() {
        return this.grid.nativeElement.tagName.toLowerCase() === 'igx-tree-grid';
    }

}
