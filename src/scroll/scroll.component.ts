import { CommonModule } from "@angular/common";
import {
    AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Input, NgModule, OnInit, Output,
    Renderer2,
    ViewChild
} from "@angular/core";
import { HammerGesturesManager } from "../core/touch";

@Component({
    moduleId: module.id,
    providers: [HammerGesturesManager],
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
        this.scrollVertically($event.deltaY * -1);
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
    imports: [CommonModule]
})
export class IgxScrollModule {
}
