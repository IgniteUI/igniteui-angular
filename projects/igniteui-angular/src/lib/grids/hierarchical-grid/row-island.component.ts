import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Input,
    QueryList,
    forwardRef,
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
    OnDestroy
} from '@angular/core';
import { IgxColumnComponent } from '.././column.component';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxGridBaseComponent, IgxGridComponent, GridBaseAPIService, IgxGridTransaction, IGridDataBindable } from '../grid';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { IgxSelectionAPIService } from '../../core/selection';
import { Transaction, TransactionService, State } from '../../services/index';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { DOCUMENT } from '@angular/common';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';

export interface IGridCreatedEventArgs {
    owner: IgxRowIslandComponent;
    parendID: any;
    grid: IgxHierarchicalGridComponent;
}

export const enum IgxGridExpandState {
    COLLAPSED = -1, // Set when all rows to be collapsed through expandChildren option
    MIXED = 0, // Should be set when rows are manually expanded/collapsed
    EXPANDED = 1 // Set when all rows to be expanded through expandChildren option
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-row-island',
    template: ``
})
export class IgxRowIslandComponent extends IgxGridComponent implements AfterContentInit, OnInit, AfterViewInit, OnChanges, OnDestroy {
    private layout_id = `igx-row-island-`;
    private hgridAPI;
    private isInit = false;
    private _expandChildren = false;
    public childrenExpandState: IgxGridExpandState = IgxGridExpandState.COLLAPSED;
    public initialChanges;
    public rootGrid = null;

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: false })
    public childColumns = new QueryList<IgxColumnComponent>();

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: true })
    public allColumns = new QueryList<IgxColumnComponent>();

    @ContentChildren(IgxRowIslandComponent, { read: IgxRowIslandComponent, descendants: false })
    children = new QueryList<IgxRowIslandComponent>();

    @Output()
    public onLayoutChange = new EventEmitter<any>();

    @Output()
    public onGridCreated = new EventEmitter<IGridCreatedEventArgs>();

    @Input() public key: string;

    @Input()
    public set expandChildren(value) {
        this._expandChildren = value;
        this.childrenExpandState = value ? IgxGridExpandState.EXPANDED : IgxGridExpandState.COLLAPSED;
        if (!this.parent && this.rootGrid) {
            this.rootGrid.markForCheck();
        } else if (this.parent) {
            this.hgridAPI.getChildGridsForRowIsland(this.parent.key).forEach((grid) => {
                if (document.body.contains(grid.nativeElement)) {
                    // Detect changes right away if the grid is visible
                    grid.markForCheck();
                } else {
                    // Else defer the detection on changes when the grid gets into view for performance.
                    grid.updateOnRender = true;
                }
            });
        }
    }

    public get expandChildren() {
        return this._expandChildren;
    }

    public get shouldExpandAllChildren() {
        return this.childrenExpandState === IgxGridExpandState.EXPANDED;
    }

    public get shouldCollapseAllChildren() {
        return this.childrenExpandState === IgxGridExpandState.COLLAPSED;
    }

    public parent = null;

    get id() {
        const pId = this.parentId ? this.parentId.substring(this.parentId.indexOf(this.layout_id) + this.layout_id.length) + '-' : '';
        return this.layout_id + pId +  this.key;
    }

    get parentId() {
       return this.parent ? this.parent.id : null;
    }

    get level() {
        let ptr = this.parent;
        let lvl = 0;
        while (ptr) {
            lvl++;
            ptr = ptr.parent;
        }
        return lvl + 1;
    }

    constructor(
        gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
        selection: IgxSelectionAPIService,
        @Inject(IgxGridTransaction) _transactions: TransactionService<Transaction, State>,
        elementRef: ElementRef,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        navigation: IgxGridNavigationService,
        filteringService: IgxFilteringService,
        public summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(
            gridAPI,
            selection,
            _transactions,
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
            _displayDensityOptions
        );
        this.hgridAPI = <IgxHierarchicalGridAPIService>gridAPI;
    }

    ngOnInit() {
    }

    ngAfterContentInit() {
        this.children.reset(this.children.toArray().slice(1));
        this.children.forEach(child => {
            child.parent = this;
        });
        const nestedColumns = this.children.map((layout) => layout.allColumns.toArray());
        const colsArray = [].concat.apply([], nestedColumns);
        const topCols = this.allColumns.filter((item) => {
            return colsArray.indexOf(item) === -1;
        });
        this.childColumns.reset(topCols);
    }

    ngAfterViewInit() {
        this.hgridAPI.registerLayout(this);
    }

    ngOnChanges(changes) {
        this.onLayoutChange.emit(changes);
        if (!this.isInit) {
            this.initialChanges = changes;
        }
    }

    reflow() {}

    calculateGridHeight() {}

    ngOnDestroy() {
        // Override the base destroy because we don't have rendered anything to use removeEventListener on
        this.destroy$.next(true);
        this.destroy$.complete();
        this.hgridAPI.unset(this.id);
    }

    protected getGrids() {
        return this.hgridAPI.getChildGridsForRowIsland(this.key);
    }
}
