import { DOCUMENT, NgFor, NgIf } from '@angular/common';
import { AfterContentInit, Component, ContentChildren, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, Output, QueryList, booleanAttribute, forwardRef } from '@angular/core';
import { DragDirection, IDragMoveEventArgs, IDragStartEventArgs, IgxDragDirective, IgxDragIgnoreDirective } from '../directives/drag-drop/drag-drop.directive';
import { IgxSplitterPaneComponent } from './splitter-pane/splitter-pane.component';

/**
 * An enumeration that defines the `SplitterComponent` panes orientation.
 */
export enum SplitterType {
    Horizontal,
    Vertical
}

export declare interface ISplitterBarResizeEventArgs {
    pane: IgxSplitterPaneComponent;
    sibling: IgxSplitterPaneComponent;
}

/**
 * Provides a framework for a simple layout, splitting the view horizontally or vertically
 * into multiple smaller resizable and collapsible areas.
 *
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
    templateUrl: './splitter.component.html',
    imports: [NgFor, NgIf, forwardRef(() => IgxSplitBarComponent)]
})
export class IgxSplitterComponent implements AfterContentInit {
    /**
     * Gets the list of splitter panes.
     *
     * @example
     * ```typescript
     * const panes = this.splitter.panes;
     * ```
     */
    @ContentChildren(IgxSplitterPaneComponent, { read: IgxSplitterPaneComponent })
    public panes!: QueryList<IgxSplitterPaneComponent>;

    /**
    * @hidden
    * @internal
    */
    @HostBinding('class.igx-splitter')
    public cssClass = 'igx-splitter';

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
     * @hidden
     * @internal
     */
    @HostBinding('attr.aria-orientation')
    public get orientation() {
        return this.type === SplitterType.Horizontal ? 'horizontal' : 'vertical';
    }

    /**
     * Event fired when resizing of panes starts.
     *
     * @example
     * ```html
     * <igx-splitter (resizeStart)='resizeStart($event)'>
     *  <igx-splitter-pane>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Output()
    public resizeStart = new EventEmitter<ISplitterBarResizeEventArgs>();

    /**
     * Event fired when resizing of panes is in progress.
     *
     * @example
     * ```html
     * <igx-splitter (resizing)='resizing($event)'>
     *  <igx-splitter-pane>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Output()
    public resizing = new EventEmitter<ISplitterBarResizeEventArgs>();


    /**
     * Event fired when resizing of panes ends.
     *
     * @example
     * ```html
     * <igx-splitter (resizeEnd)='resizeEnd($event)'>
     *  <igx-splitter-pane>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Output()
    public resizeEnd = new EventEmitter<ISplitterBarResizeEventArgs>();

    private _type: SplitterType = SplitterType.Horizontal;

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

    constructor(@Inject(DOCUMENT) public document, private elementRef: ElementRef) { }
    /**
     * Gets/Sets the splitter orientation.
     *
     * @example
     * ```html
     * <igx-splitter [type]="type">...</igx-splitter>
     * ```
     */
    @Input()
    public get type() {
        return this._type;
    }
    public set type(value) {
        this._type = value;
        this.resetPaneSizes();
        this.panes?.notifyOnChanges();
    }

    /**
     * Sets the visibility of the handle and expanders in the splitter bar.
     * False by default
     * 
     * @example
     * ```html
     * <igx-splitter [nonCollapsible]='true'>
     * </igx-splitter>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public nonCollapsible = false; // Input to toggle showing/hiding expanders

    /**
     * @hidden @internal
     * Gets the `flex-direction` property of the current `SplitterComponent`.
     */
    @HostBinding('style.flex-direction')
    public get direction(): string {
        return this.type === SplitterType.Horizontal ? 'row' : 'column';
    }

    /** @hidden @internal */
    public ngAfterContentInit(): void {
        this.initPanes();
        this.panes.changes.subscribe(() => {
            this.initPanes();
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
        const args: ISplitterBarResizeEventArgs = { pane: this.pane, sibling: this.sibling };
        this.resizeStart.emit(args);
    }

    /**
     * @hidden @internal
     * This method performs calculations concerning the sizes of each pair of panes when the bar between them is dragged.
     * @param delta - The difference along the X (or Y) axis between the initial and the current point when dragging the bar.
     */
    public onMoving(delta: number) {
        const [ paneSize, siblingSize ] = this.calcNewSizes(delta);

        this.pane.dragSize = paneSize + 'px';
        this.sibling.dragSize = siblingSize + 'px';

        const args: ISplitterBarResizeEventArgs = { pane: this.pane, sibling: this.sibling };
        this.resizing.emit(args);
    }

    public onMoveEnd(delta: number) {
        const [ paneSize, siblingSize ] = this.calcNewSizes(delta);

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
            const percentSiblingPaneSize = (siblingSize / totalSize) * 100;
            this.sibling.size = percentSiblingPaneSize + '%';
        } else {
            // px resize
            this.sibling.size = siblingSize + 'px';
        }
        this.pane.dragSize = null;
        this.sibling.dragSize = null;

        const args: ISplitterBarResizeEventArgs = { pane: this.pane, sibling: this.sibling };
        this.resizeEnd.emit(args);
    }

    /** @hidden @internal */
    public getPaneSiblingsByOrder(order: number, barIndex: number): Array<IgxSplitterPaneComponent> {
        const panes = this.panes.toArray();
        const prevPane = panes[order - barIndex - 1];
        const nextPane = panes[order - barIndex];
        const siblings = [prevPane, nextPane];
        return siblings;
    }

    private getTotalSize() {
        const computed = this.document.defaultView.getComputedStyle(this.elementRef.nativeElement);
        const totalSize = this.type === SplitterType.Horizontal ? computed.getPropertyValue('width') : computed.getPropertyValue('height');
        return parseFloat(totalSize);
    }


    /**
     * @hidden @internal
     * This method inits panes with properties.
     */
    private initPanes() {
        this.panes.forEach(pane => {
            pane.owner = this;
            if (this.type === SplitterType.Horizontal) {
                pane.minWidth = pane.minSize ?? '0';
                pane.maxWidth = pane.maxSize ?? '100%';
            } else {
                pane.minHeight = pane.minSize ?? '0';
                pane.maxHeight = pane.maxSize ?? '100%';
            }
        });
        this.assignFlexOrder();
        if (this.panes.filter(x => x.collapsed).length > 0) {
            // if any panes are collapsed, reset sizes.
            this.resetPaneSizes();
        }
    }

    /**
     * @hidden @internal
     * This method reset pane sizes.
     */
    private resetPaneSizes() {
        if (this.panes) {
            // if type is changed runtime, should reset sizes.
            this.panes.forEach(x => {
                x.size = 'auto'
                x.minWidth = '0';
                x.maxWidth = '100%';
                x.minHeight = '0';
                x.maxHeight = '100%';
            });
        }
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

    /**
     * @hidden @internal
     * Calculates new sizes for the panes based on move delta and initial sizes
     */
    private calcNewSizes(delta: number): [number, number] {
        const min = parseInt(this.pane.minSize, 10) || 0;
        const minSibling = parseInt(this.sibling.minSize, 10) || 0;
        const max = parseInt(this.pane.maxSize, 10) || this.initialPaneSize + this.initialSiblingSize - minSibling;
        const maxSibling = parseInt(this.sibling.maxSize, 10) || this.initialPaneSize + this.initialSiblingSize - min;

        if (delta < 0) {
            const maxPossibleDelta = Math.min(
                max - this.initialPaneSize,
                this.initialSiblingSize - minSibling,
            )
            delta = Math.min(maxPossibleDelta, Math.abs(delta)) * -1;
        } else {
            const maxPossibleDelta = Math.min(
                this.initialPaneSize - min,
                maxSibling - this.initialSiblingSize
            )
            delta = Math.min(maxPossibleDelta, Math.abs(delta));
        }
        return [this.initialPaneSize - delta, this.initialSiblingSize + delta];
    }
}

/**
 * @hidden @internal
 * Represents the draggable bar that visually separates panes and allows for changing their sizes.
 */
@Component({
    selector: 'igx-splitter-bar',
    templateUrl: './splitter-bar.component.html',
    imports: [IgxDragDirective, IgxDragIgnoreDirective]
})
export class IgxSplitBarComponent {
    /**
     * Set css class to the host element.
     */
    @HostBinding('class.igx-splitter-bar-host')
    public cssClass = 'igx-splitter-bar-host';

     /**
     * Sets the visibility of the handle and expanders in the splitter bar.
     */
    @Input({ transform: booleanAttribute })
    public nonCollapsible;

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
     *
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

    private interactionKeys = new Set('right down left up arrowright arrowdown arrowleft arrowup'.split(' '));

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
    public keyEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey;
        event.stopPropagation();
        if (this.interactionKeys.has(key)) {
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
        const curr = isHorizontal ? event.pageX : event.pageY;
        const delta = this.startPoint - curr;
        if (delta !== 0) {
            this.moving.emit(delta);
            event.cancel = true;
            event.owner.element.nativeElement.style.transform = '';
        }
    }

    public onDragEnd(event: any) {
        const isHorizontal = this.type === SplitterType.Horizontal;
        const curr = isHorizontal ? event.pageX : event.pageY;
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
