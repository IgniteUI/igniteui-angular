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

@Directive({ selector: "[igVirtFor][igVirtForOf]" })
export class IgVirtualForOf<T> {
    @Input() public igVirtForOf: any[];
    @Input() public igVirtForScrolling: string;
    @Input() public igVirtForUseForScroll: any;
    @Input() public igVirtForContainerSize: any;

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
        const vc = this.igVirtForUseForScroll ? this.igVirtForUseForScroll._viewContainer : this._viewContainer;
        if (this.igVirtForScrolling === "horizontal") {
            totalWidth = this.initHCache(this.igVirtForOf);
        }
        this._pageSize = this._calculatePageSize();
        const dcFactory: ComponentFactory<DisplayContainer> = this.resolver.resolveComponentFactory(DisplayContainer);
        this.dc = this._viewContainer.createComponent(dcFactory, 0);
        if (this.igVirtForOf && this.igVirtForOf.length) {
            for (let i = 0; i < this._pageSize && this.igVirtForOf[i] !== undefined; i++) {
                const input = this.igVirtForOf[i];
                const embeddedView = this.dc.instance._vcr.createEmbeddedView(
                    this._template,
                    { $implicit: input, index: this.igVirtForOf.indexOf(input) }
                );
                this._embeddedViews.push(embeddedView);
            }
        }

        if (this.igVirtForScrolling === "vertical") {
            const factory: ComponentFactory<VirtualHelper> = this.resolver.resolveComponentFactory(VirtualHelper);
            this.vh = this._viewContainer.createComponent(factory, 1);
            this.vh.instance.itemsLength = this.igVirtForOf.length;
            this._zone.runOutsideAngular(() => {
                this.vh.instance.elementRef.nativeElement.addEventListener("scroll", (evt) => { this.onScroll(evt); });
                this.dc.instance._viewContainer.element.nativeElement.addEventListener("wheel", (evt) => {
                    this.onWheel(evt);
                });
            });
        }

