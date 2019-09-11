import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Input,
    QueryList,
    OnInit,
    Inject,
    ElementRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    IterableDiffers,
    ViewContainerRef,
    NgZone,
    AfterViewInit,
    OnChanges,
    Output,
    EventEmitter,
    Optional,
    OnDestroy,
    DoCheck
} from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxGridTransaction, IGridDataBindable, IgxGridBaseComponent } from '../grid-base.component';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { DOCUMENT } from '@angular/common';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { TransactionService, Transaction, State } from '../../services';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxHierarchicalGridBaseComponent } from './hierarchical-grid-base.component';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';
import { IgxGridSelectionService, IgxGridCRUDService } from '../../core/grid-selection';

import { IgxOverlayService } from '../../services/index';
import { takeUntil } from 'rxjs/operators';
import { IgxColumnComponent } from '../column.component';
import { IgxRowIslandAPIService } from './row-island-api.service';
import { IBaseEventArgs } from '../../core/utils';
import { IgxColumnResizingService } from '../resizing/resizing.service';
export interface IGridCreatedEventArgs extends IBaseEventArgs {
    owner: IgxRowIslandComponent;
    parentID: any;
    grid: IgxHierarchicalGridComponent;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-row-island',
    template: ``,
    providers: [IgxRowIslandAPIService]
})
export class IgxRowIslandComponent extends IgxHierarchicalGridBaseComponent
            implements AfterContentInit, AfterViewInit, OnChanges, OnInit, OnDestroy, DoCheck {
    /**
     * Sets the key of the row island by which child data would be taken from the row data if such is provided.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true">
     *      <igx-row-island [key]="'childData'">
     *          <!-- ... -->
     *      </igx-row-island>
     * </igx-hierarchical-grid>
     * ```
     * @memberof IgxRowIslandComponent
     */
    @Input()
    public key: string;

    /**
     * Sets if all immediate children of the grids for this `IgxRowIslandComponent` should be expanded/collapsed.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true">
     *      <igx-row-island [key]="'childData'" [expandChildren]="true" #rowIsland>
     *          <!-- ... -->
     *      </igx-row-island>
     * </igx-hierarchical-grid>
     * ```
     * @memberof IgxRowIslandComponent
     */
    @Input()
    set expandChildren(value: boolean) {
        this._expandChildren = value;
        this.rowIslandAPI.getChildGrids().forEach((grid) => {
            if (document.body.contains(grid.nativeElement)) {
                // Detect changes right away if the grid is visible
                grid.expandChildren = value;
                grid.markForCheck();
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
     * @memberof IgxRowIslandComponent
     */
    get expandChildren(): boolean {
        return this._expandChildren;
    }

    /**
     * @hidden
     */
    @ContentChildren(IgxRowIslandComponent, { read: IgxRowIslandComponent, descendants: false })
    public children = new QueryList<IgxRowIslandComponent>();

    /**
     * @hidden
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: false })
    public childColumns = new QueryList<IgxColumnComponent>();

    /**
     * @hidden
     */
    @Output()
    public onLayoutChange = new EventEmitter<any>();

    /**
     * Event emmited when a grid is being created based on this row island.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true">
     *      <igx-row-island [key]="'childData'" (onGridCreated)="gridCreated($event)" #rowIsland>
     *          <!-- ... -->
     *      </igx-row-island>
     * </igx-hierarchical-grid>
     * ```
     * @memberof IgxRowIslandComponent
     */
    @Output()
    public onGridCreated = new EventEmitter<IGridCreatedEventArgs>();

    /**
     * @hidden
     */
    get id() {
        const pId = this.parentId ? this.parentId.substring(this.parentId.indexOf(this.layout_id) + this.layout_id.length) + '-' : '';
        return this.layout_id + pId +  this.key;
    }

    /**
     * @hidden
     */
    get parentId() {
       return this.parentIsland ? this.parentIsland.id : null;
    }

    /**
     * @hidden
     */
    get level() {
        let ptr = this.parentIsland;
        let lvl = 0;
        while (ptr) {
            lvl++;
            ptr = ptr.parentIsland;
        }
        return lvl + 1;
    }

    /**
     * Get transactions service for the children grid components.
     * @experimental @hidden
     */
    get transactions(): TransactionService<Transaction, State> {
        const grids = this.rowIslandAPI.getChildGrids();
        return grids.length ? grids[0].transactions : this._transactions;
    }

    /**
     * @hidden
     */
    public initialChanges = [];

    /**
     * @hidden
     */
    public rootGrid = null;
    readonly data: any[];
    readonly filteredData: any[];
    private layout_id = `igx-row-island-`;
    private isInit = false;

    constructor(
        public selectionService: IgxGridSelectionService,
        crudService: IgxGridCRUDService,
        public colResizingService: IgxColumnResizingService,
        gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
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
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        public summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        public rowIslandAPI: IgxRowIslandAPIService) {
        super(
            selectionService,
            crudService,
            colResizingService,
            gridAPI,
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
            overlayService,
            summaryService,
            _displayDensityOptions
        );
        this.hgridAPI = <IgxHierarchicalGridAPIService>gridAPI;
    }

    /**
     * @hidden
     */
    ngOnInit() {
        this.rootGrid = this.hgridAPI.grid;
    }

    /**
     * @hidden
     */
    ngDoCheck() {
    }

    /**
     * @hidden
     */
    ngAfterContentInit() {
        this.updateChildren();
        this.children.notifyOnChanges();
        this.children.changes.pipe(takeUntil(this.destroy$))
        .subscribe((change) => {
            this.updateChildren();
            // update existing grids since their child ri have been changed.
            this.getGridsForIsland(this.key).forEach(grid => {
                (grid as any).onRowIslandChange(this.children);
            });
        });
        const nestedColumns = this.children.map((layout) => layout.columnList.toArray());
        const colsArray = [].concat.apply([], nestedColumns);
        const topCols = this.columnList.filter((item) => {
            return colsArray.indexOf(item) === -1;
        });
        this.childColumns.reset(topCols);
        this.columnList.changes.pipe(takeUntil(this.destroy$)).subscribe(() => { this.updateColumnList(); });
    }

    protected updateChildren() {
        this.children.reset(this.children.toArray().slice(1));
        this.children.forEach(child => {
            child.parentIsland = this;
        });
    }

    /**
     * @hidden
     */
    ngAfterViewInit() {
        this.rowIslandAPI.register(this);
        if (this.parentIsland) {
            this.parentIsland.rowIslandAPI.registerChildRowIsland(this);
        } else {
            this.rootGrid.hgridAPI.registerChildRowIsland(this);
        }
        this._init = false;
    }

    /**
     * @hidden
     */
    ngOnChanges(changes) {
        this.onLayoutChange.emit(changes);
        if (!this.isInit) {
            this.initialChanges.push(changes);
        }
    }

    /**
     * @hidden
     */
    ngOnDestroy() {
        // Override the base destroy because we don't have rendered anything to use removeEventListener on
        this.destroy$.next(true);
        this.destroy$.complete();
        this._destroyed = true;
        this.rowIslandAPI.unset(this.id);
        if (this.parentIsland) {
            this.getGridsForIsland(this.key).forEach(grid => {
                this.cleanGridState(grid);
                grid.hgridAPI.unsetChildRowIsland(this);
            });
            this.parentIsland.rowIslandAPI.unsetChildRowIsland(this);
        } else {
            this.rootGrid.hgridAPI.unsetChildRowIsland(this);
            this.cleanGridState(this.rootGrid);
        }
    }

    private cleanGridState(grid) {
        grid.childGridTemplates.forEach((tmpl) => {
            tmpl.owner.cleanView(tmpl.context.templateID);
        });
        grid.childGridTemplates.clear();
        grid.onRowIslandChange();
    }

    /**
     * @hidden
     */
    reflow() {}

    /**
     * @hidden
     */
    calculateGridHeight() {}

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
        this.childColumns.reset(topCols);

        if (this.parentIsland) {
            this.parentIsland.columnList.notifyOnChanges();
        } else {
            this.rootGrid.columnList.notifyOnChanges();
        }

        this.rowIslandAPI.getChildGrids().forEach((grid: IgxHierarchicalGridComponent) => {
            grid.createColumnsList(this.childColumns.toArray());
            if (!document.body.contains(grid.nativeElement)) {
                grid.updateOnRender = true;
            }
        });
    }
}
