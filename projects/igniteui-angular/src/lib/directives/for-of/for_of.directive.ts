import { CommonModule, NgForOfContext } from '@angular/common';
import {
    ChangeDetectorRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    DoCheck,
    EmbeddedViewRef,
    EventEmitter,
    Input,
    IterableChanges,
    IterableDiffer,
    IterableDiffers,
    NgModule,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewChild,
    ViewContainerRef
} from '@angular/core';

import { DeprecateProperty } from '../../core/deprecateDecorators';
import { DisplayContainerComponent } from './display.container';
import { HVirtualHelperComponent } from './horizontal.virtual.helper.component';
import { VirtualHelperComponent } from './virtual.helper.component';
import {IgxScrollInertiaModule} from './../scroll-inertia/scroll_inertia.directive';

@Directive({ selector: '[igxFor][igxForOf]' })
export class IgxForOfDirective<T> implements OnInit, OnChanges, DoCheck, OnDestroy {

    /**
     * An @Input property that sets the data to be rendered.
     * ```html
     * <ng-template igxFor let-item [igxForOf]="data" [igxForScrollOrientation]="'horizontal'"></ng-template>
     * ```
     */
    @Input()
    public igxForOf: any[];

    /**
     * An @Input property that specifies the scroll orientation.
     * Scroll orientation can be "vertical" or "horizontal".
     * ```html
     * <ng-template igxFor let-item [igxForOf]="data" [igxForScrollOrientation]="'horizontal'"></ng-template>
     * ```
     */
    @Input()
    public igxForScrollOrientation: string;

    /**
     * Optionally pass the parent `igxFor` instance to create a virtual template scrolling both horizontally and vertically.
     * ```html
     * <ng-template #scrollContainer igxFor let-rowData [igxForOf]="data"
     *       [igxForScrollOrientation]="'vertical'"
     *       [igxForContainerSize]="'500px'"
     *       [igxForItemSize]="'50px'"
     *       let-rowIndex="index">
     *       <div [style.display]="'flex'" [style.height]="'50px'">
     *           <ng-template #childContainer igxFor let-item [igxForOf]="data"
     *               [igxForScrollOrientation]="'horizontal'"
     *               [igxForScrollContainer]="parentVirtDir"
     *               [igxForContainerSize]="'500px'">
     *                   <div [style.min-width]="'50px'">{{rowIndex}} : {{item.text}}</div>
     *           </ng-template>
     *       </div>
     * </ng-template>
     * ```
     */
    @Input()
    public igxForScrollContainer: any;

    /**
     * An @Input property that sets the px-affixed size of the container along the axis of scrolling.
     * For "horizontal" orientation this value is the width of the container and for "vertical" is the height.
     * ```html
     * <ng-template igxFor let-item [igxForOf]="data" [igxForContainerSize]="'500px'"
     *      [igxForScrollOrientation]="'horizontal'">
     * </ng-template>
     * ```
     */
    @Input()
    public igxForContainerSize: any;

    /**
     * An @Input property that sets the px-affixed size of the item along the axis of scrolling.
     * For "horizontal" orientation this value is the width of the column and for "vertical" is the height or the row.
     * ```html
     * <ng-template igxFor let-item [igxForOf]="data" [igxForScrollOrientation]="'horizontal'" [igxForItemSize]="'50px'"></ng-template>
     * ```
     */
    @Input()
    public igxForItemSize: any;

    /**
     * @hidden
     */
    public dc: ComponentRef<DisplayContainerComponent>;

    /**
     * The current state of the directive. It contains `startIndex` and `chunkSize`.
     * state.startIndex - The index of the item at which the current visible chunk begins.
     * state.chunkSize - The number of items the current visible chunk holds.
     * These options can be used when implementing remote virtualization as they provide the necessary state information.
     * ```typescript
     * const gridState = this.parentVirtDir.state;
     * ```
     */
    public state: IForOfState = {
        startIndex: 0,
        chunkSize: 0
    };
    /**
     * The total count of the virtual data items, when using remote service.
     * ```typescript
     * this.parentVirtDir.totalItemCount = data.Count;
     * ```
     */
    public totalItemCount: number = null;

    /**
     * An event that is emitted after a new chunk has been loaded.
     * ```html
     * <ng-template igxFor [igxForOf]="data" [igxForScrollOrientation]="'horizontal'" (onChunkLoad)="chunkLoad($event)"></ng-template>
     * ```
     * ```typescript
     * chunkLoad(e){
     * alert("chunk loaded!");
     * }
     * ```
     */
    @Output()
    public onChunkLoad = new EventEmitter<IForOfState>();

