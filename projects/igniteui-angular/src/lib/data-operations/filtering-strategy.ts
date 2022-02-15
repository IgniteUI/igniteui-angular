import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';
import { resolveNestedPath, parseDate, uniqueDates } from '../core/utils';
import { ColumnType, GridType, PivotGridType } from '../grids/common/grid.interface';
import { PivotUtil } from '../grids/pivot-grid/pivot-util';
import { GridColumnDataType } from './data-util';

const DateType = 'date';
const DateTimeType = 'dateTime';
const TimeType = 'time';

export interface IFilteringStrategy {
    filter(data: any[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree?: IFilteringExpressionsTree,
        grid?: GridType): any[];
    getUniqueColumnValues(
        column: ColumnType,
        tree: FilteringExpressionsTree) : Promise<any[] | HierarchicalColumnValue[]>;
    shouldFormatFilterValues(column: ColumnType): boolean;
}

export class HierarchicalColumnValue {
    public value: any;
    public children?: HierarchicalColumnValue[];
}

export abstract class BaseFilteringStrategy implements IFilteringStrategy  {
    // protected
    public findMatchByExpression(rec: any, expr: IFilteringExpression, isDate?: boolean, isTime?: boolean, grid?: GridType): boolean {
        const cond = expr.condition;
        const val = this.getFieldValue(rec, expr.fieldName, isDate, isTime, grid);
        return cond.logic(val, expr.searchVal, expr.ignoreCase);
    }

    // protected
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

    public getUniqueColumnValues(
            column: ColumnType,
            tree: FilteringExpressionsTree) : Promise<any[] | HierarchicalColumnValue[]> {
        const data = column.grid.gridAPI.filterDataByExpressions(tree);
        const columnField = column.field;
        const columnValues = data.map(record => {
            let value = resolveNestedPath(record, columnField);

            value = column.formatter && this.shouldFormatFilterValues(column) ?
                column.formatter(value) :
                value;

            return value;
        });
        const uniqueValues = this.generateUniqueValues(column, columnValues);

        return Promise.resolve(uniqueValues);
    }

    private generateUniqueValues(column: ColumnType, columnValues: any[]) {
        let uniqueValues: any[];

        if (column.dataType === GridColumnDataType.String && column.filteringIgnoreCase) {
            const filteredUniqueValues = columnValues.map(s => s?.toString().toLowerCase())
                .reduce((map, val, i) => map.get(val) ? map : map.set(val, columnValues[i]), new Map());
            uniqueValues = Array.from(filteredUniqueValues.values());
        } else if (column.dataType === GridColumnDataType.DateTime) {
            uniqueValues = Array.from(new Set(columnValues.map(v => v?.toLocaleString())));
            uniqueValues.forEach((d, i) => uniqueValues[i] = d ? new Date(d) : d);
        } else if (column.dataType === GridColumnDataType.Time) {
            uniqueValues = Array.from(new Set(columnValues.map(v => {
                if (v) {
                    v = new Date(v);
                    return new Date().setHours(v.getHours(), v.getMinutes(), v.getSeconds());
                } else {
                    return v;
                }
            })));
            uniqueValues.forEach((d, i) => uniqueValues[i] = d ? new Date(d) : d);
        } else {
            uniqueValues = column.dataType === GridColumnDataType.Date ?
                uniqueDates(columnValues) : Array.from(new Set(columnValues));
        }

        return uniqueValues;
    }

    public shouldFormatFilterValues(_column: ColumnType): boolean {
        return false;
    }

    public abstract filter(data: any[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): any[];

    protected abstract getFieldValue(rec: any, fieldName: string, isDate?: boolean, isTime?: boolean, grid?: GridType): any;
}

export class NoopFilteringStrategy extends BaseFilteringStrategy {
    protected getFieldValue(rec: any, _fieldName: string) {
        return rec;
    }
    private static _instance: NoopFilteringStrategy = null;

    public static instance() {
        return this._instance || (this._instance = new NoopFilteringStrategy());
    }

    public filter(data: any[], _: IFilteringExpressionsTree, __?: IFilteringExpressionsTree): any[] {
        return data;
    }
}


export class FilteringStrategy extends BaseFilteringStrategy {
    private static _instance: FilteringStrategy = null;

    constructor() {
        super();
    }

    public static instance() {
        return this._instance || (this._instance = new this());
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

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false, isTime: boolean = false, grid?: GridType): any {
        const column = grid?.getColumnByName(fieldName);
        let value = resolveNestedPath(rec, fieldName);

        value = column?.formatter && this.shouldFormatFilterValues(column) ?
            column.formatter(value, rec) :
            value && (isDate || isTime) ? parseDate(value) : value;

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

    public shouldFormatFilterValues(column: ColumnType): boolean {
        return !this.fields || this.fields.length === 0 || this.fields.some(f => f === column.field);
    }
}
