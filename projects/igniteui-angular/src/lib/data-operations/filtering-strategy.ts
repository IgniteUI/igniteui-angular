import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';
import { resolveNestedPath, parseDate } from '../core/utils';
import { GridType } from '../grids/common/grid.interface';

const DateType = 'date';

export interface IFilteringStrategy {
    filter(data: any[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree?: IFilteringExpressionsTree,
        grid?: GridType): any[];
}

export class NoopFilteringStrategy implements IFilteringStrategy {
    private static _instance: NoopFilteringStrategy = null;

    private constructor() {  }

    public static instance() {
        return this._instance || (this._instance = new NoopFilteringStrategy());
    }

    public filter(data: any[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree?: IFilteringExpressionsTree): any[] {
        return data;
    }
}

export abstract class BaseFilteringStrategy implements IFilteringStrategy  {
    public abstract filter(data: any[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): any[];

    protected abstract getFieldValue(rec: object, fieldName: string, isDate: boolean): any;

    public findMatchByExpression(rec: object, expr: IFilteringExpression, isDate: boolean): boolean {
        const cond = expr.condition;
        const val = this.getFieldValue(rec, expr.fieldName, isDate);
        return cond.logic(val, expr.searchVal, expr.ignoreCase);
    }

    public matchRecord(rec: object, expressions: IFilteringExpressionsTree | IFilteringExpression, grid?: GridType): boolean {
        if (expressions) {
            if (expressions instanceof FilteringExpressionsTree) {
                const expressionsTree = expressions as IFilteringExpressionsTree;
                const operator = expressionsTree.operator as FilteringLogic;
                let matchOperand, operand;

                if (expressionsTree.filteringOperands && expressionsTree.filteringOperands.length) {
                    for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                        operand = expressionsTree.filteringOperands[i];
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
                const isDate = grid && grid.getColumnByName(expression.fieldName) ?
                    grid.getColumnByName(expression.fieldName).dataType === DateType : false;
                return this.findMatchByExpression(rec, expression, isDate);
            }
        }

        return true;
    }
}

export class FilteringStrategy extends BaseFilteringStrategy {
    private static _instace: FilteringStrategy = null;

    public constructor() { super(); }

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

    protected getFieldValue(rec: object, fieldName: string, isDate: boolean = false): any {
        let value = resolveNestedPath(rec, fieldName);
        value = value && isDate ? parseDate(value) : value;
        return value;
    }
}
