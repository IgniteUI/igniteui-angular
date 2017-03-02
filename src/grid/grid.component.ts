import { CommonModule } from "@angular/common";
import {
    AfterContentInit,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ContentChildren,
    DoCheck,
    ElementRef,
    EventEmitter,
    Input,
    IterableDiffer,
    IterableDiffers,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs/Rx";

// Grid helper components and directives
import { IgxColumnComponent } from "./column.component";
import {
    IgxCellBodyComponent,
    IgxCellHeaderComponent,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxColumnFilteringComponent,
    IgxColumnSortingDirective
} from "./grid.common";
import { IgxPaginatorComponent } from "./paginator.component";

import {
    DataContainer,
    FilteringCondition,
    FilteringExpression,
    IgxDialog,
    IgxDialogModule,
    IgxDirectivesModule,
    SortingDirection,
    SortingExpression,
    StableSortingStrategy
} from "../../src/main";

import { FilteringOperators } from "../../src/data-operations/filtering-operators";
import { FilteringSettings } from "../../src/data-operations/filtering-settings.interface";

// Grid events

export interface IgxGridColumnInitEvent {
    column: IgxColumnComponent;
}

export interface IgxGridRowSelectionEvent {
    index: number;
    row: Object;
}

export interface IgxGridCellSelectionEvent {
    index: number;
    value: any;
    row: Object;
}

export interface IgxGridFilterEvent {
    // TBD
}

export interface IgxGridEditEvent {
    row: Object;
}

export interface IgxGridSortEvent {
    column: IgxColumnComponent;
    direction: string;
    expression: SortingExpression;
}

export interface IgxGridPagingEvent {
    currentPage: number;
    perPage: number;
    totalRecords: number;
}

/**
 *
 *
 * @export
 * @class IgxGridComponent
 * @implements {OnInit}
 * @implements {AfterContentInit}
 * @implements {DoCheck}
 * @implements {OnDestroy}
 */
@Component({
    moduleId: module.id,
    selector: "igx-grid",
    styles: [
        `table {
        border-collapse: collapse;
        width: 100%;
    }
    table td, table th {
        border: 1px solid #e0e0e0;
        padding: 8px;
    }

   table tr:nth-child(even){background-color: #f5f5f5;}

   table tr:hover {background-color: #e0e0e0;}

   table th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #616161;
        color: white;
    }
    .asc {
        background-color: #aed581 !important;
    }
    .desc {
        background-color: #ef5350 !important;
    }
    .none {
        background-color: #616161 !important;
    }
    tr.selected-row td {
        color: white;
        background-color: #1976d2;
    }
    td.selected-cell {
        color: white;
        background-color: #29b6f6 !important;
        outline-color: #29b6f6;
        outline-width: 3px;
    }
    .selected-page {
        color: white;
        background-color: #29b6f6;
    }`
    ],
    templateUrl: "grid.component.html",
})
export class IgxGridComponent implements OnInit, AfterContentInit, DoCheck, OnDestroy {

    protected static nextId: number = 1;
    @Input() public data;

    @Input() get paging(): boolean {
        return this._paging;
    }

    set paging(value: boolean) {
        this._paging = value;
        if (!this._paging && this.dataSource) {
            this.dataSource.state.paging = null;
        } else if (this.dataSource) {
            this.dataSource.state.paging = {
                index: 0,
                recordsPerPage: this.rowsPerPage,
            };
        }
        this.shouldDataBind = true;
    }

    @Input() public rowsPerPage: number = 25;
    @Input() public id: string = `igx-grid-${IgxGridComponent.nextId++}`;
    @Input() public autoGenerate: boolean = false;

    // Child references
    @ContentChildren(IgxColumnComponent) protected cols: QueryList<IgxColumnComponent>;
    @ViewChild(IgxDialog) public editingModal: IgxDialog;
    @ViewChild(IgxPaginatorComponent) public paginator: IgxPaginatorComponent;

    // Event emitters
    @Output() public onEditDone = new EventEmitter<IgxGridEditEvent>();
    @Output() public onFilterDone = new EventEmitter<IgxGridFilterEvent>();
    @Output() public onSortingDone = new EventEmitter<IgxGridSortEvent>();
    @Output() public onMovingDone = new EventEmitter();
    @Output() public onCellSelection = new EventEmitter<IgxGridCellSelectionEvent>();
    @Output() public onRowSelection = new EventEmitter<IgxGridRowSelectionEvent>();
    @Output() public onPagingDone = new EventEmitter<IgxGridPagingEvent>();
    @Output() public onColumnInit = new EventEmitter<IgxGridColumnInitEvent>();

    public get columnsToRender(): IgxColumnComponent[] {
        return this.columns.filter((col) => !col.hidden);
    }

    get hasEditableColumns(): boolean {
        return this.columns.some((col) => col.editable);
    }

    get hasSorting(): boolean {
        return this.columns.some((col) => col.sortable);
    }

    get hasFiltering(): boolean {
        return this.columns.some((col) => col.filtering);
    }
    // get hasEditableColumns(): boolean {
    //     for (let column of this.columns) {
    //         if (column.editable) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    get editableColumns(): IgxColumnComponent[] {
        let res = [];
        this.columns.forEach((col) => {
            if (col.editable) {
                res.push(col);
            }
        });
        return res;
    }
    public dataSource: DataContainer;
    public columns: IgxColumnComponent[] = [];
    protected selectedRow: any;
    private filteringExpressions: Object = {};
    private sortingExpressions: Object = {};
    private colDiffer: Subscription;
    private _differ: IterableDiffer;
    private _paging: boolean = false;
    private _lastRow: any;
    private shouldDataBind: boolean = false;

    constructor(private _renderer: Renderer,
                private _elementRef: ElementRef,
                private _detector: ChangeDetectorRef,
                private _itDiff: IterableDiffers,
                private _resolver: ComponentFactoryResolver,
                private _viewRef: ViewContainerRef) {
                    this._differ = this._itDiff.find([]).create(null);
                }

    public ngOnInit() {
        if (this.data) {
            this.dataSource = new DataContainer(this.data);
            if (this.paging) {
                this.dataSource.state.paging = {
                    index: 0,
                    recordsPerPage: this.rowsPerPage,
                };
            }
            // Should we attach to all browsers and only when we have sorting??
            if (this.hasSorting) {
                this.dataSource.state.sorting.strategy = new StableSortingStrategy();
            }
        }
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        if (this.data && this.autoGenerate) {
            this.autogenerate();
        } else {
            this.checkColumns();
        }
        this.colDiffer = this.cols.changes.subscribe((_) => {
            this.checkColumns();
            this._detector.markForCheck();
        });

    }

    /**
     * @hidden
     */
    protected checkColumns() {
        this.columns = this.cols.toArray();
        this.columns.forEach((col, index) => {
            col.index = index;
            this.onColumnInit.emit({column: col});
        });
    }

    /**
     * @hidden
     */
    public ngDoCheck() {
        let diff = this._differ.diff(this.data);
        if (this.shouldDataBind || diff) {
            this.dataSource.process();
            this.shouldDataBind = false;
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.colDiffer.unsubscribe();
    }

    /**
     * Returns the cell at rowIndex/columnIndex.
     *
     * @param {number} rowIndex
     * @param {number} columnIndex
     * @returns
     *
     * @memberOf IgxGrid
     */
    public getCell(rowIndex: number, columnIndex: number) {
        let result = { dataItem: null, element: null };
        let record = this.dataSource.getRecordByIndex(rowIndex, this.dataSource.transformedData);
        let element = this._elementRef.nativeElement.querySelector(`td[data-row="${rowIndex}"][data-col="${columnIndex}"]`);

        if (record) {
            result.dataItem = record[this.columns[columnIndex].field];
        }

        if (element) {
            result.element = element;
        }

        return result;
    }

    /**
     * Returns
     *
     * @param {number} rowIndex
     * @returns
     *
     * @memberOf IgxGrid
     */
    public getRow(rowIndex: number) {
        let result = { row: null, element: null };
        let record = this.dataSource.getRecordByIndex(rowIndex, this.dataSource.transformedData);
        let element = this._elementRef.nativeElement.querySelector(`tbody > tr[data-row="${rowIndex}"]`);

        if (record) {
            result.row = record;
        }

        if (element) {
            result.element = element;
        }

        return result;
    }

    /**
     * Focuses the grid cell at position row x column.
     * Fires the onCellSelection event.
     *
     * @param {(number | string)} rowIndex      : the index of the row
     * @param {(number | string)} columnIndex   : the index of the column
     *
     * @memberOf IgxGrid
     */
    public cellAt(rowIndex: number | string, columnIndex: number | string) {
        let cell = this._elementRef.nativeElement.querySelector(`td[data-row="${rowIndex}"][data-col="${columnIndex}"]`);
        if (cell) {
            this._renderer.invokeElementMethod(cell, "focus", []);
        }
    }

    /**
     * Focuses the grid row at index `index`.
     * Fires the onRowSelection event.
     *
     * @param {(number | string)} index
     *
     * @memberOf IgxGrid
     */
    public rowAt(index: number | string) {
        let row = this._elementRef.nativeElement.querySelector(`tbody > tr[data-row="${index}"]`);
        if (row) {
            this._renderer.invokeElementMethod(row, "focus", []);
        }
    }

    /**
     * @hidden
     */

    protected onRowFocus(event, index) {
        let el: HTMLElement = event.target;
        this._renderer.setElementAttribute(el, "aria-selected", "true");
        this._renderer.setElementClass(el, "selected-row", true);
        this.onRowSelection.emit({
            index,
            row: this.dataSource.transformedData[index]
        });
    }

    protected onRowBlur(event) {
        let el: HTMLElement = event.target;
        this._renderer.setElementAttribute(el, "aria-selected", null);
        this._renderer.setElementClass(el, "selected-row", false);
    }

    protected onCellFocus(event, index, item) {
        let el: HTMLElement = event.target ? event.target : event;
        this._renderer.setElementAttribute(el, "aria-selected", "true");
        this._renderer.setElementClass(el, "selected-cell", true);
        this._renderer.setElementClass(el.parentElement, "selected-row", true);
        this.onCellSelection.emit({
            index,
            row: this.dataSource.transformedData[index],
            value: item,
        });
    }

    protected onCellBlur(event) {
        let el: HTMLElement = event.target;
        this._renderer.setElementAttribute(el, "aria-selected", null);
        this._renderer.setElementClass(el, "selected-cell", false);
        this._renderer.setElementClass(el.parentElement, "selected-row", false);
    }

    protected editCell(index, item, row) {
        if (!this.hasEditableColumns) {
            return;
        }
        this._lastRow = row;
        this.selectedRow = {
            index,
            item,
            row: Object.assign({}, row)
        };
        this.editingModal.open();
    }

    protected processFilter(event) {
        this.filterData(event.value, event.column);
    }

    public filterData(searchTerm: string, column: IgxColumnComponent) {
        if (!searchTerm) {
            delete this.filteringExpressions[column.field];
        } else {
            this.filteringExpressions[column.field] = <FilteringExpression> {
                condition: column.filteringCondition,
                fieldName: column.field,
                ignoreCase: column.filteringIgnoreCase,
                searchVal: searchTerm,
                type: column.dataType
            };
        }
        let res = [];
        for (let expr in this.filteringExpressions) {
            if (this.filteringExpressions.hasOwnProperty(expr)) {
                res.push(this.filteringExpressions[expr]);
            }
        }
        this.dataSource.state.filtering.expressions = res;
        if (this.paging) {
            this.dataSource.state.paging.index = 0;
        }
        this.shouldDataBind = true;
        this.onFilterDone.emit({filtered: this.dataSource.transformedData});
    }

    public addRow(rowData: Object, at?: number): void {
        this.dataSource.addRecord(rowData, at);
        this.shouldDataBind = true;
    }

    public deleteRow(row: Object | number | string): void {
        if (typeof row === "object") {
            this.dataSource.deleteRecord(row);
        } else if (typeof row === "number") {
            this.dataSource.deleteRecordByIndex(row);
        } else if (typeof row === "string" && !isNaN(parseInt(row, 10))) {
            this.dataSource.deleteRecordByIndex(parseInt(row, 10));
        }
        this.shouldDataBind = true;
    }

    public updateRow(index: number, rowData: Object) {
        this.dataSource.updateRecordByIndex(index, rowData);
        this.onEditDone.emit({row: rowData});
    }

    protected _setValue(field, event) {
        this.selectedRow.row[field] = event;
    }

    protected cancelEdit() {
        this.selectedRow.row = this._lastRow;
        if (this.paging) {
            this.selectedRow.index = this.dataSource.getIndexOfRecord(this._lastRow);
        }
        this.updateRow(this.selectedRow.index, this.selectedRow.row);
        this.shouldDataBind = true;
        this.editingModal.close();
    }

    protected saveData() {
        if (this.paging) {
            this.selectedRow.index = this.dataSource.getIndexOfRecord(this._lastRow);
        }
        this.updateRow(this.selectedRow.index, this.selectedRow.row);
        this.shouldDataBind = true;
        this.editingModal.close();
    }

    protected rearangeColumns(event) {
        this.columns[event.from].index = event.to;
        this.columns[event.to].index = event.from;
        let temp = this.columns[event.from];
        this.columns[event.from] = this.columns[event.to];
        this.columns[event.to] = temp;
        this.onMovingDone.emit(event);
    }

    protected processSort(event) {
        this.sortColumn(event.column, event.direction);
    }
    public sortColumn(column: IgxColumnComponent, direction) {
        if (direction === "none") {
            delete this.sortingExpressions[column.field];
        } else {
            this.sortingExpressions[column.field] = <SortingExpression> {
                dir: direction === "asc" ? SortingDirection.asc : SortingDirection.desc,
                fieldName: column.field,
                // TODO: add on column
                ignoreCase: true
            };
        }
        let res = [];
        for (let expr in this.sortingExpressions) {
            if (this.sortingExpressions.hasOwnProperty(expr)) {
                res.push(this.sortingExpressions[expr]);
            }
        }
        this.dataSource.state.sorting.expressions = res;
        this.shouldDataBind = true;
        this.onSortingDone.emit({
            column,
            direction,
            expression: this.sortingExpressions[column.field]
        });
    }

    public paginate(page: number) {
        this.paginator.paginate(page);
    }

    /**
     * @hidden
     */
    protected _paginate(event): void {
        this.dataSource.state.paging = {
            index: event.currentPage,
            recordsPerPage: event.perPage
        };
        this.shouldDataBind = true;
        this.onPagingDone.emit({currentPage: event.currentPage});
    }

    private autogenerate() {
        const factory = this._resolver.resolveComponentFactory(IgxColumnComponent);
        let keys = Object.keys(this.data[0]);
        keys.forEach((key, index) => {
            let ref = this._viewRef.createComponent(factory);
            ref.instance.field = key;
            ref.instance.index = index;
            this.onColumnInit.emit({column: ref.instance});
            this.columns.push(ref.instance);
            ref.changeDetectorRef.detectChanges();
        });
    }

    private navigate(event) {
        let key: string = event.key;
        let row = event.target.dataset.row;
        let column = event.target.dataset.col;

        row = parseInt(row, 10);
        column = parseInt(column, 10);

        if (key.endsWith("Left")) {
            this.cellAt(row, column - 1);
         } else if (key.endsWith("Right")) {
            this.cellAt(row, column + 1);
        } else if (key.endsWith("Up")) {
            this.cellAt(row - 1, column);
        } else if (key.endsWith("Down")) {
            this.cellAt(row + 1, column);
        }
    }
}

let GRID_DIRECTIVES = [
    IgxGridComponent,
    IgxColumnComponent,
    IgxColumnFilteringComponent,
    IgxColumnSortingDirective,
    IgxCellTemplateDirective,
    IgxCellBodyComponent,
    IgxCellHeaderComponent,
    IgxCellHeaderTemplateDirective,
    IgxPaginatorComponent,
];

@NgModule({
    declarations: GRID_DIRECTIVES,
    entryComponents: [IgxColumnComponent],
    exports: GRID_DIRECTIVES,
    imports: [CommonModule, IgxDialogModule, IgxDirectivesModule, FormsModule],
})
export class IgxGridModule {}
