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
import { IgxRowIslandComponent } from './row-island.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxGridComponent } from '../grid/grid.component';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../../core/displayDensity';


import {
    IgxGridFilteringPipe,
    IgxGridPagingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPreGroupingPipe,
    IgxGridSortingPipe
} from '.././grid/grid.pipes';
import { IgxColumnComponent, IgxColumnGroupComponent } from '../grid';
import { IgxSelectionAPIService } from '../../core/selection';
import { Transaction, TransactionType, TransactionService, State } from '../../services/index';
import { DOCUMENT } from '@angular/common';
import { IgxGridNavigationService } from '../grid-navigation.service';

let NEXT_ID = 0;
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid',
    templateUrl: 'hierarchical-grid.component.html',
    providers: [ { provide: GridBaseAPIService, useClass: IgxHierarchicalGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxHierarchicalGridComponent) },
        IgxFilteringService ]
})
export class IgxHierarchicalGridComponent extends IgxGridComponent implements AfterViewInit, AfterContentInit {
    private h_id = `igx-hierarchical-grid-${NEXT_ID++}`;
    public hgridAPI: IgxHierarchicalGridAPIService;
    public dataInitialized = false;
    private _childGridTemplates: Map<any, any> = new Map();
    private _scrollTop = 0;
    private _scrollLeft = 0;

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

    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this.h_id;
    }

    @ViewChildren(IgxChildGridRowComponent, { read: IgxChildGridRowComponent })
    public hierarchicalRows: QueryList<IgxChildGridRowComponent>;


    @Input()
    public hierarchicalState = [];

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
        return record.childGridData;
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

    getChildGrid(path: Array<IPathSegment>) {
        if (!path) {
            return;
        }
        return this.hgridAPI.getChildGrid(path);
    }

    getChildGrids(inDeph?: boolean) {
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
        if (record.childGridData) {
            inState = !!this.hierarchicalState.find(v => v.rowID === record.rowID);
        } else {
            inState = !!this.hierarchicalState.find(v => {
                return this.primaryKey ? v.rowID === record[this.primaryKey] : v.rowID === record;
            });
        }
        return inState && this.childLayoutList.length !== 0;
    }

    public viewCreatedHandler(args) {
        if (this.isChildGridRecord(args.context.$implicit)) {
            const key = args.context.$implicit.rowID;
            this._childGridTemplates.set(key, args);
        }
    }

    public viewMovedHandler(args) {
        if (this.isChildGridRecord(args.context.$implicit)) {
            // view was moved, update owner in cache
            const key = args.context.$implicit.rowID;
            const cachedData = this._childGridTemplates.get(key);
            cachedData.owner = args.owner;
            const childGrids = this.getChildGrids(true);
            childGrids.forEach((grid) => grid.updateScrollPosition());
        }
    }

    public ngAfterViewInit() {
        super.ngAfterViewInit();
        this.verticalScrollContainer.getVerticalScroll().addEventListener('scroll', this.hg_verticalScrollHandler.bind(this));
        this.parentVirtDir.getHorizontalScroll().addEventListener('scroll', this.hg_horizontalScrollHandler.bind(this));
    }

    public ngAfterContentInit() {
        const nestedColumns = this.allLayoutList.map((layout) => layout.allColumns.toArray());
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
        gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
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
