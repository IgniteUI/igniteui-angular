import { CommonModule } from "@angular/common";
import {
    Component, ElementRef, EventEmitter, Input, NgModule, Output,
    ViewChild
} from "@angular/core";
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";

class ScrollHammerGestureManager extends HammerGestureConfig  {
    public overrides = {
        pan: { threshold: 0, direction: Hammer.DIRECTION_VERTICAL }
    } as any;
}

/**
 * Scroll event interface
 */
export interface IgxScrollEvent {
    /**
     * Returns the index of the current top item (zero based).
     * @type {number}
     */
    currentTop: number;
}

@Component({
    moduleId: module.id,
    selector: "igx-scroll",
    styleUrls: ["./scroll.component.css"],
    templateUrl: "scroll.component.html"
})
export class IgxScroll {
    /**
     * Gets the scroll top of the scroll
     * @returns {number}
     */
    public get scrollTop(): number {
        return this.verticalScroll.nativeElement.scrollTop;
    }

    /**
     *  The amount of the actual rendered items in the scroll.
     */
    @Input()
    public visibleItemsCount: number;

    /**
     * The total amount of items in that will be virtualized.
     */
    @Input()
    public totalItemsCount: number;

    /**
     *  The height for container of the items. By design only items with same heights are supported
     */
    @Input()
    public itemHeight: number;

    /**
     * Scroll event executed each time when the viewport of the IgxScroll is scrolled.
     * @type {EventEmitter<IgxScrollEvent>}
     */
    @Output()
    public onScroll = new EventEmitter<IgxScrollEvent>();

    @ViewChild("verticalScroll")
    private verticalScroll: ElementRef;

    private animationFrameId: number;
    private velocityY: number;
    private amplitude: number;
    private timestamp: number;
    private target: number;

    /**
     * Scroll with the given delta. Does not scrolls when the scroll delta is outside of the scroll boundaries
     * @param delta
     */
    public scrollVertically(delta: number) {
        this.verticalScroll.nativeElement.scrollTop += delta;

        if (this.verticalScroll.nativeElement.scrollTop < 0) {
            return;
        }

        this.emitScroll();
    }

    private get totalHeight(): string {
        return this.itemHeight * this.visibleItemsCount  + "px";
    }

    private get innerHeight(): string {
        return this.totalItemsCount * this.itemHeight + "px";
    }

    private onMouseWheel($event): void {
        this.scrollVertically($event.deltaY);
        $event.preventDefault();
    }

    private panStart($event) {
        console.log("Pan");
    }

    private onPan($event) {
        debugger;
        if ($event.pointerType !== "touch") {
            return;
        }

        this.amplitude = 0.8 * $event.velocityY;
        this.timestamp = $event.timeStamp;
        this.target  = Math.round($event.deltaY + this.amplitude);
        this.animationFrameId = requestAnimationFrame((timestamp) => this.run(timestamp));
    }

    private run(timeStamp: number) {
        let elapsed;
        let delta;

        elapsed = Date.now() - this.timestamp;
        delta = this.amplitude * Math.exp(-elapsed / 325);

        if (delta > 0.5 || delta < -0.5) {
            this.scrollVertically((this.target + delta) * -1);
            requestAnimationFrame((timestamp) => this.run(timestamp));
        } else {
            this.scrollVertically(this.target * -1);
        }
    }

    private onScrolled($event): void {
        this.emitScroll();
    }

    private emitScroll() {
        let currentTop: number = this.verticalScroll.nativeElement.scrollTop / this.itemHeight;

        if (this.verticalScroll.nativeElement.scrollTop % this.itemHeight !== 0) {
            currentTop = Math.round(currentTop);
        }

        this.onScroll.emit({ currentTop });
    }
}

@NgModule({
    declarations: [IgxScroll],
    exports: [IgxScroll],
    imports: [CommonModule],
    providers: [{
        provide: HAMMER_GESTURE_CONFIG,
        useClass: ScrollHammerGestureManager
    }]
})
export class IgxScrollModule {
}
