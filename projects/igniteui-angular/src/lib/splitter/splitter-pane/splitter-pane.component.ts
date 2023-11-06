import { Component, HostBinding, Input, ElementRef, Output, EventEmitter, booleanAttribute } from '@angular/core';

/**
 * Represents individual resizable/collapsible panes.
 *
 * @igxModule IgxSplitterModule
 *
 * @igxParent IgxSplitterComponent
 *
 * @igxKeywords pane
 *
 * @igxGroup presentation
 *
 * @remarks
 *  Users can control the resize behavior via the min and max size properties.
 */
@Component({
    selector: 'igx-splitter-pane',
    templateUrl: './splitter-pane.component.html',
    standalone: true
})
export class IgxSplitterPaneComponent {
    private _minSize: string;
    private _maxSize: string;

    /**
     * @hidden @internal
     * Gets/Sets the 'display' property of the current pane.
     */
    @HostBinding('style.display')
    public display = 'flex';

    /**
     * Gets/Sets the minimum allowed size of the current pane.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane [minSize]='minSize'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Input()
    public get minSize(): string {
        return this._minSize;
    }
    public set minSize(value: string) {
        this._minSize = value;
        if (this.owner) {
            this.owner.panes.notifyOnChanges();
        }
    }

    /**
     * Gets/Set the maximum allowed size of the current pane.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane [maxSize]='maxSize'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Input()
    public get maxSize(): string {
        return this._maxSize;
    }
    public set maxSize(value: string) {
        this._maxSize = value;
        if (this.owner) {
            this.owner.panes.notifyOnChanges();
        }
    }

    /**
     * Gets/Sets whether pane is resizable.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane [resizable]='false'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     * @remarks
     * If pane is not resizable its related splitter bar cannot be dragged.
     */
    @Input({ transform: booleanAttribute })
    public resizable = true;

    /**
     * Event fired when collapsed state of pane is changed.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane (collapsedChange)='paneCollapsedChange($event)'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Output()
    public collapsedChange = new EventEmitter<boolean>();

    /** @hidden @internal */
    @HostBinding('style.order')
    public order!: number;

    /**
     * @hidden @internal
     * Gets/Sets the `overflow`.
     */
    @HostBinding('style.overflow')
    public overflow = 'auto';

    /**
     * @hidden @internal
     * Get/Sets the `minWidth` properties of the current pane.
     */
    @HostBinding('style.min-width')
    public minWidth = '0';

    /**
     * @hidden @internal
     * Get/Sets the `maxWidth` properties of the current pane.
     */
    @HostBinding('style.max-width')
    public maxWidth = '100%';

    /**
     * @hidden @internal
     * Gets/Sets the `minHeight` properties of the current pane.
     */
    @HostBinding('style.min-height')
    public minHeight = '0';

    /**
     * @hidden @internal
     * Gets/Sets the `maxHeight` properties of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.max-height')
    public maxHeight = '100%';

    /** @hidden @internal */
    public owner;

    /**
     * Gets/Sets the size of the current pane.
     *  * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane [size]='size'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Input()
    public get size() {
        return this._size;
    }

    public set size(value) {
        this._size = value;
        this.el.nativeElement.style.flex = this.flex;
    }

    /** @hidden @internal */
    public get isPercentageSize() {
        return this.size === 'auto' || this.size.indexOf('%') !== -1;
    }

    /** @hidden @internal */
    public get dragSize() {
        return this._dragSize;
    }
    public set dragSize(val) {
        this._dragSize = val;
        this.el.nativeElement.style.flex = this.flex;
    }

    /**
     *
     * @hidden @internal
     * Gets the host native element.
     */
    public get element(): any {
        return this.el.nativeElement;
    }

    /**
     * @hidden @internal
     * Gets the `flex` property of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.flex')
    public get flex() {
        const size = this.dragSize || this.size;
        const grow = this.isPercentageSize && !this.dragSize ? 1 : 0;
        return `${grow} ${grow} ${size}`;
    }

    /**
     * Gets/Sets whether current pane is collapsed.
     *
     * @example
     * ```typescript
     * const isCollapsed = pane.collapsed;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public set collapsed(value) {
        if (this.owner) {
            // reset sibling sizes when pane collapse state changes.
            this._getSiblings().forEach(sibling => {
                sibling.size = 'auto'
                sibling.dragSize = null;
            });
        }
        this._collapsed = value;
        this.display = this._collapsed ? 'none' : 'flex';
        this.collapsedChange.emit(this._collapsed);
    }

    public get collapsed() {
        return this._collapsed;
    }

    private _size = 'auto';
    private _dragSize;
    private _collapsed = false;


    constructor(private el: ElementRef) { }

    /**
     * Toggles the collapsed state of the pane.
     *
     * @example
     * ```typescript
     * pane.toggle();
     * ```
     */
    public toggle() {
        this.collapsed = !this.collapsed;
    }

    /** @hidden @internal */
    private _getSiblings() {
        const panes = this.owner.panes.toArray();
        const index = panes.indexOf(this);
        const siblings = [];
        if (index !== 0) {
            siblings.push(panes[index - 1]);
        }
        if (index !== panes.length - 1) {
            siblings.push(panes[index + 1]);
        }
        return siblings;
    }
}
