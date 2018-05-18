import { Component, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { DataGenerator} from "./test-util/data-generator";

import { SortingDirection, SortingStrategy, StableSortingStrategy } from "../main";

describe("Unit testing StableSortingStrategy", () => {
    let dataGenerator: DataGenerator;
    let data: object[];
    let strategy: SortingStrategy;
    beforeEach(() => {
        dataGenerator = new DataGenerator(100);
        data = dataGenerator.data;
        strategy = new StableSortingStrategy();
    });
    it("tests `sort`", () => {
        let sort0;
        let sort1;
        data.forEach((item, index) => (item as { number: number }).number = index % 2 ? 0 : 1);

        strategy.sort(data, [{fieldName: "number", dir: SortingDirection.Asc}]);
        sort0 = dataGenerator.getValuesForColumn(data, "string").join("");

        strategy.sort(data, [{fieldName: "number", dir: SortingDirection.Asc}]);
        sort1 = dataGenerator.getValuesForColumn(data, "string").join("");
        expect(sort0).toEqual(sort1);
    });
});
