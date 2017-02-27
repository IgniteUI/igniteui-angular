import {
    async,
    TestBed
} from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { By } from "@angular/platform-browser";
import { TestHelper} from "./test-util/test-helper.spec";

import {    DataUtil, 
            DataState,
            SortingState, SortingExpression, SortingDirection,
            FilteringState, FilteringLogic, FilteringExpression, FilteringStrategy, FilteringCondition,
            PagingState, PagingError 
        } from "../main";
/* Test sorting */
function testSort() {
    var data:Array<any> = [],
        helper:TestHelper = new TestHelper();
    beforeEach(async(() => {
        data = helper.generateData();
    }));
    describe('Test sorting', () => {
        it('sorts descending column "number"', () => {
            var se = <SortingExpression> {
                    fieldName: "number",
                    dir: SortingDirection.Desc
                },
                res = DataUtil.sort(data, {expressions: [se]});
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual(helper.generateArray(4, 0));
        });
        it('sorts ascending column "boolean"', () => {
            var se = <SortingExpression> {
                    fieldName: "boolean",
                    dir: SortingDirection.Asc
                },
                res = DataUtil.sort(data, {expressions: [ se ]});
            expect(helper.getValuesForColumn(res, "boolean"))
                .toEqual([false, false, false, true, true]);
        });
        // test multiple sorting
        it('sorts descending column "boolean", sorts "date" ascending', () => {
            var se0 = <SortingExpression> {
                    fieldName: "boolean",
                    dir: SortingDirection.Desc
                },
                se1 = <SortingExpression> {
                    fieldName: "date",
                    dir: SortingDirection.Asc
                },
                res = DataUtil.sort(data, {expressions: [se0, se1]});
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual([1, 3, 0, 2, 4]);
        });
        // test custom sorting
        it ('sorts using custom sorting function', () => {
            var key = "number",
                se0:SortingExpression = {
                    fieldName: key,
                    dir: SortingDirection.Asc,
                    // sorting descending
                    compareFunction: function (obj1, obj2) {
                        var a = obj1[key], b = obj2[key];
                        return b - a;
                    }
                },
            res = DataUtil.sort(data, {expressions: [se0]});
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual(helper.generateArray(4, 0));
        });
        it ("sorts as applying default setting ignoreCase to false", () => {
            data[4]["string"] = data[4]["string"].toUpperCase();
            var se0:SortingExpression = {
                    fieldName: "string",
                    dir: SortingDirection.Desc
                },
                res = DataUtil.sort(data, {
                    expressions: [se0], 
                    expressionDefaults: {ignoreCase: false}
                });
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual([3, 2, 1, 0, 4], "expressionDefaults.ignoreCase = false");
            se0.ignoreCase = true;
            res = DataUtil.sort(data, {
                    expressions: [se0],
                    expressionDefaults: {ignoreCase: false}
                });
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual(helper.generateArray(4, 0));
        });
        it('sorts without setting SortingState', () => {
            var res = DataUtil.sort(data, null);
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual(helper.generateArray(0, 4));
            res = DataUtil.sort(data, {expressions: []});
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual(helper.generateArray(0, 4));
        });
    });
}
/* //Test sorting */
/* Test filtering */
class CustomFilteringStrategy extends FilteringStrategy {
   filter<T>(data: T[],
                expressions: Array<FilteringExpression>, 
                logic?: FilteringLogic): T[] {
        var i, len = Math.ceil(data.length / 2),
            res: T[] = [], 
            rec;
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
    }
}

