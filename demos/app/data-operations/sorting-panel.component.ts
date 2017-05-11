import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { IDataColumn } from "../../../src/data-operations/test-util/data-generator";
import { DataContainer, DataType, DataUtil, FilteringCondition,
        FilteringLogic, FilteringStrategy, IDataState, IFilteringExpression, IFilteringState, IgxCardActions,
        IgxCardComponent, IgxCardContent, IgxCardFooter, IgxCardHeader, IgxCardModule,
        IPagingState, ISortingExpression,
        ISortingState, PagingError, SortingDirection, SortingStrategy, StableSortingStrategy
      } from "../../../src/main";

const SORT_TEXT_ASC = "ASC";
const SORT_TEXT_DESC = "DESC";
const SORT_TEXT_NONE = "NOT SORTED";

@Component({
    selector: "sorting-panel",
    moduleId: module.id,
    templateUrl: "./sorting-panel.component.html"
})
export class SortingPanelComponent{
    @ViewChild("sortingPanel") sortingPanel;

    @Input() dataState: DataState;
    @Input() columns: DataColumn[] = [];
    @Input() hidden: boolean = false;

    title: string = "Sorting";
    @Output() onProcessDataState = new EventEmitter();

    getNextSortingDirection(dir: SortingDirection): SortingDirection {
      if (dir === null) {
        return SortingDirection.Asc;
      }
      return (++dir > SortingDirection.Desc) ? null : dir;
    }
    changeSortingDirection(column: DataColumn) {
        const s: SortingState = this.dataState.sorting || {expressions: []};
        const indExpr = s.expressions.findIndex((e) => e.fieldName === column.fieldName);
        const expr = s.expressions[indExpr] || null;
        const dir = expr ? expr.dir : null;
        const nextDir = this.getNextSortingDirection(dir);
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
        this.dataState.sorting = (s.expressions.length) ? s : null;
        this.process();
    }
    getSortingButtonTitle(column: DataColumn): string {
      const s: SortingState = this.dataState.sorting || {expressions: []};
      if (!s.expressions.length) {
        return SORT_TEXT_NONE;
      }
      const indExpr = s.expressions.findIndex((e) => e.fieldName === column.fieldName);
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