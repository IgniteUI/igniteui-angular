import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';
import { resolveNestedPath, parseDate } from '../core/utils';
import { ColumnType, GridType } from '../grids/common/grid.interface';

const DateType = 'date';
const DateTimeType = 'dateTime';
const TimeType = 'time';

export interface IFilteringStrategy {
    filter(data: any[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree?: IFilteringExpressionsTree,
        grid?: GridType): any[];
}

export interface IHierarchicalItem {
    value: any;
    children?: IHierarchicalItem[];
}

export class NoopFilteringStrategy implements IFilteringStrategy {
    private static _instance: NoopFilteringStrategy = null;

    private constructor() {  }

    public static instance() {
        return this._instance || (this._instance = new NoopFilteringStrategy());
    }

    public filter(data: any[], _: IFilteringExpressionsTree, __?: IFilteringExpressionsTree): any[] {
        return data;
    }
}

export abstract class BaseFilteringStrategy implements IFilteringStrategy  {
    public findMatchByExpression(rec: any, expr: IFilteringExpression, isDate?: boolean, isTime?: boolean, grid?: GridType): boolean {
        if (rec.data) {
            rec = rec.data;
        }

        const cond = expr.condition;
        const val = this.getFieldValue(rec, expr.fieldName, isDate, isTime, grid);
        return cond.logic(val, expr.searchVal, expr.ignoreCase);
    }

    public matchRecord(rec: any, expressions: IFilteringExpressionsTree | IFilteringExpression, grid?: GridType): boolean {
        if (expressions) {
            if (expressions instanceof FilteringExpressionsTree) {
                const expressionsTree = expressions as IFilteringExpressionsTree;
                const operator = expressionsTree.operator as FilteringLogic;
                let matchOperand;

                if (expressionsTree.filteringOperands && expressionsTree.filteringOperands.length) {
                    for (const operand of expressionsTree.filteringOperands) {
                        matchOperand = this.matchRecord(rec, operand, grid);

                        // Return false if at least one operand does not match and the filtering logic is And
                        if (!matchOperand && operator === FilteringLogic.And) {
                            return false;
                        }

                        // Return true if at least one operand matches and the filtering logic is Or
                        if (matchOperand && operator === FilteringLogic.Or) {
                            return true;
                        }
                    }

                    return matchOperand;
                }

                return true;
            } else {
                const expression = expressions as IFilteringExpression;
                const column = grid && grid.getColumnByName(expression.fieldName);
                const isDate = column ? column.dataType === DateType || column.dataType === DateTimeType : false;
                const isTime = column ? column.dataType === TimeType : false;
                return this.findMatchByExpression(rec, expression, isDate, isTime, grid);
            }
        }

        return true;
    }

    // move formatting from base implementation to formatted values strategies - grid and treegrid
    public getColumnValues(
            column: ColumnType,
            tree: FilteringExpressionsTree,
            done: (values: any[] | IHierarchicalItem[]) => void) { 

        const data = column.grid.gridAPI.filterDataByExpressions(tree);
        const columnField = column.field;
        let columnValues;
        columnValues = data.map(record => resolveNestedPath(record, columnField));
        done(columnValues);
    }

    public abstract filter(data: any[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): any[];

    protected abstract getFieldValue(rec: any, fieldName: string, isDate?: boolean, isTime?: boolean, grid?: GridType): any;
}

export class FilteringStrategy extends BaseFilteringStrategy {
    private static _instace: FilteringStrategy = null;

    constructor() {
        super();
    }

    public static instance() {
        return this._instace || (this._instace = new this());
    }

    public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree: IFilteringExpressionsTree,
        grid: GridType): T[] {
        let i;
        let rec;
        const len = data.length;
        const res: T[] = [];

        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree)) || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = data[i];
            if (this.matchRecord(rec, expressionsTree, grid) && this.matchRecord(rec, advancedExpressionsTree, grid)) {
                res.push(rec);
            }
        }
        return res;
    }

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false, isTime: boolean = false): any {
        let value = resolveNestedPath(rec, fieldName);
        value = value && (isDate || isTime) ? parseDate(value) : value;
        return value;
    }
}
export class FormattedValuesFilteringStrategy extends FilteringStrategy {
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
        let value = resolveNestedPath(rec, fieldName);

        value = column.formatter && this.shouldApplyFormatter(fieldName) ?
            column.formatter(value, rec) : value && (isDate || isTime) ? parseDate(value) : value;

        return value;
    }
}

export class HierarchicalFilteringStrategy extends FilteringStrategy {
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
