"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_generator_1 = require("./test-util/data-generator");
var main_1 = require("../main");
describe("Unit testing SortingStrategy", function () {
    var dataGenerator;
    var data;
    var strategy;
    beforeEach(function () {
        dataGenerator = new data_generator_1.DataGenerator();
        data = dataGenerator.data;
        strategy = new main_1.SortingStrategy();
    });
    it("tests `sort`", function () {
        var res = strategy.sort(data, [
            {
                dir: main_1.SortingDirection.Asc,
                fieldName: "boolean"
            }, {
                dir: main_1.SortingDirection.Desc,
                fieldName: "number"
            }
        ]);
        expect(dataGenerator.getValuesForColumn(res, "number"))
            .toEqual([4, 2, 0, 3, 1]);
    });
    it("tests `compareObjects`", function () {
        expect(strategy.compareValues(1, 0) === 1 &&
            strategy.compareValues(true, false) === 1 &&
            strategy.compareValues("bc", "adfc") === 1)
            .toBeTruthy("compare first argument greater than second");
        expect(strategy.compareValues(1, 2) === -1 &&
            strategy.compareValues("a", "b") === -1 &&
            strategy.compareValues(false, true) === -1)
            .toBeTruthy("compare 0, 1");
        expect(strategy.compareValues(0, 0) === 0 &&
            strategy.compareValues(true, true) === 0 &&
            strategy.compareValues("test", "test") === 0)
            .toBeTruthy("Comare equal variables");
    });
    it("tests default settings", function () {
        strategy = new main_1.SortingStrategy();
        data[4].string = "ROW";
        var res = strategy.sort(data, [{
                dir: main_1.SortingDirection.Asc,
                fieldName: "string"
            }]);
        expect(dataGenerator.getValuesForColumn(res, "number"))
            .toEqual([4, 0, 1, 2, 3]);
    });
});

//# sourceMappingURL=sorting-strategy.spec.js.map
