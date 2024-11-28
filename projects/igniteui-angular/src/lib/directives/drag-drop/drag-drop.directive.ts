import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
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
    QueryList,
    RendererStyleFlags2,
    booleanAttribute,
    EmbeddedViewRef,
    inject
} from '@angular/core';
import { animationFrameScheduler, fromEvent, interval, Subject } from 'rxjs';
import { takeUntil, throttle } from 'rxjs/operators';
import { IBaseEventArgs, PlatformUtil } from '../../core/utils';
import { IDropStrategy, IgxDefaultDropStrategy } from './drag-drop.strategy';
import { DOCUMENT } from '@angular/common';

enum DragScrollDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export enum DragDirection {
    VERTICAL,
    HORIZONTAL,
    BOTH
}

export interface IgxDragCustomEventDetails {
    startX: number;
    startY: number;
    pageX: number;
    pageY: number;
    owner: IgxDragDirective;
    originalEvent: any;
}

export interface IDropBaseEventArgs extends IBaseEventArgs {
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

export interface IDropDroppedEventArgs extends IDropBaseEventArgs {
    /** Specifies if the default drop logic related to the event should be canceled. */
    cancel: boolean;
}

export interface IDragBaseEventArgs extends IBaseEventArgs {
    /**
     * Reference to the original event that caused the interaction with the element.
     * Can be PointerEvent, TouchEvent or MouseEvent.
     */
    originalEvent: PointerEvent | MouseEvent | TouchEvent;
    /** The owner igxDrag directive that triggered this event. */
    owner: IgxDragDirective;
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
}

export interface IDragStartEventArgs extends IDragBaseEventArgs {
    /** Set if the the dragging should be canceled. */
    cancel: boolean;
}

export interface IDragMoveEventArgs extends IDragStartEventArgs {
    /** The new pageX position of the pointer that the igxDrag will use. It can be overridden to limit dragged element X movement. */
    nextPageX: number;
    /** The new pageX position of the pointer that the igxDrag will use. It can be overridden to limit dragged element Y movement. */
    nextPageY: number;
}


export interface IDragGhostBaseEventArgs extends IBaseEventArgs {
    /** The owner igxDrag directive that triggered this event. */
    owner: IgxDragDirective;
    /** Instance to the ghost element that is created when dragging starts. */
    ghostElement: any;
    /** Set if the ghost creation/destruction should be canceled. */
    cancel: boolean;
}

export interface IDragCustomTransitionArgs {
    duration?: number;
    timingFunction?: string;
    delay?: number;
}

export class IgxDragLocation {
    public pageX: number;
    public pageY: number;

    constructor(private _pageX, private _pageY) {
        this.pageX = parseFloat(_pageX);
        this.pageY = parseFloat(_pageY);
    }
}

@Directive({
    selector: '[igxDragHandle]',
    standalone: true
})
export class IgxDragHandleDirective {

    @HostBinding('class.igx-drag__handle')
    public baseClass = true;

    /**
     * @hidden
     */
    public parentDragElement: HTMLElement = null;

    constructor(public element: ElementRef<any>) { }
}

@Directive({
    selector: '[igxDragIgnore]',
    standalone: true
})
export class IgxDragIgnoreDirective {

    @HostBinding('class.igx-drag__ignore')
    public baseClass = true;

    constructor(public element: ElementRef<any>) { }
}

@Directive({
    exportAs: 'drag',
    selector: '[igxDrag]',
    standalone: true
})
export class IgxDragDirective implements AfterContentInit, OnDestroy {
    /**
     * - Save data inside the `igxDrag` directive. This can be set when instancing `igxDrag` on an element.
     * ```html
     * <div [igxDrag]="{ source: myElement }"></div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input('igxDrag')
    public set data(value: any) {
        this._data = value;
    }

    public get data(): any {
        return this._data;
    }

    /**
     * Sets the tolerance in pixels before drag starts.
     * By default the drag starts after the draggable element is moved by 5px.
     * ```html
     * <div igxDrag [dragTolerance]="100">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public dragTolerance = 5;

    /**
     * Sets the directions that the element can be dragged.
     * By default it is set to both horizontal and vertical directions.
     * ```html
     * <div igxDrag [dragDirection]="dragDir">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public dragDir = DragDirection.HORIZONTAL;
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public dragDirection = DragDirection.BOTH;

    /**
     * A property that provides a way for igxDrag and igxDrop to be linked through channels.
     * It accepts single value or an array of values and evaluates then using strict equality.
     * ```html
     * <div igxDrag [dragChannel]="'odd'">
     *         <span>95</span>
     * </div>
     * <div igxDrop [dropChannel]="['odd', 'irrational']">
     *         <span>Numbers drop area!</span>
     * </div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public dragChannel: number | string | number[] | string[];

    /**
     * Sets whether the base element should be moved, or a ghost element should be rendered that represents it instead.
     * By default it is set to `true`.
     * If it is set to `false` when dragging the base element is moved instead and no ghost elements are rendered.
     * ```html
     * <div igxDrag [ghost]="false">
     *      <span>Drag Me!</span>
     * </div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input({ transform: booleanAttribute })
    public ghost = true;

    /**
     * Sets a custom class that will be added to the `ghostElement` element.
     * ```html
     * <div igxDrag [ghostClass]="'ghostElement'">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public ghostClass = '';

    /**
     * Set styles that will be added to the `ghostElement` element.
     * ```html
     * <div igxDrag [ghostStyle]="{'--ig-size': 'var(--ig-size-small)'}">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public ghostStyle = {};

    /**
     * Specifies a template for the ghost element created when dragging starts and `ghost` is true.
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
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public ghostTemplate: TemplateRef<any>;

    /**
     * Sets the element to which the dragged element will be appended.
     * By default it's set to null and the dragged element is appended to the body.
     * ```html
     * <div #hostDiv></div>
     * <div igxDrag [ghostHost]="hostDiv">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public ghostHost;

    /**
     * Overrides the scroll container of the dragged element. By default its the window.
     */
    @Input()
    public scrollContainer: HTMLElement = null

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
     *
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
     *
     * @memberof IgxDragDirective
     */
    @Output()
    public dragMove = new EventEmitter<IDragMoveEventArgs>();

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
     *
     * @memberof IgxDragDirective
     */
    @Output()
    public dragEnd = new EventEmitter<IDragBaseEventArgs>();

    /**
     * Event triggered when the draggable element is clicked.
     * ```html
     * <div igxDrag (dragClick)="onDragClick()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public onDragClick(){
     *      alert("The element has been clicked!");
     * }
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Output()
    public dragClick = new EventEmitter<IDragBaseEventArgs>();

    /**
     * Event triggered when the drag ghost element is created.
     * ```html
     * <div igxDrag (ghostCreate)="ghostCreated()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public ghostCreated(){
     *      alert("The ghost has been created!");
     * }
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Output()
    public ghostCreate = new EventEmitter<IDragGhostBaseEventArgs>();

    /**
     * Event triggered when the drag ghost element is created.
     * ```html
     * <div igxDrag (ghostDestroy)="ghostDestroyed()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public ghostDestroyed(){
     *      alert("The ghost has been destroyed!");
     * }
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Output()
    public ghostDestroy = new EventEmitter<IDragGhostBaseEventArgs>();

    /**
     * Event triggered after the draggable element is released and after its animation has finished.
     * ```html
     * <div igxDrag (transitioned)="onMoveEnd()">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     * ```typescript
     * public onMoveEnd(){
     *      alert("The move has ended!");
     * }
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Output()
    public transitioned = new EventEmitter<IDragBaseEventArgs>();

    /**
     * @hidden
     */
    @ContentChildren(IgxDragHandleDirective, { descendants: true })
    public dragHandles: QueryList<IgxDragHandleDirective>;

