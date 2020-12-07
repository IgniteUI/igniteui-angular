import {Component, EventEmitter, HostBinding, HostListener, Input, Output} from '@angular/core';
import {SplitterType} from '../splitter.component';
import {IgxSplitterPaneComponent} from '../splitter-pane/splitter-pane.component';
import {DragDirection, IDragMoveEventArgs, IDragStartEventArgs} from '../../directives/drag-drop/drag-drop.directive';


export const SPLITTER_INTERACTION_KEYS = new Set('right down left up arrowright arrowdown arrowleft arrowup'.split(' '));

/**
 * @hidden @internal
 * Represents the draggable bar that visually separates panes and allows for changing their sizes.
 */
@Component({
    selector: 'igx-splitter-bar',
    templateUrl: './splitter-bar.component.html'
})
export class IgxSplitBarComponent {
    /**
     * Set css class to the host element.
     */
    @HostBinding('class.igx-splitter-bar-host')
    public cssClass = 'igx-splitter-bar-host';

    /**
     * Gets/Sets the orientation.
     */
    @Input()
    public type: SplitterType = SplitterType.Horizontal;

    /**
     * Sets/gets the element order.
     */
    @HostBinding('style.order')
    @Input()
    public order!: number;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.tabindex')
    public get tabindex() {
        return this.resizeDisallowed ? null : 0;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.aria-orientation')
    public get orientation() {
        return this.type === SplitterType.Horizontal ? 'horizontal' : 'vertical';
    }

    /**
     * @hidden
     * @internal
     */
    public get cursor() {
        if (this.resizeDisallowed) {
            return '';
        }
        return this.type === SplitterType.Horizontal ? 'col-resize' : 'row-resize';
    }

    /**
     * Sets/gets the `SplitPaneComponent` associated with the current `SplitBarComponent`.
     * @memberof SplitBarComponent
     */
    @Input()
    public pane!: IgxSplitterPaneComponent;

    /**
     * Sets/Gets the `SplitPaneComponent` sibling components associated with the current `SplitBarComponent`.
     */
    @Input()
    public siblings!: Array<IgxSplitterPaneComponent>;

    /**
     * An event that is emitted whenever we start dragging the current `SplitBarComponent`.
     */
    @Output()
    public moveStart = new EventEmitter<IgxSplitterPaneComponent>();

    /**
     * An event that is emitted while we are dragging the current `SplitBarComponent`.
     */
    @Output()
    public moving = new EventEmitter<number>();

    @Output()
    public movingEnd = new EventEmitter<number>();

    /**
     * A temporary holder for the pointer coordinates.
     */
    private startPoint!: number;

    /**
     * @hidden @internal
     */
    public get prevButtonHidden() {
        return this.siblings[0].collapsed && !this.siblings[1].collapsed;
    }

    /**
     * @hidden @internal
     */
    @HostListener('keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey;
        event.stopPropagation();
        if (SPLITTER_INTERACTION_KEYS.has(key)) {
            event.preventDefault();
        }
            switch (key) {
                case 'arrowup':
                case 'up':
                    if (this.type === SplitterType.Vertical) {
                        if (ctrl) {
                            this.onCollapsing(false);
                            break;
                        }
                        if (!this.resizeDisallowed) {
                            event.preventDefault();
                            this.moveStart.emit(this.pane);
                            this.moving.emit(10);
                        }
                    }
                    break;
                case 'arrowdown':
                case 'down':
                    if (this.type === SplitterType.Vertical) {
                        if (ctrl) {
                            this.onCollapsing(true);
                            break;
                        }
                        if (!this.resizeDisallowed) {
                            event.preventDefault();
                            this.moveStart.emit(this.pane);
                            this.moving.emit(-10);
                        }
                    }
                    break;
                case 'arrowleft':
                case 'left':
                    if (this.type === SplitterType.Horizontal) {
                        if (ctrl) {
                            this.onCollapsing(false);
                            break;
                        }
                        if (!this.resizeDisallowed) {
                            event.preventDefault();
                            this.moveStart.emit(this.pane);
                            this.moving.emit(10);
                        }
                    }
                    break;
                case 'arrowright':
                case 'right':
                    if (this.type === SplitterType.Horizontal) {
                        if (ctrl) {
                            this.onCollapsing(true);
                            break;
                        }
                        if (!this.resizeDisallowed) {
                            event.preventDefault();
                            this.moveStart.emit(this.pane);
                            this.moving.emit(-10);
                        }
                    }
                    break;
                default:
                    break;
            }
    }

    /**
     * @hidden @internal
     */
    public get dragDir() {
        return this.type === SplitterType.Horizontal ? DragDirection.VERTICAL : DragDirection.HORIZONTAL;
    }

    /**
     * @hidden @internal
     */
    public get nextButtonHidden() {
        return this.siblings[1].collapsed && !this.siblings[0].collapsed;
    }

    /**
     * @hidden @internal
     */
    public onDragStart(event: IDragStartEventArgs) {
        if (this.resizeDisallowed) {
            event.cancel = true;
            return;
        }
        this.startPoint = this.type === SplitterType.Horizontal ? event.startX : event.startY;
        this.moveStart.emit(this.pane);
    }

    /**
     * @hidden @internal
     */
    public onDragMove(event: IDragMoveEventArgs) {
        const isHorizontal = this.type === SplitterType.Horizontal;
        const curr =  isHorizontal ? event.pageX : event.pageY;
        const delta = this.startPoint - curr;
        if (delta !== 0) {
            this.moving.emit(delta);
            event.cancel = true;
            event.owner.element.nativeElement.style.transform = '';
        }
    }

    public onDragEnd(event: any) {
        const isHorizontal = this.type === SplitterType.Horizontal;
        const curr =  isHorizontal ? event.pageX : event.pageY;
        const delta = this.startPoint - curr;
        if (delta !== 0) {
            this.movingEnd.emit(delta);
        }
    }

    protected get resizeDisallowed() {
        const relatedTabs = this.siblings;
        return !!relatedTabs.find(x => x.resizable === false || x.collapsed === true);
    }

    /**
     * @hidden @internal
     */
    public onCollapsing(next: boolean) {
        const prevSibling = this.siblings[0];
        const nextSibling = this.siblings[1];
        let target;
        if (next) {
            // if next is clicked when prev pane is hidden, show prev pane, else hide next pane.
            target = prevSibling.collapsed ? prevSibling : nextSibling;
        } else {
            // if prev is clicked when next pane is hidden, show next pane, else hide prev pane.
            target = nextSibling.collapsed ? nextSibling : prevSibling;
        }
        target.toggle();
    }
}
