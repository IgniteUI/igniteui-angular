// Angular
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    IterableDiffers,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';

// Infragistics Core
import { cloneArray, DisplayDensity } from '../core/utils';
import { IgxSelectionAPIService } from '../core/selection';

// Infragistics Data Operations
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringOperation } from '../data-operations/filtering-condition';

// Infragistics Directives
import { IgxForOfDirective, IForOfState } from '../directives/for-of/for_of.directive';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';

// Infragistics Other Components
import { IgxCheckboxComponent } from './../checkbox/checkbox.component';

// Infragistics Grid Common
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { DropPosition } from './common/grid-common.misc';
import { IgxRowComponent } from './row.component';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IGridAPIService } from './api.service';
import {
    IGridCellEventArgs,
    IPinColumnEventArgs,
    IGridEditEventArgs,
    IRowSelectionEventArgs,
    IPageEventArgs,
    IRowDataEventArgs,
    IColumnResizeEventArgs,
    IColumnMovingStartEventArgs,
    IColumnMovingEventArgs,
    IColumnMovingEndEventArgs,
    IColumnVisibilityChangedEventArgs,
    IGridToolbarExportEventArgs,
    ISearchInfo,
    IGridBaseComponent
} from './common/grid-interfaces';

export abstract class IgxGridBaseComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit, IGridBaseComponent {

    private _filteredData = null;
    private _hiddenColumnsText = '';
    private _pinnedColumnsText = '';
    private _height = '100%';
    private _width = '100%';
    private _rowHeight;
    private _columnWidth: string;
    private _showToolbar = false;
    private _exportExcel = false;
    private _exportCsv = false;
    private _toolbarTitle: string = null;
    private _exportText: string = null;
    private _exportExcelText: string = null;
    private _exportCsvText: string = null;

    /**
     * @hidden
     */
    protected _displayDensity = DisplayDensity.comfortable;
    /**
     * @hidden
     */
    protected _perPage = 15;
    /**
     * @hidden
     */
    protected _page = 0;
    /**
     * @hidden
     */
    protected _paging = false;
    /**
     * @hidden
     */
    protected _rowSelection = false;
    /**
     * @hidden
     */
    protected _pipeTrigger = 0;
    /**
     * @hidden
     */
    protected _columns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _pinnedColumns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _unpinnedColumns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _filteringExpressionsTree: IFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    /**
     * @hidden
     */
    protected _sortingExpressions = [];
    /**
     * @hidden
     */
    protected _maxLevelHeaderDepth = null;
    /**
     * @hidden
     */
    protected _groupingExpressions = [];

    /**
     * @hidden
     */
    protected _columnHiding = false;
    /**
     * @hidden
     */
    protected _columnPinning = false;

    constructor(
        private api: IGridAPIService<IGridBaseComponent>,
        public selection: IgxSelectionAPIService,
        private elementRef: ElementRef,
        public cdr: ChangeDetectorRef,
        public resolver: ComponentFactoryResolver,
        public differs: IterableDiffers,
        public viewRef: ViewContainerRef) {
    }

    public abstract id: string;

    /**
     * An @Input property that lets you fill the `IgxGridComponent` with an array of data.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public data = [];

    /**
     * An @Input property that autogenerates the `IgxGridComponent` columns.
     * The default value is false.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public autoGenerate = false;

    /**
     * Returns the native element of the `IgxGridComponent`.
     * ```typescript
     * const nativeEl = this.grid.nativeElement.
     * ```
	 * @memberof IgxGridComponent
     */
    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * An @Input property that sets a custom template when the `IgxGridComponent` is empty.
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [emptyGridTemplate]="myTemplate" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public emptyGridTemplate: TemplateRef<any>;

    @Input()
    public get filteringLogic() {
        return this._filteringExpressionsTree.operator;
    }

