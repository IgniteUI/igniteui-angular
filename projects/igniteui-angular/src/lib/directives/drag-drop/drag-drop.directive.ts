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
    ChangeDetectorRef,
    ViewContainerRef,
    AfterContentInit,
    TemplateRef,
    ContentChildren,
    QueryList
} from '@angular/core';
import { animationFrameScheduler, fromEvent, interval, Subject } from 'rxjs';
import { takeUntil, throttle } from 'rxjs/operators';
import { IgxDragHandleDirective } from './drag-handle.directive';
import { DeprecateProperty } from '../../core/deprecateDecorators';

export enum RestrictDrag {
    VERTICALLY,
    HORIZONTALLY,
    NONE
}

export interface IgxDragCustomEventDetails {
    startX: number;
    startY: number;
    pageX: number;
    pageY: number;
    owner: IgxDragDirective;
    originalEvent: any;
}

export interface IgxDropEnterEventArgs {
        /**
     * Reference to the original event that caused the draggable element to enter the igxDrop element.
     * Can be PointerEvent, TouchEvent or MouseEvent.
     */
    originalEvent: any;
    /** The owner igxDrop directive that triggered this event. */
    owner: IgxDropDirective;
    /** The igxDrag directive instanced on an element that entered the area of the igxDrop element */
    drag: IgxDragDirective;
    /** The data contained for the draggable element in igxDrag directive. */
    dragData: any;
    /** The initial position of the pointer on X axis when the dragged element began moving */
    startX: number;
    /** The initial position of the pointer on Y axis when the dragged element began moving */
    startY: number;
    /**
     * The current position of the pointer on X axis when the event was triggered.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    pageX: number;
    /**
     * The current position of the pointer on Y axis when the event was triggered.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    pageY: number;
    /**
     * The current position of the pointer on X axis relative to the container that initializes the igxDrop.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    offsetX: number;
    /**
     * The current position of the pointer on Y axis relative to the container that initializes the igxDrop.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    offsetY: number;
}

export interface IgxDropLeaveEventArgs {
    /**
     * Reference to the original event that caused the draggable element to enter the igxDrop element.
     * Can be PointerEvent, TouchEvent or MouseEvent.
     */
    originalEvent: any;
    /** The owner igxDrop directive that triggered this event. */
    owner: IgxDropDirective;
    /** The igxDrag directive instanced on an element that entered the area of the igxDrop element */
    drag: IgxDragDirective;
    /** The data contained for the draggable element in igxDrag directive. */
    dragData: any;
    /** The initial position of the pointer on X axis when the dragged element began moving */
    startX: number;
    /** The initial position of the pointer on Y axis when the dragged element began moving */
    startY: number;
    /**
     * The current position of the pointer on X axis when the event was triggered.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    pageX: number;
        /**
     * The current position of the pointer on Y axis when the event was triggered.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    pageY: number;
    /**
     * The current position of the pointer on X axis relative to the container that initializes the igxDrop.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    offsetX: number;
    /**
     * The current position of the pointer on Y axis relative to the container that initializes the igxDrop.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    offsetY: number;
}

export interface IgxDropEventArgs {
    /**
     * Reference to the original event that caused the draggable element to enter the igxDrop element.
     * Can be PointerEvent, TouchEvent or MouseEvent.
     */
    originalEvent: any;
    /** The owner igxDrop directive that triggered this event. */
    owner: IgxDropDirective;
    /** The igxDrag directive instanced on an element that entered the area of the igxDrop element */
    drag: IgxDragDirective;
    /** The data contained for the draggable element in igxDrag directive. */
    dragData: any;
    /**
     * The current position of the pointer on X axis relative to the container that initializes the igxDrop.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    offsetX: number;
    /**
     * The current position of the pointer on Y axis relative to the container that initializes the igxDrop.
     * Note: The browser might trigger the event with some delay and pointer would be already inside the igxDrop.
     */
    offsetY: number;
    /**
     * Whether the default drop behavior of the igxDrop directive should be canceled.
     * Note: If you implement custom behavior and you use `animateOnRelease` for the igxDrag make sure to call 'event.drag.dropFinished();'
     * to notify the igxDrag directive that it has been dropped so it animates properly.
     */
    cancel: boolean;
}

export interface IDragBaseEventArgs {
    /**
     * Reference to the original event that caused the interaction with the element.
     * Can be PointerEvent, TouchEvent or MouseEvent.
     */
    originalEvent: PointerEvent | MouseEvent | TouchEvent;
    /** The owner igxDrag directive that triggered this event. */
    owner: IgxDragDirective;
}
export interface IDragStartEventArgs extends IDragBaseEventArgs {
    /** Set if the the dragging should be canceled. */
    cancel: boolean;
}

