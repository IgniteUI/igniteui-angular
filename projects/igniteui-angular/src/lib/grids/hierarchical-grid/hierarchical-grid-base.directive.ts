import {
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    Injector,
    Input,
    IterableDiffers,
    LOCALE_ID,
    NgModuleRef,
    NgZone,
    Optional,
    Output,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { IgxSummaryOperand } from '../summaries/grid-summary';
import { DOCUMENT } from '@angular/common';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { GridType, IGX_GRID_SERVICE_BASE, IPathSegment } from '../common/grid.interface';
import { IgxColumnGroupComponent } from '../columns/column-group.component';
import { IgxColumnComponent } from '../columns/column.component';
import { IForOfState } from '../../directives/for-of/for_of.directive';
import { takeUntil } from 'rxjs/operators';
import { PlatformUtil } from '../../core/utils';
import { IgxFlatTransactionFactory } from '../../services/transaction/transaction-factory.service';
import { IgxTransactionService } from '../../services/transaction/igx-transaction';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { State, Transaction, TransactionService } from '../../services/transaction/transaction';
import { IgxGridTransaction } from '../common/types';

export const hierarchicalTransactionServiceFactory = () => new IgxTransactionService();

export const IgxHierarchicalTransactionServiceFactory = {
    provide: IgxGridTransaction,
    useFactory: hierarchicalTransactionServiceFactory
};

@Directive()
export abstract class IgxHierarchicalGridBaseDirective extends IgxGridBaseDirective implements GridType {
    /**
     * Gets/Sets the key indicating whether a row has children. If row has no children it does not render an expand indicator.
     *
     * @example
     * ```html
     * <igx-hierarchical-grid #grid [data]="localData" [hasChildrenKey]="'hasEmployees'">
     * </igx-hierarchical-grid>
     * ```
     */
    @Input()
    public hasChildrenKey: string;

    /**
     * Gets/Sets whether the expand/collapse all button in the header should be rendered.
     *
     * @remark
     * The default value is false.
     * @example
     * ```html
     * <igx-hierarchical-grid #grid [data]="localData" [showExpandAll]="true">
     * </igx-hierarchical-grid>
     * ```
     */
    @Input()
    public showExpandAll = false;

    /**
     * Emitted when a new chunk of data is loaded from virtualization.
     *
     * @example
     * ```typescript
     *  <igx-hierarchical-grid [id]="'igx-grid-1'" [data]="Data" [autoGenerate]="true" (dataPreLoad)="handleEvent()">
     *  </igx-hierarchical-grid>
     * ```
     */
    @Output()
    public dataPreLoad = new EventEmitter<IForOfState>();

    /**
     * @hidden
     * @internal
     */
    @ViewChild('dragIndicatorIconBase', { read: TemplateRef, static: true })
    public dragIndicatorIconBase: TemplateRef<any>;

    /**
     * @hidden
     */
    public get maxLevelHeaderDepth() {
        if (this._maxLevelHeaderDepth === null) {
            this._maxLevelHeaderDepth = this.columnList.reduce((acc, col) => Math.max(acc, col.level), 0);
        }
        return this._maxLevelHeaderDepth;
    }

    /**
     * Gets the outlet used to attach the grid's overlays to.
     *
     * @remark
     * If set, returns the outlet defined outside the grid. Otherwise returns the grid's internal outlet directive.
     */
    public get outlet() {
        return this.rootGrid ? this.rootGrid.resolveOutlet() : this.resolveOutlet();
    }

    /**
     * Sets the outlet used to attach the grid's overlays to.
     */
    public set outlet(val: any) {
        this._userOutletDirective = val;
    }

    /** @hidden @internal */
    public batchEditingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    public get batchEditing(): boolean {
        return this._batchEditing;
    }

    public set batchEditing(val: boolean) {
        if (val !== this._batchEditing) {
            delete this._transactions;
            this.switchTransactionService(val);
            this.subscribeToTransactions();
            this.batchEditingChange.emit(val);
            this._batchEditing = val;
        }
    }

    /**
     * @hidden
     */
    public parentIsland: IgxRowIslandComponent;
    public abstract rootGrid: GridType;

    public abstract expandChildren: boolean;

    constructor(
        public selectionService: IgxGridSelectionService,
        public colResizingService: IgxColumnResizingService,
        @Inject(IGX_GRID_SERVICE_BASE) public gridAPI: IgxHierarchicalGridAPIService,
        protected transactionFactory: IgxFlatTransactionFactory,
        elementRef: ElementRef<HTMLElement>,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        appRef: ApplicationRef,
        moduleRef: NgModuleRef<any>,
        injector: Injector,
        navigation: IgxHierarchicalGridNavigationService,
        filteringService: IgxFilteringService,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        public summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Inject(LOCALE_ID) localeId: string,
        protected platform: PlatformUtil,
        @Optional() @Inject(IgxGridTransaction) protected _diTransactions?: TransactionService<Transaction, State>) {
        super(
            selectionService,
            colResizingService,
            gridAPI,
            transactionFactory,
            elementRef,
            zone,
            document,
            cdr,
            resolver,
            differs,
            viewRef,
            appRef,
            moduleRef,
            injector,
            navigation,
            filteringService,
            overlayService,
            summaryService,
            _displayDensityOptions,
            localeId,
            platform);
    }

    /**
     * @hidden
     */
    public createColumnsList(cols: Array<any>) {
        const columns = [];
        const topLevelCols = cols.filter(c => c.level === 0);
        topLevelCols.forEach((col) => {
            const ref = this._createColumn(col);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });
        const result = flatten(columns);
        this.columnList.reset(result);
        this.columnList.notifyOnChanges();
        this.initPinning();

        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const outputs = factoryColumn.outputs.filter(o => o.propName !== 'columnChange');
        outputs.forEach(output => {
            this.columnList.forEach(column => {
                if (column[output.propName]) {
                    column[output.propName].pipe(takeUntil(column.destroy$)).subscribe((args) => {
                        const rowIslandColumn = this.parentIsland.childColumns.find(col => col.field === column.field);
                        rowIslandColumn[output.propName].emit({ args, owner: this });
                    });
                }
            });
        });
    }

    protected _createColumn(col) {
        let ref;
        if (col instanceof IgxColumnGroupComponent) {
            ref = this._createColGroupComponent(col);
        } else {
            ref = this._createColComponent(col);
        }
        return ref;
    }

    protected _createColGroupComponent(col: IgxColumnGroupComponent) {
        const factoryGroup = this.resolver.resolveComponentFactory(IgxColumnGroupComponent);
        const ref = this.viewRef.createComponent(IgxColumnGroupComponent, { injector: this.viewRef.injector });
        ref.changeDetectorRef.detectChanges();
        factoryGroup.inputs.forEach((input) => {
            const propName = input.propName;
            ref.instance[propName] = col[propName];
        });
        if (col.children.length > 0) {
            const newChildren = [];
            col.children.forEach(child => {
                const newCol = this._createColumn(child).instance;
                newCol.parent = ref.instance;
                newChildren.push(newCol);
            });
            ref.instance.children.reset(newChildren);
            ref.instance.children.notifyOnChanges();
        }
        return ref;
    }

    protected _createColComponent(col) {
        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const ref = this.viewRef.createComponent(IgxColumnComponent, { injector: this.viewRef.injector });
        factoryColumn.inputs.forEach((input) => {
            const propName = input.propName;
            if (!(col[propName] instanceof IgxSummaryOperand)) {
                ref.instance[propName] = col[propName];
            } else {
                ref.instance[propName] = col[propName].constructor;
            }
        });
        return ref;
    }

    protected getGridsForIsland(rowIslandID: string) {
        return this.gridAPI.getChildGridsForRowIsland(rowIslandID);
    }

    protected getChildGrid(path: Array<IPathSegment>) {
        if (!path) {
            return;
        }
        return this.gridAPI.getChildGrid(path);
    }
}

const flatten = (arr: any[]) => {
    let result = [];

    arr.forEach(el => {
        result.push(el);
        if (el.children) {
            result = result.concat(flatten(el.children.toArray()));
        }
    });
    return result;
};
