import {
    async,
    TestBed
} from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { By } from "@angular/platform-browser";
import { DataGenerator } from "./test-util/data-generator";

import { FilteringStrategy, FilteringCondition, FilteringLogic, FilteringExpression, FilteringState } from "../main";

describe("Unit testing FilteringStrategy", () => {
    var dataGenerator:DataGenerator,
        data:Object[],
        fs: FilteringStrategy;
    beforeEach(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
        fs = new FilteringStrategy();
    });
    it ("tests `filter`", () => {
        var res = fs.filter(data, [{
                fieldName: "number", 
                condition: FilteringCondition.number.greaterThan,
                searchVal: 1
            }]);
        expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual([2, 3, 4]);
    });
    it ("tests `matchRecordByExpressions`", () => {
        var rec = data[0],
            res = fs.matchRecordByExpressions(rec, 
                            [
                                {
                                    fieldName: "string",
                                    condition: FilteringCondition.string.contains,
                                    searchVal: "ROW",
                                    ignoreCase: false
                                },
                                {
                                    fieldName: "number",
                                    condition: FilteringCondition.number.lessThan,
                                    searchVal: 1
                                }
                            ],
                            FilteringLogic.Or);
        expect(res).toBeTruthy();
    });
    it ("tests `findMatch`", () => {
        var rec = data[0],
            res = fs.findMatch(rec, {
                    fieldName: "boolean",
                    condition: FilteringCondition.boolean.false}, -1);
            expect(res).toBeTruthy();
    });
    it ("tests default settings", () => {
        data[0]["string"] = "ROW"
        var fs = new FilteringStrategy(),
            res = fs.filter(data, [{
                                    fieldName: "string",
                                    condition: FilteringCondition.string.contains,
                                    searchVal: "ROW"
                                }]);
        expect(dataGenerator.getValuesForColumn(res, "number"))
                    .toEqual([0]);
    });
});