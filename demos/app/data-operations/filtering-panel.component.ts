import { Component, Input, ViewChild, OnInit, EventEmitter, Output, ChangeDetectionStrategy } from "@angular/core";
import { DataContainer, DataUtil, DataState, DataType,
        IgxCardComponent, IgxCardActions, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        FilteringExpression, FilteringCondition, FilteringState, FilteringLogic, FilteringStrategy,
        PagingError, PagingState,
        SortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, SortingState
      } from "../../../src/main";
import { DataColumn } from "../../../src/data-operations/test-util/data-generator";

@Component({
    selector: "filtering-panel",
    moduleId: module.id,
    templateUrl: './filtering-panel.component.html'
})
export class FilteringPanelComponent {
    @ViewChild("filteringPanel") filteringPanel;

    @Input() dataState: DataState;
    @Input() columns: Array<DataColumn> = [];
    @Input() hidden: boolean = false;
    title: string = "Filtering";
    @Output() onProcessDataState = new EventEmitter();

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
    process() {
        this.getFilteringDataState();
        this.onProcessDataState.emit(this.dataState);
    }
}