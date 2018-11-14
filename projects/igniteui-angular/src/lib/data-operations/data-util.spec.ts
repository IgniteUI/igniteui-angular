import {
    async
} from '@angular/core/testing';
import { DataGenerator } from './test-util/data-generator';

import { DefaultSortingStrategy } from './sorting-strategy';
import { cloneArray } from '../core/utils';
import { ISortingExpression, SortingDirection } from './sorting-expression.interface';
import { DataUtil } from './data-util';
import { IGroupByResult } from './grouping-strategy';
import { IGroupingState } from './groupby-state.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { FilteringStrategy } from './filtering-strategy';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from './filtering-expressions-tree';
import { IFilteringState } from './filtering-state.interface';
import { FilteringLogic } from './filtering-expression.interface';
import { IgxNumberFilteringOperand,
    IgxStringFilteringOperand,
    IgxDateFilteringOperand,
    IgxBooleanFilteringOperand } from './filtering-condition';
import { IPagingState, PagingError } from './paging-state.interface';

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
                fieldName: 'number',
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            };
            const res = DataUtil.sort(data, [se]);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual(dataGenerator.generateArray(4, 0));
        });
        it('sorts ascending column \'boolean\'', () => {
            const se: ISortingExpression = {
                dir: SortingDirection.Asc,
                fieldName: 'boolean',
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            };
            const res = DataUtil.sort(data, [se]);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                .toEqual([false, false, false, true, true]);
        });
        // test multiple sorting
        it('sorts descending column \'boolean\', sorts \'date\' ascending', () => {
            const se0: ISortingExpression = {
                dir: SortingDirection.Desc,
                fieldName: 'boolean',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            };
            const se1: ISortingExpression = {
                dir: SortingDirection.Asc,
                fieldName: 'date',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            };
            const res = DataUtil.sort(data, [se0, se1]);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([1, 3, 0, 2, 4]);
        });
        it('sorts as applying default setting ignoreCase to false', () => {
            data[4].string = data[4].string.toUpperCase();
            const se0: ISortingExpression = {
                dir: SortingDirection.Desc,
                fieldName: 'string',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            };
            let res = DataUtil.sort(data, [se0]);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([3, 2, 1, 0, 4], 'expressionDefaults.ignoreCase = false');
            se0.ignoreCase = true;
            res = DataUtil.sort(data, [se0]);
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
            fieldName: 'boolean',
            ignoreCase: true,
            strategy: DefaultSortingStrategy.instance()
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
            let res = DataUtil.sort(data, [expr]);
            // first group pipe
            const gres = DataUtil.group(res, state);
            // second group pipe
            res = DataUtil.restoreGroups(gres, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                .toEqual([undefined, false, false, false, undefined, true, true]);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(res);
            const group1: IGroupByRecord = gres.metadata[0];
            const group2: IGroupByRecord = gres.metadata[3];
            expect(groups[0]).toEqual(null);
            expect(res[0]).toEqual(group1);
            expect(groups[4]).toEqual(null);
            expect(res[4]).toEqual(group2);
            expect(gres.metadata[0]).toEqual(gres.metadata[1]);
            expect(gres.metadata[1]).toEqual(gres.metadata[2]);
            expect(gres.metadata[3]).toEqual(gres.metadata[4]);
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
            const sorted = DataUtil.sort(data, [expr]);
            // first group pipe
            const gres = DataUtil.group(sorted, state);
            // second group pipe
            const res = DataUtil.restoreGroups(gres, state);
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
                hierarchy: [{ fieldName: 'boolean', value: false }]
            });
            // sort
            const sorted = DataUtil.sort(data, [expr]);
            // first group pipe
            const gres = DataUtil.group(sorted, state);
            // second group pipe
            const res = DataUtil.restoreGroups(gres, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                .toEqual([undefined, undefined, true, true]);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(res);
            expect(groups[0]).toEqual(null);
            expect(res[1]).toEqual(gres.metadata[4]);
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
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            };
            state.expressions.push(expr2);
            // sort
            const sorted = DataUtil.sort(data, [expr, expr2]);
            // first group pipe
            const gres = DataUtil.group(sorted, state);
            // second group pipe
            const res = DataUtil.restoreGroups(gres, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                .toEqual([undefined, undefined, false, undefined, false,
                    undefined, false, undefined, undefined, true, undefined, true]);
            expect(dataGenerator.getValuesForColumn(res, 'string'))
                .toEqual([undefined, undefined, 'row0, col1', undefined, 'row2, col1',
                    undefined, 'row4, col1', undefined, undefined, 'row1, col1', undefined, 'row3, col1']);
            const group1: IGroupByRecord = gres.metadata[0];
            const group2: IGroupByRecord = group1.groupParent;
            const group3: IGroupByRecord = gres.metadata[3];
            const group4: IGroupByRecord = group3.groupParent;
            expect(group1).toEqual(res[1]);
            expect(group2).toEqual(res[0]);
            expect(group3).toEqual(res[8]);
            expect(group4).toEqual(res[7]);
            expect(group1.level).toEqual(1);
            expect(group2.level).toEqual(0);
            expect(group3.level).toEqual(1);
            expect(group4.level).toEqual(0);
        });

        it('groups by descending column "boolean", paging', () => {
            // sort
            const sorted = DataUtil.sort(data, [expr]);
            // first group pipe
            const grouped = DataUtil.group(sorted, state);
            // page
            let paged: IGroupByResult = {
                data: cloneArray(grouped.data),
                metadata: cloneArray(grouped.metadata)
            };
            paged.data = DataUtil.page(paged.data, { index: 0, recordsPerPage: 2 });
            paged.metadata = DataUtil.page(paged.metadata, { index: 0, recordsPerPage: 2 });
            // second group pipe
            let res = DataUtil.restoreGroups(paged, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                .toEqual([undefined, false, false]);
            let groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(res);
            const group1: IGroupByRecord = grouped.metadata[0];
            expect(groups[0]).toEqual(null);
            expect(res[0]).toEqual(group1);
            expect(grouped.metadata[1]).toEqual(group1);
            expect(group1.level).toEqual(0);
            expect(group1.records).toEqual(grouped.data.slice(0, 3));
            expect(group1.value).toEqual(false);

            // page 2
            paged = {
                data: cloneArray(grouped.data),
                metadata: cloneArray(grouped.metadata)
            };
            paged.data = DataUtil.page(paged.data, { index: 1, recordsPerPage: 2 });
            paged.metadata = DataUtil.page(paged.metadata, { index: 1, recordsPerPage: 2 });
            // second group pipe
            res = DataUtil.restoreGroups(paged, state);
            expect(dataGenerator.getValuesForColumn(res, 'boolean'))
                .toEqual([undefined, false, undefined, true]);
            groups = dataGenerator.getGroupRecords(res);
            const group2: IGroupByRecord = grouped.metadata[2];
            const group3: IGroupByRecord = grouped.metadata[3];
            expect(res[0]).toEqual(group2);
            expect(groups[0]).toEqual(null);
            expect(res[2]).toEqual(group3);
            expect(groups[2]).toEqual(null);
            expect(group2.value).toEqual(false);
            expect(group3.value).toEqual(true);
            expect(group2.records).toEqual(grouped.data.slice(0, 3));
            expect(group3.records).toEqual(grouped.data.slice(3, 5));
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
            (res[0] as { string: string }).string = 'ROW';
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
            let state: IPagingState = { index: 0, recordsPerPage: 3 };
            let res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([0, 1, 2]);
            // go to second page
            state = { index: 1, recordsPerPage: 3 };
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.None);
            expect(state.metadata.countPages).toBe(2);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([3, 4]);
        });
        it('tests paging errors', () => {
            let state: IPagingState = { index: -1, recordsPerPage: 3 };
            let res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectPageIndex);
            state = { index: 3, recordsPerPage: 3 };
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectPageIndex);
            state = { index: 3, recordsPerPage: 0 };
            res = DataUtil.page(data, state);
            expect(state.metadata.error).toBe(PagingError.IncorrectRecordsPerPage);
            // test with paging state null
            res = DataUtil.page(data, null);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual(dataGenerator.generateArray(0, 4));
        });
    });
}
/* //Test paging */
describe('DataUtil', () => {
    testSort();
    testGroupBy();
    testFilter();
    testPage();
});