export interface IDragLocation {
    pageX: number;
    pageY: number;
}

@Directive({
    exportAs: 'drag',
    selector: '[igxDrag]'
})
export class IgxDragDirective implements AfterContentInit, OnDestroy {

    /**
     * - Save data inside the `igxDrag` directive. This can be set when instancing `igxDrag` on an element.
     * ```html
     * <div [igxDrag]="{ source: myElement }"></div>
     * ```
     * @memberof IgxDragDirective
     */
    @Input('igxDrag')
    public data: any;

    /**
     * An @Input property that indicates when the drag should start.
     * By default the drag starts after the draggable element is moved by 5px.
     * ```html
     * <div igxDrag [dragTolerance]="100">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * @memberof IgxDragDirective
     */
    @Input()
    public dragTolerance = 5;

    /**
     * An @Input property that provide a way for igxDrag and igxDrop to be linked through channels.
     * It accepts single value or an array of values and evaluates then using strict equality.
     * ```html
     * <div igxDrag [dragChannel]="'odd'">
     *         <span>95</span>
     * </div>
     * <div igxDrop [dropChannel]="['odd', 'irrational']">
     *         <span>Numbers drop area!</span>
     * </div>
     * ```
     * @memberof IgxDragDirective
     */
    @Input()
    public dragChannel: number | string | number[] | string[];

    /**
     * An @Input property that specifies if the base element should not be moved and a ghost element should be rendered that represents it.
     * By default it is set to `true`.
     * If it is set to `false` when dragging the base element is moved instead and no ghost elements are rendered.
     * ```html
     * <div igxDrag [renderGhost]="true">
     *      <span>Drag Me!</span>
     * </div>
     * ```
     * @memberof IgxDragDirective
     */
    @Input()
    public renderGhost = true;

    /**
     * @deprecated Please use ghost template instead.
     * Sets a custom class that will be added to the `dragGhost` element.
     * ```html
     * <div igxDrag [ghostImageClass]="'dragGhost'">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * @memberof IgxDragDirective
     */
    @DeprecateProperty(`'ghostImageClass' @Input property is deprecated and will be removed in future major versions.
        Please use ghost template instead using 'ghostTemplate'.`)
    @Input()
    public ghostImageClass = '';

    /**
     * @deprecated Please use custom base styling instead.
     * An @Input property that hides the draggable element.
     * By default it's set to false.
     * ```html
     * <div igxDrag [dragTolerance]="100" [hideBaseOnDrag]="'true'">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * @memberof IgxDragDirective
     */
    @DeprecateProperty(`'hideBaseOnDrag' @Input property is deprecated and will be removed in future major versions.
        Please use custom base styling instead.`)
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
     * @memberof IgxDragDirective
     */
    @Input()
    public animateOnRelease = false;

    /**
     * An @Input property that specifies a template for the ghost element created when dragging starts and `renderGhost` is true.
     * By default a clone of the base element the igxDrag is instanced is created.
     * ```html
     * <div igxDrag [ghostTemplate]="customGhost">
     *         <span>Drag Me!</span>
     * </div>
     * <ng-template #customGhost>
     *      <div class="customGhostStyle">
     *          <span>I am being dragged!</span>
     *      </div>
     * </ng-template>
     * ```
     * @memberof IgxDragDirective
     */
    @Input()
    public ghostTemplate: TemplateRef<any>;

    /**
     * An @Input property that sets the element to which the dragged element will be appended.
     * By default it's set to null and the dragged element is appended to the body.
     * ```html
     * <div #hostDiv></div>
     * <div igxDrag [dragGhostHost]="hostDiv">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * @memberof IgxDragDirective
     */
    @Input()
    public dragGhostHost;

    /**
     * An @Input property that specifies the offset of the ghost created relative to the mouse.
     * By default it's taking the relative position to the mouse when the drag started and keeps it the same.
     * ```html
     * <div #hostDiv></div>
     * <div igxDrag [ghostOffsetX]="0">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * @memberof IgxDragDirective
     */
    @Input()
    public ghostOffsetX: number;

    /**
     * An @Input property that specifies the offset of the ghost created relative to the mouse.
     * By default it's taking the relative position to the mouse when the drag started and keeps it the same.
     * ```html
     * <div #hostDiv></div>
     * <div igxDrag [ghostOffsetY]="0">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * @memberof IgxDragDirective
     */
    @Input()
    public ghostOffsetY: number;

    /**
     * Event triggered when the draggable element drag starts.
     * ```html
     * <div igxDrag (dragStart)="onDragStart()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public onDragStart(){
     *      alert("The drag has stared!");
     * }
     * ```
     * @memberof IgxDragDirective
     */
    @Output()
    public dragStart = new EventEmitter<IDragStartEventArgs>();

