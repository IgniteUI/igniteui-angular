import { DOCUMENT, NgForOfContext } from '@angular/common';
import {
    ChangeDetectorRef,
    ComponentRef,
    Directive,
    DoCheck,
    EmbeddedViewRef,
    EventEmitter,
    Input,
    IterableChanges,
    IterableDiffer,
    IterableDiffers,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewContainerRef,
    AfterViewInit,
    Inject,
    booleanAttribute
} from '@angular/core';

import { DisplayContainerComponent } from './display.container';
import { HVirtualHelperComponent } from './horizontal.virtual.helper.component';
import { VirtualHelperComponent } from './virtual.helper.component';

import { IgxForOfSyncService, IgxForOfScrollSyncService } from './for_of.sync.service';
import { Subject } from 'rxjs';
import { takeUntil, filter, throttleTime, first } from 'rxjs/operators';
import { getResizeObserver } from '../../core/utils';
import { IBaseEventArgs, PlatformUtil } from '../../core/utils';
import { VirtualHelperBaseDirective } from './base.helper.component';

const MAX_PERF_SCROLL_DIFF = 4;

/**
 *  @publicApi
 */
export class IgxForOfContext<T, U extends T[] = T[]> {
    constructor(
        public $implicit: T,
        public igxForOf: U,
        public index: number,
        public count: number
    ) { }

    /**
     * A function that returns whether the element is the first or not
     */
    public get first(): boolean {
        return this.index === 0;
    }

    /**
     * A function that returns whether the element is the last or not
     */
    public get last(): boolean {
        return this.index === this.count - 1;
    }

    /**
     * A function that returns whether the element is even or not
     */
    public get even(): boolean {
        return this.index % 2 === 0;
    }

    /**
     * A function that returns whether the element is odd or not
     */
    public get odd(): boolean {
        return !this.even;
    }

}

/** @hidden @internal */
export abstract class IgxForOfToken<T, U extends T[] = T[]> {
    public abstract igxForOf: U & T[] | null;
    public abstract state: IForOfState;
    public abstract totalItemCount: number;
    public abstract scrollPosition: number;

    public abstract chunkLoad: EventEmitter<IForOfState>;
    public abstract chunkPreload: EventEmitter<IForOfState>;

    public abstract scrollTo(index: number): void;
    public abstract getScrollForIndex(index: number, bottom?: boolean): number;
    public abstract getScroll(): HTMLElement | undefined;

    // TODO: Re-evaluate use for this internally, better expose through separate API
    public abstract igxForItemSize: any;
    public abstract igxForContainerSize: any;
    /** @hidden */
    public abstract dc: ComponentRef<any>
}

@Directive({
    selector: '[igxFor][igxForOf]',
    providers: [
        IgxForOfScrollSyncService,
        { provide: IgxForOfToken, useExisting: IgxForOfDirective }
    ],
    standalone: true
})
export class IgxForOfDirective<T, U extends T[] = T[]> extends IgxForOfToken<T,U> implements OnInit, OnChanges, DoCheck, OnDestroy, AfterViewInit {

    /**
     * Sets the data to be rendered.
     * ```html
     * <ng-template igxFor let-item [igxForOf]="data" [igxForScrollOrientation]="'horizontal'"></ng-template>
     * ```
     */
    @Input()
    public igxForOf: U & T[] | null;

    /**
     * Sets the property name from which to read the size in the data object.
     */
    @Input()
    public igxForSizePropName;

    /**
     * Specifies the scroll orientation.
     * Scroll orientation can be "vertical" or "horizontal".
     * ```html
     * <ng-template igxFor let-item [igxForOf]="data" [igxForScrollOrientation]="'horizontal'"></ng-template>
     * ```
     */
    @Input()
    public igxForScrollOrientation = 'vertical';

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
     * Sets the px-affixed size of the container along the axis of scrolling.
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
     * @hidden
     * @internal
     * Initial chunk size if no container size is passed. If container size is passed then the igxForOf calculates its chunk size
     */
    @Input()
    public igxForInitialChunkSize: any;

    /**
     * Sets the px-affixed size of the item along the axis of scrolling.
     * For "horizontal" orientation this value is the width of the column and for "vertical" is the height or the row.
     * ```html
     * <ng-template igxFor let-item [igxForOf]="data" [igxForScrollOrientation]="'horizontal'" [igxForItemSize]="'50px'"></ng-template>
     * ```
     */
    @Input()
    public igxForItemSize: any;

    /**
     * An event that is emitted after a new chunk has been loaded.
     * ```html
     * <ng-template igxFor [igxForOf]="data" [igxForScrollOrientation]="'horizontal'" (chunkLoad)="loadChunk($event)"></ng-template>
     * ```
     * ```typescript
     * loadChunk(e){
     * alert("chunk loaded!");
     * }
     * ```
     */
    @Output()
    public chunkLoad = new EventEmitter<IForOfState>();

    /**
     * @hidden @internal
     * An event that is emitted when scrollbar visibility has changed.
     */
    @Output()
    public scrollbarVisibilityChanged = new EventEmitter<any>();

    /**
     * An event that is emitted after the rendered content size of the igxForOf has been changed.
     */
    @Output()
    public contentSizeChange = new EventEmitter<any>();

    /**
     * An event that is emitted after data has been changed.
     * ```html
     * <ng-template igxFor [igxForOf]="data" [igxForScrollOrientation]="'horizontal'" (dataChanged)="dataChanged($event)"></ng-template>
     * ```
     * ```typescript
     * dataChanged(e){
     * alert("data changed!");
     * }
     * ```
     */
    @Output()
    public dataChanged = new EventEmitter<any>();

    @Output()
    public beforeViewDestroyed = new EventEmitter<EmbeddedViewRef<any>>();

    /**
     * An event that is emitted on chunk loading to emit the current state information - startIndex, endIndex, totalCount.
     * Can be used for implementing remote load on demand for the igxFor data.
     * ```html
     * <ng-template igxFor [igxForOf]="data" [igxForScrollOrientation]="'horizontal'" (chunkPreload)="chunkPreload($event)"></ng-template>
     * ```
     * ```typescript
     * chunkPreload(e){
     * alert("chunk is loading!");
     * }
     * ```
     */
    @Output()
    public chunkPreload = new EventEmitter<IForOfState>();

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

    protected func;
    protected _sizesCache: number[] = [];
    protected scrollComponent: VirtualHelperBaseDirective;
    protected _differ: IterableDiffer<T> | null = null;
    protected _trackByFn: TrackByFunction<T>;
    protected individualSizeCache: number[] = [];
    /** Internal track for scroll top that is being virtualized */
    protected _virtScrollPosition = 0;
    /** If the next onScroll event is triggered due to internal setting of scrollTop */
    protected _bScrollInternal = false;
    // End properties related to virtual height handling
    protected _embeddedViews: Array<EmbeddedViewRef<any>> = [];
    protected contentResizeNotify = new Subject<void>();
    protected contentObserver: ResizeObserver;
    /** Size that is being virtualized. */
    protected _virtSize = 0;
    /**
     * @hidden
     */
    protected destroy$ = new Subject<any>();

