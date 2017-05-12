import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { DataContainer, DataType, DataUtil, FilteringCondition,
        FilteringLogic, FilteringStrategy, IDataState, IFilteringExpression, IFilteringState, IgxCardActions,
        IgxCardComponent, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        IPagingState, ISortingExpression,
        ISortingState, PagingError, SortingDirection, SortingStrategy, StableSortingStrategy
      } from "../../../src/main";

@Component({
    moduleId: module.id,
    selector: "paging-panel",
    templateUrl: "./paging-panel.component.html"
})
export class PagingPanelComponent {
    @ViewChild("pagingPanel") public pagingPanel;

    @Input() public dataState: IDataState;
    @Input() public hidden: boolean = false;
    @Input() public title: string = "Paging";

    @Output() public onProcessDataState = new EventEmitter();

    public process() {
        this.onProcessDataState.emit(this.dataState);
    }
}
