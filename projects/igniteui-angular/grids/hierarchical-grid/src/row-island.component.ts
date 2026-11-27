import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    EventEmitter,
    forwardRef,
    Input,
    IterableChangeRecord,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    inject,
    SimpleChanges,
    IterableDiffer
} from '@angular/core';
import {
    DropPosition,
    GridType,
    ICellPosition,
    IColumnVisibilityChangedEventArgs,
    IgxColumnComponent,
    IgxFilteringService,
    IgxGridPaginatorTemplateContext,
    IgxGridSelectionService,
    IgxGridToolbarDirective,
    IgxGridToolbarTemplateContext,
    ISearchInfo
} from 'igniteui-angular/grids/core';
import { IgxHierarchicalGridBaseDirective } from './hierarchical-grid-base.directive';
import {
    ColumnPinningPosition,
    ColumnType,
    GridSelectionRange,
    IFilteringExpressionsTree,
    IFilteringOperation,
    IGridResourceStrings,
    ISortingExpression,
    ISummaryExpression,
    OverlaySettings
} from 'igniteui-angular/core';
import { first, filter, takeUntil, pluck } from 'rxjs/operators';
import { IgxRowIslandAPIService } from './row-island-api.service';
import type { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IGridCreatedEventArgs } from './events';
import { IgxPaginatorComponent, IgxPaginatorDirective } from 'igniteui-angular/paginator';
import { IForOfState } from 'igniteui-angular/directives';

/* wcAlternateName: RowIslandBase */
/* blazorIndirectRender
   blazorComponent
   omitModule
   wcSkipComponentSuffix */
