import { Component, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DataGenerator } from './test-util/data-generator';

import {    DataType,
            DataUtil,
            FilteringCondition,
            FilteringLogic, FilteringStrategy, IDataState,
            IFilteringExpression, IFilteringState,
            IGroupByRecord, IGroupingState,
            IPagingState,
            ISortingExpression, ISortingState,
            PagingError, SortingDirection
        } from '../../public_api';
/* Test sorting */
function testSort() {
    let data: any[] = [];
    let dataGenerator: DataGenerator;
    beforeEach(async(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
    }));
    describe('Test sorting', () => {
        it('sorts descending column \'number\'', () => {
            const se: ISortingExpression = {
                dir: SortingDirection.Desc,
                fieldName: 'number'
            };
            const res = DataUtil.sort(data, {expressions: [se]});
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual(dataGenerator.generateArray(4, 0));
        });
        it('sorts ascending column \'boolean\'', () => {
            const se: ISortingExpression = {
                dir: SortingDirection.Asc,
                fieldName: 'boolean'
            };
            const res = DataUtil.sort(data, {expressions: [ se ]});
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                .toEqual([false, false, false, true, true]);
        });
        // test multiple sorting
        it('sorts descending column \'boolean\', sorts \'date\' ascending', () => {
            const se0: ISortingExpression = {
                dir: SortingDirection.Desc,
                fieldName: 'boolean'
            };
            const se1: ISortingExpression = {
                dir: SortingDirection.Asc,
                fieldName: 'date'
            };
            const res = DataUtil.sort(data, {expressions: [se0, se1]});
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([1, 3, 0, 2, 4]);
        });
        it ('sorts as applying default setting ignoreCase to false', () => {
            data[4].string = data[4].string.toUpperCase();
            const se0: ISortingExpression = {
                    dir: SortingDirection.Desc,
                    fieldName: 'string'
                };
            let res = DataUtil.sort(data, {
                expressions: [se0]
            });
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([3, 2, 1, 0, 4], 'expressionDefaults.ignoreCase = false');
            se0.ignoreCase = true;
            res = DataUtil.sort(data, {
                    expressions: [se0]
                });
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual(dataGenerator.generateArray(4, 0));
        });
    });
}

