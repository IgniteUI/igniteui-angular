import { Component, Input, HostBinding, EventEmitter, Output } from '@angular/core';
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
     * An event that is emitted when collapsing the pane
     */
    @Output()
    public collapse = new EventEmitter<IgxSplitterPaneComponent>();

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

    get prevButtonHidden() {
        const isPaneHidden = this.pane.hidden;
        return isPaneHidden ? true : false;
    }

    get nextButtonHidden() {
        const isSiblingHidden = this.siblings[0].hidden;
        return isSiblingHidden ? true : false;
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

    public onCollapsing(event: any) {
        const arrowElement = event.srcElement;
        const direction = arrowElement.innerText === 'arrow_left' || arrowElement.innerText === 'arrow_drop_up' ? 0 : 1;
        let _pane = null;
        const sibling = this.siblings[0];
        if (!direction) {
            if (!this.pane.hidden || !sibling.hidden) {
                if (sibling.hidden) {
                    _pane = sibling;
                } else {
                    if (!this.pane.hidden) {
                       _pane = this.pane;
                    }
                }
            }
        } else {
            _pane = !this.pane.hidden ? sibling : this.pane;
        }
        this.collapse.emit(_pane);
    }
}
