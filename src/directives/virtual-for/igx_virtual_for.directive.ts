import { CommonModule, NgForOf, NgForOfContext } from "@angular/common";
import {
    ChangeDetectorRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    DoCheck,
    EmbeddedViewRef,
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
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewChild,
    ViewContainerRef
} from "@angular/core";

import { DisplayContainer } from "./display.container";
import { HVirtualHelper } from "./horizontal.virtual.helper.component";
import { VirtualHelper } from "./virtual.helper.component";

@Directive({ selector: "[igxVirtFor][igxVirtForOf]" })
export class igxVirtualForOf<T> {
    @Input() public igxVirtForOf: any[];
    @Input() public igxVirtForScrolling: string;
    @Input() public igxVirtForUseForScroll: any;
    @Input() public igxVirtForContainerSize: any;
    @Input() public igxVirtForItemSize: any;

    private hScroll;
    private func;
    private hCache: number[];
    private dc: ComponentRef<DisplayContainer>;
    private vh: ComponentRef<VirtualHelper>;
    private hvh: ComponentRef<HVirtualHelper>;
    private _differ: IterableDiffer<T> | null = null;
    private _trackByFn: TrackByFunction<T>;
    private _pageSize: number = 0;
    private _currIndex: number = 0;

    @ViewChild(DisplayContainer)
    private displayContiner: DisplayContainer;

    @ViewChild(VirtualHelper)
    private virtualHelper: VirtualHelper;

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
        const vc = this.igxVirtForUseForScroll ? this.igxVirtForUseForScroll._viewContainer : this._viewContainer;
        if (this.igxVirtForScrolling === "horizontal") {
            totalWidth = this.initHCache(this.igxVirtForOf);
        }
        this._pageSize = this._calculatePageSize();
        const dcFactory: ComponentFactory<DisplayContainer> = this.resolver.resolveComponentFactory(DisplayContainer);
        this.dc = this._viewContainer.createComponent(dcFactory, 0);
        if (this.igxVirtForOf && this.igxVirtForOf.length) {
            for (let i = 0; i < this._pageSize && this.igxVirtForOf[i] !== undefined; i++) {
                const input = this.igxVirtForOf[i];
                const embeddedView = this.dc.instance._vcr.createEmbeddedView(
                    this._template,
                    { $implicit: input, index: this.igxVirtForOf.indexOf(input) }
                );
                this._embeddedViews.push(embeddedView);
            }
        }