        if (this.igVirtForScrolling === "horizontal") {
            this.dc.instance._viewContainer.element.nativeElement.style.height = "100%";
            const directiveRef = this.igVirtForUseForScroll || this;
            this.hScroll = this.getHorizontalScroll(vc, "horizontal-virtual-helper");
            this.func = (evt) => { this.onHScroll(evt); };
            if (!this.hScroll) {
                const hvFactory: ComponentFactory<HVirtualHelper> =
                    this.resolver.resolveComponentFactory(HVirtualHelper);
                this.hvh = vc.createComponent(hvFactory);
                this.hvh.instance.width = totalWidth;
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
        const forOf = "igVirtForOf";
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
        const containerSize = "igVirtForContainerSize";
        if (containerSize in changes && !changes[containerSize].firstChange) {
            this._recalcOnContainerChange(changes);
        }
    }

    public ngDoCheck(): void {
        if (this._differ) {
            const changes = this._differ.diff(this.igVirtForOf);
            if (changes) {
                this._applyChanges(changes);
            }
        }
    }

    private onScroll(event) {
        const scrollTop = event.target.scrollTop;
        const vcHeight = event.target.children[0].scrollHeight;
        const ratio = scrollTop / vcHeight;
        const embeddedViewCopy = Object.assign([], this._embeddedViews);

        this._currIndex = Math.round(ratio * this.igVirtForOf.length);

        const endingIndex = this._pageSize + this._currIndex;
        for (let i = this._currIndex; i < endingIndex && this.igVirtForOf[i] !== undefined; i++) {
            const input = this.igVirtForOf[i];
            const embView = embeddedViewCopy.shift();
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igVirtForOf.indexOf(input);
        }
        this.dc.changeDetectorRef.detectChanges();
    }

    private onHScroll(event) {
        const scrollLeft = event.target.scrollLeft;
        const hcWidth = event.target.children[0].scrollWidth;
        const ratio = scrollLeft / hcWidth;
        const embeddedViewCopy = Object.assign([], this._embeddedViews);

        this._currIndex = Math.round(ratio * this.igVirtForOf.length);

        const endingIndex = this._pageSize + this._currIndex;
        for (let i = this._currIndex; i < endingIndex && this.igVirtForOf[i] !== undefined; i++) {
            const input = this.igVirtForOf[i];
            const embView = embeddedViewCopy.shift();
            const cntx = (embView as EmbeddedViewRef<any>).context;
            cntx.$implicit = input;
            cntx.index = this.igVirtForOf.indexOf(input);
        }
        this.dc.changeDetectorRef.detectChanges();
    }

    private onWheel(event) {
        const scrollStepX = 10;
        const scrollStepY = /Edge/.test(navigator.userAgent) ? 25 : 100;

        this.vh.instance.elementRef.nativeElement.scrollTop += Math.sign(event.deltaY) * scrollStepY;
        const hScroll = this.getHorizontalScroll(this._viewContainer, "horizontal-virtual-helper");
        hScroll.scrollLeft += Math.sign(event.deltaX) * scrollStepX;

        const curScrollTop = this.vh.instance.elementRef.nativeElement.scrollTop;
        const maxScrollTop = this.vh.instance.height - this.vh.instance.elementRef.nativeElement.offsetHeight;
        if (0 < curScrollTop && curScrollTop < maxScrollTop) {
            event.preventDefault();
        }
    }

    get ngForTrackBy(): TrackByFunction<T> { return this._trackByFn; }
    private _applyChanges(changes: IterableChanges<T>) {
        this.applyPageSizeChange();
        if (this.igVirtForOf && this.igVirtForOf.length && this.dc) {
            const embeddedViewCopy = Object.assign([], this._embeddedViews);
            const endingIndex = this._pageSize + this._currIndex;
            for (let i = this._currIndex; i < endingIndex && this.igVirtForOf[i] !== undefined; i++) {
                const input = this.igVirtForOf[i];
                const embView = embeddedViewCopy.shift();
                const cntx = (embView as EmbeddedViewRef<any>).context;
                cntx.$implicit = input;
                cntx.index = this.igVirtForOf.indexOf(input);
            }
            this.dc.changeDetectorRef.detectChanges();
        }
    }
    private _calculatePageSize(): number {
        let pageSize = 0;
        if (this.igVirtForContainerSize) {
            if (this.igVirtForScrolling === "horizontal") {
                pageSize = this.getHorizontalIndexAt(
                    parseInt(this.igVirtForContainerSize, 10),
                    this.hCache,
                    0
                ) + 1;
            } else {
                pageSize = parseInt(this.igVirtForContainerSize, 10) / 50;
            }
        } else {
            pageSize = this.igVirtForOf.length;
        }
        return pageSize;
    }
    private _recalcOnContainerChange(changes: SimpleChanges) {
        const containerSize = "igVirtForContainerSize";
        const value = changes[containerSize].currentValue;
        this.applyPageSizeChange();
    }

    private applyPageSizeChange() {
        const pageSize = this._calculatePageSize();
        if (pageSize > this._pageSize) {
            const diff = pageSize - this._pageSize;
            for (let i = 0; i < diff; i++) {
                const input = this.igVirtForOf[pageSize - i];
                const embeddedView = this.dc.instance._vcr.createEmbeddedView(
                    this._template,
                    { $implicit: input, index: this.igVirtForOf.indexOf(input) }
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

    private getHorizontalScroll(viewref, nodeName) {
        const elem = viewref.element.nativeElement.parentElement.getElementsByTagName(nodeName);
        return elem.length > 0 ? elem[0] : null;
    }

    private initHCache(cols: any[]): number {
        let totalWidth = 0;
        let i = 0;
        this.hCache = [];
        this.hCache.push(0);
        for (i; i < cols.length; i++) {
            totalWidth += cols[i].width;
            this.hCache.push(totalWidth);
        }
        return totalWidth;
    }

    private getHorizontalIndexAt(left, set, index) {
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
}

class RecordViewTuple<T> {
    constructor(public record: any, public view: EmbeddedViewRef<NgForOfContext<T>>) { }
}

export function getTypeNameForDebugging(type: any): string {
    const name = "name";
    return type[name] || typeof type;
}

@NgModule({
    declarations: [IgVirtualForOf, DisplayContainer, VirtualHelper, HVirtualHelper],
    entryComponents: [DisplayContainer, VirtualHelper, HVirtualHelper],
    exports: [IgVirtualForOf],
    imports: [CommonModule]
})

export class IgxVirtForModule {
}
