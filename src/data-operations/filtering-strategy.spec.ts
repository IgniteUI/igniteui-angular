import { Component, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { DataGenerator } from "./test-util/data-generator";

import { FilteringCondition, FilteringLogic, FilteringStrategy, IFilteringExpression, IFilteringState } from "../main";

describe("Unit testing FilteringStrategy", () => {
    let dataGenerator: DataGenerator;
    let data: object[];
    let fs: FilteringStrategy;
    beforeEach(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
        fs = new FilteringStrategy();
    });
    it ("tests `filter`", () => {
        const res = fs.filter(data, [{
                condition: FilteringCondition.number.greaterThan,
                fieldName: "number",
                searchVal: 1
            }]);
        expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual([2, 3, 4]);
    });
    it ("tests `matchRecordByExpressions`", () => {
        const rec = data[0];
        const res = fs.matchRecordByExpressions(rec,
            [
                {
                    condition: FilteringCondition.string.contains,
                    fieldName: "string",
                    ignoreCase: false,
                    searchVal: "ROW"
                },
                {
                    condition: FilteringCondition.number.lessThan,
                    fieldName: "number",
                    searchVal: 1
                }
            ],
            FilteringLogic.Or);
        expect(res).toBeTruthy();
    });
    it ("tests `findMatch`", () => {
        const rec = data[0];
        const res = fs.findMatch(rec, {
            condition: FilteringCondition.boolean.false,
            fieldName: "boolean"
        }, -1);
        expect(res).toBeTruthy();
    });
    it ("tests default settings", () => {
        data[0].string = "ROW";
        const filterstr = new FilteringStrategy();
        const res = filterstr.filter(data, [{
            condition: FilteringCondition.string.contains,
            fieldName: "string",
            searchVal: "ROW"
        }]);
        expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual([0]);
    });
});
