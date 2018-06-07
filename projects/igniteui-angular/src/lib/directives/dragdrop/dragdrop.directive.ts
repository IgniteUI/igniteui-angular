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
    Renderer2,
    ChangeDetectorRef
} from '@angular/core';
import { animationFrameScheduler, fromEvent, interval, Subject } from 'rxjs';
import { takeUntil, throttle } from 'rxjs/operators';

export enum RestrictDrag {
    VERTICALLY,
    HORIZONTALLY,
    NONE
}

@Directive({
    selector: '[igxDrag]'
})
export class IgxDragDirective implements OnInit, OnDestroy {

    @Input()
    public dragTolerance = 5;

    @Input()
    public ghostImageClass = '';

    @Input()
    public hideBaseOnDrag = false;

    @Input()
    public animateOnRelease = false;

    @Input()
    public zIndexDrag = 20;

    @Output()
    public dragStart = new EventEmitter<any>();

    @Output()
    public dragEnd = new EventEmitter<any>();

    @Output()
    public returnMoveEnd = new EventEmitter<any>();

    @HostBinding('style.touchAction')
    public touch = 'none';

    @HostBinding('style.position')
    public position = 'relative';

    @HostBinding('style.transitionProperty')
    public transitionProperty = 'top, left';

    @HostBinding('style.top.px')
    public top1 = 0;

    @HostBinding('style.left.px')
    public left1 = 0;

    @HostBinding('style.visibility')
    public _visibility = 'visible';

    public set visible(bVisible) {
        this._visibility = bVisible ? 'visible' : 'hidden';
        this.cdr.detectChanges();
    }

    public get visible() {
        return this._visibility === 'visible';
    }

    public set left(val: number) {
        requestAnimationFrame(() => {
            if (this._dragGhost) {
                this._dragGhost.style.left = val + 'px';
            }
        });
    }

    public get left() {
        return parseInt(this._dragGhost.style.left, 10);
    }

    public set top(val: number) {
        requestAnimationFrame(() => {
            if (this._dragGhost) {
                this._dragGhost.style.top = val + 'px';
            }
        });
    }

    public get top() {
        return parseInt(this._dragGhost.style.top, 10);
    }

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

