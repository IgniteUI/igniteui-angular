import { Component, ViewChild } from "@angular/core";
import {
    TestBed
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { DataGenerator} from "./test-util/data-generator";

import {DataAccess, DataContainer} from "./data-container";
import {IDataState} from "./data-state.interface";
import {DataUtil} from "./data-util";
import {FilteringCondition} from "./filtering-condition";
import { IFilteringState } from "./filtering-state.interface";
import {IPagingState, PagingError} from "./paging-state.interface";
import {ISortingExpression, SortingDirection} from "./sorting-expression.interface";
import {ISortingState} from "./sorting-state.interface";

describe("DataContainer", () => {
    let dataGenerator: DataGenerator,
        data: Object[],
        dc: DataContainer;
    beforeEach(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
        dc = new DataContainer(data);
    });
    it("tests process", () => {
        // test filtering
        dc.state = {
            filtering: {
                expressions: [
                    {
                        fieldName: "number",
                        condition: FilteringCondition.number.greaterThanOrEqualTo,
                        searchVal: 1
                    }
                ]
            }
        };
        dc.process();
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([1, 2, 3, 4]);
        expect(dataGenerator.getValuesForColumn(dc.data, "number"))
            .toEqual([0, 1, 2, 3, 4]);
        // apply sorting without removing filtering
        dc.state.sorting = {
            expressions: [
                {
                    fieldName: "number",
                    dir: SortingDirection.Desc
                }
            ]
        };
        dc.process();
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4, 3, 2, 1]);
        expect(dataGenerator.getValuesForColumn(dc.data, "number"))
            .toEqual([0, 1, 2, 3, 4]);
        // apply paging(+filtering and sorting)
        dc.state.paging = {
            index: 1,
            recordsPerPage: 3
        };
        dc.process();
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([1]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
    });
    it ("tests sort", () => {
        // apply sorting without removing filtering
        let res, sortingState: ISortingState = {
            expressions: [
                {
                    fieldName: "number",
                    dir: SortingDirection.Desc
                }
            ]
        };
        res = dc.process({sorting: sortingState});
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4, 3, 2, 1, 0]);
        expect(dc.state.sorting)
            .toEqual(sortingState);
    });
    it ("tests filter", () => {
        // apply sorting without removing filtering
        let res, filteringState: IFilteringState = {
            expressions: [
                {
                    fieldName: "number",
                    condition: FilteringCondition.number.doesNotEqual,
                    searchVal: 4
                }
            ]
        };
        res = dc.process({filtering: filteringState});
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([0, 1, 2, 3]);
        expect(dc.state.filtering)
            .toEqual(filteringState);
    });
    it ("tests page", () => {
        // apply sorting without removing filtering
        const res, pagingState: IPagingState = {
            index: 0,
            recordsPerPage: 4
        };
        dc.process({paging: pagingState});
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([0, 1, 2, 3]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
        expect(dc.state.paging.metadata.error)
            .toEqual(PagingError.None);
        pagingState.index = 1;
        dc.process({paging: pagingState});
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
        expect(dc.state.paging.metadata.error)
            .toEqual(PagingError.None);
    });

    // test CRUD operations
    it("tests `addRecord`", () => {
            let record = {
                number: -1
            };
            dc.addRecord(record);
            expect(dc.data).toBeTruthy();
            expect(dc.data.length).toBe(6);
            expect(dc.data[5]).toEqual(record);
            // add at specific position
            record = {number: -2};
            dc.addRecord(record, 0);
            expect(dc.data.length).toBe(7);
            expect(dc.data[0]).toEqual(record);
        });
    it ("tests `deleteRecord`", () => {
            const record = data[0],
            // remove first element
                res = dc.deleteRecord(record);
            expect(res).toBeTruthy();
            expect(dc.data.length).toBe(4);
            expect(dataGenerator.getValuesForColumn(dc.data, "number"))
                .toEqual([1, 2, 3, 4]);
        });
    it ("tests `deleteRecordByIndex`", () => {
            // remove first element
            const res = dc.deleteRecordByIndex(0);
            expect(res).toBeTruthy();
            expect(dc.data.length).toBe(4);
            expect(dataGenerator.getValuesForColumn(dc.data, "number"))
                .toEqual([1, 2, 3, 4]);
        });
    it ("tests `updateRecordByIndex`", () => {
            const recordCopy = Object.assign({}, data[0]),
                res = dc.updateRecordByIndex(0, {number: -1});
            recordCopy.number = -1;
            expect(dc.data[0]).toEqual(recordCopy);
        });
    it ("tests `getRecordInfoByKeyValue`", () => {
            let recordInfo = dc.getRecordInfoByKeyValue("number", 0);
            expect(recordInfo.index === 0 && recordInfo.record === dc.data[0])
                .toBeTruthy("tests getRecordInfoByKeyValue('number', 0)");
            recordInfo = dc.getRecordInfoByKeyValue("number", -1);
            expect(recordInfo.index === -1 && recordInfo.record === undefined)
                .toBeTruthy("tests getRecordInfoByKeyValue('number', -1)");
        });
    it ("tests `getIndexOfRecord`", () => {
            let index = dc.getIndexOfRecord(data[1]);
            expect(index).toBe(1, "original data");
            index = dc.getIndexOfRecord(data[0], DataAccess.TransformedData);
            expect(index).toBe(0, "transformed data");
        });
    it ("tests `getRecordByIndex`", () => {
            let rec = dc.getRecordByIndex(0);
            expect(rec).toBe(data[0], "original data");
            rec = dc.getRecordByIndex(0, DataAccess.TransformedData);
            expect(rec).toBe(dc.transformedData[0], "transformed data");
        });
});
