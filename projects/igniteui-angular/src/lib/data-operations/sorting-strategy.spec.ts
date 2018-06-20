import { Component, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DataGenerator } from './test-util/data-generator';

import { IGroupByRecord, SortingDirection, SortingStrategy } from '../../public_api';

describe('Unit testing SortingStrategy', () => {
    let dataGenerator: DataGenerator;
    let data: object[];
    let strategy: SortingStrategy;
    beforeEach(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
        strategy = new SortingStrategy();
    });
    it('tests `sort`', () => {
        const res = strategy.sort(data, [
            {
                dir: SortingDirection.Asc,
                fieldName: 'boolean'
            }, {
                dir: SortingDirection.Desc,
                fieldName: 'number'
            }]);
        expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([4, 2, 0, 3, 1]);
    });
    it('tests `compareObjects`', () => {
        expect(strategy.compareValues(1, 0) === 1 &&
                strategy.compareValues(true, false) === 1 &&
                strategy.compareValues('bc', 'adfc') === 1)
            .toBeTruthy('compare first argument greater than second');
        expect(strategy.compareValues(1, 2) === -1 &&
                strategy.compareValues('a', 'b') === -1 &&
                strategy.compareValues(false, true) === -1)
            .toBeTruthy('compare 0, 1');
        expect(strategy.compareValues(0, 0) === 0 &&
                strategy.compareValues(true, true) === 0 &&
                strategy.compareValues('test', 'test') === 0
                )
            .toBeTruthy('Comare equal variables');
    });
    it('tests default settings', () => {
        strategy = new SortingStrategy();
        (data[4] as { string: string }).string = 'ROW';
        const res = strategy.sort(data, [{
                dir: SortingDirection.Asc,
                fieldName: 'string'
            }]);
        expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([4, 0, 1, 2, 3]);
    });
    it('tests `groupBy`', () => {
        strategy = new SortingStrategy();
        const expr = [{
            dir: SortingDirection.Asc,
            fieldName: 'boolean'
        }];
        const res = strategy.sort(data, expr);
        const gres = strategy.groupBy(res, expr);
        expect(dataGenerator.getValuesForColumn(gres.data, 'boolean'))
                    .toEqual([false, false, false, true, true]);
        const group1: IGroupByRecord = gres.metadata[0];
        const group2: IGroupByRecord = gres.metadata[3];
        expect(gres.metadata[1]).toEqual(group1);
        expect(gres.metadata[2]).toEqual(group1);
        expect(gres.metadata[4]).toEqual(group2);
        expect(group1.level).toEqual(0);
        expect(group2.level).toEqual(0);
        expect(group1.records).toEqual(gres.data.slice(0, 3));
        expect(group2.records).toEqual(gres.data.slice(3, 5));
        expect(group1.value).toEqual(false);
        expect(group2.value).toEqual(true);
    });
});
