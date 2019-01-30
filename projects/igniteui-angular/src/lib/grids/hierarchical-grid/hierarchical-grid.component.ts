import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Input,
    forwardRef,
    TemplateRef,
    ViewChild,
    ViewChildren,
    QueryList,
    ContentChildren,
    ElementRef,
    NgZone,
    ChangeDetectorRef,
    IterableDiffers,
    ViewContainerRef,
    Inject,
    ComponentFactoryResolver,
    AfterViewInit,
    AfterContentInit,
    Optional,
    OnInit
} from '@angular/core';
import { IgxGridBaseComponent, IgxGridTransaction } from '../grid-base.component';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { IgxColumnComponent, IGridDataBindable, } from '../grid';
import { DOCUMENT } from '@angular/common';
import { IgxHierarchicalSelectionAPIService } from './selection';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxHierarchicalGridBaseComponent } from './hierarchical-grid-base.component';
import { takeUntil } from 'rxjs/operators';
import { IgxTemplateOutletDirective } from '../../directives/template-outlet/template_outlet.directive';

let NEXT_ID = 0;

export interface HierarchicalStateRecord {
    rowID: any;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid',
    templateUrl: 'hierarchical-grid.component.html',
    providers: [
        { provide: GridBaseAPIService, useClass: IgxHierarchicalGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxHierarchicalGridComponent) },
        IgxGridSummaryService,
        IgxFilteringService,
        IgxHierarchicalGridNavigationService
    ]
})
export class IgxHierarchicalGridComponent extends IgxHierarchicalGridBaseComponent
            implements IGridDataBindable, AfterViewInit, AfterContentInit, OnInit {
    /**
     * Sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-hierarchical-grid [id]="'igx-hgrid-1'" [data]="Data" [autoGenerate]="true"></igx-hierarchical-grid>
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this.h_id;
    }

    /**
     * An @Input property that lets you fill the `IgxHierarchicalGridComponent` with an array of data.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true"></igx-hierarchical-grid>
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    @Input()
    public set data(value: any[]) {
        this._data = value;
        this.summaryService.clearSummaryCache();
        if (this.shouldGenerate) {
            this.setupColumns();
            this.reflow();
        }
    }

    /**
     * Returns an array of data set to the `IgxHierarchicalGridComponent`.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    public get data(): any[] {
        return this._data;
    }

     /**
     * Sets the state of the `IgxHierarchicalGridComponent` containing which rows are expanded.
     * ```typescript
     * this.gridState = [{ rowID: 1 }, { rowID: 4}];
     * ```
     * ```html
     * <igx-hierarchical-grid [primaryKey]="'ID'" [data]="Data" [autoGenerate]="false" [hierarchicalState]="hgridState">
     *      <igx-column field="ID"  [dataType]='number'></igx-column>
     *      <igx-column field="Product"  [dataType]='string'></igx-column>
     *      <igx-column field="Description"  [dataType]='string'></igx-column>
     * </igx-hierarchical-grid>
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    @Input()
    public hierarchicalState: HierarchicalStateRecord[] = [];

    /**
     * Sets an array of objects containing the filtered data in the `IgxHierarchicalGridComponent`.
     * ```typescript
     * this.grid.filteredData = [{
     *       ID: 1,
     *       Name: "A"
     * }];
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    public set filteredData(value) {
        this._filteredData = value;

        if (this.rowSelectable) {
            this.updateHeaderCheckboxStatusOnFilter(this._filteredData);
        }

        this.restoreHighlight();
    }

    /**
     * Returns an array of objects containing the filtered data in the `IgxHierarchicalGridComponent`.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    public get filteredData() {
        return this._filteredData;
    }

    /**
     * Sets if all immediate children of the `IgxHierarchicalGridComponent` should be expanded/collapsed.
     * Defult value is false.
     * ```html
     * <igx-hierarchical-grid [id]="'igx-grid-1'" [data]="Data" [autoGenerate]="true" [expandChildren]="true"></igx-hierarchical-grid>
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    @Input()
    set expandChildren(value: boolean) {
        this._expandChildren = value;
        if (value && this.data) {
            this.hierarchicalState = this.data.map((rec) => {
                return { rowID: this.primaryKey ? rec[this.primaryKey] : rec };
            });
        } else if (this.data) {
            this.hierarchicalState = [];
        }
    }

    /**
     * Gets if all immediate children of the `IgxHierarchicalGridComponent` previously have been set to be expanded/collapsed.
     * If previously set and some rows have been manually expanded/collapsed it will still return the last set value.
     * ```typescript
     * const expanded = this.grid.expandChildren;
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    get expandChildren(): boolean {
        return this._expandChildren;
    }

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

    @ViewChild('hierarchical_record_template', { read: TemplateRef })
    protected hierarchicalRecordTemplate: TemplateRef<any>;

    @ViewChild('child_record_template', { read: TemplateRef })
    protected childTemplate: TemplateRef<any>;

    @ViewChild('headerHierarchyExpander', { read: ElementRef })
    protected headerHierarchyExpander: ElementRef;

    /**
     * @hidden
     */
    @ViewChildren(IgxTemplateOutletDirective, { read: IgxTemplateOutletDirective })
    public templateOutlets: QueryList<any>;

    /**
     * @hidden
     */
    @ViewChildren(IgxChildGridRowComponent, { read: IgxChildGridRowComponent })
    public hierarchicalRows: QueryList<IgxChildGridRowComponent>;

    /**
     * @hidden
     */
    get maxLevelHeaderDepth() {
        this._maxLevelHeaderDepth = this.columnList.reduce((acc, col) => Math.max(acc, col.level), 0);
        return this._maxLevelHeaderDepth;
    }

    /**
     * @hidden
     */
    get hasExpandableChildren() {
        if (!this.data || this.data.length === 0) {
            return false;
        }
        return !!this.childLayoutKeys.length;
    }

    /**
     * @hidden
     */
    get childLayoutKeys() {
        const keys = this.childLayoutList.map((item) => item.key);
        return keys;
    }

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
    public parent = null;

    private _hierarchicalState = [];
    private _data;
    private _filteredData = null;
    private h_id = `igx-hierarchical-grid-${NEXT_ID++}`;
    private childGridTemplates: Map<any, any> = new Map();
    private scrollTop = 0;
    private scrollLeft = 0;

    constructor(
        gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
        selection: IgxHierarchicalSelectionAPIService,
        @Inject(IgxGridTransaction) protected transactionFactory: any,
        elementRef: ElementRef,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        navigation: IgxHierarchicalGridNavigationService,
        filteringService: IgxFilteringService,
        public summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(
            gridAPI,
            selection,
            typeof transactionFactory === 'function' ? transactionFactory() : transactionFactory,
            elementRef,
            zone,
            document,
            cdr,
            resolver,
            differs,
            viewRef,
            navigation,
            filteringService,
            summaryService,
            _displayDensityOptions);
        this.hgridAPI = <IgxHierarchicalGridAPIService>gridAPI;
    }

    /**
     * @hidden
     */
    ngOnInit() {
        this.hgridAPI.register(this);
        super.ngOnInit();
        this._transactions = this.parentIsland ? this.parentIsland.transactions : this._transactions;
    }

    /**
     * @hidden
     */
    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.verticalScrollContainer.getVerticalScroll().addEventListener('scroll', this.hg_verticalScrollHandler.bind(this));
        this.parentVirtDir.getHorizontalScroll().addEventListener('scroll', this.hg_horizontalScrollHandler.bind(this));

        if (this.expandChildren && this.data && this.hierarchicalState.length !== this.data.length) {
            this.hierarchicalState = this.data.map((rec) => {
                return { rowID: this.primaryKey ? rec[this.primaryKey] : rec };
            });
        }

        this.verticalScrollContainer.onBeforeViewDestroyed.pipe(takeUntil(this.destroy$)).subscribe((view) => {
            if (this.isChildGridRecord(view.context.$implicit)) {
                const index = view.context.index;
                const tmplOutlet = this.templateOutlets.toArray()[index];
                tmplOutlet._viewContainerRef.detach(0);
            }
        });

        if (this.parent) {
            this._displayDensity = this.rootGrid._displayDensity;
            this.rootGrid.onDensityChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
                requestAnimationFrame(() => {
                    this._displayDensity = this.rootGrid._displayDensity;
                    if (document.body.contains(this.nativeElement)) {
                        this.reflow();
                    } else {
                        this.updateOnRender = true;
                    }
                });
            });
        }
    }

    /**
     * @hidden
     */
    ngAfterContentInit() {
        const nestedColumns = this.allLayoutList.map((layout) => {
            layout.rootGrid = this;
            return layout.columnList.toArray();
        });
        const colsArray = [].concat.apply([], nestedColumns);
        if (colsArray.length > 0) {
            const topCols = this.columnList.filter((item) => {
                return colsArray.indexOf(item) === -1;
            });
            this.columnList.reset(topCols);
        }
        super.ngAfterContentInit();
    }

    /**
    * @hidden
    */
   public get template(): TemplateRef<any> {
        if (this.filteredData && this.filteredData.length === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyFilteredGridTemplate;
        }

        if (this.isLoading && (!this.data || this.dataLength === 0)) {
            return this.loadingGridTemplate ? this.loadingGridTemplate : this.loadingGridDefaultTemplate;
        }

        if (this.dataLength === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyGridDefaultTemplate;
        }
    }

    /**
     * Gets calculated width of the pinned area.
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth();
     * ```
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     * @memberof IgxHierarchicalGridComponent
     */
    public getPinnedWidth(takeHidden = false) {
        return super.getPinnedWidth(takeHidden) + this.headerHierarchyExpander.nativeElement.clientWidth;
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
        return this.childLayoutList.length !== 0 && record[this.childLayoutList.first.key];
    }

    /**
     * @hidden
     */
    public isChildGridRecord(record: any): boolean {
        // Can be null when there is defined layout but no child data was found
        return record.childGridData !== undefined;
    }

    /**
     * @hidden
     */
    public trackChanges(index, rec) {
        if (rec.childGridData !== undefined) {
            // if is child rec
            return rec.rowID;
        }
        return rec;
    }

    /**
     * @hidden
     */
    public getTemplate(rowData: any): TemplateRef<any> {
        let template;
        if (this.isChildGridRecord(rowData)) {
            template = this.childTemplate;
        } else {
            template = this.hierarchicalRecordTemplate;
        }
        return template;
    }

    /**
     * @hidden
     */
    public getContext(rowData): any {
        if (this.isChildGridRecord(rowData)) {
            const cachedData = this.childGridTemplates.get(rowData.rowID);
            if (cachedData) {
                const view = cachedData.view;
                const tmlpOutlet = cachedData.owner;
                return {
                    $implicit: rowData,
                    moveView: view,
                    owner: tmlpOutlet,
                    index: this.verticalScrollContainer.igxForOf.indexOf(rowData)
                };
            } else {
                const rowID = this.primaryKey ? rowData.rowID : this.data.indexOf(rowData.rowID);
                // child rows contain unique grids, hence should have unique templates
                return {
                    $implicit: rowData,
                    templateID: 'childRow-' + rowID,
                    index: this.verticalScrollContainer.igxForOf.indexOf(rowData)
                };
            }
        } else {
            return {
                $implicit: rowData,
                templateID: 'dataRow',
                index: this.verticalScrollContainer.igxForOf.indexOf(rowData)
            };
        }
    }

    /**
     * @hidden
    */
    public get rootGrid() {
        let currGrid = this;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
        }
        return currGrid;
    }

    /**
     * @hidden
    */
   public collapseAllRows() {
        this.hierarchicalState = [];
    }

    /**
     * @hidden
     */
    public isExpanded(record: any): boolean {
        let inState;
        if (record.childGridData !== undefined) {
            inState = !!this.hierarchicalState.find(v => v.rowID === record.rowID);
        } else {
            inState = !!this.hierarchicalState.find(v => {
                return this.primaryKey ? v.rowID === record[this.primaryKey] : v.rowID === record;
            });
        }
        return inState && this.childLayoutList.length !== 0;
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

            this.childLayoutKeys.forEach((layoutKey) => {
                const relatedGrid = this.hgridAPI.getChildGridByID(layoutKey, args.context.$implicit.rowID);
                if (relatedGrid && relatedGrid.updateOnRender) {
                    // Detect changes if `expandChildren` has changed when the grid wasn't visible. This is for performance reasons.
                    relatedGrid.reflow();
                    relatedGrid.updateOnRender = false;
                }
            });

            const childGrids = this.getChildGrids(true);
            childGrids.forEach((grid) => {
                grid.updateScrollPosition();
            });
        }
    }

    /**
     * @hidden
     */
    public updateScrollPosition() {
        const vScr = this.verticalScrollContainer.getVerticalScroll();
        const hScr = this.parentVirtDir.getHorizontalScroll();
        if (vScr) {
            vScr.scrollTop = this.scrollTop;
        }
        if (hScr) {
            hScr.scrollLeft = this.scrollLeft;
        }
    }

    /**
     * @hidden
     */
    public getPossibleColumnWidth() {
        let computedWidth = this.calcWidth || parseInt(
            this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('width'), 10);
        computedWidth -= this.headerHierarchyExpander.nativeElement.clientWidth;
        return super.getPossibleColumnWidth(computedWidth);
    }

    protected getChildGrids(inDeph?: boolean) {
        return this.hgridAPI.getChildGrids(inDeph);
    }

    private hg_verticalScrollHandler(event) {
        this.scrollTop = event.target.scrollTop;
    }

    private hg_horizontalScrollHandler(event) {
        this.scrollLeft = event.target.scrollLeft;
    }
}
