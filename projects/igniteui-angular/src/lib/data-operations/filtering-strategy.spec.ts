import { Component, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DataGenerator } from './test-util/data-generator';

import { FilteringLogic, FilteringStrategy, IFilteringExpression, IFilteringState, IgxStringFilteringOperand,
    IgxNumberFilteringOperand,
    IgxBooleanFilteringOperand,
    FilteringExpressionsTree } from '../../public_api';

describe('Unit testing FilteringStrategy', () => {
    let dataGenerator: DataGenerator;
    let data: object[];
    let fs: FilteringStrategy;
    beforeEach(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
        fs = new FilteringStrategy();
    });
    it ('tests `filter`', () => {
        const expressionTree = new FilteringExpressionsTree(FilteringLogic.And);
        expressionTree.filteringOperands = [
            {
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                fieldName: 'number',
                searchVal: 1
            }
        ];
        const res = fs.filter(data, expressionTree);
        expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([2, 3, 4]);
    });
    it ('tests `matchRecordByExpressions`', () => {
        const rec = data[0];
        const expressionTree = new FilteringExpressionsTree(FilteringLogic.Or);
        expressionTree.filteringOperands = [
            {
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                fieldName: 'string',
                ignoreCase: false,
                searchVal: 'ROW'
            },
            {
                condition: IgxNumberFilteringOperand.instance().condition('lessThan'),
                fieldName: 'number',
                searchVal: 1
            }
        ];
        const res = fs.matchRecord(rec, expressionTree);
        expect(res).toBeTruthy();
    });
    it ('tests `findMatch`', () => {
        const rec = data[0];
        const res = fs.findMatchByExpression(rec, {
            condition: IgxBooleanFilteringOperand.instance().condition('false'),
            fieldName: 'boolean'
        });
        expect(res).toBeTruthy();
    });
    it ('tests default settings', () => {
        (data[0] as { string: string }).string = 'ROW';
        const filterstr = new FilteringStrategy();
        const expressionTree = new FilteringExpressionsTree(FilteringLogic.And);
        expressionTree.filteringOperands = [
            {
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                fieldName: 'string',
                searchVal: 'ROW'
            }
        ];
        const res = filterstr.filter(data, expressionTree);
        expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([0]);
    });
});
