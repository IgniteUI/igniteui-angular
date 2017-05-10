import {DataUtil} from "./data-util";
import { FilteringCondition } from "./filtering-condition";
import { FilteringExpression, FilteringLogic } from "./filtering-expression.interface";
import { FilteringState } from "./filtering-state.interface";

export interface IFilteringStrategy {
    filter(data: any[], expressions: FilteringExpression[], logic?: FilteringLogic): any[];
}

export class FilteringStrategy implements IFilteringStrategy {
    filter<T>(data: T[],
              expressions: FilteringExpression[],
              logic?: FilteringLogic): T[] {
        let i, len = data.length,
            res: T[] = [],
            rec;
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
    matchRecordByExpressions(rec: Object,
                             expressions: FilteringExpression[],
                             index: number,
                             logic?: FilteringLogic): Boolean {
        let i, len = expressions.length, match = false,
            and = (logic === FilteringLogic.And);
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
    findMatch(rec: Object, expr: FilteringExpression, index: number): boolean {
        const cond = expr.condition,
            val = rec[expr.fieldName];
        return cond(val, expr.searchVal, expr.ignoreCase);
    }
}
