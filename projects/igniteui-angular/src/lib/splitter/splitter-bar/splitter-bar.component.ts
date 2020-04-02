import { Component, Input, HostBinding, EventEmitter, Output, HostListener } from '@angular/core';
import { SplitterType } from '../splitter.component';
import { IgxSplitterPaneComponent } from '../splitter-pane/splitter-pane.component';
import { IDragMoveEventArgs, IDragStartEventArgs } from '../../directives/drag-drop/drag-drop.directive';

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
     * Gets the cursor associated with the current `SplitBarComponent`.
     * @readonly
     * @type string
     * @memberof SplitBarComponent
     */
    public get cursor(): string {
        return this.type === SplitterType.Horizontal ? 'col-resize' : 'row-resize';
    }

    /**
     * Sets/gets the `display` property of the current `SplitBarComponent`.
     * @memberof SplitBarComponent
     */
    @HostBinding('style.display')
    public display = 'flex';

    /**
     * Gets the `flex-direction` property of the current `SplitBarComponent`.
     * @readonly
     * @type string
     * @memberof SplitBarComponent
     */
    public get direction(): string {
        return this.type === SplitterType.Horizontal ? 'column' : 'row';
    }

    get collapseNextIcon() {
        return this.type === SplitterType.Horizontal ? 'arrow_right' : 'arrow_drop_down';
    }

    get collapsePrevIcon() {
        return this.type === SplitterType.Horizontal ? 'arrow_left' : 'arrow_drop_up';
    }

    /**
     * A temporary holder for the pointer coordinates.
     * @private
     * @memberof SplitBarComponent
     */
    private startPoint!: number;

        /**
     * A field that holds the initial size of the main `IgxSplitterPaneComponent` in each couple of panes devided by a gripper.
     * @private
     * @memberof SplitterComponent
     */
    private initialPaneSize!: number;

    /**
     * A field that holds the initial size of the sibling `IgxSplitterPaneComponent` in each couple of panes devided by a gripper.
     * @private
     * @memberof SplitterComponent
     */
    private initialSiblingSize!: number;

    /**
     * The sibling `IgxSplitterPaneComponent` in each couple of panes devided by a gripper.
     * @private
     * @memberof SplitterComponent
     */
    private sibling!: IgxSplitterPaneComponent;

    /**
    * @hidden
    * @internal
    */
    @HostListener('keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
        const key = event.code.toLowerCase();
        event.stopPropagation();
        if (this.pane.resizable && this.siblings[0].resizable) {
            switch (key) {
                case 'arrowup':
                    if (this.type === 1) {
                        event.preventDefault();
                        this.moveUpOrLeft();
                    }
                    break;
                case 'arrowdown':
                    if (this.type === 1) {
                        event.preventDefault();
                        this.moveDownOrRight();
                    }
                    break;
                case 'arrowleft':
                    if (this.type === 0) {
                        event.preventDefault();
                        this.moveUpOrLeft();
                    }
                    break;
                case 'arrowright':
                    if (this.type === 0) {
                        event.preventDefault();
                        this.moveDownOrRight();
                    }
                    break;
                default:
                    break;
            }
        }
    }

    public onDragStart(event: IDragStartEventArgs) {
        if (this.resizeDisallowed) {
            event.cancel = true;
            return;
        }
        this.startPoint = this.type === SplitterType.Horizontal ? event.startX : event.startY;
        this.moveStart.emit(this.pane);
    }

    public onDragMove(event: IDragMoveEventArgs) {
        const isHorizontal = this.type === SplitterType.Horizontal;
        const curr =  isHorizontal ? event.pageX : event.pageY;
        if (isHorizontal) {
            event.nextPageY = event.pageY;
        } else {
            event.nextPageX = event.pageX;
        }
        const delta = this.startPoint - curr;
        if (delta !== 0 ) {
            this.moving.emit(delta);
            event.cancel = true;
            event.owner.element.nativeElement.style.transform = '';
        }
    }

    protected get resizeDisallowed() {
        const relatedTabs = [this.pane, ... this.siblings];
        return !!relatedTabs.find(x => x.resizable === false);
    }

    private moveUpOrLeft() {
        this.panesInitialization();

        const min = parseInt(this.pane.minSize, 10) || 0;
        const max = parseInt(this.pane.maxSize, 10) || this.initialPaneSize + this.initialSiblingSize;
        const minSibling = parseInt(this.sibling.minSize, 10) || 0;
        const maxSibling = parseInt(this.sibling.maxSize, 10) || this.initialPaneSize + this.initialSiblingSize;

        const paneSize = this.initialPaneSize - 10;
        const siblingSize = this.initialSiblingSize + 10;
        if (paneSize < min || paneSize > max || siblingSize < minSibling || siblingSize > maxSibling) {
            return;
        }

        this.pane.size = paneSize + 'px';
        this.sibling.size = siblingSize + 'px';
    }

    private moveDownOrRight() {
        this.panesInitialization();

        const min = parseInt(this.pane.minSize, 10) || 0;
        const max = parseInt(this.pane.maxSize, 10) || this.initialPaneSize + this.initialSiblingSize;
        const minSibling = parseInt(this.sibling.minSize, 10) || 0;
        const maxSibling = parseInt(this.sibling.maxSize, 10) || this.initialPaneSize + this.initialSiblingSize;

        const paneSize = this.initialPaneSize + 10;
        const siblingSize = this.initialSiblingSize - 10;
        if (paneSize < min || paneSize > max || siblingSize < minSibling || siblingSize > maxSibling) {
            return;
        }

        this.pane.size = paneSize + 'px';
        this.sibling.size = siblingSize + 'px';
    }

    private panesInitialization() {
        this.sibling = this.siblings[0];

        const paneRect = this.pane.element.getBoundingClientRect();
        this.initialPaneSize = this.type === SplitterType.Horizontal ? paneRect.width : paneRect.height;
        if (this.pane.size === 'auto') {
            this.pane.size = this.type === SplitterType.Horizontal ? paneRect.width : paneRect.height;
        }

        const siblingRect = this.sibling.element.getBoundingClientRect();
        this.initialSiblingSize = this.type === SplitterType.Horizontal ? siblingRect.width : siblingRect.height;
        if (this.sibling.size === 'auto') {
            this.sibling.size = this.type === SplitterType.Horizontal ? siblingRect.width : siblingRect.height;
        }
    }
}