    private _totalItemCount: number = null;
    private _adjustToIndex;
    // Start properties related to virtual size handling due to browser limitation
    /** Maximum size for an element of the browser. */
    private _maxSize;
    /**
     * Ratio for height that's being virtualizaed and the one visible
     * If _virtHeightRatio = 1, the visible height and the virtualized are the same, also _maxSize > _virtHeight.
     */
    private _virtRatio = 1;

    /**
     * The total count of the virtual data items, when using remote service.
     * Similar to the property totalItemCount, but this will allow setting the data count into the template.
     * ```html
     * <ng-template igxFor let-item [igxForOf]="data | async" [igxForTotalItemCount]="count | async"
     *  [igxForContainerSize]="'500px'" [igxForItemSize]="'50px'"></ng-template>
     * ```
     */
    @Input()
    public get igxForTotalItemCount(): number {
        return this.totalItemCount;
    }
    public set igxForTotalItemCount(value: number) {
        this.totalItemCount = value;
    }

    /**
     * The total count of the virtual data items, when using remote service.
     * ```typescript
     * this.parentVirtDir.totalItemCount = data.Count;
     * ```
     */
    public get totalItemCount() {
        return this._totalItemCount;
    }

    public set totalItemCount(val) {
        if (this._totalItemCount !== val) {
            this._totalItemCount = val;
            // update sizes in case total count changes.
            const newSize = this.initSizesCache(this.igxForOf);
            const sizeDiff = this.scrollComponent.size - newSize;
            this.scrollComponent.size = newSize;
            const lastChunkExceeded = this.state.startIndex + this.state.chunkSize > val;
            if (lastChunkExceeded) {
                this.state.startIndex = val - this.state.chunkSize;
            }
            this._adjustScrollPositionAfterSizeChange(sizeDiff);
        }
    }

    public get displayContainer(): HTMLElement | undefined {
        return this.dc?.instance?._viewContainer?.element?.nativeElement;
    }

    public get virtualHelper() {
        return this.scrollComponent.nativeElement;
    }

    /**
     * @hidden
     */
    public get isRemote(): boolean {
        return this.totalItemCount !== null;
    }

    /**
     *
     * Gets/Sets the scroll position.
     * ```typescript
     * const position = directive.scrollPosition;
     * directive.scrollPosition = value;
     * ```
     */
    public get scrollPosition(): number {
        return this.scrollComponent.scrollAmount;
    }
    public set scrollPosition(val: number) {
        if (val === this.scrollComponent.scrollAmount) {
            return;
        }
        if (this.igxForScrollOrientation === 'horizontal' && this.scrollComponent) {
            this.scrollComponent.nativeElement.scrollLeft = this.isRTL ? -val : val;
        } else if (this.scrollComponent) {
            this.scrollComponent.nativeElement.scrollTop = val;
        }
    }

    /**
     * @hidden
     */
    protected get isRTL() {
        const dir = window.getComputedStyle(this.dc.instance._viewContainer.element.nativeElement).getPropertyValue('direction');
        return dir === 'rtl';
    }

    protected get sizesCache(): number[] {
        return this._sizesCache;
    }
    protected set sizesCache(value: number[]) {
        this._sizesCache = value;
    }

    private get _isScrolledToBottom() {
        if (!this.getScroll()) {
            return true;
        }
        const scrollHeight = this.getScroll().scrollHeight;
        // Use === and not >= because `scrollTop + container size` can't be bigger than `scrollHeight`, unless something isn't updated.
        // Also use Math.round because Chrome has some inconsistencies and `scrollTop + container` can be float when zooming the page.
        return Math.round(this.getScroll().scrollTop + this.igxForContainerSize) === scrollHeight;
    }

    private get _isAtBottomIndex() {
        return this.igxForOf && this.state.startIndex + this.state.chunkSize > this.igxForOf.length;
    }

    constructor(
        private _viewContainer: ViewContainerRef,
        protected _template: TemplateRef<NgForOfContext<T>>,
        protected _differs: IterableDiffers,
        public cdr: ChangeDetectorRef,
        protected _zone: NgZone,
        protected syncScrollService: IgxForOfScrollSyncService,
        protected platformUtil: PlatformUtil,
        @Inject(DOCUMENT)
        protected document: any,
    ) {
        super();
    }

    public verticalScrollHandler(event) {
        this.onScroll(event);
    }

    public isScrollable() {
        return this.scrollComponent.size > parseInt(this.igxForContainerSize, 10);
    }

    /**
     * @hidden
     */
    public ngOnInit(): void {
        const vc = this.igxForScrollContainer ? this.igxForScrollContainer._viewContainer : this._viewContainer;
        this.igxForSizePropName = this.igxForSizePropName || 'width';
        this.dc = this._viewContainer.createComponent(DisplayContainerComponent, { index: 0 });
        this.dc.instance.scrollDirection = this.igxForScrollOrientation;
        if (this.igxForOf && this.igxForOf.length) {
            this.scrollComponent = this.syncScrollService.getScrollMaster(this.igxForScrollOrientation);
            this.state.chunkSize = this._calculateChunkSize();
            this.dc.instance.notVirtual = !(this.igxForContainerSize && this.state.chunkSize < this.igxForOf.length);
            if (this.scrollComponent && !this.scrollComponent.destroyed) {
                this.state.startIndex = Math.min(this.getIndexAt(this.scrollPosition, this.sizesCache),
                    this.igxForOf.length - this.state.chunkSize);
            }
            for (let i = this.state.startIndex; i < this.state.startIndex + this.state.chunkSize &&
                this.igxForOf[i] !== undefined; i++) {
                const input = this.igxForOf[i];
                const embeddedView = this.dc.instance._vcr.createEmbeddedView(
                    this._template,
                    new IgxForOfContext<T, U>(input, this.igxForOf, this.getContextIndex(input), this.igxForOf.length)
                );
                this._embeddedViews.push(embeddedView);
            }
        }
        this._maxSize = this._calcMaxBrowserSize();
        if (this.igxForScrollOrientation === 'vertical') {
            this.dc.instance._viewContainer.element.nativeElement.style.top = '0px';
            this.scrollComponent = this.syncScrollService.getScrollMaster(this.igxForScrollOrientation);
            if (!this.scrollComponent || this.scrollComponent.destroyed) {
                this.scrollComponent = vc.createComponent(VirtualHelperComponent).instance;
            }

            this.scrollComponent.size = this.igxForOf ? this._calcSize() : 0;
            this.syncScrollService.setScrollMaster(this.igxForScrollOrientation, this.scrollComponent);
            this._zone.runOutsideAngular(() => {
                this.verticalScrollHandler = this.verticalScrollHandler.bind(this);
                this.scrollComponent.nativeElement.addEventListener('scroll', this.verticalScrollHandler);
                this.dc.instance.scrollContainer = this.scrollComponent.nativeElement;
            });
            const destructor = takeUntil<any>(this.destroy$);
            this.contentResizeNotify.pipe(
                filter(() => this.igxForContainerSize && this.igxForOf && this.igxForOf.length > 0),
                throttleTime(40, undefined, { leading: false, trailing: true }),
                destructor
            ).subscribe(() => this._zone.runTask(() => this.updateSizes()));
        }

        if (this.igxForScrollOrientation === 'horizontal') {
            this.func = (evt) => this.onHScroll(evt);
            this.scrollComponent = this.syncScrollService.getScrollMaster(this.igxForScrollOrientation);
            if (!this.scrollComponent) {
                this.scrollComponent = vc.createComponent(HVirtualHelperComponent).instance;
                this.scrollComponent.size = this.igxForOf ? this._calcSize() : 0;
                this.syncScrollService.setScrollMaster(this.igxForScrollOrientation, this.scrollComponent);
                this._zone.runOutsideAngular(() => {
                    this.scrollComponent.nativeElement.addEventListener('scroll', this.func);
                    this.dc.instance.scrollContainer = this.scrollComponent.nativeElement;
                });
            } else {
                this._zone.runOutsideAngular(() => {
                    this.scrollComponent.nativeElement.addEventListener('scroll', this.func);
                    this.dc.instance.scrollContainer = this.scrollComponent.nativeElement;
                });
            }
            this._updateScrollOffset();
        }
    }

