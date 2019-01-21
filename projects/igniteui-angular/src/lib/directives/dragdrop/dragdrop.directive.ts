import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
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

export interface IDragBaseEventArgs {
    originalEvent: PointerEvent | MouseEvent | TouchEvent;
    owner: IgxDragDirective;
}
export interface IDragStartEventArgs extends IDragBaseEventArgs {
    cancel: boolean;
}

@Directive({
    selector: '[igxDrag]'
})
export class IgxDragDirective implements OnInit, OnDestroy {

    /**
     * - Save data inside the `igxDrag` directive. This can be set when instancing `igxDrag` on an element.
     * ```html
     * <div [igxDrag]="{ source: myElement }"></div>
     * ```
     */
    @Input('igxDrag')
    public data: any;

    /**
     * An @Input property that indicates when the drag should start
     * By default the drag starts after the draggable element is moved by 5px
     * ```html
     * <div igxDrag [dragTolerance]="100">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     */
    @Input()
    public dragTolerance = 5;

    /**
     * Sets a custom class that will be added to the `dragGhost` element.
     * ```html
     * <div igxDrag [ghostImageClass]="'dragGhost'">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     */
    @Input()
    public ghostImageClass = '';

    /**
     * An @Input property that hides the draggable element.
     * By default it's set to false.
     * ```html
     * <div igxDrag [dragTolerance]="100" [hideBaseOnDrag]="'true'">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     */
    @Input()
    public hideBaseOnDrag = false;

    /**
     * An @Input property that enables/disables the draggable element animation
     * when the element is released.
     * By default it's set to false.
     * ```html
     * <div igxDrag [animateOnRelease]="'true'">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     */
    @Input()
    public animateOnRelease = false;

    /**
     * An @Input property that sets the element to which the dragged element will be appended.
     * By default it's set to null and the dragged element is appended to the body.
     * ```html
     * <div #hostDiv></div>
     * <div igxDrag [dragGhostHost]="hostDiv">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     */
    @Input()
    public dragGhostHost = null;

    /**
     * Event triggered when the draggable element drag starts.
     * ```html
     * <div igxDrag [animateOnRelease]="'true'" (dragStart)="onDragStart()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public onDragStart(){
     *      alert("The drag has stared!");
     * }
     * ```
     */
    @Output()
    public dragStart = new EventEmitter<IDragStartEventArgs>();

    /**
     * Event triggered when the draggable element is released.
     * ```html
     * <div igxDrag [animateOnRelease]="'true'" (dragEnd)="onDragEnd()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public onDragEnd(){
     *      alert("The drag has ended!");
     * }
     * ```
     */
    @Output()
    public dragEnd = new EventEmitter<IDragBaseEventArgs>();

    /**
     * Event triggered after the draggable element is released and after its animation has finished.
     * ```html
     * <div igxDrag [animateOnRelease]="'true'" (returnMoveEnd)="onMoveEnd()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public onMoveEnd(){
     *      alert("The move has ended!");
     * }
     * ```
     */
    @Output()
    public returnMoveEnd = new EventEmitter<IDragBaseEventArgs>();

    /**
     * Event triggered when the draggable element is clicked.
     * ```html
     * <div igxDrag [animateOnRelease]="'true'" (dragClicked)="dragClicked()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public dragClicked(){
     *      alert("The elemented has been clicked!");
     * }
     * ```
     */
    @Output()
    public dragClicked = new EventEmitter<IDragBaseEventArgs>();

    /**
     * @hidden
     */
    @HostBinding('style.touchAction')
    public touch = 'none';

    /**
     * @hidden
     */
    @HostBinding('style.transitionProperty')
    public transitionProperty = 'top, left';

    /**
     * @hidden
     */
    @HostBinding('style.top.px')
    public top1 = 0;

    /**
     * @hidden
     */
    @HostBinding('style.left.px')
    public left1 = 0;

    /**
     * @hidden
     */
    @HostBinding('style.visibility')
    public _visibility = 'visible';

    /**
     * Sets the visibility of the draggable element.
     * ```typescript
     * @ViewChild("myDrag" ,{read: IgxDragDirective})
     * public myDrag: IgxDragDirective;
     * ngAfterViewInit(){
     *     this.myDrag.visible = false;
     * }
     * ```
     */
    public set visible(bVisible) {
        this._visibility = bVisible ? 'visible' : 'hidden';
        this.cdr.detectChanges();
    }

