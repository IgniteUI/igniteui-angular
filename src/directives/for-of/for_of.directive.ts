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
import { IForOfRemoteState } from "./IForOfRemoteState";
import { VirtualHelperComponent } from "./virtual.helper.component";

@Directive({ selector: "[igxFor][igxForOf]" })
export class IgxForOfDirective<T> implements OnInit, OnChanges, DoCheck, OnDestroy {
    @Input() public igxForOf: any[];
    @Input() public igxForScrollOrientation: string;
    @Input() public igxForScrollContainer: any;
    @Input() public igxForContainerSize: any;
    @Input() public igxForItemSize: any;
    public dc: ComponentRef<DisplayContainerComponent>;
    public state: IForOfRemoteState = {
        startIndex: 0
    };

    @Input() public igxForRemote = false;

    @Output()
    public onChunkLoaded = new EventEmitter<any>();

    @Output()
    public onChunkLoading = new EventEmitter<any>();

    private hScroll;
    private func;
    private hCache: number[];
    private vh: ComponentRef<VirtualHelperComponent>;
    private hvh: ComponentRef<HVirtualHelperComponent>;
    private _differ: IterableDiffer<T> | null = null;
    private _trackByFn: TrackByFunction<T>;
    private _pageSize = 0;
    private _currIndex = 0;
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

