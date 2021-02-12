import { Component, ViewChild, ElementRef, Renderer2, OnInit } from '@angular/core';
import { IgxGridComponent, FilteringExpressionsTree,
    ISortingExpression, IPinColumnEventArgs, IColumnVisibilityChangedEventArgs,
    IColumnResizeEventArgs, IColumnSelectionEventArgs, ISortingEventArgs,
    IFilteringEventArgs, IgxStringFilteringOperand, IColumnMovingEndEventArgs,
    IColumnMovingEventArgs, IColumnMovingStartEventArgs, IPinColumnCancellableEventArgs,
    IColumnVisibilityChangingEventArgs,
    IgxPaginatorComponent} from 'igniteui-angular';
import { IPagingDoneEventArgs, IPagingEventArgs } from 'projects/igniteui-angular/src/lib/paginator/interfaces';
import { data } from '../grid-cellEditing/data';

@Component({
    selector: 'app-grid-events',
    styleUrls: ['grid-events.component.scss'],
    templateUrl: 'grid-events.component.html'
})
export class GridEventsComponent implements OnInit {

    @ViewChild('grid1', { read: IgxGridComponent, static: true }) public grid: IgxGridComponent;
    @ViewChild(IgxPaginatorComponent) public paginator: IgxPaginatorComponent;
    @ViewChild('logger') public logger: ElementRef;

    public $sorting = false;
    public $filtering = false;
    public $paging = false;
    public $pinning = false;
    public $resizing = false;
    public $onColumnSelectionChange = false;
    public $hiding = false;
    public $moving = false;
    public localData: any[];
    public page = 1;
    public perPage = 7;
    public selectOptions = [5, 10, 15];
    public totalCount = 10;

    constructor(private renderer: Renderer2) { }

    public ngOnInit() {
        this.localData = data;
        this.totalCount = data.length;
    }

    public filter(term) {
        this.grid.filter('ProductName', term, IgxStringFilteringOperand.instance().condition('contains'));
    }

    public filterGlobal(term) {
        this.grid.filterGlobal(term, IgxStringFilteringOperand.instance().condition('contains'));
    }

    public onColumnMovingStart(_event: IColumnMovingStartEventArgs) {
        this.logAnEvent('=> onColumnMovingStart');
    }
    public onColumnMoving(event: IColumnMovingEventArgs) {
        event.cancel = this.$moving;
        this.logAnEvent(event.cancel ? '=> onColumnMoving cancelled' : '=> onColumnMoving');
    }
    public onColumnMovingEnd(_event: IColumnMovingEndEventArgs) {
        this.logAnEvent('=> onColumnMovingEnd');
    }

    public onSorting(event: ISortingEventArgs) {
        event.cancel = this.$sorting;
        this.logAnEvent('=> sorting', event.cancel);
    }
    public onSortingDone(_event: ISortingExpression) {
        this.logAnEvent(`=> onSortingDone`);
    }

    public onFiltering(event: IFilteringEventArgs) {
        event.cancel = this.$filtering;
        this.logAnEvent('=> filtering', event.cancel);
    }
    public onFilteringDone(_event: FilteringExpressionsTree) {
        this.logAnEvent(`=> onFilteringDone`);
    }

    public paging(event: IPagingEventArgs) {
        event.cancel = this.$paging;
        this.logAnEvent(`=> paging`, event.cancel);
    }
    public pagingDone(event: IPagingDoneEventArgs) {
        this.logAnEvent(`=> pagingDone`);
        this.paginator.paginate(event.newPage);
    }

    public onColumnPinning(event: IPinColumnCancellableEventArgs) {
        event.cancel = this.$pinning;
        this.logAnEvent('=> onColumnPinning', event.cancel);
    }
    public columnPinned(_event: IPinColumnEventArgs) {
        this.logAnEvent(`=> columnPinned`);
    }

    public columnVisibilityChanging(event: IColumnVisibilityChangingEventArgs ) {
        event.cancel = this.$hiding;
        this.logAnEvent('=> columnVisibilityChanging', event.cancel);
    }
    public onColumnVisibilityChanged(_event: IColumnVisibilityChangedEventArgs) {
        this.logAnEvent(`=> onColumnVisibilityChanged`);
    }

    public onColumnResized(_event: IColumnResizeEventArgs) {
        this.logAnEvent(`=> onColumnResized`);
    }

    public onColumnSelectionChange(event: IColumnSelectionEventArgs) {
        event.cancel = this.$onColumnSelectionChange;
        this.logAnEvent('=> onColumnSelectionChanging', event.cancel);
    }

    public clearLog() {
        const  elements = this.logger.nativeElement.querySelectorAll('p');
        for (const element of elements) {
            this.renderer.removeChild(this.logger.nativeElement, element);
          }
    }

    private logAnEvent(msg: string, cancelled?: boolean) {
        const createElem = this.renderer.createElement('p');
        if (cancelled) {
            msg = msg.concat(': cancelled ');
        }

        const text = this.renderer.createText(msg);
        this.renderer.appendChild(createElem, text);
        const container = this.logger.nativeElement;
        this.renderer.insertBefore(container, createElem, container.children[0]);
    }
}
