"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_generator_1 = require("./test-util/data-generator");
var main_1 = require("../main");
describe("Unit testing StableSortingStrategy", function () {
    var dataGenerator;
    var data;
    var strategy;
    beforeEach(function () {
        dataGenerator = new data_generator_1.DataGenerator(100);
        data = dataGenerator.data;
        strategy = new main_1.StableSortingStrategy();
    });
    it("tests `sort`", function () {
        var sort0;
        var sort1;
        data.forEach(function (item, index) { return item.number = index % 2 ? 0 : 1; });
        strategy.sort(data, [{ fieldName: "number", dir: main_1.SortingDirection.Asc }]);
        sort0 = dataGenerator.getValuesForColumn(data, "string").join("");
        strategy.sort(data, [{ fieldName: "number", dir: main_1.SortingDirection.Asc }]);
        sort1 = dataGenerator.getValuesForColumn(data, "string").join("");
        expect(sort0).toEqual(sort1);
    });
});

//# sourceMappingURL=stable-sorting-strategy.spec.js.map