    /**
     * @hidden
     */
    @ContentChildren(IgxDragIgnoreDirective, { descendants: true })
    public dragIgnoredElems: QueryList<IgxDragIgnoreDirective>;

    /**
     * @hidden
     */
    @HostBinding('class.igx-drag')
    public baseClass = true;

    /**
     * @hidden
     */
    @HostBinding('class.igx-drag--select-disabled')
    public selectDisabled = false;


    /**
     * Gets the current location of the element relative to the page.
     */
    public get location(): IgxDragLocation {
        return new IgxDragLocation(this.pageX, this.pageY);
    }

    /**
     * Gets the original location of the element before dragging started.
     */
    public get originLocation(): IgxDragLocation {
        return new IgxDragLocation(this.baseOriginLeft, this.baseOriginTop);
    }

    /**
     * @hidden
     */
    public get pointerEventsEnabled() {
        return typeof PointerEvent !== 'undefined';
    }

    /**
     * @hidden
     */
    public get touchEventsEnabled() {
        return 'ontouchstart' in window;
    }

    /**
     * @hidden
     */
    public get pageX() {
        if (this.ghost && this.ghostElement) {
            return this.ghostLeft;
        }
        return this.baseLeft + this.windowScrollLeft;
    }

    /**
     * @hidden
     */
    public get pageY() {
        if (this.ghost && this.ghostElement) {
            return this.ghostTop;
        }
        return this.baseTop + this.windowScrollTop;
    }

    protected get baseLeft(): number {
        return this.element.nativeElement.getBoundingClientRect().left;
    }

    protected get baseTop(): number {
        return this.element.nativeElement.getBoundingClientRect().top;
    }

    protected get baseOriginLeft(): number {
        return this.baseLeft - this.getTransformX(this.element.nativeElement);
    }

    protected get baseOriginTop(): number {
        return this.baseTop - this.getTransformY(this.element.nativeElement);
    }

    protected set ghostLeft(pageX: number) {
        if (this.ghostElement) {
            // We need to take into account marginLeft, since top style does not include margin, but pageX includes the margin.
            const ghostMarginLeft = parseInt(this.document.defaultView.getComputedStyle(this.ghostElement)['margin-left'], 10);
            // If ghost host is defined it needs to be taken into account.
            this.ghostElement.style.left = (pageX - ghostMarginLeft - this._ghostHostX) + 'px';
        }
    }

    protected get ghostLeft() {
        if (this.ghostElement) {
            return parseInt(this.ghostElement.style.left, 10) + this._ghostHostX;
        }
    }

    protected set ghostTop(pageY: number) {
        if (this.ghostElement) {
            // We need to take into account marginTop, since top style does not include margin, but pageY includes the margin.
            const ghostMarginTop = parseInt(this.document.defaultView.getComputedStyle(this.ghostElement)['margin-top'], 10);
            // If ghost host is defined it needs to be taken into account.
            this.ghostElement.style.top = (pageY - ghostMarginTop - this._ghostHostY) + 'px';
        }
    }

    protected get ghostTop() {
        if (this.ghostElement) {
            return parseInt(this.ghostElement.style.top, 10) + this._ghostHostY;
        }
    }

    protected get windowScrollTop() {
        return this.document.documentElement.scrollTop || window.scrollY;
    }

    protected get windowScrollLeft() {
        return this.document.documentElement.scrollLeft || window.scrollX;
    }

    protected get windowScrollHeight() {
        return this.document.documentElement.scrollHeight;
    }

    protected get windowScrollWidth() {
        return this.document.documentElement.scrollWidth;
    }

    /**
     * @hidden
     */
    public defaultReturnDuration = '0.5s';

    /**
     * @hidden
     */
    public ghostElement;

    /**
     * @hidden
     */
    public animInProgress = false;

    protected ghostContext: any = null;
    protected _startX = 0;
    protected _startY = 0;
    protected _lastX = 0;
    protected _lastY = 0;
    protected _dragStarted = false;

    /** Drag ghost related properties */
    protected _defaultOffsetX;
    protected _defaultOffsetY;
    protected _offsetX;
    protected _offsetY;
    protected _ghostStartX;
    protected _ghostStartY;
    protected _ghostHostX = 0;
    protected _ghostHostY = 0;
    protected _dynamicGhostRef: EmbeddedViewRef<any>;

    protected _pointerDownId = null;
    protected _clicked = false;
    protected _lastDropArea = null;

    protected _destroy = new Subject<boolean>();
    protected _removeOnDestroy = true;
    protected _data: any;
    protected _scrollContainer = null;
    protected _originalScrollContainerWidth = 0;
    protected _originalScrollContainerHeight = 0;
    protected _scrollContainerStep = 5;
    protected _scrollContainerStepMs = 10;
    protected _scrollContainerThreshold = 25;
    protected _containerScrollIntervalId = null;
    private document = inject(DOCUMENT);

    /**
     * Sets the offset of the dragged element relative to the mouse in pixels.
     * By default it's taking the relative position to the mouse when the drag started and keeps it the same.
     * ```html
     * <div #hostDiv></div>
     * <div igxDrag [ghostOffsetX]="0">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public set ghostOffsetX(value) {
        this._offsetX = parseInt(value, 10);
    }

    public get ghostOffsetX() {
        return this._offsetX !== undefined ? this._offsetX : this._defaultOffsetX;
    }

    /**
     * Sets the offset of the dragged element relative to the mouse in pixels.
     * By default it's taking the relative position to the mouse when the drag started and keeps it the same.
     * ```html
     * <div #hostDiv></div>
     * <div igxDrag [ghostOffsetY]="0">
     *         <span>Drag Me!</span>
     * </div>
     * ```
     *
     * @memberof IgxDragDirective
     */
    @Input()
    public set ghostOffsetY(value) {
        this._offsetY = parseInt(value, 10);
    }

    public get ghostOffsetY() {
        return this._offsetY !== undefined ? this._offsetY : this._defaultOffsetY;
    }

