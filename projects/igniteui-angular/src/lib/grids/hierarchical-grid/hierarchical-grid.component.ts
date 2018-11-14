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
    DoCheck
} from '@angular/core';
import { IgxGridBaseComponent, IgxGridTransaction } from '../grid-base.component';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { IgxChildLayoutComponent } from './igx-layout.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxGridComponent } from '../grid/grid.component';

import {
    IgxGridFilteringPipe,
    IgxGridPagingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPreGroupingPipe,
    IgxGridSortingPipe
} from '.././grid/grid.pipes';
import { IgxColumnComponent } from '../grid';
import { IgxSelectionAPIService } from '../../core/selection';
import { IgxTransactionService, TransactionService } from '../../services';
import { DOCUMENT } from '@angular/common';
import { IgxGridNavigationService } from '../grid-navigation.service';

let NEXT_ID = 0;
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid',
    templateUrl: 'hierarchical-grid.component.html',
    providers: [ { provide: GridBaseAPIService, useClass: IgxHierarchicalGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxHierarchicalGridComponent) } ]
})
export class IgxHierarchicalGridComponent extends IgxGridComponent implements AfterViewInit {
    private h_id = `igx-hierarchical-grid-${NEXT_ID++}`;
    public hgridAPI: IgxHierarchicalGridAPIService;
    public level = 0;
    private _childGridTemplates: Map<any, any> = new Map();
    private _scrollTop = 0;

    /**
     * @hidden
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: false })
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
    @ContentChildren(IgxChildLayoutComponent, { read: IgxChildLayoutComponent, descendants: false })
    public childLayoutList: QueryList<IgxChildLayoutComponent>;

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
                    view: view,
                    owner: tmlpOutlet
                };
            }
        }
        return {
            $implicit: rowData,
            templateID: this.isChildGridRecord(rowData) ? 'childRow' : 'dataRow'
        };
    }

    public get childLayoutKey() {
        return this.childLayoutList.length > 0 ? this.childLayoutList.first.key : null;
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

            const childGrid = this.hgridAPI.getChildGrid(key);
            childGrid.updateScrollPosition();
        }
    }

    public ngAfterViewInit() {
        super.ngAfterViewInit();
        this.verticalScrollContainer.getVerticalScroll().addEventListener('scroll', this.hg_verticalScrollHandler.bind(this));
    }

    private hg_verticalScrollHandler(event) {
        this._scrollTop = event.target.scrollTop;
    }

    public updateScrollPosition() {
        const scr = this.verticalScrollContainer.getVerticalScroll();
        if (scr) {
            scr.scrollTop = this._scrollTop;
        }
    }

    constructor(
        gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        selection: IgxSelectionAPIService,
        @Inject(IgxGridTransaction) _transactions: TransactionService,
        elementRef: ElementRef,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        navigation: IgxGridNavigationService) {
            super(gridAPI, selection, _transactions, elementRef, zone, document, cdr, resolver, differs, viewRef, navigation);
        this.hgridAPI = <IgxHierarchicalGridAPIService>gridAPI;
    }
}