        if (this.igxVirtForScrolling === "vertical") {
            const factory: ComponentFactory<VirtualHelper> = this.resolver.resolveComponentFactory(VirtualHelper);
            this.vh = this._viewContainer.createComponent(factory, 1);
            this.vh.instance.height = this.igxVirtForOf.length * parseInt(this.igxVirtForItemSize, 10);
            this._zone.runOutsideAngular(() => {
                this.vh.instance.elementRef.nativeElement.addEventListener("scroll", (evt) => { this.onScroll(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("wheel", (evt) => {
                    this.onWheel(evt);
                });
            });
        }

        if (this.igxVirtForScrolling === "horizontal") {
            this.dc.instance._viewContainer.element.nativeElement.style.height = "100%";
            const directiveRef = this.igxVirtForUseForScroll || this;
            this.hScroll = this.getElement(vc, "horizontal-virtual-helper");
            this.func = (evt) => { this.onHScroll(evt); };
            if (!this.hScroll) {
                const hvFactory: ComponentFactory<HVirtualHelper> =
                this.resolver.resolveComponentFactory(HVirtualHelper);
                this.hvh = vc.createComponent(hvFactory);
                this.hvh.instance.width = totalWidth;
                this.hScroll =  this.hvh.instance.elementRef.nativeElement;
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

    public ngOnChanges(changes: SimpleChanges): void {
        const forOf = "igxVirtForOf";
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
        const containerSize = "igxVirtForContainerSize";
        if (containerSize in changes && !changes[containerSize].firstChange) {
            this._recalcOnContainerChange(changes);
        }
    }

    public ngDoCheck(): void {
        if (this._differ) {
            const changes = this._differ.diff(this.igxVirtForOf);
            if (changes) {
                this._applyChanges(changes);
            }
        }
    }

    public scrollNext() {
        if (this.igxVirtForScrolling === "horizontal") {
            const endIndex = this._currIndex + this._pageSize;
            if (!this.igxVirtForOf[endIndex]) {
                return;
            }
            const endItemSize = parseInt(this.igxVirtForOf[endIndex].width, 10);
            this.hScroll.scrollLeft += endItemSize;

        } else if (this.igxVirtForScrolling === "vertical") {
          this.vh.instance.elementRef.nativeElement.scrollTop += parseInt(this.igxVirtForItemSize, 10);
        }
    }
    public scrollPrev() {
        if (this.igxVirtForScrolling === "horizontal") {
            const startItemSize = parseInt(this.igxVirtForOf[this._currIndex].width, 10);
            this.hScroll.scrollLeft -= startItemSize;
        } else if (this.igxVirtForScrolling === "vertical") {
          this.vh.instance.elementRef.nativeElement.scrollTop -= parseInt(this.igxVirtForItemSize, 10);
        }
    }

    protected onScroll(event) {
        const scrollTop = event.target.scrollTop;
        const vcHeight = event.target.children[0].scrollHeight;
        const ratio = scrollTop / vcHeight;
        const embeddedViewCopy = Object.assign([], this._embeddedViews);

        this._currIndex = Math.round(ratio * this.igxVirtForOf.length);

        const endingIndex = this._pageSize + this._currIndex;
        for (let i = this._currIndex; i < endingIndex && this.igxVirtForOf[i] !== undefined; i++) {
            const input = this.igxVirtForOf[i];
            const embView = embeddedViewCopy.shift();
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igxVirtForOf.indexOf(input);
        }
        this.dc.changeDetectorRef.detectChanges();
    }

    protected onHScroll(event) {
        const scrollLeft = event.target.scrollLeft;
        const hcWidth = event.target.children[0].scrollWidth;
        const ratio = scrollLeft / hcWidth;
        this._currIndex = this.getHorizontalIndexAt(
                    scrollLeft,
                    this.hCache,
                    0
                );

        /*recalculate and apply page size.*/
        this.applyPageSizeChange();

        const embeddedViewCopy = Object.assign([], this._embeddedViews);
        const endingIndex = this._pageSize + this._currIndex;
        for (let i = this._currIndex; i < endingIndex && this.igxVirtForOf[i] !== undefined; i++) {
            const input = this.igxVirtForOf[i];
            const embView = embeddedViewCopy.shift();
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igxVirtForOf.indexOf(input);
        }
        this.dc.changeDetectorRef.detectChanges();
    }

    protected onWheel(event) {
        const scrollStepX = 10;
        const scrollStepY = /Edge/.test(navigator.userAgent) ? 25 : 100;

        this.vh.instance.elementRef.nativeElement.scrollTop += Math.sign(event.deltaY) * scrollStepY;
        const hScroll = this.getElement(this._viewContainer, "horizontal-virtual-helper");
        if (hScroll) {
            hScroll.scrollLeft += Math.sign(event.deltaX) * scrollStepX;
        }

        const curScrollTop = this.vh.instance.elementRef.nativeElement.scrollTop;
        const maxScrollTop = this.vh.instance.height - this.vh.instance.elementRef.nativeElement.offsetHeight;
        if (0 < curScrollTop && curScrollTop < maxScrollTop) {
            event.preventDefault();
        }
    }

    get ngForTrackBy(): TrackByFunction<T> { return this._trackByFn; }
    protected _applyChanges(changes: IterableChanges<T>) {
        this._recalcScrollBarSize();
        this.applyPageSizeChange();
        if (this.igxVirtForOf && this.igxVirtForOf.length && this.dc) {
            const embeddedViewCopy = Object.assign([], this._embeddedViews);
            const endingIndex = this._pageSize + this._currIndex;
            for (let i = this._currIndex; i < endingIndex && this.igxVirtForOf[i] !== undefined; i++) {
                const input = this.igxVirtForOf[i];
                const embView = embeddedViewCopy.shift();
                const cntx = (embView as EmbeddedViewRef<any>).context;
                cntx.$implicit = input;
                cntx.index = this.igxVirtForOf.indexOf(input);
            }
            this.dc.changeDetectorRef.detectChanges();
        }
    }

    protected _calculatePageSize(): number {
        let pageSize = 0;
        if (this.igxVirtForContainerSize !== null && this.igxVirtForContainerSize !== undefined) {
            if (this.igxVirtForScrolling === "horizontal") {
                const vc = this.igxVirtForUseForScroll ?
                this.igxVirtForUseForScroll._viewContainer :
                this._viewContainer;
                const hScroll = this.getElement(vc, "horizontal-virtual-helper");

                const left = hScroll && hScroll.scrollLeft !== 0 ?
                hScroll.scrollLeft + parseInt(this.igxVirtForContainerSize, 10) :
                parseInt(this.igxVirtForContainerSize, 10);

                let endIndex = this.getHorizontalIndexAt(
                    left,
                    this.hCache,
                    0
                ) + 1;
                if (endIndex > this.igxVirtForOf.length) {
                    endIndex = this.igxVirtForOf.length;
                    /*At right edge. Check if last elem fits.*/
                    let diff = this.hCache[endIndex] - this.hCache[this._currIndex];
                    if (diff > parseInt(this.igxVirtForContainerSize, 10)) {
                        /*If last col does not fit we should remove some of the prev cols to fit the last col.*/
                        while (diff > parseInt(this.igxVirtForContainerSize, 10)) {
                            diff -= parseInt(this.igxVirtForOf[this._currIndex].width, 10);
                            if (this._currIndex + 1 === endIndex) {
                                /*large column that exceeds the size of the container...*/
                                break;
                            }
                            this._currIndex++;
                        }
                    }
                }
                pageSize = endIndex - this._currIndex;
            } else {
                pageSize = parseInt(this.igxVirtForContainerSize, 10) /
                parseInt(this.igxVirtForItemSize, 10);
                if (pageSize > this.igxVirtForOf.length) {
                    pageSize = this.igxVirtForOf.length;
                }
            }
        } else {
            pageSize = this.igxVirtForOf.length;
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
        if (this.igxVirtForScrolling === "horizontal") {
            const totalWidth = this.igxVirtForContainerSize ? this.initHCache(this.igxVirtForOf) : 0;
            this.hScroll.children[0].style.width = totalWidth + "px";
        }
        if (this.igxVirtForScrolling === "vertical") {
            this.vh.instance.elementRef.nativeElement.style.height = parseInt(this.igxVirtForContainerSize, 10) + "px";
            this.vh.instance.elementRef.nativeElement.children[0].style.height =
            (this.igxVirtForOf.length * parseInt(this.igxVirtForItemSize, 10)) + "px";
        }
    }
    private _recalcOnContainerChange(changes: SimpleChanges) {
        const containerSize = "igxVirtForContainerSize";
        const value = changes[containerSize].currentValue;
        this.applyPageSizeChange();
        this._recalcScrollBarSize();
    }

    private applyPageSizeChange() {
        const pageSize = this._calculatePageSize();
        if (pageSize > this._pageSize) {
            const diff = pageSize - this._pageSize;
            for (let i = 0; i < diff; i++) {
                const input = this.igxVirtForOf[this._currIndex + this._pageSize + i];
                const embeddedView = this.dc.instance._vcr.createEmbeddedView(
                    this._template,
                    { $implicit: input, index: this.igxVirtForOf.indexOf(input) }
                );
                this._embeddedViews.push(embeddedView);
            }
        } else if (pageSize < this._pageSize) {
            const diff = this._pageSize - pageSize;
            for (let i = 0; i < diff; i++) {
                const ind = this._pageSize - i - 1;
                const embeddedView = this._embeddedViews[ind];
                embeddedView.destroy();
                this._embeddedViews.splice(ind, 1);
            }
        }
        this._pageSize = pageSize;
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
    declarations: [igxVirtualForOf, DisplayContainer, VirtualHelper, HVirtualHelper],
    entryComponents: [DisplayContainer, VirtualHelper, HVirtualHelper],
    exports: [igxVirtualForOf],
    imports: [CommonModule]
})

export class IgxVirtForModule {
}
