import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { DataContainer, DataType, DataUtil, FilteringCondition,
        FilteringLogic, FilteringStrategy, IDataState, IFilteringExpression, IFilteringState, IgxCardActions,
        IgxCardComponent, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        IPagingState, ISortingExpression,
        ISortingState, PagingError, SortingDirection, SortingStrategy, StableSortingStrategy
      } from "../../../src/main";

@Component({
    selector: "paging-panel",
    moduleId: module.id,
    templateUrl: "./paging-panel.component.html"
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
