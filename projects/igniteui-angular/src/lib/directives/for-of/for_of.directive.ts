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
    ViewContainerRef,
    ViewRef
} from '@angular/core';

import { DisplayContainerComponent } from './display.container';
import { HVirtualHelperComponent } from './horizontal.virtual.helper.component';
import { VirtualHelperComponent } from './virtual.helper.component';
import { IgxScrollInertiaModule } from './../scroll-inertia/scroll_inertia.directive';

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
     * An @Input property that sets the property name from which to read the size in the data object.
     */
    @Input()
    public igxForSizePropName;

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
     * An event that is emitted after data has been changed.
     * ```html
     * <ng-template igxFor [igxForOf]="data" [igxForScrollOrientation]="'horizontal'" (onDataChanged)="dataChanged($event)"></ng-template>
     * ```
     * ```typescript
     * dataChanged(e){
     * alert("data changed!");
     * }
     * ```
     */
    @Output()
    public onDataChanged = new EventEmitter<any>();

    @Output()
    public onBeforeViewDestroyed = new EventEmitter<any>();

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

    protected hScroll;
    protected func;
    protected sizesCache: number[];
    protected vh: ComponentRef<VirtualHelperComponent>;
    protected hvh: ComponentRef<HVirtualHelperComponent>;
    protected _differ: IterableDiffer<T> | null = null;
    protected _trackByFn: TrackByFunction<T>;
    protected heightCache = [];
    private _adjustToIndex;
    private MAX_PERF_SCROLL_DIFF = 4;

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

    // Start properties related to virtual height handling due to browser limitation
    /** Maximum height for an element of the browser. */
    private _maxHeight;

    /** Height that is being virtualized. */
    protected _virtHeight = 0;

    /**
     * Ratio for height that's being virtualizaed and the one visible
     * If _virtHeightRatio = 1, the visible height and the virtualized are the same, also _maxHeight > _virtHeight.
     */
    private _virtHeightRatio = 1;

    /** Internal track for scroll top that is being virtualized */
    protected _virtScrollTop = 0;

    /** If the next onScroll event is triggered due to internal setting of scrollTop */
    protected _bScrollInternal = false;
    // End properties related to virtual height handling

    protected _embeddedViews: Array<EmbeddedViewRef<any>> = [];

    constructor(
        private _viewContainer: ViewContainerRef,
        protected _template: TemplateRef<NgForOfContext<T>>,
        protected _differs: IterableDiffers,
        private resolver: ComponentFactoryResolver,
        public cdr: ChangeDetectorRef,
        protected _zone: NgZone) { }

    /**
     * @hidden
     */
    protected get isRemote(): boolean {
        return this.totalItemCount !== null;
    }

    /**
     * @hidden
     */
    protected removeScrollEventListeners() {
        if (this.igxForScrollOrientation === 'horizontal') {
            this._zone.runOutsideAngular(() =>
                this.getHorizontalScroll().removeEventListener('scroll', this.func)
            );
        } else {
            const vertical = this.getVerticalScroll();
            if (vertical) {
                this._zone.runOutsideAngular(() =>
                    vertical.removeEventListener('scroll', this.verticalScrollHandler)
                );
            }
        }
    }

    public verticalScrollHandler(event) {
        this.onScroll(event);
    }

    public isScrollable() {
        return this.vh.instance.height > parseInt(this.igxForContainerSize, 10);
    }

    /**
     * @hidden
     */
    public ngOnInit(): void {
        let totalSize = 0;
        const vc = this.igxForScrollContainer ? this.igxForScrollContainer._viewContainer : this._viewContainer;
        this.igxForSizePropName = this.igxForSizePropName || 'width';

        const dcFactory: ComponentFactory<DisplayContainerComponent> = this.resolver.resolveComponentFactory(DisplayContainerComponent);
        this.dc = this._viewContainer.createComponent(dcFactory, 0);
        this.dc.instance.scrollDirection = this.igxForScrollOrientation;
        if (typeof MSGesture === 'function') {
            // On Edge and IE when scrolling on touch the page scroll instead of the grid.
            this.dc.instance._viewContainer.element.nativeElement.style.touchAction = 'none';
        }
        if (this.igxForOf && this.igxForOf.length) {
            this.dc.instance.notVirtual = !(this.igxForContainerSize && this.state.chunkSize < this.igxForOf.length);
            totalSize = this.initSizesCache(this.igxForOf);
            this.hScroll = this.getElement(vc, 'igx-horizontal-virtual-helper');
            if (this.hScroll) {
                this.state.startIndex = this.getIndexAt(this.hScroll.scrollLeft, this.sizesCache, 0);
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
            this.vh = vc.createComponent(factory);

            this._maxHeight = this._calcMaxBrowserHeight();
            this.vh.instance.height = this.igxForOf ? this._calcHeight() : 0;
            this._zone.runOutsideAngular(() => {
                this.verticalScrollHandler = this.verticalScrollHandler.bind(this);
                this.vh.instance.elementRef.nativeElement.addEventListener('scroll', this.verticalScrollHandler);
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
                this.hvh.instance.width = totalSize;
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

            const scrollOffset = this.hScroll.scrollLeft -
                (this.sizesCache && this.sizesCache.length ? this.sizesCache[this.state.startIndex] : 0);
            this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';
            this.dc.instance._viewContainer.element.nativeElement.style.height = '100%';
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.removeScrollEventListeners();
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
        const defaultItemSize = 'igxForItemSize';
        if (defaultItemSize in changes && !changes[defaultItemSize].firstChange && this.igxForScrollOrientation === 'vertical') {
            // handle default item size changed.
            this.initSizesCache(this.igxForOf);
        }
        const containerSize = 'igxForContainerSize';
        if (containerSize in changes && !changes[containerSize].firstChange && this.igxForOf) {
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
                //  re-init cache.
                if (!this.igxForOf) {
                    return;
                }
                this._updateSizeCache();
                this._zone.run(() => {
                    this._applyChanges(changes);
                    this.cdr.markForCheck();
                    this._updateScrollOffset();
                    this.onDataChanged.emit();
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
            const scrollOffset = this.fixedUpdateAllElements(this._virtScrollTop);
            // scrollOffset = scrollOffset !== parseInt(this.igxForItemSize, 10) ? scrollOffset : 0;
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
        if (index < 0 || index > (this.isRemote ? this.totalItemCount : this.igxForOf.length) - 1) {
            return;
        }
        const containerSize = parseInt(this.igxForContainerSize, 10);
        const scr = this.igxForScrollOrientation === 'horizontal' ?
            this.hScroll.scrollLeft : this.vh.instance.elementRef.nativeElement.scrollTop;
        const isPrevItem = index < this.state.startIndex || scr > this.sizesCache[index];
        let nextScroll = isPrevItem ? this.sizesCache[index] : this.sizesCache[index + 1] - containerSize;
        if (nextScroll < 0) {
            return;
        }
        if (this.igxForScrollOrientation === 'horizontal') {
            this.hScroll.scrollLeft = nextScroll;
        } else {
            const maxVirtScrollTop = this._virtHeight - containerSize;
            if (nextScroll > maxVirtScrollTop) {
                nextScroll = maxVirtScrollTop;
            }
            this._bScrollInternal = true;
            this._virtScrollTop = nextScroll;
            this.vh.instance.elementRef.nativeElement.scrollTop = this._virtScrollTop / this._virtHeightRatio;
            this._adjustToIndex = !isPrevItem ? index : null;
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
        const scr = Math.ceil(this.igxForScrollOrientation === 'horizontal' ?
            this.hScroll.scrollLeft :
            this.vh.instance.elementRef.nativeElement.scrollTop);
        const endIndex = this.getIndexAt(
            scr + parseInt(this.igxForContainerSize, 10),
            this.sizesCache,
            0
        );
        this.scrollTo(endIndex);
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
        return this.sizesCache[colIndex];
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
        const position = this.igxForScrollOrientation === 'horizontal' ?
            this.hScroll.scrollLeft :
            this.vh.instance.elementRef.nativeElement.scrollTop;
        let startIndex = this.getIndexAt(
            position,
            this.sizesCache,
            0
        );
        if (position - this.sizesCache[startIndex] > 0) {
            // fisrt item is not fully in view
            startIndex++;
        }
        const endIndex = this.getIndexAt(
            position + parseInt(this.igxForContainerSize, 10),
            this.sizesCache,
            0
        );
        return endIndex - startIndex;
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
     * Returns the size of the element at the specified index.
     * ```typescript
     * this.parentVirtDir.getSizeAt(1);
     * ```
     */
    public getSizeAt(index: number) {
        return this.sizesCache[index + 1] - this.sizesCache[index];
    }

    /**
     * Returns the scroll offset of the element at the specified index.
     * ```typescript
     * this.parentVirtDir.getScrollForIndex(1);
     * ```
     */
    public getScrollForIndex(index: number, bottom?: boolean) {
        const containerSize = parseInt(this.igxForContainerSize, 10);
        const scroll = bottom ? this.sizesCache[index + 1] - containerSize : this.sizesCache[index];
        return scroll;
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
        const prevStartIndex = this.state.startIndex;
        const scrollOffset = this.fixedUpdateAllElements(this._virtScrollTop);

        this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';

        requestAnimationFrame(() => {
            // check if height/width has changes in views.
            this.recalcUpdateSizes();
        });
        this.dc.changeDetectorRef.detectChanges();
        if (prevStartIndex !== this.state.startIndex) {
            this.onChunkLoad.emit(this.state);
        }
    }

    /**
     * @hidden
     * Function that recaculates and updates cache sizes.
     */
    public recalcUpdateSizes() {
        const dimension = this.igxForScrollOrientation === 'horizontal' ?
        this.igxForSizePropName : 'height';
        const diffs = [];
        let totalDiff = 0;
        for (let i = 0; i < this._embeddedViews.length; i++) {
            const view = this._embeddedViews[i];
            const rNode = view.rootNodes.find((node) => node.nodeType === Node.ELEMENT_NODE);
            if (rNode) {
                const h = Math.max(rNode.offsetHeight, parseInt(this.igxForItemSize, 10));
                const index = this.state.startIndex + i;
                if (!this.isRemote && !this.igxForOf[index]) {
                    continue;
                }
                const oldVal = dimension === 'height' ? this.heightCache[index] : this.igxForOf[index][dimension];
                const newVal = dimension === 'height' ? h : rNode.clientWidth;
                if (dimension === 'height') {
                    this.heightCache[index] = newVal;
                } else {
                    this.igxForOf[index][dimension] = newVal;
                }
                const currDiff = newVal - oldVal;
                diffs.push(currDiff);
                totalDiff += currDiff;
                this.sizesCache[index + 1] += totalDiff;
            }
        }
        // update cache
        if (Math.abs(totalDiff) > 0) {
            for (let j = this.state.startIndex + this.state.chunkSize + 1; j < this.sizesCache.length; j++) {
                this.sizesCache[j] += totalDiff;
            }

            // update scrBar heights/widths
            if (this.igxForScrollOrientation === 'horizontal') {
                const totalWidth = parseInt(this.hScroll.children[0].style.width, 10) + totalDiff;
                this.hScroll.children[0].style.width = totalWidth + 'px';
            }
            const reducer = (acc, val) => acc + val;
            if (this.igxForScrollOrientation === 'vertical') {
                const scrToBottom = this._isScrolledToBottom && !this.dc.instance.notVirtual;
                const hSum = this.heightCache.reduce(reducer);
                if (hSum > this._maxHeight) {
                    this._virtHeightRatio = hSum / this._maxHeight;
                }
                this.vh.instance.height = Math.min(this.vh.instance.height + totalDiff, this._maxHeight);
                this._virtHeight = hSum;
                if (!this.vh.instance.destroyed) {
                    this.vh.instance.cdr.detectChanges();
                }
                if (scrToBottom && !this._isAtBottomIndex) {
                    const containerSize = parseInt(this.igxForContainerSize, 10);
                    const scrollOffset = this.fixedUpdateAllElements(this._virtHeight - containerSize);
                    this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';
                    return;
                }
                if (this._adjustToIndex) {
                    // in case scrolled to specific index where after scroll heights are changed
                    // need to adjust the offsets so that item is last in view.
                    const updatesToIndex = this._adjustToIndex - this.state.startIndex + 1;
                    const sumDiffs = diffs.slice(0, updatesToIndex).reduce(reducer);
                    const currOffset = parseInt(this.dc.instance._viewContainer.element.nativeElement.style.top, 10);
                    this.dc.instance._viewContainer.element.nativeElement.style.top = (currOffset - sumDiffs) + 'px';
                    this._adjustToIndex = null;
                }
            }
        }
    }

    /**
     * @hidden
     */
    protected fixedUpdateAllElements(inScrollTop: number): number {
        const count = this.isRemote ? this.totalItemCount : this.igxForOf.length;
        let newStart = this.getIndexAt(
            inScrollTop,
            this.sizesCache,
            0
        );
        if (newStart + this.state.chunkSize > count) {
            newStart = count - this.state.chunkSize;
        }
        const prevStart = this.state.startIndex;
        const diff = newStart - this.state.startIndex;
        this.state.startIndex = newStart;
        if (diff) {
            this.onChunkPreload.emit(this.state);
            if (!this.isRemote) {
                /*recalculate and apply page size.*/
                if (diff > 0 && diff <= this.MAX_PERF_SCROLL_DIFF) {
                    this.moveApplyScrollNext(prevStart);
                } else if (diff < 0 && Math.abs(diff) <= this.MAX_PERF_SCROLL_DIFF) {
                    this.moveApplyScrollPrev(prevStart);
                } else {
                    this.fixedApplyScroll();
                }
            }
        }
        return inScrollTop - this.sizesCache[this.state.startIndex];
    }

    /**
     * @hidden
     * The function applies an optimized state change for scrolling down/right employing context change with view rearrangement
     */
    protected moveApplyScrollNext(prevIndex: number): void {
        const start = prevIndex + this.state.chunkSize;
        for (let i = start; i < start + this.state.startIndex - prevIndex && this.igxForOf[i] !== undefined; i++) {
            const input = this.igxForOf[i];
            const embView = this._embeddedViews.shift();
            const cntx = embView.context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
            const view: ViewRef = this.dc.instance._vcr.detach(0);
            this.dc.instance._vcr.insert(view);
            this._embeddedViews.push(embView);
        }
    }

    /**
     * @hidden
     * The function applies an optimized state change for scrolling up/left employing context change with view rearrangement
     */
    protected moveApplyScrollPrev(prevIndex: number): void {
        for (let i = prevIndex - 1; i >= this.state.startIndex  && this.igxForOf[i] !== undefined; i--) {
            const input = this.igxForOf[i];
            const embView = this._embeddedViews.pop();
            const cntx = embView.context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
            const view: ViewRef = this.dc.instance._vcr.detach(this.dc.instance._vcr.length - 1);
            this.dc.instance._vcr.insert(view, 0);
            this._embeddedViews.unshift(embView);
        }
    }

    /**
     * @hidden
     * The function applies an optimized state change through context change for each view
     */
    protected fixedApplyScroll(): void {
        let j = 0;
        const endIndex = this.state.startIndex + this.state.chunkSize;
        for (let i = this.state.startIndex; i < endIndex && this.igxForOf[i] !== undefined; i++) {
            const input = this.igxForOf[i];
            const embView = this._embeddedViews[j++];
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
        }
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
        const prevStartIndex = this.state.startIndex;
        // Updating horizontal chunks
        const scrollOffset = this.fixedUpdateAllElements(curScrollLeft);
        this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';

        this.dc.changeDetectorRef.detectChanges();
        if (prevStartIndex !== this.state.startIndex) {
            this.onChunkLoad.emit(this.state);
        }
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
        const prevChunkSize = this.state.chunkSize;
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
            if (prevChunkSize !== this.state.chunkSize) {
                this.onChunkLoad.emit(this.state);
            }
            if (this.igxForScrollOrientation === 'vertical') {
                this.recalcUpdateSizes();
            }
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
            if (!this.sizesCache) {
                this.initSizesCache(this.igxForOf);
            }
            chunkSize = this._calcMaxChunkSize();
            if (this.igxForOf && chunkSize > this.igxForOf.length) {
                chunkSize = this.igxForOf.length;
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
    protected initSizesCache(items: any[]): number {
        let totalSize = 0;
        let size = 0;
        const dimension = this.igxForScrollOrientation === 'horizontal' ?
            this.igxForSizePropName : 'height';
        let i = 0;
        this.sizesCache = [];
        this.heightCache = [];
        this.sizesCache.push(0);
        const count = this.isRemote ? this.totalItemCount : items.length;
        for (i; i < count; i++) {
            if (dimension === 'height') {
                // cols[i][dimension] = parseInt(this.igxForItemSize, 10) || 0;
                size = parseInt(this.igxForItemSize, 10) || 0;
                this.heightCache.push(size);
            } else {
                size = this._getItemSize(items[i], dimension);
            }
            totalSize += size;
            this.sizesCache.push(totalSize);
        }
        return totalSize;
    }

    protected _updateSizeCache() {
        if (this.igxForScrollOrientation === 'horizontal') {
            this.initSizesCache(this.igxForOf);
            return;
        }
        const scr = this.vh.instance.elementRef.nativeElement;

        const oldHeight = this.heightCache.length > 0 ? this.heightCache.reduce((acc, val) => acc + val) : 0;
        const newHeight =  this.initSizesCache(this.igxForOf);

        const diff = oldHeight - newHeight;

        // if data has been changed while container is scrolled
        // should update scroll top/left according to change so that same startIndex is in view
        if (Math.abs(diff) > 0 && scr.scrollTop > 0) {
            this.recalcUpdateSizes();
            const offset = parseInt(this.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            scr.scrollTop = this.sizesCache[this.state.startIndex] - offset;
        }
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
        const dimension = this.igxForScrollOrientation === 'horizontal' ?
        this.igxForSizePropName : 'height';
        const reducer = (accumulator, currentItem) => accumulator + this._getItemSize(currentItem, dimension);
        const availableSize = parseInt(this.igxForContainerSize, 10);
        for (i; i < this.igxForOf.length; i++) {
            let item = this.igxForOf[i];
            if (dimension === 'height') {
                item = { value: this.igxForOf[i], height: this.heightCache[i] };
            }
            const size = dimension === 'height' ?
                this.heightCache[i] :
                this._getItemSize(item, dimension);
            sum = arr.reduce(reducer, size);
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
                        const prevSize = dimension === 'height' ?
                            this.heightCache[prevIndex] :
                            parseInt(prevItem[dimension], 10);
                        sum = arr.reduce(reducer, prevSize);
                        arr.unshift(prevItem);
                        length = arr.length;
                    }
                }
            } else {
                arr.push(item);
                length = dimension === this.igxForSizePropName ? arr.length + 1 : arr.length;
                if (dimension === 'height') {
                    const maxItemSize = arr.reduce((pr, c) => Math.max(pr, this._getItemSize(c, dimension)), 0);
                    if (sum - availableSize < maxItemSize) {
                        // add one more for vertical smooth scroll
                        length++;
                    }
                }
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
    protected getIndexAt(left, set, index) {
        let start = 0;
        let end = set.length - 1;
        if (left === 0) {
            return 0;
        }
        while (start <= end) {
            const midIdx = Math.floor((start + end) / 2);
            const midLeft = set[midIdx];
            const cmp = left - midLeft;
            if (cmp > 0) {
                start = midIdx + 1;
            } else if (cmp < 0) {
                end = midIdx - 1;
            } else {
                return midIdx;
            }
        }
        return end;
    }

    protected _recalcScrollBarSize() {
        const count = this.isRemote ? this.totalItemCount : (this.igxForOf ? this.igxForOf.length : 0);
        this.dc.instance.notVirtual = !(this.igxForContainerSize && this.dc && this.state.chunkSize < count);
        if (this.igxForScrollOrientation === 'horizontal') {
            const totalWidth = this.igxForContainerSize ? this.initSizesCache(this.igxForOf) : 0;
            this.hScroll.style.width = this.igxForContainerSize + 'px';
            this.hScroll.children[0].style.width = totalWidth + 'px';
        }
        if (this.igxForScrollOrientation === 'vertical') {
            this.vh.instance.elementRef.nativeElement.style.height = parseInt(this.igxForContainerSize, 10) + 'px';
            this.vh.instance.height = this._calcHeight();
        }
    }

    protected _calcHeight(): number {
        let height;
        if (this.heightCache) {
            height = this.heightCache.reduce((acc, val) => acc + val, 0);
        } else {
            height = this.initSizesCache(this.igxForOf);
        }
        this._virtHeight = height;
        if (height > this._maxHeight) {
            this._virtHeightRatio = height / this._maxHeight;
            height = this._maxHeight;
        }
        return height;
    }

    protected _recalcOnContainerChange(changes: SimpleChanges) {
        this.dc.instance._viewContainer.element.nativeElement.style.top = '0px';
        this.dc.instance._viewContainer.element.nativeElement.style.left = '0px';
        const prevChunkSize = this.state.chunkSize;
        this.applyChunkSizeChange();
        this._recalcScrollBarSize();
        if (prevChunkSize !== this.state.chunkSize) {
            this.onChunkLoad.emit(this.state);
        }
        if (this.sizesCache && this.hScroll && this.hScroll.scrollLeft !== 0) {
            // Updating horizontal chunks and offsets based on the new scrollLeft
            const scrollOffset = this.fixedUpdateAllElements(this.hScroll.scrollLeft);
            this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';
        }
    }

    /**
     * @hidden
     * Removes an elemenet from the embedded views and updates chunkSize.
     */
    protected removeLastElem() {
        const oldElem = this._embeddedViews.pop();
        this.onBeforeViewDestroyed.emit(oldElem);
        oldElem.destroy();

        this.state.chunkSize--;
    }

    /**
     * @hidden
     * If there exists an element that we can create embedded view for creates it, appends it and updates chunkSize
     */
    protected addLastElem() {
        let elemIndex = this.state.startIndex + this.state.chunkSize;
        if (!this.isRemote && !this.igxForOf) {
            return;
        }

        if (elemIndex >= this.igxForOf.length) {
            elemIndex = this.igxForOf.length - this.state.chunkSize;
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
    protected applyChunkSizeChange() {
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

    protected _updateScrollOffset() {
        if (this.igxForScrollOrientation === 'horizontal') {
            this._updateHScrollOffset();
        } else {
            this._updateVScrollOffset();
        }
    }
    private _updateVScrollOffset() {
        let scrollOffset = 0;
        const vScroll = this.vh.instance.elementRef.nativeElement;
        scrollOffset = vScroll && parseInt(vScroll.style.height, 10) ?
            vScroll.scrollTop - this.sizesCache[this.state.startIndex] : 0;
        this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';
    }
    private _updateHScrollOffset() {
        let scrollOffset = 0;
        scrollOffset = this.hScroll && parseInt(this.hScroll.children[0].style.width, 10) ?
            this.hScroll.scrollLeft - this.sizesCache[this.state.startIndex] : 0;
        this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';
    }

    private _getItemSize(item, dimension: string): number {
        const hasDimension = (item[dimension] !== null && item[dimension] !== undefined);
        return hasDimension ? parseInt(item[dimension], 10) : this.igxForItemSize;
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

@Directive({
    selector: '[igxGridFor][igxGridForOf]'
})
export class IgxGridForOfDirective<T> extends IgxForOfDirective<T> implements OnInit, OnChanges, DoCheck {

    @Input()
    set igxGridForOf(value) {
        this.igxForOf = value;
    }

    get igxGridForOf() {
        return this.igxForOf;
    }

    ngOnInit() {
        super.ngOnInit();
        this.removeScrollEventListeners();
    }

    ngOnChanges(changes: SimpleChanges) {
        const forOf = 'igxGridForOf';
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
        const defaultItemSize = 'igxForItemSize';
        if (defaultItemSize in changes && !changes[defaultItemSize].firstChange && this.igxForScrollOrientation === 'vertical') {
            // handle default item size changed.
            this.initSizesCache(this.igxForOf);
        }
        const containerSize = 'igxForContainerSize';
        if (containerSize in changes && !changes[containerSize].firstChange && this.igxForOf) {
            this._recalcOnContainerChange(changes);
        }
    }

    protected initSizesCache(items: any[]): number {
        let totalSize = 0;
        let size = 0;
        const dimension = this.igxForScrollOrientation === 'horizontal' ?
            this.igxForSizePropName : 'height';
        let i = 0;
        this.sizesCache = [];
        this.heightCache = [];
        this.sizesCache.push(0);
        const count = this.isRemote ? this.totalItemCount : items.length;
        for (i; i < count; i++) {
            if (dimension === 'height') {
                size = parseInt(this.igxForItemSize, 10) || 0;
                if (items[i] && items[i].summaries) {
                    size = items[i].max;
                }
                this.heightCache.push(size);
            } else {
                size = parseInt(items[i][dimension], 10) || 0;
            }
            totalSize += size;
            this.sizesCache.push(totalSize);
        }
        return totalSize;
    }

    protected _updateSizeCache() {
        if (this.igxForScrollOrientation === 'horizontal') {
            this.initSizesCache(this.igxForOf);
            return;
        }
        const scr = this.vh.instance.elementRef.nativeElement;

        const oldHeight = this.heightCache.length > 0 ? this.heightCache.reduce((acc, val) => acc + val) : 0;
        const newHeight =  this.initSizesCache(this.igxForOf);

        const diff = oldHeight - newHeight;

        // if data has been changed while container is scrolled
        // should update scroll top/left according to change so that same startIndex is in view
        if (Math.abs(diff) > 0 && scr.scrollTop > 0) {
                this.recalcUpdateSizes();
                const offset = parseInt(this.dc.instance._viewContainer.element.nativeElement.style.top, 10);
                scr.scrollTop = this.sizesCache[this.state.startIndex] - offset;
        }
    }

    ngDoCheck() {
        if (this._differ) {
            const changes = this._differ.diff(this.igxForOf);
            if (changes) {
                //  re-init cache.
                if (!this.igxForOf) {
                    return;
                }
                const operations = [];
                changes.forEachOperation((op) => operations.push(op));
                if (operations.length > 0) {
                    // only update if some operation was done - adding/removing/moving of items
                    this._updateSizeCache();
                }
                this._applyChanges(changes);
                this.cdr.markForCheck();
                this._updateScrollOffset();
                if (operations.length > 0) {
                    this.onDataChanged.emit();
                }
            }
        }
    }

    onScroll(event) {
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

        const scrollOffset = this.fixedUpdateAllElements(this._virtScrollTop);

        this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';
        requestAnimationFrame(() => {
            this.recalcUpdateSizes();
        });
    }

    onHScroll(scrollAmount) {
        /* in certain situations this may be called when no scrollbar is visible */
        if (!this.hScroll || !parseInt(this.hScroll.children[0].style.width, 10)) {
            return;
        }

        // Updating horizontal chunks
        const scrollOffset = this.fixedUpdateAllElements(scrollAmount);
        this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';
    }

    protected addLastElem() {
        let elemIndex = this.state.startIndex + this.state.chunkSize;
        if (!this.isRemote && !this.igxForOf) {
            return;
        }

        if (elemIndex >= this.igxForOf.length) {
            elemIndex = this.igxForOf.length - this.state.chunkSize;
        }
        const input = this.igxForOf[elemIndex];
        const embeddedView = this.dc.instance._vcr.createEmbeddedView(
            this._template,
            { $implicit: input, index: elemIndex }
        );

        this._embeddedViews.push(embeddedView);
        this.state.chunkSize++;
    }

    protected _applyChanges(changes: IterableChanges<T>) {
        const prevChunkSize = this.state.chunkSize;
        this.applyChunkSizeChange();
        this._recalcScrollBarSize();
        if (this.igxForOf && this.igxForOf.length && this.dc) {
            const embeddedViewCopy = Object.assign([], this._embeddedViews);
            let startIndex;
            let endIndex;
            if (this.isRemote) {
                startIndex = 0;
                endIndex = this.igxForOf.length;
            } else {
                const inScrollTop = this.igxForScrollOrientation === 'horizontal' ?
                    this.hScroll.scrollLeft :
                    this.vh.instance.elementRef.nativeElement.scrollTop;
                startIndex = this.getIndexAt(
                    inScrollTop,
                    this.sizesCache,
                    0
                );
                if (startIndex + this.state.chunkSize > this.igxForOf.length) {
                    startIndex = this.igxForOf.length - this.state.chunkSize;
                }
                this.state.startIndex = startIndex;
                endIndex = this.state.chunkSize + this.state.startIndex;
            }

            for (let i = startIndex; i < endIndex && this.igxForOf[i] !== undefined; i++) {
                const input = this.igxForOf[i];
                const embView = embeddedViewCopy.shift();
                const cntx = (embView as EmbeddedViewRef<any>).context;
                cntx.$implicit = input;
                cntx.index = this.igxForOf.indexOf(input);
            }
            if (prevChunkSize !== this.state.chunkSize) {
                this.onChunkLoad.emit(this.state);
            }
            if (this.igxForScrollOrientation === 'vertical') {
                requestAnimationFrame(() => {
                    this.recalcUpdateSizes();
                });
            }
        }
    }
}
/**
 * The IgxForOfModule provides the {@link IgxForOfDirective}, inside your application.
 */

@NgModule({
    declarations: [IgxForOfDirective, IgxGridForOfDirective, DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
    entryComponents: [DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
    exports: [IgxForOfDirective, IgxGridForOfDirective],
    imports: [IgxScrollInertiaModule, CommonModule]
})

export class IgxForOfModule {
}
