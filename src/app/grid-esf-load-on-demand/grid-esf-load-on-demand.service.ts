import { IgxColumnComponent, IFilteringExpressionsTree, FilteringStrategy } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

export class GridESFLoadOnDemandService {
    private _filteringStrategy = new FilteringStrategy();

    public getRecordsData() {
        return SAMPLE_DATA.slice(0);
    }
    
    public getColumnData(column: IgxColumnComponent, columnExprTree: IFilteringExpressionsTree, done: (colVals: any[]) => void) {
        setTimeout(() => {
            const filteredData = this._filteringStrategy.filter(this.getRecordsData(), columnExprTree);
            const columnValues = filteredData.map(record => record[column.field]);
            done(columnValues);
        }, 1000);
    }
}
