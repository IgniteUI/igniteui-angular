import { Component, Input, ViewChild, OnInit, EventEmitter, Output, ChangeDetectionStrategy } from "@angular/core";
import { DataContainer, DataUtil, DataState, DataType,
        IgxCardComponent, IgxCardActions, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        FilteringExpression, FilteringCondition, FilteringState, FilteringLogic, FilteringStrategy,
        PagingError, PagingState,
        SortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, SortingState
      } from "../../../src/main";

@Component({
    selector: "paging-panel",
    moduleId: module.id,
    templateUrl: './paging-panel.component.html'
})
export class PagingPanelComponent {
    @ViewChild("pagingPanel") pagingPanel;

    @Input() dataState: DataState;
    @Input() hidden: boolean = false;
    @Input() title: string = "Paging";
    
    @Output() onProcessDataState = new EventEmitter();

    process() {
        this.onProcessDataState.emit(this.dataState);
    }
}