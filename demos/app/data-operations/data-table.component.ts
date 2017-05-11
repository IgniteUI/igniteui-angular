import { Component, Input, ViewChild, OnInit, DoCheck, Injectable } from "@angular/core";
import { DataContainer, DataUtil, IDataState, 
        IFilteringExpression, FilteringCondition, IFilteringState, FilteringLogic, FilteringStrategy,
        PagingError, IPagingState,
        ISortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, ISortingState
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
    @Input() data: any[] = [];
}