    /**
     * Sets the filtering logic of the `IgxGridComponent`.
     * The default is AND.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true" [filteringLogic]="filtering"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set filteringLogic(value: FilteringLogic) {
        this._filteringExpressionsTree.operator = value;
    }

    /**
     * Returns the filtering state of `IgxGridComponent`.
     * ```typescript
     * let filteringExpressionsTree = this.grid.filteringExpressionsTree;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get filteringExpressionsTree() {
        return this._filteringExpressionsTree;
    }

    /**
     * Sets the filtering state of the `IgxGridComponent`.
     * ```typescript
     * const logic = new FilteringExpressionsTree(FilteringLogic.And, "ID");
     * logic.filteringOperands = [
     *     {
     *          condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
     *          fieldName: 'ID',
     *          searchVal: 1
     *     }
     * ];
     * this.grid.filteringExpressionsTree = (logic);
     * ```
	 * @memberof IgxGridComponent
     */
    set filteringExpressionsTree(value) {
        if (value && value instanceof FilteringExpressionsTree) {
            const val = (value as FilteringExpressionsTree);
            for (let index = 0; index < val.filteringOperands.length; index++) {
                if (!(val.filteringOperands[index] instanceof FilteringExpressionsTree)) {
                    const newExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, val.filteringOperands[index].fieldName);
                    newExpressionsTree.filteringOperands.push(val.filteringOperands[index] as IFilteringExpression);
                    val.filteringOperands[index] = newExpressionsTree;
                }
            }

            this._filteringExpressionsTree = value;
            this._pipeTrigger++;
            this.cdr.markForCheck();
            requestAnimationFrame(() => {
                this.clearSummaryCache();
                this.cdr.detectChanges();
            });
        }
    }

    /**
     * Returns an array of objects containing the filtered data in the `IgxGridComponent`.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
	 * @memberof IgxGridComponent
     */
    get filteredData() {
        return this._filteredData;
    }

    /**
     * Sets an array of objects containing the filtered data in the `IgxGridComponent`.
     * ```typescript
     * this.grid.filteredData = [{
     *       ID: 1,
     *       Name: "A"
     * }];
     * ```
	 * @memberof IgxGridComponent
     */
    set filteredData(value) {
        this._filteredData = value;

        if (this.rowSelectable) {
            this.api.update_header_checkbox_status_on_filter(this.id, this._filteredData);
        }

        this.api.refresh_search(this.id, true);
    }


    /**
     * Returns whether the paging feature is enabled/disabled.
     * The default state is disabled (false).
     * ```
     * const paging = this.grid.paging;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get paging(): boolean {
        return this._paging;
    }

    /**
     * Enables/Disables the paging feature.
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [paging]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    set paging(value: boolean) {
        this._paging = value;
        this._pipeTrigger++;

        if (this.ngAfterViewInitPassed) {
            this.cdr.detectChanges();
            this.api.calculate_grid_height(this.id);
            this.cdr.detectChanges();
        }
    }

    /**
     * Returns the current page index.
     * ```html
     * let gridPage = this.grid.page;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get page(): number {
        return this._page;
    }

    /**
     * Sets the current page index.
     * <igx-grid #grid [data]="Data" [paging]="true" [page]="5" [autoGenerate]="true"></igx-grid>
     */
    set page(val: number) {
        if (val < 0 || val > this.totalPages - 1) {
            return;
        }

        this.onPagingDone.emit({ previous: this._page, current: val });
        this._page = val;
        this.cdr.markForCheck();
    }

    /**
     * Returns the number of visible items per page of the `IgxGridComponent`.
     * The default is 15.
     * ```html
     * let itemsPerPage = this.grid.perPage;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get perPage(): number {
        return this._perPage;
    }

    /**
     * Sets the number of visible items per page of the `IgxGridComponent`.
     * ```html
     * <igx-grid #grid [data]="Data" [paging]="true" [perPage]="5" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    set perPage(val: number) {
        if (val < 0) {
            return;
        }

        this._perPage = val;
        this.page = 0;
    }

    /**
     * You can provide a custom `ng-template` for the pagination UI of the grid.
     * ```html
     * <igx-grid #grid [paging]="true" [myTemplate]="myTemplate" [height]="'305px'"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public paginationTemplate: TemplateRef<any>;

    /**
     * Return the display density currently applied to the grid.
     * The default value is `comfortable`.
     * Available options are `comfortable`, `cosy`, `compact`.
     * ```typescript
     * let gridTheme = this.grid.displayDensity;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get displayDensity(): DisplayDensity | string {
        return this._displayDensity;
    }

    /**
     * Sets the display density currently applied to the grid.
     * ```html
     * <igx-grid #grid [data]="localData" [displayDensity]="'compact'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set displayDensity(val: DisplayDensity | string) {
        switch (val) {
            case 'compact':
                this._displayDensity = DisplayDensity.compact;
                break;
            case 'cosy':
                this._displayDensity = DisplayDensity.cosy;
                break;
            case 'comfortable':
            default:
                this._displayDensity = DisplayDensity.comfortable;
        }
        this.onDensityChanged.emit();
    }

    /**
     * Returns whether the column hiding UI for the `IgxGridComponent` is enabled.
     * By default it is disabled (false).
     * ```typescript
     * let gridColHiding = this.grid.columnHiding;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get columnHiding() {
        return this._columnHiding;
    }

    /**
     * Sets whether the column hiding UI for the `IgxGridComponent` is enabled.
     * In order for the UI to work, you need to enable the toolbar as shown in the example below.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true" [showToolbar]="true" [columnHiding]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    set columnHiding(value) {
        if (this._columnHiding !== value) {
            this._columnHiding = value;
            if (this.api.get(this.id)) {
                this.markForCheck();
                if (this.ngAfterViewInitPassed) {
                    this.reflow();
                }
            }
        }
    }

    /**
     * Sets whether the `IgxGridRowComponent` selection is enabled.
     * By default it is set to false.
     * ```typescript
     * let rowSelectable = this.grid.rowSelectable;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get rowSelectable(): boolean {
        return this._rowSelection;
    }

    /**
     * Sets whether rows can be selected.
     * ```html
     * <igx-grid #grid [showToolbar]="true" [rowSelectable]="true" [columnHiding]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    set rowSelectable(val: boolean) {
        this._rowSelection = val;
        if (this.api.get(this.id)) {

            // should selection persist?
            this.allRowsSelected = false;
            this.deselectAllRows();
            this.markForCheck();
        }
    }

    /**
     * Returns the height of the `IgxGridComponent`.
     * ```typescript
     * let gridHeight = this.grid.height;
     * ```
	 * @memberof IgxGridComponent
     */
    @HostBinding('style.height')
    @Input()
    public get height() {
        return this._height;
    }

    /**
     * Sets the height of the `IgxGridComponent`.
     * ```html
     * <igx-grid #grid [data]="Data" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set height(value: any) {
        if (this._height !== value) {
            this._height = value;
            requestAnimationFrame(() => {
                this.api.calculate_grid_height(this.id);
                this.cdr.markForCheck();
            });
        }
    }

    /**
     * Returns the width of the `IgxGridComponent`.
     * ```typescript
     * let gridWidth = this.grid.width;
     * ```
	 * @memberof IgxGridComponent
     */
    @HostBinding('style.width')
    @Input()
    public get width() {
        return this._width;
    }

    /**
     * Sets the width of the `IgxGridComponent`.
     * ```html
     * <igx-grid #grid [data]="Data" [width]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set width(value: any) {
        if (this._width !== value) {
            this._width = value;
            requestAnimationFrame(() => {
                // Calling reflow(), because the width calculation
                // might make the horizontal scrollbar appear/disappear.
                // This will change the height, which should be recalculated.
                this.reflow();
            });
        }
    }

    /**
     * Returns the width of the header of the `IgxGridComponent`.
     * ```html
     * let gridHeaderWidth = this.grid.headerWidth;
     * ```
	 * @memberof IgxGridComponent
     */
    get headerWidth() {
        return parseInt(this._width, 10) - 17;
    }

    /**
     * An @Input property that adds styling classes applied to all even `IgxGridRowComponent`s in the grid.
     * ```html
     * <igx-grid #grid [data]="Data" [evenRowCSS]="'igx-grid--my-even-class'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public evenRowCSS = 'igx-grid__tr--even';

    /**
     * An @Input property that adds styling classes applied to all odd `IgxGridRowComponent`s in the grid.
     * ```html
     * <igx-grid #grid [data]="Data" [evenRowCSS]="'igx-grid--my-odd-class'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public oddRowCSS = 'igx-grid__tr--odd';

    /**
     * Returns the row height.
     * ```typescript
     * const rowHeight = this.grid.rowHeight;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get rowHeight() {
        return this._rowHeight ? this._rowHeight : this.defaultRowHeight;
    }

    /**
     * Sets the row height.
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [rowHeight]="100" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set rowHeight(value) {
        this._rowHeight = parseInt(value, 10);
    }

    /**
     * An @Input property that sets the default width of the `IgxGridComponent`'s columns.
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [columnWidth]="100" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get columnWidth(): string {
        return this._columnWidth;
    }
    public set columnWidth(value: string) {
        this._columnWidth = value;
        this.columnWidthSetByUser = true;
    }

    /**
     * An @Input property that sets the primary key of the `IgxGridComponent`.
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [primaryKey]="6" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public primaryKey;

    /**
     * An @Input property that sets the message displayed when there are no records.
     * ```html
     * <igx-grid #grid [data]="Data" [emptyGridMessage]="'The grid is empty'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public emptyGridMessage = 'Grid has no data.';

    /**
     * An @Input property that sets the message displayed when there are no records and the grid is filtered.
     * ```html
     * <igx-grid #grid [data]="Data" [emptyGridMessage]="'The grid is empty'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public emptyFilteredGridMessage = 'No records found.';

    /**
     * An @Input property that sets the message displayed inside the GroupBy drop area where columns can be dragged on.
     * Note: The grid needs to have at least one groupable column in order the GroupBy area to be displayed.
     * ```html
     * <igx-grid dropAreaMessage="Drop here to group!">
     *      <igx-column [groupable]="true" field="ID"></igx-column>
     * </igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public dropAreaMessage = 'Drag a column header and drop it here to group by that column.';

    /**
     * An @Input property that sets the template that will be rendered as a GroupBy drop area.
     * Note: The grid needs to have at least one groupable column in order the GroupBy area to be displayed.
     * ```html
     * <igx-grid [dropAreaTemplate]="dropAreaRef">
     *      <igx-column [groupable]="true" field="ID"></igx-column>
     * </igx-grid>
     *
     * <ng-template #myDropArea>
     *      <span> Custom drop area! </span>
     * </ng-template>
     * ```
     * ```ts
     * @ViewChild('myDropArea', { read: TemplateRef })
     * public dropAreaRef: TemplateRef<any>;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public dropAreaTemplate: TemplateRef<any>;

    /**
     * An @Input property that sets the title to be displayed in the built-in column hiding UI.
     * ```html
     * <igx-grid [showToolbar]="true" [columnHiding]="true" columnHidingTitle="Column Hiding"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public columnHidingTitle = '';

    /**
     * Returns if the built-in column pinning UI should be shown in the toolbar.
     * ```typescript
     *  let colPinning = this.grid.columnPinning;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get columnPinning() {
        return this._columnPinning;
    }

    /**
     * Sets if the built-in column pinning UI should be shown in the toolbar.
     * By default it's disabled.
     * ```html
     * <igx-grid #grid [data]="localData" [columnPinning]="'true" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    set columnPinning(value) {
        if (this._columnPinning !== value) {
            this._columnPinning = value;
            if (this.api.get(this.id)) {
                this.markForCheck();
                if (this.ngAfterViewInitPassed) {
                    this.reflow();
                }
            }
        }
    }

    /**
     * An @Input property that sets the title to be displayed in the UI of the column pinning.
     * ```html
     * <igx-grid #grid [data]="localData" [columnPinning]="'true" [columnPinningTitle]="'Column Hiding'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public columnPinningTitle = '';

    /**
     * Emitted when `IgxGridCellComponent` is clicked. Returns the `IgxGridCellComponent`.
     * ```html
     * <igx-grid #grid (onCellClick)="onCellClick($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * ```typescript
     * public onCellClick(e){
     *     alert("The cell has been clicked!");
     * }
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onCellClick = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when `IgxGridCellComponent` is selected. Returns the `IgxGridCellComponent`.
     * ```html
     * <igx-grid #grid (onSelection)="onCellSelect($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * ```typescript
     * public onCellSelect(e){
     *     alert("The cell has been selected!");
     * }
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onSelection = new EventEmitter<IGridCellEventArgs>();

    /**
     *  Emitted when `IgxGridRowComponent` is selected.
     * ```html
     * <igx-grid #grid (onRowSelectionChange)="onRowClickChange($event)" [data]="localData" [autoGenerate]="true"></igx-grid>
     * ```
     * ```typescript
     * public onCellClickChange(e){
     *     alert("The selected row has been changed!");
     * }
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onRowSelectionChange = new EventEmitter<IRowSelectionEventArgs>();

    /**
     * Emitted when `IgxColumnComponent` is pinned.
     * The index that the column is inserted at may be changed through the `insertAtIndex` property.
     * ```typescript
     * public columnPinning(event) {
     *     if (event.column.field === "Name") {
     *       event.insertAtIndex = 0;
     *     }
     * }
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onColumnPinning = new EventEmitter<IPinColumnEventArgs>();

    /**
     * An @Output property emitting an event when `IgxGridCellComponent` or `IgxGridRowComponent`
     * editing has been performed in the grid.
     * On `IgxGridCellComponent` editing, both `IgxGridCellComponent` and `IgxGridRowComponent`
     * objects in the event arguments are defined for the corresponding
     * `IgxGridCellComponent` that is being edited and the `IgxGridRowComponent` the `IgxGridCellComponent` belongs to.
     * On `IgxGridRowComponent` editing, only the `IgxGridRowComponent` object is defined, for the `IgxGridRowComponent`
     * that is being edited.
     * The `IgxGridCellComponent` object is null on `IgxGridRowComponent` editing.
     * ```typescript
     * editDone(event: IgxColumnComponent){
     *    const column: IgxColumnComponent = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid3 (onEditDone)="editDone($event)" [data]="remote | async" (onSortingDone)="process($event)"
     *          [primaryKey]="'ProductID'" [rowSelectable]="true">
     *          <igx-column [sortable]="true" [field]="'ProductID'"></igx-column>
     *          <igx-column [editable]="true" [field]="'ProductName'"></igx-column>
     *          <igx-column [sortable]="true" [field]="'UnitsInStock'" [header]="'Units in Stock'"></igx-column>
     * </igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onEditDone = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted when a grid column is initialized. Returns the column object.
     * ```html
     * <igx-grid #grid [data]="localData" [onColumnInit]="initColumns($event)" [autoGenerate]="true"</igx-grid>
     * ```
     * ```typescript
     * initColumns(event: IgxColumnComponent) {
     * const column: IgxColumnComponent = event;
     *       column.filterable = true;
     *       column.sortable = true;
     *       column.editable = true;
     * }
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onColumnInit = new EventEmitter<IgxColumnComponent>();

    /**
     * Emitted when sorting is performed through the UI. Returns the sorting expression.
     * ```html
     * <igx-grid #grid [data]="localData" [autoGenerate]="true" (onSortingDone)="sortingDone($event)"></igx-grid>
     * ```
     * ```typescript
     * sortingDone(event: SortingDirection){
     *     const sortingDirection = event;
     * }
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onSortingDone = new EventEmitter<ISortingExpression>();

    /**
     * Emitted when filtering is performed through the UI.
     * Returns the filtering expressions tree of the column for which filtering was performed.
     * ```typescript
     * filteringDone(event: IFilteringExpressionsTree){
     *     const filteringTree = event;
     *}
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (onFilteringDone)="filteringDone($event)"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onFilteringDone = new EventEmitter<IFilteringExpressionsTree>();

    /**
     * Emitted when paging is performed. Returns an object consisting of the previous and next pages.
     * ```typescript
     * pagingDone(event: IPageEventArgs){
     *     const paging = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (onPagingDone)="pagingDone($event)"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onPagingDone = new EventEmitter<IPageEventArgs>();

    /**
     * Emitted when a `IgxGridRowComponent` is being added to the `IgxGridComponent` through the API.
     * Returns the data for the new `IgxGridRowComponent` object.
     * ```typescript
     * rowAdded(event: IRowDataEventArgs){
     *    const rowInfo = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onRowAdded)="rowAdded($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onRowAdded = new EventEmitter<IRowDataEventArgs>();

    /**
     * Emitted when a `IgxGridRowComponent` is deleted through the `IgxGridComponent` API.
     * Returns an `IRowDataEventArgs` object.
     * ```typescript
     * rowDeleted(event: IRowDataEventArgs){
     *    const rowInfo = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onRowDeleted)="rowDeleted($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onRowDeleted = new EventEmitter<IRowDataEventArgs>();

    /**
     * Emitted when a new `IgxColumnComponent` is grouped or ungrouped.
     * Returns the `ISortingExpression` related to the grouping operation.
     * ```typescript
     * groupingDone(event: any){
     *     const grouping = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onGroupingDone)="groupingDone($event)" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onGroupingDone = new EventEmitter<ISortingExpression[]>();

    /**
     * Emitted when a new chunk of data is loaded from virtualization.
     * ```typescript
     *  <igx-grid #grid [data]="localData" [autoGenerate]="true" (onDataPreLoad)='handleDataPreloadEvent()'></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onDataPreLoad = new EventEmitter<IForOfState>();

    /**
     * Emitted when `IgxColumnComponent` is resized.
     * Returns the `IgxColumnComponent` object's old and new width.
     * ```typescript
     * resizing(event: IColumnResizeEventArgs){
     *     const grouping = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onColumnResized)="resizing($event)" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onColumnResized = new EventEmitter<IColumnResizeEventArgs>();

    /**
     * Emitted when a `IgxGridCellComponent` is right clicked. Returns the `IgxGridCellComponent` object.
     * ```typescript
     * contextMenu(event: IGridCellEventArgs){
     *     const resizing = event;
     *     console.log(resizing);
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onContextMenu)="contextMenu($event)" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onContextMenu = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when a `IgxGridCellComponent` is double clicked. Returns the `IgxGridCellComponent` object.
     * ```typescript
     * dblClick(event: IGridCellEventArgs){
     *     const dblClick = event;
     *     console.log(dblClick);
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onDoubleClick)="dblClick($event)" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onDoubleClick = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when `IgxColumnComponent` visibility is changed. Args: { column: any, newValue: boolean }
     * ```typescript
     * visibilityChanged(event: IColumnVisibilityChangedEventArgs){
     *    const visiblity = event;
     * }
     * ```
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (onColumnVisibilityChanged)="visibilityChanged($event)"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    /**
     * Emitted when `IgxColumnComponent` moving starts. Returns the moved `IgxColumnComponent` object.
     * ```typescript
     * movingStart(event: IColumnMovingStartEventArgs){
     *     const movingStarts = event;
     * }
     * ```
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (onColumnMovingStart)="movingStart($event)"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onColumnMovingStart = new EventEmitter<IColumnMovingStartEventArgs>();

    /**
     * Emitted throughout the `IgxColumnComponent` moving operation.
     * Returns the source and target `IgxColumnComponent` objects. This event is cancelable.
     * ```typescript
     * moving(event: IColumnMovingEventArgs){
     *     const moving = event;
     * }
     * ```
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (onColumnMoving)="moving($event)"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onColumnMoving = new EventEmitter<IColumnMovingEventArgs>();

    /**
     * Emitted when `IgxColumnComponent` moving ends.
     * Returns the source and target `IgxColumnComponent` objects. This event is cancelable.
     * ```typescript
     * movingEnds(event: IColumnMovingEndEventArgs){
     *     const movingEnds = event;
     * }
     * ```
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (onColumnMovingEnd)="movingEnds($event)"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onColumnMovingEnd = new EventEmitter<IColumnMovingEndEventArgs>();

    /**
     * Emitted when an export process is initiated by the user.
     * ```typescript
     * toolbarExporting(event: IGridToolbarExportEventArgs){
     *     const toolbarExporting = event;
     * }
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onToolbarExporting = new EventEmitter<IGridToolbarExportEventArgs>();

    /**
     * @hidden
     */
    @Output()
    public onDensityChanged = new EventEmitter<any>();

    /**
     * @hidden
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: true })
    public columnList: QueryList<IgxColumnComponent>;

    /**
     * @hidden
     */
    @ViewChildren(IgxGridHeaderComponent, { read: IgxGridHeaderComponent })
    public headerList: QueryList<IgxGridHeaderComponent>;


    @ViewChildren('row')
    private _rowList: QueryList<any>;


    @ViewChildren(IgxRowComponent, { read: IgxRowComponent })
    private _dataRowList: QueryList<any>;

    /**
     * A template reference for the template when the filtered `IgxGridComponent` is empty.
     * ```
     * const emptyTempalte = this.grid.emptyGridTemplate;
     * ```
	 * @memberof IgxGridComponent
     */
    @ViewChild('emptyFilteredGrid', { read: TemplateRef })
    public emptyFilteredGridDefaultTemplate: TemplateRef<any>;

    /**
     * A template reference for the template when the `IgxGridComponent` is empty.
     * ```
     * const emptyTempalte = this.grid.emptyGridTemplate;
     * ```
	 * @memberof IgxGridComponent
     */
    @ViewChild('defaultEmptyGrid', { read: TemplateRef })
    public emptyGridDefaultTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultDropArea', { read: TemplateRef })
    public defaultDropAreaTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('scrollContainer', { read: IgxForOfDirective })
    public parentVirtDir: IgxForOfDirective<any>;

    /**
     * @hidden
     */
    @ViewChild('verticalScrollContainer', { read: IgxForOfDirective })
    public verticalScrollContainer: IgxForOfDirective<any>;

    /**
     * @hidden
     */
    @ViewChild('scr', { read: ElementRef })
    public scr: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('paginator', { read: ElementRef })
    public paginator: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('headerContainer', { read: IgxForOfDirective })
    public headerContainer: IgxForOfDirective<any>;

    /**
     * @hidden
     */
    @ViewChild('headerCheckboxContainer')
    public headerCheckboxContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('headerGroupContainer')
    public headerGroupContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('headerCheckbox', { read: IgxCheckboxComponent })
    public headerCheckbox: IgxCheckboxComponent;

    /**
     * @hidden
     */
    @ViewChild('theadRow')
    public theadRow: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('tbody')
    public tbody: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('tfoot')
    public tfoot: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('summaries')
    public summaries: ElementRef;
    /**
     * @hidden
     */
    @ViewChild(IgxOverlayOutletDirective, { read: IgxOverlayOutletDirective })
    public outletDirective: IgxOverlayOutletDirective;

    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    get hostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-grid--cosy';
            case DisplayDensity.compact:
                return 'igx-grid--compact';
            default:
                return 'igx-grid';
        }
    }

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public hostRole = 'grid';

    /**
     * A list of `IgxGridRowComponent`, currently rendered.
     * ```typescript
     * const dataList = this.grid.dataRowList;
     * ```
	 * @memberof IgxGridComponent
     */
    public get dataRowList() {
        return this.api.get_row_list(this._dataRowList);
    }

    /**
     * A list of `IgxGridRowComponent`.
     * ```typescript
     * const rowList = this.grid.rowList;
     * ```
	 * @memberof IgxGridComponent
     */
    public get rowList() {
        return this.api.get_row_list(this._rowList);
    }

    /**
     * Returns the sorting state of the `IgxGridComponent`.
     * ```typescript
     * const sortingState = this.grid.sortingExpressions;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get sortingExpressions() {
        return this._sortingExpressions;
    }

    /**
     * Sets the sorting state of the `IgxGridComponent`.
     * ```typescript
     * this.grid.sortingExpressions = [{
     *     fieldName: "ID",
     *     dir: SortingDirection.Desc,
     *     ignoreCase: true
     * }];
     * ```
	 * @memberof IgxGridComponent
     */
    set sortingExpressions(value) {
        this._sortingExpressions = cloneArray(value);
        this.cdr.markForCheck();

        this.api.refresh_search(this.id, true);
    }

    /**
     * Returns the state of the grid virtualization, including the start index and how many records are rendered.
     * ```typescript
     * const gridVirtState = this.grid1.virtualizationState;
     * ```
	 * @memberof IgxGridComponent
     */
    get virtualizationState(): IForOfState {
        return this.verticalScrollContainer.state;
    }

    /**
     * @hidden
     */
    set virtualizationState(state: IForOfState) {
        this.verticalScrollContainer.state = state;
    }

    /**
     * Returns the total number of records in the data source.
     * Works only with remote grid virtualization.
     * ```typescript
     * const itemCount = this.grid1.totalItemCount;
     * ```
	 * @memberof IgxGridComponent
     */
    get totalItemCount(): number {
        return this.verticalScrollContainer.totalItemCount;
    }

    /**
     * Sets the total number of records in the data source.
     * This property is required for virtualization to function when the grid is bound remotely.
     * ```typescript
     * this.grid1.totalItemCount = 55;
     * ```
	 * @memberof IgxGridComponent
     */
    set totalItemCount(count) {
        this.verticalScrollContainer.totalItemCount = count;
        this.cdr.detectChanges();
    }

    /**
     * Returns an array of visible `IgxColumnComponent`s.
     * ```typescript
     * const visibleColumns = this.grid.visibleColumns.
     * ```
	 * @memberof IgxGridComponent
     */
    get visibleColumns(): IgxColumnComponent[] {
        return this.columnList.filter((col) => !col.hidden);
    }

    /**
     * Returns the number of hidden `IgxColumnComponent`.
     * ```typescript
     * const hiddenCol = this.grid.hiddenColumnsCount;
     * ``
     */
    get hiddenColumnsCount() {
        return this.columnList.filter((col) => col.columnGroup === false && col.hidden === true).length;
    }

    /**
     * Returns the text to be displayed inside the toggle button
     * for the built-in column hiding UI of the`IgxColumnComponent`.
     * ```typescript
     * const hiddenColText = this.grid.hiddenColumnsText;
     * ``
     */
    @Input()
    get hiddenColumnsText() {
        return this._hiddenColumnsText;
    }

    /**
     * Sets the text to be displayed inside the toggle button
     * for the built-in column hiding UI of the`IgxColumnComponent`.
     * ```typescript
     * <igx-grid [columnHiding]="true" [showToolbar]="true" [hiddenColumnsText]="'Hidden Columns'"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    set hiddenColumnsText(value) {
        this._hiddenColumnsText = value;

    }

    /**
     * Returns the text to be displayed inside the toggle button
     * for the built-in column pinning UI of the`IgxColumnComponent`.
     * ```typescript
     * const pinnedText = this.grid.pinnedColumnsText;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get pinnedColumnsText() {
        return this._pinnedColumnsText;
    }

    /**
     * Sets the text to be displayed inside the toggle button
     * for the built-in column pinning UI of the`IgxColumnComponent`.
     * ```html
     * <igx-grid [pinnedColumnsText]="'PinnedCols Text" [data]="data" [width]="'100%'" [height]="'500px'"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    set pinnedColumnsText(value) {
        this._pinnedColumnsText = value;
    }

    /**
     * Returns if the `IgxGridComponent` has sortable columns.
     * ```typescript
     * const sortableGrid = this.grid.hasSortableColumns;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasSortableColumns(): boolean {
        return this.columnList.some((col) => col.sortable);
    }

    /**
     * Returns if the `IgxGridComponent` has editable columns.
     * ```typescript
     * const editableGrid = this.grid.hasEditableColumns;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasEditableColumns(): boolean {
        return this.columnList.some((col) => col.editable);
    }

    /**
     * Returns if the `IgxGridComponent` has fiterable columns.
     * ```typescript
     * const filterableGrid = this.grid.hasFilterableColumns;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasFilterableColumns(): boolean {
        return this.columnList.some((col) => col.filterable);
    }

    /**
     * Returns if the `IgxGridComponent` has summarized columns.
     * ```typescript
     * const summarizedGrid = this.grid.hasSummarizedColumns;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasSummarizedColumns(): boolean {
        const summarizedColumns = this.columnList.filter(col => col.hasSummary);
        return summarizedColumns.length > 0 && summarizedColumns.some(col => !col.hidden);
    }

    /**
     * Returns if the `IgxGridComponent` has moveable columns.
     * ```typescript
     * const movableGrid = this.grid.hasMovableColumns;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasMovableColumns(): boolean {
        return this.columnList && this.columnList.some((col) => col.movable);
    }

    /**
     * Returns if the `IgxGridComponent` has column groups.
     * ```typescript
     * const groupGrid = this.grid.hasColumnGroups;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasColumnGroups(): boolean {
        return this.columnList.some(col => col.columnGroup);
    }

        /**
     * Returns the total number of pages.
     * ```typescript
     * const totalPages = this.grid.totalPages;
     * ```
	 * @memberof IgxGridComponent
     */
    get totalPages(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countPages;
        }
        return -1;
    }

    /**
     * Returns the total number of records.
     * Only functions when paging is enabled.
     * ```typescript
     * const totalRecords = this.grid.totalRecords;
     * ```
	 * @memberof IgxGridComponent
     */
    get totalRecords(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countRecords;
        }
    }

    /**
     * Returns if the current page is the first page.
     * ```typescript
     * const firstPage = this.grid.isFirstPage;
     * ```
	 * @memberof IgxGridComponent
     */
    get isFirstPage(): boolean {
        return this.page === 0;
    }

    /**
     * Returns if the current page is the last page.
     * ```typescript
     * const lastPage = this.grid.isLastPage;
     * ```
	 * @memberof IgxGridComponent
     */
    get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    /**
     * Returns the total width of the `IgxGridComponent`.
     * ```typescript
     * const gridWidth = this.grid.totalWidth;
     * ```
	 * @memberof IgxGridComponent
     */
    get totalWidth(): number {
        return this.api.total_width(this.id);
    }

    /**
     * @hidden
     */
    get dropAreaTemplateResolved(): TemplateRef<any> {
        return this.dropAreaTemplate ? this.dropAreaTemplate : this.defaultDropAreaTemplate;
    }

    /**
     * @hidden
     */
    get pipeTrigger(): number {
        return this._pipeTrigger;
    }

    /**
     * @hidden
     */
    get maxLevelHeaderDepth() {
        if (this._maxLevelHeaderDepth === null) {
            this._maxLevelHeaderDepth = this.columnList.reduce((acc, col) => Math.max(acc, col.level), 0);
        }
        return this._maxLevelHeaderDepth;
    }

    /**
     * hidden
     */
    public get template(): TemplateRef<any> {
        if (this.filteredData && this.filteredData.length === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyFilteredGridDefaultTemplate;
        }

        if (this.data && this.data.length === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyGridDefaultTemplate;
        }
    }

    /**
     * @hidden
     */
    get headerCheckboxAriaLabel() {
        return this._filteringExpressionsTree.filteringOperands.length > 0 ?
            this.headerCheckbox && this.headerCheckbox.checked ? 'Deselect all filtered' : 'Select all filtered' :
            this.headerCheckbox && this.headerCheckbox.checked ? 'Deselect all' : 'Select all';
    }

    /**
     * Provides access to the `IgxToolbarComponent`.
     * ```typescript
     * const gridToolbar = this.grid.toolbar;
     * ```
	 * @memberof IgxGridComponent
     */
    @ViewChild('toolbar', { read: IgxGridToolbarComponent })
    public toolbar: IgxGridToolbarComponent = null;

    /**
     * hidden
     */
    @ViewChild('toolbar', { read: ElementRef })
    public toolbarHtml: ElementRef = null;

    public get shouldShowToolbar(): boolean {
        return this.showToolbar &&
            (this.columnHiding ||
                this.columnPinning ||
                this.exportExcel ||
                this.exportCsv ||
                (this.toolbarTitle && this.toolbarTitle !== null && this.toolbarTitle !== ''));
    }

    /**
     * Returns whether the `IgxGridComponent`'s toolbar is shown or hidden.
     * ```typescript
     * const toolbarGrid = this.grid.showToolbar;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get showToolbar(): boolean {
        return this._showToolbar;
    }

    /**
     * Shows or hides the `IgxGridComponent`'s toolbar.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" ></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set showToolbar(newValue: boolean) {
        if (this._showToolbar !== newValue) {
            this._showToolbar = newValue;
            this.cdr.markForCheck();
            if (this.ngAfterViewInitPassed) {
                this.reflow();
            }
        }
    }

    /**
     * Returns the toolbar's title.
     * ```typescript
     * const toolbarTitle  = this.grid.toolbarTitle;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get toolbarTitle(): string {
        return this._toolbarTitle;
    }

    /**
     * Sets the toolbar's title.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [toolbarTitle]="'My Grid'"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set toolbarTitle(newValue: string) {
        if (this._toolbarTitle !== newValue) {
            this._toolbarTitle = newValue;
            this.cdr.markForCheck();
            if (this.ngAfterViewInitPassed) {
                this.reflow();
            }
        }
    }

    /**
     * Returns whether the option for exporting to MS Excel is enabled or disabled.
     * ```typescript
     * cosnt excelExporter = this.grid.exportExcel;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get exportExcel(): boolean {
        return this._exportExcel;
    }

    /**
     * Enable or disable the option for exporting to MS Excel.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [exportExcel]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set exportExcel(newValue: boolean) {
        if (this._exportExcel !== newValue) {
            this._exportExcel = newValue;
            this.cdr.markForCheck();
            if (this.ngAfterViewInitPassed) {
                this.reflow();
            }
        }
    }

    /**
     * Returns whether the option for exporting to CSV is enabled or disabled.
     * ```typescript
     * const exportCsv = this.grid.exportCsv;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get exportCsv(): boolean {
        return this._exportCsv;
    }

    /**
     * Enable or disable the option for exporting to CSV.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [exportCsv]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set exportCsv(newValue: boolean) {
        if (this._exportCsv !== newValue) {
            this._exportCsv = newValue;
            this.cdr.markForCheck();
            if (this.ngAfterViewInitPassed) {
                this.reflow();
            }
        }
    }

    /**
     * Returns the textual content for the main export button.
     * ```typescript
     * const exportText = this.grid.exportText;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get exportText(): string {
        return this._exportText;
    }

    /**
     * Sets the textual content for the main export button.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [exportText]="'My Exporter'" [exportCsv]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set exportText(newValue: string) {
        if (this._exportText !== newValue) {
            this._exportText = newValue;
            this.cdr.markForCheck();
            if (this.ngAfterViewInitPassed) {
                this.reflow();
            }
        }
    }

    /**
     * Returns the textual content for the MS Excel export button.
     * ```typescript
     * const excelText = this.grid.exportExcelText;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get exportExcelText(): string {
        return this._exportExcelText;
    }

    /**
     * Sets the textual content for the MS Excel export button.
     * ```html
     * <igx-grid [exportExcelText]="'My Excel Exporter" [showToolbar]="true" [exportText]="'My Exporter'" [exportCsv]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set exportExcelText(newValue: string) {
        if (this._exportExcelText !== newValue) {
            this._exportExcelText = newValue;
            this.cdr.markForCheck();
            if (this.ngAfterViewInitPassed) {
                this.reflow();
            }
        }
    }

    /**
     * Returns the textual content for the CSV export button.
     * ```typescript
     * const csvText = this.grid.exportCsvText;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get exportCsvText(): string {
        return this._exportCsvText;
    }

    /**
     * Sets the textual content for the CSV export button.
     * ```html
     * <igx-grid [exportCsvText]="'My Csv Exporter" [showToolbar]="true" [exportText]="'My Exporter'" [exportExcel]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set exportCsvText(newValue: string) {
        if (this._exportCsvText !== newValue) {
            this._exportCsvText = newValue;
            this.cdr.markForCheck();
            if (this.ngAfterViewInitPassed) {
                this.reflow();
            }
        }
    }

    /**
     * @hidden
     */
    public lastSearchInfo: ISearchInfo = {
        searchText: '',
        caseSensitive: false,
        exactMatch: false,
        activeMatchIndex: 0,
        matchInfoCache: []
    };

    /**
     * @hidden
     */
    public pagingState;
    /**
     * @hidden
     */
    public calcWidth: number;
    /**
     * @hidden
     */
    public calcRowCheckboxWidth: number;
    /**
     * @hidden
     */
    public calcHeight: number;
    /**
     * @hidden
     */
    public tfootHeight: number;
    /**
     * @hidden
     */
    public summariesHeight: number;

    /**
     * @hidden
     */
    public draggedColumn: IgxColumnComponent;
    /**
     * @hidden
     */
    public isColumnResizing: boolean;
    /**
     * @hidden
     */
    public isColumnMoving: boolean;

    /**
     * @hidden
     */
    public allRowsSelected = false;

    /**
     * @hidden
     */
    public columnListDiffer: any;

    /**
     * @hidden
     */
    public columnWidthSetByUser = false;

    /**
     * @hidden
     */
    public ngAfterViewInitPassed = false;

    /**
     * @hidden
     */
    public ngOnInit() {
        this.api.on_init(this);
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        this.api.on_after_content_init(this.id);
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.api.on_after_view_init(this.id);
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.api.on_destroy(this.id);
    }

    /**
     * @hidden
     */
    public dataLoading(event) {
        this.onDataPreLoad.emit(event);
    }

    /**
     * Toggles the specified column's visibility.
     * ```typescript
     * this.grid1.toggleColumnVisibility({
     *       column: this.grid1.columns[0],
     *       newValue: true
     * });
     * ```
	 * @memberof IgxGridComponent
     */
    public toggleColumnVisibility(args: IColumnVisibilityChangedEventArgs) {
        this.api.toggle_column_visibility(this.id, args);
    }

    /**
     * @hidden
     */
    get calcResizerHeight(): number {
        if (this.hasSummarizedColumns) {
            return this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight +
                this.tfoot.nativeElement.clientHeight;
        }
        return this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight;
    }

    /**
     * Returns the `IgxGridComponent`'s rows height.
     * ```typescript
     * const rowHeigh = this.grid.defaultRowHeight;
     * ```
	 * @memberof IgxGridComponent
     */
    get defaultRowHeight(): number {
        switch (this._displayDensity) {
            case DisplayDensity.compact:
                return 32;
            case DisplayDensity.cosy:
                return 40;
            case DisplayDensity.comfortable:
            default:
                return 50;
        }
    }

    /**
     * Returns the maximum width of the container for the pinned `IgxColumnComponent`s.
     * ```typescript
     * const maxPinnedColWidth = this.grid.calcPinnedContainerMaxWidth;
     * ```
	 * @memberof IgxGridComponent
     */
    get calcPinnedContainerMaxWidth(): number {
        return (this.calcWidth * 80) / 100;
    }

    /**
     * Returns the minimum width of the container for the unpinned `IgxColumnComponent`s.
     * ```typescript
     * const minUnpinnedColWidth = this.grid.unpinnedAreaMinWidth;
     * ```
	 * @memberof IgxGridComponent
     */
    get unpinnedAreaMinWidth(): number {
        return (this.calcWidth * 20) / 100;
    }

    /**
     * Returns the current width of the container for the pinned `IgxColumnComponent`s.
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth;
     * ```
	 * @memberof IgxGridComponent
     */
    get pinnedWidth() {
        return this.getPinnedWidth();
    }

    /**
     * Returns the current width of the container for the unpinned `IgxColumnComponent`s.
     * ```typescript
     * const unpinnedWidth = this.grid.getUnpinnedWidth;
     * ```
	 * @memberof IgxGridComponent
     */
    get unpinnedWidth() {
        return this.getUnpinnedWidth();
    }

    /**
     * @hidden
     */
    get summariesMargin() {
        return this.rowSelectable ? this.calcRowCheckboxWidth : 0;
    }

    /**
     * Returns an array of `IgxColumnComponent`s.
     * ```typescript
     * const colums = this.grid.columns.
     * ```
	 * @memberof IgxGridComponent
     */
    get columns(): IgxColumnComponent[] {
        return this._columns;
    }
    set columns(value: IgxColumnComponent[]) {
        this._columns = value;
    }

    /**
     * Returns an array of the pinned `IgxColumnComponent`s.
     * ```typescript
     * const pinnedColumns = this.grid.pinnedColumns.
     * ```
	 * @memberof IgxGridComponent
     */
    get pinnedColumns(): IgxColumnComponent[] {
        return this._pinnedColumns;
    }
    set pinnedColumns(value: IgxColumnComponent[]) {
        this._pinnedColumns = value;
    }

    /**
     * Returns an array of unpinned `IgxColumnComponent`s.
     * ```typescript
     * const unpinnedColumns = this.grid.unpinnedColumns.
     * ```
	 * @memberof IgxGridComponent
     */
    get unpinnedColumns(): IgxColumnComponent[] {
        return this._unpinnedColumns.filter((col) => !col.hidden);
    }
    set unpinnedColumns(value: IgxColumnComponent[]) {
        this._unpinnedColumns = value;
    }

    /**
     * Returns the `IgxColumnComponent` by field name.
     * ```typescript
     * const myCol = this.grid1.getColumnByName("ID");
     * ```
     * @param name
     * @memberof IgxGridComponent
     */
    public getColumnByName(name: string): IgxColumnComponent {
        return this.api.get_column_by_name(this.id, name);
    }

    /**
     * Returns the `IgxColumnComponent` by index.
     * ```typescript
     * const myRow = this.grid1.getRowByIndex(1);
     * ```
     * @param index
     * @memberof IgxGridComponent
     */
    public getRowByIndex(index: number): IgxRowComponent<IGridBaseComponent> {
        return this.api.get_row_by_index(this.id, index);
    }

    /**
     * Returns `IgxGridRowComponent` object by the specified primary key .
     * Requires that the `primaryKey` property is set.
     * ```typescript
     * const myRow = this.grid1.getRowByKey("cell5");
     * ```
     * @param keyValue
     * @memberof IgxGridComponent
     */
    public getRowByKey(keyValue: any): IgxRowComponent<IGridBaseComponent> {
        return this.api.get_row_by_key(this.id, keyValue);
    }

    /**
     * Returns the `IgxGridCellComponent` that matches the conditions.
     * ```typescript
     * const myCell = this.grid1.getCellByColumn(2,"UnitPrice");
     * ```
     * @param rowIndex
     * @param columnField
     * @memberof IgxGridComponent
     */
    public getCellByColumn(rowIndex: number, columnField: string): IgxGridCellComponent {
        return this.api.get_cell_by_column(this.id, rowIndex, columnField);
    }

    /**
     * Returns an `IgxGridCellComponent` object by the specified primary key and column field.
     * Requires that the primaryKey property is set.
     * ```typescript
     * grid.getCellByKey(1, 'index');
     * ```
     * @param rowSelector match any rowID
     * @param columnField
     * @memberof IgxGridComponent
     */
    public getCellByKey(rowSelector: any, columnField: string): IgxGridCellComponent {
        return this.api.get_cell_by_key(this.id, rowSelector, columnField);
    }

    /**
     * Moves a column to the specified drop target.
     * ```typescript
     * grid.moveColumn(compName, persDetails);
     * ```
	  * @memberof IgxGridComponent
	  */
    public moveColumn(column: IgxColumnComponent, dropTarget: IgxColumnComponent, pos: DropPosition = DropPosition.None) {
        this.api.move_column(this.id, column, dropTarget, pos);
    }

    /**
     * Goes to the next page of the `IgxGridComponent`, if the grid is not already at the last page.
     * ```typescript
     * this.grid1.nextPage();
     * ```
	 * @memberof IgxGridComponent
     */
    public nextPage(): void {
        this.api.next_page(this.id);
    }

    /**
     * Goes to the previous page of the `IgxGridComponent`, if the grid is not already at the first page.
     * ```typescript
     * this.grid1.previousPage();
     * ```
	 * @memberof IgxGridComponent
     */
    public previousPage(): void {
        this.api.previous_page(this.id);
    }

    /**
     * Goes to the desired page index.
     * ```typescript
     * this.grid1.paginate(1);
     * ```
     * @param val
     * @memberof IgxGridComponent
     */
    public paginate(val: number): void {
        this.api.paginate(this.id, val);
    }

    /**
     * Manually marks the `IgxGridComponent` for change detection.
     * ```typescript
     * this.grid1.markForCheck();
     * ```
	 * @memberof IgxGridComponent
     */
    public markForCheck() {
        this.api.mark_for_check(this.id);
    }

    /**
     * Creates a new `IgxGridRowComponent` and adds the data record to the end of the data source.
     * ```typescript
     * const record = {
     *     ID: this.grid1.data[this.grid1.data.length - 1].ID + 1,
     *     Name: this.newRecord
     * };
     * this.grid1.addRow(record);
     * ```
     * @param data
     * @memberof IgxGridComponent
     */
    public addRow(data: any): void {
        this.api.add_row(this.id, data);
    }

    /**
     * Removes the `IgxGridRowComponent` and the corresponding data record by primary key.
     * Requires that the `primaryKey` property is set.
     * The method accept rowSelector as a parameter, which is the rowID.
     * ```typescript
     * this.grid1.deleteRow(0);
     * ```
     * @param rowSelector
     * @memberof IgxGridComponent
     */
    public deleteRow(rowSelector: any): void {
        this.api.delete_row(this.id, rowSelector);
    }

    /**
     * Updates the `IgxGridRowComponent` and the corresponding data record by primary key.
     * Requires that the `primaryKey` property is set.
     * ```typescript
     * this.gridWithPK.updateCell('Updated', 1, 'ProductName');
     * ```
     * @param value the new value which is to be set.
     * @param rowSelector corresponds to rowID.
     * @param column corresponds to column field.
     * @memberof IgxGridComponent
     */
    public updateCell(value: any, rowSelector: any, column: string): void {
        this.api.update_cell(this.id, value, rowSelector, column);
    }

    /**
     * Updates the `IgxGridRowComponent`, which is specified by
     * rowSelector parameter and the data source record with the passed value.
     * This method will apply requested update only if primary key is specified in the grid.
     * ```typescript
     * grid.updateRow({
     *       ProductID: 1, ProductName: 'Spearmint', InStock: true, UnitsInStock: 1, OrderDate: new Date('2005-03-21')
     *   }, 1);
     * ```
     * @param value
     * @param rowSelector correspond to rowID
     * @memberof IgxGridComponent
     */
    public updateRow(value: any, rowSelector: any): void {
        this.api.update_row(this.id, value, rowSelector);
    }

    /**
     * Sort a single `IgxColumnComponent`.
     * Sort the `IgxGridComponent`'s `IgxColumnComponent` based on the provided array of sorting expressions.
     * ```typescript
     * this.grid.sort({ fieldName: name, dir: SortingDirection.Asc, ignoreCase: false });
     * ```
	 * @memberof IgxGridComponent
     */
    public sort(expression: ISortingExpression | Array<ISortingExpression>): void;
    public sort(...rest): void {
        this.api.sort(this.id, rest);
    }

    /**
     * Filters a single `IgxColumnComponent`.
     * ```typescript
     * public filter(term) {
     *      this.grid.filter("ProductName", term, IgxStringFilteringOperand.instance().condition("contains"));
     * }
     * ```
     * @param name
     * @param value
     * @param conditionOrExpressionTree
     * @param ignoreCase
     * @memberof IgxGridComponent
     */
    public filter(name: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase?: boolean) {
        this.api.filter(this.id, name, value, conditionOrExpressionTree, ignoreCase);
    }

    /**
     * Filters all the `IgxColumnComponent` in the `IgxGridComponent` with the same condition.
     * ```typescript
     * grid.filterGlobal('some', IgxStringFilteringOperand.instance().condition('contains'));
     * ```
     * @param value
     * @param condition
     * @param ignoreCase
     * @memberof IgxGridComponent
     */
    public filterGlobal(value: any, condition?, ignoreCase?) {
        this.api.filter_global(this.id, value, condition, ignoreCase);
    }

    /**
     * Enables summaries for the specified column and applies your customSummary.
     * If you do not provide the customSummary, then the default summary for the column data type will be applied.
     * ```typescript
     * grid.enableSummaries([{ fieldName: 'ProductName' }, { fieldName: 'ID' }]);
     * ```
     * Enable summaries for the listed columns.
     * ```typescript
     * grid.enableSummaries('ProductName');
     * ```
     * @param rest
     * @memberof IgxGridComponent
     */
    public enableSummaries(...rest) {
        this.api.enable_summaries(this.id, rest);
    }

    /**
     * Disable summaries for the specified column.
     * ```typescript
     * grid.disableSummaries('ProductName');
     * ```
     *
     * Disable summaries for the listed columns.
     * ```typescript
     * grid.disableSummaries([{ fieldName: 'ProductName' }]);
     * ```
	 * @memberof IgxGridComponent
     */
    public disableSummaries(...rest) {
        this.api.disable_summaries(this.id, rest);
    }

    /**
     * If name is provided, clears the filtering state of the corresponding `IgxColumnComponent`,
     * otherwise clears the filtering state of all `IgxColumnComponent`s.
     * ```typescript
     * this.grid.clearFilter();
     * ```
     * @param name
     * @memberof IgxGridComponent
     */
    public clearFilter(name?: string) {
        this.api.clear_filter(this.id, name);
    }

    /**
     * If name is provided, clears the sorting state of the corresponding `IgxColumnComponent`,
     * otherwise clears the sorting state of all `IgxColumnComponent`.
     * ```typescript
     * this.grid.clearSort();
     * ```
     * @param name
     * @memberof IgxGridComponent
     */
    public clearSort(name?: string) {
        this.api.clear_sort(this.id, name);
    }

    /**
     * @hidden
     */
    public clearSummaryCache(editCell?) {
        this.api.clear_summary_cache(this.id, editCell);
    }

    // TODO: We have return values here. Move them to event args ??

    /**
     * Pins a column by field name. Returns whether the operation is successful.
     * ```typescript
     * this.grid.pinColumn("ID");
     * ```
     * @param columnName
     * @param index
     * @memberof IgxGridComponent
     */
    public pinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        return this.api.pin_column(this.id, columnName, index);
    }

    /**
     * Unpins a column by field name. Returns whether the operation is successful.
     * ```typescript
     * this.grid.pinColumn("ID");
     * ```
     * @param columnName
     * @param index
     * @memberof IgxGridComponent
     */
    public unpinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        return this.api.unpin_column(this.id, columnName, index);
    }

        /**
     * Recalculates grid width/height dimensions. Should be run when changing DOM elements dimentions manually that affect the grid's size.
     * ```typescript
     * this.grid.reflow();
     * ```
	 * @memberof IgxGridComponent
     */
    public reflow() {
        this.api.reflow(this.id);
    }

    /**
     * Recalculates grid summary area.
     * Should be run for example when enabling or disabling summaries for a column.
     * ```typescript
     * this.grid.recalculateSummaries();
     * ```
	 * @memberof IgxGridComponent
     */
    public recalculateSummaries() {
        this.api.recalculate_summaries(this.id);
    }

    /**
     * Finds the next occurrence of a given string in the grid and scrolls to the cell if it isn't visible.
     * Returns how many times the grid contains the string.
     * ```typescript
     * this.grid.findNext("financial");
     * ```
     * @param text the string to search.
     * @param caseSensitive optionally, if the search should be case sensitive (defaults to false).
     * @param exactMatch optionally, if the text should match the entire value  (defaults to false).
     * @memberof IgxGridComponent
     */
    public findNext(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return this.api.find(this.id, text, 1, caseSensitive, exactMatch);
    }

    /**
     * Finds the previous occurrence of a given string in the grid and scrolls to the cell if it isn't visible.
     * Returns how many times the grid contains the string.
     * ```typescript
     * this.grid.findPrev("financial");
     * ````
     * @param text the string to search.
     * @param caseSensitive optionally, if the search should be case sensitive (defaults to false).
     * @param exactMatch optionally, if the text should match the entire value (defaults to false).
     * @memberof IgxGridComponent
     */
    public findPrev(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return this.api.find(this.id, text, -1, caseSensitive, exactMatch);
    }

    /**
     * Reapplies the existing search.
     * Returns how many times the grid contains the last search.
     * ```typescript
     * this.grid.refreshSearch();
     * ```
     * @param updateActiveInfo
     * @memberof IgxGridComponent
     */
    public refreshSearch(updateActiveInfo?: boolean): number {
        return this.api.refresh_search(this.id, updateActiveInfo);
    }

    /**
     * Removes all the highlights in the cell.
     * ```typescript
     * this.grid.clearSearch();
     * ```
	 * @memberof IgxGridComponent
     */
    public clearSearch() {
        this.api.clear_search(this.id);
    }

    /**
     * Returns an array of the selected `IgxGridCellComponent`s.
     * ```typescript
     * const selectedCells = this.grid.selectedCells;
     * ```
	 * @memberof IgxGridComponent
     */
    get selectedCells(): IgxGridCellComponent[] | any[] {
        return this.api.selected_cells(this.id);
    }

    /**
     * Gets calculated width of the pinned area.
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth();
     * ```
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     * @memberof IgxGridComponent
     */
    public getPinnedWidth(takeHidden = false) {
        return this.api.get_pinned_width(this.id, takeHidden);
    }

    /**
     * @hidden
     * Gets calculated width of the unpinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     * @memberof IgxGridComponent
     */
    protected getUnpinnedWidth(takeHidden = false) {
        return this.api.get_unpinned_width(this.id, takeHidden);
    }

    /**
     * @hidden
     */
    onlyTopLevel(arr) {
        return arr.filter(c => c.level === 0);
    }

    /**
     * @hidden
     */
    public onHeaderCheckboxClick(event) {
        this.api.on_header_checkbox_click(this.id, event);
    }

    /**
    * @hidden
    */
    public getContext(rowData): any {
        return {
            $implicit: rowData,
            templateID: 'dataRow'
        };
    }

    /**
     * @hidden
     */
    public checkHeaderCheckboxStatus(headerStatus?: boolean) {
        this.api.check_header_checkbox_status(this.id, headerStatus);
    }

    /**
     * Get current selection state.
     * Returns an array with selected rows' IDs (primaryKey or rowData)
     * ```typescript
     * const selectedRows = this.grid.selectedRows();
     * ```
	 * @memberof IgxGridComponent
     */
    public selectedRows(): any[] {
        return this.api.selected_rows(this.id);
    }

    /**
     * Select specified rows by ID.
     * ```typescript
     * this.grid.selectRows([1,2,5], true);
     * ```
     * @param rowIDs
     * @param clearCurrentSelection if true clears the curren selection
     * @memberof IgxGridComponent
     */
    public selectRows(rowIDs: any[], clearCurrentSelection?: boolean) {
        this.api.select_rows(this.id, rowIDs, clearCurrentSelection);
    }

    /**
     * Deselect specified rows by ID.
     * ```typescript
     * this.grid.deselectRows([1,2,5]);
     * ```
     * @param rowIDs
     * @memberof IgxGridComponent
     */
    public deselectRows(rowIDs: any[]) {
        this.api.deselect_rows(this.id, rowIDs);
    }

    /**
     * Selects all rows
     * Note: If filtering is in place, selectAllRows() and deselectAllRows() select/deselect all filtered rows.
     * ```typescript
     * this.grid.selectAllRows();
     * ```
	 * @memberof IgxGridComponent
     */
    public selectAllRows() {
        this.api.trigger_row_selection_change(this.id, this.selection.get_all_ids(this.data, this.primaryKey));
    }

    /**
     * Deselects all rows
     * ```typescript
     * this.grid.deselectAllRows();
     * ```
     * Note: If filtering is in place, selectAllRows() and deselectAllRows() select/deselect all filtered rows.
     */
    public deselectAllRows() {
        this.api.trigger_row_selection_change(this.id, this.selection.get_empty());
    }

    /**
     * @hidden
     */
    public triggerRowSelectionChange(newSelectionAsSet: Set<any>, row?: IgxRowComponent<IGridBaseComponent>,
                    event?: Event, headerStatus?: boolean) {
        this.api.trigger_row_selection_change(this.id, newSelectionAsSet, row, event, headerStatus);
    }

    /**
     * @hidden
     */
    public navigateDown(rowIndex: number, columnIndex: number, event?) {
        this.api.navigate_down(this.id, rowIndex, columnIndex, event);
    }

    /**
     * @hidden
     */
    public navigateUp(rowIndex: number, columnIndex: number, event?) {
        this.api.navigate_up(this.id, rowIndex, columnIndex, event);
    }

    /**
     * @hidden
     */
    @HostListener('scroll', ['$event'])
    public scrollHandler(event) {
        this.api.scroll_handler(this.id, event);
    }

    public focusNextCell(rowIndex: number, columnIndex: number, dir?: string, event?) {
        this.api.focus_next_cell(this.id, rowIndex, columnIndex, dir, event);
    }

    /**
     * @hidden
     */
    public trackColumnChanges(index, col) {
        return col.field + col.width;
    }

    /**
     * Returns an array containing the filtered data.
     * ```typescript
     * const filteredData = this.grid1.filteredSortedData;
     * ```
	 * @memberof IgxGridComponent
     */
    get filteredSortedData(): any[] {
        return this.api.filtered_sorted_data(this.id);
    }

    /**
     * @hidden
     */
    notGroups(arr) {
        return arr.filter(c => !c.columnGroup);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public onKeydownPageDown(event) {
        this.api.on_key_down_page_down(this.id, event);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageUp(event) {
        this.api.on_key_down_page_up(this.id, event);
    }

    public scrollTo(row: any, column: any) {
        this.api.scroll_to(this.id, row, column);
    }
}
