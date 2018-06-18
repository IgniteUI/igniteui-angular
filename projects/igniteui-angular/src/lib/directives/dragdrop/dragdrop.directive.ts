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

export class IgxDragCustomEventDetails {
    startX: number;
    startY: number;
    pageX: number;
    pageY: number;
    owner: IgxDragDirective;
}

export class IgxDropEnterEventArgs {
    owner: IgxDropDirective;
    drag: IgxDragDirective;
    dragData: any;
    startX: number;
    startY: number;
    pageX: number;
    pageY: number;
}

export class IgxDropLeaveEventArgs {
    owner: IgxDropDirective;
    drag: IgxDragDirective;
    dragData: any;
    startX: number;
    startY: number;
    pageX: number;
    pageY: number;
}

export class IgxDropEventArgs {
    owner: IgxDropDirective;
    drag: IgxDragDirective;
    cancel: boolean;
}

@Directive({
    selector: '[igxDrag]'
})
export class IgxDragDirective implements OnInit, OnDestroy {

    @Input('igxDrag')
    public data: any;

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

    @Output()
    public dragClicked = new EventEmitter<any>();

    @HostBinding('style.touchAction')
    public touch = 'none';

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
    protected _pointerDownId = null;

    protected _clicked = false;
    protected _lastDropArea = null;

    protected _destroy = new Subject<boolean>();

    constructor(public cdr: ChangeDetectorRef, public element: ElementRef, public zone: NgZone, public renderer: Renderer2) {
    }

