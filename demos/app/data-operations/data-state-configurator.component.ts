import { Component, Input, ViewChild, OnInit, EventEmitter, Output, ChangeDetectionStrategy } from "@angular/core";
import { DataContainer, DataUtil, DataState, DataType,
        IgxCardComponent, IgxCardActions, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        FilteringExpression, FilteringCondition, FilteringState, FilteringLogic, FilteringStrategy,
        PagingError, PagingState,
        SortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, SortingState
      } from "../../../src/main";
import { DataColumn } from "../../../src/data-operations/test-util/data-generator";
import { DataTable } from "./data-table.component";

const SORT_TEXT_ASC = "ASC";
const SORT_TEXT_DESC = "DESC";
const SORT_TEXT_NONE = "NOT SORTED";

@Component({
    selector: "data-state-configurator",
    moduleId: module.id,
    templateUrl: './data-state-configurator.component.html',
    styleUrls: ["data-state-configurator.component.css"]
})
export class DataStateConfiguratorComponent implements OnInit {
    @ViewChild("filteringPanel") filteringPanel;
    @ViewChild("sortingPanel") sortingPanel;
    @ViewChild("pagingPanel") pagingPanel;
    @ViewChild("dataTable") dataTable: DataTable;

    @Input() dataContainer: DataContainer;
    @Input() dataState: DataState;
    @Input() columns: Array<DataColumn> = [];
    
    @Input() hidePaging: boolean = false;
    @Input() hideSorting: boolean = false;
    @Input() hideFiltering: boolean = false;

    message: string;
    title: string;
    
    @Input() stateLoading: boolean = false;
    @Output() onProcessDataState = new EventEmitter();

    ngOnInit() {
        this.dataTable.keys = this.columns.map(col => {return col.fieldName;});
    }

    /* Sorting */
    getNextSortingDirection(dir: SortingDirection): SortingDirection {
      if (dir === null) {
        return SortingDirection.Asc;
      }
      return (++dir > SortingDirection.Desc) ? null: dir;
    }
    changeSortingDirection (column: DataColumn) {
        let s:SortingState = this.dataState.sorting || {expressions: []};
        let indExpr = s.expressions.findIndex((e) => e.fieldName === column.fieldName);
        let expr = s.expressions[indExpr] || null;
        let dir = expr? expr.dir : null;
        let nextDir = this.getNextSortingDirection(dir);
        if (expr) {
          if (nextDir === null) {
            s.expressions.splice(indExpr, 1);
          } else {
            s.expressions[indExpr].dir = nextDir;
          }
        } else {
          s.expressions.push({
            fieldName: column.fieldName,
            dir: nextDir
          });
        }
        this.dataState.sorting = (s.expressions.length)? s : null;
        this.process();
    }
    getSortingButtonTitle (column: DataColumn): string {
      let s:SortingState = this.dataState.sorting || {expressions: []};
      if (!s.expressions.length) {
        return SORT_TEXT_NONE;
      }
      let indExpr = s.expressions.findIndex((e) => e.fieldName === column.fieldName);
      if (indExpr === -1) {
        return SORT_TEXT_NONE;
      }
      if (s.expressions[indExpr].dir === SortingDirection.Asc) {
        return SORT_TEXT_ASC;
      }
      return SORT_TEXT_DESC;
    }
    /* //Sorting */
    /* Filtering */
    showFilteringSearchBox(column: DataColumn): boolean {
      return column.type !== DataType.Boolean;
    }
    getFilteringConditions(column: DataColumn) {
        let conds = DataUtil.getListOfFilteringConditionsForDataType(column.type);
        conds.unshift(null);// add default filtering condition - not selected with value null
        return conds;
    }
    getFilteringExpression(column: DataColumn) {
      var f: FilteringState = this.dataState.filtering;
      if (!f || !f.expressions.length) {
        return null;
      }
      return f.expressions.find((e) => e.fieldName === column.fieldName);
    }
    getSelectedFilteringCondition(column: DataColumn): string {
      var f: FilteringState = this.dataState.filtering;
      if (!f || !f.expressions.length) {
        return null;
      }
      let expr: FilteringExpression = f.expressions.find((e) => e.fieldName === column.fieldName);
      if (!expr) {
        return null;
      }
      let conds = DataUtil.getFilteringConditionsForDataType(column.type)
      for (let cond in conds) {
        if (conds.hasOwnProperty(cond) && conds[cond] === expr.condition) {
          return "" + cond;
        }
      }
      return null;
    }
    onChangeFilteringCondition(event: Event) {
      const select = <HTMLSelectElement>event.srcElement;
      const value:string = select.value;
      if (!value || value === "null") {
        (<HTMLInputElement>select.closest("tr").querySelector("[data-filtering-search]"))
          .value = "";
      }
    }
    getSearchVal(column: DataColumn) {
      var expr = this.getFilteringExpression(column);
      return  expr ? expr.searchVal : "";
    }
    getFilteringDataState() {
      var i, expressions: FilteringExpression[] = [], 
            state: FilteringState = null,
          expr: FilteringExpression,
          cond,
          selCond: string,
          dataType: number,
          search,
          rows = this.filteringPanel.nativeElement.querySelectorAll("[data-field-name]"), 
          row: HTMLTableRowElement,
          fc;
      for (i = 0; i < rows.length; i++) {
        row = rows[i];
        fc = row.querySelector("[data-filtering-type]");
        selCond = fc.options[fc.selectedIndex].value;
        if (selCond && selCond !== "null") {
          dataType = +fc.attributes["data-filtering-type"].value;
          let search: any = (<HTMLInputElement>row.querySelector("[data-filtering-search]")).value;
          cond = (DataUtil.getFilteringConditionsForDataType(dataType) || {})[selCond];
          if (cond) {
            if (search !== "") {
              // data type transformation
              switch(dataType) {
                case DataType.Number:
                  search = +search;
                  break;
                case DataType.Date:
                  search = new Date(search);
                  break;
              }
            }
            expressions.push({
              fieldName: row.attributes["data-field-name"].value,
              condition: cond,
              searchVal: search 
            });
          }
        }
      }
      this.dataState.filtering = (expressions.length)? {expressions: expressions} : null;
    }
    /* //Filtering */
    getDataTypeStringRepresentation(column: DataColumn): string {
      let dt:string = "";
      switch(column.type) {
            case DataType.String:
                dt = "string";
            break;
            case DataType.Number:
                dt = "number";
            break;
            case DataType.Boolean:
                dt = "boolean";
            break;
            case DataType.Date:
                dt = "date";
            break;
        }
        return dt;
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
        if (this.filteringPanel) {
            this.getFilteringDataState();
        }
        this.onProcessDataState.emit(this.dataState);
    }
}