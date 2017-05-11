import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { IDataColumn } from "../../../src/data-operations/test-util/data-generator";
import { DataContainer, DataType, DataUtil, FilteringCondition,
        FilteringLogic, FilteringStrategy, IDataState, IFilteringExpression, IFilteringState, IgxCardActions,
        IgxCardComponent, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        IPagingState, ISortingExpression,
        ISortingState, PagingError, SortingDirection, SortingStrategy, StableSortingStrategy
      } from "../../../src/main";

@Component({
    selector: "filtering-panel",
    moduleId: module.id,
    templateUrl: "./filtering-panel.component.html"
})
export class FilteringPanelComponent {
    @ViewChild("filteringPanel") filteringPanel;

    @Input() dataState: IDataState;
    @Input() columns: IDataColumn[] = [];
    @Input() hidden: boolean = false;
    title: string = "Filtering";
    @Output() onProcessDataState = new EventEmitter();

    showFilteringSearchBox(column: IDataColumn): boolean {
      return column.type !== DataType.Boolean;
    }
    getFilteringConditions(column: IDataColumn) {
        const conds = DataUtil.getListOfFilteringConditionsForDataType(column.type);
        conds.unshift(null); // add default filtering condition - not selected with value null
        return conds;
    }
    getFilteringExpression(column: IDataColumn) {
      const f: IFilteringState = this.dataState.filtering;
      if (!f || !f.expressions.length) {
        return null;
      }
      return f.expressions.find((e) => e.fieldName === column.fieldName);
    }
    getSelectedFilteringCondition(column: IDataColumn): string {
      const f: IFilteringState = this.dataState.filtering;
      if (!f || !f.expressions.length) {
        return null;
      }
      const expr: IFilteringExpression = f.expressions.find((e) => e.fieldName === column.fieldName);
      if (!expr) {
        return null;
      }
      const conds = DataUtil.getFilteringConditionsForDataType(column.type);
      for (const cond in conds) {
        if (conds.hasOwnProperty(cond) && conds[cond] === expr.condition) {
          return "" + cond;
        }
      }
      return null;
    }
    onChangeFilteringCondition(event: Event) {
      const select = event.srcElement as HTMLSelectElement;
      const value: string = select.value;
      if (!value || value === "null") {
        (select.closest("tr").querySelector("[data-filtering-search]") as HTMLInputElement)
          .value = "";
      }
    }
    getSearchVal(column: IDataColumn) {
      const expr = this.getFilteringExpression(column);
      return  expr ? expr.searchVal : "";
    }
    getFilteringDataState() {
      let i, expressions: IFilteringExpression[] = [],
            state: IFilteringState = null,
          expr: IFilteringExpression,
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
          let search: any = (row.querySelector("[data-filtering-search]") as HTMLInputElement).value;
          cond = (DataUtil.getFilteringConditionsForDataType(dataType) || {})[selCond];
          if (cond) {
            if (search !== "") {
              // data type transformation
              switch (dataType) {
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
      this.dataState.filtering = (expressions.length) ? {expressions: expressions} : null;
    }
    getDataTypeStringRepresentation(column: IDataColumn): string {
      let dt: string = "";
      switch (column.type) {
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