    public ngOnInit(): void {
        let totalWidth: number;
        const vc = this.igxForScrollContainer ? this.igxForScrollContainer._viewContainer : this._viewContainer;
        if (this.igxForScrollOrientation === "horizontal") {
            totalWidth = this.initHCache(this.igxForOf);
        }
        this._pageSize = this._calculatePageSize();
        const dcFactory: ComponentFactory<DisplayContainerComponent> = this.resolver.resolveComponentFactory(DisplayContainerComponent);
        this.dc = this._viewContainer.createComponent(dcFactory, 0);
        this.dc.instance.notVirtual = this.igxForContainerSize ? false : true;
        if (this.igxForOf && this.igxForOf.length) {
            for (let i = 0; i < this._pageSize && this.igxForOf[i] !== undefined; i++) {
                const input = this.igxForOf[i];
                const embeddedView = this.dc.instance._vcr.createEmbeddedView(
                    this._template,
                    { $implicit: input, index: this.igxForOf.indexOf(input) }
                );
                this._embeddedViews.push(embeddedView);
            }
        }

        if (this.igxForScrollOrientation === "vertical") {
            this.state.endIndex = Math.ceil(parseInt(this.igxForContainerSize, 10) /
                    parseInt(this.igxForItemSize, 10));
            const factory: ComponentFactory<VirtualHelperComponent> = this.resolver.resolveComponentFactory(VirtualHelperComponent);
            this.vh = this._viewContainer.createComponent(factory, 1);
            this.vh.instance.height = this.igxForOf.length * parseInt(this.igxForItemSize, 10);
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
            const directiveRef = this.igxForScrollContainer || this;
            this.hScroll = this.getElement(vc, "igx-horizontal-virtual-helper");
            this.func = (evt) => { this.onHScroll(evt); };
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

    public scrollNext() {
        const endIndex = this._currIndex + this._pageSize - 1;
        if (this.igxForScrollOrientation === "horizontal") {
            if (!this.igxForOf[endIndex]) {
                return;
            }
            const endItemSize = parseInt(this.igxForOf[endIndex].width, 10);
            this.hScroll.scrollLeft += endItemSize;

        } else if (this.igxForScrollOrientation === "vertical" && endIndex < this.igxForOf.length - 1) {
            this.vh.instance.elementRef.nativeElement.scrollTop += parseInt(this.igxForItemSize, 10);
        }
    }

    public scrollPrev() {
        if (this.igxForScrollOrientation === "horizontal") {
            const startItemSize = parseInt(this.igxForOf[this._currIndex].width, 10);
            this.hScroll.scrollLeft -= startItemSize;
        } else if (this.igxForScrollOrientation === "vertical" && this._currIndex > 0) {
            this.vh.instance.elementRef.nativeElement.scrollTop -= parseInt(this.igxForItemSize, 10);
        }
    }

    protected onScroll(event) {
        /* in certain situations this may be called when no scrollbar is visible */
        if (!parseInt(this.vh.instance.elementRef.nativeElement.style.height, 10)) {
            return;
        }
        const scrollTop = event.target.scrollTop;
        const vcHeight = event.target.children[0].scrollHeight;
        const ratio = vcHeight !== 0 ? scrollTop / vcHeight : 0;
        const embeddedViewCopy = Object.assign([], this._embeddedViews);

        const count = this.state.totalCount || this.igxForOf.length;
        this._currIndex = Math.round(ratio * count);

        const endingIndex = this._pageSize + this._currIndex;
        if (this.state.startIndex !== this._currIndex) {
            this.state.startIndex = this._currIndex;
            this.state.endIndex = endingIndex;
            this.onChunkLoading.emit(this.state);
        }
        if (this.igxForRemote) {
            return;
        }
        for (let i = this._currIndex; i < endingIndex && this.igxForOf[i] !== undefined; i++) {
            const input = this.igxForOf[i];
            const embView = embeddedViewCopy.shift();
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
        }
        this.dc.changeDetectorRef.detectChanges();
        this.onChunkLoaded.emit();
    }

    protected onHScroll(event) {
        /* in certain situations this may be called when no scrollbar is visible */
        if (!parseInt(this.hScroll.children[0].style.width, 10)) {
            return;
        }
        const scrollLeft = event.target.scrollLeft;
        const hcWidth = event.target.children[0].scrollWidth;
        const ratio = scrollLeft / hcWidth;
        this._currIndex = this.getHorizontalIndexAt(
            scrollLeft,
            this.hCache,
            0
        );
        this.onChunkLoading.emit();
        /*recalculate and apply page size.*/
        this.applyPageSizeChange();

        const embeddedViewCopy = Object.assign([], this._embeddedViews);
        const endingIndex = this._pageSize + this._currIndex;
        for (let i = this._currIndex; i < endingIndex && this.igxForOf[i] !== undefined; i++) {
            const input = this.igxForOf[i];
            const embView = embeddedViewCopy.shift();
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
        }
        this.dc.changeDetectorRef.detectChanges();
        this.onChunkLoaded.emit();
    }

    protected onWheel(event) {
        /** runs only on the vertical directive */
        const scrollStepX = 10;
        const scrollStepY = /Edge/.test(navigator.userAgent) ? 25 : 100;

        this.vh.instance.elementRef.nativeElement.scrollTop += Math.sign(event.deltaY) * scrollStepY;
        const hScroll = this.getElement(this._viewContainer, "igx-horizontal-virtual-helper");
        if (hScroll) {
            hScroll.scrollLeft += Math.sign(event.deltaX) * scrollStepX;
        }

        const curScrollTop = this.vh.instance.elementRef.nativeElement.scrollTop;
        const maxScrollTop = this.vh.instance.height - this.vh.instance.elementRef.nativeElement.offsetHeight;
        if (0 < curScrollTop && curScrollTop < maxScrollTop) {
            event.preventDefault();
        }
    }

    protected onTouchStart(event) {
        /** runs only on the vertical directive */
        if (typeof MSGesture === "function") {
            return false;
        }
        this._lastTouchX = event.changedTouches[0].screenX;
        this._lastTouchY = event.changedTouches[0].screenY;
    }

    protected onTouchMove(event) {
        /** runs only on the vertical directive */
        if (typeof MSGesture === "function") {
            return false;
        }
        const maxScrollTop = this.vh.instance.elementRef.nativeElement.children[0].offsetHeight -
            this.dc.instance._viewContainer.element.nativeElement.offsetHeight;
        const hScroll = this.getElement(this._viewContainer, "igx-horizontal-virtual-helper");
        const movedX = this._lastTouchX - event.changedTouches[0].screenX;
        const movedY = this._lastTouchY - event.changedTouches[0].screenY;

        if (hScroll) {
            hScroll.scrollLeft += movedX;
        }
        this.vh.instance.elementRef.nativeElement.scrollTop += movedY;

        if (this.vh.instance.elementRef.nativeElement.scrollTop !== 0 &&
            this.vh.instance.elementRef.nativeElement.scrollTop !== maxScrollTop) {
            event.preventDefault();
        }

        this._lastTouchX = event.changedTouches[0].screenX;
        this._lastTouchY = event.changedTouches[0].screenY;
    }

    protected onPointerDown(event) {
        /** runs only on the vertical directive */
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

    protected onPointerUp(event) {
        /** runs only on the vertical directive */
        if (!this._pointerCapture) {
            return true;
        }

        event.target.releasePointerCapture(this._pointerCapture);
        delete this._pointerCapture;
    }

    protected onMSGestureStart(event) {
        /** runs only on the vertical directive */
        this._lastTouchX = event.screenX;
        this._lastTouchY = event.screenY;
        return false;
    }

    protected onMSGestureChange(event) {
        /** runs only on the vertical directive */
        const movedX = this._lastTouchX - event.screenX;
        const movedY = this._lastTouchY - event.screenY;

        const hScroll = this.getElement(this._viewContainer, "igx-horizontal-virtual-helper");
        if (hScroll) {
            hScroll.scrollLeft += movedX;
        }
        this.vh.instance.elementRef.nativeElement.scrollTop += movedY;

        this._lastTouchX = event.screenX;
        this._lastTouchY = event.screenY;
        return false;
    }

    get ngForTrackBy(): TrackByFunction<T> { return this._trackByFn; }

    protected _applyChanges(changes: IterableChanges<T>) {
        this._recalcScrollBarSize();
        this.applyPageSizeChange();
        if (this.igxForOf && this.igxForOf.length && this.dc) {
            const embeddedViewCopy = Object.assign([], this._embeddedViews);
            let startIndex = this._currIndex;
            let endIndex =  this._pageSize + this._currIndex;
            if (this.igxForRemote) {
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
            this.onChunkLoaded.emit();
            this.dc.changeDetectorRef.detectChanges();
        }
    }

    protected _calculatePageSize(): number {
        let pageSize = 0;
        if (this.igxForContainerSize !== null && this.igxForContainerSize !== undefined) {
            if (this.igxForScrollOrientation === "horizontal") {
                pageSize = Math.ceil(parseInt(this.igxForContainerSize, 10)) / 200;
            } else {
                pageSize = Math.ceil(parseInt(this.igxForContainerSize, 10) /
                    parseInt(this.igxForItemSize, 10));
                if (pageSize > this.igxForOf.length) {
                     pageSize = this.igxForOf.length;
                }
            }
        } else {
            pageSize = this.igxForOf.length;
        }
        return pageSize;
    }

    protected getElement(viewref, nodeName) {
        const elem = viewref.element.nativeElement.parentElement.getElementsByTagName(nodeName);
        return elem.length > 0 ? elem[0] : null;
    }

    protected initHCache(cols: any[]): number {
        let totalWidth = 0;
        let i = 0;
        this.hCache = [];
        this.hCache.push(0);
        for (i; i < cols.length; i++) {
            totalWidth += parseInt(cols[i].width, 10);
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
            midLeft > left ? set.slice(0, midIdx) : set.slice(midIdx),
            midLeft > left ? index : index + midIdx
        );
    }

    private _recalcScrollBarSize() {
        if (this.igxForScrollOrientation === "horizontal") {
            const totalWidth = this.igxForContainerSize ? this.initHCache(this.igxForOf) : 0;
            this.hScroll.children[0].style.width = totalWidth + "px";
        }
        if (this.igxForScrollOrientation === "vertical") {
            const count = this.state.totalCount || this.igxForOf.length;
            this.vh.instance.elementRef.nativeElement.style.height = parseInt(this.igxForContainerSize, 10) + "px";
            this.vh.instance.elementRef.nativeElement.children[0].style.height =
                (count * parseInt(this.igxForItemSize, 10)) + "px";
        }
    }

    private _recalcOnContainerChange(changes: SimpleChanges) {
        const containerSize = "igxForContainerSize";
        const value = changes[containerSize].currentValue;
        this.applyPageSizeChange();
        if (this.dc && this._pageSize !== this.igxForOf.length) {
            this.dc.instance.notVirtual = false;
        }
        this._recalcScrollBarSize();
    }

    private applyPageSizeChange() {
        const pageSize = this._calculatePageSize();
        if (pageSize > this._pageSize) {
            const diff = pageSize - this._pageSize;
            for (let i = 0; i < diff; i++) {
                const input = this.igxForOf[this._currIndex + this._pageSize + i];
                const embeddedView = this.dc.instance._vcr.createEmbeddedView(
                    this._template,
                    { $implicit: input, index: this.igxForOf.indexOf(input) }
                );
                this._embeddedViews.push(embeddedView);
            }
        } else if (pageSize < this._pageSize) {
            const removedViews = this._embeddedViews.splice(pageSize);
            for (let i = 0; i < removedViews.length; i++) {
                removedViews[i].destroy();
            }
        }
        this._pageSize = pageSize > 0 ? pageSize : 0;
    }
}

class RecordViewTuple<T> {
    constructor(public record: any, public view: EmbeddedViewRef<NgForOfContext<T>>) { }
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