    public ngAfterViewInit(): void {
        if (this.igxForScrollOrientation === 'vertical') {
            this._zone.runOutsideAngular(() => {
                if (this.platformUtil.isBrowser) {
                    this.contentObserver = new (getResizeObserver())(() => this.contentResizeNotify.next());
                    this.contentObserver.observe(this.dc.instance._viewContainer.element.nativeElement);
                }
            });
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.removeScrollEventListeners();
        this.destroy$.next(true);
        this.destroy$.complete();
        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
    }

    /**
     * @hidden @internal
     * Asserts the correct type of the context for the template that `igxForOf` will render.
     *
     * The presence of this method is a signal to the Ivy template type-check compiler that the
     * `IgxForOf` structural directive renders its template with a specific context type.
     */
    public static ngTemplateContextGuard<T, U extends T[]>(dir: IgxForOfDirective<T, U>, ctx: any):
        ctx is IgxForOfContext<T, U> {
        return true;
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
        if (defaultItemSize in changes && !changes[defaultItemSize].firstChange && this.igxForOf) {
            // handle default item size changed.
            this.initSizesCache(this.igxForOf);
            this._applyChanges();
        }
        const containerSize = 'igxForContainerSize';
        if (containerSize in changes && !changes[containerSize].firstChange && this.igxForOf) {
            const prevSize = parseInt(changes[containerSize].previousValue, 10);
            const newSize = parseInt(changes[containerSize].currentValue, 10);
            this._recalcOnContainerChange({prevSize, newSize});
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
                    this.igxForOf = [] as U;
                }
                this._updateSizeCache();
                this._zone.run(() => {
                    this._applyChanges();
                    this.cdr.markForCheck();
                    this._updateScrollOffset();
                    const args: IForOfDataChangingEventArgs = {
                        containerSize: this.igxForContainerSize,
                        state: this.state
                    };
                    this.dataChanged.emit(args);
                });
            }
        }
    }


    /**
     * Shifts the scroll thumb position.
     * ```typescript
     * this.parentVirtDir.addScroll(5);
     * ```
     *
     * @param addTop negative value to scroll up and positive to scroll down;
     */
    public addScrollTop(add: number): boolean {
        return this.addScroll(add);
    }

    /**
     * Shifts the scroll thumb position.
     * ```typescript
     * this.parentVirtDir.addScroll(5);
     * ```
     *
     * @param add negative value to scroll previous and positive to scroll next;
     */
    public addScroll(add: number): boolean {
        if (add === 0) {
            return false;
        }
        const originalVirtScrollTop = this._virtScrollPosition;
        const containerSize = parseInt(this.igxForContainerSize, 10);
        const maxVirtScrollTop = this._virtSize - containerSize;

        this._bScrollInternal = true;
        this._virtScrollPosition += add;
        this._virtScrollPosition = this._virtScrollPosition > 0 ?
            (this._virtScrollPosition < maxVirtScrollTop ? this._virtScrollPosition : maxVirtScrollTop) :
            0;

        this.scrollPosition += add / this._virtRatio;
        if (Math.abs(add / this._virtRatio) < 1) {
            // Actual scroll delta that was added is smaller than 1 and onScroll handler doesn't trigger when scrolling < 1px
            const scrollOffset = this.fixedUpdateAllElements(this._virtScrollPosition);
            // scrollOffset = scrollOffset !== parseInt(this.igxForItemSize, 10) ? scrollOffset : 0;
            this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';
        }

        const maxRealScrollTop = this.scrollComponent.nativeElement.scrollHeight - containerSize;
        if ((this._virtScrollPosition > 0 && this.scrollPosition === 0) ||
            (this._virtScrollPosition < maxVirtScrollTop && this.scrollPosition === maxRealScrollTop)) {
            // Actual scroll position is at the top or bottom, but virtual one is not at the top or bottom (there's more to scroll)
            // Recalculate actual scroll position based on the virtual scroll.
            this.scrollPosition = this._virtScrollPosition / this._virtRatio;
        } else if (this._virtScrollPosition === 0 && this.scrollPosition > 0) {
            // Actual scroll position is not at the top, but virtual scroll is. Just update the actual scroll
            this.scrollPosition = 0;
        } else if (this._virtScrollPosition === maxVirtScrollTop && this.scrollPosition < maxRealScrollTop) {
            // Actual scroll position is not at the bottom, but virtual scroll is. Just update the acual scroll
            this.scrollPosition = maxRealScrollTop;
        }
        return this._virtScrollPosition !== originalVirtScrollTop;
    }

    /**
     * Scrolls to the specified index.
     * ```typescript
     * this.parentVirtDir.scrollTo(5);
     * ```
     *
     * @param index
     */
    public scrollTo(index: number) {
        if (index < 0 || index > (this.isRemote ? this.totalItemCount : this.igxForOf.length) - 1) {
            return;
        }
        const containerSize = parseInt(this.igxForContainerSize, 10);
        const isPrevItem = index < this.state.startIndex || this.scrollPosition > this.sizesCache[index];
        let nextScroll = isPrevItem ? this.sizesCache[index] : this.sizesCache[index + 1] - containerSize;
        if (nextScroll < 0) {
            return;
        }
        const maxVirtScrollTop = this._virtSize - containerSize;
        if (nextScroll > maxVirtScrollTop) {
            nextScroll = maxVirtScrollTop;
        }
        this._bScrollInternal = true;
        this._virtScrollPosition = nextScroll;
        this.scrollPosition = this._virtScrollPosition / this._virtRatio;
        this._adjustToIndex = !isPrevItem ? index : null;
    }

    /**
     * Scrolls by one item into the appropriate next direction.
     * For "horizontal" orientation that will be the right column and for "vertical" that is the lower row.
     * ```typescript
     * this.parentVirtDir.scrollNext();
     * ```
     */
    public scrollNext() {
        const scr = Math.abs(Math.ceil(this.scrollPosition));
        const endIndex = this.getIndexAt(scr + parseInt(this.igxForContainerSize, 10), this.sizesCache);
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
        this.addScroll(parseInt(this.igxForContainerSize, 10));
    }

    /**
     * Scrolls by one page into the appropriate previous direction.
     * For "horizontal" orientation that will be one view to the left and for "vertical" that is one view to the top.
     * ```typescript
     * this.parentVirtDir.scrollPrevPage();
     * ```
     */
    public scrollPrevPage() {
        const containerSize = (parseInt(this.igxForContainerSize, 10));
        this.addScroll(-containerSize);
    }

    /**
     * @hidden
     */
    public getColumnScrollLeft(colIndex) {
        return this.sizesCache[colIndex];
    }

    /**
     * Returns the total number of items that are fully visible.
     * ```typescript
     * this.parentVirtDir.getItemCountInView();
     * ```
     */
    public getItemCountInView() {
        let startIndex = this.getIndexAt(this.scrollPosition, this.sizesCache);
        if (this.scrollPosition - this.sizesCache[startIndex] > 0) {
            // fisrt item is not fully in view
            startIndex++;
        }
        const endIndex = this.getIndexAt(this.scrollPosition + parseInt(this.igxForContainerSize, 10), this.sizesCache);
        return endIndex - startIndex;
    }

    /**
     * Returns a reference to the scrollbar DOM element.
     * This is either a vertical or horizontal scrollbar depending on the specified igxForScrollOrientation.
     * ```typescript
     * dir.getScroll();
     * ```
     */
    public getScroll() {
        return this.scrollComponent?.nativeElement;
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
     * @hidden
     * Function that is called to get the native scrollbar size that the browsers renders.
     */
    public getScrollNativeSize() {
        return this.scrollComponent ? this.scrollComponent.scrollNativeSize : 0;
    }

    /**
     * Returns the scroll offset of the element at the specified index.
     * ```typescript
     * this.parentVirtDir.getScrollForIndex(1);
     * ```
     */
    public getScrollForIndex(index: number, bottom?: boolean) {
        const containerSize = parseInt(this.igxForContainerSize, 10);
        const scroll = bottom ? Math.max(0, this.sizesCache[index + 1] - containerSize) : this.sizesCache[index];
        return scroll;
    }

    /**
     * Returns the index of the element at the specified offset.
     * ```typescript
     * this.parentVirtDir.getIndexAtScroll(100);
     * ```
     */
    public getIndexAtScroll(scrollOffset: number) {
        return this.getIndexAt(scrollOffset, this.sizesCache);
    }
    /**
     * Returns whether the target index is outside the view.
     * ```typescript
     * this.parentVirtDir.isIndexOutsideView(10);
     * ```
     */
    public isIndexOutsideView(index: number) {
        const targetNode = index >= this.state.startIndex && index <= this.state.startIndex + this.state.chunkSize ?
            this._embeddedViews.map(view =>
                view.rootNodes.find(node => node.nodeType === Node.ELEMENT_NODE) || view.rootNodes[0].nextElementSibling)[index - this.state.startIndex] : null;
        const rowHeight = this.getSizeAt(index);
        const containerSize = parseInt(this.igxForContainerSize, 10);
        const containerOffset = -(this.scrollPosition - this.sizesCache[this.state.startIndex]);
        const endTopOffset = targetNode ? targetNode.offsetTop + rowHeight + containerOffset : containerSize + rowHeight;
        return !targetNode || targetNode.offsetTop < Math.abs(containerOffset)
            || containerSize && endTopOffset - containerSize > 5;
    }

    /**
     * @hidden
     * Function that recalculates and updates cache sizes.
     */
    public recalcUpdateSizes() {
        const dimension = this.igxForScrollOrientation === 'horizontal' ?
            this.igxForSizePropName : 'height';
        const diffs = [];
        let totalDiff = 0;
        const l = this._embeddedViews.length;
        const rNodes = this._embeddedViews.map(view =>
            view.rootNodes.find(node => node.nodeType === Node.ELEMENT_NODE) || view.rootNodes[0].nextElementSibling);
        for (let i = 0; i < l; i++) {
            const rNode = rNodes[i];
            if (rNode) {
                const height = window.getComputedStyle(rNode).getPropertyValue('height');
                const h = parseFloat(height) || parseInt(this.igxForItemSize, 10);
                const index = this.state.startIndex + i;
                if (!this.isRemote && !this.igxForOf[index]) {
                    continue;
                }
                const margin = this.getMargin(rNode, dimension);
                const oldVal = this.individualSizeCache[index];
                const newVal = (dimension === 'height' ? h : rNode.clientWidth) + margin;
                this.individualSizeCache[index] = newVal;
                const currDiff = newVal - oldVal;
                diffs.push(currDiff);
                totalDiff += currDiff;
                this.sizesCache[index + 1] = (this.sizesCache[index] || 0) + newVal;
            }
        }
        // update cache
        if (Math.abs(totalDiff) > 0) {
            for (let j = this.state.startIndex + this.state.chunkSize + 1; j < this.sizesCache.length; j++) {
                this.sizesCache[j] = (this.sizesCache[j] || 0) + totalDiff;
            }

            // update scrBar heights/widths
            const reducer = (acc, val) => acc + val;

            const hSum = this.individualSizeCache.reduce(reducer);
            if (hSum > this._maxSize) {
                this._virtRatio = hSum / this._maxSize;
            }
            this.scrollComponent.size = Math.min(this.scrollComponent.size + totalDiff, this._maxSize);
            this._virtSize = hSum;
            if (!this.scrollComponent.destroyed) {
                this.scrollComponent.cdr.detectChanges();
            }
            const scrToBottom = this._isScrolledToBottom && !this.dc.instance.notVirtual;
            if (scrToBottom && !this._isAtBottomIndex) {
                const containerSize = parseInt(this.igxForContainerSize, 10);
                const maxVirtScrollTop = this._virtSize - containerSize;
                this._bScrollInternal = true;
                this._virtScrollPosition = maxVirtScrollTop;
                this.scrollPosition = maxVirtScrollTop;
                return;
            }
            if (this._adjustToIndex) {
                // in case scrolled to specific index where after scroll heights are changed
                // need to adjust the offsets so that item is last in view.
                const updatesToIndex = this._adjustToIndex - this.state.startIndex + 1;
                const sumDiffs = diffs.slice(0, updatesToIndex).reduce(reducer);
                if (sumDiffs !== 0) {
                    this.addScroll(sumDiffs);
                }
                this._adjustToIndex = null;
            }
        }
    }

    /**
     * @hidden
     * Reset scroll position.
     * Needed in case scrollbar is hidden/detached but we still need to reset it.
     */
    public resetScrollPosition() {
        this.scrollPosition = 0;
        this.scrollComponent.scrollAmount = 0;
    }

    /**
     * @hidden
     */
    protected removeScrollEventListeners() {
        if (this.igxForScrollOrientation === 'horizontal') {
            this._zone.runOutsideAngular(() => this.scrollComponent?.nativeElement?.removeEventListener('scroll', this.func));
        } else {
            this._zone.runOutsideAngular(() =>
                this.scrollComponent?.nativeElement?.removeEventListener('scroll', this.verticalScrollHandler)
            );
        }
    }

    /**
     * @hidden
     * Function that is called when scrolling vertically
     */
    protected onScroll(event) {
        /* in certain situations this may be called when no scrollbar is visible */
        if (!parseInt(this.scrollComponent.nativeElement.style.height, 10)) {
            return;
        }
        if (!this._bScrollInternal) {
            this._calcVirtualScrollPosition(event.target.scrollTop);
        } else {
            this._bScrollInternal = false;
        }
        const prevStartIndex = this.state.startIndex;
        const scrollOffset = this.fixedUpdateAllElements(this._virtScrollPosition);

        this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';

        this._zone.onStable.pipe(first()).subscribe(this.recalcUpdateSizes.bind(this));

        this.dc.changeDetectorRef.detectChanges();
        if (prevStartIndex !== this.state.startIndex) {
            this.chunkLoad.emit(this.state);
        }
    }


    /**
     * @hidden
     * @internal
     */
    public updateScroll(): void {
        if (this.igxForScrollOrientation === "horizontal") {
            const scrollAmount = this.scrollComponent.nativeElement["scrollLeft"];
            this.scrollComponent.scrollAmount = scrollAmount;
            this._updateScrollOffset();
        }
    }

    protected updateSizes() {
        if (!this.scrollComponent.nativeElement.isConnected) return;
        const scrollable = this.isScrollable();
        this.recalcUpdateSizes();
        this._applyChanges();
        this._updateScrollOffset();
        if (scrollable !== this.isScrollable()) {
            this.scrollbarVisibilityChanged.emit();
        } else {
            this.contentSizeChange.emit();
        }
    }

    /**
     * @hidden
     */
    protected fixedUpdateAllElements(inScrollTop: number): number {
        const count = this.isRemote ? this.totalItemCount : this.igxForOf.length;
        let newStart = this.getIndexAt(inScrollTop, this.sizesCache);

        if (newStart + this.state.chunkSize > count) {
            newStart = count - this.state.chunkSize;
        }

        const prevStart = this.state.startIndex;
        const diff = newStart - this.state.startIndex;
        this.state.startIndex = newStart;

        if (diff) {
            this.chunkPreload.emit(this.state);
            if (!this.isRemote) {

                // recalculate and apply page size.
                if (diff && Math.abs(diff) <= MAX_PERF_SCROLL_DIFF) {
                    if (diff > 0) {
                        this.moveApplyScrollNext(prevStart);
                    } else {
                        this.moveApplyScrollPrev(prevStart);
                    }
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
        const end = start + this.state.startIndex - prevIndex;
        const container = this.dc.instance._vcr as ViewContainerRef;

        for (let i = start; i < end && this.igxForOf[i] !== undefined; i++) {
            const embView = this._embeddedViews.shift();
            if (!embView.destroyed) {
                this.scrollFocus(embView.rootNodes.find(node => node.nodeType === Node.ELEMENT_NODE)
                    || embView.rootNodes[0].nextElementSibling);
                const view = container.detach(0);

                this.updateTemplateContext(embView.context, i);
                container.insert(view);
                this._embeddedViews.push(embView);
            }
        }
    }

    /**
     * @hidden
     * The function applies an optimized state change for scrolling up/left employing context change with view rearrangement
     */
    protected moveApplyScrollPrev(prevIndex: number): void {
        const container = this.dc.instance._vcr as ViewContainerRef;
        for (let i = prevIndex - 1; i >= this.state.startIndex && this.igxForOf[i] !== undefined; i--) {
            const embView = this._embeddedViews.pop();
            if (!embView.destroyed) {
                this.scrollFocus(embView.rootNodes.find(node => node.nodeType === Node.ELEMENT_NODE)
                    || embView.rootNodes[0].nextElementSibling);
                const view = container.detach(container.length - 1);

                this.updateTemplateContext(embView.context, i);
                container.insert(view, 0);
                this._embeddedViews.unshift(embView);
            }
        }
    }

    /**
     * @hidden
     */
    protected getContextIndex(input) {
        return this.isRemote ? this.state.startIndex + this.igxForOf.indexOf(input) : this.igxForOf.indexOf(input);
    }

    /**
     * @hidden
     * Function which updates the passed context of an embedded view with the provided index
     * from the view container.
     * Often, called while handling a scroll event.
     */
    protected updateTemplateContext(context: any, index = 0): void {
        context.$implicit = this.igxForOf[index];
        context.index = this.getContextIndex(this.igxForOf[index]);
        context.count = this.igxForOf.length;
    }

    /**
     * @hidden
     * The function applies an optimized state change through context change for each view
     */
    protected fixedApplyScroll(): void {
        let j = 0;
        const endIndex = this.state.startIndex + this.state.chunkSize;
        for (let i = this.state.startIndex; i < endIndex && this.igxForOf[i] !== undefined; i++) {
            const embView = this._embeddedViews[j++];
            this.updateTemplateContext(embView.context, i);
        }
    }

    /**
     * @hidden
     * @internal
     *
     * Clears focus inside the virtualized container on small scroll swaps.
     */
    protected scrollFocus(node?: HTMLElement): void {
        if (!node) {
            return;
        }
        const document = node.getRootNode() as Document | ShadowRoot;
        const activeElement = document.activeElement as HTMLElement;

        // Remove focus in case the the active element is inside the view container.
        // Otherwise we hit an exception while doing the 'small' scrolls swapping.
        // For more information:
        //
        // https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
        // https://bugs.chromium.org/p/chromium/issues/detail?id=432392
        if (node && node.contains(activeElement)) {
            activeElement.blur();
        }
    }

    /**
     * @hidden
     * Function that is called when scrolling horizontally
     */
    protected onHScroll(event) {
        /* in certain situations this may be called when no scrollbar is visible */
        const firstScrollChild = this.scrollComponent.nativeElement.children.item(0) as HTMLElement;
        if (!parseInt(firstScrollChild.style.width, 10)) {
            return;
        }
        if (!this._bScrollInternal) {
            this._calcVirtualScrollPosition(event.target.scrollLeft);
        } else {
            this._bScrollInternal = false;
        }
        const prevStartIndex = this.state.startIndex;
        const scrLeft = event.target.scrollLeft;
        // Updating horizontal chunks
        const scrollOffset = this.fixedUpdateAllElements(Math.abs(this._virtScrollPosition));
        if (scrLeft < 0) {
            // RTL
            this.dc.instance._viewContainer.element.nativeElement.style.left = scrollOffset + 'px';
        } else {
            this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';
        }
        this._zone.onStable.pipe(first()).subscribe(this.recalcUpdateSizes.bind(this));

        this.dc.changeDetectorRef.detectChanges();
        if (prevStartIndex !== this.state.startIndex) {
            this.chunkLoad.emit(this.state);
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
    public get igxForTrackBy(): TrackByFunction<T> {
        return this._trackByFn;
    }

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
    public set igxForTrackBy(fn: TrackByFunction<T>) {
        this._trackByFn = fn;
    }

    /**
     * @hidden
     */
    protected _applyChanges() {
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
                const embView = embeddedViewCopy.shift();
                this.updateTemplateContext(embView.context, i);
            }
            if (prevChunkSize !== this.state.chunkSize) {
                this.chunkLoad.emit(this.state);
            }
        }
    }

    /**
     * @hidden
     */
    protected _calcMaxBrowserSize(): number {
        if (!this.platformUtil.isBrowser) {
            return 0;
        }
        const div = this.document.createElement('div');
        const style = div.style;
        style.position = 'absolute';
        const dir = this.igxForScrollOrientation === 'horizontal' ? 'left' : 'top';
        style[dir] = '9999999999999999px';
        this.document.body.appendChild(div);
        const size = Math.abs(div.getBoundingClientRect()[dir]);
        this.document.body.removeChild(div);
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
            if (!this.sizesCache || this.sizesCache.length === 0) {
                this.initSizesCache(this.igxForOf);
            }
            chunkSize = this._calcMaxChunkSize();
            if (this.igxForOf && chunkSize > this.igxForOf.length) {
                chunkSize = this.igxForOf.length;
            }
        } else {
            if (this.igxForOf) {
                chunkSize = Math.min(this.igxForInitialChunkSize || this.igxForOf.length, this.igxForOf.length);
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
    protected initSizesCache(items: U): number {
        let totalSize = 0;
        let size = 0;
        const dimension = this.igxForSizePropName || 'height';
        let i = 0;
        this.sizesCache = [];
        this.individualSizeCache = [];
        this.sizesCache.push(0);
        const count = this.isRemote ? this.totalItemCount : items.length;
        for (i; i < count; i++) {
            size = this._getItemSize(items[i], dimension);
            this.individualSizeCache.push(size);
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
        const oldHeight = this.individualSizeCache.length > 0 ? this.individualSizeCache.reduce((acc, val) => acc + val) : 0;
        const newHeight = this.initSizesCache(this.igxForOf);

        const diff = oldHeight - newHeight;
        this._adjustScrollPositionAfterSizeChange(diff);
    }

    /**
     * @hidden
     */
    protected _calcMaxChunkSize(): number {
        let i = 0;
        let length = 0;
        let maxLength = 0;
        const arr = [];
        let sum = 0;
        const availableSize = parseInt(this.igxForContainerSize, 10);
        if (!availableSize) {
            return 0;
        }
        const dimension = this.igxForScrollOrientation === 'horizontal' ?
            this.igxForSizePropName : 'height';
        const reducer = (accumulator, currentItem) => accumulator + this._getItemSize(currentItem, dimension);
        for (i; i < this.igxForOf.length; i++) {
            let item: T | { value: T, height: number } = this.igxForOf[i];
            if (dimension === 'height') {
                item = { value: this.igxForOf[i], height: this.individualSizeCache[i] };
            }
            const size = dimension === 'height' ?
                this.individualSizeCache[i] :
                this._getItemSize(item, dimension);
            sum = arr.reduce(reducer, size);
            if (sum < availableSize) {
                arr.push(item);
                length = arr.length;
                if (i === this.igxForOf.length - 1) {
                    // reached end without exceeding
                    // include prev items until size is filled or first item is reached.
                    let curItem = dimension === 'height' ? arr[0].value : arr[0];
                    let prevIndex = this.igxForOf.indexOf(curItem) - 1;
                    while (prevIndex >= 0 && sum <= availableSize) {
                        curItem = dimension === 'height' ? arr[0].value : arr[0];
                        prevIndex = this.igxForOf.indexOf(curItem) - 1;
                        const prevItem = this.igxForOf[prevIndex];
                        const prevSize = dimension === 'height' ?
                            this.individualSizeCache[prevIndex] :
                            parseInt(prevItem[dimension], 10);
                        sum = arr.reduce(reducer, prevSize);
                        arr.unshift(prevItem);
                        length = arr.length;
                    }
                }
            } else {
                arr.push(item);
                length = arr.length + 1;
                arr.shift();
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
    protected getIndexAt(left, set) {
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

    protected _recalcScrollBarSize(containerSizeInfo = null) {
        const count = this.isRemote ? this.totalItemCount : (this.igxForOf ? this.igxForOf.length : 0);
        this.dc.instance.notVirtual = !(this.igxForContainerSize && this.dc && this.state.chunkSize < count);
        const scrollable = containerSizeInfo ? this.scrollComponent.size > containerSizeInfo.prevSize : this.isScrollable();
        if (this.igxForScrollOrientation === 'horizontal') {
            const totalWidth = parseInt(this.igxForContainerSize, 10) > 0 ? this._calcSize() : 0;
            if (totalWidth <= parseInt(this.igxForContainerSize, 10)) {
                this.resetScrollPosition();
            }
            this.scrollComponent.nativeElement.style.width = this.igxForContainerSize + 'px';
            this.scrollComponent.size = totalWidth;
        }
        if (this.igxForScrollOrientation === 'vertical') {
            const totalHeight = this._calcSize();
            if (totalHeight <= parseInt(this.igxForContainerSize, 10)) {
                this.resetScrollPosition();
            }
            this.scrollComponent.nativeElement.style.height = parseInt(this.igxForContainerSize, 10) + 'px';
            this.scrollComponent.size = totalHeight;
        }
        if (scrollable !== this.isScrollable()) {
            // scrollbar visibility has changed
            this.scrollbarVisibilityChanged.emit();
        }
    }

    protected _calcSize(): number {
        let size;
        if (this.individualSizeCache && this.individualSizeCache.length > 0) {
            size = this.individualSizeCache.reduce((acc, val) => acc + val, 0);
        } else {
            size = this.initSizesCache(this.igxForOf);
        }
        this._virtSize = size;
        if (size > this._maxSize) {
            this._virtRatio = size / this._maxSize;
            size = this._maxSize;
        }
        return size;
    }

    protected _recalcOnContainerChange(containerSizeInfo = null) {
        const prevChunkSize = this.state.chunkSize;
        this.applyChunkSizeChange();
        this._recalcScrollBarSize(containerSizeInfo);
        if (prevChunkSize !== this.state.chunkSize) {
            this.chunkLoad.emit(this.state);
        }
    }

    /**
     * @hidden
     * Removes an element from the embedded views and updates chunkSize.
     */
    protected removeLastElem() {
        const oldElem = this._embeddedViews.pop();
        this.beforeViewDestroyed.emit(oldElem);
        // also detach from ViewContainerRef to make absolutely sure this is removed from the view container.
        this.dc.instance._vcr.detach(this.dc.instance._vcr.length - 1);
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
            new IgxForOfContext<T, U>(input, this.igxForOf, this.getContextIndex(input), this.igxForOf.length)
        );

        this._embeddedViews.push(embeddedView);
        this.state.chunkSize++;

        this._zone.run(() => this.cdr.markForCheck());
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

    protected _calcVirtualScrollPosition(scrollPosition: number) {
        const containerSize = parseInt(this.igxForContainerSize, 10);
        const maxRealScrollPosition = this.scrollComponent.size - containerSize;
        const realPercentScrolled = maxRealScrollPosition !== 0 ? scrollPosition / maxRealScrollPosition : 0;
        const maxVirtScroll = this._virtSize - containerSize;
        this._virtScrollPosition = realPercentScrolled * maxVirtScroll;
    }

    protected _getItemSize(item, dimension: string): number {
        const dim = item ? item[dimension] : null;
        return typeof dim === 'number' ? dim : parseInt(this.igxForItemSize, 10) || 0;
    }

    protected _updateScrollOffset() {
        let scrollOffset = 0;
        let currentScroll = this.scrollPosition;
        if (this._virtRatio !== 1) {
            this._calcVirtualScrollPosition(this.scrollPosition);
            currentScroll = this._virtScrollPosition;
        }
        const scroll = this.scrollComponent.nativeElement;
        scrollOffset = scroll && this.scrollComponent.size ?
        currentScroll - this.sizesCache[this.state.startIndex] : 0;
        const dir = this.igxForScrollOrientation === 'horizontal' ? 'left' : 'top';
        this.dc.instance._viewContainer.element.nativeElement.style[dir] = -(scrollOffset) + 'px';
    }

    protected _adjustScrollPositionAfterSizeChange(sizeDiff) {
        // if data has been changed while container is scrolled
        // should update scroll top/left according to change so that same startIndex is in view
        if (Math.abs(sizeDiff) > 0 && this.scrollPosition > 0) {
            this.recalcUpdateSizes();
            const offset = this.igxForScrollOrientation === 'horizontal' ?
                parseInt(this.dc.instance._viewContainer.element.nativeElement.style.left, 10) :
                parseInt(this.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const newSize = this.sizesCache[this.state.startIndex] - offset;
            this.scrollPosition = newSize;
            if (this.scrollPosition !== newSize) {
                this.scrollComponent.scrollAmount = newSize;
            }
        }
    }

    private getMargin(node, dimension: string): number {
        const styles = window.getComputedStyle(node);
        if (dimension === 'height') {
            return parseFloat(styles['marginTop']) +
                parseFloat(styles['marginBottom']) || 0;
        }
        return parseFloat(styles['marginLeft']) +
            parseFloat(styles['marginRight']) || 0;
    }
}

export const getTypeNameForDebugging = (type: any): string => type.name || typeof type;

export interface IForOfState extends IBaseEventArgs {
    startIndex?: number;
    chunkSize?: number;
}

export interface IForOfDataChangingEventArgs extends IBaseEventArgs {
    containerSize: number;
    state: IForOfState;
}

export class IgxGridForOfContext<T, U extends T[] = T[]> extends IgxForOfContext<T, U> {
    constructor(
        $implicit: T,
        public igxGridForOf: U,
        index: number,
        count: number
    ) {
        super($implicit, igxGridForOf, index, count);
    }
}

@Directive({
    selector: '[igxGridFor][igxGridForOf]',
    standalone: true
})
export class IgxGridForOfDirective<T, U extends T[] = T[]> extends IgxForOfDirective<T, U> implements OnInit, OnChanges, DoCheck {
    @Input()
    public set igxGridForOf(value: U & T[] | null) {
        this.igxForOf = value;
    }

    public get igxGridForOf() {
        return this.igxForOf;
    }

    @Input({ transform: booleanAttribute })
    public igxGridForOfUniqueSizeCache = false;

    @Input({ transform: booleanAttribute })
    public igxGridForOfVariableSizes = true;

    /**
     * @hidden
     * @internal
     */
    public override get sizesCache(): number[] {
        if (this.igxForScrollOrientation === 'horizontal') {
            if (this.igxGridForOfUniqueSizeCache || this.syncService.isMaster(this)) {
                return this._sizesCache;
            }
            return this.syncService.sizesCache(this.igxForScrollOrientation);
        } else {
            return this._sizesCache;
        }
    }
    /**
     * @hidden
     * @internal
     */
    public override set sizesCache(value: number[]) {
        this._sizesCache = value;
    }

    protected get itemsDimension() {
        return this.igxForSizePropName || 'height';
    }

    public override recalcUpdateSizes() {
        if (this.igxGridForOfVariableSizes && this.igxForScrollOrientation === 'vertical') {
            super.recalcUpdateSizes();
        }
    }

    /**
     * @hidden @internal
     * An event that is emitted after data has been changed but before the view is refreshed
     */
    @Output()
    public dataChanging = new EventEmitter<IForOfDataChangingEventArgs>();

    constructor(
        _viewContainer: ViewContainerRef,
        _template: TemplateRef<NgForOfContext<T>>,
        _differs: IterableDiffers,
        cdr: ChangeDetectorRef,
        _zone: NgZone,
        _platformUtil: PlatformUtil,
        @Inject(DOCUMENT) _document: any,
        syncScrollService: IgxForOfScrollSyncService,
        protected syncService: IgxForOfSyncService) {
        super(_viewContainer, _template, _differs, cdr, _zone, syncScrollService, _platformUtil, _document);
    }

    /**
     * @hidden @internal
     * Asserts the correct type of the context for the template that `IgxGridForOfDirective` will render.
     *
     * The presence of this method is a signal to the Ivy template type-check compiler that the
     * `IgxGridForOfDirective` structural directive renders its template with a specific context type.
     */
    public static override ngTemplateContextGuard<T, U extends T[]>(dir: IgxGridForOfDirective<T, U>, ctx: any):
        ctx is IgxGridForOfContext<T, U> {
        return true;
    }

    public override ngOnInit() {
        this.syncService.setMaster(this);
        super.ngOnInit();
        this.removeScrollEventListeners();
    }

    public override ngOnChanges(changes: SimpleChanges) {
        const forOf = 'igxGridForOf';
        this.syncService.setMaster(this);
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
            if (this.igxForScrollOrientation === 'horizontal') {
                // in case collection has changes, reset sync service
                this.syncService.setMaster(this, this.igxGridForOfUniqueSizeCache);
            }
        }
        const defaultItemSize = 'igxForItemSize';
        if (defaultItemSize in changes && !changes[defaultItemSize].firstChange &&
            this.igxForScrollOrientation === 'vertical' && this.igxForOf) {
            // handle default item size changed.
            this.initSizesCache(this.igxForOf);
        }
        const containerSize = 'igxForContainerSize';
        if (containerSize in changes && !changes[containerSize].firstChange && this.igxForOf) {
            const prevSize = parseInt(changes[containerSize].previousValue, 10);
            const newSize = parseInt(changes[containerSize].currentValue, 10);
            this._recalcOnContainerChange({prevSize, newSize});
        }
    }

    /**
     * @hidden
     * @internal
     */
    public assumeMaster(): void {
        this._sizesCache = this.syncService.sizesCache(this.igxForScrollOrientation);
        this.syncService.setMaster(this, true);
    }

    public override ngDoCheck() {
        if (this._differ) {
            const changes = this._differ.diff(this.igxForOf);
            if (changes) {
                const args: IForOfDataChangingEventArgs = {
                    containerSize: this.igxForContainerSize,
                    state: this.state
                };
                this.dataChanging.emit(args);
                //  re-init cache.
                if (!this.igxForOf) {
                    this.igxForOf = [] as U;
                }
                /* we need to reset the master dir if all rows are removed
                (e.g. because of filtering); if all columns are hidden, rows are
                still rendered empty, so we should not reset master */
                if (!this.igxForOf.length &&
                    this.igxForScrollOrientation === 'vertical') {
                    this.syncService.resetMaster();
                }
                this.syncService.setMaster(this);
                this.igxForContainerSize = args.containerSize;
                const sizeDiff = this._updateSizeCache(changes);
                this._applyChanges();
                if (sizeDiff) {
                    this._adjustScrollPositionAfterSizeChange(sizeDiff);
                }
                this._updateScrollOffset();
                this.dataChanged.emit(args);
            }
        }
    }

    public override onScroll(event) {
        if (!parseInt(this.scrollComponent.nativeElement.style.height, 10)) {
            return;
        }
        if (!this._bScrollInternal) {
            this._calcVirtualScrollPosition(event.target.scrollTop);
        } else {
            this._bScrollInternal = false;
        }
        const scrollOffset = this.fixedUpdateAllElements(this._virtScrollPosition);

        this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + 'px';

        this._zone.onStable.pipe(first()).subscribe(this.recalcUpdateSizes.bind(this));
        this.cdr.markForCheck();
    }

    public override onHScroll(scrollAmount) {
        /* in certain situations this may be called when no scrollbar is visible */
        const firstScrollChild = this.scrollComponent.nativeElement.children.item(0) as HTMLElement;
        if (!this.scrollComponent || !parseInt(firstScrollChild.style.width, 10)) {
            return;
        }
        // Updating horizontal chunks
        const scrollOffset = this.fixedUpdateAllElements(Math.abs(scrollAmount));
        if (scrollAmount < 0) {
            // RTL
            this.dc.instance._viewContainer.element.nativeElement.style.left = scrollOffset + 'px';
        } else {
            // LTR
            this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + 'px';
        }
    }

    protected getItemSize(item) {
        let size = 0;
        const dimension = this.igxForSizePropName || 'height';
        if (this.igxForScrollOrientation === 'vertical') {
            size = this._getItemSize(item, dimension);
            if (item && item.summaries) {
                size = item.max;
            } else if (item && item.groups && item.height) {
                size = item.height;
            }
        } else {
            size = parseInt(item[dimension], 10) || 0;
        }
        return size;
    }

    protected override initSizesCache(items: U): number {
        if (!this.syncService.isMaster(this) && this.igxForScrollOrientation === 'horizontal') {
            const masterSizesCache = this.syncService.sizesCache(this.igxForScrollOrientation);
            return masterSizesCache[masterSizesCache.length - 1];
        }
        let totalSize = 0;
        let size = 0;
        let i = 0;
        this.sizesCache = [];
        this.individualSizeCache = [];
        this.sizesCache.push(0);
        const count = this.isRemote ? this.totalItemCount : items.length;
        for (i; i < count; i++) {
            size = this.getItemSize(items[i]);
            this.individualSizeCache.push(size);
            totalSize += size;
            this.sizesCache.push(totalSize);
        }
        return totalSize;
    }

    protected override _updateSizeCache(changes: IterableChanges<T> = null) {
        const oldSize = this.individualSizeCache.length > 0 ? this.individualSizeCache.reduce((acc, val) => acc + val) : 0;
        let newSize = oldSize;
        if (changes && !this.isRemote) {
            newSize = this.handleCacheChanges(changes);
        } else {
            return;
        }

        const diff = oldSize - newSize;
        return diff;
    }

    protected handleCacheChanges(changes: IterableChanges<T>) {
        const identityChanges = [];
        const newHeightCache = [];
        const newSizesCache = [];
        newSizesCache.push(0);
        let newHeight = 0;

        // When there are more than one removed items the changes are not reliable so those with identity change should be default size.
        let numRemovedItems = 0;
        changes.forEachRemovedItem(() => numRemovedItems++);

        // Get the identity changes to determine later if those that have changed their indexes should be assigned default item size.
        changes.forEachIdentityChange((item) => {
            if (item.currentIndex !== item.previousIndex) {
                // Filter out ones that have not changed their index.
                identityChanges[item.currentIndex] = item;
            }
        });

        // Processing each item that is passed to the igxForOf so far seem to be most reliable. We parse the updated list of items.
        changes.forEachItem((item) => {
            if (item.previousIndex !== null &&
                (numRemovedItems < 2 || !identityChanges.length || identityChanges[item.currentIndex])
                && this.igxForScrollOrientation !== "horizontal") {
                // Reuse cache on those who have previousIndex.
                // When there are more than one removed items currently the changes are not readable so ones with identity change
                // should be racalculated.
                newHeightCache[item.currentIndex] = this.individualSizeCache[item.previousIndex];
            } else {
                // Assign default item size.
                newHeightCache[item.currentIndex] = this.getItemSize(item.item);
            }
            newSizesCache[item.currentIndex + 1] = newSizesCache[item.currentIndex] + newHeightCache[item.currentIndex];
            newHeight += newHeightCache[item.currentIndex];
        });
        this.individualSizeCache = newHeightCache;
        this.sizesCache = newSizesCache;
        return newHeight;
    }

    protected override addLastElem() {
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
            new IgxGridForOfContext<T, U>(input, this.igxForOf, this.getContextIndex(input), this.igxForOf.length)
        );

        this._embeddedViews.push(embeddedView);
        this.state.chunkSize++;
    }

    protected _updateViews(prevChunkSize) {
        if (this.igxForOf && this.igxForOf.length && this.dc) {
            const embeddedViewCopy = Object.assign([], this._embeddedViews);
            let startIndex;
            let endIndex;
            if (this.isRemote) {
                startIndex = 0;
                endIndex = this.igxForOf.length;
            } else {
                startIndex = this.getIndexAt(this.scrollPosition, this.sizesCache);
                if (startIndex + this.state.chunkSize > this.igxForOf.length) {
                    startIndex = this.igxForOf.length - this.state.chunkSize;
                }
                this.state.startIndex = startIndex;
                endIndex = this.state.chunkSize + this.state.startIndex;
            }

            for (let i = startIndex; i < endIndex && this.igxForOf[i] !== undefined; i++) {
                const embView = embeddedViewCopy.shift();
                this.updateTemplateContext(embView.context, i);
            }
            if (prevChunkSize !== this.state.chunkSize) {
                this.chunkLoad.emit(this.state);
            }
        }
    }
    protected override _applyChanges() {
        const prevChunkSize = this.state.chunkSize;
        this.applyChunkSizeChange();
        this._recalcScrollBarSize();
        this._updateViews(prevChunkSize);
    }

    /**
     * @hidden
     */
    protected override _calcMaxChunkSize(): number {
        if (this.igxForScrollOrientation === 'horizontal') {
            if (this.syncService.isMaster(this)) {
                return super._calcMaxChunkSize();
            }
            return this.syncService.chunkSize(this.igxForScrollOrientation);
        } else {
            return super._calcMaxChunkSize();
        }

    }
}
