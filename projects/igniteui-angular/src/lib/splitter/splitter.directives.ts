import {
    Directive,
    HostListener,
    Output, EventEmitter,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * When applied on a DOM element, this directive provides means for subscribing/unsubscribing for some `PointerEvent` events in order
 * to facilitate and make the dragging of the `SplitBarComponent` possible.
 * @export
 * @class SplitterDirective
 * @implements AfterViewInit
 * @implements OnDestroy
 */
@Directive({
    selector: '[splitter]'
})
export class SplitterDirective implements AfterViewInit, OnDestroy {

    /**
     * An event that is emitted whenever the `PointerDown` event is fired on the host element.
     * @memberof SplitterDirective
     */
    @Output()
    public pointerDown = new EventEmitter<PointerEvent>();

    /**
     * An event that is emitted whenever the `PointerMove` event is fired on the host element.
     * @memberof SplitterDirective
     */
    @Output()
    public pointerMove = new EventEmitter<PointerEvent>();

    constructor(@Inject(DOCUMENT) private document, private element: ElementRef) { }

    public ngAfterViewInit(): void {
        this.element.nativeElement.addEventListener('pointerdown', this.onPointerDown);
    }

    public ngOnDestroy(): void {
        this.element.nativeElement.removeEventListener('pointerdown', this.onPointerDown);
    }

    /**
     * A method that handles the `PoinerDown` event firing.
     * @private
     * @memberof SplitterDirective
     */
    private onPointerDown = (event: PointerEvent) => {
        if (this.document.defaultView) {
            this.pointerDown.emit(event);
            this.document.defaultView.addEventListener('pointermove', this.onPointerMove);
        }
    }

    /**
     * A method that handles the `PoinerMove` event firing.
     * @private
     * @memberof SplitterDirective
     */
    private onPointerMove = (event: PointerEvent) => {
        event.preventDefault();
        this.pointerMove.emit(event);
    }

    /**
     * Listens for `PointerUp` event on the document.
     * @return {void}@memberof SplitterDirective
     */
    @HostListener('document:pointerup')
    public onPointerUp() {
        if (this.document.defaultView) {
            this.document.defaultView.removeEventListener('pointermove', this.onPointerMove);
        }
    }
}