    constructor(
        public cdr: ChangeDetectorRef,
        public element: ElementRef,
        public viewContainer: ViewContainerRef,
        public zone: NgZone,
        public renderer: Renderer2,
        protected platformUtil: PlatformUtil
    ) {
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        if (!this.dragHandles || !this.dragHandles.length) {
            // Set user select none to the whole draggable element if no drag handles are defined.
            this.selectDisabled = true;
        }

        // Bind events
        this.zone.runOutsideAngular(() => {
            if (!this.platformUtil.isBrowser) {
                return;
            }
            const targetElements = this.dragHandles && this.dragHandles.length
                ? this.dragHandles
                    .filter(item => item.parentDragElement === null)
                    .map(item => {
                        item.parentDragElement = this.element.nativeElement;
                        return item.element.nativeElement;
                    })
                : [this.element.nativeElement];
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

                    if (!this.ghost) {
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
                fromEvent(this.document.defaultView, 'touchmove').pipe(
                    throttle(() => interval(0, animationFrameScheduler)),
                    takeUntil(this._destroy)
                ).subscribe((res) => this.onPointerMove(res));

                fromEvent(this.document.defaultView, 'touchend').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerUp(res));
            } else if (!this.pointerEventsEnabled) {
                fromEvent(this.document.defaultView, 'mousemove').pipe(
                    throttle(() => interval(0, animationFrameScheduler)),
                    takeUntil(this._destroy)
                ).subscribe((res) => this.onPointerMove(res));

                fromEvent(this.document.defaultView, 'mouseup').pipe(takeUntil(this._destroy))
                    .subscribe((res) => this.onPointerUp(res));
            }
            this.element.nativeElement.addEventListener('transitionend', this.onTransitionEnd.bind(this));
        });

        // Set transition duration to 0s. This also helps with setting `visibility: hidden` to the base to not lag.
        this.element.nativeElement.style.transitionDuration = '0.0s';
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.complete();

        if (this.ghost && this.ghostElement && this._removeOnDestroy) {
            this.ghostElement.parentNode.removeChild(this.ghostElement);
            this.ghostElement = null;

            if (this._dynamicGhostRef) {
                this._dynamicGhostRef.destroy();
                this._dynamicGhostRef = null;
            }
        }

        this.element.nativeElement.removeEventListener('transitionend', this.onTransitionEnd);

        if (this._containerScrollIntervalId) {
            clearInterval(this._containerScrollIntervalId);
            this._containerScrollIntervalId = null;
        }
    }

    /**
     * Sets desired location of the base element or ghost element if rended relative to the document.
     *
     * @param newLocation New location that should be applied. It is advised to get new location using getBoundingClientRects() + scroll.
     */
    public setLocation(newLocation: IgxDragLocation) {
        // We do not subtract marginLeft and marginTop here because here we calculate deltas.
        if (this.ghost && this.ghostElement) {
            this.ghostLeft = newLocation.pageX + this.windowScrollLeft;
            this.ghostTop = newLocation.pageY + this.windowScrollTop;
        } else if (!this.ghost) {
            const deltaX = newLocation.pageX - this.pageX;
            const deltaY = newLocation.pageY - this.pageY;
            const transformX = this.getTransformX(this.element.nativeElement);
            const transformY = this.getTransformY(this.element.nativeElement);
            this.setTransformXY(transformX + deltaX, transformY + deltaY);
        }

        this._startX = this.baseLeft;
        this._startY = this.baseTop;
    }

    /**
     * Animates the base or ghost element depending on the `ghost` input to its initial location.
     * If `ghost` is true but there is not ghost rendered, it will be created and animated.
     * If the base element has changed its DOM position its initial location will be changed accordingly.
     *
     * @param customAnimArgs Custom transition properties that will be applied when performing the transition.
     * @param startLocation Start location from where the transition should start.
     */
    public transitionToOrigin(customAnimArgs?: IDragCustomTransitionArgs, startLocation?: IgxDragLocation) {
        if ((!!startLocation && startLocation.pageX === this.baseOriginLeft && startLocation.pageY === this.baseOriginLeft) ||
            (!startLocation && this.ghost && !this.ghostElement)) {
            return;
        }

        if (!!startLocation && startLocation.pageX !== this.pageX && startLocation.pageY !== this.pageY) {
            if (this.ghost && !this.ghostElement) {
                this._startX = startLocation.pageX;
                this._startY = startLocation.pageY;
                this._ghostStartX = this._startX;
                this._ghostStartY = this._startY;
                this.createGhost(this._startX, this._startY);
            }

            this.setLocation(startLocation);
        }

        this.animInProgress = true;
        // Use setTimeout because we need to be sure that the element is positioned first correctly if there is start location.
        setTimeout(() => {
            if (this.ghost) {
                this.ghostElement.style.transitionProperty = 'top, left';
                this.ghostElement.style.transitionDuration =
                    customAnimArgs && customAnimArgs.duration ? customAnimArgs.duration + 's' : this.defaultReturnDuration;
                this.ghostElement.style.transitionTimingFunction =
                    customAnimArgs && customAnimArgs.timingFunction ? customAnimArgs.timingFunction : '';
                this.ghostElement.style.transitionDelay = customAnimArgs && customAnimArgs.delay ? customAnimArgs.delay + 's' : '';
                this.setLocation(new IgxDragLocation(this.baseLeft, this.baseTop));
            } else if (!this.ghost) {
                this.element.nativeElement.style.transitionProperty = 'transform';
                this.element.nativeElement.style.transitionDuration =
                    customAnimArgs && customAnimArgs.duration ? customAnimArgs.duration + 's' : this.defaultReturnDuration;
                this.element.nativeElement.style.transitionTimingFunction =
                    customAnimArgs && customAnimArgs.timingFunction ? customAnimArgs.timingFunction : '';
                this.element.nativeElement.style.transitionDelay = customAnimArgs && customAnimArgs.delay ? customAnimArgs.delay + 's' : '';
                this._startX = this.baseLeft;
                this._startY = this.baseTop;
                this.setTransformXY(0, 0);
            }
        }, 0);
    }

    /**
     * Animates the base or ghost element to a specific target location or other element using transition.
     * If `ghost` is true but there is not ghost rendered, it will be created and animated.
     * It is recommended to use 'getBoundingClientRects() + pageScroll' when determining desired location.
     *
     * @param target Target that the base or ghost will transition to. It can be either location in the page or another HTML element.
     * @param customAnimArgs Custom transition properties that will be applied when performing the transition.
     * @param startLocation Start location from where the transition should start.
     */
    public transitionTo(target: IgxDragLocation | ElementRef, customAnimArgs?: IDragCustomTransitionArgs, startLocation?: IgxDragLocation) {
        if (!!startLocation && this.ghost && !this.ghostElement) {
            this._startX = startLocation.pageX;
            this._startY = startLocation.pageY;
            this._ghostStartX = this._startX;
            this._ghostStartY = this._startY;
        } else if (!!startLocation && (!this.ghost || this.ghostElement)) {
            this.setLocation(startLocation);
        } else if (this.ghost && !this.ghostElement) {
            this._startX = this.baseLeft;
            this._startY = this.baseTop;
            this._ghostStartX = this._startX + this.windowScrollLeft;
            this._ghostStartY = this._startY + this.windowScrollTop;
        }

        if (this.ghost && !this.ghostElement) {
            this.createGhost(this._startX, this._startY);
        }

        this.animInProgress = true;
        // Use setTimeout because we need to be sure that the element is positioned first correctly if there is start location.
        setTimeout(() => {
            const movedElem = this.ghost ? this.ghostElement : this.element.nativeElement;
            movedElem.style.transitionProperty = this.ghost && this.ghostElement ? 'left, top' : 'transform';
            movedElem.style.transitionDuration =
                customAnimArgs && customAnimArgs.duration ? customAnimArgs.duration + 's' : this.defaultReturnDuration;
            movedElem.style.transitionTimingFunction =
                customAnimArgs && customAnimArgs.timingFunction ? customAnimArgs.timingFunction : '';
            movedElem.style.transitionDelay = customAnimArgs && customAnimArgs.delay ? customAnimArgs.delay + 's' : '';

            if (target instanceof IgxDragLocation) {
                this.setLocation(new IgxDragLocation(target.pageX, target.pageY));
            } else {
                const targetRects = target.nativeElement.getBoundingClientRect();
                this.setLocation(new IgxDragLocation(
                    targetRects.left - this.windowScrollLeft,
                    targetRects.top - this.windowScrollTop
                ));
            }
        }, 0);
    }

