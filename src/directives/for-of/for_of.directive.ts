import { CommonModule, NgForOf, NgForOfContext } from "@angular/common";
import {
    ChangeDetectorRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    DoCheck,
    EmbeddedViewRef,
    EventEmitter,
    HostListener,
    Input,
    IterableChangeRecord,
    IterableChanges,
    IterableDiffer,
    IterableDiffers,
    NgIterable,
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
} from "@angular/core";

import { DisplayContainerComponent } from "./display.container";
import { HVirtualHelperComponent } from "./horizontal.virtual.helper.component";
import { IForOfState } from "./IForOfState";
import { VirtualHelperComponent } from "./virtual.helper.component";

@Directive({ selector: "[igxFor][igxForOf]" })
export class IgxForOfDirective<T> implements OnInit, OnChanges, DoCheck, OnDestroy {
    @Input() public igxForOf: any[];
    @Input() public igxForScrollOrientation: string;
    @Input() public igxForScrollContainer: any;
    @Input() public igxForContainerSize: any;
    @Input() public igxForItemSize: any;
    public dc: ComponentRef<DisplayContainerComponent>;
    public state: IForOfState = {
        startIndex: 0,
        chunkSize: 0
    };
    public totalItemCount: number = null;

    @Input() public igxForRemote = false;

    @Output()
    public onChunkLoad = new EventEmitter<IForOfState>();

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

    protected get isRemote(): boolean {
        return this.totalItemCount !== null;
    }

