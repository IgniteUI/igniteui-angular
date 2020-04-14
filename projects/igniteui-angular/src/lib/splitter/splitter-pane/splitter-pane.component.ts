import { Component, HostBinding, Input, ElementRef, Output, EventEmitter } from '@angular/core';

/**
 * Provides reference to `SplitPaneComponent` component.
 * Represents individual resizable panes. Users can control the resize behavior via the min and max size properties.
 * @export
 * @class SplitPaneComponent
 */
@Component({
    selector: 'igx-splitter-pane',
    templateUrl: './splitter-pane.component.html'
})
export class IgxSplitterPaneComponent {

    private _size = 'auto';
    private _collapsed = false;
    public owner;

    /**
     * Sets/gets the size of the current `IgxSplitterPaneComponent`.
     */
    @Input()
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
        this.el.nativeElement.style.flex = this.flex;
    }

    /**
     * Sets/gets the minimum allowable size of the current `IgxSplitterPaneComponent`.
     */
    @Input()
    public minSize!: string;

    /**
     * Sets/gets the maximum allowable size of the current `IgxSplitterPaneComponent`.
     */
    @Input()
    public maxSize!: string;

    /**
     * Sets/Gets whether pane is resizable.
     */
    @Input()
    public resizable = true;

    /**
     * Event fired when collapsed state of pane is changed.
     */
    @Output()
    public onToggle = new EventEmitter<IgxSplitterPaneComponent>();


    /** @hidden @internal */
    @HostBinding('style.order')
    public order!: number;

    /**
     * Gets the host native element.
     * @readonly
     * @type *
     */
    public get element(): any {
        return this.el.nativeElement;
    }

    /**
     * Sets/gets the `overflow` property of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.overflow')
    public overflow = 'auto';

    /**
     * Sets/gets the `minHeight` and `minWidth` propertis of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.min-height')
    @HostBinding('style.min-width')
    public minHeight = 0;

    /**
     * Sets/gets the `maxHeight` and `maxWidth` propertis of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.max-height')
    @HostBinding('style.max-width')
    public maxHeight = '100%';

    /**
     * Gets the `flex` property of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.flex')
    public get flex() {
        const grow = this.size !== 'auto' ? 0 : 1;
        const shrink = this.size !== 'auto' ? 0 : 1;

        return `${grow} ${shrink} ${this.size}`;
    }

    /**
     * Sets/gets the 'display' property of the current `IgxSplitterPaneComponent`
     */
    @HostBinding('style.display')
    public display = 'flex';

    /**
     * Sets/gets whether current pane is collapsed.
     */
    @Input()
    public set collapsed(value) {
        this._collapsed = value;
        this.display = this._collapsed ? 'none' : 'flex' ;
    }

    public get collapsed() {
        return this._collapsed;
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

    /**
     * Toggles the collapsed state of the pane.
     */
    public toggle() {
        // reset sibling sizes when pane collapse state changes.
        this._getSiblings().forEach(sibling => sibling.size = 'auto');
        this.collapsed = !this.collapsed;
        this.resizable = !this.collapsed;
        this.onToggle.emit(this);
    }

    constructor(private el: ElementRef) { }
}
