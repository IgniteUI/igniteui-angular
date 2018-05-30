"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filtering_expression_interface_1 = require("./filtering-expression.interface");
var FilteringStrategy = (function () {
    function FilteringStrategy() {
    }
    FilteringStrategy.prototype.filter = function (data, expressions, logic) {
        var i;
        var rec;
        var len = data.length;
        var res = [];
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
    };
    FilteringStrategy.prototype.findMatch = function (rec, expr, index) {
        var cond = expr.condition;
        var val = rec[expr.fieldName];
        return cond(val, expr.searchVal, expr.ignoreCase);
    };
    FilteringStrategy.prototype.matchRecordByExpressions = function (rec, expressions, index, logic) {
        var i;
        var match = false;
        var and = (logic === filtering_expression_interface_1.FilteringLogic.And);
        var len = expressions.length;
        for (i = 0; i < len; i++) {
            match = this.findMatch(rec, expressions[i], i);
            if (and) {
                if (!match) {
                    return false;
                }
            }
            else {
                if (match) {
                    return true;
                }
            }
        }
        return match;
    };
    return FilteringStrategy;
}());
exports.FilteringStrategy = FilteringStrategy;

//# sourceMappingURL=filtering-strategy.js.map
