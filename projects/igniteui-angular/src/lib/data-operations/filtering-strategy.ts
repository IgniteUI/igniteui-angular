import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';

export interface IFilteringStrategy {
    filter(data: any[], expressionsTree: IFilteringExpressionsTree): any[];
}

export abstract class BaseFilteringStrategy implements IFilteringStrategy  {
    public abstract filter(data: any[], expressionsTree: IFilteringExpressionsTree): any[];

    protected abstract getFieldValue(rec: object, fieldName: string): any;

    public findMatchByExpression(rec: object, expr: IFilteringExpression): boolean {
        const cond = expr.condition;
        const val = this.getFieldValue(rec, expr.fieldName);
        return cond.logic(val, expr.searchVal, expr.ignoreCase);
    }

    public matchRecord(rec: object, expressions: IFilteringExpressionsTree | IFilteringExpression): boolean {
        if (expressions) {
            if (expressions instanceof FilteringExpressionsTree) {
                const expressionsTree = expressions as IFilteringExpressionsTree;
                const operator = expressionsTree.operator as FilteringLogic;
                let match, matchOperand, operand;

                if (expressionsTree.filteringOperands) {
                    for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                        operand = expressionsTree.filteringOperands[i];
                        matchOperand = this.matchRecord(rec, operand);

                        if (match === undefined) {
                            match = matchOperand;
                        } else if (operator === FilteringLogic.And) {
                            match = match && matchOperand;
                        } else if (operator === FilteringLogic.Or) {
                            match = match || matchOperand;
                        }
                    }
                }

                return match === undefined ? true : match;
            } else {
                const expression = expressions as IFilteringExpression;
                return this.findMatchByExpression(rec, expression);
            }
        }

        return true;
    }
}

export class FilteringStrategy extends BaseFilteringStrategy {
    public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree): T[] {
        let i;
        let rec;
        const len = data.length;
        const res: T[] = [];
        if (!expressionsTree || !expressionsTree.filteringOperands || expressionsTree.filteringOperands.length === 0 || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = data[i];
            if (this.matchRecord(rec, expressionsTree)) {
                res.push(rec);
            }
        }
        return res;
    }

    protected getFieldValue(rec: object, fieldName: string): any {
        return rec[fieldName];
    }
}
