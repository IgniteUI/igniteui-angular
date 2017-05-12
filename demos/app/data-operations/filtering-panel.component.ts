import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { IDataColumn } from "../../../src/data-operations/test-util/data-generator";
import { DataContainer, DataType, DataUtil, FilteringCondition,
        FilteringLogic, FilteringStrategy, IDataState, IFilteringExpression, IFilteringState, IgxCardActions,
        IgxCardComponent, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        IPagingState, ISortingExpression,
        ISortingState, PagingError, SortingDirection, SortingStrategy, StableSortingStrategy
      } from "../../../src/main";

@Component({
    moduleId: module.id,
    selector: "filtering-panel",
    templateUrl: "./filtering-panel.component.html"
})
export class FilteringPanelComponent {
    @ViewChild("filteringPanel") public filteringPanel;

    @Input() public dataState: IDataState;
    @Input() public columns: IDataColumn[] = [];
    @Input() public hidden: boolean = false;
    public title: string = "Filtering";
    @Output() public onProcessDataState = new EventEmitter();

    public showFilteringSearchBox(column: IDataColumn): boolean {
      return column.type !== DataType.Boolean;
    }
    public getFilteringConditions(column: IDataColumn) {
        const conds = DataUtil.getListOfFilteringConditionsForDataType(column.type);
        conds.unshift(null); // add default filtering condition - not selected with value null
        return conds;
    }
    public getFilteringExpression(column: IDataColumn) {
      const f: IFilteringState = this.dataState.filtering;
      if (!f || !f.expressions.length) {
        return null;
      }
      return f.expressions.find((e) => e.fieldName === column.fieldName);
    }
    public getSelectedFilteringCondition(column: IDataColumn): string {
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
    public onChangeFilteringCondition(event: Event) {
      const select = event.srcElement as HTMLSelectElement;
      const value: string = select.value;
      if (!value || value === "null") {
        (select.closest("tr").querySelector("[data-filtering-search]") as HTMLInputElement)
          .value = "";
      }
    }
    public getSearchVal(column: IDataColumn) {
      const expr = this.getFilteringExpression(column);
      return  expr ? expr.searchVal : "";
    }
    public getFilteringDataState() {
        let i;
        let cond;
        let selCond: string;
        let dataType: number;
        let row: HTMLTableRowElement;
        let fc;
        const rows = this.filteringPanel.nativeElement.querySelectorAll("[data-field-name]");
        const expressions: IFilteringExpression[] = [];
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
                        condition: cond,
                        fieldName: row.attributes["data-field-name"].value,
                        searchVal: search
                    });
                }
            }
        }
        this.dataState.filtering = (expressions.length) ? {expressions} : null;
    }
    public getDataTypeStringRepresentation(column: IDataColumn): string {
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
    public process() {
        this.getFilteringDataState();
        this.onProcessDataState.emit(this.dataState);
    }
}
