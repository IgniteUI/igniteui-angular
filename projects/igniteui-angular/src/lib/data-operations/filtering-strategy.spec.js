"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_generator_1 = require("./test-util/data-generator");
var main_1 = require("../main");
describe("Unit testing FilteringStrategy", function () {
    var dataGenerator;
    var data;
    var fs;
    beforeEach(function () {
        dataGenerator = new data_generator_1.DataGenerator();
        data = dataGenerator.data;
        fs = new main_1.FilteringStrategy();
    });
    it("tests `filter`", function () {
        var res = fs.filter(data, [{
                condition: main_1.FilteringCondition.number.greaterThan,
                fieldName: "number",
                searchVal: 1
            }]);
        expect(dataGenerator.getValuesForColumn(res, "number"))
            .toEqual([2, 3, 4]);
    });
    it("tests `matchRecordByExpressions`", function () {
        var rec = data[0];
        var res = fs.matchRecordByExpressions(rec, [
            {
                condition: main_1.FilteringCondition.string.contains,
                fieldName: "string",
                ignoreCase: false,
                searchVal: "ROW"
            },
            {
                condition: main_1.FilteringCondition.number.lessThan,
                fieldName: "number",
                searchVal: 1
            }
        ], main_1.FilteringLogic.Or);
        expect(res).toBeTruthy();
    });
    it("tests `findMatch`", function () {
        var rec = data[0];
        var res = fs.findMatch(rec, {
            condition: main_1.FilteringCondition.boolean.false,
            fieldName: "boolean"
        }, -1);
        expect(res).toBeTruthy();
    });
    it("tests default settings", function () {
        data[0].string = "ROW";
        var filterstr = new main_1.FilteringStrategy();
        var res = filterstr.filter(data, [{
                condition: main_1.FilteringCondition.string.contains,
                fieldName: "string",
                searchVal: "ROW"
            }]);
        expect(dataGenerator.getValuesForColumn(res, "number"))
            .toEqual([0]);
    });
});

//# sourceMappingURL=filtering-strategy.spec.js.map
