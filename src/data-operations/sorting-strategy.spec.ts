import {
    async,
    TestBed
} from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { By } from "@angular/platform-browser";
import { TestHelper} from "./test-util/test-helper.spec";

import { SortingStrategy, SortingDirection } from "../main";

describe("Unit testing SortingStrategy", () => {
    var helper:TestHelper,
        data:Object[],
        strategy: SortingStrategy;
    beforeEach(() => {
        helper = new TestHelper();
        data = helper.generateData();
        strategy = new SortingStrategy();
    });
    it("tests `sort`", () => {
        var res = strategy.sort(data, [
            {
                dir: SortingDirection.Asc,
                fieldName: "boolean"
            },{
                dir: SortingDirection.Desc,
                fieldName: "number"
            }]);
        expect(helper.getValuesForColumn(res, "number"))
                    .toEqual([4, 2, 0, 3, 1]);
    });
    it("tests `compareObjects`", () => {
        expect(strategy.compareValues(1, 0) === 1 &&
                strategy.compareValues(true, false) === 1 &&
                strategy.compareValues("bc", "adfc") === 1)
            .toBeTruthy("compare first argument greater than second");
        expect(strategy.compareValues(1, 2) === -1 &&
                strategy.compareValues("a", "b") === -1 && 
                strategy.compareValues(false, true) === -1)
            .toBeTruthy("compare 0, 1");
        expect(strategy.compareValues(0, 0) === 0 &&
                strategy.compareValues(true, true) === 0 &&
                strategy.compareValues("test", "test") === 0
                )
            .toBeTruthy("Comare equal variables");
    });
    it("tests default settings", () => {
        strategy = new SortingStrategy();
        data[4]["string"] = "ROW";
        var res = strategy.sort(data, [{
                dir: SortingDirection.Asc,
                fieldName: "string"
            }]);
        expect(helper.getValuesForColumn(res, "number"))
                    .toEqual([4, 0, 1, 2, 3]);
    })
});