import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    EventEmitter,
    HostBinding,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { FilteringLogic } from "../data-operations/filtering-expression.interface";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridRowComponent } from "./row.component";
import { IgxGridHeaderComponent } from "./grid-header.component";
import { IgxGridHeaderRowComponent } from "./header-row.component";

import { IgxVirtualContainerModule } from "../virtual-container";

let NEXT_ID = 0;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "igx-grid",
  templateUrl: "./grid.component.html",
  styleUrls: ["./grid.component.scss"],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false
})
export class IgxGridComponent implements OnInit, AfterContentInit {
  @ViewChild("container") scrollContainer: any;
 @ViewChild("header") headerTable: any;
  

  @Input()
  public virtualizationOptions:any={
    horizontalItemWidth :200,
    verticalItemHeight: 30,
    rowComponent: IgxGridRowComponent,
    cellComponent: IgxGridCellComponent,
    scrollContainer: this.scrollContainer
  }
  public virtualizationOptionsHeader: any = {
    horizontalItemWidth :200,
    rowComponent: IgxGridHeaderRowComponent,
    cellComponent: IgxGridHeaderComponent,
    scrollContainer: this.scrollContainer
  }

  @Input()
  public data = [];

  @Input()
  public autogenerate = false;

  @Input()
  public id = `igx-grid-top-${NEXT_ID++}`;

  @Input()
  get filteringLogic(): string {
    return this._filteringLogic === FilteringLogic.And ? "AND" : "OR";
  }

  set filteringLogic(value: string) {
    this._filteringLogic = (value === "OR") ? FilteringLogic.Or : FilteringLogic.And;
  }

  @Input()
  public paging = false;

  @Input()
  get page(): number {
    return this._page;
  }

  set page(val: number) {
    if (val < 0) {
      return;
    }
    this._page = val;
  }

  @Input()
  get perPage(): number {
    return this._perPage;
  }

  set perPage(val: number) {
    if (val < 0) {
      return;
    }
    this._perPage = val;
    this.page = 0;
  }

  @Input()
  public paginationTemplate: TemplateRef<any>;

  @Input()
  public height;

  @Input()
  public width;

  @Input()
  public evenRowCSS = "";

  @Input()
  public oddRowCSS = "";

  @Output()
  public onSelection = new EventEmitter();

  @Output()
  public onColumnInit = new EventEmitter();

  @Output()
  public onSorting = new EventEmitter();


  @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
  public columnList: QueryList<IgxColumnComponent>;

  @ViewChildren(IgxGridRowComponent, { read: IgxGridRowComponent })
  public rowList: QueryList<IgxGridRowComponent>;

  @HostBinding("attr.tabindex")
  public tabindex = 0;

  public sortingExpressions = [];

  public pagingState;

  public filteringExpressions = [];

  protected _perPage = 15;
  protected _page = 0;
  protected _columns = [];
  protected _filteringLogic = FilteringLogic.And;

  private sub$: Subscription;

  constructor(private gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) {
  }

  public onColumnChanges() {
    let idx = 0;
    this.columnList.forEach((col) => {
      col.index = !col.hidden ? idx++ : -1;
    });
  }

  public ngOnInit() {
    this.gridAPI.register(this);
  }

  onScroll(evt){
   var scrLeft = evt.target.scrollLeft;
   if(scrLeft !== this.headerTable.nativeElement.scrollLeft){     
    this.headerTable.nativeElement.style.overflowX = "auto";
    this.headerTable.nativeElement.style.overflowY = "hidden";
    this.headerTable.nativeElement.scrollLeft = scrLeft;
    this.headerTable.nativeElement.style.overflowX = "hidden";
   }

  }

  public ngAfterContentInit() {
    this.columnList.forEach((col, idx) => {
      col.index = idx;
      col.gridID = this.id;
      this.onColumnInit.emit(col);
    });
    this._columns = this.columnList.toArray();
    this.virtualizationOptions.columns = this._columns;
    this.virtualizationOptionsHeader.columns = this._columns;

    this.virtualizationOptions.scrollContainer = this.scrollContainer;
    this.virtualizationOptionsHeader.scrollContainer = this.scrollContainer;
  }

  get columns(): IgxColumnComponent[] {
    return this._columns;
  }

  public getColumnByName(name: string): IgxColumnComponent {
    return this.columnList.find((col) => col.field === name);
  }

  get visibleColumns(): IgxColumnComponent[] {
    return this.columnList.filter((col) => !col.hidden);
  }

  public getCellByColumn(rowIndex: number, columnField: string): IgxGridCellComponent {
    return this.gridAPI.get_cell_by_field(this.id, rowIndex, columnField);
  }

  get totalPages(): number {
    if (this.pagingState) {
      return this.pagingState.metadata.countPages;
    }
    return -1;
  }

  get totalRecords(): number {
    if (this.pagingState) {
      return this.pagingState.metadata.countRecords;
    }
  }

  get isFirstPage(): boolean {
    return this.page === 0;
  }

  get isLastPage(): boolean {
    return this.page + 1 >= this.totalPages;
  }

  public nextPage(): void {
    if (!this.isLastPage) {
      this.page += 1;
    }
  }

  public previousPage(): void {
    if (!this.isFirstPage) {
      this.page -= 1;
    }
  }

  public paginate(val: number): void {
    this.page = val - 1;
  }

  public addRow(data: any) {
    this.data.push(data);
    this.cdr.markForCheck();
  }

  public sort(name: string, direction = SortingDirection.Asc) {
    this.gridAPI.sort(this.id, name, direction);
    this.cdr.markForCheck();
  }

  public sortMultiple(exprArray) {
    this.gridAPI.sort_multiple(this.id, exprArray);
    this.cdr.markForCheck();
  }

  public filter(name: string, value: any, condition?, ignoreCase?) {
    const col = this.gridAPI.get_column_by_name(this.id, name);
    if (!col) {
      return;
    }
    this.gridAPI.filter(
      this.id, name, value, condition || col.filteringCondition, ignoreCase || col.filteringIgnoreCase);
    this.page = 0;
    this.cdr.markForCheck();
  }

  public filterGlobal(value: any, condition?, ignoreCase?) {
    // TODO: AND OR Filtering logic
    this.gridAPI.filterGlobal(this.id, value, condition, ignoreCase);
    this.page = 0;
    this.cdr.markForCheck();
  }

  get hasSortableColumns(): boolean {
    return this.columnList.filter((col) => col.sortable).length > 0;
  }

  get hasEditableColumns(): boolean {
    return this.columnList.filter((col) => col.editable).length > 0;
  }

  get hasFilterableColumns(): boolean {
    return this.columnList.filter((col) => col.filterable).length > 0;
  }

  get selectedCells(): IgxGridCellComponent[] | any[] {
    if (this.rowList) {
      return this.rowList.map((row) => row.cells.filter((cell) => cell.selected))
        .reduce((a, b) => a.concat(b), []);
    }
    return [];
  }
}