    /**
     * An event that is emitted on chunk loading to emit the current state information - startIndex, endIndex, totalCount.
     * Can be used for implementing remote load on demand for the igxFor data.
     * ```html
     * <ng-template igxFor [igxForOf]="data" [igxForScrollOrientation]="'horizontal'" (onChunkPreload)="chunkPreload($event)"></ng-template>
     * ```
     * ```typescript
     * chunkPreload(e){
     * alert("chunk is loading!");
     * }
     * ```
     */
    @Output()
    public onChunkPreload = new EventEmitter<IForOfState>();

    private hScroll;
    private func;
    private hCache: number[];
    private vh: ComponentRef<VirtualHelperComponent>;
    private hvh: ComponentRef<HVirtualHelperComponent>;
    private _differ: IterableDiffer<T> | null = null;
    private _trackByFn: TrackByFunction<T>;
    private _lastTouchX = 0;
    private _lastTouchY = 0;
    private _pointerCapture;
    private _gestureObject;

    private get _isScrolledToBottom() {
        if (!this.getVerticalScroll()) {
            return true;
        }
        const scrollTop = this.getVerticalScroll().scrollTop;
        const scrollHeight = this.getVerticalScroll().scrollHeight;
        // Use === and not >= because `scrollTop + container size` can't be bigger than `scrollHeight`, unless something isn't updated.
        // Also use Math.round because Chrome has some inconsistencies and `scrollTop + container` can be float when zooming the page.
        return Math.round(scrollTop + this.igxForContainerSize) === scrollHeight;
    }

    private get _isAtBottomIndex() {
        return this.igxForOf && this.state.startIndex + this.state.chunkSize > this.igxForOf.length;
    }
    private extraRowApplied = false;

    // Start properties related to virtual height handling due to browser limitation
    /** Maximum height for an element of the browser. */
    private _maxHeight;

    /** Height that is being virtualized. */
    private _virtHeight = 0;

    /**
     * Ratio for height that's being virtualizaed and the one visible
     * If _virtHeightRatio = 1, the visible height and the virtualized are the same, also _maxHeight > _virtHeight.
     */
    private _virtHeightRatio = 1;

    /** Internal track for scroll top that is being virtualized */
    private _virtScrollTop = 0;

    /** If the next onScroll event is triggered due to internal setting of scrollTop */
    private _bScrollInternal =  false;
    // End properties related to virtual height handling

    @ViewChild(DisplayContainerComponent)
    private displayContiner: DisplayContainerComponent;

    @ViewChild(VirtualHelperComponent)
    private virtualHelper: VirtualHelperComponent;

    private _embeddedViews: Array<EmbeddedViewRef<any>> = [];

    constructor(
        private _viewContainer: ViewContainerRef,
        private _template: TemplateRef<NgForOfContext<T>>,
        private _differs: IterableDiffers,
        private resolver: ComponentFactoryResolver,
        public cdr: ChangeDetectorRef,
        private _zone: NgZone) { }

    /**
     * @hidden
     */
    protected get isRemote(): boolean {
        return this.totalItemCount !== null;
    }

