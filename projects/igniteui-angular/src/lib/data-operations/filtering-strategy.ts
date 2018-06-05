import { DataUtil } from './data-util';
import { IFilteringOperation } from './filtering-condition';
import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { IFilteringState } from './filtering-state.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';

export interface IFilteringStrategy {
    filter(data: any[], expressionsTree: IFilteringExpressionsTree): any[];
}

export class FilteringStrategy implements IFilteringStrategy {
    public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree): T[] {
        let i;
        let rec;
        const len = data.length;
        const res: T[] = [];
        if (!expressionsTree || !expressionsTree.firstOperand || !len) {
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

    public findMatchByExpression(rec: object, expr: IFilteringExpression): boolean {
        const cond = expr.condition;
        const val = rec[expr.fieldName];
        return cond.logic(val, expr.searchVal, expr.ignoreCase);
    }

    public matchRecord(rec: object, expressions: IFilteringExpressionsTree | IFilteringExpression): boolean {
        if (expressions) {
            if (expressions instanceof FilteringExpressionsTree) {
                let expressionTree = expressions as IFilteringExpressionsTree;
                let match = this.matchRecord(rec, expressionTree.firstOperand);

                if (expressionTree.secondOperand && expressionTree.operator) {
                    let operator = expressionTree.operator as FilteringLogic;
                    let matchSecond = this.matchRecord(rec, expressionTree.secondOperand);

                    if (operator === FilteringLogic.And) {
                        match = match && matchSecond;
                    } else if (operator === FilteringLogic.Or) {
                        match = match || matchSecond;
                    }
                }

                return match;
            } else {
                let expression = expressions as IFilteringExpression;
                return this.findMatchByExpression(rec, expression);
            }
        }

        return true;
    }
}
