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
import { IgxHierarchicalGridBaseComponent, IgxGridExpandState } from './hierarchical-grid-base.component';

let NEXT_ID = 0;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid',
    templateUrl: 'hierarchical-grid.component.html',
    providers: [
        { provide: GridBaseAPIService, useClass: IgxHierarchicalGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxHierarchicalGridComponent) },
        IgxFilteringService,
        IgxHierarchicalGridNavigationService
    ]
})
export class IgxHierarchicalGridComponent extends IgxHierarchicalGridBaseComponent
            implements IGridDataBindable, AfterViewInit, AfterContentInit, OnInit {
    private h_id = `igx-hierarchical-grid-${NEXT_ID++}`;
    private _childGridTemplates: Map<any, any> = new Map();
    private _scrollTop = 0;
    private _scrollLeft = 0;
    private _hierarchicalState = [];
    private _filteredData = null;
    public highlightedRowID = null;
    public updateOnRender = false;
    public parent = null;

    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this.h_id;
    }

    /**
     * An @Input property that lets you fill the `IgxHierarchicalGridComponent` with an array of data.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxHierarchicalGridComponent
     */
    @Input()
    public data: any[];

    @Input()
    public set hierarchicalState(value) {
        // Expanding or collapsing any of the rows no longear means that all rows should be expanded/collapsed.
        if (this.parent && this.parentIsland) {
            this.parentIsland.childrenExpandState = IgxGridExpandState.MIXED;
        } else {
            this.childrenExpandState = IgxGridExpandState.MIXED;
        }
        this._hierarchicalState = value;
    }

    public get hierarchicalState() {
        return this._hierarchicalState;
    }

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

    @Input()
    set expandChildren(value) {
        this._expandChildren = value;
        if (value && this.data) {
            this.childrenExpandState = IgxGridExpandState.EXPANDED;
            this.hierarchicalState = this.data.map((rec) => {
                return { rowID: this.primaryKey ? rec[this.primaryKey] : rec };
            });
        } else if (this.data) {
            this.childrenExpandState = IgxGridExpandState.COLLAPSED;
            this.hierarchicalState = [];
        }
    }

    get expandChildren() {
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

    /**
     * @hidden
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: true })
    public columnList: QueryList<IgxColumnComponent>;

    @ViewChild('hierarchical_record_template', { read: TemplateRef })
    protected hierarchicalRecordTemplate: TemplateRef<any>;

    @ViewChild('child_record_template', { read: TemplateRef })
    protected childTemplate: TemplateRef<any>;

    @ViewChild('headerHierarchyExpander', { read: ElementRef })
    protected headerHierarchyExpander: ElementRef;

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

        if (this.expandChildren && this.data && this.childrenExpandState !== IgxGridExpandState.EXPANDED) {
            this.childrenExpandState = IgxGridExpandState.EXPANDED;
            this.hierarchicalState = this.data.map((rec) => {
                return { rowID: this.primaryKey ? rec[this.primaryKey] : rec };
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
            const cachedData = this._childGridTemplates.get(rowData.rowID);
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
   collapseAllRows() {
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
            this._childGridTemplates.set(key, args);
        }
    }

    /**
     * @hidden
     */
    public viewMovedHandler(args) {
        if (this.isChildGridRecord(args.context.$implicit)) {
            // view was moved, update owner in cache
            const key = args.context.$implicit.rowID;
            const cachedData = this._childGridTemplates.get(key);
            cachedData.owner = args.owner;

            this.childLayoutKeys.forEach((layoutKey) => {
                const relatedGrid = this.hgridAPI.getChildGridByID(layoutKey, args.context.$implicit.rowID);
                if (relatedGrid && relatedGrid.updateOnRender) {
                    // Detect changes if `expandChildren` has changed when the grid wasn't visible. This is for performance reasons.
                    relatedGrid.cdr.detectChanges();
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
            vScr.scrollTop = this._scrollTop;
        }
        if (hScr) {
            hScr.scrollLeft = this._scrollLeft;
        }
    }

    /**
     * @hidden
     */
    public getPossibleColumnWidth() {
        let computedWidth = parseInt(
            this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('width'), 10);
        computedWidth -= this.headerHierarchyExpander.nativeElement.clientWidth;
        return super.getPossibleColumnWidth(computedWidth);
    }

    protected getChildGrids(inDeph?: boolean) {
        return this.hgridAPI.getChildGrids(inDeph);
    }

    private hg_verticalScrollHandler(event) {
        this._scrollTop = event.target.scrollTop;
    }

    private hg_horizontalScrollHandler(event) {
        this._scrollLeft = event.target.scrollLeft;
    }
}
