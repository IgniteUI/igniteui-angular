import { parseDate, resolveNestedPath } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { BaseFilteringStrategy, IgxFilterItem } from '../../data-operations/filtering-strategy';
import { SortingDirection } from '../../data-operations/sorting-strategy';
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

    protected getFieldValue(rec: any, fieldName: string, isDate = false, isTime = false, grid?: GridType): any {
        const column = grid?.getColumnByName(fieldName);
        const hierarchicalRecord = rec as ITreeGridRecord;
        let value = this.isHierarchicalFilterField(fieldName) ?
            this.getHierarchicalFieldValue(hierarchicalRecord, fieldName) :
            resolveNestedPath(hierarchicalRecord.data, fieldName);

        value = column?.formatter && this.shouldFormatFilterValues(column) ?
            column.formatter(value, rec.data) :
            value && (isDate || isTime) ? parseDate(value) : value;

        return value;
    }

    private getHierarchicalFieldValue(record: ITreeGridRecord, field: string) {
        const value = resolveNestedPath(record.data, field);

        return record.parent ?
            `${this.getHierarchicalFieldValue(record.parent, field)}${value ? `.[${value}]` : ''}` :
            `[${value}]`;
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

    private isHierarchicalFilterField(field: string) {
        return this.hierarchicalFilterFields && this.hierarchicalFilterFields.indexOf(field) !== -1;
    }

    public override getFilterItems(column: ColumnType, tree: IFilteringExpressionsTree): Promise<IgxFilterItem[]> {
        if (!this.isHierarchicalFilterField(column.field)) {
            return super.getFilterItems(column, tree);
        }

        let data = (column.grid.gridAPI as IgxTreeGridAPIService).filterTreeDataByExpressions(tree);
        data = DataUtil.treeGridSort(
            data,
            [{ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: column.sortingIgnoreCase }],
            column.grid.sortStrategy,
            null,
            column.grid);

        const items = this.getHierarchicalFilterItems(data, column);


        return Promise.resolve(items);
    }

    private getHierarchicalFilterItems(records: ITreeGridRecord[], column: ColumnType, parent?: IgxFilterItem): IgxFilterItem[] {
        return records?.map(record => {
            let value = resolveNestedPath(record.data, column.field);
            const applyFormatter = column.formatter && this.shouldFormatFilterValues(column);

            value = applyFormatter ?
                column.formatter(value, record.data) :
                value;

            const hierarchicalValue = parent ?
                (value || value === 0) ? `${parent.value}.[${value}]` : value :
                `[${value}]`;

            const filterItem: IgxFilterItem = { value: hierarchicalValue };
            filterItem.label = this.getFilterItemLabel(column, value, !applyFormatter, record.data);
            filterItem.children = this.getHierarchicalFilterItems(record.children, column, filterItem);
            return filterItem;
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

    protected override shouldFormatFilterValues(column: ColumnType): boolean {
        return !this.fields || this.fields.length === 0 || this.fields.some(f => f === column.field);
    }
}

export class TreeGridMatchingRecordsOnlyFilteringStrategy extends TreeGridFilteringStrategy {
    public override filter(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
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