    /**
     * @hidden
     * Method bound to the PointerDown event of the base element igxDrag is initialized.
     * @param event PointerDown event captured
     */
    public onPointerDown(event) {
        const ignoredElement = this.dragIgnoredElems.find(elem => elem.element.nativeElement === event.target);
        if (ignoredElement) {
            return;
        }

        // Set pointer capture so we detect pointermove even if mouse is out of bounds until ghostElement is created.
        const handleFound = this.dragHandles.find(handle => handle.element.nativeElement === event.target);
        const targetElement = handleFound ? handleFound.element.nativeElement : event.target || this.element.nativeElement;
        if (this.pointerEventsEnabled && targetElement.isConnected) {
            this._pointerDownId = event.pointerId;
            targetElement.setPointerCapture(this._pointerDownId);
        } else if (targetElement.isConnected) {
            targetElement.focus();
            event.preventDefault();
        } else {
            return;
        }

        this._clicked = true;
        if (this.pointerEventsEnabled || !this.touchEventsEnabled) {
            // Check first for pointer events or non touch, because we can have pointer events and touch events at once.
            this._startX = event.pageX;
            this._startY = event.pageY;
        } else if (this.touchEventsEnabled) {
            this._startX = event.touches[0].pageX;
            this._startY = event.touches[0].pageY;
        }

        this._defaultOffsetX = this.baseLeft - this._startX + this.windowScrollLeft;
        this._defaultOffsetY = this.baseTop - this._startY + this.windowScrollTop;
        this._ghostStartX = this._startX + this.ghostOffsetX;
        this._ghostStartY = this._startY + this.ghostOffsetY;
        this._lastX = this._startX;
        this._lastY = this._startY;
    }

