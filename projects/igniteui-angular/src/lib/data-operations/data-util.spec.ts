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
            FilteringLogic, FilteringStrategy, IDataState,
            IFilteringExpressionsTree, IFilteringState, IPagingState, ISortingExpression, ISortingState,
            PagingError, SortingDirection, IgxStringFilteringOperand, IgxNumberFilteringOperand,
            IgxDateFilteringOperand, IgxBooleanFilteringOperand, FilteringExpressionsTree
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
/* //Test sorting */
/* Test filtering */
class CustomFilteringStrategy extends FilteringStrategy {
   public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree): T[] {
        const len = Math.ceil(data.length / 2);
        const res: T[] = [];
        let i;
        let rec;
        if (!expressionsTree || !expressionsTree.filteringOperands || expressionsTree.filteringOperands.length === 0 || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = data[i];
            if (this.matchRecord(rec, expressionsTree)) {
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
            const state: IFilteringState = {
                expressionsTree: new FilteringExpressionsTree(FilteringLogic.And)
            };
            state.expressionsTree.filteringOperands = [
                {
                    fieldName: 'number',
                    condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                    searchVal: 3
                }
            ];
            const res = DataUtil.filter(data, state);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([4]);
        });
        // test string filtering - with ignoreCase true/false
        it('filters \'string\' column contains \'row\'', () => {
            const state: IFilteringState = {
                expressionsTree: new FilteringExpressionsTree(FilteringLogic.And)
            };
            state.expressionsTree.filteringOperands = [
                {
                    condition: IgxStringFilteringOperand.instance().condition('contains'),
                    fieldName: 'string',
                    searchVal: 'row'
                }
            ];

            const stateIgnoreCase: IFilteringState = {
                expressionsTree: new FilteringExpressionsTree(FilteringLogic.And)
            };
            stateIgnoreCase.expressionsTree.filteringOperands = [
                {
                    condition: IgxStringFilteringOperand.instance().condition('contains'),
                    fieldName: 'string',
                    ignoreCase: false,
                    searchVal: 'ROW'
                }
            ];

            let res = DataUtil.filter(data, state);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual(dataGenerator.getValuesForColumn(data, 'number'));
            (res[0] as { string: string}).string = 'ROW';
            // case-sensitive
            res = DataUtil.filter(res, stateIgnoreCase);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([0]);
        });
        // test date
        it('filters \'date\' column', () => {
            const state: IFilteringState = {
                expressionsTree: new FilteringExpressionsTree(FilteringLogic.And)
            };
            state.expressionsTree.filteringOperands = [
                {
                    condition: IgxDateFilteringOperand.instance().condition('after'),
                    fieldName: 'date',
                    searchVal: new Date()
                }
            ];
            const res = DataUtil.filter(data, state);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([1, 2, 3, 4]);
        });
        it('filters \'bool\' column', () => {
            const state: IFilteringState = {
                expressionsTree: new FilteringExpressionsTree(FilteringLogic.And)
            };
            state.expressionsTree.filteringOperands = [
                {
                    condition: IgxBooleanFilteringOperand.instance().condition('false'),
                    fieldName: 'boolean'
                }
            ];
            const res = DataUtil.filter(data, state);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([0, 2, 4]);
        });
        it('filters using custom filtering strategy', () => {
            const state: IFilteringState = {
                expressionsTree: new FilteringExpressionsTree(FilteringLogic.And),
                strategy: new CustomFilteringStrategy()
            };
            state.expressionsTree.filteringOperands = [
                {
                    condition: IgxBooleanFilteringOperand.instance().condition('false'),
                    fieldName: 'boolean'
                }
            ];
            const res = DataUtil.filter(data, state);
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
            const filteringState: IFilteringState = {
                expressionsTree: new FilteringExpressionsTree(FilteringLogic.And)
            };
            filteringState.expressionsTree.filteringOperands = [
                {
                    condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                    fieldName: 'number',
                    searchVal: 1
                }
            ];
            const state: IDataState = {
                filtering: filteringState,
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
    testFilter();
    testPage();
    // test process
    testProcess();
});
