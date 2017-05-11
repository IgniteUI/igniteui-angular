import { Component, DoCheck, Injectable, Input, OnInit, ViewChild } from "@angular/core";
import { DataContainer, DataUtil, FilteringCondition,
        FilteringLogic, FilteringStrategy, IDataState, IFilteringExpression, IFilteringState,
        IPagingState, ISortingExpression,
        ISortingState, PagingError, SortingDirection, SortingStrategy, StableSortingStrategy
      } from "../../../src/main";

@Component({
    selector: "data-table",
    moduleId: module.id,
    templateUrl: "./data-table.component.html",
    styleUrls: ["data-table.component.css"]
})
export class DataTable {
    @Input() keys: string[] = [];
    @Input() dataContainer: DataContainer;
    @Input() data: any[] = [];
}
