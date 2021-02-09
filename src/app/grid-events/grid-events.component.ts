import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { IgxGridComponent, FilteringExpressionsTree,
    ISortingExpression, IPinColumnEventArgs, IColumnVisibilityChangedEventArgs,
    IColumnResizeEventArgs, IColumnSelectionEventArgs, IPageEventArgs, ISortingEventArgs,
    IFilteringEventArgs, IgxStringFilteringOperand, IColumnMovingEndEventArgs,
    IColumnMovingEventArgs, IColumnMovingStartEventArgs, IPinColumnCancellableEventArgs,
    IColumnVisibilityChangingEventArgs } from 'igniteui-angular';
import { data } from '../grid-cellEditing/data';

@Component({
    selector: 'app-grid-events',
    styleUrls: ['grid-events.component.scss'],
    templateUrl: 'grid-events.component.html'
})
export class GridEventsComponent {

    @ViewChild('grid1', { read: IgxGridComponent, static: true }) public grid: IgxGridComponent;
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

    constructor(private renderer: Renderer2) {
        this.localData = data;
    }

    public filter(term) {
        this.grid.filter('ProductName', term, IgxStringFilteringOperand.instance().condition('contains'));
    }

    public filterGlobal(term) {
        this.grid.filterGlobal(term, IgxStringFilteringOperand.instance().condition('contains'));
    }

    public onColumnMovingStart(event: IColumnMovingStartEventArgs) {
        console.log('event' + event);
        this.logAnEvent('=> onColumnMovingStart');
    }
    public onColumnMoving(event: IColumnMovingEventArgs) {
        event.cancel = this.$moving;
        this.logAnEvent(event.cancel ? '=> onColumnMoving cancelled' : '=> onColumnMoving');
    }
    public onColumnMovingEnd(event: IColumnMovingEndEventArgs) {
        console.log('event' + event);
        this.logAnEvent('=> onColumnMovingEnd');
    }

    public onSorting(event: ISortingEventArgs) {
        event.cancel = this.$sorting;
        this.logAnEvent('=> sorting', event.cancel);
    }
    public onSortingDone(event: ISortingExpression) {
        console.log('event' + event);
        this.logAnEvent(`=> onSortingDone`);
    }

    public onFiltering(event: IFilteringEventArgs) {
        event.cancel = this.$filtering;
        this.logAnEvent('=> filtering', event.cancel);
    }
    public onFilteringDone(event: FilteringExpressionsTree) {
        console.log('event' + event);
        this.logAnEvent(`=> onFilteringDone`);
    }
    public onPagingDone(event: IPageEventArgs) {
        console.log('event' + event);
        this.logAnEvent(`=> onPagingDone`);
    }

    public onColumnPinning(event: IPinColumnCancellableEventArgs) {
        event.cancel = this.$pinning;
        this.logAnEvent('=> onColumnPinning', event.cancel);
    }
    public columnPinned(event: IPinColumnEventArgs) {
        console.log('event' + event);
        this.logAnEvent(`=> columnPinned`);
    }

    public columnVisibilityChanging(event: IColumnVisibilityChangingEventArgs ) {
        event.cancel = this.$hiding;
        this.logAnEvent('=> columnVisibilityChanging', event.cancel);
    }
    public onColumnVisibilityChanged(event: IColumnVisibilityChangedEventArgs) {
        this.logAnEvent(`=> onColumnVisibilityChanged`);
    }

    public onColumnResized(event: IColumnResizeEventArgs) {
        console.log('event' + event);
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

