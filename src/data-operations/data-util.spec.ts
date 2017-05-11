import { Component, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { DataGenerator } from "./test-util/data-generator";

import {    DataType,
            DataUtil,
            FilteringCondition,
            FilteringLogic, FilteringStrategy, IDataState,
            IFilteringExpression, IFilteringState, IPagingState, ISortingExpression, ISortingState,
            PagingError, SortingDirection
        } from "../main";
/* Test sorting */
function testSort() {
    let data: any[] = [],
        dataGenerator: DataGenerator;
    beforeEach(async(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
    }));
    describe("Test sorting", () => {
        it('sorts descending column "number"', () => {
            const se = {
                    fieldName: "number",
                    dir: SortingDirection.Desc
                } as ISortingExpression,
                res = DataUtil.sort(data, {expressions: [se]});
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual(dataGenerator.generateArray(4, 0));
        });
        it('sorts ascending column "boolean"', () => {
            const se = {
                    fieldName: "boolean",
                    dir: SortingDirection.Asc
                } as ISortingExpression,
                res = DataUtil.sort(data, {expressions: [ se ]});
            expect(dataGenerator.getValuesForColumn(res, "boolean"))
                .toEqual([false, false, false, true, true]);
        });
        // test multiple sorting
        it('sorts descending column "boolean", sorts "date" ascending', () => {
            const se0 = {
                    fieldName: "boolean",
                    dir: SortingDirection.Desc
                } as ISortingExpression,
                se1 = {
                    fieldName: "date",
                    dir: SortingDirection.Asc
                } as ISortingExpression,
                res = DataUtil.sort(data, {expressions: [se0, se1]});
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([1, 3, 0, 2, 4]);
        });
        it ("sorts as applying default setting ignoreCase to false", () => {
            data[4].string = data[4].string.toUpperCase();
            let se0: ISortingExpression = {
                    fieldName: "string",
                    dir: SortingDirection.Desc
                },
                res = DataUtil.sort(data, {
                    expressions: [se0]
                });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([3, 2, 1, 0, 4], "expressionDefaults.ignoreCase = false");
            se0.ignoreCase = true;
            res = DataUtil.sort(data, {
                    expressions: [se0]
                });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual(dataGenerator.generateArray(4, 0));
        });
    });
}
/* //Test sorting */
/* Test filtering */
class CustomFilteringStrategy extends FilteringStrategy {
   filter<T>(data: T[],
             expressions: IFilteringExpression[],
             logic?: FilteringLogic): T[] {
        let i, len = Math.ceil(data.length / 2),
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
    const dataGenerator: DataGenerator = new DataGenerator(),
        data: Object[] = dataGenerator.data;
    describe("test filtering", () => {
        it('filters "number" column greater than 3', () => {
            const res = DataUtil.filter(data, {
                                        expressions: [{fieldName: "number", condition: FilteringCondition.number.greaterThan, searchVal: 3}]
                                    });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual([4]);
        });
        // test string filtering - with ignoreCase true/false
        it('filters "string" column contains "row"', () => {
            let res = DataUtil.filter(data, {
                                        expressions: [
                                                {
                                                    fieldName: "string",
                                                    condition: FilteringCondition.string.contains,
                                                    searchVal: "row"
                                                }]
                                    });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual(dataGenerator.getValuesForColumn(data, "number"));
            res[0].string = "ROW";
            // case-sensitive
            res = DataUtil.filter(res, {
                                        expressions: [
                                                {
                                                    fieldName: "string",
                                                    condition: FilteringCondition.string.contains,
                                                    searchVal: "ROW",
                                                    ignoreCase: false
                                                }]
                                    });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual([0]);
        });
        // test date
        it("filters 'date' column", () => {
            const res = DataUtil.filter(data, {
                                        expressions: [
                                                {
                                                    fieldName: "date",
                                                    condition: FilteringCondition.date.after,
                                                    searchVal: new Date()
                                                }]
                                    });
            expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual([1, 2, 3, 4]);
        });
        it("filters 'bool' column", () => {
             const res = DataUtil.filter(data, {
                                        expressions: [
                                                {
                                                    fieldName: "boolean",
                                                    condition: FilteringCondition.boolean.false
                                                }]
                                    });
             expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual([0, 2, 4]);
        });
        it("filters using custom filtering strategy", () => {
            const res = DataUtil.filter(data, {
                                        expressions: [
                                                {
                                                    fieldName: "boolean",
                                                    condition: FilteringCondition.boolean.false
                                                }],
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
    const dataGenerator: DataGenerator = new DataGenerator(),
        data: Object[] = dataGenerator.data;

    describe("test paging", () => {
        it("paginates data", () => {
            let state: IPagingState = {index: 0, recordsPerPage: 3},
                res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([0, 1, 2]);
            // go to second page
            state = {index: 1, recordsPerPage: 3};
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual([3, 4]);
        });
        it("tests paging errors", () => {
            let state: IPagingState = {index: -1, recordsPerPage: 3},
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
            expect(dataGenerator.getValuesForColumn(res, "number"))
                .toEqual(dataGenerator.generateArray(0, 4));
        });
    });
}
function testProcess() {
    describe("test process", () => {
        it("calls process as applies filtering, sorting, paging", () => {
            let metadata,
                state: IDataState = {
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
                dataGenerator: DataGenerator = new DataGenerator(),
                data: Object[] = dataGenerator.data,
                result = DataUtil.process(data, state);
            expect(dataGenerator.getValuesForColumn(result, "number"))
                    .toEqual([2]);
            metadata = state.paging.metadata;
            expect(metadata.countPages === 2 && metadata.error === PagingError.None)
                .toBeTruthy();
        });
    });
}
/* //Test paging */
describe("DataUtil", () => {
    testSort();
    testFilter();
    testPage();
    // test process
    testProcess();
    // test helper function getFilteringConditionsByDataType
    it("tests getFilteringConditionsByDataType", () => {
        const dataGenerator = new DataGenerator(),
            stringCond = Object.keys(FilteringCondition.string),
            numberCond = Object.keys(FilteringCondition.number),
            booleanCond = Object.keys(FilteringCondition.boolean),
            dateCond = Object.keys(FilteringCondition.date);

        expect(
            dataGenerator.isSuperset(DataUtil.getListOfFilteringConditionsForDataType(DataType.String), stringCond))
                .toBeTruthy("string filtering conditions");
        expect(
            dataGenerator.isSuperset(DataUtil.getListOfFilteringConditionsForDataType(DataType.Number), numberCond))
                .toBeTruthy("number filtering conditions");
        expect(
            dataGenerator.isSuperset(DataUtil.getListOfFilteringConditionsForDataType(DataType.Boolean), booleanCond))
                .toBeTruthy("boolean filtering conditions");
        expect(
            dataGenerator.isSuperset(DataUtil.getListOfFilteringConditionsForDataType(DataType.Date), dateCond))
                .toBeTruthy("date filtering conditions");
    });

});
