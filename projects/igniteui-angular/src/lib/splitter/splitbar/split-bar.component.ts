import { Component, Input, HostBinding, EventEmitter, Output } from '@angular/core';
import { SplitterType } from '../splitter.component';
import { IgxSplitterPaneComponent } from '../splitpane/split-pane.component';

/**
 * Provides reference to `SplitBarComponent` component.
 * Represents the draggable gripper that visually separates panes and allows for changing their sizes.
 * @export
 * @class SplitBarComponent
 */
@Component({
    selector: 'igx-split-bar',
    styleUrls: ['./split-bar.component.scss'],
    templateUrl: './split-bar.component.html'
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
    @HostBinding('style.cursor')
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

    /**
     * A temporary holder for the pointer coordinates.
     * @private
     * @memberof SplitBarComponent
     */
    private startPoint!: number;

    /**
     * A method that handles the `PoinerDown` event firing.
     * @param  {PointerEvent} event The `PoinerDown` event payload.
     * @return {void}@memberof SplitBarComponent
     */
    public onPointerDown(event: PointerEvent) {
        this.startPoint = this.type === SplitterType.Horizontal ? event.clientX : event.clientY;
        this.moveStart.emit(this.pane);
    }

    /**
     * A method that handles the `PoinerMove` event firing.
     * @param  {PointerEvent} event The `PoinerMove` event payload.
     * @return {void}@memberof SplitBarComponent
     */
    public onPointerMove(event: PointerEvent) {
        const delta = this.startPoint - (this.type === SplitterType.Horizontal ? event.clientX : event.clientY);
        this.moving.emit(delta);
    }
}
