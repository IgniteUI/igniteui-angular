import { Component, Input, ViewChild, OnInit, EventEmitter, Output, ChangeDetectionStrategy } from "@angular/core";
import { DataContainer, DataUtil, DataState, DataType,
        IgxCardComponent, IgxCardActions, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        FilteringExpression, FilteringCondition, FilteringState, FilteringLogic, FilteringStrategy,
        PagingError, PagingState,
        SortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, SortingState
      } from "../../../src/main";
import { DataColumn } from "../../../src/data-operations/test-util/data-generator";
import { DataTable } from "./data-table.component";
// import panels
import { FilteringPanelComponent } from "./filtering-panel.component";
import { SortingPanelComponent } from "./sorting-panel.component";
import { PagingPanelComponent } from "./paging-panel.component";

@Component({
    selector: "data-state-configurator",
    moduleId: module.id,
    templateUrl: './data-state-configurator.component.html',
    styleUrls: ["data-state-configurator.component.css"]
})
export class DataStateConfiguratorComponent implements OnInit {
    @ViewChild("dataTable") dataTable: DataTable;

    @Input() dataContainer: DataContainer;
    @Input() dataState: DataState;
    @Input() columns: Array<DataColumn> = [];
    
    @Input() hidePaging: boolean = false;
    @Input() hideSorting: boolean = false;
    @Input() hideFiltering: boolean = false;

    message: string;
    
    @Input() stateLoading: boolean = false;
    @Output() onProcessDataState = new EventEmitter();

    ngOnInit() {
        this.dataTable.keys = this.columns.map(col => {return col.fieldName;});
    }

    setMetadataInfo(title?: string) {
        let msg:string = `<h3 class="igx-card-header__title">${title || ""}</h3>`;
        msg += '<p class="igx-card-content__text">';
        let p = this.dataState.paging;
        if (p && p.metadata) {
            let metadata = p.metadata;
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