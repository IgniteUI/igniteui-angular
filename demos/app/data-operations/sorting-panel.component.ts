import { Component, Input, ViewChild, OnInit, EventEmitter, Output, ChangeDetectionStrategy } from "@angular/core";
import { DataContainer, DataUtil, DataState, DataType,
        IgxCardComponent, IgxCardActions, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        FilteringExpression, FilteringCondition, FilteringState, FilteringLogic, FilteringStrategy,
        PagingError, PagingState,
        SortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, SortingState
      } from "../../../src/main";
import { DataColumn } from "../../../src/data-operations/test-util/data-generator";

const SORT_TEXT_ASC = "ASC";
const SORT_TEXT_DESC = "DESC";
const SORT_TEXT_NONE = "NOT SORTED";

@Component({
    selector: "sorting-panel",
    moduleId: module.id,
    templateUrl: './sorting-panel.component.html'
})
export class SortingPanelComponent{
    @ViewChild("sortingPanel") sortingPanel;
    
    @Input() dataState: DataState;
    @Input() columns: Array<DataColumn> = [];
    @Input() hidden: boolean = false;

    title: string = "Sorting";
    @Output() onProcessDataState = new EventEmitter();

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
    
    process() {
        this.onProcessDataState.emit(this.dataState);
    }
}