    /**
     * Event triggered when the draggable element has been moved.
     * ```html
     * <div igxDrag  (dragMove)="onDragMove()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public onDragMove(){
     *      alert("The element has moved!");
     * }
     * ```
     * @memberof IgxDragDirective
     */
    @Output()
    public dragMove = new EventEmitter<IDragBaseEventArgs>();

    /**
     * Event triggered when the draggable element is released.
     * ```html
     * <div igxDrag (dragEnd)="onDragEnd()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public onDragEnd(){
     *      alert("The drag has ended!");
     * }
     * ```
     * @memberof IgxDragDirective
     */
    @Output()
    public dragEnd = new EventEmitter<IDragBaseEventArgs>();

    /**
     * Event triggered when the drag ghost element is created.
     * ```html
     * <div igxDrag (onGhostCreate)="ghostCreated()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public ghostCreated(){
     *      alert("The ghost has been created!");
     * }
     * ```
     * @memberof IgxDragDirective
     */
    @Output()
    public onGhostCreate = new EventEmitter<any>();

    /**
     * Event triggered when the drag ghost element is created.
     * ```html
     * <div igxDrag (onGhostDestroy)="ghostDestroyed()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public ghostDestroyed(){
     *      alert("The ghost has been destroyed!");
     * }
     * ```
     * @memberof IgxDragDirective
     */
    @Output()
    public onGhostDestroy = new EventEmitter<any>();

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
     * @memberof IgxDragDirective
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
     * @memberof IgxDragDirective
     */
    @Output()
    public dragClicked = new EventEmitter<IDragBaseEventArgs>();

    /**
     * @hidden
     */
    @ContentChildren(IgxDragHandleDirective)
    public dragHandles: QueryList<IgxDragHandleDirective>;

    /**
     * @hidden
     */
    @HostBinding('style.touchAction')
    public touch = 'none';

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

    public get location(): IDragLocation {
        return { pageX: this.pageX, pageY: this.pageY};
    }

    /**
     * @hidden
     */
    public get pageX() {
        if (this.renderGhost && this.dragGhost) {
            return this.ghostLeft;
        }
        return this.element.nativeElement.getBoundingClientRect().left;
    }

    /**
     * @hidden
     */
    public get pageY() {
        if (this.renderGhost && this.dragGhost) {
            return this.ghostTop;
        }
        return this.element.nativeElement.getBoundingClientRect().top;
    }

    /**
     * @hidden
     */
    public set ghostLeft(pageX: number) {
        requestAnimationFrame(() => {
            if (this.dragGhost) {
                // If ghost host is defined it needs to be taken into account.
                this.dragGhost.style.left = (pageX - this._dragGhostHostX) + 'px';
            }
        });
    }

    /**
     * @hidden
     */
    public get ghostLeft() {
        return parseInt(this.dragGhost.style.left, 10) + this._dragGhostHostX;
    }

    /**
     * @hidden
     */
    public set ghostTop(pageY: number) {
        requestAnimationFrame(() => {
            if (this.dragGhost) {
                // If ghost host is defined it needs to be taken into account.
                this.dragGhost.style.top = (pageY - this._dragGhostHostY) + 'px';
            }
        });
    }

