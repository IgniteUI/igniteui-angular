import { FilteringLogic, type IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, type IFilteringExpressionsTree } from './filtering-expressions-tree';
import { resolveNestedPath, parseDate, formatDate, formatCurrency, columnFieldPath, formatNumber, formatPercent, getCurrencyCode } from '../core/utils';
import type { ColumnType, EntityType, GridType } from '../grids/common/grid.interface';
import { DataUtil, GridColumnDataType } from './data-util';
import { SortingDirection } from './sorting-strategy';
import type { IFilteringState } from './filtering-state.interface';
import { isTree } from './expressions-tree-util';
import type { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid/hierarchical-grid.component';
import { IgxSorting } from '../grids/common/strategy';

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
    getFilterItems(column: ColumnType, tree: IFilteringExpressionsTree): Promise<IgxFilterItem[]>;
}

/* csSuppress */
export interface IgxFilterItem {
    value: any;
    label?: string;
    children?: IgxFilterItem[];
}

/* csSuppress */
export abstract class BaseFilteringStrategy implements IFilteringStrategy {
    // protected
    public findMatchByExpression(rec: any, expr: IFilteringExpression, isDate?: boolean, isTime?: boolean, grid?: GridType): boolean {
        if (expr.searchTree) {
            const records = rec[expr.searchTree.entity];
            const shouldMatchRecords = expr.conditionName === 'inQuery';
            if (!records) { // child grid is not yet created
                return true;
            }

            for (let index = 0; index < records.length; index++) {
                const record = records[index];
                if ((shouldMatchRecords && this.matchRecord(record, expr.searchTree, grid, expr.searchTree.entity)) ||
                    (!shouldMatchRecords && !this.matchRecord(record, expr.searchTree, grid, expr.searchTree.entity))) {
                    return true;
                }
            }

            return false;
        }

        const val = this.getFieldValue(rec, expr.fieldName, isDate, isTime, grid);
        if (expr.condition?.logic) {
            return expr.condition.logic(val, expr.searchVal, expr.ignoreCase);
        }
    }

    // protected
    public matchRecord(rec: any, expressions: IFilteringExpressionsTree | IFilteringExpression, grid?: GridType, entity?: string): boolean {
        if (expressions) {
            if (isTree(expressions)) {
                const expressionsTree = expressions;
                const operator = expressionsTree.operator as FilteringLogic;
                let matchOperand;

                if (expressionsTree.filteringOperands?.length) {
                    for (const operand of expressionsTree.filteringOperands) {
                        matchOperand = this.matchRecord(rec, operand, grid, entity);

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
                const expression = expressions;
                let dataType = null;
                if (!entity) {
                    const column = grid && grid.getColumnByName(expression.fieldName);
                    dataType = column?.dataType;
                } else if (grid.type === 'hierarchical') {
                    const schema = (grid as IgxHierarchicalGridComponent).schema;
                    const entityMatch = this.findEntityByName(schema, entity);
                    dataType = entityMatch?.fields.find(f => f.field === expression.fieldName)?.dataType;
                }

                const isDate = dataType ? dataType === DateType || dataType === DateTimeType : false;
                const isTime = dataType ? dataType === TimeType : false;

                return this.findMatchByExpression(rec, expression, isDate, isTime, grid);
            }
        }

        return true;
    }

    private findEntityByName(schema: EntityType[], name: string): EntityType | null {
        for (const entity of schema) {
            if (entity.name === name) {
                return entity;
            }

            if (entity.childEntities && entity.childEntities.length > 0) {
                const found = this.findEntityByName(entity.childEntities, name);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    public getFilterItems(column: ColumnType, tree: IFilteringExpressionsTree): Promise<IgxFilterItem[]> {
        const applyFormatter = column.formatter && this.shouldFormatFilterValues(column);

        const data = this.getFilteredData(column, tree);

        const pathParts = columnFieldPath(column.field)
        const seenFormattedFilterItems = new Map<any, IgxFilterItem>()

        for (let i = 0; i < data.length; ++i) {
            const record = data[i]
            const rawValue = resolveNestedPath(record, pathParts);
            const formattedValue = applyFormatter ? column.formatter(rawValue, record) : rawValue;
            const { key, finalValue } = this.getFilterItemKeyValue(formattedValue, column);
            // Deduplicate by normalized key
            if (!seenFormattedFilterItems.has(key)) {
                const label = this.getFilterItemLabel(column, finalValue, !applyFormatter, record);
                seenFormattedFilterItems.set(key, { value: finalValue, label });
            }
        }

        let filterItems: IgxFilterItem[] = Array.from(seenFormattedFilterItems.values());

        filterItems = DataUtil.sort(filterItems,
            [{ fieldName: 'value', dir: SortingDirection.Asc, ignoreCase: column.sortingIgnoreCase }], new IgxSorting())

        return Promise.resolve(filterItems);
    }

    protected getFilteredData(column: ColumnType, tree: IFilteringExpressionsTree) {
        return column.grid.gridAPI.filterDataByExpressions(tree);
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
            case GridColumnDataType.Currency: {
                const currencyCodeFinal = getCurrencyCode(locale, currencyCode);
                return formatCurrency(value, locale, display, currencyCodeFinal, digitsInfo); }
            case GridColumnDataType.Number:
                return formatNumber(value, locale, digitsInfo);
            case GridColumnDataType.Percent:
                return formatPercent(value, locale, digitsInfo);
            default:
                return value;
        }
    }

    protected getFilterItemKeyValue(value: any, column: ColumnType) {
        let key: any = value;
        let finalValue = value;
        if (column.dataType === GridColumnDataType.String && column.filteringIgnoreCase) {
            key = key?.toString().toLowerCase();
        } else if (column.dataType === GridColumnDataType.DateTime) {
            key = value?.toString();
            finalValue = key ? new Date(key) : key;
        } else if (column.dataType === GridColumnDataType.Time) {
            const date = key ? new Date(key) : key;
            key = date
                ? new Date().setHours(
                    date.getHours(),
                    date.getMinutes(),
                    date.getSeconds(),
                    date.getMilliseconds()
                )
                : date;
            finalValue = key ? new Date(key) : key;
        } else if (column.dataType === GridColumnDataType.Date) {
            const date = key ? new Date(key) : key;
            key = date
                ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
                : date;
            finalValue = date;
        }
        return { key, finalValue };
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


    public static instance() {
        return this._instance || (this._instance = new this());
    }

    public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree: IFilteringExpressionsTree,
        grid: GridType): T[] {


        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree))) {
            return data;
        }

        return data.filter(record => this.matchRecord(record, expressionsTree, grid) && this.matchRecord(record, advancedExpressionsTree, grid));
    }

    protected getFieldValue(rec: any, fieldName: string, isDate = false, isTime = false, grid?: GridType): any {
        const column = grid?.getColumnByName(fieldName);
        let value = resolveNestedPath(rec, columnFieldPath(fieldName));

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
