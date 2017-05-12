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
    moduleId: module.id,
    selector: "sorting-panel",
    templateUrl: "./sorting-panel.component.html"
})
export class SortingPanelComponent {
    @ViewChild("sortingPanel") public sortingPanel;

    @Input() public dataState: IDataState;
    @Input() public columns: IDataColumn[] = [];
    @Input() public hidden: boolean = false;

    public title: string = "Sorting";
    @Output() public onProcessDataState = new EventEmitter();

    public getNextSortingDirection(dir: SortingDirection): SortingDirection {
      if (dir === null) {
        return SortingDirection.Asc;
      }
      return (++dir > SortingDirection.Desc) ? null : dir;
    }
    public changeSortingDirection(column: IDataColumn) {
        const s: ISortingState = this.dataState.sorting || {expressions: []};
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
            dir: nextDir,
            fieldName: column.fieldName
          });
        }
        this.dataState.sorting = (s.expressions.length) ? s : null;
        this.process();
    }
    public getSortingButtonTitle(column: IDataColumn): string {
      const s: ISortingState = this.dataState.sorting || {expressions: []};
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

    public process() {
        this.onProcessDataState.emit(this.dataState);
    }
}
