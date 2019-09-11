import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';

export interface IFilteringStrategy {
    filter(data: any[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree?: IFilteringExpressionsTree): any[];
}

export abstract class BaseFilteringStrategy implements IFilteringStrategy  {
    public abstract filter(data: any[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree): any[];

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
                let matchOperand, operand;

                if (expressionsTree.filteringOperands && expressionsTree.filteringOperands.length) {
                    for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                        operand = expressionsTree.filteringOperands[i];
                        matchOperand = this.matchRecord(rec, operand);

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
                return this.findMatchByExpression(rec, expression);
            }
        }

        return true;
    }
}

export class FilteringStrategy extends BaseFilteringStrategy {
    public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree?: IFilteringExpressionsTree): T[] {
        let i;
        let rec;
        const len = data.length;
        const res: T[] = [];
        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree)) || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = data[i];
            if (this.matchRecord(rec, expressionsTree) && this.matchRecord(rec, advancedExpressionsTree)) {
                res.push(rec);
            }
        }
        return res;
    }

    protected getFieldValue(rec: object, fieldName: string): any {
        return rec[fieldName];
    }
}
