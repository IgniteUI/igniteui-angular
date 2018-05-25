"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var data_generator_1 = require("./test-util/data-generator");
var main_1 = require("../main");
/* Test sorting */
function testSort() {
    var data = [];
    var dataGenerator;
    beforeEach(testing_1.async(function () {
        dataGenerator = new data_generator_1.DataGenerator();
        data = dataGenerator.data;
    }));
    describe("Test sorting", function () {
        it('sorts descending column "number"', function () {
            var se = {
                dir: main_1.SortingDirection.Desc,
                fieldName: "number"
            };
            var res = main_1.DataUtil.sort(data, { expressions: [se] });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual(dataGenerator.generateArray(4, 0));
        });
        it('sorts ascending column "boolean"', function () {
            var se = {
                dir: main_1.SortingDirection.Asc,
                fieldName: "boolean"
            };
            var res = main_1.DataUtil.sort(data, { expressions: [se] });
            expect(dataGenerator.getValuesForColumn(res, "boolean"))
                .toEqual([false, false, false, true, true]);
        });
        // test multiple sorting
        it('sorts descending column "boolean", sorts "date" ascending', function () {
            var se0 = {
                dir: main_1.SortingDirection.Desc,
                fieldName: "boolean"
            };
            var se1 = {
                dir: main_1.SortingDirection.Asc,
                fieldName: "date"
            };
            var res = main_1.DataUtil.sort(data, { expressions: [se0, se1] });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([1, 3, 0, 2, 4]);
        });
        it("sorts as applying default setting ignoreCase to false", function () {
            data[4].string = data[4].string.toUpperCase();
            var se0 = {
                dir: main_1.SortingDirection.Desc,
                fieldName: "string"
            };
            var res = main_1.DataUtil.sort(data, {
                expressions: [se0]
            });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([3, 2, 1, 0, 4], "expressionDefaults.ignoreCase = false");
            se0.ignoreCase = true;
            res = main_1.DataUtil.sort(data, {
                expressions: [se0]
            });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual(dataGenerator.generateArray(4, 0));
        });
    });
}
/* //Test sorting */
/* Test filtering */
var CustomFilteringStrategy = (function (_super) {
    __extends(CustomFilteringStrategy, _super);
    function CustomFilteringStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomFilteringStrategy.prototype.filter = function (data, expressions, logic) {
        var len = Math.ceil(data.length / 2);
        var res = [];
        var i;
        var rec;
        if (!expressions || !expressions.length || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = data[i];
            if (this.matchRecordByExpressions(rec, expressions, logic)) {
                res.push(rec);
            }
        }
        return res;
    };
    return CustomFilteringStrategy;
}(main_1.FilteringStrategy));
function testFilter() {
    var dataGenerator = new data_generator_1.DataGenerator();
    var data = dataGenerator.data;
    describe("test filtering", function () {
        it('filters "number" column greater than 3', function () {
            var res = main_1.DataUtil.filter(data, {
                expressions: [{ fieldName: "number", condition: main_1.FilteringCondition.number.greaterThan, searchVal: 3 }]
            });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([4]);
        });
        // test string filtering - with ignoreCase true/false
        it('filters "string" column contains "row"', function () {
            var res = main_1.DataUtil.filter(data, {
                expressions: [
                    {
                        condition: main_1.FilteringCondition.string.contains,
                        fieldName: "string",
                        searchVal: "row"
                    }
                ]
            });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual(dataGenerator.getValuesForColumn(data, "number"));
            res[0].string = "ROW";
            // case-sensitive
            res = main_1.DataUtil.filter(res, {
                expressions: [
                    {
                        condition: main_1.FilteringCondition.string.contains,
                        fieldName: "string",
                        ignoreCase: false,
                        searchVal: "ROW"
                    }
                ]
            });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([0]);
        });
        // test date
        it("filters 'date' column", function () {
            var res = main_1.DataUtil.filter(data, {
                expressions: [
                    {
                        condition: main_1.FilteringCondition.date.after,
                        fieldName: "date",
                        searchVal: new Date()
                    }
                ]
            });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([1, 2, 3, 4]);
        });
        it("filters 'bool' column", function () {
            var res = main_1.DataUtil.filter(data, {
                expressions: [
                    {
                        condition: main_1.FilteringCondition.boolean.false,
                        fieldName: "boolean"
                    }
                ]
            });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([0, 2, 4]);
        });
        it("filters using custom filtering strategy", function () {
            var res = main_1.DataUtil.filter(data, {
                expressions: [
                    {
                        condition: main_1.FilteringCondition.boolean.false,
                        fieldName: "boolean"
                    }
                ],
                strategy: new CustomFilteringStrategy()
            });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([0, 2]);
        });
    });
}
/* //Test filtering */
/* Test paging */
function testPage() {
    var dataGenerator = new data_generator_1.DataGenerator();
    var data = dataGenerator.data;
    describe("test paging", function () {
        it("paginates data", function () {
            var state = { index: 0, recordsPerPage: 3 };
            var res = main_1.DataUtil.page(data, state);
            expect(state.metadata.error).toBe(main_1.PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([0, 1, 2]);
            // go to second page
            state = { index: 1, recordsPerPage: 3 };
            res = main_1.DataUtil.page(data, state);
            expect(state.metadata.error).toBe(main_1.PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([3, 4]);
        });
        it("tests paging errors", function () {
            var state = { index: -1, recordsPerPage: 3 };
            var res = main_1.DataUtil.page(data, state);
            expect(state.metadata.error).toBe(main_1.PagingError.IncorrectPageIndex);
            state = { index: 3, recordsPerPage: 3 },
                res = main_1.DataUtil.page(data, state);
            expect(state.metadata.error).toBe(main_1.PagingError.IncorrectPageIndex);
            state = { index: 3, recordsPerPage: 0 },
                res = main_1.DataUtil.page(data, state);
            expect(state.metadata.error).toBe(main_1.PagingError.IncorrectRecordsPerPage);
            // test with paging state null
            res = main_1.DataUtil.page(data, null);
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual(dataGenerator.generateArray(0, 4));
        });
    });
}
function testProcess() {
    describe("test process", function () {
        it("calls process as applies filtering, sorting, paging", function () {
            var metadata;
            var state = {
                filtering: {
                    expressions: [{
                            condition: main_1.FilteringCondition.number.greaterThan,
                            fieldName: "number",
                            searchVal: 1
                        }]
                },
                paging: {
                    index: 1,
                    recordsPerPage: 2
                },
                sorting: {
                    expressions: [
                        {
                            dir: main_1.SortingDirection.Desc,
                            fieldName: "number"
                        }
                    ]
                }
            };
            var dataGenerator = new data_generator_1.DataGenerator();
            var data = dataGenerator.data;
            var result = main_1.DataUtil.process(data, state);
            expect(dataGenerator.getValuesForColumn(result, "number"))
                .toEqual([2]);
            metadata = state.paging.metadata;
            expect(metadata.countPages === 2 && metadata.error === main_1.PagingError.None)
                .toBeTruthy();
        });
    });
}
/* //Test paging */
describe("DataUtil", function () {
    testSort();
    testFilter();
    testPage();
    // test process
    testProcess();
    // test helper function getFilteringConditionsByDataType
    it("tests getFilteringConditionsByDataType", function () {
        var dataGenerator = new data_generator_1.DataGenerator();
        var stringCond = Object.keys(main_1.FilteringCondition.string);
        var numberCond = Object.keys(main_1.FilteringCondition.number);
        var booleanCond = Object.keys(main_1.FilteringCondition.boolean);
        var dateCond = Object.keys(main_1.FilteringCondition.date);
        expect(dataGenerator.isSuperset(main_1.DataUtil.getListOfFilteringConditionsForDataType(main_1.DataType.String), stringCond))
            .toBeTruthy("string filtering conditions");
        expect(dataGenerator.isSuperset(main_1.DataUtil.getListOfFilteringConditionsForDataType(main_1.DataType.Number), numberCond))
            .toBeTruthy("number filtering conditions");
        expect(dataGenerator.isSuperset(main_1.DataUtil.getListOfFilteringConditionsForDataType(main_1.DataType.Boolean), booleanCond))
            .toBeTruthy("boolean filtering conditions");
        expect(dataGenerator.isSuperset(main_1.DataUtil.getListOfFilteringConditionsForDataType(main_1.DataType.Date), dateCond))
            .toBeTruthy("date filtering conditions");
    });
});

//# sourceMappingURL=data-util.spec.js.map