function testFilter() {
    var helper:TestHelper = new TestHelper(),
        data:Object[] = helper.generateData();
    describe('test filtering', () => {
        it('filters "number" column greater than 3', () => {
            var res = DataUtil.filter(data, {
                                        expressions:[{fieldName: "number", condition: FilteringCondition.number.greaterThan, searchVal: 3}]
                                    });
            expect(helper.getValuesForColumn(res, "number"))
                    .toEqual([4]);
        });
        // test string filtering - with ignoreCase true/false
        it('filters "string" column contains "row"', () => {
            var res = DataUtil.filter(data, {
                                        expressions:[
                                                {
                                                    fieldName: "string", 
                                                    condition: FilteringCondition.string.contains, 
                                                    searchVal: "row"
                                                }]
                                    });
            expect(helper.getValuesForColumn(res, "number"))
                    .toEqual(helper.getValuesForColumn(data, "number"));
            res[0]["string"] = "ROW";
            // case-sensitive
            res = DataUtil.filter(res, {
                                        expressions:[
                                                {
                                                    fieldName: "string", 
                                                    condition: FilteringCondition.string.contains, 
                                                    searchVal: "ROW",
                                                    ignoreCase: false
                                                }]
                                    });
            expect(helper.getValuesForColumn(res, "number"))
                    .toEqual([0]);
        });
        // test date
        it("filters 'date' column", () => {
            var res = DataUtil.filter(data, {
                                        expressions:[
                                                {
                                                    fieldName: "date", 
                                                    condition: FilteringCondition.date.after, 
                                                    searchVal: new Date()
                                                }]
                                    });
            expect(helper.getValuesForColumn(res, "number"))
                    .toEqual([1,2,3,4]);
        });
        it("filters 'bool' column", () => {
             var res = DataUtil.filter(data, {
                                        expressions:[
                                                {
                                                    fieldName: "boolean", 
                                                    condition: FilteringCondition.boolean.false
                                                }]
                                    });
            expect(helper.getValuesForColumn(res, "number"))
                    .toEqual([0, 2, 4]);
        });
        it("filters using custom filtering strategy", () => {
            var res = DataUtil.filter(data, {
                                        expressions:[
                                                {
                                                    fieldName: "boolean", 
                                                    condition: FilteringCondition.boolean.false
                                                }],
                                        strategy: new CustomFilteringStrategy()
                                    });
            expect(helper.getValuesForColumn(res, "number"))
                    .toEqual([0, 2]);
        });
        it("tests filtering without setting filtering expressions or filtering data state", () => {
            var res = DataUtil.filter(data, null);
            expect(res).toEqual(data, "filter(data, null)");
            res = DataUtil.filter(data, {expressions: null});
            expect(res).toEqual(data, "filter(data, {expressions: null})");
        });
    });
}
/* //Test filtering */
/* Test paging */
function testPage() {
    var helper:TestHelper = new TestHelper(),
        data:Object[] = helper.generateData();
    
    describe('test paging', () => {
        it('paginates data', () => {
            var state: PagingState = {index: 0, recordsPerPage: 3},
                res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual([0, 1, 2]);
            // go to second page
            state = {index: 1, recordsPerPage: 3};
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual([3, 4]);
        });
        it('tests paging errors', () => {
            var state: PagingState = {index: -1, recordsPerPage: 3},
                res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectPageIndex);
            state = {index: 3, recordsPerPage: 3},
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectPageIndex);
            state = {index: 3, recordsPerPage: 0},
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectRecordsPerPage);
            // test with paging state null
            res = DataUtil.page(data, null);
            expect(helper.getValuesForColumn(res, "number"))
                .toEqual(helper.generateArray(0, 4));
        });
    });
}
function testProcess() {
    describe('test process', () => {
        it('calls process as applies filtering, sorting, paging', () => {
            var metadata,
                state:DataState = {
                    filtering: {
                        expressions: [{
                            fieldName: "number", 
                            condition: FilteringCondition.number.greaterThan, 
                            searchVal: 1}]
                    },
                    sorting: {
                            expressions: [
                                {
                                    fieldName: "number",
                                    dir: SortingDirection.Desc
                                }
                            ]
                        },
                    paging: {
                        index: 1,
                        recordsPerPage: 2
                    }
                }, 
                helper:TestHelper = new TestHelper(),
                data:Object[] = helper.generateData(), 
                result = DataUtil.process(data, state);
            expect(helper.getValuesForColumn(result, "number"))
                    .toEqual([2]);
            metadata = state.paging.metadata;
            expect(metadata.countPages === 2 && metadata.error === PagingError.None)
                .toBeTruthy();
        });
    });
}
/* //Test paging */
describe('Unit testing DataUtil', () => {
    testSort();
    testFilter();
    testPage();
    // test process
    testProcess();
    // test helper function getFilteringConditionsByDataType 
    it("tests getFilteringConditionsByDataType", () => {
        var helper = new TestHelper(),
            res = DataUtil.getFilteringConditionsByDataType(null),
            stringCond = Object.keys(FilteringCondition["string"]),
            numberCond = Object.keys(FilteringCondition["number"]),
            booleanCond = Object.keys(FilteringCondition["boolean"]),
            dateCond = Object.keys(FilteringCondition["date"]);
        expect(res).toBeUndefined("getFilteringConditionsByDataType(null)");
        
        expect(
            helper.isSuperset(DataUtil.getFilteringConditionsByDataType("string"), stringCond))
                .toBeTruthy("string filtering conditions");
        expect(
            helper.isSuperset(DataUtil.getFilteringConditionsByDataType("number"), numberCond))
                .toBeTruthy("number filtering conditions");
        expect(
            helper.isSuperset(DataUtil.getFilteringConditionsByDataType("boolean"), booleanCond))
                .toBeTruthy("boolean filtering conditions");
        expect(
            helper.isSuperset(DataUtil.getFilteringConditionsByDataType("date"), dateCond))
                .toBeTruthy("date filtering conditions");
    })
    
});
