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
    DoCheck,
    AfterContentInit,
    Optional
} from '@angular/core';
import { IgxGridBaseComponent, IgxGridTransaction } from '../grid-base.component';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { IgxRowIslandComponent, IgxGridExpandState } from './row-island.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxGridComponent } from '../grid/grid.component';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { IgxColumnComponent, IgxColumnGroupComponent, IGridDataBindable } from '../grid';
import { Transaction, TransactionService, State } from '../../services/index';
import { DOCUMENT } from '@angular/common';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxSummaryOperand } from './../grid-summary';
import { IgxHierarchicalSelectionAPIService } from './selection';
import { IgxSelectionAPIService } from '../../core/selection';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';

let NEXT_ID = 0;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid',
    templateUrl: 'hierarchical-grid.component.html',
    providers: [ { provide: GridBaseAPIService, useClass: IgxHierarchicalGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxHierarchicalGridComponent) },
        IgxFilteringService, IgxHierarchicalGridNavigationService ]
    })
export class IgxHierarchicalGridComponent extends IgxGridComponent implements AfterViewInit, AfterContentInit {
    private h_id = `igx-hierarchical-grid-${NEXT_ID++}`;
    public hgridAPI: IgxHierarchicalGridAPIService;
    private _childGridTemplates: Map<any, any> = new Map();
    private _scrollTop = 0;
    private _scrollLeft = 0;
    private _hierarchicalState = [];
    public parent = null;
    public updateOnRender = false;