    /**
     * @hidden
     * Perform drag move logic when dragging and dispatching events if there is igxDrop under the pointer.
     * This method is bound at first at the base element.
     * If dragging starts and after the ghostElement is rendered the pointerId is reassigned it. Then this method is bound to it.
     * @param event PointerMove event captured
     */
    public onPointerMove(event) {
        if (this._clicked) {
            let pageX; let pageY;
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
                const dragStartArgs: IDragStartEventArgs = {
                    originalEvent: event,
                    owner: this,
                    startX: pageX - totalMovedX,
                    startY: pageY - totalMovedY,
                    pageX,
                    pageY,
                    cancel: false
                };
                this.zone.run(() => {
                    this.dragStart.emit(dragStartArgs);
                });

                if (!dragStartArgs.cancel) {
                    this._dragStarted = true;
                    if (this.ghost) {
                        // We moved enough so ghostElement can be rendered and actual dragging to start.
                        // When creating it will take into account any offset set by the user by default.
                        this.createGhost(pageX, pageY);
                    } else if (this._offsetX !== undefined || this._offsetY !== undefined) {
                        // There is no need for ghost, but we will need to position initially the base element to reflect any offset.
                        const transformX = (this._offsetX !== undefined ? this._offsetX - this._defaultOffsetX : 0) +
                            this.getTransformX(this.element.nativeElement);
                        const transformY = (this._offsetY !== undefined ? this._offsetY - this._defaultOffsetY : 0) +
                            this.getTransformY(this.element.nativeElement);
                        this.setTransformXY(transformX, transformY);
                    }
                } else {
                    return;
                }
            } else if (!this._dragStarted) {
                return;
            }

            const moveArgs: IDragMoveEventArgs = {
                originalEvent: event,
                owner: this,
                startX: this._startX,
                startY: this._startY,
                pageX: this._lastX,
                pageY: this._lastY,
                nextPageX: pageX,
                nextPageY: pageY,
                cancel: false
            };
            this.dragMove.emit(moveArgs);

            const setPageX = moveArgs.nextPageX;
            const setPageY = moveArgs.nextPageY;
            if (!moveArgs.cancel) {
                // Scroll root container if the user reaches its boundaries.
                this.onScrollContainer();

                // Move the actual element around
                if (this.ghost) {
                    const updatedTotalMovedX = this.dragDirection === DragDirection.VERTICAL ? 0 : setPageX - this._startX;
                    const updatedTotalMovedY = this.dragDirection === DragDirection.HORIZONTAL ? 0 : setPageY - this._startY;
                    this.ghostLeft = this._ghostStartX + updatedTotalMovedX;
                    this.ghostTop = this._ghostStartY + updatedTotalMovedY;
                } else {
                    const lastMovedX = this.dragDirection === DragDirection.VERTICAL ? 0 : setPageX - this._lastX;
                    const lastMovedY = this.dragDirection === DragDirection.HORIZONTAL ? 0 : setPageY - this._lastY;
                    const translateX = this.getTransformX(this.element.nativeElement) + lastMovedX;
                    const translateY = this.getTransformY(this.element.nativeElement) + lastMovedY;
                    this.setTransformXY(translateX, translateY);
                }
                this.dispatchDragEvents(pageX, pageY, event);
            }

            this._lastX = setPageX;
            this._lastY = setPageY;
        }
    }

    /**
     * @hidden
     * Perform drag end logic when releasing the ghostElement and dispatching drop event if igxDrop is under the pointer.
     * This method is bound at first at the base element.
     * If dragging starts and after the ghostElement is rendered the pointerId is reassigned to it. Then this method is bound to it.
     * @param event PointerUp event captured
     */
    public onPointerUp(event) {
        if (!this._clicked) {
            return;
        }

        let pageX; let pageY;
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

        const eventArgs: IDragBaseEventArgs = {
            originalEvent: event,
            owner: this,
            startX: this._startX,
            startY: this._startY,
            pageX,
            pageY
        };
        this._pointerDownId = null;
        this._clicked = false;
        if (this._dragStarted) {
            if (this._lastDropArea && this._lastDropArea !== this.element.nativeElement) {
                this.dispatchDropEvent(event.pageX, event.pageY, event);
            }

            this.zone.run(() => {
                this.dragEnd.emit(eventArgs);
            });

            if (!this.animInProgress) {
                this.onTransitionEnd(null);
            }
        } else {
            // Trigger our own click event because when there is no ghost, native click cannot be prevented when dragging.
            this.zone.run(() => {
                this.dragClick.emit(eventArgs);
            });
        }

        if (this._containerScrollIntervalId) {
            clearInterval(this._containerScrollIntervalId);
            this._containerScrollIntervalId = null;
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

        // When the base element is moved to previous index, angular reattaches the ghost template as a sibling by default.
        // This is the defaut place for the EmbededViewRef when recreated.
        // That's why we need to move it to the proper place and set pointer capture again.
        if (this._pointerDownId && this.ghostElement && this._dynamicGhostRef && !this._dynamicGhostRef.destroyed) {
            let ghostReattached = false;
            if (this.ghostHost && !Array.from(this.ghostHost.children).includes(this.ghostElement)) {
                ghostReattached = true;
                this.ghostHost.appendChild(this.ghostElement);
            } else if (!this.ghostHost && !Array.from(this.document.body.children).includes(this.ghostElement)) {
                ghostReattached = true;
                this.document.body.appendChild(this.ghostElement);
            }

            if (ghostReattached) {
                this.ghostElement.setPointerCapture(this._pointerDownId);
                return;
            }
        }

        const eventArgs = {
            originalEvent: event,
            owner: this,
            startX: this._startX,
            startY: this._startY,
            pageX: event.pageX,
            pageY: event.pageY
        };
        this._pointerDownId = null;
        this._clicked = false;
        if (this._dragStarted) {
            this.zone.run(() => {
                this.dragEnd.emit(eventArgs);
            });
            if (!this.animInProgress) {
                this.onTransitionEnd(null);
            }
        }
    }

    /**
     * @hidden
     */
    public onTransitionEnd(event) {
        if ((!this._dragStarted && !this.animInProgress) || this._clicked) {
            // Return if no dragging started and there is no animation in progress.
            return;
        }

        if (this.ghost && this.ghostElement) {
            this._ghostStartX = this.baseLeft + this.windowScrollLeft;
            this._ghostStartY = this.baseTop + this.windowScrollTop;

            const ghostDestroyArgs: IDragGhostBaseEventArgs = {
                owner: this,
                ghostElement: this.ghostElement,
                cancel: false
            };
            this.ghostDestroy.emit(ghostDestroyArgs);
            if (ghostDestroyArgs.cancel) {
                return;
            }
            this.clearGhost();
        } else if (!this.ghost) {
            this.element.nativeElement.style.transitionProperty = '';
            this.element.nativeElement.style.transitionDuration = '0.0s';
            this.element.nativeElement.style.transitionTimingFunction = '';
            this.element.nativeElement.style.transitionDelay = '';
        }
        this.animInProgress = false;
        this._dragStarted = false;

        // Execute transitioned after everything is reset so if the user sets new location on the base now it would work as expected.
        this.zone.run(() => {
            this.transitioned.emit({
                originalEvent: event,
                owner: this,
                startX: this._startX,
                startY: this._startY,
                pageX: this._startX,
                pageY: this._startY
            });
        });
    }

    protected clearGhost() {
        this.ghostElement.removeEventListener('pointermove', this.onPointerMove);
        this.ghostElement.removeEventListener('pointerup', this.onPointerUp);
        this.ghostElement.removeEventListener('lostpointercapture', this.onPointerLost);
        this.ghostElement.removeEventListener('transitionend', this.onTransitionEnd);
        this.ghostElement.remove();
        this.ghostElement = null;

        if (this._dynamicGhostRef) {
            this._dynamicGhostRef.destroy();
            this._dynamicGhostRef = null;
        }
    }

    /**
     * @hidden
     * Create ghost element - if a Node object is provided it creates a clone of that node,
     * otherwise it clones the host element.
     * Bind all needed events.
     * @param pageX Latest pointer position on the X axis relative to the page.
     * @param pageY Latest pointer position on the Y axis relative to the page.
     * @param node The Node object to be cloned.
     */
    protected createGhost(pageX, pageY, node: any = null) {
        if (!this.ghost) {
            return;
        }

        if (this.ghostTemplate) {
            this.zone.run(() => {
                // Create template in zone, so it gets updated by it automatically.
                this._dynamicGhostRef = this.viewContainer.createEmbeddedView(this.ghostTemplate, this.ghostContext);
            });
            if (this._dynamicGhostRef.rootNodes[0].style.display === 'contents') {
                // Change the display to default since display contents does not position the element absolutely.
                this._dynamicGhostRef.rootNodes[0].style.display = 'block';
            }
            this.ghostElement = this._dynamicGhostRef.rootNodes[0];
        } else {
            this.ghostElement = node ? node.cloneNode(true) : this.element.nativeElement.cloneNode(true);
        }

        const totalMovedX = pageX - this._startX;
        const totalMovedY = pageY - this._startY;
        this._ghostHostX = this.getGhostHostBaseOffsetX();
        this._ghostHostY = this.getGhostHostBaseOffsetY();

        this.ghostElement.style.transitionDuration = '0.0s';
        this.ghostElement.style.position = 'absolute';

        if (this.ghostClass) {
            this.ghostElement.classList.add(this.ghostClass);
        }

        if (this.ghostStyle) {
            Object.entries(this.ghostStyle).map(([name, value]) => {
                this.renderer.setStyle(this.ghostElement, name, value, RendererStyleFlags2.DashCase);
            });
        }

        const createEventArgs = {
            owner: this,
            ghostElement: this.ghostElement,
            cancel: false
        };
        this.ghostCreate.emit(createEventArgs);
        if (createEventArgs.cancel) {
            this.ghostElement = null;
            if (this.ghostTemplate && this._dynamicGhostRef) {
                this._dynamicGhostRef.destroy();
            }
            return;
        }

        if (this.ghostHost) {
            this.ghostHost.appendChild(this.ghostElement);
        } else {
            this.document.body.appendChild(this.ghostElement);
        }

        const ghostMarginLeft = parseInt(this.document.defaultView.getComputedStyle(this.ghostElement)['margin-left'], 10);
        const ghostMarginTop = parseInt(this.document.defaultView.getComputedStyle(this.ghostElement)['margin-top'], 10);
        this.ghostElement.style.left = (this._ghostStartX - ghostMarginLeft + totalMovedX - this._ghostHostX) + 'px';
        this.ghostElement.style.top = (this._ghostStartY - ghostMarginTop + totalMovedY - this._ghostHostY) + 'px';

        if (this.pointerEventsEnabled) {
            // The ghostElement takes control for moving and dragging after it has been rendered.
            if (this._pointerDownId !== null) {
                this.ghostElement.setPointerCapture(this._pointerDownId);
            }
            this.ghostElement.addEventListener('pointermove', this.onPointerMove.bind(this));
            this.ghostElement.addEventListener('pointerup', this.onPointerUp.bind(this));
            this.ghostElement.addEventListener('lostpointercapture', this.onPointerLost.bind(this));
        }

        // Transition animation when the ghostElement is released and it returns to it's original position.
        this.ghostElement.addEventListener('transitionend', this.onTransitionEnd.bind(this));

        this.cdr.detectChanges();
    }

    /**
     * @hidden
     * Dispatch custom igxDragEnter/igxDragLeave events based on current pointer position and if drop area is under.
     */
    protected dispatchDragEvents(pageX: number, pageY: number, originalEvent) {
        let topDropArea;
        const customEventArgs: IgxDragCustomEventDetails = {
            startX: this._startX,
            startY: this._startY,
            pageX,
            pageY,
            owner: this,
            originalEvent
        };

        const elementsFromPoint = this.getElementsAtPoint(pageX, pageY);
        let targetElements = [];
        // Check for shadowRoot instance and use it if present
        for (const elFromPoint of elementsFromPoint) {
            if (elFromPoint?.shadowRoot) {
                targetElements = targetElements.concat(this.getFromShadowRoot(elFromPoint, pageX, pageY, elementsFromPoint));
            } else if (targetElements.indexOf(elFromPoint) === -1) {
                targetElements.push(elFromPoint);
            }
        }

        for (const element of targetElements) {
            if (element.getAttribute('droppable') === 'true' &&
                element !== this.ghostElement && element !== this.element.nativeElement) {
                topDropArea = element;
                break;
            }
        }

        if (topDropArea &&
            (!this._lastDropArea || (this._lastDropArea && this._lastDropArea !== topDropArea))) {
            if (this._lastDropArea) {
                this.dispatchEvent(this._lastDropArea, 'igxDragLeave', customEventArgs);
            }

            this._lastDropArea = topDropArea;
            this.dispatchEvent(this._lastDropArea, 'igxDragEnter', customEventArgs);
        } else if (!topDropArea && this._lastDropArea) {
            this.dispatchEvent(this._lastDropArea, 'igxDragLeave', customEventArgs);
            this._lastDropArea = null;
            return;
        }

        if (topDropArea) {
            this.dispatchEvent(topDropArea, 'igxDragOver', customEventArgs);
        }
    }

    /**
     * @hidden
     * Traverse shadow dom in depth.
     */
    protected getFromShadowRoot(elem, pageX, pageY, parentDomElems) {
        const elementsFromPoint = elem.shadowRoot.elementsFromPoint(pageX, pageY);
        const shadowElements = elementsFromPoint.filter(cur => parentDomElems.indexOf(cur) === -1);
        let res = [];
        for (const elFromPoint of shadowElements) {
            if (!!elFromPoint?.shadowRoot && elFromPoint.shadowRoot !== elem.shadowRoot) {
                res = res.concat(this.getFromShadowRoot(elFromPoint, pageX, pageY, elementsFromPoint));
            }
            res.push(elFromPoint);
        }
        return res;
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
            pageX,
            pageY,
            owner: this,
            originalEvent
        };

        this.dispatchEvent(this._lastDropArea, 'igxDrop', eventArgs);
        this.dispatchEvent(this._lastDropArea, 'igxDragLeave', eventArgs);
        this._lastDropArea = null;
    }

    /**
     * @hidden
     */
    protected getElementsAtPoint(pageX: number, pageY: number) {
        // correct the coordinates with the current scroll position, because
        // document.elementsFromPoint consider position within the current viewport
        // window.pageXOffset == window.scrollX; // always true
        // using window.pageXOffset for IE9 compatibility
        const viewPortX = pageX - window.pageXOffset;
        const viewPortY = pageY - window.pageYOffset;
        if (this.document['msElementsFromPoint']) {
            // Edge and IE special snowflakes
            const elements = this.document['msElementsFromPoint'](viewPortX, viewPortY);
            return elements === null ? [] : elements;
        } else {
            // Other browsers like Chrome, Firefox, Opera
            return this.document.elementsFromPoint(viewPortX, viewPortY);
        }
    }

    /**
     * @hidden
     */
    protected dispatchEvent(target, eventName: string, eventArgs: IgxDragCustomEventDetails) {
        // This way is IE11 compatible.
        // const dragLeaveEvent = document.createEvent('CustomEvent');
        // dragLeaveEvent.initCustomEvent(eventName, false, false, eventArgs);
        // target.dispatchEvent(dragLeaveEvent);
        // Otherwise can be used `target.dispatchEvent(new CustomEvent(eventName, eventArgs));`
        target.dispatchEvent(new CustomEvent(eventName, { detail: eventArgs }));
    }

    protected getTransformX(elem) {
        let posX = 0;
        if (elem.style.transform) {
            const matrix = elem.style.transform;
            const values = matrix ? matrix.match(/-?[\d\.]+/g) : undefined;
            posX = values ? Number(values[1]) : 0;
        }

        return posX;
    }

    protected getTransformY(elem) {
        let posY = 0;
        if (elem.style.transform) {
            const matrix = elem.style.transform;
            const values = matrix ? matrix.match(/-?[\d\.]+/g) : undefined;
            posY = values ? Number(values[2]) : 0;
        }

        return posY;
    }

    /** Method setting transformation to the base draggable element. */
    protected setTransformXY(x: number, y: number) {
        if(x === 0 && y === 0) {
            this.element.nativeElement.style.transform = '';
            return;
        }
        this.element.nativeElement.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';
    }

    /**
     * Since we are using absolute position to move the ghost, the ghost host might not have position: relative.
     * Combined with position static, this means that the absolute position in the browser is relative to the offsetParent.
     * The offsetParent is pretty much the closes parent that has position: relative, or if no such until it reaches the body.
     * That's why if this is the case, we need to know how much we should compensate for the ghostHost being offset from
     * its offsetParent.
     *
     * OffsetParent can be null in the case of position: fixed applied to the ghost host or display: none. In that case
     * just get the clientRects of the ghost host.
     */
    protected getGhostHostBaseOffsetX() {
        if (!this.ghostHost) return 0;

        const ghostPosition = this.document.defaultView.getComputedStyle(this.ghostHost).getPropertyValue('position');
        if (ghostPosition === 'static' && this.ghostHost.offsetParent && this.ghostHost.offsetParent === this.document.body) {
            return 0;
        } else if (ghostPosition === 'static' && this.ghostHost.offsetParent) {
            return this.ghostHost.offsetParent.getBoundingClientRect().left + this.windowScrollLeft;
        }
        return this.ghostHost.getBoundingClientRect().left + this.windowScrollLeft;
    }

    protected getGhostHostBaseOffsetY() {
        if (!this.ghostHost) return 0;

        const ghostPosition = this.document.defaultView.getComputedStyle(this.ghostHost).getPropertyValue('position');
        if (ghostPosition === 'static' && this.ghostHost.offsetParent && this.ghostHost.offsetParent === this.document.body) {
            return 0;
        } else if (ghostPosition === 'static' && this.ghostHost.offsetParent) {
            return this.ghostHost.offsetParent.getBoundingClientRect().top + this.windowScrollTop;
        }
        return this.ghostHost.getBoundingClientRect().top + this.windowScrollTop;
    }

    protected getContainerScrollDirection() {
        const containerBounds = this.scrollContainer ? this.scrollContainer.getBoundingClientRect() : null;
        const scrolledX = !this.scrollContainer ? this.windowScrollLeft > 0 : this.scrollContainer.scrollLeft > 0;
        const scrolledY = !this.scrollContainer ? this.windowScrollTop > 0 : this.scrollContainer.scrollTop > 0;
        // Take into account window scroll top because we do not use fixed positioning to the window.
        const topBorder = (!this.scrollContainer ? 0 : containerBounds.top) + this.windowScrollTop + this._scrollContainerThreshold;
        // Subtract the element height because we position it from top left corner.
        const elementHeight = this.ghost && this.ghostElement ? this.ghostElement.offsetHeight : this.element.nativeElement.offsetHeight;
        const bottomBorder = (!this.scrollContainer ? window.innerHeight : containerBounds.bottom) +
            this.windowScrollTop - this._scrollContainerThreshold - elementHeight;
        // Same for window scroll left
        const leftBorder = (!this.scrollContainer ? 0 : containerBounds.left) + this.windowScrollLeft + this._scrollContainerThreshold;
        // Subtract the element width again because we position it from top left corner.
        const elementWidth = this.ghost && this.ghostElement ? this.ghostElement.offsetWidth : this.element.nativeElement.offsetWidth;
        const rightBorder = (!this.scrollContainer ? window.innerWidth : containerBounds.right) +
            this.windowScrollLeft - this._scrollContainerThreshold - elementWidth

        if (this.pageY <= topBorder && scrolledY) {
            return DragScrollDirection.UP;
        } else if (this.pageY > bottomBorder) {
            return DragScrollDirection.DOWN;
        } else if (this.pageX < leftBorder && scrolledX) {
            return DragScrollDirection.LEFT;
        } else if (this.pageX > rightBorder) {
            return DragScrollDirection.RIGHT;
        }
        return null;
    }

    protected onScrollContainerStep(scrollDir: DragScrollDirection) {
        animationFrameScheduler.schedule(() => {

            let xDir = scrollDir == DragScrollDirection.LEFT ? -1 : (scrollDir == DragScrollDirection.RIGHT ? 1 : 0);
            let yDir = scrollDir == DragScrollDirection.UP ? -1 : (scrollDir == DragScrollDirection.DOWN ? 1 : 0);
            if (!this.scrollContainer) {
                // Cap scrolling so we don't scroll past the window max scroll position.
                const maxScrollX = this._originalScrollContainerWidth - this.document.documentElement.clientWidth;
                const maxScrollY = this._originalScrollContainerHeight - this.document.documentElement.clientHeight;
                xDir = (this.windowScrollLeft <= 0 && xDir < 0) || (this.windowScrollLeft >= maxScrollX && xDir > 0) ? 0 : xDir;
                yDir = (this.windowScrollTop <= 0 && yDir < 0) || (this.windowScrollTop >= maxScrollY && yDir > 0) ? 0 : yDir;
            } else {
                // Cap scrolling so we don't scroll past the container max scroll position.
                const maxScrollX = this._originalScrollContainerWidth - this.scrollContainer.clientWidth;
                const maxScrollY = this._originalScrollContainerHeight - this.scrollContainer.clientHeight;
                xDir = (this.scrollContainer.scrollLeft <= 0 && xDir < 0) || (this.scrollContainer.scrollLeft >= maxScrollX && xDir > 0) ? 0 : xDir;
                yDir = (this.scrollContainer.scrollTop <= 0 && yDir < 0) || (this.scrollContainer.scrollTop >= maxScrollY && yDir > 0) ? 0 : yDir;
            }

            const scrollByX = xDir * this._scrollContainerStep;
            const scrollByY = yDir * this._scrollContainerStep;

            // Scroll the corresponding window or container.
            if (!this.scrollContainer) {
                window.scrollBy(scrollByX, scrollByY);
            } else {
                this.scrollContainer.scrollLeft += scrollByX;
                this.scrollContainer.scrollTop += scrollByY;
            }

            if (this.ghost && !this.scrollContainer) {
                // Scroll the ghost only when there is no container specifies.
                // If it has container the ghost pretty much stays in the same position while the container is scrolled since e use top/left position.
                // Otherwise increase the position the same amount we have scrolled the window
                this.ghostLeft += scrollByX;
                this.ghostTop += scrollByY;
            } else if (!this.ghost) {
                // Move the base element the same amount we moved the window/container because we use transformations.
                const translateX = this.getTransformX(this.element.nativeElement) + scrollByX;
                const translateY = this.getTransformY(this.element.nativeElement) + scrollByY;
                this.setTransformXY(translateX, translateY);
                if (!this.scrollContainer) {
                    this._lastX += scrollByX;
                    this._lastY += scrollByY;
                }
            }
        })
    }

    protected onScrollContainer() {
        const scrollDir = this.getContainerScrollDirection();
        if (scrollDir !== null && scrollDir !== undefined && !this._containerScrollIntervalId) {
            // Save original container sizes to ensure that we don't increase scroll sizes infinitely when out of bounds.
            this._originalScrollContainerWidth = this.scrollContainer ? this.scrollContainer.scrollWidth : this.windowScrollWidth;
            this._originalScrollContainerHeight = this.scrollContainer ? this.scrollContainer.scrollHeight : this.windowScrollHeight;

            this._containerScrollIntervalId = setInterval(() => this.onScrollContainerStep(scrollDir), this._scrollContainerStepMs);
        } else if ((scrollDir === null || scrollDir === undefined) && this._containerScrollIntervalId) {
            // We moved out of end bounds and there is interval started
            clearInterval(this._containerScrollIntervalId);
            this._containerScrollIntervalId = null;
        }
    }
}

