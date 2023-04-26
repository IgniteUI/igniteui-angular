import { waitForAsync } from '@angular/core/testing';
import { DataGenerator } from './test-util/data-generator';

import { DefaultSortingStrategy, ISortingExpression, SortingDirection } from './sorting-strategy';
import { cloneArray } from '../core/utils';
import { DataUtil } from './data-util';
import { IGroupByResult } from './grouping-result.interface';
import { IGroupingState } from './groupby-state.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { FilteringStrategy, FilterUtil } from './filtering-strategy';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from './filtering-expressions-tree';
import { IFilteringState } from './filtering-state.interface';
import { FilteringLogic } from './filtering-expression.interface';
import {
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand,
    IgxDateFilteringOperand,
    IgxBooleanFilteringOperand
} from './filtering-condition';
import { IPagingState, PagingError } from './paging-state.interface';
import { SampleTestData } from '../test-utils/sample-test-data.spec';
import { Transaction, TransactionType, HierarchicalTransaction } from '../services/public_api';
import { DefaultDataCloneStrategy } from './data-clone-strategy';

/* Test sorting */
const testSort = () => {
    let data: any[] = [];
    let dataGenerator: DataGenerator;
    beforeEach(waitForAsync(() => {
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
};

const testGroupBy = () => {
    let data: any[] = [];
    let dataGenerator: DataGenerator;
    let expr: ISortingExpression;
    let state: IGroupingState;
    beforeEach(waitForAsync(() => {
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
            let result = DataUtil.sort(data, [expr]);
            // group by
            const groupResult = DataUtil.group(result, state);
            result = groupResult.data;
            expect(dataGenerator.getValuesForColumn(result, 'boolean'))
                .toEqual([undefined, false, false, false, undefined, true, true]);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(result);
            const group1: IGroupByRecord = groupResult.metadata[1];
            const group2: IGroupByRecord = groupResult.metadata[5];
            expect(groups[0]).toEqual(null);
            expect(result[0]).toEqual(group1);
            expect(groups[4]).toEqual(null);
            expect(result[4]).toEqual(group2);
            expect(groupResult.metadata[1]).toEqual(groupResult.metadata[2]);
            expect(groupResult.metadata[2]).toEqual(groupResult.metadata[3]);
            expect(groupResult.metadata[5]).toEqual(groupResult.metadata[6]);
            expect(group1.level).toEqual(0);
            expect(group2.level).toEqual(0);
            expect(group1.records).toEqual(result.slice(1, 4));
            expect(group2.records).toEqual(result.slice(5, 7));
            expect(group1.value).toEqual(false);
            expect(group2.value).toEqual(true);
        });

        it('groups by descending column "boolean", collapsed', () => {
            state.defaultExpanded = false;
            // sort
            const sorted = DataUtil.sort(data, [expr]);
            // group by
            const groupResult = DataUtil.group(sorted, state);
            const result = groupResult.data;
            expect(dataGenerator.getValuesForColumn(result, 'boolean'))
                .toEqual([undefined, undefined]);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(result);
            expect(groups[0]).toEqual(null);
            expect(groups[1]).toEqual(null);
            expect(result[0].level).toEqual(0);
            expect(result[1].level).toEqual(0);
            expect(result[0].records).toEqual(sorted.slice(0, 3));
            expect(result[1].records).toEqual(sorted.slice(3, 5));
            expect(result[0].value).toEqual(false);
            expect(result[1].value).toEqual(true);
        });

        it('groups by ascending column "boolean", partially collapsed', () => {
            state.expansion.push({
                expanded: false,
                hierarchy: [{ fieldName: 'boolean', value: false }]
            });
            // sort
            const sorted = DataUtil.sort(data, [expr]);
            // group by
            const groupRecords = DataUtil.group(sorted, state);
            const result = groupRecords.data;
            expect(dataGenerator.getValuesForColumn(result, 'boolean'))
                .toEqual([undefined, undefined, true, true]);
            const groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(result);
            expect(groups[0]).toEqual(null);
            expect(result[1]).toEqual(groupRecords.metadata[2]);
            expect(result[0].level).toEqual(0);
            expect(result[1].level).toEqual(0);
            expect(result[0].records).toEqual(sorted.slice(0, 3));
            expect(result[1].records).toEqual(sorted.slice(3, 5));
            expect(result[0].value).toEqual(false);
            expect(result[1].value).toEqual(true);
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
            // group by
            const groupRecords = DataUtil.group(sorted, state);
            const result = groupRecords.data;
            expect(dataGenerator.getValuesForColumn(result, 'boolean'))
                .toEqual([undefined, undefined, false, undefined, false,
                    undefined, false, undefined, undefined, true, undefined, true]);
            expect(dataGenerator.getValuesForColumn(result, 'string'))
                .toEqual([undefined, undefined, 'row0, col1', undefined, 'row2, col1',
                    undefined, 'row4, col1', undefined, undefined, 'row1, col1', undefined, 'row3, col1']);
            const group1: IGroupByRecord = groupRecords.metadata[2];
            const group2: IGroupByRecord = group1.groupParent;
            const group3: IGroupByRecord = groupRecords.metadata[9];
            const group4: IGroupByRecord = group3.groupParent;
            expect(group1).toEqual(result[1]);
            expect(group2).toEqual(result[0]);
            expect(group3).toEqual(result[8]);
            expect(group4).toEqual(result[7]);
            expect(group1.level).toEqual(1);
            expect(group2.level).toEqual(0);
            expect(group3.level).toEqual(1);
            expect(group4.level).toEqual(0);
        });

        it('groups by descending column "boolean", paging', () => {
            // sort
            const sorted = DataUtil.sort(data, [expr]);
            // group by
            const groupResult = DataUtil.group(sorted, state);
            // page
            let paged: IGroupByResult = {
                data: cloneArray(groupResult.data),
                metadata: cloneArray(groupResult.metadata)
            };
            paged.data = DataUtil.page(paged.data, { index: 0, recordsPerPage: 3 });
            paged.metadata = DataUtil.page(paged.metadata, { index: 0, recordsPerPage: 3 });
            expect(dataGenerator.getValuesForColumn(paged.data, 'boolean'))
                .toEqual([undefined, false, false]);
            let groups: Array<IGroupByRecord> = dataGenerator.getGroupRecords(paged.data);
            const group1: IGroupByRecord = paged.metadata[1];
            expect(groups[0]).toEqual(null);
            expect(paged.data[0]).toEqual(group1);
            expect(paged.metadata[2]).toEqual(group1);
            expect(group1.level).toEqual(0);
            expect(group1.records).toEqual(sorted.slice(0, 3));
            expect(group1.value).toEqual(false);

            // page 2
            paged = {
                data: cloneArray(groupResult.data),
                metadata: cloneArray(groupResult.metadata)
            };
            paged.data = DataUtil.page(paged.data, { index: 1, recordsPerPage: 3 });
            paged.metadata = DataUtil.page(paged.metadata, { index: 1, recordsPerPage: 3 });
            expect(dataGenerator.getValuesForColumn(paged.data, 'boolean'))
                .toEqual([false, undefined, true]);
            groups = dataGenerator.getGroupRecords(paged.data);
            const group2: IGroupByRecord = paged.metadata[0];
            const group3: IGroupByRecord = paged.metadata[2];
            // group is split
            expect(group2).toEqual(group1);
            expect(paged.data[1]).toEqual(group3);
            expect(groups[1]).toEqual(null);
            expect(group2.value).toEqual(false);
            expect(group3.value).toEqual(true);
            expect(group2.records).toEqual(sorted.slice(0, 3));
            expect(group3.records).toEqual(sorted.slice(3, 5));
        });

        it('provides groupsRecords array', () => {
            const groupRecords = [];
            // sort
            const res = DataUtil.sort(data, [expr]);
            // group by
            DataUtil.group(res, state, undefined, null, groupRecords);
            expect(groupRecords.length).toEqual(2);
            expect(groupRecords[0].records.length).toEqual(3);
            expect(groupRecords[1].records.length).toEqual(2);
            expect(groupRecords[0].groups.length).toEqual(0);
            expect(groupRecords[1].groups.length).toEqual(0);
            const expr2 = {
                fieldName: 'string',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            };
            state.expressions.push(expr2);
            // sort
            const sorted = DataUtil.sort(data, [expr, expr2]);
             // group by
            DataUtil.group(sorted, state, undefined, null, groupRecords);
            expect(groupRecords.length).toEqual(2);
            expect(groupRecords[0].records.length).toEqual(3);
            expect(groupRecords[1].records.length).toEqual(2);
            expect(groupRecords[0].groups.length).toEqual(3);
            expect(groupRecords[1].groups.length).toEqual(2);
        });

        it('produces correct mixed collapse/expand state for three groups', () => {
            const expr2 = {
                fieldName: 'string',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            };
            const expr3 = {
                fieldName: 'string',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            };
            state.expressions.push(expr2);
            state.expressions.push(expr3);
            state.expansion.push({
                expanded: true,
                hierarchy: [{ fieldName: 'boolean', value: true }]
            });
            state.defaultExpanded = false;
            // sort
            const sorted = DataUtil.sort(data, [expr, expr2, expr3]);
            // group by
            const groupResult = DataUtil.group(sorted, state);
            const result = groupResult.data;
            expect(result.length).toEqual(4);
            expect(result[1].groups[0]).toEqual(result[2]);
            expect(result[1].groups[1]).toEqual(result[3]);
        });
    });
};
/* //Test sorting */

/* Test filtering */
class CustomFilteringStrategy extends FilteringStrategy {
    public override filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree): T[] {
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

const testFilter = () => {
    const dataGenerator: DataGenerator = new DataGenerator();
    const data: any[] = dataGenerator.data;
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
            const res = FilterUtil.filter(data, state);
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

            let res = FilterUtil.filter(data, state);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual(dataGenerator.getValuesForColumn(data, 'number'));
            (res[0] as { string: string }).string = 'ROW';
            // case-sensitive
            res = FilterUtil.filter(res, stateIgnoreCase);
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
            const res = FilterUtil.filter(data, state);
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
            const res = FilterUtil.filter(data, state);
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
            const res = FilterUtil.filter(data, state);
            expect(dataGenerator.getValuesForColumn(res, 'number'))
                .toEqual([0, 2]);
        });
    });
};
/* //Test filtering */

