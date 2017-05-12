import { Component, DoCheck, Injectable, Input, OnInit, ViewChild } from "@angular/core";
import { DataContainer, DataUtil, FilteringCondition,
        FilteringLogic, FilteringStrategy, IDataState, IFilteringExpression, IFilteringState,
        IPagingState, ISortingExpression,
        ISortingState, PagingError, SortingDirection, SortingStrategy, StableSortingStrategy
      } from "../../../src/main";

@Component({
    moduleId: module.id,
    selector: "data-table",
    styleUrls: ["data-table.component.css"],
    templateUrl: "./data-table.component.html"
})
export class DataTable {
    @Input() public keys: string[] = [];
    @Input() public dataContainer: DataContainer;
    @Input() public data: any[] = [];
}
