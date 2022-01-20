import { parseDate, resolveNestedPath } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { BaseFilteringStrategy } from '../../data-operations/filtering-strategy';
import { ColumnType, GridType } from '../common/grid.interface';
import { ITreeGridRecord } from './tree-grid.interfaces';

export interface IHierarchicalItem {
    value: any;
    children?: IHierarchicalItem[];
}

export class TreeGridFilteringStrategy extends BaseFilteringStrategy {
    public filter(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): ITreeGridRecord[] {
        return this.filterImpl(data, expressionsTree, advancedExpressionsTree, undefined, grid);
    }

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false): any {
        const hierarchicalRecord = rec as ITreeGridRecord;
        let value = resolveNestedPath(hierarchicalRecord.data, fieldName);
        value = value && isDate ? parseDate(value) : value;
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

    /** @hidden */
    public shouldApplyFormatter(fieldName: string): boolean {
        return !this.fields || this.fields.length === 0 || this.fields.some(f => f === fieldName);
    }

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false, isTime: boolean = false, grid?: GridType): any {
        const column = grid.getColumnByName(fieldName);
        const hierarchicalRecord = rec as ITreeGridRecord;
        let value = resolveNestedPath(hierarchicalRecord.data, fieldName);

        value = column.formatter && this.shouldApplyFormatter(fieldName) ?
            column.formatter(value) :
            value && (isDate || isTime) ? parseDate(value) : value;

        return value;
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

export class HierarchicalFilteringStrategy extends TreeGridFilteringStrategy {
    private processedData: IHierarchicalItem[];
    private childDataKey;

    constructor(public hierarchicalFilterFields: string[]) {
        super();
    }

    public override getColumnValues(
            column: ColumnType,
            tree: FilteringExpressionsTree,
            done: (values: any[] | IHierarchicalItem[]) => void): void {

        if (this.hierarchicalFilterFields.indexOf(column.field) < 0) {
            return super.getColumnValues(column, tree, done);
        }

        this.processedData = [];
        this.childDataKey = column.grid.childDataKey;
        const data = column.grid.gridAPI.filterDataByExpressions(tree);
        const columnField = column.field;
        let columnValues = [];
        columnValues = data.map(record => {
            if (this.processedData.indexOf(record) < 0) { // TODO: add check for DATE
                let hierarchicalItem: IHierarchicalItem;
                hierarchicalItem = { value: resolveNestedPath(record, columnField) };
                // if (shouldFormatValues) {
                //     value = this.column.formatter(value, record);
                // }
                hierarchicalItem.children = this.getChildren(record, columnField)
                return hierarchicalItem;
            }
        });
        columnValues = columnValues.filter(function(el) {
            return el !== undefined
        });

        done(columnValues);
    }

    private getChildren(record: any, columnField: string) {
        this.processedData.push(record);
        let childrenValues = [];
        const children = record[this.childDataKey];
        if (children) {
            children.forEach(child => {
                if (this.processedData.indexOf(child) < 0) {
                    let hierarchicalItem: IHierarchicalItem;
                    hierarchicalItem = { value: resolveNestedPath(child, columnField) };
                    // if (shouldFormatValues) {
                    //     value = this.column.formatter(value, record);
                    // }
                    hierarchicalItem.children = this.getChildren(child, columnField)
                    childrenValues.push(hierarchicalItem);
                }
            });
        } else {
            // TODO: unique values on last level
        }

        return childrenValues;
    }
}