    ngOnInit() {
        fromEvent(this.element.nativeElement, 'pointerdown').pipe(takeUntil(this._destroy))
            .subscribe((res) => this.onPointerDown(res));

        fromEvent(this.element.nativeElement, 'pointermove').pipe(
            takeUntil(this._destroy),
            throttle(() => interval(0, animationFrameScheduler))
        ).subscribe((res) => this.onPointerMove(res));

        fromEvent(this.element.nativeElement, 'pointerup').pipe(takeUntil(this._destroy))
            .subscribe((res) => this.onPointerUp(res));
    }

    ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.unsubscribe();
    }

    /**
     * Method bound to the PointerDown event of the base element igxDrag is initialized.
     * @param event PointerDown event captured
     */
    public onPointerDown(event) {
        this._clicked = true;
        this._pointerDownId = event.pointerId;
        this._startX = event.pageX;
        this._startY = event.pageY;

        // Take margins because getBoundingClientRect() doesn't include margins of the element
        const marginTop = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-top'], 10);
        const marginLeft = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-left'], 10);

        this._dragOffsetX = (event.pageX - this.element.nativeElement.getBoundingClientRect().left) + marginLeft;
        this._dragOffsetY = (event.pageY - this.element.nativeElement.getBoundingClientRect().top) + marginTop;
        this._dragStartX = event.pageX - this._dragOffsetX;
        this._dragStartY = event.pageY - this._dragOffsetY;

        // Set pointer capture so we detect pointermove even if mouse is out of bounds until dragGhost is created.
        this.element.nativeElement.setPointerCapture(this._pointerDownId);
    }

    /**
     * Perfmorm drag move logic when dragging and dispatching events if there is igxDrop under the pointer.
     * This method is bound at first at the base element.
     * If dragging starts and after the dragGhost is rendered the pointerId is reassigned to the dragGhost. Then this method is bound to it.
     * @param event PointerMove event captured
     */
    public onPointerMove(event) {
        if (this._clicked) {
            const dragStartArgs = {
                owner: this,
                cancel: false
            };
            const totalMovedX = event.pageX - this._startX;
            const totalMovedY = event.pageY - this._startY;

            if (!this._dragStarted &&
                (Math.abs(totalMovedX) > this.dragTolerance || Math.abs(totalMovedY) > this.dragTolerance)) {
                this.dragStart.emit(dragStartArgs);

                if (!dragStartArgs.cancel) {
                    // We moved enough so dragGhost can be rendered and actual dragging to start.
                    this.createDragGhost(event);
                    this._dragStarted = true;
                }
                return;
            } else if (!this._dragStarted) {
                return;
            }

            this.left = this._dragStartX + totalMovedX;
            this.top = this._dragStartY + totalMovedY;

            this.dispatchDragEvents(event.pageX, event.pageY);
        }
    }

    /**
     * Perform drag end logic when releasing the dragGhost and dispatchind drop event if igxDrop is under the pointer.
     * This method is bound at first at the base element.
     * If dragging starts and after the dragGhost is rendered the pointerId is reassigned to the dragGhost. Then this method is bound to it.
     * @param event PointerUp event captured
     */
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
                this.top = this._dragStartY;
            } else {
                this.onTransitionEnd(null);
            }

            this.dragEnd.emit();
        } else {
            this.dragClicked.emit();
        }
    }

    /**
     * Create dragGhost element - copy of the base element. Bind all needed events.
     * @param event Pointer event required when the dragGhost is being initialized.
     */
    protected createDragGhost(event) {
        this._dragGhost = this.element.nativeElement.cloneNode(true);
        this._dragGhost.style.transitionDuration = '0.0s';
        this._dragGhost.style.position = 'absolute';

        this.left = this._dragStartX;
        this.top = this._dragStartY;

        if (this.ghostImageClass) {
            this.renderer.addClass(this._dragGhost, this.ghostImageClass);
        }

        document.body.appendChild(this._dragGhost);

        // The dragGhost takes control for moving and dragging after it has been shown.
        this._dragGhost.setPointerCapture(this._pointerDownId);
        this._dragGhost.addEventListener('pointermove', (args) => {
            this.onPointerMove(args);
        });
        this._dragGhost.addEventListener('pointerup', (args) => {
            this.onPointerUp(args);
        });
        if (this.animateOnRelease) {
            // Transition animation when the dragGhost is released and it returns to it's original position.
            this._dragGhost.addEventListener('transitionend', (args) => {
                this.onTransitionEnd(args);
            });
        }

        // Hide the base after the dragGhost is created, because otherwise the dragGhost will be not visible.
        if (this.hideBaseOnDrag) {
            this.visible = false;
        }
    }

    /** Dispatch custom igxDragEnter/igxDragLeave events based on current pointer position and if drop area is under. */
    protected dispatchDragEvents(pageX: number, pageY: number) {
        let topDropArea;
        const eventArgs: IgxDragCustomEventDetails = {
            startX: this._startX,
            startY: this._startY,
            pageX: pageX,
            pageY: pageY,
            owner: this
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
                this.dispatchEvent(this._lastDropArea, 'igxDragLeave', eventArgs);
            }

            this._lastDropArea = topDropArea;
            this.dispatchEvent(this._lastDropArea, 'igxDragEnter', eventArgs);
        } else if (!topDropArea && this._lastDropArea) {
            this.dispatchEvent(this._lastDropArea, 'igxDragLeave', eventArgs);
            this._lastDropArea = null;
        }
    }

    /**
     * Dispatch custom igxDrop event based on current pointer position if there is last recorder drop area under the pointer.
     * Last recorder drop area is updated in @dispatchDragEvents method.
     */
    protected dispatchDropEvent(pageX: number, pageY: number) {
        const eventArgs: IgxDragCustomEventDetails = {
            startX: this._startX,
            startY: this._startY,
            pageX: pageX,
            pageY: pageY,
            owner: this
        };

        this.dispatchEvent(this._lastDropArea, 'igxDragLeave', eventArgs);
        this.dispatchEvent(this._lastDropArea, 'igxDrop', eventArgs);
        this._lastDropArea = null;
    }

    /**
     * Update relative positions
     */
    public updateDragRelativePos() {
        if (!this._dragGhost) {
            return;
        }

        // Calculate the new dragGhost position to remain where the mouse is, so it doesn't jump
        const totalDraggedX = this.left - this._dragStartX;
        const totalDraggedY = this.top - this._dragStartY;
        const newPosX = this.element.nativeElement.getBoundingClientRect().left;
        const newPosY = this.element.nativeElement.getBoundingClientRect().top;
        const diffStartX = this._dragStartX - newPosX;
        const diffStartY = this._dragStartY - newPosY;
        this.top = newPosX + totalDraggedX - diffStartX;
        this.left = newPosY + totalDraggedY - diffStartY;
    }

    public dropFinished() {
        if (this.animateOnRelease) {
            this.updateDragRelativePos();

            // Return the dragged element to the start. See onTransitionEnd next.
            // Take margins becuase getBoundingClientRect() doesn't include margins
            const marginTop = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-top'], 10);
            const marginLeft = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-left'], 10);
            const newPosX = this.element.nativeElement.getBoundingClientRect().left;
            const newPosY = this.element.nativeElement.getBoundingClientRect().top;

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

    protected dispatchEvent(target, eventName: string, eventArgs: IgxDragCustomEventDetails) {
        // This way is IE11 compatible.
        const dragLeaveEvent = document.createEvent('CustomEvent');
        dragLeaveEvent.initCustomEvent(eventName, false, false, eventArgs);
        target.dispatchEvent(dragLeaveEvent);
        // Othersie can be used `target.dispatchEvent(new CustomEvent(eventName, eventArgs));`
    }
}

@Directive({
    selector: '[igxDrop]'
})
export class IgxDropDirective {

    /** Event triggered when dragged element enters the area of the element */
    @Output()
    public onEnter = new EventEmitter<IgxDropEnterEventArgs>();

    /** Event triggered when dragged element leaves the area of the element */
    @Output()
    public onLeave = new EventEmitter<IgxDropLeaveEventArgs>();

    /** Event triggered when dragged element is dropped in the area of the element */
    @Output()
    public onDrop = new EventEmitter<IgxDropEventArgs>();

    @HostBinding('attr.droppable')
    public droppable = true;

    @HostBinding('class.dragOver')
    public dragover = false;

    constructor(public element: ElementRef, private _renderer: Renderer2) {
    }

    @HostListener('igxDragEnter', ['$event'])
    public onDragEnter(event: CustomEvent<IgxDragCustomEventDetails>) {
        this.dragover = true;
        const eventArgs: IgxDropEnterEventArgs = {
            owner: this,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            startX: event.detail.startX,
            startY: event.detail.startY,
            pageX: event.detail.pageX,
            pageY: event.detail.pageY
        };
        this.onEnter.emit(eventArgs);
    }

    @HostListener('igxDragLeave', ['$event'])
    public onDragLeave(event) {
        this.dragover = false;
        const eventArgs: IgxDropLeaveEventArgs = {
            owner: this,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            startX: event.detail.startX,
            startY: event.detail.startY,
            pageX: event.detail.pageX,
            pageY: event.detail.pageY
        };
        this.onLeave.emit();
    }

    @HostListener('igxDrop', ['$event'])
    public onDragDrop(event) {
        const args: IgxDropEventArgs = {
            owner: this,
            drag: event.detail.owner,
            cancel: false
        };
        this.onDrop.emit(args);

        if (!args.cancel) {
            // To do for generic scenario
            this._renderer.removeChild(event.detail.owner.element.nativeElement.parentNode, event.detail.owner.element.nativeElement);
            this._renderer.appendChild(this.element.nativeElement, event.detail.owner.element.nativeElement);

            setTimeout(() => {
                event.detail.owner.dropFinished();
            }, 0);
        }
    }
}

@NgModule({
    declarations: [IgxDragDirective, IgxDropDirective],
    exports: [IgxDragDirective, IgxDropDirective]
})
export class IgxDragDropModule { }