    /**
     * @hidden
     */
    public ngOnInit(): void {
        let totalWidth = 0;
        const vc = this.igxForScrollContainer ? this.igxForScrollContainer._viewContainer : this._viewContainer;

        const dcFactory: ComponentFactory<DisplayContainerComponent> = this.resolver.resolveComponentFactory(DisplayContainerComponent);
        this.dc = this._viewContainer.createComponent(dcFactory, 0);

        if (typeof MSGesture === 'function') {
            // On Edge and IE when scrolling on touch the page scroll instead of the grid.
            this.dc.instance._viewContainer.element.nativeElement.style.touchAction = 'none';
        }
        if (this.igxForOf && this.igxForOf.length) {
            this.dc.instance.notVirtual = !(this.igxForContainerSize && this.state.chunkSize < this.igxForOf.length);
            if (this.igxForScrollOrientation === 'horizontal') {
                totalWidth = this.initHCache(this.igxForOf);
                this.hScroll = this.getElement(vc, 'igx-horizontal-virtual-helper');
                if (this.hScroll) {
                    this.state.startIndex = this.getHorizontalIndexAt(this.hScroll.scrollLeft, this.hCache, 0);
                }
            }
            this.state.chunkSize = this._calculateChunkSize();
            for (let i = 0; i < this.state.chunkSize && this.igxForOf[i] !== undefined; i++) {
                const input = this.igxForOf[i];
                const embeddedView = this.dc.instance._vcr.createEmbeddedView(
                    this._template,
                    { $implicit: input, index: this.igxForOf.indexOf(input) }
                );
                this._embeddedViews.push(embeddedView);
            }
        }

        if (this.igxForScrollOrientation === 'vertical') {
            this.dc.instance._viewContainer.element.nativeElement.style.top = '0px';
            const factory: ComponentFactory<VirtualHelperComponent> = this.resolver.resolveComponentFactory(VirtualHelperComponent);
            this.vh = this._viewContainer.createComponent(factory, 1);
            this._maxHeight = this._calcMaxBrowserHeight();
            this.vh.instance.height = this.igxForOf ? this._calcHeight() : 0;
            this._zone.runOutsideAngular(() => {
                this.vh.instance.elementRef.nativeElement.addEventListener('scroll', (evt) => { this.onScroll(evt); });
                this.dc.instance.scrollContainer = this.vh.instance.elementRef.nativeElement;
            });
        }

        if (this.igxForScrollOrientation === 'horizontal') {
            this.func = (evt) => { this.onHScroll(evt); };
            this.hScroll = this.getElement(vc, 'igx-horizontal-virtual-helper');
            if (!this.hScroll) {
                const hvFactory: ComponentFactory<HVirtualHelperComponent> =
                    this.resolver.resolveComponentFactory(HVirtualHelperComponent);
                this.hvh = vc.createComponent(hvFactory);
                this.hvh.instance.width = totalWidth;
                this.hScroll = this.hvh.instance.elementRef.nativeElement;
                this._zone.runOutsideAngular(() => {
                    this.hvh.instance.elementRef.nativeElement.addEventListener('scroll', this.func);
                    this.dc.instance.scrollContainer = this.hScroll;
                });
            } else {
                this._zone.runOutsideAngular(() => {
                    this.hScroll.addEventListener('scroll', this.func);
                    this.dc.instance.scrollContainer = this.hScroll;
                });
            }

            const scrollOffset = this.hScroll.scrollLeft - (this.hCache && this.hCache.length ? this.hCache[this.state.startIndex] : 0);
            this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';
            this.dc.instance._viewContainer.element.nativeElement.style.height = '100%';
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        if (this.hScroll) {
            this.hScroll.removeEventListener('scroll', this.func);
        }
    }

    /**
     * @hidden
     */
    public ngOnChanges(changes: SimpleChanges): void {
        const forOf = 'igxForOf';
        if (forOf in changes) {
            const value = changes[forOf].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this.igxForTrackBy);
                } catch (e) {
                    throw new Error(
                        `Cannot find a differ supporting object "${value}" of type "${getTypeNameForDebugging(value)}".
                     NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
        const containerSize = 'igxForContainerSize';
        if (containerSize in changes && !changes[containerSize].firstChange) {
            this._recalcOnContainerChange(changes);
        }
    }

    /**
     * @hidden
     */
    public ngDoCheck(): void {
        if (this._differ) {
            const changes = this._differ.diff(this.igxForOf);
            if (changes) {
                if (this.igxForScrollOrientation === 'horizontal') {
                    // after changes in columns have occured re-init cache.
                    this.initHCache(this.igxForOf);
                }
                this._zone.run(() => {
                    this._applyChanges(changes);
                    this.cdr.markForCheck();
                    this._updateScrollOffset();
                });
            }
        }
    }

    /**
     * Shifts the scroll thumb position.
     * ```typescript
     * this.parentVirtDir.addScrollTop(5);
     * ```
     * @param addTop negative value to scroll up and positive to scroll down;
     */
    public addScrollTop(addTop: number): boolean {
        if (addTop === 0 && this.igxForScrollOrientation === 'horizontal') {
            return false;
        }
        const originalVirtScrollTop = this._virtScrollTop;
        const containerSize = parseInt(this.igxForContainerSize, 10);
        const maxVirtScrollTop = this._virtHeight - containerSize;

        this._bScrollInternal = true;
        this._virtScrollTop += addTop;
        this._virtScrollTop = this._virtScrollTop > 0 ?
            (this._virtScrollTop < maxVirtScrollTop ? this._virtScrollTop : maxVirtScrollTop) :
            0;

        this.vh.instance.elementRef.nativeElement.scrollTop += addTop / this._virtHeightRatio;
        if (Math.abs(addTop / this._virtHeightRatio) < 1) {
            // Actual scroll delta that was added is smaller than 1 and onScroll handler doesn't trigger when scrolling < 1px
            let scrollOffset = this.fixedUpdateAllRows(this._virtScrollTop, this._virtHeight);
            scrollOffset = scrollOffset !== parseInt(this.igxForItemSize, 10) ? scrollOffset : 0;
            this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';
        }

        const curScrollTop = this.vh.instance.elementRef.nativeElement.scrollTop;
        const maxRealScrollTop = this.vh.instance.elementRef.nativeElement.scrollHeight - containerSize;
        if ((this._virtScrollTop > 0 && curScrollTop === 0) ||
            (this._virtScrollTop < maxVirtScrollTop && curScrollTop === maxRealScrollTop)) {
            // Actual scroll position is at the top or bottom, but virtual one is not at the top or bottom (there's more to scroll)
            // Recalculate actual scroll position based on the virtual scroll.
            this.vh.instance.elementRef.nativeElement.scrollTop = this._virtScrollTop / this._virtHeightRatio;
        } else if (this._virtScrollTop === 0 && curScrollTop > 0) {
            // Actual scroll position is not at the top, but virtual scroll is. Just update the actual scroll
            this.vh.instance.elementRef.nativeElement.scrollTop = 0;
        } else if (this._virtScrollTop === maxVirtScrollTop && curScrollTop < maxRealScrollTop) {
            // Actual scroll position is not at the bottom, but virtual scroll is. Just update the acual scroll
            this.vh.instance.elementRef.nativeElement.scrollTop = maxRealScrollTop;
        }
        return this._virtScrollTop !== originalVirtScrollTop;
    }

    /**
     * Scrolls to the specified index.
     * ```typescript
     * this.parentVirtDir.scrollTo(5);
     * ```
     * @param index
     */
    public scrollTo(index) {
        if (index < 0 || index > (this.isRemote ? this.totalItemCount : this.igxForOf.length)) {
            return;
        }
        // this.state.startIndex = index;
        if (this.igxForScrollOrientation === 'horizontal') {
            this.hScroll.scrollLeft = this.hCache[index] + 1;
        } else {
            const containerSize = parseInt(this.igxForContainerSize, 10);
            const maxVirtScrollTop = this._virtHeight - containerSize;
            let nextScrollTop = index *  parseInt(this.igxForItemSize, 10);
            if (nextScrollTop > maxVirtScrollTop) {
                nextScrollTop = maxVirtScrollTop;
            }

            this._bScrollInternal = true;
            this._virtScrollTop = nextScrollTop;
            this.vh.instance.elementRef.nativeElement.scrollTop = this._virtScrollTop / this._virtHeightRatio;
        }
    }

    /**
     * Scrolls by one item into the appropriate next direction.
     * For "horizontal" orientation that will be the right column and for "vertical" that is the lower row.
     * ```typescript
     * this.parentVirtDir.scrollNext();
     * ```
     */
    public scrollNext() {
        this.scrollTo(this.state.startIndex + 1);
    }

    /**
     * Scrolls by one item into the appropriate previous direction.
     * For "horizontal" orientation that will be the left column and for "vertical" that is the upper row.
     * ```typescript
     * this.parentVirtDir.scrollPrev();
     * ```
     */
    public scrollPrev() {
        this.scrollTo(this.state.startIndex - 1);
    }

    /**
     * Scrolls by one page into the appropriate next direction.
     * For "horizontal" orientation that will be one view to the right and for "vertical" that is one view to the bottom.
     * ```typescript
     * this.parentVirtDir.scrollNextPage();
     * ```
     */
    public scrollNextPage() {
        if (this.igxForScrollOrientation === 'horizontal') {
            this.hvh.instance.elementRef.nativeElement.scrollLeft += parseInt(this.igxForContainerSize, 10);
        } else {
            this.addScrollTop(parseInt(this.igxForContainerSize, 10));
        }
    }

    /**
     * Scrolls by one page into the appropriate previous direction.
     * For "horizontal" orientation that will be one view to the left and for "vertical" that is one view to the top.
     * ```typescript
     * this.parentVirtDir.scrollPrevPage();
     * ```
     */
    public scrollPrevPage() {
        if (this.igxForScrollOrientation === 'horizontal') {
            this.hvh.instance.elementRef.nativeElement.scrollLeft -= parseInt(this.igxForContainerSize, 10);
        } else {
            const containerSize = (parseInt(this.igxForContainerSize, 10));
            this.addScrollTop(-containerSize);
        }
    }

    /**
     * @hidden
     */
    public getColumnScrollLeft(colIndex) {
        return this.hCache[colIndex];
    }

    /**
     * Returns a reference to the vertical scrollbar DOM element.
     * ```typescript
     * this.parentVirtDir.getVerticalScroll();
     * ```
     */
    public getVerticalScroll() {
        if (this.vh) {
            return this.vh.instance.elementRef.nativeElement;
        }
        return null;
    }

    /**
     * Returns the total number of items that are fully visible.
     * ```typescript
     * this.parentVirtDir.getItemCountInView();
     * ```
     */
    public getItemCountInView() {
        if (this.igxForScrollOrientation === 'horizontal') {
            const scrLeft = this.hScroll.scrollLeft;
            let startIndex = this.getHorizontalIndexAt(
                scrLeft,
                this.hCache,
                0
            );
            if (scrLeft - this.hCache[startIndex] > 0 ) {
                // fisrt item is not fully in view
                startIndex++;
            }
            const endIndex = this.getHorizontalIndexAt(
                scrLeft + parseInt(this.igxForContainerSize, 10),
                this.hCache,
                0
            );
            return endIndex - startIndex;
        } else {
          return  Math.floor(parseInt(this.igxForContainerSize, 10) /
          parseInt(this.igxForItemSize, 10));

        }
    }

    /**
     * Returns a reference to the horizontal scrollbar DOM element.
     * ```typescript
     * this.parentVirtDir.getHorizontalScroll();
     * ```
     */
    public getHorizontalScroll() {
        return this.getElement(this._viewContainer, 'igx-horizontal-virtual-helper') || this.hScroll;
    }

    /**
     * @hidden
     * Function that is called when scrolling vertically
     */
    protected onScroll(event) {
        /* in certain situations this may be called when no scrollbar is visible */
        if (!parseInt(this.vh.instance.elementRef.nativeElement.style.height, 10)) {
            return;
        }

        const containerSize = parseInt(this.igxForContainerSize, 10);
        const maxRealScrollTop = event.target.children[0].scrollHeight - containerSize;
        const realPercentScrolled = event.target.scrollTop / maxRealScrollTop;
        if (!this._bScrollInternal) {
            const maxVirtScrollTop = this._virtHeight - containerSize;
            this._virtScrollTop = realPercentScrolled * maxVirtScrollTop;
        } else {
            this._bScrollInternal = false;
        }

        let scrollOffset = this.fixedUpdateAllRows(this._virtScrollTop, this._virtHeight);
        if (scrollOffset === undefined) {
            return;
        }
        scrollOffset = scrollOffset !== parseInt(this.igxForItemSize, 10) ? scrollOffset : 0;
        this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';

        this._zone.run(() => {
            this.cdr.markForCheck();
        });
        this.onChunkLoad.emit(this.state);
    }

    /**
     * @hidden
     */
    protected fixedUpdateAllRows(inScrollTop: number, scrollHeight: number): number {
        const ratio = scrollHeight !== 0 ? inScrollTop / scrollHeight : 0;
        const embeddedViewCopy = Object.assign([], this._embeddedViews);

        const count = this.isRemote ? this.totalItemCount : this.igxForOf.length;
        const ind = ratio * count;
        // floating point number calculations are flawed so we need to handle rounding errors.
        const currIndex = ind % 1 > 0.999 ? Math.round(ind) : Math.floor(ind);
        let endingIndex = this.state.chunkSize + currIndex;

        // We update the startIndex before recalculating the chunkSize.
        const bUpdatedStart = this.state.startIndex !== currIndex;
        this.state.startIndex = currIndex;

        if (endingIndex > this.igxForOf.length) {
            endingIndex = this.igxForOf.length;
        }
        if (bUpdatedStart &&
            ((!this._isScrolledToBottom || !this._isAtBottomIndex) && !this.extraRowApplied) ||
            ((this._isScrolledToBottom || this._isAtBottomIndex) && this.extraRowApplied)) {
            // Reapply chunk size when are aren't at the buttom index but we don't have extra row applied as well.
            // or reapply chunk size when we are at the bottom index but we have extra row applied.
            // We check both scroll position and index to be sure since we actually check bottom index before recalculating chunk size.
            this.applyChunkSizeChange();
        }

        if (bUpdatedStart) {
            this.onChunkPreload.emit(this.state);
        }
        if (this.isRemote) {
            return;
        }

        for (let i = this.state.startIndex; i < endingIndex && this.igxForOf[i] !== undefined; i++) {
            const input = this.igxForOf[i];
            const embView = embeddedViewCopy.shift();
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
        }

        return inScrollTop - this.state.startIndex * (scrollHeight / count);
    }

    /**
     * @hidden
     * Function that is called when scrolling horizontally
     */
    protected onHScroll(event) {
        /* in certain situations this may be called when no scrollbar is visible */
        if (!parseInt(this.hScroll.children[0].style.width, 10)) {
            return;
        }
        const curScrollLeft = event.target.scrollLeft;

        // Updating horizontal chunks
        const scrollOffset = this.fixedUpdateAllCols(curScrollLeft);
        this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';

        this.dc.changeDetectorRef.detectChanges();
        this.onChunkLoad.emit();
    }

    /**
     * @hidden
     */
    protected fixedUpdateAllCols(inScrollLeft) {
        const startIndex = this.getHorizontalIndexAt(
            inScrollLeft,
            this.hCache,
            0
        );
        this.onChunkPreload.emit(this.state);
        /*recalculate and apply page size.*/
        if (startIndex + this.state.chunkSize > this.igxForOf.length) {
            this.state.startIndex = this.igxForOf.length - this.state.chunkSize;
        } else {
            this.state.startIndex = startIndex;
        }
        const embeddedViewCopy = Object.assign([], this._embeddedViews);
        const endingIndex = this.state.chunkSize + this.state.startIndex;
        for (let i = this.state.startIndex; i < endingIndex && this.igxForOf[i] !== undefined; i++) {
            const input = this.igxForOf[i];
            const embView = embeddedViewCopy.shift();
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
        }

        return inScrollLeft - this.hCache[this.state.startIndex];
    }

    /**
     * Gets the function used to track changes in the items collection.
     * By default the object references are compared. However this can be optimized if you have unique identifier
     * value that can be used for the comparison instead of the object ref or if you have some other property values
     * in the item object that should be tracked for changes.
     * This option is similar to ngForTrackBy.
     * ```typescript
     * const trackFunc = this.parentVirtDir.igxForTrackBy;
     * ```
     */
    @Input()
    get igxForTrackBy(): TrackByFunction<T> { return this._trackByFn; }

    /**
     * Sets the function used to track changes in the items collection.
     * This function can be set in scenarios where you want to optimize or
     * customize the tracking of changes for the items in the collection.
     * The igxForTrackBy function takes the index and the current item as arguments and needs to return the unique identifier for this item.
     * ```typescript
     * this.parentVirtDir.igxForTrackBy = (index, item) => {
     *      return item.id + item.width;
     * };
     * ```
     */
    set igxForTrackBy(fn: TrackByFunction<T>) { this._trackByFn = fn; }

    /**
     * @hidden
     */
    protected _applyChanges(changes: IterableChanges<T>) {
        this.applyChunkSizeChange();
        this._recalcScrollBarSize();
        if (this.igxForOf && this.igxForOf.length && this.dc) {
            const embeddedViewCopy = Object.assign([], this._embeddedViews);
            let startIndex = this.state.startIndex;
            let endIndex = this.state.chunkSize + this.state.startIndex;
            if (this.isRemote) {
                startIndex = 0;
                endIndex = this.igxForOf.length;
            }
            for (let i = startIndex; i < endIndex && this.igxForOf[i] !== undefined; i++) {
                const input = this.igxForOf[i];
                const embView = embeddedViewCopy.shift();
                const cntx = (embView as EmbeddedViewRef<any>).context;
                cntx.$implicit = input;
                cntx.index = this.igxForOf.indexOf(input);
            }
            this.dc.changeDetectorRef.detectChanges();
            this.onChunkLoad.emit();
        }
    }

    /**
     * @hidden
     */
    protected _calcMaxBrowserHeight(): number {
        const div = document.createElement('div');
        const style = div.style;
        style.position = 'absolute';
        style.top = '9999999999999999px';
        document.body.appendChild(div);
        const size = Math.abs(div.getBoundingClientRect()['top']);
        document.body.removeChild(div);
        return size;
    }

    /**
     * @hidden
     * Recalculates the chunkSize based on current startIndex and returns the new size.
     * This should be called after this.state.startIndex is updated, not before.
     */
    protected _calculateChunkSize(): number {
        let chunkSize = 0;
        if (this.igxForContainerSize !== null && this.igxForContainerSize !== undefined) {
            if (this.igxForScrollOrientation === 'horizontal') {
                if (!this.hCache) {
                    this.initHCache(this.igxForOf);
                }
                chunkSize = this._calcMaxChunkSize();
                if (this.igxForOf && chunkSize > this.igxForOf.length) {
                   chunkSize = this.igxForOf.length;
                }
            } else {
                chunkSize = Math.ceil(parseInt(this.igxForContainerSize, 10) /
                    parseInt(this.igxForItemSize, 10));
                chunkSize = isNaN(chunkSize) ? 0 : chunkSize;
                if (chunkSize !== 0 && !this._isScrolledToBottom && !this._isAtBottomIndex) {
                    chunkSize++;
                    this.extraRowApplied = true;
                } else {
                    this.extraRowApplied = false;
                }
                if (this.igxForOf && chunkSize > this.igxForOf.length) {
                    chunkSize = this.igxForOf.length;
                }
            }
        } else {
            if (this.igxForOf) {
                chunkSize = this.igxForOf.length;
            }
        }
        return chunkSize;
    }

    /**
     * @hidden
     */
    protected getElement(viewref, nodeName) {
        const elem = viewref.element.nativeElement.parentNode.getElementsByTagName(nodeName);
        return elem.length > 0 ? elem[0] : null;
    }

    /**
     * @hidden
     */
    protected initHCache(cols: any[]): number {
        let totalWidth = 0;
        let i = 0;
        this.hCache = [];
        this.hCache.push(0);
        for (i; i < cols.length; i++) {
            totalWidth += parseInt(cols[i].width, 10) || 0;
            this.hCache.push(totalWidth);
        }
        return totalWidth;
    }

    /**
     * @hidden
     */
    protected _calcMaxChunkSize() {
        let i = 0;
        let length = 0;
        let maxLength = 0;
        const arr = [];
        let sum = 0;
        const reducer = (accumulator, currentItem) => accumulator + parseInt(currentItem.width, 10);
        const availableSize = parseInt(this.igxForContainerSize, 10);
        for (i; i < this.igxForOf.length; i++) {
            const item = this.igxForOf[i];
            sum = arr.reduce(reducer,  parseInt(item.width, 10));
            if (sum <= availableSize) {
                 arr.push(item);
                 length = arr.length;
                 if (i === this.igxForOf.length - 1) {
                    // reached end without exceeding
                    // include prev items until size is filled or first item is reached.
                    let prevIndex = this.igxForOf.indexOf(arr[0]) - 1;
                    while (prevIndex >= 0 && sum <= availableSize) {
                        prevIndex = this.igxForOf.indexOf(arr[0]) - 1;
                        const prevItem = this.igxForOf[prevIndex];
                        sum = arr.reduce(reducer,  parseInt(prevItem.width, 10));
                        arr.unshift(prevItem);
                        length = arr.length;
                    }
                 }
             } else {
                 arr.push(item);
                 length = arr.length + 1;
                 arr.splice(0, 1);
             }
             if (length > maxLength) {
                 maxLength = length;
             }
        }
        return maxLength;
    }

    /**
     * @hidden
     */
    protected getHorizontalIndexAt(left, set, index) {
        let midIdx;
        let midLeft;
        if (set.length === 1) {
            return index;
        }
        midIdx = Math.floor(set.length / 2);
        midLeft = set[midIdx];
        return this.getHorizontalIndexAt(
            left,
            midLeft >= left ? set.slice(0, midIdx) : set.slice(midIdx),
            midLeft >= left ? index : index + midIdx
        );
    }

    private _recalcScrollBarSize() {
        const count = this.isRemote ? this.totalItemCount : (this.igxForOf ? this.igxForOf.length : 0);
        this.dc.instance.notVirtual = !(this.igxForContainerSize && this.dc && this.state.chunkSize < count);
        if (this.igxForScrollOrientation === 'horizontal') {
            const totalWidth = this.igxForContainerSize ? this.initHCache(this.igxForOf) : 0;
            this.hScroll.children[0].style.width = totalWidth + 'px';
        }
        if (this.igxForScrollOrientation === 'vertical') {
            this.vh.instance.elementRef.nativeElement.style.height = parseInt(this.igxForContainerSize, 10) + 'px';
            this.vh.instance.height = this._calcHeight();
        }
    }

    private _calcHeight(): number {
        const count = this.totalItemCount || (this.igxForOf ? this.igxForOf.length : 0);
        let height = count * parseInt(this.igxForItemSize, 10);
        this._virtHeight = height;
        if (height > this._maxHeight) {
            this._virtHeightRatio = height / this._maxHeight;
            height = this._maxHeight;
        }
        return height;
    }

    private _recalcOnContainerChange(changes: SimpleChanges) {
        this.dc.instance._viewContainer.element.nativeElement.style.top = '0px';
        this.dc.instance._viewContainer.element.nativeElement.style.left = '0px';

        this.applyChunkSizeChange();
        this._recalcScrollBarSize();
        if (this.hCache) {
            this.state.startIndex = 0;
            if (this.hScroll.scrollLeft !== 0) {
                this.scrollTo(0);
            } else {
                this.fixedUpdateAllCols(0);
            }
            this.cdr.detectChanges();
            return;
        }
    }

    /**
     * @hidden
     * Removes an elemenet from the embedded views and updates chunkSize.
     */
    protected removeLastElem() {
        const oldElem = this._embeddedViews.pop();
        oldElem.destroy();

        this.state.chunkSize--;
    }

    /**
     * @hidden
     * If there exists an element that we can create embedded view for creates it, appends it and updates chunkSize
     */
    protected addLastElem() {
        let elemIndex = this.state.startIndex + this.state.chunkSize;
        if (!this.isRemote && (!this.igxForOf || elemIndex > this.igxForOf.length)) {
            return;
        }

        // If the end of the igxForOf array is reached add the last element.
        // This is to ensure the smooth scrolling by providing one additional non-visible view.
        if (elemIndex === this.igxForOf.length) {
            elemIndex = this.igxForOf.length - 1;
        }

        const input = this.igxForOf[elemIndex];
        const embeddedView = this.dc.instance._vcr.createEmbeddedView(
            this._template,
            { $implicit: input, index: elemIndex }
        );

        this._embeddedViews.push(embeddedView);
        this.state.chunkSize++;

        this._zone.run(() => {
            this.cdr.markForCheck();
        });
    }

    /**
     * Recalculates chunkSize and adds/removes elements if need due to the change.
     * this.state.chunkSize is updated in @addLastElem() or @removeLastElem()
     */
    private applyChunkSizeChange() {
        const chunkSize = this.isRemote ? (this.igxForOf ? this.igxForOf.length : 0) : this._calculateChunkSize();
        if (chunkSize > this.state.chunkSize) {
            const diff = chunkSize - this.state.chunkSize;
            for (let i = 0; i < diff; i++) {
                this.addLastElem();
            }
        } else if (chunkSize < this.state.chunkSize) {
            const diff = this.state.chunkSize - chunkSize;
            for (let i = 0; i < diff; i++) {
                this.removeLastElem();
            }
        }
    }

    private _updateScrollOffset() {
        let scrollOffset = 0;
        if (this.igxForScrollOrientation === 'horizontal') {
            scrollOffset = this.hScroll && parseInt(this.hScroll.children[0].style.width, 10) ?
            this.hScroll.scrollLeft - this.hCache[this.state.startIndex] : 0;
            this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';
        } else {
            const count = this.isRemote ?
                this.totalItemCount :
                this.igxForOf ? this.igxForOf.length : 0;
            const vScroll = this.vh.instance.elementRef.nativeElement;
            scrollOffset = vScroll && parseInt(vScroll.style.height, 10) ?
            vScroll.scrollTop - this.state.startIndex * (this._virtHeight / count) : 0;
            scrollOffset = scrollOffset !== parseInt(this.igxForItemSize, 10) ? scrollOffset : 0;
            this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';
        }
    }
}

export function getTypeNameForDebugging(type: any): string {
    const name = 'name';
    return type[name] || typeof type;
}

export interface IForOfState {
    startIndex?: number;
    chunkSize?: number;
}

/**
 * The IgxForOfModule provides the {@link IgxForOfDirective}, inside your application.
 */

@NgModule({
    declarations: [IgxForOfDirective, DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
    entryComponents: [DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
    exports: [IgxForOfDirective],
    imports: [IgxScrollInertiaModule, CommonModule]
})

export class IgxForOfModule {
}
