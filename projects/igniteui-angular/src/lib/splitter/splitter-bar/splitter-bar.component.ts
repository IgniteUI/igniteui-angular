import { Component, Input, HostBinding, EventEmitter, Output, HostListener } from '@angular/core';
import { SplitterType } from '../splitter.component';
import { IgxSplitterPaneComponent } from '../splitter-pane/splitter-pane.component';
import { IDragMoveEventArgs, IDragStartEventArgs, DragDirection } from '../../directives/drag-drop/drag-drop.directive';


export const SPLITTER_INTERACTION_KEYS = new Set('right down left up arrowright arrowdown arrowleft arrowup'.split(' '));

/**
 * Provides reference to `SplitBarComponent` component.
 * Represents the draggable gripper that visually separates panes and allows for changing their sizes.
 * @export
 * @class SplitBarComponent
 */
@Component({
    selector: 'igx-splitter-bar',
    templateUrl: './splitter-bar.component.html'
})
export class IgxSplitBarComponent {

    /**
     * Sets/gets `IgxSplitBarComponent` orientation.
     * @type SplitterType
     */
    @Input()
    public type: SplitterType = SplitterType.Vertical;

    /**
     * Sets/gets `IgxSplitBarComponent` element order.
     * @type SplitterType
     */
    @HostBinding('style.order')
    @Input()
    public order!: number;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

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
     * @memberof SplitBarComponent
     */
    @Output()
    public moveStart = new EventEmitter<IgxSplitterPaneComponent>();

    /**
     * An event that is emitted while we are dragging the current `SplitBarComponent`.
     * @memberof SplitBarComponent
     */
    @Output()
    public moving = new EventEmitter<number>();

    /**
     * An event that is emitted when collapsing the pane
     */
    @Output()
    public togglePane = new EventEmitter<IgxSplitterPaneComponent>();
    /**
     * A temporary holder for the pointer coordinates.
     * @private
     * @memberof SplitBarComponent
     */
    private startPoint!: number;

    /**
     * @hidden @internal
     */
    public get prevButtonHidden() {
        return this.siblings[0].hidden && !this.siblings[1].hidden;
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
                        if (!this.resizeDisallowed && !this.panesHidden) {
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
                        if (!this.resizeDisallowed && !this.panesHidden) {
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
                        if (!this.resizeDisallowed && !this.panesHidden) {
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
                        if (!this.resizeDisallowed && !this.panesHidden) {
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
        return this.siblings[1].hidden && !this.siblings[0].hidden;
    }

    public onDragStart(event: IDragStartEventArgs) {
        if (this.resizeDisallowed || this.panesHidden) {
            event.cancel = true;
            return;
        }
        this.startPoint = this.type === SplitterType.Horizontal ? event.startX : event.startY;
        this.moveStart.emit(this.pane);
    }

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

    protected get resizeDisallowed() {
        const relatedTabs = this.siblings;
        return !!relatedTabs.find(x => x.resizable === false);
    }

    protected get panesHidden() {
        const relatedTabs = this.siblings;
        return !!relatedTabs.find(x => x.hidden === true);
    }

    public onCollapsing(next: boolean) {
        const prevSibling = this.siblings[0];
        const nextSibling = this.siblings[1];
        let target;
        if (next) {
            // if next is clicked when prev pane is hidden, show prev pane, else hide next pane.
            target = prevSibling.hidden ? prevSibling : nextSibling;
        } else {
            // if prev is clicked when next pane is hidden, show next pane, else hide prev pane.
            target = nextSibling.hidden ? nextSibling : prevSibling;
        }
        this.togglePane.emit(target);
    }
}