    /**
     * @hidden
     */
    public get ghostTop() {
        return parseInt(this.dragGhost.style.top, 10) + this._dragGhostHostY;
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
     * @memberof IgxDragDirective
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
     * @memberof IgxDragDirective
     */
    public get touchEventsEnabled() {
        return 'ontouchstart' in window;
    }

    /**
     * @hidden
     */
    public defaultReturnDuration = '0.5s';

    protected _startX = 0;
    protected _startY = 0;
    protected _lastX = 0;
    protected _lastY = 0;
    protected _baseOriginX;
    protected _baseOriginY;
    protected _dragStarted = false;

    protected dragGhost;
    protected _ghostOffsetX;
    protected _ghostOffsetY;
    protected _ghostStartX;
    protected _ghostStartY;
    protected _dragGhostHostX = 0;
    protected _dragGhostHostY = 0;

    protected _pointerDownId = null;
    protected _clicked = false;
    protected _lastDropArea = null;

    protected _destroy = new Subject<boolean>();
    protected _removeOnDestroy = true;

    constructor(
        public cdr: ChangeDetectorRef,
        public element: ElementRef,
        public viewContainer: ViewContainerRef,
        public zone: NgZone,
        public renderer: Renderer2
    ) {
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        this.zone.runOutsideAngular(() => {
            const targetElements = this.dragHandles && this.dragHandles.length ?
                this.dragHandles.map((item) => item.element.nativeElement) : [this.element.nativeElement];
            targetElements.forEach((element) => {
                if (this.pointerEventsEnabled) {
                    fromEvent(element, 'pointerdown').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerDown(res));

                    fromEvent(element, 'pointermove').pipe(
                        throttle(() => interval(0, animationFrameScheduler)),
                        takeUntil(this._destroy)
                    ).subscribe((res) => this.onPointerMove(res));

                    fromEvent(element, 'pointerup').pipe(takeUntil(this._destroy))
                        .subscribe((res) => this.onPointerUp(res));

                    if (!this.renderGhost) {
                        // Do not bind `lostpointercapture` to the target, because we will bind it on the ghost later.
                        fromEvent(element, 'lostpointercapture').pipe(takeUntil(this._destroy))
                        .subscribe((res) => this.onPointerLost(res));
                    }
                } else if (this.touchEventsEnabled) {
                    fromEvent(element, 'touchstart').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerDown(res));
                } else {
                    // We don't have pointer events and touch events. Use then mouse events.
                    fromEvent(element, 'mousedown').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerDown(res));
                }
            });

            // We should bind to document events only once when there are no pointer events.
            if (!this.pointerEventsEnabled && this.touchEventsEnabled) {
                fromEvent(document.defaultView, 'touchmove').pipe(
                    throttle(() => interval(0, animationFrameScheduler)),
                    takeUntil(this._destroy)
                ).subscribe((res) => this.onPointerMove(res));

                fromEvent(document.defaultView, 'touchend').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerUp(res));
            } else if (!this.pointerEventsEnabled) {
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
    public ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.complete();

        if (this.renderGhost && this.dragGhost && this._removeOnDestroy) {
            this.dragGhost.parentNode.removeChild(this.dragGhost);
            this.dragGhost = null;
        }
    }

    public setLocation(newLocation: IDragLocation) {
        if (this.renderGhost && this.dragGhost) {
            const offsetParentX = this.dragGhost.offsetParent.getBoundingClientRect().left;
            const offsetParentY = this.dragGhost.offsetParent.getBoundingClientRect().top;
            this.ghostLeft = newLocation.pageX - offsetParentX;
            this.ghostTop = newLocation.pageY - offsetParentY;
        } else if (!this.renderGhost) {
            const deltaX = newLocation.pageX - this.pageX;
            const deltaY = newLocation.pageY - this.pageY;
            const transformX = this.getTransformX(this.element.nativeElement);
            const transformY = this.getTransformY(this.element.nativeElement);
            this.setTransformXY(transformX + deltaX, transformY + deltaY);
        }

        // Reset runtime updated values when dragging
        this._startX = newLocation.pageX;
        this._startY = newLocation.pageY;
    }

