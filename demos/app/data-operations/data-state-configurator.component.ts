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
    selector: "data-state-configurator",
    moduleId: module.id,
    templateUrl: "./data-state-configurator.component.html",
    styleUrls: ["data-state-configurator.component.css"]
})
export class DataStateConfiguratorComponent implements OnInit {
    @ViewChild("dataTable") dataTable: DataTable;

    @Input() dataContainer: DataContainer;
    @Input() dataState: IDataState;
    @Input() columns: IDataColumn[] = [];

    @Input() hidePaging: boolean = false;
    @Input() hideSorting: boolean = false;
    @Input() hideFiltering: boolean = false;

    message: string;

    @Input() stateLoading: boolean = false;
    @Output() onProcessDataState = new EventEmitter();

    ngOnInit() {
        this.dataTable.keys = this.columns.map((col) => col.fieldName);
    }

    setMetadataInfo(title?: string) {
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
    process() {
        this.onProcessDataState.emit(this.dataState);
    }
}