    /**
     * @hidden
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: true })
    public columnList: QueryList<IgxColumnComponent>;

    @ViewChild('hierarchical_record_template', { read: TemplateRef })
    protected hierarchicalRecordTemplate: TemplateRef<any>;

    @ViewChild('child_record_template', { read: TemplateRef })
    protected childTemplate: TemplateRef<any>;

    @ViewChild('group_template', { read: TemplateRef })
    protected grTemplate: TemplateRef<any>;

    @ViewChild('headerHierarchyExpander', { read: ElementRef })
    protected headerHierarchyExpander: ElementRef;

    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this.h_id;
    }

    @ViewChildren(IgxChildGridRowComponent, { read: IgxChildGridRowComponent })
    public hierarchicalRows: QueryList<IgxChildGridRowComponent>;


    @Input()
    public set hierarchicalState(value) {
        // Expanding or collapsing any of the rows no longear means that all rows should be expanded/collapsed.
        this.childLayoutList.forEach(layout => layout.childrenExpandState = IgxGridExpandState.MIXED);
        this._hierarchicalState = value;
    }

    public get hierarchicalState() {
        return this._hierarchicalState;
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

    public isChildGridRecord(record: any): boolean {
        // Can be null when there is defined layout but no child data was found
        return record.childGridData !== undefined;
    }

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
    public isGroupByRecord(record: any): boolean {
        // return record.records instance of GroupedRecords fails under Webpack
        return record.records && record.records.length;
    }

    get maxLevelHeaderDepth() {
        this._maxLevelHeaderDepth = this.columnList.reduce((acc, col) => Math.max(acc, col.level), 0);
        return this._maxLevelHeaderDepth;
    }

    get hasExpandableChildren() {
        if (!this.data || this.data.length === 0
        || this.childLayoutKeys.length === 0) {
            return false;
        }
        return this.childLayoutKeys.some(key => {
           return this.data.some((rec) => rec.hasOwnProperty(key));
        });
    }

    /**
     * @hidden
     */
    public getTemplate(rowData: any): TemplateRef<any> {
        let template;
        if (this.isChildGridRecord(rowData)) {
            template = this.childTemplate;
        } else if (this.isGroupByRecord(rowData)) {
            template = this.grTemplate;
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
                    owner: tmlpOutlet
                };
            }
        }
        return {
            $implicit: rowData,
            templateID: this.isChildGridRecord(rowData) ?
            'childRow' :
            this.isGroupByRecord(rowData) ? 'groupRow' : 'dataRow'
        };
    }

    public get childLayoutKeys() {
        const keys = this.childLayoutList.map((item) => item.key);
        return keys;
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
    toggleAllRows() {
        const collapseAll =  this.hierarchicalState.length > 0;
        if (collapseAll) {
            this.verticalScrollContainer.scrollTo(0);
            this.hierarchicalState = [];
        } else {
            this.verticalScrollContainer.scrollTo(0);
            this.hierarchicalState = this.data.map((rec) => {
                return {rowID: this.primaryKey ? rec[this.primaryKey] : rec };
            });
        }
    }

    protected getChildGrid(path: Array<IPathSegment>) {
        if (!path) {
            return;
        }
        return this.hgridAPI.getChildGrid(path);
    }
    protected getChildGrids(inDeph?: boolean) {
        return  this.hgridAPI.getChildGrids(inDeph);
    }

    /**
     * @hidden
     */
    public isHierarchicalRecord(record: any): boolean {
        return this.childLayoutList.length !== 0 && record[this.childLayoutList.first.key];
    }

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

    public ngAfterViewInit() {
        super.ngAfterViewInit();
        this.verticalScrollContainer.getVerticalScroll().addEventListener('scroll', this.hg_verticalScrollHandler.bind(this));
        this.parentVirtDir.getHorizontalScroll().addEventListener('scroll', this.hg_horizontalScrollHandler.bind(this));
    }

    public ngAfterContentInit() {
        const nestedColumns = this.allLayoutList.map((layout) => {
            layout.rootGrid = this;
            return layout.allColumns.toArray();
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
    private hg_verticalScrollHandler(event) {
        this._scrollTop = event.target.scrollTop;
    }
    private hg_horizontalScrollHandler(event) {
        this._scrollLeft = event.target.scrollLeft;
    }

    /**
     * @hidden
     */
    public createColumnsList(cols: Array<any>) {
        const columns = [];
        const topLevelCols = this.onlyTopLevel(cols);
        topLevelCols.forEach((col) => {
            const ref = this._createColumn(col);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });
        const result = flatten(columns);
        this.columnList.reset(result);
        this.columnList.notifyOnChanges();
    }
    private _createColumn(col) {
        let ref;
        if (col instanceof IgxColumnGroupComponent) {
            ref = this._createColGroupComponent(col);
        } else {
            ref = this._createColComponent(col);
        }
        return ref;
    }
    private _createColGroupComponent(col: IgxColumnGroupComponent) {
        const factoryGroup = this.resolver.resolveComponentFactory(IgxColumnGroupComponent);
        const ref = this.viewRef.createComponent(factoryGroup, null, this.viewRef.injector);
        ref.changeDetectorRef.detectChanges();
        factoryGroup.inputs.forEach((input) => {
            const propName = input.propName;
            if (!((<any>col)[propName] instanceof IgxSummaryOperand)) {
                (<any>ref.instance)[propName] =  (<any>col)[propName];
            }
         });
         if (col.children.length > 0) {
             const newChildren = [];
            col.children.forEach(child => {
                const newCol = this._createColumn(child).instance;
                newCol.parent = ref.instance;
                newChildren.push(newCol);
            });
            (<IgxColumnGroupComponent>ref.instance).children.reset(newChildren);
            (<IgxColumnGroupComponent>ref.instance).children.notifyOnChanges();
         }
         (<IgxColumnGroupComponent>ref.instance).gridID = this.id;
         return ref;
    }

    private _createColComponent(col) {
        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const ref = this.viewRef.createComponent(factoryColumn, null, this.viewRef.injector);
        factoryColumn.inputs.forEach((input) => {
            const propName = input.propName;
            if (!((<any>col)[propName] instanceof IgxSummaryOperand)) {
                (<any>ref.instance)[propName] =  (<any>col)[propName];
            }
        });
        (<IgxColumnComponent>ref.instance).gridID = this.id;
        return ref;
    }
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

    constructor(
        gridAPI: GridBaseAPIService<IgxGridComponent>,
        selection: IgxHierarchicalSelectionAPIService,
        @Inject(IgxGridTransaction) _transactions: TransactionService<Transaction, State>,
        elementRef: ElementRef,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        navigation: IgxHierarchicalGridNavigationService,
        filteringService: IgxFilteringService,
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
                _displayDensityOptions);
        this.hgridAPI = <IgxHierarchicalGridAPIService>gridAPI;
    }
}
export interface IPathSegment {
    rowID: string | object;
    rowIslandKey: string;
}

function flatten(arr: any[]) {
    let result = [];

    arr.forEach(el => {
        result.push(el);
        if (el.children) {
            result = result.concat(flatten(el.children.toArray()));
        }
    });
    return result;
}