    public ngOnInit(): void {
        let totalWidth = 0;
        const vc = this.igxForScrollContainer ? this.igxForScrollContainer._viewContainer : this._viewContainer;

        const dcFactory: ComponentFactory<DisplayContainerComponent> = this.resolver.resolveComponentFactory(DisplayContainerComponent);
        this.dc = this._viewContainer.createComponent(dcFactory, 0);
        if (this.igxForOf && this.igxForOf.length) {
            this.dc.instance.notVirtual = !(this.igxForContainerSize && this.state.chunkSize < this.igxForOf.length);
            if (this.igxForScrollOrientation === "horizontal") {
                totalWidth = this.initHCache(this.igxForOf);
                this.hScroll = this.getElement(vc, "igx-horizontal-virtual-helper");
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

        if (this.igxForScrollOrientation === "vertical") {
            this.dc.instance._viewContainer.element.nativeElement.style.top = "0px";
            const factory: ComponentFactory<VirtualHelperComponent> = this.resolver.resolveComponentFactory(VirtualHelperComponent);
            this.vh = this._viewContainer.createComponent(factory, 1);
            this.vh.instance.height = this.igxForOf ? this.igxForOf.length * parseInt(this.igxForItemSize, 10) : 0;
            this._zone.runOutsideAngular(() => {
                this.vh.instance.elementRef.nativeElement.addEventListener("scroll", (evt) => { this.onScroll(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("wheel",
                    (evt) => { this.onWheel(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("touchstart",
                    (evt) => { this.onTouchStart(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("touchmove",
                    (evt) => { this.onTouchMove(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("pointerdown",
                    (evt) => { this.onPointerDown(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("pointerup",
                    (evt) => { this.onPointerUp(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("MSGestureStart",
                    (evt) => { this.onMSGestureStart(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("MSGestureChange",
                    (evt) => { this.onMSGestureChange(evt); });
            });
        }

        if (this.igxForScrollOrientation === "horizontal") {
            this.dc.instance._viewContainer.element.nativeElement.style.height = "100%";
            this.dc.instance._viewContainer.element.nativeElement.style.left = "0px";
            this.func = (evt) => { this.onHScroll(evt); };
            this.hScroll = this.getElement(vc, "igx-horizontal-virtual-helper");
            if (!this.hScroll) {
                const hvFactory: ComponentFactory<HVirtualHelperComponent> =
                    this.resolver.resolveComponentFactory(HVirtualHelperComponent);
                this.hvh = vc.createComponent(hvFactory);
                this.hvh.instance.width = totalWidth;
                this.hScroll = this.hvh.instance.elementRef.nativeElement;
                this._zone.runOutsideAngular(() => {
                    this.hvh.instance.elementRef.nativeElement.addEventListener("scroll", this.func);
                });
            } else {
                this._zone.runOutsideAngular(() => {
                    this.hScroll.addEventListener("scroll", this.func);
                    this.dc.instance._viewContainer.element.nativeElement.addEventListener("wheel",
                        (evt) => { this.onWheel(evt); });
                    this.dc.instance._viewContainer.element.nativeElement.addEventListener("touchstart",
                        (evt) => { this.onTouchStart(evt); });
                    this.dc.instance._viewContainer.element.nativeElement.addEventListener("touchmove",
                        (evt) => { this.onTouchMove(evt); });
                    this.dc.instance._viewContainer.element.nativeElement.addEventListener("pointerdown",
                        (evt) => { this.onPointerDown(evt); });
                    this.dc.instance._viewContainer.element.nativeElement.addEventListener("pointerup",
                        (evt) => { this.onPointerUp(evt); });
                    this.dc.instance._viewContainer.element.nativeElement.addEventListener("MSGestureStart",
                        (evt) => { this.onMSGestureStart(evt); });
                    this.dc.instance._viewContainer.element.nativeElement.addEventListener("MSGestureChange",
                        (evt) => { this.onMSGestureChange(evt); });
                });
            }
        }
    }
    public ngOnDestroy() {
        if (this.hScroll) {
            this.hScroll.removeEventListener("scroll", this.func);
        }
    }
    public ngOnChanges(changes: SimpleChanges): void {
        const forOf = "igxForOf";
        if (forOf in changes) {
            const value = changes[forOf].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this.ngForTrackBy);
                } catch (e) {
                    throw new Error(
                        `Cannot find a differ supporting object "${value}" of type "${getTypeNameForDebugging(value)}".
                     NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
        const containerSize = "igxForContainerSize";
        if (containerSize in changes && !changes[containerSize].firstChange) {
            this._recalcOnContainerChange(changes);
        }
    }

    public ngDoCheck(): void {
        if (this._differ) {
            const changes = this._differ.diff(this.igxForOf);
            if (changes) {
                this._applyChanges(changes);
            }
        }
    }

    public scrollTo(index) {
        if (index < 0 || index > (this.isRemote ? this.totalItemCount : this.igxForOf.length)) {
            return;
        }
        // this.state.startIndex = index;
        if (this.igxForScrollOrientation === "horizontal") {
            this.hScroll.scrollLeft = this.hCache[index] + 1;
        } else {
            this.vh.instance.elementRef.nativeElement.scrollTop = parseInt(this.igxForItemSize, 10) * index;
        }
    }

    public scrollNext() {
        this.scrollTo(this.state.startIndex + 1);
    }

    public scrollPrev() {
        this.scrollTo(this.state.startIndex - 1);
    }

    public getColumnScrollLeft(colIndex) {
        return this.hCache[colIndex];
    }

    public getVerticalScroll() {
        if (this.vh) {
            return this.vh.instance.elementRef.nativeElement;
        }
        return null;
    }

    public getHorizontalScroll() {
        return this.getElement(this._viewContainer, "igx-horizontal-virtual-helper");
    }

    /** Function that is called when scrolling vertically */
    protected onScroll(event) {
        /* in certain situations this may be called when no scrollbar is visible */
        if (!parseInt(this.vh.instance.elementRef.nativeElement.style.height, 10)) {
            return;
        }
        const curScrollTop = event.target.scrollTop;

        let scrollOffset = this.fixedUpdateAllRows(curScrollTop, event.target.children[0].scrollHeight);
        if (scrollOffset === undefined) {
            this.onChunkLoad.emit(this.state);
            return;
        }
        scrollOffset = scrollOffset !== parseInt(this.igxForItemSize, 10) ? scrollOffset : 0;
        this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + "px";

        this.dc.changeDetectorRef.detectChanges();
        this.onChunkLoad.emit(this.state);
    }

    protected fixedUpdateAllRows(inScrollTop: number, scrollHeight: number): number {
        const ratio = scrollHeight !== 0 ? inScrollTop / scrollHeight : 0;
        const embeddedViewCopy = Object.assign([], this._embeddedViews);

        const count = this.isRemote ? this.totalItemCount : this.igxForOf.length;
        const currIndex = Math.floor(ratio * count);

        const endingIndex = this.state.chunkSize + currIndex;
        if (this.state.startIndex !== currIndex) {
            this.state.startIndex = currIndex;
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

    /** Function that is called when scrolling horizontally */
    protected onHScroll(event) {
        /* in certain situations this may be called when no scrollbar is visible */
        if (!parseInt(this.hScroll.children[0].style.width, 10)) {
            return;
        }
        const curScrollLeft = event.target.scrollLeft;

        // Updating horizontal chunks
        const scrollOffset = this.fixUpdateAllCols(curScrollLeft);
        this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + "px";

        this.dc.changeDetectorRef.detectChanges();
        this.onChunkLoad.emit();
    }

    protected fixUpdateAllCols(inScrollLeft) {
        this.state.startIndex = this.getHorizontalIndexAt(
            inScrollLeft,
            this.hCache,
            0
        );
        this.onChunkPreload.emit(this.state);
        /*recalculate and apply page size.*/
        this.applyChunkSizeChange();

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

    /** Function that is called when scrolling with the mouse wheel or using touchpad */
    protected onWheel(event) {
        if (this.igxForScrollOrientation === "horizontal") {
            const scrollStepX = 10;
            this.hScroll.scrollLeft += Math.sign(event.deltaX) * scrollStepX;
        } else if (this.igxForScrollOrientation === "vertical") {
            const scrollStepY = /Edge/.test(navigator.userAgent) ? 25 : 100;
            this.vh.instance.elementRef.nativeElement.scrollTop += Math.sign(event.deltaY) * scrollStepY;

            const curScrollTop = this.vh.instance.elementRef.nativeElement.scrollTop;
            const maxScrollTop = this.vh.instance.height - this.vh.instance.elementRef.nativeElement.offsetHeight;
            if (0 < curScrollTop && curScrollTop < maxScrollTop) {
                event.preventDefault();
            }
        }
    }

    /** Function that is called the first moment we start interacting with the content on a touch device */
    protected onTouchStart(event) {
        if (typeof MSGesture === "function") {
            return false;
        }
        if (this.igxForScrollOrientation === "horizontal") {
            this._lastTouchX = event.changedTouches[0].screenX;
        } else if (this.igxForScrollOrientation === "vertical") {
            this._lastTouchY = event.changedTouches[0].screenY;
        }
    }

    /** Function that is called when we need to scroll the content based on touch interactions */
    protected onTouchMove(event) {
        if (typeof MSGesture === "function") {
            return false;
        }

        if (this.igxForScrollOrientation === "horizontal") {
            const movedX = this._lastTouchX - event.changedTouches[0].screenX;

            this.hScroll.scrollLeft += movedX;
            this._lastTouchX = event.changedTouches[0].screenX;
        } else if (this.igxForScrollOrientation === "vertical") {
            const maxScrollTop = this.vh.instance.elementRef.nativeElement.children[0].offsetHeight -
                this.dc.instance._viewContainer.element.nativeElement.offsetHeight;
            const hScroll = this.getElement(this._viewContainer, "igx-horizontal-virtual-helper");
            const movedY = this._lastTouchY - event.changedTouches[0].screenY;

            this.vh.instance.elementRef.nativeElement.scrollTop += movedY;

            if (this.vh.instance.elementRef.nativeElement.scrollTop !== 0 &&
                this.vh.instance.elementRef.nativeElement.scrollTop !== maxScrollTop) {
                event.preventDefault();
            }

            this._lastTouchY = event.changedTouches[0].screenY;
        }
    }

    /** Function that is called when we need to detect touch starting on a touch device on IE/Edge */
    protected onPointerDown(event) {
        if (!event || (event.pointerType !== 2 && event.pointerType !== "touch") ||
            typeof MSGesture !== "function") {
            return true;
        }

        if (!this._gestureObject) {
            this._gestureObject = new MSGesture();
            this._gestureObject.target = this.dc.instance._viewContainer.element.nativeElement;
        }

        event.target.setPointerCapture(this._pointerCapture = event.pointerId);
        this._gestureObject.addPointer(this._pointerCapture);
    }

    /** Function that is called when we need to detect touch ending on a touch device on IE/Edge */
    protected onPointerUp(event) {
        if (!this._pointerCapture) {
            return true;
        }

        event.target.releasePointerCapture(this._pointerCapture);
        delete this._pointerCapture;
    }

    /** Function that is called when a gesture begins on IE/Edge */
    protected onMSGestureStart(event) {
        if (this.igxForScrollOrientation === "horizontal") {
            this._lastTouchX = event.screenX;
        } else if (this.igxForScrollOrientation === "vertical") {
            this._lastTouchY = event.screenY;
        }
        return false;
    }

    /** Function that is called when a we need to scroll based on the gesture performed on IE/Edge */
    protected onMSGestureChange(event) {
        if (this.igxForScrollOrientation === "horizontal") {
            const movedX = this._lastTouchX - event.screenX;
            this.hScroll.scrollLeft += movedX;

            this._lastTouchX = event.screenX;
        } else if (this.igxForScrollOrientation === "vertical") {
            const movedY = this._lastTouchY - event.screenY;
            this.vh.instance.elementRef.nativeElement.scrollTop += movedY;

            this._lastTouchY = event.screenY;
        }
        return false;
    }

    get ngForTrackBy(): TrackByFunction<T> { return this._trackByFn; }

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
            this.onChunkLoad.emit();
            this.dc.changeDetectorRef.detectChanges();
        }
    }

    protected _calculateChunkSize(): number {
        let chunkSize = 0;
        if (this.igxForContainerSize !== null && this.igxForContainerSize !== undefined) {
            if (this.igxForScrollOrientation === "horizontal") {
                const vc = this.igxForScrollContainer ?
                    this.igxForScrollContainer._viewContainer :
                    this._viewContainer;
                const hScroll = this.getElement(vc, "igx-horizontal-virtual-helper");

                const left = hScroll && hScroll.scrollLeft !== 0 ?
                    hScroll.scrollLeft + parseInt(this.igxForContainerSize, 10) :
                    parseInt(this.igxForContainerSize, 10);

                if (!this.hCache) {
                    this.initHCache(this.igxForOf);
                }

                const endIndex = this.getHorizontalIndexAt(
                    left,
                    this.hCache,
                    0
                ) + 1;
                chunkSize = endIndex - this.state.startIndex;
                chunkSize = chunkSize > this.igxForOf.length ? this.igxForOf.length : chunkSize;
            } else {
                chunkSize = Math.ceil(parseInt(this.igxForContainerSize, 10) /
                    parseInt(this.igxForItemSize, 10));
                if (chunkSize > this.igxForOf.length) {
                    chunkSize = this.igxForOf.length;
                }
            }
        } else {
            chunkSize = this.igxForOf.length;
        }
        return chunkSize;
    }

    protected getElement(viewref, nodeName) {
        const elem = viewref.element.nativeElement.parentNode.getElementsByTagName(nodeName);
        return elem.length > 0 ? elem[0] : null;
    }

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
        const count = this.isRemote ? this.totalItemCount : this.igxForOf.length;
        this.dc.instance.notVirtual = !(this.igxForContainerSize && this.dc && this.state.chunkSize < count);
        if (this.igxForScrollOrientation === "horizontal") {
            const totalWidth = this.igxForContainerSize ? this.initHCache(this.igxForOf) : 0;
            this.hScroll.children[0].style.width = totalWidth + "px";
        }
        if (this.igxForScrollOrientation === "vertical") {
            this.vh.instance.elementRef.nativeElement.style.height = parseInt(this.igxForContainerSize, 10) + "px";
            this.vh.instance.height = count * parseInt(this.igxForItemSize, 10);
        }
    }

    private _recalcOnContainerChange(changes: SimpleChanges) {
        this.applyChunkSizeChange();
        this._recalcScrollBarSize();
    }

    protected removeLastElem() {
        const oldElem = this._embeddedViews.pop();
        oldElem.destroy();

        this.state.chunkSize--;
    }

    protected addLastElem() {
        const elemIndex = this.state.startIndex + this.state.chunkSize;
        if (elemIndex >= this.igxForOf.length) {
            return;
        }

        const input = this.igxForOf[elemIndex];
        const embeddedView = this.dc.instance._vcr.createEmbeddedView(
            this._template,
            { $implicit: input, index: elemIndex }
        );

        this._embeddedViews.push(embeddedView);
        this.state.chunkSize++;
    }

    private applyChunkSizeChange() {
        const chunkSize = this.isRemote ? this.igxForOf.length : this._calculateChunkSize();
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
}

export function getTypeNameForDebugging(type: any): string {
    const name = "name";
    return type[name] || typeof type;
}

@NgModule({
    declarations: [IgxForOfDirective, DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
    entryComponents: [DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
    exports: [IgxForOfDirective],
    imports: [CommonModule]
})

export class IgxForOfModule {
}
