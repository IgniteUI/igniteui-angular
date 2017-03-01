import {
    TestBed
} from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { By } from "@angular/platform-browser";
import { TestHelper} from "./test-util/test-helper.spec";

import {DataState} from "./data-state.interface";
import {FilteringCondition} from "./filtering-condition";
import {SortingExpression, SortingDirection} from "./sorting-expression.interface";
import {DataUtil} from "./data-util";
import {PagingError, PagingState} from "./paging-state.interface";
import {DataContainer} from "./data-container";
import {SortingState} from "./sorting-state.interface";
import { FilteringState } from "./filtering-state.interface";

describe('Unit testing DataContainer', () => {
    var helper:TestHelper,
        data:Object[],
        dc: DataContainer;
    beforeEach(() => {
        helper = new TestHelper();
        data = helper.generateData();
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
        expect(helper.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([1,2,3,4]);
        expect(helper.getValuesForColumn(dc.data, "number"))
            .toEqual([0, 1,2,3,4]);
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
        expect(helper.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4, 3, 2, 1]);
        expect(helper.getValuesForColumn(dc.data, "number"))
            .toEqual([0, 1,2,3,4]);
        // apply paging(+filtering and sorting)
        dc.state.paging = {
            index: 1,
            recordsPerPage: 3
        };
        dc.process();
        expect(helper.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([1]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
    });
    it ("tests sort", () => {
        // apply sorting without removing filtering
        var res, sortingState: SortingState = {
            expressions: [
                {
                    fieldName: "number",
                    dir: SortingDirection.Desc
                }
            ]
        };
        res = dc.process({sorting: sortingState});
        expect(helper.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4, 3, 2, 1, 0]);
        expect(dc.state.sorting)
            .toEqual(sortingState);
    });
    it ("tests filter", () => {
        // apply sorting without removing filtering
        var res, filteringState: FilteringState = {
            expressions: [
                {
                    fieldName: "number",
                    condition: FilteringCondition.number.doesNotEqual,
                    searchVal: 4
                }
            ]
        };
        res = dc.process({filtering: filteringState});
        expect(helper.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([0, 1, 2, 3]);
        expect(dc.state.filtering)
            .toEqual(filteringState);
    });
    it ("tests page", () => {
        // apply sorting without removing filtering
        var res, pagingState: PagingState = {
            index: 0,
            recordsPerPage: 4
        };
        dc.process({paging: pagingState});
        expect(helper.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([0, 1, 2, 3]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
        expect(dc.state.paging.metadata.error)
            .toEqual(PagingError.None);
        pagingState.index = 1;
        dc.process({paging: pagingState});
        expect(helper.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
        expect(dc.state.paging.metadata.error)
            .toEqual(PagingError.None);
    });
});