@Directive({
    exportAs: 'drop',
    selector: '[igxDrop]',
    standalone: true
})
export class IgxDropDirective implements OnInit, OnDestroy {
    /**
     * - Save data inside the `igxDrop` directive. This can be set when instancing `igxDrop` on an element.
     * ```html
     * <div [igxDrop]="{ source: myElement }"></div>
     * ```
     *
     * @memberof IgxDropDirective
     */
    @Input('igxDrop')
    public set data(v: any) {
        this._data = v;
    }

    public get data(): any {
        return this._data;
    }

    /**
     * A property that provides a way for igxDrag and igxDrop to be linked through channels.
     * It accepts single value or an array of values and evaluates then using strict equality.
     * ```html
     * <div igxDrag [dragChannel]="'odd'">
     *         <span>95</span>
     * </div>
     * <div igxDrop [dropChannel]="['odd', 'irrational']">
     *         <span>Numbers drop area!</span>
     * </div>
     * ```
     *
     * @memberof IgxDropDirective
     */
    @Input()
    public dropChannel: number | string | number[] | string[];

    /**
     * Sets a drop strategy type that will be executed when an `IgxDrag` element is released inside
     *  the current drop area. The provided strategies are:
     *  - IgxDefaultDropStrategy - This is the default base strategy and it doesn't perform any actions.
     *  - IgxAppendDropStrategy - Appends the dropped element to last position as a direct child to the `igxDrop`.
     *  - IgxPrependDropStrategy - Prepends the dropped element to first position as a direct child to the `igxDrop`.
     *  - IgxInsertDropStrategy - If the dropped element is released above a child element of the `igxDrop`, it will be inserted
     *      at that position. Otherwise the dropped element will be appended if released outside any child of the `igxDrop`.
     * ```html
     * <div igxDrag>
     *      <span>DragMe</span>
     * </div>
     * <div igxDrop [dropStrategy]="myDropStrategy">
     *         <span>Numbers drop area!</span>
     * </div>
     * ```
     * ```typescript
     * import { IgxAppendDropStrategy } from 'igniteui-angular';
     *
     * export class App {
     *      public myDropStrategy = IgxAppendDropStrategy;
     * }
     * ```
     *
     * @memberof IgxDropDirective
     */
    @Input()
    public set dropStrategy(classRef: any) {
        this._dropStrategy = new classRef(this._renderer);
    }

