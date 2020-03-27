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

    public onDragStart(event: IDragStartEventArgs) {
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

}
