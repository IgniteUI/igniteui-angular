import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EnvironmentInjector,
    EventEmitter,
    forwardRef,
    Inject,
    Injector,
    Input,
    IterableChangeRecord,
    IterableDiffers,
    LOCALE_ID,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { DOCUMENT } from '@angular/common';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxHierarchicalGridBaseDirective } from './hierarchical-grid-base.directive';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IgxOverlayService } from '../../services/public_api';
import { first, filter, takeUntil, pluck } from 'rxjs/operators';
import { IgxColumnComponent } from '../columns/column.component';
import { ISearchInfo } from '../common/events';
import { IgxRowIslandAPIService } from './row-island-api.service';
import { PlatformUtil } from '../../core/utils';
import { IForOfState } from '../../directives/for-of/for_of.directive';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { GridType, IGX_GRID_SERVICE_BASE, IgxGridPaginatorTemplateContext } from '../common/grid.interface';
import { IgxGridToolbarDirective, IgxGridToolbarTemplateContext } from '../toolbar/common';
import { IgxActionStripToken } from '../../action-strip/token';
import { IgxPaginatorDirective } from '../../paginator/paginator-interfaces';
import { IgxFlatTransactionFactory } from '../../services/transaction/transaction-factory.service';
import { IGridCreatedEventArgs } from './events';
import { IgxGridValidationService } from '../grid/grid-validation.service';
import { IgxTextHighlightService } from '../../directives/text-highlight/text-highlight.service';
import { IgxPaginatorComponent } from '../../paginator/paginator.component';