/**
 * Row island
 *
 * @igxModule IgxHierarchicalGridModule
 * @igxParent IgxHierarchicalGridComponent, IgxRowIslandComponent
 *
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-row-island',
    template: ``,
    providers: [
        IgxRowIslandAPIService,
        IgxFilteringService,
        IgxGridSelectionService
    ],
    standalone: true
})
export class IgxRowIslandComponent extends IgxHierarchicalGridBaseDirective
    implements AfterContentInit, AfterViewInit, OnChanges, OnInit, OnDestroy {
    /* blazorSuppress */
    public rowIslandAPI = inject(IgxRowIslandAPIService);

    /**
     * The row island this one is declared in. Resolved through the injector, since row islands
     * rendered conditionally are initialized before their parent updates its children.
     */
    private declaringIsland = inject(IgxRowIslandComponent, { optional: true, skipSelf: true });


    /* blazorSuppress */
    /**
     * Sets the key of the row island by which child data would be taken from the row data if such is provided.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true">
     *      <igx-row-island [key]="'childData'">
     *          <!-- ... -->
     *      </igx-row-island>
     * </igx-hierarchical-grid>
     * ```
     *
     * @memberof IgxRowIslandComponent
     */
    @Input()
    public key!: string;

    /* treatAsRef */
    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * By default it uses the root grid resources.
     */
    @Input()
    public override set resourceStrings(value: IGridResourceStrings) {
        super.resourceStrings = value;
        this.updateGridsResources();
    }

    public override get resourceStrings(): IGridResourceStrings {
        return this._resourceStrings || !this.rootGrid ? super.resourceStrings : this.rootGrid.resourceStrings;
    }

    /**
     * @hidden
     */
    @ContentChildren(forwardRef(() => IgxRowIslandComponent), { read: IgxRowIslandComponent, descendants: false })
    public children = new QueryList<IgxRowIslandComponent>();

    /**
     * @hidden @internal
     */
    @ContentChildren(forwardRef(() => IgxRowIslandComponent), { read: IgxRowIslandComponent, descendants: false })
    public childLayoutList = new QueryList<IgxRowIslandComponent>();

    /**
     * @hidden
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: false })
    public childColumns = new QueryList<IgxColumnComponent>();

    @ContentChild(IgxGridToolbarDirective, { read: TemplateRef, descendants: false })
    protected toolbarDirectiveTemplate!: TemplateRef<IgxGridToolbarTemplateContext>;

    @ContentChild(IgxPaginatorDirective, { read: TemplateRef, descendants: false })
    protected paginatorDirectiveTemplate!: TemplateRef<any>;

    /* csSuppress */
    /**
     * Sets/Gets the toolbar template for each child grid created from this row island.
    */
    @Input()
    public get toolbarTemplate(): TemplateRef<IgxGridToolbarTemplateContext> {
        return this._toolbarTemplate || this.toolbarDirectiveTemplate;
    }

    public set toolbarTemplate(template: TemplateRef<IgxGridToolbarTemplateContext>) {
        this._toolbarTemplate = template;
    }


    /* csSuppress */
    /**
     * Sets/Gets the paginator template for each child grid created from this row island.
    */
    @Input()
    public get paginatorTemplate(): TemplateRef<IgxGridPaginatorTemplateContext> {
        return this._paginatorTemplate || this.paginatorDirectiveTemplate;
    }

    public set paginatorTemplate(template: TemplateRef<IgxGridPaginatorTemplateContext>) {
        this._paginatorTemplate = template;
    }

    /**
     * @hidden
     */
    @Output()
    public layoutChange = new EventEmitter<SimpleChanges<IgxRowIslandComponent>>();

    /**
     * Event emitted when a grid is being created based on this row island.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true">
     *      <igx-row-island [key]="'childData'" (gridCreated)="gridCreated($event)" #rowIsland>
     *          <!-- ... -->
     *      </igx-row-island>
     * </igx-hierarchical-grid>
     * ```
     *
     * @memberof IgxRowIslandComponent
     */
    @Output()
    public gridCreated = new EventEmitter<IGridCreatedEventArgs>();

    /**
     * Emitted after a grid is being initialized for this row island.
     * The emitting is done in `ngAfterViewInit`.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true">
     *      <igx-row-island [key]="'childData'" (gridInitialized)="gridInitialized($event)" #rowIsland>
     *          <!-- ... -->
     *      </igx-row-island>
     * </igx-hierarchical-grid>
     * ```
     *
     * @memberof IgxRowIslandComponent
     */
    @Output()
    public gridInitialized = new EventEmitter<IGridCreatedEventArgs>();

    /**
     * @hidden
     */
    public initialChanges: SimpleChanges<IgxRowIslandComponent>[] = [];

    /**
     * @hidden
     */
    public rootGrid: GridType = null!;

    /** @hidden */
    public readonly data!: any[] | null;

    /** @hidden */
    public override get hiddenColumnsCount(): number {
        return 0;
    }

    /** @hidden */
    public override get pinnedColumnsCount(): number {
        return 0;
    }

    /** @hidden */
    public override get lastSearchInfo(): ISearchInfo {
        return null!;
    }

    /** @hidden */
    public override get filteredData(): any {
        return [];
    }

    /** @hidden */
    public override get filteredSortedData(): any[] {
        return [];
    }

    /** @hidden */
    public override get virtualizationState(): IForOfState {
        return null!;
    }

    /** @hidden */
    public override get pinnedColumns(): IgxColumnComponent[] {
        return [];
    }

    /** @hidden */
    public override get pinnedStartColumns(): IgxColumnComponent[] {
        return [];
    }
    /** @hidden */
    public override get pinnedEndColumns(): IgxColumnComponent[] {
        return [];
    }

    /** @hidden */
    public override get unpinnedColumns(): IgxColumnComponent[] {
        return [];
    }

    /** @hidden */
    public override get visibleColumns(): IgxColumnComponent[] {
        return [];
    }

    /** @hidden */
    public override get dataView(): any[] {
        return [];
    }

    //#region grid API that doesn't apply to the row island; use the child grids instead
    /** @hidden */
    public override get selectedRows(): any[] {
        return super.selectedRows;
    }

    public override set selectedRows(rowIDs: any[]) {
        super.selectedRows = rowIDs;
    }

    /** @hidden @internal */
    @Output()
    public override selectedRowsChange = new EventEmitter<any[]>();

    /** @hidden */
    public override get shouldGenerate(): boolean {
        return super.shouldGenerate;
    }

    public override set shouldGenerate(value: boolean) {
        super.shouldGenerate = value;
    }

    /** @hidden */
    public override get defaultRowHeight(): number {
        return super.defaultRowHeight;
    }

    /** @hidden */
    public override expandRow(rowID: any) {
        super.expandRow(rowID);
    }

    /** @hidden */
    public override collapseRow(rowID: any) {
        super.collapseRow(rowID);
    }

    /** @hidden */
    public override toggleRow(rowID: any) {
        super.toggleRow(rowID);
    }

    /** @hidden */
    public override expandAll() {
        super.expandAll();
    }

    /** @hidden */
    public override collapseAll() {
        super.collapseAll();
    }

    /** @hidden */
    public override getRowData(rowSelector: any): any {
        return super.getRowData(rowSelector);
    }

    /** @hidden */
    public override sort(expression: ISortingExpression | Array<ISortingExpression>): void {
        super.sort(expression);
    }

    /** @hidden */
    public override beginAddRowById(rowID: any, asChild?: boolean): void {
        super.beginAddRowById(rowID, asChild);
    }

    /** @hidden */
    public override deleteRow(rowSelector: any): any {
        return super.deleteRow(rowSelector);
    }

    /** @hidden */
    public override updateCell(value: any, rowSelector: any, column: string): void {
        super.updateCell(value, rowSelector, column);
    }

    /** @hidden */
    public override updateRow(value: any, rowSelector: any): void {
        super.updateRow(value, rowSelector);
    }

    /** @hidden */
    public override endEdit(commit = true, event?: FocusEvent | MouseEvent | KeyboardEvent): boolean {
        return super.endEdit(commit, event);
    }

    /** @hidden */
    public override findNext(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return super.findNext(text, caseSensitive, exactMatch);
    }

    /** @hidden */
    public override findPrev(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return super.findPrev(text, caseSensitive, exactMatch);
    }

    /** @hidden */
    public override refreshSearch(updateActiveInfo?: boolean, endEdit = true): number {
        return super.refreshSearch(updateActiveInfo, endEdit);
    }

    /** @hidden */
    public override clearSearch() {
        super.clearSearch();
    }

    /** @hidden */
    public override selectRows(rowIDs: any[], clearCurrentSelection?: boolean) {
        super.selectRows(rowIDs, clearCurrentSelection);
    }

    /** @hidden */
    public override deselectRows(rowIDs: any[]) {
        super.deselectRows(rowIDs);
    }

    /** @hidden */
    public override selectAllRows(onlyFilterData = true) {
        super.selectAllRows(onlyFilterData);
    }

    /** @hidden */
    public override deselectAllRows(onlyFilterData = true) {
        super.deselectAllRows(onlyFilterData);
    }

    /** @hidden */
    public override selectRange(arg: GridSelectionRange | GridSelectionRange[] | null | undefined): void {
        super.selectRange(arg);
    }

    /** @hidden */
    public override clearCellSelection(): void {
        super.clearCellSelection();
    }

    /** @hidden */
    public override getSelectedRanges(): GridSelectionRange[] {
        return super.getSelectedRanges();
    }

    /** @hidden */
    public override getSelectedData(formatters = false, headers = false): any[] {
        return super.getSelectedData(formatters, headers);
    }

    /** @hidden */
    public override isRecordPinnedByIndex(rowIndex: number): boolean {
        return super.isRecordPinnedByIndex(rowIndex);
    }

    /** @hidden */
    public override openAdvancedFilteringDialog(overlaySettings?: OverlaySettings) {
        super.openAdvancedFilteringDialog(overlaySettings);
    }

    /** @hidden */
    public override closeAdvancedFilteringDialog(applyChanges: boolean) {
        super.closeAdvancedFilteringDialog(applyChanges);
    }

    /** @hidden */
    public override markForCheck() {
        super.markForCheck();
    }

    /** @hidden */
    public override recalculateAutoSizes() {
        super.recalculateAutoSizes();
    }

    /** @hidden */
    public override getColumnByVisibleIndex(index: number): IgxColumnComponent {
        return super.getColumnByVisibleIndex(index);
    }

    /** @hidden */
    public override getHeaderGroupWidth(column: IgxColumnComponent): string {
        return super.getHeaderGroupWidth(column);
    }

    /** @hidden */
    public override getPinnedStartWidth(takeHidden = false): number {
        return super.getPinnedStartWidth(takeHidden);
    }

    /** @hidden */
    public override getPinnedEndWidth(takeHidden = false): number {
        return super.getPinnedEndWidth(takeHidden);
    }

    /** @hidden */
    public override moveColumn(column: IgxColumnComponent, target: IgxColumnComponent, pos: DropPosition = DropPosition.AfterDropTarget) {
        super.moveColumn(column, target, pos);
    }

    /** @hidden */
    public override pinColumn(columnName: string | IgxColumnComponent, index?: number, pinningPosition?: ColumnPinningPosition): boolean {
        return super.pinColumn(columnName, index, pinningPosition);
    }

    /** @hidden */
    public override unpinColumn(columnName: string | IgxColumnComponent, index?: number): boolean {
        return super.unpinColumn(columnName, index);
    }

    /** @hidden */
    public override enableSummaries(expressions: ISummaryExpression[]): void;
    /** @hidden */
    public override enableSummaries(expression: ISummaryExpression): void;
    /** @hidden */
    public override enableSummaries(fieldName: string, customSummary?: any): void;
    public override enableSummaries(rest: string | ISummaryExpression | ISummaryExpression[], customSummary?: any): void {
        super.enableSummaries(rest as any, customSummary);
    }

    /** @hidden */
    public override disableSummaries(columns: Array<string | ISummaryExpression>): void;
    /** @hidden */
    public override disableSummaries(expression: ISummaryExpression): void;
    /** @hidden */
    public override disableSummaries(fieldName: string): void;
    public override disableSummaries(rest: string | ISummaryExpression | Array<string | ISummaryExpression>): void {
        super.disableSummaries(rest as any);
    }

    /** @hidden */
    public override selectedColumns(): ColumnType[] {
        return super.selectedColumns();
    }

    /** @hidden */
    public override selectColumns(columns: string[] | ColumnType[], clearCurrentSelection?: boolean) {
        super.selectColumns(columns, clearCurrentSelection);
    }

    /** @hidden */
    public override deselectColumns(columns: string[] | ColumnType[]) {
        super.deselectColumns(columns);
    }

    /** @hidden */
    public override deselectAllColumns() {
        super.deselectAllColumns();
    }

    /** @hidden */
    public override selectAllColumns() {
        super.selectAllColumns();
    }

    /** @hidden */
    public override getSelectedColumnsData(formatters = false, headers = false): any[] {
        return super.getSelectedColumnsData(formatters, headers);
    }

    /** @hidden */
    public override navigateTo(rowIndex: number, visibleColIndex = -1, cb: (args: any) => void = null!) {
        super.navigateTo(rowIndex, visibleColIndex, cb);
    }

    /** @hidden */
    public override getNextCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (column: ColumnType) => boolean = null!): ICellPosition {
        return super.getNextCell(currRowIndex, curVisibleColIndex, callback);
    }

    /** @hidden */
    public override getPreviousCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (column: ColumnType) => boolean = null!): ICellPosition {
        return super.getPreviousCell(currRowIndex, curVisibleColIndex, callback);
    }

    /** @hidden */
    public override toggleColumnVisibility(args: IColumnVisibilityChangedEventArgs) {
        super.toggleColumnVisibility(args);
    }

    /** @hidden */
    public override getColumnByName(name: string): IgxColumnComponent {
        return super.getColumnByName(name);
    }

    /** @hidden */
    public override filter(name: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase?: boolean) {
        super.filter(name, value, conditionOrExpressionTree, ignoreCase);
    }

    /** @hidden */
    public override filterGlobal(value: any, condition: IFilteringOperation, ignoreCase?: boolean) {
        super.filterGlobal(value, condition, ignoreCase);
    }

    /** @hidden */
    public override clearFilter(name?: string) {
        super.clearFilter(name);
    }

    /** @hidden */
    public override clearSort(name?: string) {
        super.clearSort(name);
    }
    //#endregion

    //#region inert, not-a-grid component
    /** @hidden @internal */
    public override tabindex = -1;

    /** @hidden @internal */
    public override hostRole: string = null!;

    protected override baseClass: string = null!;

    /** @hidden @internal */
    public override get hostWidth(): any {
        return null;
    }

    protected override displayStyle = 'none';
    protected override templateRows: string = null!;
    //#endregion

    private ri_columnListDiffer: IterableDiffer<IgxColumnComponent> = null!;
    private layout_id = `igx-row-island-`;
    private isInit = false;
    private _toolbarTemplate!: TemplateRef<IgxGridToolbarTemplateContext>;
    private _paginatorTemplate!: TemplateRef<IgxGridPaginatorTemplateContext>;

    /**
     * Sets if all immediate children of the grids for this row island should be expanded/collapsed.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true">
     *      <igx-row-island [key]="'childData'" [expandChildren]="true" #rowIsland>
     *          <!-- ... -->
     *      </igx-row-island>
     * </igx-hierarchical-grid>
     * ```
     *
     * @memberof IgxRowIslandComponent
     */
    @Input({ transform: booleanAttribute })
    public set expandChildren(value: boolean) {
        this._defaultExpandState = value;
        this.rowIslandAPI.getChildGrids().forEach((grid) => {
            grid.expandChildren = value;
            if (this.document.body.contains(grid.nativeElement)) {
                // Detect changes right away if the grid is visible
                grid.cdr.detectChanges();
            } else {
                // Else defer the detection on changes when the grid gets into view for performance.
                grid.updateOnRender = true;
            }
        });
    }

    /**
     * Gets if all immediate children of the grids for this row island have been set to be expanded/collapsed.
     * ```typescript
     * const expanded = this.rowIsland.expandChildren;
     * ```
     *
     * @memberof IgxRowIslandComponent
     */
    public get expandChildren(): boolean {
        return this._defaultExpandState;
    }

    /**
     * @hidden
     */
    public get id(): string {
        const pId = this.parentId ? this.parentId.substring(this.parentId.indexOf(this.layout_id) + this.layout_id.length) + '-' : '';
        return this.layout_id + pId + this.key;
    }

    /**
     * @hidden
     */
    public get parentId(): string | null {
        return this.parentIsland ? this.parentIsland.id : null;
    }

    /**
     * @hidden
     */
    public get level() {
        let ptr = this.parentIsland;
        let lvl = 0;
        while (ptr) {
            lvl++;
            ptr = ptr.parentIsland;
        }
        return lvl + 1;
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        // islands of a grid declared in a row island template resolve that row island too, but belong to another grid
        if (this.declaringIsland?.gridAPI === this.gridAPI) {
            this.parentIsland ??= this.declaringIsland;
        }
        this.filteringService.grid = this as GridType;
        this.rootGrid = this.gridAPI.grid;
        this.rowIslandAPI.rowIsland = this;
        this.ri_columnListDiffer = this.differs.find([]).create(null!);
    }

    /**
     * @hidden
     */
    public override ngAfterContentInit() {
        this.updateChildren();
        this.children.notifyOnChanges();
        this.children.changes.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.updateChildren();
                // update existing grids since their child ri have been changed.
                this.rowIslandAPI.getChildGrids(false).forEach(grid => {
                    grid.onRowIslandChange();
                });
            });
        const nestedColumns = this.children.map((layout) => layout.columnList.toArray());
        const colsArray = ([] as IgxColumnComponent[]).concat.apply([], nestedColumns);
        const topCols = this.columnList.filter((item) => colsArray.indexOf(item) === -1);
        this._childColumns = topCols;
        this.updateColumns(this._childColumns);
        this.columnList.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            Promise.resolve().then(() => {
                this.updateColumnList();
            });
        });

        // handle column changes so that they are passed to child grid instances when columnChange is emitted.
        this.ri_columnListDiffer.diff(this.childColumns);
        this._childColumns.forEach(x => x.columnChange.pipe(takeUntil(x.destroy$)).subscribe(() => this.updateColumnList()));
        this.childColumns.changes.pipe(takeUntil(this.destroy$)).subscribe((change: QueryList<IgxColumnComponent>) => {
            const diff = this.ri_columnListDiffer.diff(change);
            if (diff) {
                diff.forEachAddedItem((record: IterableChangeRecord<IgxColumnComponent>) => {
                    record.item.columnChange.pipe(takeUntil(record.item.destroy$)).subscribe(() => this.updateColumnList());
                });
            }
        });
    }

    /**
     * @hidden
     */
    public override ngAfterViewInit() {
        this.rowIslandAPI.register(this);
        if (this.parentIsland) {
            this.parentIsland.rowIslandAPI.registerChildRowIsland(this);
        } else {
            this.rootGrid.gridAPI.registerChildRowIsland!(this);
        }
        this._init = false;

        // Create the child toolbar if the parent island has a toolbar definition
        this.gridCreated.pipe(pluck('grid'), takeUntil(this.destroy$)).subscribe(grid => {
            grid.rendered$.pipe(first(), filter(() => !!this.toolbarTemplate))
                .subscribe(() => grid.toolbarOutlet.createEmbeddedView(this.toolbarTemplate, { $implicit: grid }, { injector: grid.toolbarOutlet.injector }));
            grid.rendered$.pipe(first(), filter(() => !!this.paginatorTemplate))
                .subscribe(() => {
                    this.rootGrid.paginatorList!.changes.pipe(takeUntil(this.destroy$)).subscribe((changes: QueryList<IgxPaginatorComponent>) => {
                        changes.forEach(p => {
                            if (grid.footer?.nativeElement.contains(p.nativeElement)) {
                                // Optimize update only for those grids that have related changed paginator.
                                grid.setUpPaginator()
                            }
                        });
                    });
                    grid.paginatorOutlet.createEmbeddedView(this.paginatorTemplate, { $implicit: grid });
                });
        });
        this.cdr.reattach();
    }

    /**
     * @hidden
     */
    public override ngOnChanges(changes: SimpleChanges<IgxRowIslandComponent>) {
        this.layoutChange.emit(changes);
        if (!this.isInit) {
            this.initialChanges.push(changes);
        }
    }

    /**
     * @hidden
     */
    public override ngOnDestroy() {
        // Override the base destroy because we have not rendered anything to use removeEventListener on
        this.destroy$.next(true);
        this.destroy$.complete();
        this._destroyed = true;
        this.rowIslandAPI.unset(this.id);
        if (this.parentIsland) {
            // the grids rendering this row island are the ones created from its parent row island
            this.parentIsland.rowIslandAPI.getChildGrids().forEach(grid => {
                this.cleanGridState(grid);
                grid.gridAPI.unsetChildRowIsland!(this);
            });
            this.parentIsland.rowIslandAPI.unsetChildRowIsland(this);
        } else {
            this.rootGrid.gridAPI.unsetChildRowIsland!(this);
            this.cleanGridState(this.rootGrid);
        }
    }

    /**
     * @hidden
     */
    public override reflow() { }

    /**
     * @hidden
     */
    public override calculateGridHeight() { }

    /**
     * @hidden
     */
    public override calculateGridWidth() { }

    protected _childColumns: IgxColumnComponent[] = [];

    protected updateColumnList() {
        const nestedColumns = this.children.map((layout) => layout.columnList.toArray());
        const colsArray = ([] as IgxColumnComponent[]).concat.apply([], nestedColumns);
        const topCols = this.columnList.filter((item) => {
            if (colsArray.indexOf(item) === -1) {
                /* Reset the default width of the columns that come into this row island,
                because the root catches them first during the detectChanges() and sets their defaultWidth. */
                item.defaultWidth = undefined!;
                return true;
            }
            return false;
        });
        this._childColumns = topCols;
        this.updateColumns(this._childColumns);
        this.rowIslandAPI.getChildGrids().forEach((grid: GridType) => {
            grid.createColumnsList!(this._childColumns);
            if (!this.document.body.contains(grid.nativeElement)) {
                grid.updateOnRender = true;
            }
        });
        (this.rootGrid as IgxHierarchicalGridComponent)?.updateRowIslandSchemaFields(this);
    }

    protected updateChildren() {
        this.children.forEach(child => {
            child.parentIsland = this;
        });
    }

    private cleanGridState(grid: GridType) {
        grid.childGridTemplates.forEach((tmpl: any) => {
            tmpl.owner.cleanView(tmpl.context.templateID);
        });
        grid.childGridTemplates.clear();
        grid.onRowIslandChange();
    }

    private updateGridsResources() {
        this.rowIslandAPI.getChildGrids().forEach((grid) => {
            grid.resourceStrings = this.resourceStrings;
        });
    }
}
