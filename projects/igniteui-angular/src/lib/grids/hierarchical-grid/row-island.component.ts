import {
    AfterContentInit,
    AfterViewInit,
    ApplicationRef,
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
    Optional,
    Output,
    QueryList,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { DOCUMENT } from '@angular/common';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxHierarchicalGridBaseDirective } from './hierarchical-grid-base.directive';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IgxOverlayService } from '../../services/public_api';
import { first, filter, takeUntil, pluck } from 'rxjs/operators';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxRowIslandAPIService } from './row-island-api.service';
import { PlatformUtil } from '../../core/utils';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { GridType, IGX_GRID_SERVICE_BASE } from '../common/grid.interface';
import { IgxGridToolbarDirective, IgxGridToolbarTemplateContext } from '../toolbar/common';
import { IgxActionStripComponent } from '../../action-strip/action-strip.component';
import { IgxPaginatorDirective } from '../../paginator/paginator-interfaces';
import { IgxFlatTransactionFactory } from '../../services/transaction/transaction-factory.service';
import { IGridCreatedEventArgs } from './events';
import { IgxGridValidationService } from '../grid/grid-validation.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-row-island',
    template: ``,
    providers: [
        IgxRowIslandAPIService,
        IgxFilteringService,
        IgxGridSelectionService
    ]
})
export class IgxRowIslandComponent extends IgxHierarchicalGridBaseDirective
    implements AfterContentInit, AfterViewInit, OnChanges, OnInit, OnDestroy {
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

    /**
     * @hidden
     */
    @ContentChildren(forwardRef(() => IgxRowIslandComponent), { read: IgxRowIslandComponent, descendants: false })
    public children = new QueryList<IgxRowIslandComponent>();

    /**
     * @hidden
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: false })
    public childColumns = new QueryList<IgxColumnComponent>();

    @ContentChild(IgxGridToolbarDirective, { read: TemplateRef })
    public islandToolbarTemplate: TemplateRef<IgxGridToolbarTemplateContext>;

    @ContentChild(IgxPaginatorDirective, { read: TemplateRef })
    public islandPaginatorTemplate: TemplateRef<any>;

    @ContentChildren(IgxActionStripComponent, { read: IgxActionStripComponent, descendants: false })
    public actionStrips: QueryList<IgxActionStripComponent>;

    /**
     * @hidden
     */
    @Output()
    public layoutChange = new EventEmitter<any>();

    /**
     * Event emmited when a grid is being created based on this row island.
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
    public readonly data: any[] | null;

    private ri_columnListDiffer;
    private layout_id = `igx-row-island-`;
    private isInit = false;

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
    @Input()
    public set expandChildren(value: boolean) {
        this._defaultExpandState = value;
        this.rowIslandAPI.getChildGrids().forEach((grid) => {
            if (document.body.contains(grid.nativeElement)) {
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
        appRef: ApplicationRef,
        navigation: IgxHierarchicalGridNavigationService,
        filteringService: IgxFilteringService,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) _displayDensityOptions: IDisplayDensityOptions,
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
            appRef,
            injector,
            envInjector,
            navigation,
            filteringService,
            overlayService,
            summaryService,
            _displayDensityOptions,
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
        this.actionStrip = this.actionStrips.first;
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
            grid.rendered$.pipe(first(), filter(() => !!this.islandToolbarTemplate))
                .subscribe(() => grid.toolbarOutlet.createEmbeddedView(this.islandToolbarTemplate, { $implicit: grid }));
            grid.rendered$.pipe(first(), filter(() => !!this.islandPaginatorTemplate))
                .subscribe(() => {
                    this.rootGrid.paginatorList.changes.pipe(takeUntil(this.destroy$)).subscribe(() => grid.setUpPaginator());
                    grid.paginatorOutlet.createEmbeddedView(this.islandPaginatorTemplate);
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
        // Override the base destroy because we don't have rendered anything to use removeEventListener on
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
        this.rowIslandAPI.getChildGrids().forEach((grid: GridType) => {
            grid.createColumnsList(this._childColumns);
            if (!document.body.contains(grid.nativeElement)) {
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
