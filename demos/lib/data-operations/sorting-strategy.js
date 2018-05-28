import { cloneArray } from "../core/utils";
import { SortingDirection } from "./sorting-expression.interface";
var SortingStrategy = (function () {
    function SortingStrategy() {
    }
    SortingStrategy.prototype.sort = function (data, expressions) {
        return this.sortDataRecursive(data, expressions);
    };
    SortingStrategy.prototype.groupBy = function (data, expressions) {
        return this.groupDataRecursive(data, expressions, 0, null);
    };
    SortingStrategy.prototype.compareValues = function (a, b) {
        var an = (a === null || a === undefined);
        var bn = (b === null || b === undefined);
        if (an) {
            if (bn) {
                return 0;
            }
            return -1;
        }
        else if (bn) {
            return 1;
        }
        return a > b ? 1 : a < b ? -1 : 0;
    };
    SortingStrategy.prototype.compareObjects = function (obj1, obj2, key, reverse, ignoreCase) {
        var a = obj1[key];
        var b = obj2[key];
        if (ignoreCase) {
            a = a && a.toLowerCase ? a.toLowerCase() : a;
            b = b && b.toLowerCase ? b.toLowerCase() : b;
        }
        return reverse * this.compareValues(a, b);
    };
    SortingStrategy.prototype.arraySort = function (data, compareFn) {
        return data.sort(compareFn);
    };
    SortingStrategy.prototype.groupedRecordsByExpression = function (data, index, expression) {
        var i;
        var groupval;
        var res = [];
        var key = expression.fieldName;
        var len = data.length;
        res.push(data[index]);
        groupval = data[index][key];
        index++;
        for (i = index; i < len; i++) {
            if (this.compareValues(data[i][key], groupval) === 0) {
                res.push(data[i]);
            }
            else {
                break;
            }
        }
        return res;
    };
    SortingStrategy.prototype.sortByFieldExpression = function (data, expression) {
        var _this = this;
        var key = expression.fieldName;
        var ignoreCase = expression.ignoreCase ?
            data[0] && (typeof data[0][key] === "string" ||
                data[0][key] === null ||
                data[0][key] === undefined) :
            false;
        var reverse = (expression.dir === SortingDirection.Desc ? -1 : 1);
        var cmpFunc = function (obj1, obj2) {
            return _this.compareObjects(obj1, obj2, key, reverse, ignoreCase);
        };
        return this.arraySort(data, cmpFunc);
    };
    SortingStrategy.prototype.sortDataRecursive = function (data, expressions, expressionIndex) {
        if (expressionIndex === void 0) { expressionIndex = 0; }
        var i;
        var j;
        var expr;
        var gbData;
        var gbDataLen;
        var exprsLen = expressions.length;
        var dataLen = data.length;
        expressionIndex = expressionIndex || 0;
        if (expressionIndex >= exprsLen || dataLen <= 1) {
            return data;
        }
        expr = expressions[expressionIndex];
        data = this.sortByFieldExpression(data, expr);
        if (expressionIndex === exprsLen - 1) {
            return data;
        }
        for (i = 0; i < dataLen; i++) {
            gbData = this.groupedRecordsByExpression(data, i, expr);
            gbDataLen = gbData.length;
            if (gbDataLen > 1) {
                gbData = this.sortDataRecursive(gbData, expressions, expressionIndex + 1);
            }
            for (j = 0; j < gbDataLen; j++) {
                data[i + j] = gbData[j];
            }
            i += gbDataLen - 1;
        }
        return data;
    };
    SortingStrategy.prototype.groupDataRecursive = function (data, expressions, level, parent) {
        var i = 0;
        var result = [];
        while (i < data.length) {
            var group = this.groupedRecordsByExpression(data, i, expressions[level]);
            var groupRow = {
                expression: expressions[level],
                level: level,
                records: cloneArray(group),
                value: group[0][expressions[level].fieldName],
                __groupParent: parent
            };
            if (level < expressions.length - 1) {
                result = result.concat(this.groupDataRecursive(group, expressions, level + 1, groupRow));
            }
            else {
                for (var _i = 0, group_1 = group; _i < group_1.length; _i++) {
                    var groupItem = group_1[_i];
                    groupItem["__groupParent"] = groupRow;
                    result.push(groupItem);
                }
            }
            i += group.length;
        }
        return result;
    };
    return SortingStrategy;
}());
export { SortingStrategy };
