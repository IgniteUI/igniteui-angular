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
    Renderer,
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
    @Input() public effectAllowed: string = "move";

    @HostBinding("draggable") public draggable: boolean;

    @HostListener("dragstart", ["$event"])
    protected onDragStart(event) {
        if (this.dragClass) {
            this._renderer.setElementClass(this._elementRef.nativeElement,
                this.dragClass, true);
        }
        event.dataTransfer.effectAllowed = this.effectAllowed;
        event.dataTransfer.setData("data", JSON.stringify(this.data));
    }

    @HostListener("dragend", ["$event"])
    protected onDragEnd(event) {
        event.preventDefault();
        if (this.dragClass) {
            this._renderer.setElementClass(this._elementRef.nativeElement,
                this.dragClass, false);
        }
    }

    constructor(private _elementRef: ElementRef, private _renderer: Renderer) {}

    public ngOnInit() {
        this.draggable = true;
    }

    public ngOnDestroy() {
        this.draggable = false;
    }
}

@Directive({
    selector: "[igxDroppable]"
})
export class IgxDroppableDirective {

    @Input("igxDroppable") public data: any;
    @Input() public dropClass: string;
    @Input() public dropEffect: string = "move";

    @Output() public onDrop = new EventEmitter<IgxDropEvent>();

    @HostListener("dragenter", ["$event"])
    protected onDragEnter(event) {
        if (this.dropClass) {
            this._renderer.setElementClass(this._elementRef.nativeElement,
                this.dropClass, true);
        }
    }

    @HostListener("dragleave", ["$event"])
    protected onDragLeave(event) {
        if (this.dropClass) {
            this._renderer.setElementClass(this._elementRef.nativeElement,
                this.dropClass, false);
        }
    }

    @HostListener("dragover", ["$event"])
    protected onDragOver(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = this.dropEffect;
        return false;
    }

    @HostListener("drop", ["$event"])
    protected onDragDrop(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        if (this.dropClass) {
            this._renderer.setElementClass(this._elementRef.nativeElement,
                this.dropClass, false);
        }
        let eventData = JSON.parse(event.dataTransfer.getData("data"));
        this.onDrop.emit(<IgxDropEvent> {
            dragData: eventData,
            dropData: this.data,
            event
        });
    }

    constructor(private _elementRef: ElementRef, private _renderer: Renderer) {}

}

@NgModule({
    declarations: [IgxDraggableDirective, IgxDroppableDirective],
    exports: [IgxDraggableDirective, IgxDroppableDirective]
})
export class IgxDragDropModule {}
