import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    CUSTOM_ELEMENTS_SCHEMA,
    DoCheck,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    reflectComponentType,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';
import { NgIf, NgClass, NgFor, NgTemplateOutlet, NgStyle } from '@angular/common';

import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxColumnComponent, } from '../columns/column.component';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxHierarchicalGridBaseDirective } from './hierarchical-grid-base.directive';
import { takeUntil } from 'rxjs/operators';
import { IgxTemplateOutletDirective } from '../../directives/template-outlet/template_outlet.directive';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { CellType, GridType, IGX_GRID_BASE, IGX_GRID_SERVICE_BASE, RowType } from '../common/grid.interface';
import { IgxRowIslandAPIService } from './row-island-api.service';
import { IgxGridCRUDService } from '../common/crud.service';
import { IgxHierarchicalGridRow } from '../grid-public-row';
import { IgxGridCell } from '../grid-public-cell';
import type { IgxPaginatorComponent } from '../../paginator/paginator.component';
import { IgxPaginatorToken } from '../../paginator/token';
import { IgxGridComponent } from '../grid/grid.component';
import { IgxOverlayOutletDirective, IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { IgxGridExcelStyleFilteringComponent } from '../filtering/excel-style/excel-style-filtering.component';
import { IgxGridValidationService } from '../grid/grid-validation.service';
import { IgxGridHierarchicalPipe, IgxGridHierarchicalPagingPipe } from './hierarchical-grid.pipes';
import { IgxSummaryDataPipe } from '../summaries/grid-root-summary.pipe';
import { IgxGridTransactionPipe, IgxHasVisibleColumnsPipe, IgxGridRowPinningPipe, IgxGridAddRowPipe, IgxGridRowClassesPipe, IgxGridRowStylesPipe, IgxStringReplacePipe } from '../common/pipes';
import { IgxGridSortingPipe, IgxGridFilteringPipe } from '../grid/grid.pipes';
import { IgxGridColumnResizerComponent } from '../resizing/resizer.component';
import { IgxRowEditTabStopDirective } from '../grid.rowEdit.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxRippleDirective } from '../../directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { IgxSummaryRowComponent } from '../summaries/summary-row.component';
import { IgxSnackbarComponent } from '../../snackbar/snackbar.component';
import { IgxCircularProgressBarComponent } from '../../progressbar/progressbar.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { IgxColumnMovingDropDirective } from '../moving/moving.drop.directive';
import { IgxGridDragSelectDirective } from '../selection/drag-select.directive';
import { IgxGridBodyDirective } from '../grid.common';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { IgxActionStripToken } from '../../action-strip/token';

let NEXT_ID = 0;

/**
 * @hidden @internal
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-child-grid-row',
    templateUrl: './child-grid-row.component.html',
    imports: [NgClass]
})
export class IgxChildGridRowComponent implements AfterViewInit, OnInit {
    @Input()
    public layout: IgxRowIslandComponent;

    /**
     * @hidden
     */
    public get parentHasScroll() {
        return !this.parentGrid.verticalScrollContainer.dc.instance.notVirtual;
    }


    /**
     * @hidden
     */
    @Input()
    public parentGridID: string;

    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].data;
     * ```
     */
    @Input()
    public get data(): any {
        return this._data || [];
    }

    public set data(value: any) {
        this._data = value;
        if (this.hGrid && !this.hGrid.dataSetByUser) {
            this.hGrid.setDataInternal(this._data.childGridsData[this.layout.key]);
        }
    }

    /**
     * The index of the row.
     *
     * ```typescript
     * // get the index of the second selected row
     * let selectedRowIndex = this.grid.selectedRows[1].index;
     * ```
     */
    @Input()
    public index: number;

    /* blazorSuppress */
    @ViewChild('container', { read: ViewContainerRef, static: true })
    public container: ViewContainerRef;

    /**
     * @hidden
     */
    public hGrid: IgxHierarchicalGridComponent;

    /* blazorSuppress */
    /**
     * Get a reference to the grid that contains the selected row.
     *
     * ```typescript
     * handleRowSelection(event) {
     *  // the grid on which the rowSelected event was triggered
     *  const grid = event.row.grid;
     * }
     * ```
     *
     * ```html
     *  <igx-grid
     *    [data]="data"
     *    (rowSelected)="handleRowSelection($event)">
     *  </igx-grid>
     * ```
     */
    // TODO: Refactor
    public get parentGrid(): IgxHierarchicalGridComponent {
        return this.gridAPI.grid as IgxHierarchicalGridComponent;
    }

    @HostBinding('attr.aria-level')
    public get level() {
        return this.layout.level;
    }

    /**
     * The native DOM element representing the row. Could be null in certain environments.
     *
     * ```typescript
     * // get the nativeElement of the second selected row
     * let selectedRowNativeElement = this.grid.selectedRows[1].nativeElement;
     * ```
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    public expanded = false;

    private _data: any;

    constructor(
        @Inject(IGX_GRID_SERVICE_BASE) public readonly gridAPI: IgxHierarchicalGridAPIService,
        public element: ElementRef<HTMLElement>,
        public cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     */
    public ngOnInit() {
        const ref = this.container.createComponent(IgxHierarchicalGridComponent, { injector: this.container.injector });
        this.hGrid = ref.instance;
        this.hGrid.setDataInternal(this.data.childGridsData[this.layout.key]);
        this.hGrid.nativeElement["__componentRef"] = ref;
        this.layout.layoutChange.subscribe((ch) => {
            this._handleLayoutChanges(ch);
        });
        const changes = this.layout.initialChanges;
        changes.forEach(change => {
            this._handleLayoutChanges(change);
        });
        this.hGrid.parent = this.parentGrid;
        this.hGrid.parentIsland = this.layout;
        this.hGrid.childRow = this;
        // handler logic that re-emits hgrid events on the row island
        this.setupEventEmitters();
        this.layout.gridCreated.emit({
            owner: this.layout,
            parentID: this.data.rowID,
            grid: this.hGrid
        });
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.hGrid.childLayoutList = this.layout.children;
        const layouts = this.hGrid.childLayoutList.toArray();
        layouts.forEach((l) => this.hGrid.gridAPI.registerChildRowIsland(l));
        this.parentGrid.gridAPI.registerChildGrid(this.data.rowID, this.layout.key, this.hGrid);
        this.layout.rowIslandAPI.registerChildGrid(this.data.rowID, this.hGrid);

        this.layout.gridInitialized.emit({
            owner: this.layout,
            parentID: this.data.rowID,
            grid: this.hGrid
        });

        this.hGrid.cdr.detectChanges();
    }

    private setupEventEmitters() {
        const destructor = takeUntil(this.hGrid.destroy$);

        const mirror = reflectComponentType(IgxGridComponent);
        // exclude outputs related to two-way binding functionality
        const inputNames = mirror.inputs.map(input => input.propName);
        const outputs = mirror.outputs.filter(o => {
            const matchingInputPropName = o.propName.slice(0, o.propName.indexOf('Change'));
            return inputNames.indexOf(matchingInputPropName) === -1;
        });

        // TODO: Skip the `rendered` output. Rendered should be called once per grid.
        outputs.filter(o => o.propName !== 'rendered').forEach(output => {
            if (this.hGrid[output.propName]) {
                this.hGrid[output.propName].pipe(destructor).subscribe((args) => {
                    if (!args) {
                        args = {};
                    }
                    args.owner = this.hGrid;
                    this.layout[output.propName].emit(args);
                });
            }
        });
    }


    private _handleLayoutChanges(changes: SimpleChanges) {
        for (const change in changes) {
            if (changes.hasOwnProperty(change)) {
                this.hGrid[change] = changes[change].currentValue;
            }
        }
    }
}


/* blazorAdditionalDependency: Column */
/* blazorAdditionalDependency: ColumnGroup */
/* blazorAdditionalDependency: ColumnLayout */
/* blazorAdditionalDependency: GridToolbar */
/* blazorAdditionalDependency: GridToolbarActions */
/* blazorAdditionalDependency: GridToolbarTitle */
/* blazorAdditionalDependency: GridToolbarAdvancedFiltering */
/* blazorAdditionalDependency: GridToolbarExporter */
/* blazorAdditionalDependency: GridToolbarHiding */
/* blazorAdditionalDependency: GridToolbarPinning */
/* blazorAdditionalDependency: ActionStrip */
/* blazorAdditionalDependency: GridActionsBaseDirective */
/* blazorAdditionalDependency: GridEditingActions */
/* blazorAdditionalDependency: GridPinningActions */
/* blazorAdditionalDependency: RowIsland */
/* blazorIndirectRender */
/**
 * Hierarchical grid
 *
 * @igxModule IgxHierarchicalGridModule
 *
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-hierarchical-grid',
    templateUrl: 'hierarchical-grid.component.html',
    providers: [
        IgxGridCRUDService,
        IgxGridValidationService,
        IgxGridSelectionService,
        { provide: IGX_GRID_SERVICE_BASE, useClass: IgxHierarchicalGridAPIService },
        { provide: IGX_GRID_BASE, useExisting: IgxHierarchicalGridComponent },
        IgxGridSummaryService,
        IgxFilteringService,
        IgxHierarchicalGridNavigationService,
        IgxColumnResizingService,
        IgxForOfSyncService,
        IgxForOfScrollSyncService,
        IgxRowIslandAPIService
    ],
    imports: [
        NgIf,
        NgClass,
        NgFor,
        NgTemplateOutlet,
        NgStyle,
        IgxGridHeaderRowComponent,
        IgxGridBodyDirective,
        IgxGridDragSelectDirective,
        IgxColumnMovingDropDirective,
        IgxGridForOfDirective,
        IgxTemplateOutletDirective,
        IgxHierarchicalRowComponent,
        IgxOverlayOutletDirective,
        IgxToggleDirective,
        IgxCircularProgressBarComponent,
        IgxSnackbarComponent,
        IgxSummaryRowComponent,
        IgxButtonDirective,
        IgxRippleDirective,
        IgxIconComponent,
        IgxRowEditTabStopDirective,
        IgxGridColumnResizerComponent,
        IgxChildGridRowComponent,
        IgxGridSortingPipe,
        IgxGridFilteringPipe,
        IgxGridTransactionPipe,
        IgxHasVisibleColumnsPipe,
        IgxGridRowPinningPipe,
        IgxGridAddRowPipe,
        IgxGridRowClassesPipe,
        IgxGridRowStylesPipe,
        IgxSummaryDataPipe,
        IgxGridHierarchicalPipe,
        IgxGridHierarchicalPagingPipe,
        IgxStringReplacePipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxHierarchicalGridComponent extends IgxHierarchicalGridBaseDirective
    implements GridType, AfterViewInit, AfterContentInit, OnInit, OnDestroy, DoCheck {

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'grid';

    /* contentChildren */
    /* blazorInclude */
    /* blazorTreatAsCollection */
    /* blazorCollectionName: RowIslandCollection */
    /* ngQueryListName: childLayoutList */
    /**
     * @hidden
     */
    @ContentChildren(IgxRowIslandComponent, { read: IgxRowIslandComponent, descendants: false })
    public childLayoutList: QueryList<IgxRowIslandComponent>;

    /**
     * @hidden
     */
    @ContentChildren(IgxRowIslandComponent, { read: IgxRowIslandComponent, descendants: true })
    public allLayoutList: QueryList<IgxRowIslandComponent>;

    /** @hidden @internal */
    @ContentChildren(IgxPaginatorToken, { descendants: true })
    public paginatorList: QueryList<IgxPaginatorComponent>;

    /** @hidden @internal */
    @ViewChild('toolbarOutlet', { read: ViewContainerRef })
    public toolbarOutlet: ViewContainerRef;

    /** @hidden @internal */
    @ViewChild('paginatorOutlet', { read: ViewContainerRef })
    public paginatorOutlet: ViewContainerRef;
    /**
     * @hidden
     */
    @ViewChildren(IgxTemplateOutletDirective, { read: IgxTemplateOutletDirective })
    public templateOutlets: QueryList<any>;

    /**
     * @hidden
     */
    @ViewChildren(IgxChildGridRowComponent)
    public hierarchicalRows: QueryList<IgxChildGridRowComponent>;

    @ViewChild('hierarchical_record_template', { read: TemplateRef, static: true })
    protected hierarchicalRecordTemplate: TemplateRef<any>;

    @ViewChild('child_record_template', { read: TemplateRef, static: true })
    protected childTemplate: TemplateRef<any>;

    // @ViewChild('headerHierarchyExpander', { read: ElementRef, static: true })
    protected get headerHierarchyExpander() {
        return this.theadRow?.headerHierarchyExpander;
    }

    /**
     * @hidden
     */
    public childLayoutKeys = [];

    /** @hidden @internal */
    public dataSetByUser = false;

    /**
     * @hidden
     */
    public highlightedRowID = null;

    /**
     * @hidden
     */
    public updateOnRender = false;

    /**
     * @hidden
     */
    public parent: IgxHierarchicalGridComponent = null;

    /**
     * @hidden @internal
     */
    public childRow: IgxChildGridRowComponent;

    @ContentChildren(IgxActionStripToken, { read: IgxActionStripToken, descendants: false })
    protected override actionStripComponents: QueryList<IgxActionStripToken>;

    /** @hidden @internal */
    public override get actionStrip() {
        return this.parentIsland ? this.parentIsland.actionStrip : super.actionStrip;
    }

    private _data;
    private h_id = `igx-hierarchical-grid-${NEXT_ID++}`;
    private childGridTemplates: Map<any, any> = new Map();

    /**
     * Gets/Sets the value of the `id` attribute.
     *
     * @remarks
     * If not provided it will be automatically generated.
     * @example
     * ```html
     * <igx-hierarchical-grid [id]="'igx-hgrid-1'" [data]="Data" [autoGenerate]="true"></igx-hierarchical-grid>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this.h_id;
    }
    public set id(value: string) {
        this.h_id = value;
    }

    /* treatAsRef */
    /**
     * Gets/Sets the array of data that populates the component.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true"></igx-hierarchical-grid>
     * ```
     *
     * @memberof IgxHierarchicalGridComponent
     */
    @Input()
    public set data(value: any[] | null) {
        this.setDataInternal(value);
        this.dataSetByUser = true;
        this.checkPrimaryKeyField();
    }

    /**
     * Returns an array of data set to the `IgxHierarchicalGridComponent`.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
     *
     * @memberof IgxHierarchicalGridComponent
     */
    public get data(): any[] | null {
        return this._data;
    }

    /** @hidden @internal */
    public override get paginator() {
        const id = this.id;
        return (!this.parentIsland && this.paginationComponents?.first) || this.rootGrid.paginatorList?.find((pg) =>
            pg.nativeElement.offsetParent?.id === id);
    }

    /** @hidden @internal */
    public override get excelStyleFilteringComponent(): IgxGridExcelStyleFilteringComponent {
        return this.parentIsland ?
            this.parentIsland.excelStyleFilteringComponents.first :
            super.excelStyleFilteringComponent;
    }

    /**
     * Gets/Sets the total number of records in the data source.
     *
     * @remarks
     * This property is required for remote grid virtualization to function when it is bound to remote data.
     * @example
     * ```typescript
     * const itemCount = this.grid1.totalItemCount;
     * this.grid1.totalItemCount = 55;
     * ```
     */
    @Input()
    public set totalItemCount(count) {
        this.verticalScrollContainer.totalItemCount = count;
    }

    public get totalItemCount() {
        return this.verticalScrollContainer.totalItemCount;
    }

    /**
     * Sets if all immediate children of the `IgxHierarchicalGridComponent` should be expanded/collapsed.
     * Default value is false.
     * ```html
     * <igx-hierarchical-grid [id]="'igx-grid-1'" [data]="Data" [autoGenerate]="true" [expandChildren]="true"></igx-hierarchical-grid>
     * ```
     *
     * @memberof IgxHierarchicalGridComponent
     */
    @Input({ transform: booleanAttribute })
    public set expandChildren(value: boolean) {
        this._defaultExpandState = value;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Gets if all immediate children of the `IgxHierarchicalGridComponent` previously have been set to be expanded/collapsed.
     * If previously set and some rows have been manually expanded/collapsed it will still return the last set value.
     * ```typescript
     * const expanded = this.grid.expandChildren;
     * ```
     *
     * @memberof IgxHierarchicalGridComponent
     */
    public get expandChildren(): boolean {
        return this._defaultExpandState;
    }

    /**
     * Gets the unique identifier of the parent row. It may be a `string` or `number` if `primaryKey` of the
     * parent grid is set or an object reference of the parent record otherwise.
     * ```typescript
     * const foreignKey = this.grid.foreignKey;
     * ```
     *
     * @memberof IgxHierarchicalGridComponent
     */
    public get foreignKey() {
        if (!this.parent) {
            return null;
        }
        return this.parent.gridAPI.getParentRowId(this);
    }

    /**
     * @hidden
     */
    public get hasExpandableChildren() {
        return !!this.childLayoutKeys.length;
    }

    /**
     * @hidden
     */
    public get resolveRowEditContainer() {
        if (this.parentIsland && this.parentIsland.rowEditCustom) {
            return this.parentIsland.rowEditContainer;
        }
        return this.rowEditContainer;
    }

    /**
     * @hidden
     */
    public get resolveRowEditActions() {
        return this.parentIsland ? this.parentIsland.rowEditActionsTemplate : this.rowEditActionsTemplate;
    }

    /**
     * @hidden
     */
    public get resolveRowEditText() {
        return this.parentIsland ? this.parentIsland.rowEditTextTemplate : this.rowEditTextTemplate;
    }

    /** @hidden */
    public override hideActionStrip() {
        if (!this.parent) {
            // hide child layout actions strips when
            // moving outside root grid.
            super.hideActionStrip();
            this.allLayoutList.forEach(ri => {
                ri.actionStrip?.hide();
            });
        }
    }

    /**
     * @hidden
     */
    public override get parentRowOutletDirective() {
        // Targeting parent outlet in order to prevent hiding when outlet
        // is present at a child grid and is attached to a row.
        return this.parent ? this.parent.rowOutletDirective : this.outlet;
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        // this.expansionStatesChange.pipe(takeUntil(this.destroy$)).subscribe((value: Map<any, boolean>) => {
        //     const res = Array.from(value.entries()).filter(({1: v}) => v === true).map(([k]) => k);
        // });
        this.batchEditing = !!this.rootGrid.batchEditing;
        if (this.rootGrid !== this) {
            this.rootGrid.batchEditingChange.pipe(takeUntil(this.destroy$)).subscribe((val: boolean) => {
                this.batchEditing = val;
            });
        }
        super.ngOnInit();
    }

    /**
     * @hidden
     */
    public override ngAfterViewInit() {
        super.ngAfterViewInit();
        this.verticalScrollContainer.beforeViewDestroyed.pipe(takeUntil(this.destroy$)).subscribe((view) => {
            const rowData = view.context.$implicit;
            if (this.isChildGridRecord(rowData)) {
                const cachedData = this.childGridTemplates.get(rowData.rowID);
                if (cachedData) {
                    const tmlpOutlet = cachedData.owner;
                    tmlpOutlet._viewContainerRef.detach(0);
                }
            }
        });

        if (this.parent) {
            this.childLayoutKeys = this.parentIsland.children.map((item) => item.key);
        }

        this.headSelectorsTemplates = this.parentIsland ?
            this.parentIsland.headSelectorsTemplates :
            this.headSelectorsTemplates;

        this.rowSelectorsTemplates = this.parentIsland ?
            this.parentIsland.rowSelectorsTemplates :
            this.rowSelectorsTemplates;
        this.dragIndicatorIconTemplate = this.parentIsland ?
            this.parentIsland.dragIndicatorIconTemplate :
            this.dragIndicatorIconTemplate;
        this.rowExpandedIndicatorTemplate = this.rootGrid.rowExpandedIndicatorTemplate;
        this.rowCollapsedIndicatorTemplate = this.rootGrid.rowCollapsedIndicatorTemplate;
        this.headerCollapsedIndicatorTemplate = this.rootGrid.headerCollapsedIndicatorTemplate;
        this.headerExpandedIndicatorTemplate = this.rootGrid.headerExpandedIndicatorTemplate;
        this.excelStyleHeaderIconTemplate = this.rootGrid.excelStyleHeaderIconTemplate;
        this.sortAscendingHeaderIconTemplate = this.rootGrid.sortAscendingHeaderIconTemplate;
        this.sortDescendingHeaderIconTemplate = this.rootGrid.sortDescendingHeaderIconTemplate;
        this.sortHeaderIconTemplate = this.rootGrid.sortHeaderIconTemplate;
        this.hasChildrenKey = this.parentIsland ?
            this.parentIsland.hasChildrenKey || this.rootGrid.hasChildrenKey :
            this.rootGrid.hasChildrenKey;
        this.showExpandAll = this.parentIsland ?
            this.parentIsland.showExpandAll : this.rootGrid.showExpandAll;
    }

    /**
     * @hidden
     */
    public override ngAfterContentInit() {
        this.updateColumnList(false);
        this.childLayoutKeys = this.parent ?
            this.parentIsland.children.map((item) => item.key) :
            this.childLayoutKeys = this.childLayoutList.map((item) => item.key);
        this.childLayoutList.notifyOnChanges();
        this.childLayoutList.changes.pipe(takeUntil(this.destroy$)).subscribe(() =>
            this.onRowIslandChange()
        );
        super.ngAfterContentInit();
    }

    /**
     * Returns the `RowType` by index.
     *
     * @example
     * ```typescript
     * const myRow = this.grid1.getRowByIndex(1);
     * ```
     * @param index
     */
    public getRowByIndex(index: number): RowType {
        if (index < 0 || index >= this.dataView.length) {
            return undefined;
        }
        return this.createRow(index);
    }

    /**
     * Returns the `RowType` by key.
     *
     * @example
     * ```typescript
     * const myRow = this.grid1.getRowByKey(1);
     * ```
     * @param key
     */
    public getRowByKey(key: any): RowType {
        const data = this.dataView;
        const rec = this.primaryKey ?
            data.find(record => record[this.primaryKey] === key) :
            data.find(record => record === key);
        const index = data.indexOf(rec);
        if (index < 0 || index > data.length) {
            return undefined;
        }

        return new IgxHierarchicalGridRow(this as any, index, rec);
    }

    /**
     * @hidden @internal
     */
    public allRows(): RowType[] {
        return this.dataView.map((rec, index) => this.createRow(index));
    }

    /**
     * Returns the collection of `IgxHierarchicalGridRow`s for current page.
     *
     * @hidden @internal
     */
    public dataRows(): RowType[] {
        return this.allRows().filter(row => row instanceof IgxHierarchicalGridRow);
    }

    /**
     * Returns an array of the selected `IgxGridCell`s.
     *
     * @example
     * ```typescript
     * const selectedCells = this.grid.selectedCells;
     * ```
     */
    public get selectedCells(): CellType[] {
        return this.dataRows().map((row) => row.cells.filter((cell) => cell.selected))
            .reduce((a, b) => a.concat(b), []);
    }

    /**
     * Returns a `CellType` object that matches the conditions.
     *
     * @example
     * ```typescript
     * const myCell = this.grid1.getCellByColumn(2, "UnitPrice");
     * ```
     * @param rowIndex
     * @param columnField
     */
    public getCellByColumn(rowIndex: number, columnField: string): CellType {
        const row = this.getRowByIndex(rowIndex);
        const column = this.columns.find((col) => col.field === columnField);
        if (row && row instanceof IgxHierarchicalGridRow && column) {
            return new IgxGridCell(this, rowIndex, column);
        }
    }

    /**
     * Returns a `CellType` object that matches the conditions.
     *
     * @remarks
     * Requires that the primaryKey property is set.
     * @example
     * ```typescript
     * grid.getCellByKey(1, 'index');
     * ```
     * @param rowSelector match any rowID
     * @param columnField
     */
    public getCellByKey(rowSelector: any, columnField: string): CellType {
        const row = this.getRowByKey(rowSelector);
        const column = this.columns.find((col) => col.field === columnField);
        if (row && column) {
            return new IgxGridCell(this, row.index, column);
        }
    }

    public override pinRow(rowID: any, index?: number): boolean {
        const row = this.getRowByKey(rowID);
        return super.pinRow(rowID, index, row);
    }

    /** @hidden @internal */
    public setDataInternal(value: any) {
        const oldData = this._data;
        this._data = value || [];
        this.summaryService.clearSummaryCache();
        if (!this._init) {
            this.validation.updateAll(this._data);
        }
        if (this.autoGenerate && this._data.length > 0 && this.shouldRecreateColumns(oldData, this._data)) {
            this.setupColumns();
            this.reflow();
        }
        this.cdr.markForCheck();
        if (this.parent && (this.height === null || this.height.indexOf('%') !== -1)) {
            // If the height will change based on how much data there is, recalculate sizes in igxForOf.
            this.notifyChanges(true);
        }
    }

    public override unpinRow(rowID: any): boolean {
        const row = this.getRowByKey(rowID);
        return super.unpinRow(rowID, row);
    }

    /**
     * @hidden @internal
     */
    public dataLoading(event) {
        this.dataPreLoad.emit(event);
    }

    /** @hidden */
    public override featureColumnsWidth() {
        return super.featureColumnsWidth(this.headerHierarchyExpander);
    }

    /**
     * @hidden
     */
    public onRowIslandChange() {
        if (this.parent) {
            this.childLayoutKeys = this.parentIsland.children.filter(item => !(item as any)._destroyed).map((item) => item.key);
        } else {
            this.childLayoutKeys = this.childLayoutList.filter(item => !(item as any)._destroyed).map((item) => item.key);
        }
        if (!(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
        }
    }

    /** @hidden @internal **/
    public override ngOnDestroy() {
        if (!this.parent) {
            this.gridAPI.getChildGrids(true).forEach((grid) => {
                if (!grid.childRow.cdr.destroyed) {
                    grid.childRow.cdr.destroy();
                }
            });
        }
        if (this.parent && this.selectionService.activeElement) {
            // in case selection is in destroyed child grid, selection should be cleared.
            this._clearSeletionHighlights();
        }
        super.ngOnDestroy();
    }

    /**
     * @hidden
     */
    public isRowHighlighted(rowData) {
        return this.highlightedRowID === rowData.rowID;
    }

    /**
     * @hidden
     */
    public isHierarchicalRecord(record: any): boolean {
        if (this.isGhostRecord(record)) {
            record = record.recordRef;
        }
        return this.childLayoutList.length !== 0 && record[this.childLayoutList.first.key];
    }

    /**
     * @hidden
     */
    public isChildGridRecord(record: any): boolean {
        // Can be null when there is defined layout but no child data was found
        return record?.childGridsData !== undefined;
    }

    /**
     * @hidden
     */
    public trackChanges(index, rec) {
        if (rec.childGridsData !== undefined) {
            // if is child rec
            return rec.rowID;
        }
        return rec;
    }

    /**
     * @hidden
     */
    public getContext(rowData, rowIndex, pinned): any {
        if (this.isChildGridRecord(rowData)) {
            const cachedData = this.childGridTemplates.get(rowData.rowID);
            if (cachedData) {
                const view = cachedData.view;
                const tmlpOutlet = cachedData.owner;
                return {
                    $implicit: rowData,
                    moveView: view,
                    owner: tmlpOutlet,
                    index: this.dataView.indexOf(rowData)
                };
            } else {
                // child rows contain unique grids, hence should have unique templates
                return {
                    $implicit: rowData,
                    templateID: {
                        type: 'childRow',
                        id: rowData.rowID
                    },
                    index: this.dataView.indexOf(rowData)
                };
            }
        } else {
            return {
                $implicit: this.isGhostRecord(rowData) ? rowData.recordRef : rowData,
                templateID: {
                    type: 'dataRow',
                    id: null
                },
                index: this.getDataViewIndex(rowIndex, pinned),
                disabled: this.isGhostRecord(rowData)
            };
        }
    }

    /**
     * @hidden
     */
    public get rootGrid(): GridType {
        let currGrid = this as IgxHierarchicalGridComponent;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
        }
        return currGrid;
    }

    /**
     * @hidden
     */
    public get iconTemplate() {
        const expanded = this.hasExpandedRecords() && this.hasExpandableChildren;
        if (!expanded && this.showExpandAll) {
            return this.headerCollapsedIndicatorTemplate || this.defaultCollapsedTemplate;
        } else {
            return this.headerExpandedIndicatorTemplate || this.defaultExpandedTemplate;
        }
    }

    /**
     * @hidden
     * @internal
     */
    public override getDragGhostCustomTemplate(): TemplateRef<any> {
        if (this.parentIsland) {
            return this.parentIsland.getDragGhostCustomTemplate();
        }
        return super.getDragGhostCustomTemplate();
    }

    /**
     * @hidden
     * Gets the visible content height that includes header + tbody + footer.
     * For hierarchical child grid it may be scrolled and not fully visible.
     */
    public override getVisibleContentHeight() {
        let height = super.getVisibleContentHeight();
        if (this.parent) {
            const rootHeight = this.rootGrid.getVisibleContentHeight();
            const topDiff = this.nativeElement.getBoundingClientRect().top - this.rootGrid.nativeElement.getBoundingClientRect().top;
            height = rootHeight - topDiff > height ? height : rootHeight - topDiff;
        }
        return height;
    }

    /**
     * @hidden
     */
    public toggleAll() {
        const expanded = this.hasExpandedRecords() && this.hasExpandableChildren;
        if (!expanded && this.showExpandAll) {
            this.expandAll();
        } else {
            this.collapseAll();
        }
    }


    /**
     * @hidden
     * @internal
     */
    public hasExpandedRecords() {
        if (this.expandChildren) {
            return true;
        }
        let hasExpandedEntry = false;
        this.expansionStates.forEach(value => {
            if (value) {
                hasExpandedEntry = value;
            }
        });
        return hasExpandedEntry;
    }

    public override getDefaultExpandState(record: any) {
        if (this.hasChildrenKey && !record[this.hasChildrenKey]) {
            return false;
        }
        return this.expandChildren;

    }

    /**
     * @hidden
     */
    public isExpanded(record: any): boolean {
        return this.gridAPI.get_row_expansion_state(record);
    }

    /**
     * @hidden
     */
    public viewCreatedHandler(args) {
        if (this.isChildGridRecord(args.context.$implicit)) {
            const key = args.context.$implicit.rowID;
            this.childGridTemplates.set(key, args);
        }
    }

    /**
     * @hidden
     */
    public viewMovedHandler(args) {
        if (this.isChildGridRecord(args.context.$implicit)) {
            // view was moved, update owner in cache
            const key = args.context.$implicit.rowID;
            const cachedData = this.childGridTemplates.get(key);
            cachedData.owner = args.owner;

            this.childLayoutList.forEach((layout) => {
                const relatedGrid = this.gridAPI.getChildGridByID(layout.key, args.context.$implicit.rowID);
                if (relatedGrid && relatedGrid.updateOnRender) {
                    // Detect changes if `expandChildren` has changed when the grid wasn't visible. This is for performance reasons.
                    relatedGrid.notifyChanges(true);
                    relatedGrid.updateOnRender = false;
                }
            });
        }
    }

    /** @hidden @internal **/
    public onContainerScroll() {
        this.hideOverlays();
    }

    /**
     * @hidden
     */
    public createRow(index: number, data?: any): RowType {
        let row: RowType;
        const dataIndex = this._getDataViewIndex(index);
        const rec: any = data ?? this.dataView[dataIndex];

        if (!row && rec && !rec.childGridsData) {
            row = new IgxHierarchicalGridRow(this as any, index, rec);
        }

        return row;
    }

    /** @hidden @internal */
    public getChildGrids(inDeph?: boolean) {
        return this.gridAPI.getChildGrids(inDeph);
    }

    protected override generateDataFields(data: any[]): string[] {
        return super.generateDataFields(data).filter((field) => {
            const layoutsList = this.parentIsland ? this.parentIsland.children : this.childLayoutList;
            const keys = layoutsList.map((item) => item.key);
            return keys.indexOf(field) === -1;
        });
    }

    protected resizeNotifyHandler() {
        // do not trigger reflow if element is detached or if it is child grid.
        if (this.nativeElement?.isConnected && !this.parent) {
            this.notifyChanges(true);
        }
    }

    /**
     * @hidden
     */
    protected override initColumns(collection: IgxColumnComponent[], cb: (args: any) => void = null) {
        if (this.hasColumnLayouts) {
            // invalid configuration - hierarchical grid should not allow column layouts
            // remove column layouts
            const nonColumnLayoutColumns = this.columns.filter((col) => !col.columnLayout && !col.columnLayoutChild);
            this.updateColumns(nonColumnLayoutColumns);
        }
        super.initColumns(collection, cb);
    }


    protected override setupColumns() {
        if (this.parentIsland && this.parentIsland.childColumns.length > 0 && !this.autoGenerate) {
            this.createColumnsList(this.parentIsland.childColumns.toArray());
        } else {
            super.setupColumns();
        }
    }

    protected override getColumnList() {
        const childLayouts = this.parent ? this.childLayoutList : this.allLayoutList;
        const nestedColumns = childLayouts.map((layout) => layout.columnList.toArray());
        const colsArray = [].concat.apply([], nestedColumns);
        if (colsArray.length > 0) {
            const topCols = this.columnList.filter((item) => colsArray.indexOf(item) === -1);
            return topCols;
        } else {
            return this.columnList.toArray()
        }
    }

    protected override onColumnsChanged() {
        Promise.resolve().then(() => {
            this.updateColumnList();
        });
    }

    protected override _shouldAutoSize(renderedHeight) {
        if (this.isPercentHeight && this.parent) {
            return true;
        }
        return super._shouldAutoSize(renderedHeight);
    }

    private updateColumnList(recalcColSizes = true) {
        const childLayouts = this.parent ? this.childLayoutList : this.allLayoutList;
        const nestedColumns = childLayouts.map((layout) => layout.columnList.toArray());
        const colsArray = [].concat.apply([], nestedColumns);
        const colLength = this.columns.length;
        const topCols = this.columnList.filter((item) => colsArray.indexOf(item) === -1);
        if (topCols.length > 0) {
            this.initColumns(topCols, (col: IgxColumnComponent) => this.columnInit.emit(col));
            if (recalcColSizes && this.columns.length !== colLength) {
                this.calculateGridSizes(false);
            }
        }
    }

    private _clearSeletionHighlights() {
        [this.rootGrid, ...this.rootGrid.getChildGrids(true)].forEach(grid => {
            grid.selectionService.clear();
            grid.selectionService.activeElement = null;
            grid.nativeElement.classList.remove('igx-grid__tr--highlighted');
            grid.highlightedRowID = null;
            grid.cdr.markForCheck();
        });
    }
}
