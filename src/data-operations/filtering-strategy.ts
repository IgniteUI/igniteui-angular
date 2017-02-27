import { FilteringExpression, FilteringLogic } from "./filtering-expression.interface";
import { FilteringCondition } from "./filtering-condition";
import { FilteringState } from "./filtering-state.interface";
import {DataUtil} from "./data-util";

export interface IFilteringStrategy {
    filter(data: any[], expressions: Array<FilteringExpression>, logic?: FilteringLogic): any[];
}

export class FilteringStrategy implements IFilteringStrategy {
    filter<T>(data: T[],
                expressions: Array<FilteringExpression>, 
                logic?: FilteringLogic): T[] {
        var i, len = data.length,
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
                            expressions: Array<FilteringExpression>,
                            index: number,
                            logic?: FilteringLogic): Boolean {
        var i, len = expressions.length, match = false, 
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
        var cond = expr.condition,
            val = rec[expr.fieldName];
        return cond(val, {
            ignoreCase: expr.ignoreCase,
            search: expr.searchVal,
            index: index,
            record: rec
        });
    }
}