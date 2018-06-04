import { DOCUMENT } from '@angular/common';
import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    Input,
    NgModule,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    Renderer2
} from '@angular/core';
import { animationFrameScheduler, fromEvent, interval, Subject } from 'rxjs';
import { takeUntil, throttle } from 'rxjs/operators';

export enum RestrictDrag {
    VERTICALLY,
    HORIZONTALLY,
    NONE
}

@Directive({
    selector: "[igxDrag]"
})
export class IgxDragDirective implements OnInit, OnDestroy {

    @Input()
    public dragTolerance = 5;

    @Input()
    public ghostImageClass = "";

    @Output()
    public dragStart = new EventEmitter<any>();

    @Output()
    public dragEnd = new EventEmitter<any>();

    @Output()
    public returnMoveEnd = new EventEmitter<any>();

    @HostBinding("style.touchAction")
    public touch = "none";

    public defaultReturnDuration = '0.5s';

    protected _startX = 0;
    protected _startY = 0;

    protected _dragGhost;
    protected _dragStarted = false;
    protected _dragOffsetX;
    protected _dragOffsetY;
    protected _dragStartX;
    protected _dragStartY;

    protected _clicked = false;
    protected _lastDropArea = null;

    protected _destroy = new Subject<boolean>();

    constructor(public element: ElementRef, public zone: NgZone) {
    }

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            fromEvent(this.element.nativeElement, "pointerdown").pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onPointerDown(res));

            fromEvent(this.element.nativeElement, "pointermove").pipe(
                takeUntil(this._destroy),
                throttle(() => interval(0, animationFrameScheduler))
            ).subscribe((res) => this.onPointerMove(res));

            fromEvent(this.element.nativeElement, "pointerup").pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onPointerUp(res));
        });
    }

    ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.unsubscribe();
    }

    public set left(val: number) {
        requestAnimationFrame(() => this._dragGhost.style.left = val + "px");
    }

    public set top(val: number) {
        requestAnimationFrame(() => this._dragGhost.style.top = val + "px");
    }

    public onPointerDown(event) {
        this.element.nativeElement.setPointerCapture(event.pointerId);
        this._dragStarted = true;
        this._clicked = true;

        this._startX = event.pageX;
        this._startY = event.pageY;

        this._dragOffsetX = (event.pageX - this.element.nativeElement.getBoundingClientRect().left);
        this._dragOffsetY = (event.pageY - this.element.nativeElement.getBoundingClientRect().top);
        this._dragStartX = event.pageX - this._dragOffsetX;
        this._dragStartY = event.pageY - this._dragOffsetY;

        event.preventDefault();
    }

    public onPointerMove(event) {
        if (this._dragStarted) {
            const totalMovedX = event.pageX - this._startX;
            const totalMovedY = event.pageY - this._startY;

            if (!this._dragGhost &&
                 (Math.abs(totalMovedX) > this.dragTolerance || Math.abs(totalMovedY) > this.dragTolerance)) {
                this.dragStart.emit();
                this.createDragGhost(event);
                return;
            } else if (!this._dragGhost) {
                // no drag grost and not moved enough for drag to occur
                return;
            }

            this.left = this._dragStartX + totalMovedX;
            this.top = this._dragStartY + totalMovedY;

            this.dispatchDragEvents(event.pageX, event.pageY);
            event.preventDefault();
        }
    }

    public onPointerUp(event) {
        this._dragStarted = false;

        if (!this._dragGhost) {
            return;
        }

        if (this._lastDropArea && !this._lastDropArea.isEqualNode(this.element.nativeElement)) {
            this._dragGhost.parentNode.removeChild(this._dragGhost);
            this._dragGhost = null;

            this.dispatchDropEvent(event.pageX, event.pageY);
        } else {
            this._dragGhost.style.transitionDuration = this.defaultReturnDuration;
            this.left = this._dragStartX;
            this.top = this._dragStartY;
        }

        this.dragEnd.emit();
    }

    public onTransitionEnd(event) {
        if (!this._dragStarted && this._clicked) {
            this._dragGhost.parentNode.removeChild(this._dragGhost);
            this._dragGhost = null;
            this._clicked = false;
            this.returnMoveEnd.emit();
        }
    }

    protected createDragGhost(event) {
        const elStyle = document.defaultView.getComputedStyle(this.element.nativeElement);
        this._dragGhost = this.element.nativeElement.cloneNode(true);

        this._dragGhost.style.background = "lightgray";
        this._dragGhost.style.border = "0.2px solid red";
        this._dragGhost.style.width = elStyle.width;
        this._dragGhost.style.height = elStyle.height;
        this._dragGhost.style.position = "absolute";
        this._dragGhost.style.cursor = "not-allowed";
        this._dragGhost.style.zIndex  = "20";
        this._dragGhost.style.transitionDuration = "0.0s";
        this.left = this._dragStartX;
        this.top = this._dragStartY;

        document.body.appendChild(this._dragGhost);
        document.body.style.cursor = "url(this._dragGhost)";

        this._dragGhost.addEventListener("transitionend", (event) => {
            this.onTransitionEnd(event);
        });
    }

    protected dispatchDragEvents(pageX: number, pageY: number) {
        let topDropArea;
        const eventArgs = {
            detail: {
                startX: this._startX,
                startY: this._startY,
                clientX: pageX,
                clientY: pageY,
                owner: this
            }
        };

        const elementsFromPoint = this.getElementsAtPoint(pageX, pageY);
        for (let i = 0; i < elementsFromPoint.length; i++) {
            if (elementsFromPoint[i].getAttribute("droppable") === "true" &&
                !elementsFromPoint[i].isEqualNode(this._dragGhost)) {
                topDropArea = elementsFromPoint[i];
                break;
            }
        }

        if (topDropArea &&
             (!this._lastDropArea || (this._lastDropArea && !this._lastDropArea.isEqualNode(topDropArea)))) {
            if (this._lastDropArea) {
                this._lastDropArea.dispatchEvent(new CustomEvent("igxDragLeave", eventArgs));
            }
            topDropArea.dispatchEvent(new CustomEvent("igxDragEnter", eventArgs));
            this._lastDropArea = topDropArea;
        } else if (!topDropArea && this._lastDropArea) {
            this._lastDropArea.dispatchEvent(new CustomEvent("igxDragLeave", eventArgs));
            this._lastDropArea = null;
        }
    }

    protected dispatchDropEvent(pageX: number, pageY: number) {
        const eventArgs = {
            detail: {
                startX: this._startX,
                startY: this._startY,
                clientX: pageX,
                clientY: pageY,
                owner: this
            }
        };

        this._lastDropArea.dispatchEvent(new CustomEvent("igxDragLeave", eventArgs));
        this._lastDropArea.dispatchEvent(new CustomEvent("igxDrop", eventArgs));
    }

    protected getElementsAtPoint(pageX: number, pageY: number) {
        if (document.msElementsFromPoint) {
            // Edge and IE special snowflakes
            return document.msElementsFromPoint(pageX, pageY);
        } else {
            // Other browsers like Chrome, Firefox, Opera
            return document.elementsFromPoint(pageX, pageY); 
        }
    }
}

@Directive({
    selector: "[igxDrop]"
})
export class IgxDropDirective {

    @HostBinding('attr.droppable')
    public droppable = true;

    @HostListener("igxDragEnter", ["$event"])
    public onDragEnter(event) {
        // To do for generic scenario
    }

    @HostListener("igxDragLeave", ["$event"])
    public onDragLeave(event) {
        // To do for generic scenario
    }

    @HostListener("igxDrop", ["$event"])
    public onDragDrop(event) {
        // To do for generic scenario
    }
}

@NgModule({
    declarations: [IgxDragDirective, IgxDropDirective],
    exports: [IgxDragDirective, IgxDropDirective]
})
export class IgxDragDropModule {}
