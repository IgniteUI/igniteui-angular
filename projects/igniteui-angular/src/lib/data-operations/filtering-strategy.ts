import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';
import { resolveNestedPath, parseDate, formatDate, formatCurrency } from '../core/utils';
import { ColumnType, GridType } from '../grids/common/grid.interface';
import { GridColumnDataType } from './data-util';
import { SortingDirection } from './sorting-strategy';
import { formatNumber, formatPercent, getLocaleCurrencyCode } from '@angular/common';
import { IFilteringState } from './filtering-state.interface';

const DateType = 'date';
const DateTimeType = 'dateTime';
const TimeType = 'time';

export class FilterUtil {
    public static filter<T>(data: T[], state: IFilteringState, grid?: GridType): T[] {
        if (!state.strategy) {
            state.strategy = new FilteringStrategy();
        }
        return state.strategy.filter(data, state.expressionsTree, state.advancedExpressionsTree, grid);
    }
}

export interface IFilteringStrategy {
    filter(data: any[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree?: IFilteringExpressionsTree,
        grid?: GridType): any[];
    /* csSuppress */
    getFilterItems(column: ColumnType, tree: IFilteringExpressionsTree) : Promise<IgxFilterItem[]>;
}

/* csSuppress */
export interface IgxFilterItem {
    value: any;
    label?: string;
    children?: IgxFilterItem[];
}

/* csSuppress */
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

    public getFilterItems(column: ColumnType, tree: IFilteringExpressionsTree): Promise<IgxFilterItem[]> {

        let data = column.grid.gridAPI.filterDataByExpressions(tree);
        data = column.grid.gridAPI.sortDataByExpressions(data,
            [{ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: column.sortingIgnoreCase }]);

        const columnField = column.field;
        let filterItems: IgxFilterItem[] = data.map(record => {
            let value = resolveNestedPath(record, columnField);
            const applyFormatter = column.formatter && this.shouldFormatFilterValues(column);

            value = applyFormatter ?
                column.formatter(value, record) :
                value;

            return {
                value,
                label: this.getFilterItemLabel(column, value, !applyFormatter, record)
            };
        });
        filterItems = this.getUniqueFilterItems(column, filterItems);

        return Promise.resolve(filterItems);
    }

    protected getFilterItemLabel(column: ColumnType, value: any, applyFormatter: boolean, data: any) {
        if (column.formatter) {
            if (applyFormatter) {
                return column.formatter(value, data);
            }
            return value;
        }

        const { display, format, digitsInfo, currencyCode, timezone } = column.pipeArgs;
        const locale = column.grid.locale;

        switch (column.dataType) {
            case GridColumnDataType.Date:
            case GridColumnDataType.DateTime:
            case GridColumnDataType.Time:
                return formatDate(value, format, locale, timezone);
            case GridColumnDataType.Currency:
                return formatCurrency(value, currencyCode || getLocaleCurrencyCode(locale), display, digitsInfo, locale);
            case GridColumnDataType.Number:
                return formatNumber(value, locale, digitsInfo);
            case GridColumnDataType.Percent:
                return formatPercent(value, locale, digitsInfo);
            default:
                return value;
        }
    }

    protected getUniqueFilterItems(column: ColumnType, filterItems: IgxFilterItem[]) {
        const filteredUniqueValues = filterItems.reduce((map, item) => {
            let key = item.value;

            if (column.dataType === GridColumnDataType.String && column.filteringIgnoreCase) {
                key = key?.toString().toLowerCase();
            } else if (column.dataType === GridColumnDataType.DateTime) {
                key = item.value?.toString();
                item.value = key ? new Date(key) : key;
            } else if (column.dataType === GridColumnDataType.Time) {
                const date = key ? new Date(key) : key;
                key = date ? new Date().setHours(date.getHours(), date.getMinutes(), date.getSeconds()) : key;
                item.value = key ? new Date(key) : key;
            } else if (column.dataType === GridColumnDataType.Date) {
                const date = key ? new Date(key) : key;
                key = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : key;
                item.value = date;
            }

            return map.has(key) ? map : map.set(key, item)
        }, new Map());
        const uniqueValues = Array.from(filteredUniqueValues.values());

        return uniqueValues;
    }

    protected shouldFormatFilterValues(_column: ColumnType): boolean {
        return false;
    }

    public abstract filter(data: any[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): any[];

    protected abstract getFieldValue(rec: any, fieldName: string, isDate?: boolean, isTime?: boolean, grid?: GridType): any;
}

/* csSuppress */
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

    protected getFieldValue(rec: any, fieldName: string, isDate = false, isTime = false, grid?: GridType): any {
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

    protected override shouldFormatFilterValues(column: ColumnType): boolean {
        return !this.fields || this.fields.length === 0 || this.fields.some(f => f === column.field);
    }
}
