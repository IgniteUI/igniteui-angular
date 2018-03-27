import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    Renderer2
} from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeUntil";
import { Subject } from "rxjs/Subject";

export interface IgxDropEvent {
    dragData: any;
    dropData: any;
    event: MouseEvent;
}

export enum RestrictDrag {
    VERTICALLY,
    HORIZONTALLY,
    NONE
}

@Directive({
    selector: "[igxDrag]"
})
export class IgxDragDirective implements OnDestroy {
    @Input()
    public restrictDrag: RestrictDrag = RestrictDrag.NONE;

    @Input()
    public restrictHDragMin: number = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictHDragMax: number = Number.MAX_SAFE_INTEGER;

    @Input()
    public restrictVDragMin: number = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictVDragMax: number = Number.MAX_SAFE_INTEGER;

    @Output()
    public dragEnd = new Subject<any>();

    @Output()
    public dragStart = new Subject<any>();

    @Output()
    public drag = new Subject<any>();

    constructor(public element: ElementRef, public cdr: ChangeDetectorRef) {

        this.dragStart.map((event) => {
            return {
                left: event.clientX - this.left,
                top: event.clientY - this.top
            };
        }).switchMap((offset) =>
            this.drag.map((event) => ({
                left: event.clientX - offset.left,
                top: event.clientY - offset.top
            })).takeUntil(this.dragEnd))
        .subscribe((pos) => {
            let left = pos.left + "px";
            let top = pos.top + "px";

            if (pos.left < this.restrictHDragMin) {
                left = this.restrictHDragMin + "px";
            }
            if (pos.left > this.restrictHDragMax) {
                left = this.restrictHDragMax + "px";
            }

            if (pos.top < this.restrictVDragMin) {
                top = this.restrictVDragMin + "px";
            }
            if (pos.top > this.restrictVDragMax) {
                top = this.restrictVDragMax + "px";
            }

            switch (this.restrictDrag) {
                case RestrictDrag.HORIZONTALLY:
                    this.left = left;
                    break;

                case RestrictDrag.VERTICALLY:
                    this.top = top;
                    break;

                case RestrictDrag.NONE:
                default:
                    this.left = left;
                    this.top = top;
                    break;
            }
        });
    }

    ngOnDestroy() {
        this.drag.unsubscribe();
        this.dragStart.unsubscribe();
        this.dragEnd.unsubscribe();
    }

    public get left() {
        return this.element.nativeElement.getBoundingClientRect().left;
    }

    public set left(val) {
        this.element.nativeElement.style.left = val;
    }

    public get top() {
        return this.element.nativeElement.getBoundingClientRect().top;
    }

    public set top(val) {
        this.element.nativeElement.style.top = val;
    }

    @HostListener("document:mouseup", ["$event"])
    onMouseup(event) {
        this.dragEnd.next(event);
        this.cdr.reattach();
    }

    @HostListener("document:mousedown", ["$event"])
    onMousedown(event) {
        this.dragStart.next(event);
        this.cdr.detach();
    }

    @HostListener("document:mousemove", ["$event"])
    onMousemove(event) {
        event.preventDefault();
        this.drag.next(event);
    }
}

@Directive({
    selector: "[igxDraggable]"
})
export class IgxDraggableDirective implements OnInit, OnDestroy {

    @Input("igxDraggable") public data: any;
    @Input() public dragClass: string;
    @Input() public effectAllowed = "move";

    @HostBinding("draggable") public draggable: boolean;

    constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {}

    public ngOnInit(): void {
        this.draggable = true;
    }

    public ngOnDestroy(): void {
        this.draggable = false;
    }

    @HostListener("dragstart", ["$event"])
    protected onDragStart(event: any): void {
        if (this.dragClass) {
            this._renderer.addClass(this._elementRef.nativeElement, this.dragClass);
        }
        event.dataTransfer.effectAllowed = this.effectAllowed;
        event.dataTransfer.setData("data", JSON.stringify(this.data));
    }

    @HostListener("dragend", ["$event"])
    protected onDragEnd(event: any): void {
        event.preventDefault();
        if (this.dragClass) {
            this._renderer.removeClass(this._elementRef.nativeElement, this.dragClass);
        }
    }
}

@Directive({
    selector: "[igxDroppable]"
})
export class IgxDroppableDirective {

    @Input("igxDroppable") public data: any;
    @Input() public dropClass: string;
    @Input() public dropEffect = "move";

    @Output() public onDrop = new EventEmitter<IgxDropEvent>();

    constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {}

    @HostListener("dragenter", ["$event"])
    protected onDragEnter(event: any): void {
        if (this.dropClass) {
            this._renderer.addClass(this._elementRef.nativeElement, this.dropClass);
        }
    }

    @HostListener("dragleave", ["$event"])
    protected onDragLeave(event: any): void {
        if (this.dropClass) {
            this._renderer.removeClass(this._elementRef.nativeElement, this.dropClass);
        }
    }

    @HostListener("dragover", ["$event"])
    protected onDragOver(event: any): boolean {
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = this.dropEffect;
        return false;
    }

    @HostListener("drop", ["$event"])
    protected onDragDrop(event: any): void {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        if (this.dropClass) {
            this._renderer.removeClass(this._elementRef.nativeElement, this.dropClass);
        }
        const eventData: any = JSON.parse(event.dataTransfer.getData("data"));
        const args: IgxDropEvent = {
            dragData: eventData,
            dropData: this.data,
            event
        };
        this.onDrop.emit(args);
    }
}

@NgModule({
    declarations: [IgxDraggableDirective, IgxDroppableDirective, IgxDragDirective],
    exports: [IgxDraggableDirective, IgxDroppableDirective, IgxDragDirective]
})
export class IgxDragDropModule {}
