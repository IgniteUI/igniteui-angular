import {DataUtil} from "./data-util";
import { FilteringCondition } from "./filtering-condition";
import { FilteringLogic, IFilteringExpression } from "./filtering-expression.interface";
import { FilteringState } from "./filtering-state.interface";

export interface IFilteringStrategy {
    filter(data: any[], expressions: IFilteringExpression[], logic?: FilteringLogic): any[];
}

export class FilteringStrategy implements IFilteringStrategy {
    public filter<T>(data: T[],
                     expressions: IFilteringExpression[],
                     logic?: FilteringLogic): T[] {
        let i;
        let rec;
        const len = data.length;
        const res: T[] = [];
        if (!expressions || !expressions.length || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = data[i];
            if (this.matchRecordByExpressions(rec, expressions, i, logic)) {
                res.push(rec);
            }
        }
        return res;
    }
    protected matchRecordByExpressions(rec: object,
                                       expressions: IFilteringExpression[],
                                       index: number,
                                       logic?: FilteringLogic): boolean {
        let i;
        let match = false;
        const and = (logic === FilteringLogic.And);
        const len = expressions.length;
        for (i = 0; i < len; i++) {
            match = this.findMatch(rec, expressions[i], i);
            if (and) {
                if (!match) {
                    return false;
                }
            } else {
                if (match) {
                    return true;
                }
            }
        }
        return match;
    }
    protected findMatch(rec: object, expr: IFilteringExpression, index: number): boolean {
        const cond = expr.condition;
        const val = rec[expr.fieldName];
        return cond(val, expr.searchVal, expr.ignoreCase);
    }
}