    /**
     * Returns the visibility state of the draggable element.
     * ```typescript
     * @ViewChild("myDrag" ,{read: IgxDragDirective})
     * public myDrag: IgxDragDirective;
     * ngAfterViewInit(){
     *     let dragVisibilty = this.myDrag.visible;
     * }
     * ```
     */
    public get visible() {
        return this._visibility === 'visible';
    }

    /**
     * @hidden
     */
    public set left(val: number) {
        requestAnimationFrame(() => {
            if (this._dragGhost) {
                this._dragGhost.style.left = val + 'px';
            }
        });
    }

    /**
     * @hidden
     */
    public get left() {
        return parseInt(this._dragGhost.style.left, 10);
    }

    /**
     * @hidden
     */
    public set top(val: number) {
        requestAnimationFrame(() => {
            if (this._dragGhost) {
                this._dragGhost.style.top = val + 'px';
            }
        });
    }

    /**
     * @hidden
     */
    public get top() {
        return parseInt(this._dragGhost.style.top, 10);
    }

    /**
     * Returns if the browser supports pointer events.
     * ```typescript
     * @ViewChild("myDrag" ,{read: IgxDragDirective})
     * public myDrag: IgxDragDirective;
     * ngAfterViewInit(){
     *     let pointerEvents = this.myDrag.pointerEventsEnabled;
     * }
     * ```
     */
    public get pointerEventsEnabled() {
        return typeof PointerEvent !== 'undefined';
    }

    /**
     * Returns if the browser supports touch events.
     * ```typescript
     * @ViewChild("myDrag" ,{read: IgxDragDirective})
     * public myDrag: IgxDragDirective;
     * ngAfterViewInit(){
     *     let touchEvents = this.myDrag.pointerEventsEnabled;
     * }
     * ```
     */
    public get touchEventsEnabled() {
        return 'ontouchstart' in window;
    }

    /**
     * @hidden
     */
    public defaultReturnDuration = '0.5s';

    /**
     * @hidden
     */
    protected _startX = 0;
    /**
     * @hidden
     */
    protected _startY = 0;

    /**
     * @hidden
     */
    protected _dragGhost;
    /**
     * @hidden
     */
    protected _dragStarted = false;
    /**
     * @hidden
     */
    protected _dragOffsetX;
    /**
     * @hidden
     */
    protected _dragOffsetY;
    /**
     * @hidden
     */
    protected _dragStartX;
    /**
     * @hidden
     */
    protected _dragStartY;
    /**
     * @hidden
     */
    protected _pointerDownId = null;

    /**
     * @hidden
     */
    protected _clicked = false;
    /**
     * @hidden
     */
    protected _lastDropArea = null;

    /**
     * @hidden
     */
    protected _destroy = new Subject<boolean>();

    /**
     * @hidden
     */
    protected _removeOnDestroy = true;

    constructor(public cdr: ChangeDetectorRef, public element: ElementRef, public zone: NgZone, public renderer: Renderer2) {
    }

    /**
     * @hidden
     */
    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            if (this.pointerEventsEnabled) {
                fromEvent(this.element.nativeElement, 'pointerdown').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onPointerDown(res));

                fromEvent(this.element.nativeElement, 'pointermove').pipe(
                    throttle(() => interval(0, animationFrameScheduler)),
                    takeUntil(this._destroy)
                ).subscribe((res) => this.onPointerMove(res));

