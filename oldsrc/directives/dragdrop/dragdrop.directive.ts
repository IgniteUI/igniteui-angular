import { DOCUMENT } from "@angular/common";
import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    Renderer2
} from "@angular/core";
import { Subject } from "rxjs";
import { map, switchMap, takeUntil} from "rxjs/operators";

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
export class IgxDragDirective {
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

    private _left;
    private _top;

    constructor(public element: ElementRef, public cdr: ChangeDetectorRef, @Inject(DOCUMENT) public document) {

        this.dragStart.pipe(
            map((event) => ({ left: event.clientX, top: event.clientY })),
            switchMap((offset) => this.drag.pipe(
                map((event) => ({ left: event.clientX - offset.left, top: event.clientY - offset.top })),
                takeUntil(this.dragEnd)
            ))
        ).subscribe((pos) => {
            const left = this._left + pos.left;
            const top = this._top + pos.top;

            if (this.restrictDrag === RestrictDrag.HORIZONTALLY || this.restrictDrag === RestrictDrag.NONE) {

                this.left = left < this.restrictHDragMin ? this.restrictHDragMin + "px" : left + "px";

                if (left > this.restrictHDragMax) {
                    this.left = this.restrictHDragMax + "px";
                } else if (left > this.restrictHDragMin) {
                    this.left = left + "px";
                }
            }

            if (this.restrictDrag === RestrictDrag.VERTICALLY || this.restrictDrag === RestrictDrag.NONE) {

                this.top = top < this.restrictVDragMin ? this.restrictVDragMin + "px" : top + "px";

                if (top > this.restrictVDragMax) {
                    this.top = this.restrictVDragMax + "px";
                } else if (top > this.restrictVDragMin) {
                    this.top = top + "px";
                }
            }
        });
    }

    public set left(val) {
        this.element.nativeElement.style.left = val;
    }

    public set top(val) {
        this.element.nativeElement.style.top = val;
    }

    @HostListener("document:mouseup", ["$event"])
    onMouseup(event) {
        this.dragEnd.next(event);
        this.cdr.reattach();
    }

    @HostListener("mousedown", ["$event"])
    onMousedown(event) {
        this.dragStart.next(event);

        const elStyle = this.document.defaultView.getComputedStyle(this.element.nativeElement);

        this._left = Number.isNaN(parseInt(elStyle.left, 10)) ? 0 : parseInt(elStyle.left, 10);
        this._top = Number.isNaN(parseInt(elStyle.top, 10)) ? 0 : parseInt(elStyle.top, 10);

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