    public get dropStrategy() {
        return this._dropStrategy;
    }

    /**
     * Event triggered when dragged element enters the area of the element.
     * ```html
     * <div class="cageArea" igxDrop (enter)="dragEnter()" (igxDragEnter)="onDragCageEnter()" (igxDragLeave)="onDragCageLeave()">
     * </div>
     * ```
     * ```typescript
     * public dragEnter(){
     *     alert("A draggable element has entered the chip area!");
     * }
     * ```
     *
     * @memberof IgxDropDirective
     */
    @Output()
    public enter = new EventEmitter<IDropBaseEventArgs>();

    /**
     * Event triggered when dragged element enters the area of the element.
     * ```html
     * <div class="cageArea" igxDrop (enter)="dragEnter()" (igxDragEnter)="onDragCageEnter()" (igxDragLeave)="onDragCageLeave()">
     * </div>
     * ```
     * ```typescript
     * public dragEnter(){
     *     alert("A draggable element has entered the chip area!");
     * }
     * ```
     *
     * @memberof IgxDropDirective
     */
    @Output()
    public over = new EventEmitter<IDropBaseEventArgs>();

    /**
     * Event triggered when dragged element leaves the area of the element.
     * ```html
     * <div class="cageArea" igxDrop (leave)="dragLeave()" (igxDragEnter)="onDragCageEnter()" (igxDragLeave)="onDragCageLeave()">
     * </div>
     * ```
     * ```typescript
     * public dragLeave(){
     *     alert("A draggable element has left the chip area!");
     * }
     * ```
     *
     * @memberof IgxDropDirective
     */
    @Output()
    public leave = new EventEmitter<IDropBaseEventArgs>();

