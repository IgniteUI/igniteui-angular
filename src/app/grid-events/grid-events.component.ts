import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { IgxGridComponent,
    ISortingExpression, IPinColumnEventArgs,
    IColumnResizeEventArgs, IColumnSelectionEventArgs, IPageEventArgs, ISortingEventArgs,
    IFilteringEventArgs, IgxStringFilteringOperand, IColumnMovingEndEventArgs,
    IColumnMovingEventArgs, IColumnMovingStartEventArgs, IPinColumnCancellableEventArgs,
    IColumnVisibilityChangingEventArgs,
    IFilteringExpressionsTree,
    IColumnVisibilityChangedEventArgs
} from 'igniteui-angular';
import { data } from '../shared/data';

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

    public columnMovingStart(event: IColumnMovingStartEventArgs) {
        console.log('event' + event);
        this.logAnEvent('=> columnMovingStart');
    }
    public columnMoving(event: IColumnMovingEventArgs) {
        event.cancel = this.$moving;
        this.logAnEvent(event.cancel ? '=> columnMoving cancelled' : '=> columnMoving');
    }
    public columnMovingEnd(event: IColumnMovingEndEventArgs) {
        console.log('event' + event);
        this.logAnEvent('=> columnMovingEnd');
    }

    public onSorting(event: ISortingEventArgs) {
        event.cancel = this.$sorting;
        this.logAnEvent('=> sorting', event.cancel);
    }
    public sortingDone(event: ISortingExpression | ISortingExpression []) {
        console.log('event' + event);
        this.logAnEvent(`=> sortingDone`);
    }

    public onFiltering(event: IFilteringEventArgs) {
        event.cancel = this.$filtering;
        this.logAnEvent('=> filtering', event.cancel);
    }
    public filteringDone(event: IFilteringExpressionsTree) {
        console.log('event' + event);
        this.logAnEvent(`=> filteringDone`);
    }
    public pagingDone(event: IPageEventArgs) {
        console.log('event' + event);
        this.logAnEvent(`=> pagingDone`);
    }

    public columnPin(event: IPinColumnCancellableEventArgs) {
        event.cancel = this.$pinning;
        this.logAnEvent('=> columnPin', event.cancel);
    }
    public columnPinned(event: IPinColumnEventArgs) {
        console.log('event' + event);
        this.logAnEvent(`=> columnPinned`);
    }

    public columnVisibilityChanging(event: IColumnVisibilityChangingEventArgs ) {
        event.cancel = this.$hiding;
        this.logAnEvent('=> columnVisibilityChanging', event.cancel);
    }
    public columnVisibilityChanged(event: IColumnVisibilityChangedEventArgs) {
        console.log('event' + event);
        this.logAnEvent(`=> columnVisibilityChanged`);
    }

    public columnResized(event: IColumnResizeEventArgs) {
        console.log('event' + event);
        this.logAnEvent(`=> columnResized`);
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