                fromEvent(this.element.nativeElement, 'pointerup').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerUp(res));
            } else if (this.touchEventsEnabled) {
                // We don't have pointer events and touch events. Use then mouse events.
                fromEvent(this.element.nativeElement, 'touchstart').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onPointerDown(res));

                fromEvent(document.defaultView, 'touchmove').pipe(
                    throttle(() => interval(0, animationFrameScheduler)),
                    takeUntil(this._destroy)
                ).subscribe((res) => this.onPointerMove(res));

                fromEvent(document.defaultView, 'touchend').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerUp(res));
            } else {
                // We don't have pointer events and touch events. Use then mouse events.
                fromEvent(this.element.nativeElement, 'mousedown').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onPointerDown(res));

                fromEvent(document.defaultView, 'mousemove').pipe(
                    throttle(() => interval(0, animationFrameScheduler)),
                    takeUntil(this._destroy)
                ).subscribe((res) => this.onPointerMove(res));

                fromEvent(document.defaultView, 'mouseup').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerUp(res));
            }
        });
    }

    /**
     * @hidden
     */
    ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.complete();

        if (this._dragGhost && this._removeOnDestroy) {
            this._dragGhost.parentNode.removeChild(this._dragGhost);
            this._dragGhost = null;
        }
    }

    /**
     * @hidden
     * Method bound to the PointerDown event of the base element igxDrag is initialized.
     * @param event PointerDown event captured
     */
    public onPointerDown(event) {
        this._clicked = true;
        this._pointerDownId = event.pointerId;

        if (this.pointerEventsEnabled || !this.touchEventsEnabled) {
            // Check first for pointer events or non touch, because we can have pointer events and touch events at once.
            this._startX = event.pageX;
            this._startY = event.pageY;
        } else if (this.touchEventsEnabled) {
            this._startX = event.touches[0].pageX;
            this._startY = event.touches[0].pageY;
        }

        // Take margins because getBoundingClientRect() doesn't include margins of the element
        const marginTop = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-top'], 10);
        const marginLeft = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-left'], 10);

        this._dragOffsetX = (this._startX - this.element.nativeElement.getBoundingClientRect().left) + marginLeft;
        this._dragOffsetY = (this._startY - this.element.nativeElement.getBoundingClientRect().top) + marginTop;
        this._dragStartX = this._startX - this._dragOffsetX;
        this._dragStartY = this._startY - this._dragOffsetY;

        // Set pointer capture so we detect pointermove even if mouse is out of bounds until dragGhost is created.
        if (this.pointerEventsEnabled) {
            this.element.nativeElement.setPointerCapture(this._pointerDownId);
        } else {
            this.element.nativeElement.focus();
            event.preventDefault();
        }
    }

    /**
     * @hidden
     * Perfmorm drag move logic when dragging and dispatching events if there is igxDrop under the pointer.
     * This method is bound at first at the base element.
     * If dragging starts and after the dragGhost is rendered the pointerId is reassigned to the dragGhost. Then this method is bound to it.
     * @param event PointerMove event captured
     */
    public onPointerMove(event) {
        if (this._clicked) {
            const dragStartArgs: IDragStartEventArgs = {
                originalEvent: event,
                owner: this,
                cancel: false
            };
            let pageX, pageY;
            if (this.pointerEventsEnabled || !this.touchEventsEnabled) {
                // Check first for pointer events or non touch, because we can have pointer events and touch events at once.
                pageX = event.pageX;
                pageY = event.pageY;
            } else if (this.touchEventsEnabled) {
                pageX = event.touches[0].pageX;
                pageY = event.touches[0].pageY;

                // Prevent scrolling on touch while dragging
                event.preventDefault();
            }

            const totalMovedX = pageX - this._startX;
            const totalMovedY = pageY - this._startY;
            if (!this._dragStarted &&
                (Math.abs(totalMovedX) > this.dragTolerance || Math.abs(totalMovedY) > this.dragTolerance)) {
                this.zone.run(() => {
                    this.dragStart.emit(dragStartArgs);
                });

                if (!dragStartArgs.cancel) {
                    this._dragStarted = true;
                    // We moved enough so dragGhost can be rendered and actual dragging to start.
                    this.createDragGhost(event);
                }
                return;
            } else if (!this._dragStarted) {
                return;
            }

            this.left = this._dragStartX + totalMovedX;
            this.top = this._dragStartY + totalMovedY;

            this.dispatchDragEvents(pageX, pageY);
        }
    }

    /**
     * @hidden
     * Perform drag end logic when releasing the dragGhost and dispatchind drop event if igxDrop is under the pointer.
     * This method is bound at first at the base element.
     * If dragging starts and after the dragGhost is rendered the pointerId is reassigned to the dragGhost. Then this method is bound to it.
     * @param event PointerUp event captured
     */
    public onPointerUp(event) {
        if (!this._clicked) {
            return;
        }

        const eventArgs = {
            originalEvent: event,
            owner: this
        };
        this._clicked = false;
        if (this._dragStarted) {
            if (this._lastDropArea && this._lastDropArea !== this.element.nativeElement) {
                if (!this.animateOnRelease) {
                    this.onTransitionEnd(null);
                }

                // dragging ended over a drop area. Call this after transition because onDrop might remove the element.
                this.dispatchDropEvent(event.pageX, event.pageY);
                // else the drop directive needs to call the dropFinished() method so the animation can perform
            } else if (this.animateOnRelease &&
                    (this.left !== Math.floor(this._dragStartX) || this.top !== Math.floor(this._dragStartY))) {
                // If the start positions are the same as the current the transition will not execute.
                // return the ghost to start position before removing it. See onTransitionEnd.
                this._dragGhost.style.transitionDuration = this.defaultReturnDuration;
                this.left = this._dragStartX;
                this.top = this._dragStartY;
            } else {
                this.onTransitionEnd(null);
            }

            this.zone.run(() => {
                this.dragEnd.emit(eventArgs);
            });
        } else {
            this.zone.run(() => {
                this.dragClicked.emit(eventArgs);
            });
        }
    }

    /**
     * @hidden
     * Create dragGhost element - if a Node object is provided it creates a clone of that node,
     * otherwise it clones the host element.
     * Bind all needed events.
     * @param event Pointer event required when the dragGhost is being initialized.
     * @param node The Node object to be cloned.
     */
    protected createDragGhost(event, node: any = null) {
        this._dragGhost = node ? node.cloneNode(true) : this.element.nativeElement.cloneNode(true);
        this._dragGhost.style.transitionDuration = '0.0s';
        this._dragGhost.style.position = 'absolute';
        const hostLeft = this.dragGhostHost ? this.dragGhostHost.getBoundingClientRect().left : 0;
        const hostTop = this.dragGhostHost ? this.dragGhostHost.getBoundingClientRect().top : 0;
        this._dragGhost.style.top = this._dragStartY - hostTop + 'px';
        this._dragGhost.style.left = this._dragStartX - hostLeft + 'px';

        if (this.ghostImageClass) {
            this.renderer.addClass(this._dragGhost, this.ghostImageClass);
        }

        if (this.dragGhostHost) {
            this.dragGhostHost.appendChild(this._dragGhost);
        } else {
            document.body.appendChild(this._dragGhost);
        }

        if (this.pointerEventsEnabled) {
            // The dragGhost takes control for moving and dragging after it has been shown.
            this._dragGhost.setPointerCapture(this._pointerDownId);
            this._dragGhost.addEventListener('pointermove', (args) => {
                this.onPointerMove(args);
            });
            this._dragGhost.addEventListener('pointerup', (args) => {
                this.onPointerUp(args);
            });
        }

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

    /**
     * @hidden
     * Dispatch custom igxDragEnter/igxDragLeave events based on current pointer position and if drop area is under.
     */
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
            if (elementsFromPoint[i].getAttribute('droppable') === 'true' && elementsFromPoint[i] !== this._dragGhost) {
                topDropArea = elementsFromPoint[i];
                break;
            }
        }

        if (topDropArea) {
            this.dispatchEvent(topDropArea, 'igxDragOver', eventArgs);
        }

        if (topDropArea &&
            (!this._lastDropArea || (this._lastDropArea && this._lastDropArea !== topDropArea))) {
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
     * @hidden
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

        this.dispatchEvent(this._lastDropArea, 'igxDrop', eventArgs);
        this.dispatchEvent(this._lastDropArea, 'igxDragLeave', eventArgs);
        this._lastDropArea = null;
    }

    /**
     * @hidden
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

    /**
     * Informs the `igxDrag` directive that it has been dropped/released.
     * This should usully be called when `animateOnRelease` is set to `true`.
     * When canceling or defining custom drop logic this tells the igxDrag to update it's positions and
     * animate correctly to the new position.
     * ```typescript
     * public onDropElem(event) {
     *     // Function bound to the igxDrop directive event `onDrop`
     *     // This cancels the default drop logic of the `igxDrop`
     *     event.cancel = true;
     *     event.drag.dropFinished();
     * }
     * ```
     */
    public dropFinished() {
        if (this.animateOnRelease && this._dragGhost) {
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

    /**
     * @hidden
     */
    public onTransitionEnd(event) {
        if (this._dragStarted && !this._clicked) {
            if (this.hideBaseOnDrag) {
                this.visible = true;
            }

            this._dragGhost.parentNode.removeChild(this._dragGhost);
            this._dragGhost = null;

            this.element.nativeElement.style.transitionDuration = '0.0s';
            this._dragStarted = false;
            this.zone.run(() => {
                this.returnMoveEnd.emit({
                    originalEvent: event,
                    owner: this
                });
            });
        }
    }

    /**
     * @hidden
     */
    protected getElementsAtPoint(pageX: number, pageY: number) {
        // correct the coordinates with the current scroll position, because
        // document.elementsFromPoint conider position within the current viewport
        // window.pageXOffset == window.scrollX; // always true
        // using window.pageXOffset for IE9 compatibility
        const viewPortX = pageX - window.pageXOffset;
        const viewPortY = pageY - window.pageYOffset;
        if (document['msElementsFromPoint']) {
            // Edge and IE special snowflakes
            return document['msElementsFromPoint'](viewPortX, viewPortY);
        } else {
            // Other browsers like Chrome, Firefox, Opera
            return document.elementsFromPoint(viewPortX, viewPortY);
        }
    }

    /**
     * @hidden
     */
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
export class IgxDropDirective implements OnInit, OnDestroy {

    /**
     * - Save data inside the `igxDrop` directive. This can be set when instancing `igxDrop` on an element.
     * ```html
     * <div [igxDrop]="{ source: myElement }"></div>
     * ```
     */
    @Input('igxDrop')
    public data: any;

    /** Event triggered when dragged element enters the area of the element.
     * ```html
     * <div class="cageArea" igxDrop (onEnter)="dragEnter()" (igxDragEnter)="onDragCageEnter()" (igxDragLeave)="onDragCageLeave()">
     * </div>
     * ```
     * ```typescript
     * public dragEnter(){
     *     alert("A draggable elemente has entered the chip area!");
     * }
     * ```
     */
    @Output()
    public onEnter = new EventEmitter<IgxDropEnterEventArgs>();

    /** Event triggered when dragged element leaves the area of the element.
     * ```html
     * <div class="cageArea" igxDrop (onLeave)="dragLeave()" (igxDragEnter)="onDragCageEnter()" (igxDragLeave)="onDragCageLeave()">
     * </div>
     * ```
     * ```typescript
     * public dragLeave(){
     *     alert("A draggable elemente has left the chip area!");
     * }
     * ```
     */
    @Output()
    public onLeave = new EventEmitter<IgxDropLeaveEventArgs>();

    /** Event triggered when dragged element is dropped in the area of the element.
     * Since the `igxDrop` has default logic that appends the dropped element as a child, it can be canceled here.
     * To cancel the default logic the `cancel` property of the event needs to be set to true.
     * ```html
     * <div class="cageArea" igxDrop (onDrop)="dragDrop()" (igxDragEnter)="onDragCageEnter()" (igxDragLeave)="onDragCageLeave()">
     * </div>
     * ```
     * ```typescript
     * public dragDrop(){
     *     alert("A draggable elemente has been dropped in the chip area!");
     * }
     * ```
     */
    @Output()
    public onDrop = new EventEmitter<IgxDropEventArgs>();

    /**
     * @hidden
     */
    @HostBinding('attr.droppable')
    public droppable = true;

    /**
     * @hidden
     */
    @HostBinding('class.dragOver')
    public dragover = false;

    /**
     * @hidden
     */
    protected _destroy = new Subject<boolean>();

    constructor(public element: ElementRef, private _renderer: Renderer2, private _zone: NgZone) {
    }

    ngOnInit() {
        this._zone.runOutsideAngular(() => {
            fromEvent(this.element.nativeElement, 'igxDragEnter').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onDragEnter(res as CustomEvent<IgxDragCustomEventDetails>));

            fromEvent(this.element.nativeElement, 'igxDragLeave').pipe(takeUntil(this._destroy)).subscribe((res) => this.onDragLeave(res));
            fromEvent(this.element.nativeElement, 'igxDragOver').pipe(takeUntil(this._destroy)).subscribe((res) => this.onDragOver(res));
        });
    }

    ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.complete();
    }

    /**
     * @hidden
     */
    public onDragOver(event) { }

    /**
     * @hidden
     */
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
        this._zone.run(() => {
            this.onEnter.emit(eventArgs);
        });
    }

    /**
     * @hidden
     */
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
        this._zone.run(() => {
            this.onLeave.emit();
        });
    }

    /**
     * @hidden
     */
    @HostListener('igxDrop', ['$event'])
    public onDragDrop(event) {
        const args: IgxDropEventArgs = {
            owner: this,
            drag: event.detail.owner,
            cancel: false
        };
        this._zone.run(() => {
            this.onDrop.emit(args);
        });

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


/**
 * The IgxDragDropModule provides the {@link IgxDragDirective}, {@link IgxDropDirective} inside your application.
 */
@NgModule({
    declarations: [IgxDragDirective, IgxDropDirective],
    exports: [IgxDragDirective, IgxDropDirective]
})
export class IgxDragDropModule { }
