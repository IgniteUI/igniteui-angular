import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { IDataColumn } from "../../../src/data-operations/test-util/data-generator";
import { DataContainer, DataType, DataUtil, FilteringCondition,
        FilteringLogic, FilteringStrategy, IDataState, IFilteringExpression, IFilteringState, IgxCardActions,
        IgxCardComponent, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        IPagingState, ISortingExpression,
        ISortingState, PagingError, SortingDirection, SortingStrategy, StableSortingStrategy
      } from "../../../src/main";
import { DataTable } from "./data-table.component";
// import panels
import { FilteringPanelComponent } from "./filtering-panel.component";
import { PagingPanelComponent } from "./paging-panel.component";
import { SortingPanelComponent } from "./sorting-panel.component";

@Component({
    moduleId: module.id,
    selector: "data-state-configurator",
    styleUrls: ["data-state-configurator.component.css"],
    templateUrl: "./data-state-configurator.component.html"
})
export class DataStateConfiguratorComponent implements OnInit {
    @ViewChild("dataTable") public dataTable: DataTable;

    @Input() public dataContainer: DataContainer;
    @Input() public dataState: IDataState;
    @Input() public columns: IDataColumn[] = [];

    @Input() public hidePaging: boolean = false;
    @Input() public hideSorting: boolean = false;
    @Input() public hideFiltering: boolean = false;

    public message: string;

    @Input() public stateLoading: boolean = false;
    @Output() public onProcessDataState = new EventEmitter();

    public ngOnInit() {
        this.dataTable.keys = this.columns.map((col) => col.fieldName);
    }

    public setMetadataInfo(title?: string) {
        let msg: string = `<h3 class="igx-card-header__title">${title || ""}</h3>`;
        msg += '<p class="igx-card-content__text">';
        const p = this.dataState.paging;
        if (p && p.metadata) {
            const metadata = p.metadata;
            msg += metadata.error !== PagingError.None ?
                            "Incorrect arguments <br />" :
                            `Paging: ${metadata.countPages ? p.index + 1 : 0} of ${metadata.countPages} page(s) |
                            Records: ${metadata.countRecords}<br />`;
            msg += "<br />";
        }
        if (this.dataState.filtering && this.dataState.filtering.expressions.length) {
            msg += "Filtering applied<br />";
        }
        if (this.dataState.sorting && this.dataState.sorting.expressions.length) {
            msg += "Sorting applied<br />";
        }
        msg += "</p>";
        this.message = msg;
    }
    public process() {
        this.onProcessDataState.emit(this.dataState);
    }
}
