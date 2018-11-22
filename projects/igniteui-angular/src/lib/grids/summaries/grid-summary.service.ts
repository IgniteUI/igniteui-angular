import { Injectable } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxGridBaseComponent } from '../grid-base.component';

/** @hidden */
@Injectable()
export class IgxGridSummaryService {
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, IgxSummaryResult[]>>();
    public grid: IgxGridBaseComponent;

    public getSummariesPerRow(rowID) {
        return this.summaryCacheMap.get(rowID);
    }

    public calculateSummaries(rowID, columnName, data) {
        const column = this.grid.getColumnByName(columnName);
        if (!column.hasSummary) {
            return;
        }
        if (!this.summaryCacheMap.get(rowID)) {
            this.summaryCacheMap.set(rowID, new Map<string, IgxSummaryResult[]>());
            if (!this.summaryCacheMap.get(rowID).get(columnName)) {
                    this.summaryCacheMap.get(rowID).set(column.field,
                        column.summaries.operate(data));
                    return this.summaryCacheMap.get(rowID).get(columnName);
            }
        }
    }

}
