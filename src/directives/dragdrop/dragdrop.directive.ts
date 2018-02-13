import {
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

export interface IgxDropEvent {
    dragData: any;
    dropData: any;
    event: MouseEvent;
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
    declarations: [IgxDraggableDirective, IgxDroppableDirective],
    exports: [IgxDraggableDirective, IgxDroppableDirective]
})
export class IgxDragDropModule {}
