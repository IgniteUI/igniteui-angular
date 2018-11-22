import { Injectable } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxGridBaseComponent } from '../grid-base.component';

/** @hidden */
@Injectable()
export class IgxGridSummaryService {
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, IgxSummaryResult[]>>();
    public grid: IgxGridBaseComponent;

    public removeSummariesForRow(rowID) {

    }

    public removeSummaryForColumn(rowID, columnName) {

    }

    public calculateMaxSummaryHeight() {

    }

    public getSummariesPerRow(rowID) {
        return this.summaryCacheMap.get(rowID);
    }

    public calculateSummaries(rowID, data) {
        if (!this.summaryCacheMap.get(rowID)) {
            this.summaryCacheMap.set(rowID, new Map<string, IgxSummaryResult[]>());
            this.grid.columnList.filter(col => col.hasSummary).forEach((column) => {
                // console.log(column.field);
                if (!this.summaryCacheMap.get(rowID).get(column.field)) {
                        this.summaryCacheMap.get(rowID).set(column.field,
                            column.summaries.operate(data));
                }
            });
        }
        return this.summaryCacheMap.get(rowID);
    }

}