function testGroupBy() {
    let data: any[] = [];
    let dataGenerator: DataGenerator;
    let expr: ISortingExpression;
    let state: IGroupingState;
    beforeEach(async(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
        expr = {
            dir: SortingDirection.Asc,
            fieldName: 'boolean'
        };
        state = {
            expressions: [expr],
            expansion: [],
            defaultExpanded: true
        };
    }));
    describe('Test groupBy', () => {
        it('groups by descending column "boolean", expanded', () => {
            // sort
            let res = DataUtil.sort(data, { expressions: [expr] });
            // first group pipe
            res = DataUtil.group(res, state);
            // second group pipe
            res = DataUtil.restoreGroups(res, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                        .toEqual([undefined, false, false, false, undefined, true, true]);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(res);
            const group1: IGroupByRecord = groups[1];
            const group2: IGroupByRecord = groups[5];
            expect(groups[0]).toEqual(null);
            expect(res[0]).toEqual(group1);
            expect(groups[2]).toEqual(group1);
            expect(groups[3]).toEqual(group1);
            expect(groups[4]).toEqual(null);
            expect(res[4]).toEqual(group2);
            expect(groups[6]).toEqual(group2);
            expect(group1.level).toEqual(0);
            expect(group2.level).toEqual(0);
            expect(group1.records).toEqual(res.slice(1, 4));
            expect(group2.records).toEqual(res.slice(5, 7));
            expect(group1.value).toEqual(false);
            expect(group2.value).toEqual(true);
        });

        it('groups by descending column "boolean", collapsed', () => {
            state.defaultExpanded = false;
            // sort
            const sorted = DataUtil.sort(data, { expressions: [expr] });
            // first group pipe
            let res = DataUtil.group(sorted, state);
            // second group pipe
            res = DataUtil.restoreGroups(res, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                        .toEqual([undefined, undefined]);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(res);
            expect(groups[0]).toEqual(null);
            expect(groups[1]).toEqual(null);
            expect(res[0].level).toEqual(0);
            expect(res[1].level).toEqual(0);
            expect(res[0].records).toEqual(sorted.slice(0, 3));
            expect(res[1].records).toEqual(sorted.slice(3, 5));
            expect(res[0].value).toEqual(false);
            expect(res[1].value).toEqual(true);
        });

        it('groups by ascending column "boolean", partially collapsed', () => {
            state.expansion.push({
                expanded: false,
                value: false,
                fieldName: 'boolean'
            });
            // sort
            const sorted = DataUtil.sort(data, { expressions: [expr] });
            // first group pipe
            let res = DataUtil.group(sorted, state);
            // second group pipe
            res = DataUtil.restoreGroups(res, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                        .toEqual([undefined, undefined, true, true]);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(res);
            expect(groups[0]).toEqual(null);
            expect(res[1]).toEqual(groups[2]);
            expect(res[0].level).toEqual(0);
            expect(res[1].level).toEqual(0);
            expect(res[0].records).toEqual(sorted.slice(0, 3));
            expect(res[1].records).toEqual(sorted.slice(3, 5));
            expect(res[0].value).toEqual(false);
            expect(res[1].value).toEqual(true);
        });

        it('two level groups', () => {
            const expr2 = {
                fieldName: 'string',
                dir: SortingDirection.Asc
            };
            state.expressions.push(expr2);
            // sort
            const sorted = DataUtil.sort(data, { expressions: [expr, expr2] });
            // first group pipe
            let res = DataUtil.group(sorted, state);
            // second group pipe
            res = DataUtil.restoreGroups(res, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                        .toEqual([undefined, undefined, false, undefined, false,
                            undefined, false, undefined, undefined, true, undefined, true]);
            expect(dataGenerator.getValuesForColumn(res, 'string'))
                        .toEqual([undefined, undefined, 'row0, col1', undefined, 'row2, col1',
                        undefined, 'row4, col1', undefined, undefined, 'row1, col1', undefined, 'row3, col1']);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(res);
            const group1: IGroupByRecord = groups[1];
            const group2: IGroupByRecord = groups[2];
            const group3: IGroupByRecord = groups[8];
            const group4: IGroupByRecord = groups[9];
            expect(group1).toEqual(res[0]);
            expect(group2).toEqual(res[1]);
            expect(group3).toEqual(res[7]);
            expect(group4).toEqual(res[8]);
            expect(group1.level).toEqual(0);
            expect(group2.level).toEqual(1);
            expect(group3.level).toEqual(0);
            expect(group4.level).toEqual(1);
        });

        it('groups by descending column "boolean", paging', () => {
            // sort
            const sorted = DataUtil.sort(data, { expressions: [expr] });
            // first group pipe
            const grouped = DataUtil.group(sorted, state);
            // page
            let res = DataUtil.page(grouped, { index: 0, recordsPerPage: 2 });
            // second group pipe
            res = DataUtil.restoreGroups(res, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                        .toEqual([undefined, false, false]);
            let groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(res);
            const group1: IGroupByRecord = groups[1];
            expect(groups[0]).toEqual(null);
            expect(res[0]).toEqual(group1);
            expect(groups[2]).toEqual(group1);
            expect(group1.level).toEqual(0);
            expect(group1.records).toEqual(grouped.slice(0, 3));
            expect(group1.value).toEqual(false);

            // page 2
            res = DataUtil.page(grouped, { index: 1, recordsPerPage: 2 });
            // second group pipe
            res = DataUtil.restoreGroups(res, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                        .toEqual([undefined, false, undefined, true]);
            groups = dataGenerator.getGroupRecords(res);
            const group2: IGroupByRecord = groups[1];
            const group3: IGroupByRecord = groups[3];
            expect(res[0]).toEqual(group2);
            expect(groups[0]).toEqual(null);
            expect(res[2]).toEqual(group3);
            expect(groups[2]).toEqual(null);
            expect(group2.value).toEqual(false);
            expect(group3.value).toEqual(true);
            expect(group2.records).toEqual(grouped.slice(0, 3));
            expect(group3.records).toEqual(grouped.slice(3, 5));
        });
    });
}
/* //Test sorting */
/* Test filtering */
class CustomFilteringStrategy extends FilteringStrategy {
   public filter<T>(data: T[], expressions: IFilteringExpression[], logic?: FilteringLogic): T[] {
        const len = Math.ceil(data.length / 2);
        const res: T[] = [];
        let i;
        let rec;
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
    const dataGenerator: DataGenerator = new DataGenerator();
    const data: object[] = dataGenerator.data;
    describe('test filtering', () => {
        it('filters \'number\' column greater than 3', () => {
            const res = DataUtil.filter(data, {
                expressions: [{fieldName: 'number', condition: FilteringCondition.number.greaterThan, searchVal: 3}]
            });
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([4]);
        });
        // test string filtering - with ignoreCase true/false
        it('filters \'string\' column contains \'row\'', () => {
            let res = DataUtil.filter(data, {
                                        expressions: [
                                                {
                                                    condition: FilteringCondition.string.contains,
                                                    fieldName: 'string',
                                                    searchVal: 'row'
                                                }]
                                    });
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual(dataGenerator.getValuesForColumn(data, 'number'));
            (res[0] as { string: string}).string = 'ROW';
            // case-sensitive
            res = DataUtil.filter(res, {
                                        expressions: [
                                                {
                                                    condition: FilteringCondition.string.contains,
                                                    fieldName: 'string',
                                                    ignoreCase: false,
                                                    searchVal: 'ROW'
                                                }]
                                    });
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([0]);
        });
        // test date
        it('filters \'date\' column', () => {
            const res = DataUtil.filter(data, {
                                        expressions: [
                                                {
                                                    condition: FilteringCondition.date.after,
                                                    fieldName: 'date',
                                                    searchVal: new Date()
                                                }]
                                    });
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([1, 2, 3, 4]);
        });
        it('filters \'bool\' column', () => {
             const res = DataUtil.filter(data, {
                                        expressions: [
                                                {
                                                    condition: FilteringCondition.boolean.false,
                                                    fieldName: 'boolean'
                                                }]
                                    });
             expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([0, 2, 4]);
        });
        it('filters using custom filtering strategy', () => {
            const res = DataUtil.filter(data, {
                                        expressions: [
                                                {
                                                    condition: FilteringCondition.boolean.false,
                                                    fieldName: 'boolean'
                                                }],
                                        strategy: new CustomFilteringStrategy()
                                    });
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([0, 2]);
        });
    });
}
/* //Test filtering */
/* Test paging */
function testPage() {
    const dataGenerator: DataGenerator = new DataGenerator();
    const data: object[] = dataGenerator.data;

    describe('test paging', () => {
        it('paginates data', () => {
            let state: IPagingState = {index: 0, recordsPerPage: 3};
            let res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([0, 1, 2]);
            // go to second page
            state = {index: 1, recordsPerPage: 3};
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([3, 4]);
        });
        it('tests paging errors', () => {
            let state: IPagingState = {index: -1, recordsPerPage: 3};
            let res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectPageIndex);
            state = {index: 3, recordsPerPage: 3};
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectPageIndex);
            state = {index: 3, recordsPerPage: 0};
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectRecordsPerPage);
            // test with paging state null
            res = DataUtil.page(data, null);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual(dataGenerator.generateArray(0, 4));
        });
    });
}
function testProcess() {
    describe('test process', () => {
        it('calls process as applies filtering, sorting, paging', () => {
            let metadata;
            const state: IDataState = {
                filtering: {
                    expressions: [{
                        condition: FilteringCondition.number.greaterThan,
                        fieldName: 'number',
                        searchVal: 1}]
                },
                paging: {
                    index: 1,
                    recordsPerPage: 2
                },
                sorting: {
                    expressions: [
                        {
                            dir: SortingDirection.Desc,
                            fieldName: 'number'
                        }
                    ]
                }
            };
            const dataGenerator: DataGenerator = new DataGenerator();
            const data: object[] = dataGenerator.data;
            const result = DataUtil.process(data, state);
            expect(dataGenerator.getValuesForColumn(result, 'number'))
                    .toEqual([2]);
            metadata = state.paging.metadata;
            expect(metadata.countPages === 2 && metadata.error === PagingError.None)
                .toBeTruthy();
        });
    });
}
/* //Test paging */
describe('DataUtil', () => {
    testSort();
    testGroupBy();
    testFilter();
    testPage();
    // test process
    testProcess();
    // test helper function getFilteringConditionsByDataType
    it('tests getFilteringConditionsByDataType', () => {
        const dataGenerator = new DataGenerator();
        const stringCond = Object.keys(FilteringCondition.string);
        const numberCond = Object.keys(FilteringCondition.number);
        const booleanCond = Object.keys(FilteringCondition.boolean);
        const dateCond = Object.keys(FilteringCondition.date);

        expect(
            dataGenerator.isSuperset(DataUtil.getListOfFilteringConditionsForDataType(DataType.String), stringCond))
                .toBeTruthy('string filtering conditions');
        expect(
            dataGenerator.isSuperset(DataUtil.getListOfFilteringConditionsForDataType(DataType.Number), numberCond))
                .toBeTruthy('number filtering conditions');
        expect(
            dataGenerator.isSuperset(DataUtil.getListOfFilteringConditionsForDataType(DataType.Boolean), booleanCond))
                .toBeTruthy('boolean filtering conditions');
        expect(
            dataGenerator.isSuperset(DataUtil.getListOfFilteringConditionsForDataType(DataType.Date), dateCond))
                .toBeTruthy('date filtering conditions');
    });
});
