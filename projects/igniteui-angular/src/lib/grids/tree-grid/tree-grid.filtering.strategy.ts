import { parseDate, resolveNestedPath } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { BaseFilteringStrategy, HierarchicalColumnValue } from '../../data-operations/filtering-strategy';
import { ColumnType, GridType } from '../common/grid.interface';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { ITreeGridRecord } from './tree-grid.interfaces';

export class TreeGridFilteringStrategy extends BaseFilteringStrategy {

    constructor(public hierarchicalFilterFields?: string[]) {
        super();
    }

    public filter(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): ITreeGridRecord[] {
        return this.filterImpl(data, expressionsTree, advancedExpressionsTree, undefined, grid);
    }

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false, isTime: boolean = false, grid?: GridType): any {
        const column = grid?.getColumnByName(fieldName);
        const hierarchicalRecord = rec as ITreeGridRecord;
        let value = resolveNestedPath(hierarchicalRecord.data, fieldName);

        value = column?.formatter && this.shouldFormatFilterValues(column) ?
            column.formatter(value) :
            value && (isDate || isTime) ? parseDate(value) : value;

        return value;
    }

    private filterImpl(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree: IFilteringExpressionsTree, parent: ITreeGridRecord, grid?: GridType): ITreeGridRecord[] {
        let i: number;
        let rec: ITreeGridRecord;
        const len = data.length;
        const res: ITreeGridRecord[] = [];
        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree)) || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = DataUtil.cloneTreeGridRecord(data[i]);
            rec.parent = parent;
            if (rec.children) {
                const filteredChildren = this.filterImpl(rec.children, expressionsTree, advancedExpressionsTree, rec, grid);
                rec.children = filteredChildren.length > 0 ? filteredChildren : null;
            }

            if (this.matchRecord(rec, expressionsTree, grid) && this.matchRecord(rec, advancedExpressionsTree, grid)) {
                res.push(rec);
            } else if (rec.children && rec.children.length > 0) {
                rec.isFilteredOutParent = true;
                res.push(rec);
            }
        }
        return res;
    }

    public override getUniqueColumnValues(
        column: ColumnType,
        tree: FilteringExpressionsTree) : Promise<any[] | HierarchicalColumnValue[]> {

        if (!this.hierarchicalFilterFields || this.hierarchicalFilterFields.indexOf(column.field) < 0) {
            return super.getUniqueColumnValues(column, tree);
        }

        const data = (column.grid.gridAPI as IgxTreeGridAPIService).filterTreeDataByExpressions(tree);
        const columnValues = this.getHierarchicalColumnValues(data, column);

        return Promise.resolve(columnValues);
    }

    private getHierarchicalColumnValues(records: ITreeGridRecord[], column: ColumnType) {
        return records?.map(record => {
            let value = resolveNestedPath(record.data, column.field);

            value = column.formatter && this.shouldFormatFilterValues(column) ?
                column.formatter(value) :
                value;

            const hierarchicalItem = new HierarchicalColumnValue();
            hierarchicalItem.value = value;
            hierarchicalItem.children = this.getHierarchicalColumnValues(record.children, column)
            return hierarchicalItem;
        });
    }
}

export class TreeGridFormattedValuesFilteringStrategy extends TreeGridFilteringStrategy {
    /**
     * Creates a new instance of FormattedValuesFilteringStrategy.
     *
     * @param fields An array of column field names that should be formatted.
     * If omitted the values of all columns which has formatter will be formatted.
     */
    constructor(private fields?: string[]) {
        super();
    }

    public shouldFormatFilterValues(column: ColumnType): boolean {
        return !this.fields || this.fields.length === 0 || this.fields.some(f => f === column.field);
    }
}

export class TreeGridMatchingRecordsOnlyFilteringStrategy extends TreeGridFilteringStrategy {
    public filter(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): ITreeGridRecord[] {
        return this.filterImplementation(data, expressionsTree, advancedExpressionsTree, undefined, grid);
    }

    private filterImplementation(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree: IFilteringExpressionsTree, parent: ITreeGridRecord, grid?: GridType): ITreeGridRecord[] {
        let i: number;
        let rec: ITreeGridRecord;
        const len = data.length;
        const res: ITreeGridRecord[] = [];
        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree)) || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = DataUtil.cloneTreeGridRecord(data[i]);
            rec.parent = parent;
            if (rec.children) {
                const filteredChildren = this.filterImplementation(rec.children, expressionsTree, advancedExpressionsTree, rec, grid);
                rec.children = filteredChildren.length > 0 ? filteredChildren : null;
            }
            if (this.matchRecord(rec, expressionsTree, grid) && this.matchRecord(rec, advancedExpressionsTree, grid)) {
                res.push(rec);
            } else if (rec.children && rec.children.length > 0) {
                rec = this.setCorrectLevelToFilteredRecords(rec);
                res.push(...rec.children);
            }
        }
        return res;
    }

    private setCorrectLevelToFilteredRecords(rec: ITreeGridRecord): ITreeGridRecord {
        if (rec.children && rec.children.length > 0) {
            rec.children.map(child => {
                child.level = child.level - 1;
                return this.setCorrectLevelToFilteredRecords(child);
            });
        }
        return rec;
    }
}
