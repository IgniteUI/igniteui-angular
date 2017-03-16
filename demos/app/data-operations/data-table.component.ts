import { Component, Input, ViewChild, OnInit, DoCheck, Injectable } from "@angular/core";
import { DataContainer, DataUtil, DataState, 
        FilteringExpression, FilteringCondition, FilteringState, FilteringLogic, FilteringStrategy,
        PagingError, PagingState,
        SortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, SortingState
      } from "../../../src/main";

@Component({
    selector: "data-table",
    moduleId: module.id,
    templateUrl: './data-table.component.html',
    styleUrls: ["data-table.component.css"]
})
export class DataTable {
    @Input() keys: string[] = [];
    @Input() dataContainer: DataContainer;
    @Input() data: Array<any> = [];
}
