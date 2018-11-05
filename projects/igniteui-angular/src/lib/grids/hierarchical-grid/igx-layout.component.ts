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
    AfterViewInit
} from '@angular/core';
import { IgxColumnComponent } from '.././column.component';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxGridBaseComponent, IgxGridComponent, GridBaseAPIService, IgxGridTransaction } from '../grid';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { IgxSelectionAPIService } from '../../core/selection';
import { IgxTransactionService, TransactionService } from '../../services';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { DOCUMENT } from '@angular/common';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-layout',
    template: ``
})
export class IgxChildLayoutComponent extends IgxGridComponent implements AfterContentInit, OnInit, AfterViewInit {
    private layout_id = `igx-layout-`;
    private hgridAPI;
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: false })
    childColumns = new QueryList<IgxColumnComponent>();

    @ContentChildren(IgxChildLayoutComponent, { read: IgxChildLayoutComponent, descendants: false })
    children = new QueryList<IgxChildLayoutComponent>();

    @Input() public key: string;

    public parent = null;

    get id() {
        return this.layout_id + this.key;
    }
    get level() {
        let ptr = this.parent;
        let lvl = 0;
        while (ptr) {
            lvl++;
            ptr = ptr.parent;
        }
        return lvl;
    }
    ngAfterContentInit() {
        console.log(this.childColumns);
        this.children.reset(this.children.toArray().slice(1));
        this.children.forEach(child => {
            child.parent = this;
        });
    }
    ngOnInit() {
        this.hgridAPI.registerLayout(this);
    }
    ngAfterViewInit() {
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