/* Test paging */
const testPage = () => {
    const dataGenerator: DataGenerator = new DataGenerator();
    const data: any[] = dataGenerator.data;

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
};
/* //Test paging */

/* Test merging */
const testMerging = () => {
    describe('Test merging', () => {
        it('Should merge add transactions correctly', () => {
            const data = SampleTestData.personIDNameData();
            const addRow4 = { ID: 4, IsEmployed: true, Name: 'Peter' };
            const addRow5 = { ID: 5, IsEmployed: true, Name: 'Mimi' };
            const addRow6 = { ID: 6, IsEmployed: false, Name: 'Pedro' };
            const transactions: Transaction[] = [
                { id: addRow4.ID, newValue: addRow4, type: TransactionType.ADD },
                { id: addRow5.ID, newValue: addRow5, type: TransactionType.ADD },
                { id: addRow6.ID, newValue: addRow6, type: TransactionType.ADD },
            ];

            DataUtil.mergeTransactions(data, transactions, 'ID');
            expect(data.length).toBe(6);
            expect(data[3]).toBe(addRow4);
            expect(data[4]).toBe(addRow5);
            expect(data[5]).toBe(addRow6);
        });

        it('Should merge update transactions correctly', () => {
            const data = SampleTestData.personIDNameData();
            const transactions: Transaction[] = [
                { id: 1, newValue: { Name: 'Peter' }, type: TransactionType.UPDATE },
                { id: 3, newValue: { Name: 'Mimi' }, type: TransactionType.UPDATE },
            ];

            DataUtil.mergeTransactions(data, transactions, 'ID');
            expect(data.length).toBe(3);
            expect(data[0].Name).toBe('Peter');
            expect(data[2].Name).toBe('Mimi');
        });

        it('Should merge delete transactions correctly', () => {
            const cloneStrategy = new DefaultDataCloneStrategy();
            const data = SampleTestData.personIDNameData();
            const secondRow = data[1];
            const transactions: Transaction[] = [
                { id: 1, newValue: null, type: TransactionType.DELETE },
                { id: 3, newValue: null, type: TransactionType.DELETE },
            ];

            DataUtil.mergeTransactions(data, transactions, 'ID', cloneStrategy, true);
            expect(data.length).toBe(1);
            expect(data[0]).toEqual(secondRow);
        });

        it('Should merge add hierarchical transactions correctly', () => {
            const cloneStrategy = new DefaultDataCloneStrategy();
            const data = SampleTestData.employeeSmallTreeData();
            const addRootRow = { ID: 1000, Name: 'Pit Peter', HireDate: new Date(2008, 3, 20), Age: 55 };
            const addChildRow1 = { ID: 1001, Name: 'Marry May', HireDate: new Date(2018, 4, 1), Age: 102 };
            const addChildRow2 = { ID: 1002, Name: 'April Alison', HireDate: new Date(2021, 5, 10), Age: 4 };
            const transactions: HierarchicalTransaction[] = [
                { id: addRootRow.ID, newValue: addRootRow, type: TransactionType.ADD, path: [] },
                { id: addChildRow1.ID, newValue: addChildRow1, type: TransactionType.ADD, path: [data[0].ID, data[0].Employees[1].ID] },
                { id: addChildRow2.ID, newValue: addChildRow2, type: TransactionType.ADD, path: [addRootRow.ID] },
            ];

            DataUtil.mergeHierarchicalTransactions(data, transactions, 'Employees', 'ID', cloneStrategy, false);
            expect(data.length).toBe(4);

            expect(data[3].Age).toBe(addRootRow.Age);
            expect(data[3].Employees.length).toBe(1);
            expect(data[3].HireDate).toBe(addRootRow.HireDate);
            expect(data[3].ID).toBe(addRootRow.ID);
            expect(data[3].Name).toBe(addRootRow.Name);

            expect((data[0].Employees[1] as any).Employees.length).toBe(1);
            expect((data[0].Employees[1] as any).Employees[0]).toBe(addChildRow1);

            expect(data[3].Employees[0]).toBe(addChildRow2);
        });

        it('Should merge update hierarchical transactions correctly', () => {
            const cloneStrategy = new DefaultDataCloneStrategy();
            const data = SampleTestData.employeeSmallTreeData();
            const updateRootRow = { Name: 'May Peter', Age: 13 };
            const updateChildRow1 = { HireDate: new Date(2100, 1, 12), Age: 1300 };
            const updateChildRow2 = { HireDate: new Date(2100, 1, 12), Name: 'Santa Claus' };

            const transactions: HierarchicalTransaction[] = [
                {
                    id: data[1].ID,
                    newValue: updateRootRow,
                    type: TransactionType.UPDATE,
                    path: []
                },
                {
                    id: data[2].Employees[0].ID,
                    newValue: updateChildRow1,
                    type: TransactionType.UPDATE,
                    path: [data[2].ID]
                },
                {
                    id: (data[0].Employees[2] as any).Employees[0].ID,
                    newValue: updateChildRow2,
                    type: TransactionType.UPDATE,
                    path: [data[0].ID, data[0].Employees[2].ID]
                },
            ];

            DataUtil.mergeHierarchicalTransactions(data, transactions, 'Employees', 'ID',cloneStrategy, false);
            expect(data[1].Name).toBe(updateRootRow.Name);
            expect(data[1].Age).toBe(updateRootRow.Age);

            expect(data[2].Employees[0].HireDate.getTime()).toBe(updateChildRow1.HireDate.getTime());
            expect(data[2].Employees[0].Age).toBe(updateChildRow1.Age);

            expect((data[0].Employees[2] as any).Employees[0].Name).toBe(updateChildRow2.Name);
            expect((data[0].Employees[2] as any).Employees[0].HireDate.getTime()).toBe(updateChildRow2.HireDate.getTime());
        });

        it('Should merge delete hierarchical transactions correctly', () => {
            const cloneStrategy = new DefaultDataCloneStrategy();
            const data = SampleTestData.employeeSmallTreeData();
            const transactions: HierarchicalTransaction[] = [
                //  root row with no children
                { id: data[1].ID, newValue: null, type: TransactionType.DELETE, path: [] },
                //  root row with children
                { id: data[2].ID, newValue: null, type: TransactionType.DELETE, path: [] },
                //  child row with no children
                { id: data[0].Employees[0].ID, newValue: null, type: TransactionType.DELETE, path: [data[0].ID] },
                //  child row with children
                { id: data[0].Employees[2].ID, newValue: null, type: TransactionType.DELETE, path: [data[0].ID] }
            ];

            DataUtil.mergeHierarchicalTransactions(data, transactions, 'Employees', 'ID', cloneStrategy, true);

            expect(data.length).toBe(1);
            expect(data[0].Employees.length).toBe(1);
        });
    });
};
/* //Test merging */

describe('DataUtil', () => {
    testSort();
    testGroupBy();
    testFilter();
    testPage();
    testMerging();
});
