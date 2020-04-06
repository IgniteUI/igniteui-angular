import { Component, QueryList, Input, ContentChildren, AfterContentInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { IgxSplitterPaneComponent } from './splitter-pane/splitter-pane.component';

/**
 * An enumeration that defines the `SplitterComponent` panes orientation.
 * @export
 * @enum {number}
 */
export enum SplitterType {
    Horizontal,
    Vertical
}

/**
 * Provides reference to `SplitterComponent` component.
 * The splitter consists of resizable panes that can be arranged either vertically or horizontally.
 * There is a gripper between each couple of panes that helps widen or shrink them.
 * @export
 * @class SplitterComponent
 * @implements AfterContentInit
 */
@Component({
    selector: 'igx-splitter',
    templateUrl: './splitter.component.html'
})
export class IgxSplitterComponent implements AfterContentInit {
    private _type: SplitterType = SplitterType.Vertical;
    /**
     * Sets/gets `SplitterComponent` orientation.
     * @type SplitterType
     * @memberof SplitterComponent
     */
    @Input()
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
        if (this.panes) {
            // if type is changed runtime, should reset sizes.
            this.panes.forEach(x => x.size = 'auto');
        }
    }

    @Output()
    public panesChange = new EventEmitter<IgxSplitterPaneComponent[]>();

    /**
     * A list of all `IgxSplitterPaneComponent` items.
     * @memberof SplitterComponent
     */
    @ContentChildren(IgxSplitterPaneComponent, { read: IgxSplitterPaneComponent })
    public panes!: QueryList<IgxSplitterPaneComponent>;

    /**
     * Gets the `flex-direction` property of the current `SplitterComponent`.
     * @readonly
     * @type string
     * @memberof SplitterComponent
     */
    @HostBinding('style.flex-direction')
    public get direction(): string {
        return this.type === SplitterType.Horizontal ? 'row' : 'column';
    }

    /**
     * Sets/gets the `overflow` property of the current `SplitterComponent`.
     * @memberof SplitterComponent
     */
    @HostBinding('style.overflow')
    public overflow = 'hidden';

    /**
     * Sets/gets the `display` property of the current `SplitterComponent`.
     * @memberof SplitterComponent
     */
    @HostBinding('style.display')
    public display = 'flex';

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
     * The main `IgxSplitterPaneComponent` in each couple of panes devided by a gripper.
     * @private
     * @memberof SplitterComponent
     */
    private pane!: IgxSplitterPaneComponent;

    /**
     * The sibling `IgxSplitterPaneComponent` in each couple of panes devided by a gripper.
     * @private
     * @memberof SplitterComponent
     */
    private sibling!: IgxSplitterPaneComponent;

    public ngAfterContentInit(): void {
        this.assignFlexOrder();
        this.panes.changes.subscribe(() => {
            requestAnimationFrame(() => {
                this.panesChange.emit(this.panes.toArray());
                this.assignFlexOrder();
            });
        });
    }

    /**
     * This method performs some initialization logic when the user starts dragging the gripper between each couple of panes.
     * @param  {IgxSplitterPaneComponent} pane
     * The main `IgxSplitterPaneComponent` associated with the currently dragged `SplitBarComponent`.
     * @return {void}@memberof SplitterComponent
     */
    public onMoveStart(pane: IgxSplitterPaneComponent) {
        const panes = this.panes.toArray();
        this.pane = pane;
        this.sibling = panes[panes.indexOf(this.pane) + 1];

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

    /**
     * This method performs some calculations concerning the sizes each couple of panes while the gripper between them is being dragged.
     * @param  {number} delta The differnce along the X (or Y) axis between the initial and the current point while dragging the gripper.
     * @return {void}@memberof SplitterComponent
     */
    public onMoving(delta: number) {
        const min = parseInt(this.pane.minSize, 10) || 0;
        const max = parseInt(this.pane.maxSize, 10) || this.initialPaneSize + this.initialSiblingSize;
        const minSibling = parseInt(this.sibling.minSize, 10) || 0;
        const maxSibling = parseInt(this.sibling.maxSize, 10) || this.initialPaneSize + this.initialSiblingSize;

        const paneSize = this.initialPaneSize - delta;
        const siblingSize = this.initialSiblingSize + delta;
        if (paneSize < min || paneSize > max || siblingSize < minSibling || siblingSize > maxSibling) {
            return;
        }

        this.pane.size = paneSize + 'px';
        this.sibling.size = siblingSize + 'px';
    }

    /**
     * This method performs the toggling of the pane visibility
     * @param pane
     */
    public onToggling(pane: IgxSplitterPaneComponent) {
        if (!pane) {
            return;
        }
        pane.hidden = !pane.hidden;
        pane.resizable = !pane.hidden;
        pane.onPaneToggle.emit(pane);
    }

    /**
     * This method takes care for assigning an `order` property on each `IgxSplitterPaneComponent`.
     * @private
     * @return {void}@memberof SplitterComponent
     */
    private assignFlexOrder() {
        let k = 0;
        this.panes.forEach((pane: IgxSplitterPaneComponent) => {
            pane.order = k;
            k += 2;
        });
    }

    /** @hidden @internal */
    public getPaneSiblingsByOrder(order: number, barIndex: number): Array<IgxSplitterPaneComponent> {
        const panes = this.panes.toArray();
        const prevPane = panes[order - barIndex - 1];
        const nextPane = panes[order - barIndex];
        const siblings = [prevPane, nextPane];
        return siblings;
    }
}
