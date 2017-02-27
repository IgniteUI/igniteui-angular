import {
    async,
    TestBed
} from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { By } from "@angular/platform-browser";
import { TestHelper} from "./test-util/test-helper.spec";

import { SortingDirection, SortingStrategy, StableSortingStrategy } from "../main";

describe("Unit testing StableSortingStrategy", () => {
    var helper:TestHelper,
        data:Object[],
        strategy: SortingStrategy;
    beforeEach(() => {
        helper = new TestHelper();
        data = helper.generateData(100);
        strategy = new StableSortingStrategy();
    });
    it("tests `sort`", () => {
        var sort0, sort1;
        data.forEach((item, index) => item["number"] = index % 2 ? 0: 1);
        
        strategy.sort(data, [{fieldName: "number", dir: SortingDirection.Asc}]);
        sort0 = helper.getValuesForColumn(data, "string").join("");
        
        strategy.sort(data, [{fieldName: "number", dir: SortingDirection.Asc}]);
        sort1 = helper.getValuesForColumn(data, "string").join("");
        expect(sort0).toEqual(sort1);
    });
});