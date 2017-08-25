import { CommonModule } from "@angular/common";
import {
    AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Input, NgModule, OnInit, Output,
    Renderer2,
    ViewChild
} from "@angular/core";
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";

export class ScrollHammerGestureManager extends HammerGestureConfig  {
    public overrides = {
        pan: { threshold: 0 } // override default settings
    } as any;
}

@Component({
    moduleId: module.id,
    selector: "igx-scroll",
    styleUrls: ["./scroll.component.css"],
    templateUrl: "scroll.component.html"
})
export class IgxScroll implements OnInit, AfterViewInit {
    @Input()
    public hasVerticalScrollBar: boolean;

    @Input()
    public verticalScrollHeight: string;

    @Input()
    public itemsToView: number;

    @Input()
    public totalItemsCount: number;

    @Input()
    public averageHeight: number;

    @Output()
    public onScroll = new EventEmitter();

    @ViewChild("verticalScroll")
    public verticalScroll: ElementRef;

    private animationFrameId: number;
    private velocityY: number;
    private deltaY: number;
    private amplitude: number;
    private timestamp: number;
    private target: number;


    public get totalHeight(): string {
        return this.averageHeight * this.itemsToView  + "px";
    }

    public get innerHeight(): string {
        return this.totalItemsCount * this.averageHeight + "px";
    }

    public ngOnInit(): void {
        // throw new Error("Method not implemented.");
    }

    public ngAfterViewInit(): void {
        // throw new Error("Method not implemented.");
    }

    private onMouseWheel($event): void {
        this.scrollVertically($event.deltaY);
        $event.preventDefault();
    }

    private onPanend($event) {
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

    private scrollVertically(delta) {
        this.verticalScroll.nativeElement.scrollTop += delta;

        if (this.verticalScroll.nativeElement.scrollTop < 0) {
            return;
        }

        this.emitScroll();
    }

    private onScrolled($event): void {
        this.emitScroll();
    }

    private emitScroll() {
        let currentTop: number = this.verticalScroll.nativeElement.scrollTop / this.averageHeight;

        if (this.verticalScroll.nativeElement.scrollTop % this.averageHeight !== 0) {
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