    constructor(public cdr: ChangeDetectorRef, public element: ElementRef, public zone: NgZone, public renderer: Renderer2) {
    }

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            fromEvent(this.element.nativeElement, 'pointerdown').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onPointerDown(res));

            fromEvent(this.element.nativeElement, 'pointermove').pipe(
                takeUntil(this._destroy),
                throttle(() => interval(0, animationFrameScheduler))
            ).subscribe((res) => this.onPointerMove(res));

            fromEvent(this.element.nativeElement, 'pointerup').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onPointerUp(res));
        });
    }

    ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.unsubscribe();
    }

    public onPointerDown(event) {
        this.element.nativeElement.setPointerCapture(event.pointerId);
        this._clicked = true;

        this._startX = event.pageX;
        this._startY = event.pageY;

        // Take margins because getBoundingClientRect() doesn't include margins of the element
        const marginTop = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-top'], 10);
        const marginLeft = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-left'], 10);

        this._dragOffsetX = (event.pageX - this.element.nativeElement.getBoundingClientRect().left) + marginLeft;
        this._dragOffsetY = (event.pageY - this.element.nativeElement.getBoundingClientRect().top)  + marginTop;
        this._dragStartX = event.pageX - this._dragOffsetX;
        this._dragStartY = event.pageY - this._dragOffsetY;

        event.preventDefault();
    }

    public onPointerMove(event) {
        if (this._clicked) {
            const totalMovedX = event.pageX - this._startX;
            const totalMovedY = event.pageY - this._startY;

            if (!this._dragStarted &&
                    (Math.abs(totalMovedX) > this.dragTolerance || Math.abs(totalMovedY) > this.dragTolerance)) {
                this.createDragGhost(event);

                this._dragStarted = true;
                this.dragStart.emit();
                return;
            } else if (!this._dragStarted) {
                return;
            }

            this.left = this._dragStartX + totalMovedX;
            this.top = this._dragStartY + totalMovedY;

            this.dispatchDragEvents(event.pageX, event.pageY);
            event.preventDefault();
        }
    }

    public onPointerUp(event) {
        this._clicked = false;

        if (this._dragStarted) {
            if (this._lastDropArea && !this._lastDropArea.isEqualNode(this.element.nativeElement)) {
                // dragging ended over a drop area
                this.dispatchDropEvent(event.pageX, event.pageY);

                if (!this.animateOnRelease) {
                    this.onTransitionEnd(null);
                }
                // else the drop directive needs to call the dropFinished() method so the animation can perform
            } else if (this.animateOnRelease) {
                // return the ghost to start position before removing it. See onTransitionEnd.
                this._dragGhost.style.transitionDuration = this.defaultReturnDuration;
                this.left = this._dragStartX;
                this.top = this._dragStartY ;
            } else {
                this.onTransitionEnd(null);
            }

            this.dragEnd.emit();
        }
    }

    protected createDragGhost(event) {
        this._dragGhost = this.element.nativeElement.cloneNode(true);
        this._dragGhost.style.transitionDuration = '0.0s';

        this.left = this._dragStartX;
        this.top = this._dragStartY;

        if (this.ghostImageClass) {
            this.renderer.addClass(this._dragGhost, this.ghostImageClass);
        }

        document.body.appendChild(this._dragGhost);

        if (this.animateOnRelease) {
            this._dragGhost.addEventListener('transitionend', (args) => {
                this.onTransitionEnd(args);
            });
        }

        if (this.hideBaseOnDrag) {
            this.visible = false;
        }
        this.cdr.detectChanges();
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
            if (elementsFromPoint[i].getAttribute('droppable') === 'true' &&
                !elementsFromPoint[i].isEqualNode(this._dragGhost)) {
                topDropArea = elementsFromPoint[i];
                break;
            }
        }

        if (topDropArea &&
             (!this._lastDropArea || (this._lastDropArea && !this._lastDropArea.isEqualNode(topDropArea)))) {
            if (this._lastDropArea) {
                this._lastDropArea.dispatchEvent(new CustomEvent('igxDragLeave', eventArgs));
            }
            topDropArea.dispatchEvent(new CustomEvent('igxDragEnter', eventArgs));
            this._lastDropArea = topDropArea;
        } else if (!topDropArea && this._lastDropArea) {
            this._lastDropArea.dispatchEvent(new CustomEvent('igxDragLeave', eventArgs));
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

        this._lastDropArea.dispatchEvent(new CustomEvent('igxDragLeave', eventArgs));
        this._lastDropArea.dispatchEvent(new CustomEvent('igxDrop', eventArgs));
        this._lastDropArea = null;
    }

    public dropFinished() {
        if (this.animateOnRelease) {
            // Take margins becuase getBoundingClientRect() doesn't include margins
            const marginTop = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-top'], 10);
            const marginLeft = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-left'], 10);

            // Calculate the new dragGhost position to remain where the mouse is, so it doesn't jump
            const totalDraggedX = this.left - this._dragStartX;
            const totalDraggedY = this.top - this._dragStartY;
            const newPosX = this.element.nativeElement.getBoundingClientRect().left;
            const newPosY = this.element.nativeElement.getBoundingClientRect().top;
            const diffStartX = this._dragStartX - newPosX;
            const diffStartY = this._dragStartY - newPosY;
            this.top = newPosX + totalDraggedX - diffStartX;
            this.left = newPosY + totalDraggedY - diffStartY;

            // return the dragged element. See onTransitionEnd next.
            this._dragGhost.style.transitionDuration = this.defaultReturnDuration;
            this.left = newPosX - marginLeft;
            this.top = newPosY - marginTop;
        }
    }

    public onTransitionEnd(event) {
        if (this._dragStarted && !this._clicked) {
            if (this.hideBaseOnDrag) {
                this.visible = true;
            }

            this._dragGhost.parentNode.removeChild(this._dragGhost);
            this._dragGhost = null;

            this.element.nativeElement.style.transitionDuration = '0.0s';
            this._dragStarted = false;
            this.returnMoveEnd.emit();
            this.cdr.detectChanges();
        }
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
    selector: '[igxDrop]'
})
export class IgxDropDirective {

    @HostBinding('attr.droppable')
    public droppable = true;

    @HostBinding('class.dragOver')
    public dragover = false;

    constructor(public element: ElementRef, private _renderer: Renderer2) {

    }

    @HostListener('igxDragEnter', ['$event'])
    public onDragEnter(event) {
        this.dragover = true;
    }

    @HostListener('igxDragLeave', ['$event'])
    public onDragLeave(event) {
        this.dragover = false;
    }

    @HostListener('igxDrop', ['$event'])
    public onDragDrop(event) {
        // To do for generic scenario
        this._renderer.removeChild(event.detail.owner.element.nativeElement.parentNode, event.detail.owner.element.nativeElement);
        this._renderer.appendChild(this.element.nativeElement, event.detail.owner.element.nativeElement);

        setTimeout(() => {
            event.detail.owner.dropFinished();
        }, 0);
    }
}

@NgModule({
    declarations: [IgxDragDirective, IgxDropDirective],
    exports: [IgxDragDirective, IgxDropDirective]
})
export class IgxDragDropModule {}