    /** Sets offset to dragged element or the ghost rendered relative to the offset parent. */
    public setRelativeOffset(offsetX: number, offsetY: number) {
        if (this.renderGhost && this.dragGhost) {
            this.ghostLeft = offsetX;
            this.ghostTop = offsetY;
        } else if (!this.renderGhost) {
            this.setTransformXY(offsetX, offsetY);
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

        // Set pointer capture so we detect pointermove even if mouse is out of bounds until dragGhost is created.
        const handleFound = this.dragHandles.find(handle => handle.element.nativeElement === event.target);
        const targetElement = handleFound ? handleFound.element.nativeElement : this.element.nativeElement;
        if (this.pointerEventsEnabled) {
            targetElement.setPointerCapture(this._pointerDownId);
        } else {
            targetElement.focus();
            event.preventDefault();
        }

        if (!this._baseOriginX && !this._baseOriginY) {
            this._baseOriginX = this.element.nativeElement.getBoundingClientRect().left;
            this._baseOriginY = this.element.nativeElement.getBoundingClientRect().top;
        }

        if (this.pointerEventsEnabled || !this.touchEventsEnabled) {
            // Check first for pointer events or non touch, because we can have pointer events and touch events at once.
            this._startX = event.pageX;
            this._startY = event.pageY;
        } else if (this.touchEventsEnabled) {
            this._startX = event.touches[0].pageX;
            this._startY = event.touches[0].pageY;
        }

        if (this.ghostOffsetX !== undefined) {
            this._ghostOffsetX = this.ghostOffsetX;
        } else {
            const marginLeft = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-left'], 10);
            this._ghostOffsetX = this.element.nativeElement.getBoundingClientRect().left + this.getWindowScrollLeft() - marginLeft -
                this._startX;
        }

        if (this.ghostOffsetY !== undefined) {
            this._ghostOffsetY = this.ghostOffsetY;
        } else {
            const marginTop = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-top'], 10);
            this._ghostOffsetY = this.element.nativeElement.getBoundingClientRect().top + this.getWindowScrollTop() - marginTop -
                this._startY;
        }

        this._ghostStartX = this._startX + this._ghostOffsetX;
        this._ghostStartY = this._startY + this._ghostOffsetY;
        this._lastX = this._startX;
        this._lastY = this._startY;
    }

    /**
     * @hidden
     * Perform drag move logic when dragging and dispatching events if there is igxDrop under the pointer.
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
                    if (this.renderGhost) {
                        // We moved enough so dragGhost can be rendered and actual dragging to start.
                        this.createDragGhost(pageX, pageY);
                    }
                } else {
                    return;
                }
            } else if (!this._dragStarted) {
                return;
            }

            if (this.renderGhost) {
                this.ghostLeft = this._ghostStartX + totalMovedX;
                this.ghostTop = this._ghostStartY + totalMovedY;
            } else {
                const lastMovedX = pageX - this._lastX;
                const lastMovedY = pageY - this._lastY;
                const translateX = this.getTransformX(this.element.nativeElement) + lastMovedX;
                const translateY = this.getTransformY(this.element.nativeElement) + lastMovedY;
                this.setTransformXY(translateX, translateY);
            }

            this.dispatchDragEvents(pageX, pageY, event);

            this._lastX = pageX;
            this._lastY = pageY;
        }
    }

    /**
     * @hidden
     * Perform drag end logic when releasing the dragGhost and dispatching drop event if igxDrop is under the pointer.
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
                this.dispatchDropEvent(event.pageX, event.pageY, event);
                // else the drop directive needs to call the dropFinished() method so the animation can perform
            } else if (this.animateOnRelease &&
                    (this.ghostLeft !== Math.floor(this._ghostStartX) || this.ghostTop !== Math.floor(this._ghostStartY))) {
                // If the start positions are the same as the current the transition will not execute.
                // return the ghost to start position before removing it. See onTransitionEnd.
                this.dragGhost.style.transitionDuration = this.defaultReturnDuration;
                this.ghostLeft = this._ghostStartX;
                this.ghostTop = this._ghostStartY;
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
     * Execute this method whe the pointer capture has been lost.
     * This means that during dragging the user has performed other action like right clicking and then clicking somewhere else.
     * This method will ensure that the drag state is being reset in this case as if the user released the dragged element.
     * @param event Event captured
     */
    public onPointerLost(event) {
        if (!this._clicked) {
            return;
        }

        const eventArgs = {
            originalEvent: event,
            owner: this
        };
        this._clicked = false;
        if (this._dragStarted) {
            if (this.animateOnRelease &&
                    (this.ghostLeft !== Math.floor(this._ghostStartX) || this.ghostTop !== Math.floor(this._ghostStartY))) {
                // If the start positions are the same as the current the transition will not execute.
                // return the ghost to start position before removing it. See onTransitionEnd.
                this.dragGhost.style.transitionDuration = this.defaultReturnDuration;
                this.ghostLeft = this._ghostStartX;
                this.ghostTop = this._ghostStartY;
            } else {
                this.onTransitionEnd(null);
            }

            this.zone.run(() => {
                this.dragEnd.emit(eventArgs);
            });
        }
    }

    /**
     * @hidden
     * Create dragGhost element - if a Node object is provided it creates a clone of that node,
     * otherwise it clones the host element.
     * Bind all needed events.
     * @param pageX Latest pointer position on the X axis relative to the page.
     * @param pageY Latest pointer position on the Y axis relative to the page.
     * @param node The Node object to be cloned.
     */
    protected createDragGhost(pageX, pageY, node: any = null) {
        if (this.ghostTemplate) {
            const dynamicGhostRef = this.viewContainer.createEmbeddedView(this.ghostTemplate);
            this.dragGhost = dynamicGhostRef.rootNodes[0];
        } else {
            this.dragGhost = node ? node.cloneNode(true) : this.element.nativeElement.cloneNode(true);
        }

        const totalMovedX = pageX - this._startX;
        const totalMovedY = pageY - this._startY;
        this._dragGhostHostX = this.dragGhostHost ? this.getDragGhostHostOffsetLeft(this.dragGhostHost) : 0;
        this._dragGhostHostY = this.dragGhostHost ? this.getDragGhostHostOffsetTop(this.dragGhostHost) : 0;

        this.dragGhost.style.transitionDuration = '0.0s';
        this.dragGhost.style.position = 'absolute';
        this.ghostLeft = this._ghostStartX + totalMovedX;
        this.ghostTop = this._ghostStartY + totalMovedY;

        if (this.ghostImageClass) {
            this.renderer.addClass(this.dragGhost, this.ghostImageClass);
        }

        if (this.dragGhostHost) {
            this.dragGhostHost.appendChild(this.dragGhost);
        } else {
            document.body.appendChild(this.dragGhost);
        }

        if (this.renderGhost) {
            this.onGhostCreate.emit({
                owner: this,
                ghostElement: this.dragGhost
            });
        }

        if (this.pointerEventsEnabled) {
            // The dragGhost takes control for moving and dragging after it has been rendered.
            this.dragGhost.setPointerCapture(this._pointerDownId);
            this.dragGhost.addEventListener('pointermove', (args) => {
                this.onPointerMove(args);
            });
            this.dragGhost.addEventListener('pointerup', (args) => {
                this.onPointerUp(args);
            });
            this.dragGhost.addEventListener('lostpointercapture', (args) => {
                this.onPointerLost(args);
            });
        }

        if (this.animateOnRelease) {
            // Transition animation when the dragGhost is released and it returns to it's original position.
            this.dragGhost.addEventListener('transitionend', (args) => {
                this.onTransitionEnd(args);
            });
        }

        // Hide the base after the dragGhost is created, because otherwise the dragGhost will be not visible.
        if (this.hideBaseOnDrag) {
            this.visible = false;
        }

        this.cdr.detectChanges();
    }

    /**
     * @hidden
     * Dispatch custom igxDragEnter/igxDragLeave events based on current pointer position and if drop area is under.
     */
    protected dispatchDragEvents(pageX: number, pageY: number, originalEvent) {
        let topDropArea;
        const eventArgs: IgxDragCustomEventDetails = {
            startX: this._startX,
            startY: this._startY,
            pageX: pageX,
            pageY: pageY,
            owner: this,
            originalEvent: originalEvent
        };

        this.dragMove.emit({
            originalEvent: originalEvent,
            owner: this
        });

        const elementsFromPoint = this.getElementsAtPoint(pageX, pageY);
        for (let i = 0; i < elementsFromPoint.length; i++) {
            if (elementsFromPoint[i].getAttribute('droppable') === 'true' && elementsFromPoint[i] !== this.dragGhost) {
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
    protected dispatchDropEvent(pageX: number, pageY: number, originalEvent) {
        const eventArgs: IgxDragCustomEventDetails = {
            startX: this._startX,
            startY: this._startY,
            pageX: pageX,
            pageY: pageY,
            owner: this,
            originalEvent: originalEvent
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
        let newPosX, newPosY;
        if (this.renderGhost && this.dragGhost) {
            // Calculate the new dragGhost position to remain where the mouse is, so it doesn't jump
            const totalDraggedX = this.ghostLeft - this._ghostStartX;
            const totalDraggedY = this.ghostTop - this._ghostStartY;
            newPosX = this.element.nativeElement.getBoundingClientRect().left;
            newPosY = this.element.nativeElement.getBoundingClientRect().top;
            const diffStartX = this._ghostStartX - newPosX;
            const diffStartY = this._ghostStartY - newPosY;
            this.ghostTop = newPosX + totalDraggedX - diffStartX;
            this.ghostLeft = newPosY + totalDraggedY - diffStartY;
        } else if (!this.renderGhost) {
            const totalDraggedX = this.getTransformX(this.element.nativeElement);
            const totalDraggedY = this.getTransformY(this.element.nativeElement);
            newPosX = this.element.nativeElement.getBoundingClientRect().left - totalDraggedX;
            newPosY = this.element.nativeElement.getBoundingClientRect().top - totalDraggedY;
            const deltaX = this._baseOriginX - newPosX;
            const deltaY = this._baseOriginY - newPosY;
            this.setTransformXY(totalDraggedX + deltaX, totalDraggedY + deltaY);
        }
        this._baseOriginX = newPosX !== undefined ? newPosX : this._baseOriginX;
        this._baseOriginY = newPosY !== undefined ? newPosY : this._baseOriginY;
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
        this.updateDragRelativePos();
        if (this.animateOnRelease && this.dragGhost) {
            // Return the dragged element to the start. See onTransitionEnd next.
            // Take margins becuase getBoundingClientRect() doesn't include margins
            const marginTop = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-top'], 10);
            const marginLeft = parseInt(document.defaultView.getComputedStyle(this.element.nativeElement)['margin-left'], 10);
            const newPosX = this.element.nativeElement.getBoundingClientRect().left + this.getWindowScrollLeft();
            const newPosY = this.element.nativeElement.getBoundingClientRect().top + this.getWindowScrollTop();

            this.dragGhost.style.transitionDuration = this.defaultReturnDuration;
            this.ghostLeft = newPosX - marginLeft;
            this.ghostTop = newPosY - marginTop;
        }
    }

    /**
     * @hidden
     */
    public onTransitionEnd(event) {
        if (!this._dragStarted || this._clicked) {
            return ;
        }

        if (this.renderGhost) {
            const ghostDestroyArgs = {
                owner: this,
                cancel: false
            };
            this.onGhostDestroy.emit(ghostDestroyArgs);
            if (ghostDestroyArgs.cancel) {
                return;
            }

            if (this.hideBaseOnDrag) {
                this.visible = true;
            }
            this.dragGhost.parentNode.removeChild(this.dragGhost);
            this.dragGhost = null;
            this.zone.run(() => {
                this.returnMoveEnd.emit({
                    originalEvent: event,
                    owner: this
                });
            });
        }
        this._dragStarted = false;
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

    protected getTransformX(elem) {
        let posX = 0;
        if (elem.style.transform) {
            const matrix = elem.style.transform;
            const values = matrix ? matrix.match(/-?[\d\.]+/g) : undefined;
            posX = values ? Number(values[ 1 ]) : 0;
        }

        return posX;
    }

    protected getTransformY(elem) {
        let posY = 0;
        if (elem.style.transform) {
            const matrix = elem.style.transform;
            const values = matrix ? matrix.match(/-?[\d\.]+/g) : undefined;
            posY = values ? Number(values[ 2 ]) : 0;
        }

        return posY;
    }

    /** Method setting transformation to the base draggable element. */
    public setTransformXY(x: number, y: number) {
        this.element.nativeElement.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';
    }

    protected getWindowScrollTop() {
        return window.scrollY ? window.scrollY : (window.pageYOffset ? window.pageYOffset : 0);
    }

    protected getWindowScrollLeft() {
        return window.scrollX ? window.scrollX : (window.pageXOffset ? window.pageXOffset : 0);
    }

    protected getDragGhostHostOffsetLeft(dragGhostHost: any) {
        const ghostPosition = document.defaultView.getComputedStyle(dragGhostHost).getPropertyValue('position');
        if (ghostPosition === 'static' && dragGhostHost.offsetParent && dragGhostHost.offsetParent === document.body) {
            return 0;
        } else if (ghostPosition === 'static' && dragGhostHost.offsetParent) {
            return dragGhostHost.offsetParent.getBoundingClientRect().left;
        }
        return dragGhostHost.getBoundingClientRect().left;
    }

    protected getDragGhostHostOffsetTop(dragGhostHost: any) {
        const ghostPosition = document.defaultView.getComputedStyle(dragGhostHost).getPropertyValue('position');
        if (ghostPosition === 'static' && dragGhostHost.offsetParent && dragGhostHost.offsetParent === document.body) {
            return 0;
        } else if (ghostPosition === 'static' && dragGhostHost.offsetParent) {
            return dragGhostHost.offsetParent.getBoundingClientRect().top;
        }
        return dragGhostHost.getBoundingClientRect().top;
    }
}

@Directive({
    exportAs: 'drop',
    selector: '[igxDrop]'
})
export class IgxDropDirective implements OnInit, OnDestroy {

    /**
     * - Save data inside the `igxDrop` directive. This can be set when instancing `igxDrop` on an element.
     * ```html
     * <div [igxDrop]="{ source: myElement }"></div>
     * ```
     * @memberof IgxDropDirective
     */
    @Input('igxDrop')
    public data: any;

    /**
     * An @Input property that provide a way for igxDrag and igxDrop to be linked through channels.
     * It accepts single value or an array of values and evaluates then using strict equality.
     * ```html
     * <div igxDrag [dragChannel]="'odd'">
     *         <span>95</span>
     * </div>
     * <div igxDrop [dropChannel]="['odd', 'irrational']">
     *         <span>Numbers drop area!</span>
     * </div>
     * ```
     * @memberof IgxDropDirective
     */
    @Input()
    public dropChannel: number | string | number[] | string[];

    /** Event triggered when dragged element enters the area of the element.
     * ```html
     * <div class="cageArea" igxDrop (onEnter)="dragEnter()" (igxDragEnter)="onDragCageEnter()" (igxDragLeave)="onDragCageLeave()">
     * </div>
     * ```
     * ```typescript
     * public dragEnter(){
     *     alert("A draggable element has entered the chip area!");
     * }
     * ```
     * @memberof IgxDropDirective
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
     *     alert("A draggable element has left the chip area!");
     * }
     * ```
     * @memberof IgxDropDirective
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
     *     alert("A draggable element has been dropped in the chip area!");
     * }
     * ```
     * @memberof IgxDropDirective
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

    /**
     * @hidden
     */
    public ngOnInit() {
        this._zone.runOutsideAngular(() => {
            fromEvent(this.element.nativeElement, 'igxDragEnter').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onDragEnter(res as CustomEvent<IgxDragCustomEventDetails>));

            fromEvent(this.element.nativeElement, 'igxDragLeave').pipe(takeUntil(this._destroy)).subscribe((res) => this.onDragLeave(res));
            fromEvent(this.element.nativeElement, 'igxDragOver').pipe(takeUntil(this._destroy)).subscribe((res) => this.onDragOver(res));
        });
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
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
        if (!this.isDragLinked(event.detail.owner)) {
            return;
        }

        this.dragover = true;
        const elementPosX = this.element.nativeElement.getBoundingClientRect().left + this.getWindowScrollLeft();
        const elementPosY = this.element.nativeElement.getBoundingClientRect().top + this.getWindowScrollTop();
        const offsetX = event.detail.pageX - elementPosX;
        const offsetY = event.detail.pageY - elementPosY;
        const eventArgs: IgxDropEnterEventArgs = {
            originalEvent: event.detail.originalEvent,
            owner: this,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            startX: event.detail.startX,
            startY: event.detail.startY,
            pageX: event.detail.pageX,
            pageY: event.detail.pageY,
            offsetX: offsetX,
            offsetY: offsetY
        };
        this._zone.run(() => {
            this.onEnter.emit(eventArgs);
        });
    }

    /**
     * @hidden
     */
    public onDragLeave(event) {
        if (!this.isDragLinked(event.detail.owner)) {
            return;
        }

        this.dragover = false;
        const elementPosX = this.element.nativeElement.getBoundingClientRect().left + this.getWindowScrollLeft();
        const elementPosY = this.element.nativeElement.getBoundingClientRect().top + this.getWindowScrollTop();
        const offsetX = event.detail.pageX - elementPosX;
        const offsetY = event.detail.pageY - elementPosY;
        const eventArgs: IgxDropLeaveEventArgs = {
            originalEvent: event.detail.originalEvent,
            owner: this,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            startX: event.detail.startX,
            startY: event.detail.startY,
            pageX: event.detail.pageX,
            pageY: event.detail.pageY,
            offsetX: offsetX,
            offsetY: offsetY
        };
        this._zone.run(() => {
            this.onLeave.emit(eventArgs);
        });
    }

    /**
     * @hidden
     */
    @HostListener('igxDrop', ['$event'])
    public onDragDrop(event) {
        if (!this.isDragLinked(event.detail.owner)) {
            return;
        }

        const elementPosX = this.element.nativeElement.getBoundingClientRect().left + this.getWindowScrollLeft();
        const elementPosY = this.element.nativeElement.getBoundingClientRect().top + this.getWindowScrollTop();
        const offsetX = event.detail.pageX - elementPosX;
        const offsetY = event.detail.pageY - elementPosY;
        const args: IgxDropEventArgs = {
            owner: this,
            originalEvent: event.detail.originalEvent,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            offsetX: offsetX,
            offsetY: offsetY,
            cancel: false
        };
        this._zone.run(() => {
            this.onDrop.emit(args);
        });

        if (!args.cancel) {
            // To do for generic scenario
            this._renderer.removeChild(event.detail.owner.element.nativeElement.parentNode, event.detail.owner.element.nativeElement);
            this._renderer.appendChild(this.element.nativeElement, event.detail.owner.element.nativeElement);
            event.detail.owner.dropFinished();
        }
    }

    protected getWindowScrollTop() {
        return window.scrollY ? window.scrollY : (window.pageYOffset ? window.pageYOffset : 0);
    }

    protected getWindowScrollLeft() {
        return window.scrollX ? window.scrollX : (window.pageXOffset ? window.pageXOffset : 0);
    }

    protected isDragLinked(drag: IgxDragDirective): boolean {
        const dragLinkArray = drag.dragChannel instanceof Array;
        const dropLinkArray = this.dropChannel instanceof Array;

        if (!dragLinkArray && !dropLinkArray) {
            return this.dropChannel === drag.dragChannel;
        } else if (!dragLinkArray && dropLinkArray) {
            const dropLinks = <Array<any>>this.dropChannel;
            for (let i = 0; i < dropLinks.length; i ++) {
                if (dropLinks[i] === drag.dragChannel) {
                    return true;
                }
            }
        } else if (dragLinkArray && !dropLinkArray) {
            const dragLinks = <Array<any>>drag.dragChannel;
            for (let i = 0; i < dragLinks.length; i ++) {
                if (dragLinks[i] === this.dropChannel) {
                    return true;
                }
            }
        } else {
            const dragLinks = <Array<any>>drag.dragChannel;
            const dropLinks = <Array<any>>this.dropChannel;
            for (let i = 0; i < dragLinks.length; i ++) {
                for (let j = 0; j < dropLinks.length; j ++) {
                    if (dragLinks[i] === dropLinks[j]) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}


/**
 * @hidden
 */
@NgModule({
    declarations: [IgxDragDirective, IgxDropDirective, IgxDragHandleDirective],
    exports: [IgxDragDirective, IgxDropDirective, IgxDragHandleDirective]
})
export class IgxDragDropModule { }