    /**
     * Event triggered when dragged element is dropped in the area of the element.
     * Since the `igxDrop` has default logic that appends the dropped element as a child, it can be canceled here.
     * To cancel the default logic the `cancel` property of the event needs to be set to true.
     * ```html
     * <div class="cageArea" igxDrop (dropped)="dragDrop()" (igxDragEnter)="onDragCageEnter()" (igxDragLeave)="onDragCageLeave()">
     * </div>
     * ```
     * ```typescript
     * public dragDrop(){
     *     alert("A draggable element has been dropped in the chip area!");
     * }
     * ```
     *
     * @memberof IgxDropDirective
     */
    @Output()
    public dropped = new EventEmitter<IDropDroppedEventArgs>();

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
    protected _dropStrategy: IDropStrategy;

    private _data: any;

    constructor(public element: ElementRef, private _renderer: Renderer2, private _zone: NgZone) {
        this._dropStrategy = new IgxDefaultDropStrategy();
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
        const args: IDropDroppedEventArgs = {
            owner: this,
            originalEvent: event.detail.originalEvent,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            startX: event.detail.startX,
            startY: event.detail.startY,
            pageX: event.detail.pageX,
            pageY: event.detail.pageY,
            offsetX,
            offsetY,
            cancel: false
        };
        this._zone.run(() => {
            this.dropped.emit(args);
        });

        if (this._dropStrategy && !args.cancel) {
            const elementsAtPoint = event.detail.owner.getElementsAtPoint(event.detail.pageX, event.detail.pageY);
            const insertIndex = this.getInsertIndexAt(event.detail.owner, elementsAtPoint);
            this._dropStrategy.dropAction(event.detail.owner, this, insertIndex);
        }
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
    public onDragOver(event) {
        const elementPosX = this.element.nativeElement.getBoundingClientRect().left + this.getWindowScrollLeft();
        const elementPosY = this.element.nativeElement.getBoundingClientRect().top + this.getWindowScrollTop();
        const offsetX = event.detail.pageX - elementPosX;
        const offsetY = event.detail.pageY - elementPosY;
        const eventArgs: IDropBaseEventArgs = {
            originalEvent: event.detail.originalEvent,
            owner: this,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            startX: event.detail.startX,
            startY: event.detail.startY,
            pageX: event.detail.pageX,
            pageY: event.detail.pageY,
            offsetX,
            offsetY
        };

        this.over.emit(eventArgs);
    }

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
        const eventArgs: IDropBaseEventArgs = {
            originalEvent: event.detail.originalEvent,
            owner: this,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            startX: event.detail.startX,
            startY: event.detail.startY,
            pageX: event.detail.pageX,
            pageY: event.detail.pageY,
            offsetX,
            offsetY
        };
        this._zone.run(() => {
            this.enter.emit(eventArgs);
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
        const eventArgs: IDropBaseEventArgs = {
            originalEvent: event.detail.originalEvent,
            owner: this,
            drag: event.detail.owner,
            dragData: event.detail.owner.data,
            startX: event.detail.startX,
            startY: event.detail.startY,
            pageX: event.detail.pageX,
            pageY: event.detail.pageY,
            offsetX,
            offsetY
        };
        this._zone.run(() => {
            this.leave.emit(eventArgs);
        });
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
            const dropLinks = this.dropChannel as any[];
            for (const link of dropLinks) {
                if (link === drag.dragChannel) {
                    return true;
                }
            }
        } else if (dragLinkArray && !dropLinkArray) {
            const dragLinks = drag.dragChannel as any[];
            for (const link of dragLinks) {
                if (link === this.dropChannel) {
                    return true;
                }
            }
        } else {
            const dragLinks = drag.dragChannel as any[];
            const dropLinks = this.dropChannel as any[];
            for (const draglink of dragLinks) {
                for (const droplink of dropLinks) {
                    if (draglink === droplink) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    protected getInsertIndexAt(draggedDir: IgxDragDirective, elementsAtPoint: any[]): number {
        let insertIndex = -1;
        const dropChildren = Array.prototype.slice.call(this.element.nativeElement.children);
        if (!dropChildren.length) {
            return insertIndex;
        }

        let i = 0;
        let childUnder = null;
        while (!childUnder && i < elementsAtPoint.length) {
            if (elementsAtPoint[i].parentElement === this.element.nativeElement) {
                childUnder = elementsAtPoint[i];
            }
            i++;
        }

        const draggedElemIndex = dropChildren.indexOf(draggedDir.element.nativeElement);
        insertIndex = dropChildren.indexOf(childUnder);
        if (draggedElemIndex !== -1 && draggedElemIndex < insertIndex) {
            insertIndex++;
        }

        return insertIndex;
    }
}

