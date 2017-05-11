import { Component, Input, ViewChild, OnInit, EventEmitter, Output, ChangeDetectionStrategy } from "@angular/core";
import { DataContainer, DataUtil, IDataState, DataType,
        IgxCardComponent, IgxCardActions, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        IFilteringExpression, FilteringCondition, IFilteringState, FilteringLogic, FilteringStrategy,
        PagingError, IPagingState,
        ISortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, ISortingState
      } from "../../../src/main";

@Component({
    selector: "paging-panel",
    moduleId: module.id,
    templateUrl: './paging-panel.component.html'
})
export class PagingPanelComponent {
    @ViewChild("pagingPanel") pagingPanel;

    @Input() dataState: IDataState;
    @Input() hidden: boolean = false;
    @Input() title: string = "Paging";
    
    @Output() onProcessDataState = new EventEmitter();

    process() {
        this.onProcessDataState.emit(this.dataState);
    }
}