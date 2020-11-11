import { Component, QueryList, Input, ContentChildren, AfterContentInit, HostBinding, Output, EventEmitter, Inject, ElementRef } from '@angular/core';
import { IgxSplitterPaneComponent } from './splitter-pane/splitter-pane.component';
import { DOCUMENT } from '@angular/common';

/**
 * An enumeration that defines the `SplitterComponent` panes orientation.
 */
export enum SplitterType {
    Horizontal,
    Vertical
}

/**
 * Provides a framework for a simple layout, splitting the view horizontally or vertically
 * into multiple smaller resizable and collapsible areas.
 * @igxModule IgxSplitterModule
 *
 * @igxParent Layouts
 *
 * @igxTheme igx-splitter-theme
 *
 * @igxKeywords splitter panes layout
 *
 * @igxGroup presentation
 *
 * @example
 * ```html
 * <igx-splitter>
 *  <igx-splitter-pane>
 *      ...
 *  </igx-splitter-pane>
 *  <igx-splitter-pane>
 *      ...
 *  </igx-splitter-pane>
 * </igx-splitter>
 * ```
 */
@Component({
    selector: 'igx-splitter',
    templateUrl: './splitter.component.html'
})
export class IgxSplitterComponent implements AfterContentInit {
    private _type: SplitterType = SplitterType.Horizontal;

    constructor(@Inject(DOCUMENT) public document, private elementRef: ElementRef) {}
    /**
     * Gets/Sets the splitter orientation.
     * @example
     * ```html
     * <igx-splitter [type]="type">...</igx-splitter>
     * ```
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

    /**
     * Gets the list of splitter panes.
     * @example
     * ```typescript
     * const panes = this.splitter.panes;
     * ```
     */
    @ContentChildren(IgxSplitterPaneComponent, { read: IgxSplitterPaneComponent })
    public panes!: QueryList<IgxSplitterPaneComponent>;

    /**
     * @hidden @internal
     * Gets the `flex-direction` property of the current `SplitterComponent`.
     */
    @HostBinding('style.flex-direction')
    public get direction(): string {
        return this.type === SplitterType.Horizontal ? 'row' : 'column';
    }

    /**
     * @hidden @internal
     * Gets/Sets the `overflow` property of the current splitter.
     */
    @HostBinding('style.overflow')
    public overflow = 'hidden';

    /**
     * @hidden @internal
     * Sets/Gets the `display` property of the current splitter.
     */
    @HostBinding('style.display')
    public display = 'flex';

    /**
     * @hidden @internal
     * A field that holds the initial size of the main `IgxSplitterPaneComponent` in each pair of panes divided by a splitter bar.
     */
    private initialPaneSize!: number;

    /**
     * @hidden @internal
     * A field that holds the initial size of the sibling pane in each pair of panes divided by a gripper.
     * @memberof SplitterComponent
     */
    private initialSiblingSize!: number;

    /**
     * @hidden @internal
     * The main pane in each pair of panes divided by a gripper.
     */
    private pane!: IgxSplitterPaneComponent;

    /**
     * The sibling pane in each pair of panes divided by a splitter bar.
     */
    private sibling!: IgxSplitterPaneComponent;

    /** @hidden @internal */
    public ngAfterContentInit(): void {
        this.panes.forEach(pane => pane.owner = this);
        this.assignFlexOrder();
        this.panes.changes.subscribe(() => {
            this.panes.forEach(pane => pane.owner = this);
            this.assignFlexOrder();
        });
    }

    /**
     * @hidden @internal
     * This method performs  initialization logic when the user starts dragging the splitter bar between each pair of panes.
     * @param pane - the main pane associated with the currently dragged bar.
     */
    public onMoveStart(pane: IgxSplitterPaneComponent) {
        const panes = this.panes.toArray();
        this.pane = pane;
        this.sibling = panes[panes.indexOf(this.pane) + 1];

        const paneRect = this.pane.element.getBoundingClientRect();
        this.initialPaneSize = this.type === SplitterType.Horizontal ? paneRect.width : paneRect.height;

        const siblingRect = this.sibling.element.getBoundingClientRect();
        this.initialSiblingSize = this.type === SplitterType.Horizontal ? siblingRect.width : siblingRect.height;
    }

    /**
     * @hidden @internal
     * This method performs calculations concerning the sizes of each pair of panes when the bar between them is dragged.
     * @param delta - The difference along the X (or Y) axis between the initial and the current point when dragging the bar.
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
        this.pane.dragSize = paneSize + 'px';
        this.sibling.dragSize = siblingSize + 'px';
    }

    public onMoveEnd(delta: number) {
        const paneSize = this.initialPaneSize - delta;
        const siblingSize = this.initialSiblingSize + delta;
        if (this.pane.isPercentageSize) {
            // handle % resizes
            const totalSize = this.getTotalSize();
            const percentPaneSize = (paneSize / totalSize) * 100;
            this.pane.size = percentPaneSize + '%';
        } else {
            // px resize
            this.pane.size = paneSize + 'px';
        }

        if (this.sibling.isPercentageSize) {
            // handle % resizes
            const totalSize = this.getTotalSize();
            const diffPercentage = (delta / totalSize) * 100;
            const percentSiblingPaneSize =  (siblingSize / totalSize) * 100;
            this.sibling.size = percentSiblingPaneSize + '%';
        } else {
            // px resize
            this.sibling.size = siblingSize + 'px';
        }
        this.pane.dragSize = null;
        this.sibling.dragSize = null;
    }

    private getTotalSize() {
        const computed = this.document.defaultView.getComputedStyle(this.elementRef.nativeElement);
        const totalSize = this.type === SplitterType.Horizontal ? computed.getPropertyValue('width') : computed.getPropertyValue('height');
        return parseFloat(totalSize);
    }


    /**
     * @hidden @internal
     * This method assigns the order of each pane.
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