/* blazorCopyInheritedMembers */
/* blazorElement */
/* wcElementTag: igc-row-island */
/* blazorIndirectRender */
/* jsonAPIManageCollectionInMarkup */
/* jsonAPIManageItemInMarkup */
/* mustUseNGParentAnchor */
/* additionalIdentifier: ChildDataKey */
/* contentParent: RowIsland */
/* contentParent: HierarchicalGrid */
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
    template: `@if (platform.isElements) {
        <div #sink style="display: none;">
            <ng-content select="igx-column,igc-column,igx-column-group,igc-column-group,igx-action-strip,igc-action-strip"></ng-content>
            <ng-content select="igx-row-island,igc-row-island"></ng-content>
        </div>
    }`,
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
    public key: string;

    /* blazorInclude,wcInclude TODO: Move to Elements-only component */
    /**
     * Sets the key of the row island by which child data would be taken from the row data if such is provided.
     * @hidden @internal
     */
    @Input()
    public get childDataKey() {
        return this.key;
    }
    /* blazorInclude,wcInclude */
    public set childDataKey(value: string) {
        this.key = value;
    }

    /**
     * @hidden
     */
    @ContentChildren(forwardRef(() => IgxRowIslandComponent), { read: IgxRowIslandComponent, descendants: false })
    public children = new QueryList<IgxRowIslandComponent>();

    /* contentChildren */
    /* blazorInclude */
    /* blazorTreatAsCollection */
    /* blazorCollectionName: RowIslandCollection */
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

    @ContentChild(IgxGridToolbarDirective, { read: TemplateRef })
    protected toolbarDirectiveTemplate: TemplateRef<IgxGridToolbarTemplateContext>;

    @ContentChild(IgxPaginatorDirective, { read: TemplateRef })
    protected paginatorDirectiveTemplate: TemplateRef<any>;

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

    // TODO(api-analyzer): Shouldn't need all tags to copy from base or hidden/internal due to include tag
    /* contentChildren */
    /* blazorInclude */
    /* blazorTreatAsCollection */
    /* blazorCollectionName: ActionStripCollection */
    /* blazorCollectionItemName: ActionStrip */
    /* ngQueryListName: actionStripComponents */
    /** @hidden @internal */
    @ContentChildren(IgxActionStripToken, { read: IgxActionStripToken, descendants: false })
    protected override actionStripComponents: QueryList<IgxActionStripToken>;

    /**
     * @hidden
     */
    @Output()
    public layoutChange = new EventEmitter<any>();

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
    public initialChanges = [];

    /**
     * @hidden
     */
    public rootGrid: GridType = null;

    /** @hidden */
    public readonly data: any[] | null;

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
        return null;
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
        return null;
    }

    /** @hidden */
    public override get pinnedColumns(): IgxColumnComponent[] {
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

    private ri_columnListDiffer;
    private layout_id = `igx-row-island-`;
    private isInit = false;
    private _toolbarTemplate: TemplateRef<IgxGridToolbarTemplateContext>;
    private _paginatorTemplate: TemplateRef<IgxGridPaginatorTemplateContext>;

    /**
     * Sets if all immediate children of the grids for this `IgxRowIslandComponent` should be expanded/collapsed.
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
            if (this.document.body.contains(grid.nativeElement)) {
                // Detect changes right away if the grid is visible
                grid.expandChildren = value;
                grid.cdr.detectChanges();
            } else {
                // Else defer the detection on changes when the grid gets into view for performance.
                grid.updateOnRender = true;
            }
        });
    }

    /**
     * Gets if all immediate children of the grids for this `IgxRowIslandComponent` have been set to be expanded/collapsed.
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
    public get id() {
        const pId = this.parentId ? this.parentId.substring(this.parentId.indexOf(this.layout_id) + this.layout_id.length) + '-' : '';
        return this.layout_id + pId + this.key;
    }

    /**
     * @hidden
     */
    public get parentId() {
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

    constructor(
        validationService: IgxGridValidationService,
        selectionService: IgxGridSelectionService,
        colResizingService: IgxColumnResizingService,
        @Inject(IGX_GRID_SERVICE_BASE) gridAPI: IgxHierarchicalGridAPIService,
        transactionFactory: IgxFlatTransactionFactory,
        elementRef: ElementRef<HTMLElement>,
        zone: NgZone,
        @Inject(DOCUMENT) document,
        cdr: ChangeDetectorRef,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        injector: Injector,
        envInjector: EnvironmentInjector,
        navigation: IgxHierarchicalGridNavigationService,
        filteringService: IgxFilteringService,
        textHighlightService: IgxTextHighlightService,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        summaryService: IgxGridSummaryService,
        public rowIslandAPI: IgxRowIslandAPIService,
        @Inject(LOCALE_ID) localeId: string,
        platform: PlatformUtil) {
        super(
            validationService,
            selectionService,
            colResizingService,
            gridAPI,
            transactionFactory,
            elementRef,
            zone,
            document,
            cdr,
            differs,
            viewRef,
            injector,
            envInjector,
            navigation,
            filteringService,
            textHighlightService,
            overlayService,
            summaryService,
            localeId,
            platform
        );
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        this.filteringService.grid = this as GridType;
        this.rootGrid = this.gridAPI.grid;
        this.rowIslandAPI.rowIsland = this;
        this.ri_columnListDiffer = this.differs.find([]).create(null);
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
                this.getGridsForIsland(this.key).forEach(grid => {
                    (grid as any).onRowIslandChange(this.children);
                });
            });
        const nestedColumns = this.children.map((layout) => layout.columnList.toArray());
        const colsArray = [].concat.apply([], nestedColumns);
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

        if (this.actionStrip) {
            this.actionStrip.menuOverlaySettings.outlet = this.outlet;
        }
    }

    /**
     * @hidden
     */
    public override ngAfterViewInit() {
        this.rowIslandAPI.register(this);
        if (this.parentIsland) {
            this.parentIsland.rowIslandAPI.registerChildRowIsland(this);
        } else {
            this.rootGrid.gridAPI.registerChildRowIsland(this);
        }
        this._init = false;

        // Create the child toolbar if the parent island has a toolbar definition
        this.gridCreated.pipe(pluck('grid'), takeUntil(this.destroy$)).subscribe(grid => {
            grid.rendered$.pipe(first(), filter(() => !!this.toolbarTemplate))
                .subscribe(() => grid.toolbarOutlet.createEmbeddedView(this.toolbarTemplate, { $implicit: grid }, { injector: grid.toolbarOutlet.injector }));
            grid.rendered$.pipe(first(), filter(() => !!this.paginatorTemplate))
                .subscribe(() => {
                    this.rootGrid.paginatorList.changes.pipe(takeUntil(this.destroy$)).subscribe((changes: QueryList<IgxPaginatorComponent>) => {
                        changes.forEach(p => {
                            if (p.nativeElement.offsetParent?.id === grid.id) {
                                // Optimize update only for those grids that have related changed paginator.
                                grid.setUpPaginator()
                            }
                        });
                    });
                    grid.paginatorOutlet.createEmbeddedView(this.paginatorTemplate, { $implicit: grid });
                });
        });
    }

    /**
     * @hidden
     */
    public ngOnChanges(changes) {
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
            this.getGridsForIsland(this.key).forEach(grid => {
                this.cleanGridState(grid);
                grid.gridAPI.unsetChildRowIsland(this);
            });
            this.parentIsland.rowIslandAPI.unsetChildRowIsland(this);
        } else {
            this.rootGrid.gridAPI.unsetChildRowIsland(this);
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

    protected _childColumns = [];

    protected updateColumnList() {
        const nestedColumns = this.children.map((layout) => layout.columnList.toArray());
        const colsArray = [].concat.apply([], nestedColumns);
        const topCols = this.columnList.filter((item) => {
            if (colsArray.indexOf(item) === -1) {
                /* Reset the default width of the columns that come into this row island,
                because the root catches them first during the detectChanges() and sets their defaultWidth. */
                item.defaultWidth = undefined;
                return true;
            }
            return false;
        });
        this._childColumns = topCols;
        this.updateColumns(this._childColumns);
        this.rowIslandAPI.getChildGrids().forEach((grid: GridType) => {
            grid.createColumnsList(this._childColumns);
            if (!this.document.body.contains(grid.nativeElement)) {
                grid.updateOnRender = true;
            }
        });
    }

    protected updateChildren() {
        if (this.children.first === this) {
            this.children.reset(this.children.toArray().slice(1));
        }
        this.children.forEach(child => {
            child.parentIsland = this;
        });
    }

    private cleanGridState(grid) {
        grid.childGridTemplates.forEach((tmpl) => {
            tmpl.owner.cleanView(tmpl.context.templateID);
        });
        grid.childGridTemplates.clear();
        grid.onRowIslandChange();
    }
}
