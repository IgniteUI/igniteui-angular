import { Directive, Input, ElementRef, NgZone, OnInit, OnDestroy, inject } from '@angular/core';

const BASE_DELTA_MULTIPLIER = 1 / 120;
const FIREFOX_DELTA_MULTIPLIER = 1 / 30;
const SAVED_SPEEDS_CAPACITY = 5;
const TOUCH_TIME_THRESHOLD = 100;
const SPEED_THRESHOLD = 0.1;
const MOVEMENT_THRESHOLD = 2;
const INERTIA_CANCEL_THRESHOLD = 6;
const INERTIA_BREAKPOINT = 1;
const INERTIA_MULTIPLIER = 15;
const WHEEL_ANIMATION_STEP = 0.08;

// Inertia falloff formula constants: y = FALLOFF_NUMERATOR / (x + FALLOFF_OFFSET) - FALLOFF_SUBTRACTION
const FALLOFF_NUMERATOR = 2;
const FALLOFF_OFFSET = 0.55;
const FALLOFF_SUBTRACTION = 0.3;
const TIME_STEP_INCREMENT = 0.05;
const WHEEL_CURVE_COEFFICIENT = -3;
const WHEEL_CURVE_MULTIPLIER = 3;
const WHEEL_DELTA_MULTIPLIER = 2;

/**
 * @hidden
 */
@Directive({
    selector: '[igxScrollInertia]',
    standalone: true
})
export class IgxScrollInertiaDirective implements OnInit, OnDestroy {
    private readonly _element = inject(ElementRef);
    private readonly _zone = inject(NgZone);
    private _abort?: AbortController;


    @Input()
    public IgxScrollInertiaDirection: string;

    @Input()
    public IgxScrollInertiaScrollContainer: HTMLElement;

    @Input()
    public wheelStep = 50;

    @Input()
    public inertiaStep = 1.5;

    @Input()
    public smoothingStep = 1.5;

    @Input()
    public smoothingDuration = 0.5;

    @Input()
    public swipeToleranceX = 20;

    @Input()
    public inertiaDeltaY = 3;

    @Input()
    public inertiaDeltaX = 2;

    @Input()
    public inertiaDuration = 0.5;

    private _touchInertiaAnimID: ReturnType<typeof requestAnimationFrame>;
    private _startX: number;
    private _startY: number;
    private _touchStartX: number;
    private _touchStartY: number;
    private _lastTouchEnd: number;
    private _lastTouchX: number;
    private _lastTouchY: number;
    private _savedSpeedsX: number[] = [];
    private _savedSpeedsY: number[] = [];
    private _totalMovedX: number;
    private _offsetRecorded: boolean;
    private _offsetDirection: number;
    private _lastMovedX: number;
    private _lastMovedY: number;
    private _nextX: number;
    private _nextY: number;
    private _speedsIndexX = 0;
    private _speedsIndexY = 0;
    private parentElement: HTMLElement;
    private _cachedFirstChild: HTMLElement | null = null;

    public ngOnInit(): void {
        this._zone.runOutsideAngular(() => {
            this.parentElement = this._element.nativeElement.parentElement || this._element.nativeElement.parentNode;

            if (!this.parentElement) {
                return;
            }

            this._abort = new AbortController();
            for (const each of ['wheel', 'touchstart', 'touchmove', 'touchend']) {
                this.parentElement.addEventListener(each, this, { passive: false, signal: this._abort.signal });
            }
        });
    }

    /** @hidden */
    public handleEvent(event: Event): void {
        switch (event.type) {
            case 'wheel':
                this.onWheel(event as WheelEvent);
                break;
            case 'touchstart':
                this.onTouchStart(event as TouchEvent);
                break;
            case 'touchmove':
                this.onTouchMove(event as TouchEvent);
                break;
            case 'touchend':
                this.onTouchEnd(event as TouchEvent);
                break;
        }
    }

    public ngOnDestroy(): void {
        this._zone.runOutsideAngular(() => {
            this._abort?.abort();
        });
    }

    /**
     * @hidden
     * Function that is called when scrolling with the mouse wheel or using touchpad
     */
    private getFirstChild(): HTMLElement | null {
        if (!this._cachedFirstChild && this.IgxScrollInertiaScrollContainer) {
            this._cachedFirstChild = this.IgxScrollInertiaScrollContainer.children[0] as HTMLElement;
        }
        return this._cachedFirstChild;
    }

    protected onWheel(evt: WheelEvent & { wheelDeltaX?: number; wheelDeltaY?: number }): void {
        const container = this.IgxScrollInertiaScrollContainer;
        // if no scrollbar return
        if (!container) {
            return;
        }
        // if ctrl key is pressed and the user want to zoom in/out the page
        if (evt.ctrlKey) {
            return;
        }
        let scrollDeltaX: number | undefined;
        let scrollDeltaY: number | undefined;
        const scrollStep = this.wheelStep;
        const minWheelStep = 1 / scrollStep;
        const smoothing = this.smoothingDuration !== 0;

        this._startX = container.scrollLeft;
        this._startY = container.scrollTop;

        // Handle wheelDeltaX/Y (Chrome, Safari, Opera)
        if (evt.wheelDeltaX) {
            scrollDeltaX = -evt.wheelDeltaX * BASE_DELTA_MULTIPLIER;
            if (-minWheelStep < scrollDeltaX && scrollDeltaX < minWheelStep) {
                scrollDeltaX = Math.sign(scrollDeltaX) * minWheelStep;
            }
        } else if (evt.deltaX) {
            const deltaScaledX = evt.deltaX * (evt.deltaMode === 0 ? FIREFOX_DELTA_MULTIPLIER : 1);
            scrollDeltaX = this.calcAxisCoords(deltaScaledX, -1, 1);
        }

        if (evt.wheelDeltaY) {
            scrollDeltaY = -evt.wheelDeltaY * BASE_DELTA_MULTIPLIER;
            if (-minWheelStep < scrollDeltaY && scrollDeltaY < minWheelStep) {
                scrollDeltaY = Math.sign(scrollDeltaY) * minWheelStep;
            }
        } else if (evt.deltaY) {
            const deltaScaledY = evt.deltaY * (evt.deltaMode === 0 ? FIREFOX_DELTA_MULTIPLIER : 1);
            scrollDeltaY = this.calcAxisCoords(deltaScaledY, -1, 1);
        }

        if (evt.composedPath && this.didChildScroll(evt, scrollDeltaX, scrollDeltaY)) {
            return;
        }

        if (scrollDeltaX && this.IgxScrollInertiaDirection === 'horizontal') {
            const nextLeft = this._startX + scrollDeltaX * scrollStep;
            if (!smoothing) {
                this._scrollToX(nextLeft);
            } else {
                this._smoothWheelScroll(scrollDeltaX);
            }
            const firstChild = this.getFirstChild();
            if (firstChild) {
                const maxScrollLeft = parseInt(firstChild.style.width, 10);
                if (0 < nextLeft && nextLeft < maxScrollLeft) {
                    // Prevent navigating through pages when scrolling on Mac
                    evt.preventDefault();
                }
            }
        } else if (evt.shiftKey && scrollDeltaY && this.IgxScrollInertiaDirection === 'horizontal') {
            if (!smoothing) {
                const step = this._startX + scrollDeltaY * scrollStep;
                this._scrollToX(step);
            } else {
                this._smoothWheelScroll(scrollDeltaY);
            }
        } else if (!evt.shiftKey && scrollDeltaY && this.IgxScrollInertiaDirection === 'vertical') {
            const nextTop = this._startY + scrollDeltaY * scrollStep;
            if (!smoothing) {
                this._scrollToY(nextTop);
            } else {
                this._smoothWheelScroll(scrollDeltaY);
            }
            this.preventParentScroll(evt, true, nextTop);
        }
    }

    /**
     * @hidden
     * When there is still room to scroll up/down prevent the parent elements from scrolling too.
     */
    protected preventParentScroll(evt: Event, preventDefault: boolean, nextTop = 0): void {
        const container = this.IgxScrollInertiaScrollContainer;
        const firstChild = this.getFirstChild();
        if (!firstChild) {
            return;
        }
        const curScrollTop = nextTop === 0 ? container.scrollTop : nextTop;
        const maxScrollTop = firstChild.scrollHeight - container.offsetHeight;
        if (0 < curScrollTop && curScrollTop < maxScrollTop) {
            if (preventDefault) {
                evt.preventDefault();
            }
            if (evt.stopPropagation) {
                evt.stopPropagation();
            }
        }
    }

    /**
     * @hidden
     * Checks if the wheel event would have scrolled an element under the display container
     * in DOM tree so that it can correctly be ignored until that element can no longer be scrolled.
     */
    private canElementScrollVertically(element: Element, delta: number, overflowY: string): boolean {
        if (overflowY !== 'auto' && overflowY !== 'scroll') {
            return false;
        }
        if (delta > 0) {
            return element.scrollHeight - Math.abs(Math.round(element.scrollTop)) !== element.clientHeight;
        }
        return element.scrollTop !== 0;
    }

    private canElementScrollHorizontally(element: Element, delta: number, overflowX: string): boolean {
        if (overflowX !== 'auto' && overflowX !== 'scroll') {
            return false;
        }
        if (delta > 0) {
            return element.scrollWidth - Math.abs(Math.round(element.scrollLeft)) !== element.clientWidth;
        }
        return element.scrollLeft !== 0;
    }

    protected didChildScroll(evt: Event, scrollDeltaX: number, scrollDeltaY: number): boolean {
        const path = evt.composedPath() as Element[];
        const pathLength = path.length;

        for (let i = 0; i < pathLength; i++) {
            const element = path[i];
            if (element.localName === 'igx-display-container') {
                break;
            }

            const hasVerticalOverflow = element.scrollHeight > element.clientHeight;
            const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;

            if (!hasVerticalOverflow && !hasHorizontalOverflow) {
                continue;
            }

            const styles = window.getComputedStyle(element);

            if (hasVerticalOverflow && scrollDeltaY !== 0) {
                if (this.canElementScrollVertically(element, scrollDeltaY, styles.overflowY)) {
                    return true;
                }
            }

            if (hasHorizontalOverflow && scrollDeltaX !== 0) {
                if (this.canElementScrollHorizontally(element, scrollDeltaX, styles.overflowX)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @hidden
     * Function that is called the first moment we start interacting with the content on a touch device
     */
    protected onTouchStart(event: TouchEvent): void {
        const container = this.IgxScrollInertiaScrollContainer;
        if (!container) {
            return;
        }

        // stops any current ongoing inertia
        cancelAnimationFrame(this._touchInertiaAnimID);

        const touch = event.touches[0];
        const touchX = touch.pageX;
        const touchY = touch.pageY;

        this._startX = container.scrollLeft;
        this._startY = container.scrollTop;
        this._touchStartX = touchX;
        this._touchStartY = touchY;
        this._lastTouchEnd = Date.now();
        this._lastTouchX = touchX;
        this._lastTouchY = touchY;
        this._savedSpeedsX = new Array(SAVED_SPEEDS_CAPACITY);
        this._savedSpeedsY = new Array(SAVED_SPEEDS_CAPACITY);
        this._speedsIndexX = 0;
        this._speedsIndexY = 0;

        // Vars regarding swipe offset
        this._totalMovedX = 0;
        this._offsetRecorded = false;
        this._offsetDirection = 0;

        if (this.IgxScrollInertiaDirection === 'vertical') {
            this.preventParentScroll(event, false);
        }
    }

    /**
     * @hidden
     * Function that is called when we need to scroll the content based on touch interactions
     */
    protected onTouchMove(event: TouchEvent): void {
        if (!this.IgxScrollInertiaScrollContainer) {
            return;
        }

        const touch = event.touches[0];
        const touchX = touch.pageX;
        const touchY = touch.pageY;
        const inertiaSign = Math.sign(this.inertiaStep);
        const destX = this._startX + (this._touchStartX - touchX) * inertiaSign;
        const destY = this._startY + (this._touchStartY - touchY) * inertiaSign;

        /* Handle complex touchmove when swipe stops but the touch doesn't end and then a swipe is initiated again */
        const currentTime = Date.now();
        const timeFromLastTouch = currentTime - this._lastTouchEnd;

        if (timeFromLastTouch !== 0 && timeFromLastTouch < TOUCH_TIME_THRESHOLD) {
            const speedX = (this._lastTouchX - touchX) / timeFromLastTouch;
            const speedY = (this._lastTouchY - touchY) / timeFromLastTouch;

            // Use circular buffer to save the last speeds - avoids expensive shift() operation
            this._savedSpeedsX[this._speedsIndexX] = speedX;
            this._speedsIndexX = (this._speedsIndexX + 1) % SAVED_SPEEDS_CAPACITY;

            this._savedSpeedsY[this._speedsIndexY] = speedY;
            this._speedsIndexY = (this._speedsIndexY + 1) % SAVED_SPEEDS_CAPACITY;
        }
        this._lastTouchEnd = currentTime;
        this._lastMovedX = this._lastTouchX - touch.pageX;
        this._lastMovedY = this._lastTouchY - touch.pageY;
        this._lastTouchX = touch.pageX;
        this._lastTouchY = touch.pageY;

        this._totalMovedX += this._lastMovedX;

        /*	Do not scroll using touch until out of the swipeToleranceX bounds */
        if (Math.abs(this._totalMovedX) < this.swipeToleranceX && !this._offsetRecorded) {
            this._scrollTo(this._startX, destY);
        } else {
            /*	Record the direction the first time we are out of the swipeToleranceX bounds.
            *	That way we know which direction we apply the offset so it doesn't hiccup when moving out of the swipeToleranceX bounds */
            if (!this._offsetRecorded) {
                this._offsetDirection = Math.sign(destX - this._startX);
                this._offsetRecorded = true;
            }

            /*	Scroll with offset amount of swipeToleranceX in the direction we have exited the bounds and
            don't change it after that ever until touchend and again touchstart */
            this._scrollTo(destX - this._offsetDirection * this.swipeToleranceX, destY);
        }

        // On Safari preventing the touchmove would prevent default page scroll behavior even if there is the element doesn't have overflow
        if (this.IgxScrollInertiaDirection === 'vertical') {
            this.preventParentScroll(event, true);
        }
    }

    protected onTouchEnd(event: TouchEvent): void {
        let speedX = 0;
        let speedY = 0;
        let validCountX = 0;
        let validCountY = 0;

        // Calculate average speed from circular buffer, ignoring undefined values
        for (let i = 0; i < SAVED_SPEEDS_CAPACITY; i++) {
            if (this._savedSpeedsX[i] !== undefined) {
                speedX += this._savedSpeedsX[i];
                validCountX++;
            }
            if (this._savedSpeedsY[i] !== undefined) {
                speedY += this._savedSpeedsY[i];
                validCountY++;
            }
        }

        if (validCountX > 0) {
            speedX /= validCountX;
        }
        if (validCountY > 0) {
            speedY /= validCountY;
        }

        // Use the lastMovedX and lastMovedY to determine if the swipe stops without lifting the finger so we don't start inertia
        if ((Math.abs(speedX) > SPEED_THRESHOLD || Math.abs(speedY) > SPEED_THRESHOLD) &&
            (Math.abs(this._lastMovedX) > MOVEMENT_THRESHOLD || Math.abs(this._lastMovedY) > MOVEMENT_THRESHOLD)) {
            this._inertiaInit(speedX, speedY);
        }
        if (this.IgxScrollInertiaDirection === 'vertical') {
            this.preventParentScroll(event, false);
        }
    }

    protected _smoothWheelScroll(delta: number): void {
        const container = this.IgxScrollInertiaScrollContainer;
        this._nextY = container.scrollTop;
        this._nextX = container.scrollLeft;
        let timeProgress = -1;
        let wheelInertialAnimation: number | null = null;
        const isVertical = this.IgxScrollInertiaDirection === 'vertical';
        const smoothingStep = this.smoothingStep;
        const stepIncrement = WHEEL_ANIMATION_STEP / this.smoothingDuration;

        const inertiaWheelStep = (): void => {
            if (timeProgress > INERTIA_BREAKPOINT) {
                if (wheelInertialAnimation !== null) {
                    cancelAnimationFrame(wheelInertialAnimation);
                }
                return;
            }
            // Ease-out cubic curve: y = (-3x² + 3) * delta * 2
            const nextScroll = ((WHEEL_CURVE_COEFFICIENT * timeProgress * timeProgress + WHEEL_CURVE_MULTIPLIER) * delta * WHEEL_DELTA_MULTIPLIER) * smoothingStep;
            if (isVertical) {
                this._nextY += nextScroll;
                this._scrollToY(this._nextY);
            } else {
                this._nextX += nextScroll;
                this._scrollToX(this._nextX);
            }
            // continue the inertia
            timeProgress += stepIncrement;
            wheelInertialAnimation = requestAnimationFrame(inertiaWheelStep);
        };
        wheelInertialAnimation = requestAnimationFrame(inertiaWheelStep);
    }

    protected _inertiaInit(speedX: number, speedY: number): void {
        const container = this.IgxScrollInertiaScrollContainer;
        const stepModifier = this.inertiaStep;
        const inertiaDuration = this.inertiaDuration;
        const inertiaDeltaX = this.inertiaDeltaX;
        const inertiaDeltaY = this.inertiaDeltaY;
        const absSpeedX = Math.abs(speedX);
        const absSpeedY = Math.abs(speedY);
        const speedXThreshold = absSpeedX * inertiaDeltaY;
        const speedYThreshold = absSpeedX * inertiaDeltaX;
        const stepIncrement = TIME_STEP_INCREMENT / inertiaDuration;
        let timeProgress = 0;

        this._nextX = container.scrollLeft;
        this._nextY = container.scrollTop;

        // Sets timeout until executing next movement iteration of the inertia
        const inertiaStep = (): void => {
            if (timeProgress > INERTIA_CANCEL_THRESHOLD) {
                cancelAnimationFrame(this._touchInertiaAnimID);
                return;
            }

            timeProgress += stepIncrement;

            if (timeProgress <= INERTIA_BREAKPOINT) {
                // We use constant equation to determine the offset without speed falloff before timeProgress reaches 1
                if (absSpeedY <= speedXThreshold) {
                    this._nextX += speedX * INERTIA_MULTIPLIER * stepModifier;
                }
                if (absSpeedY >= speedYThreshold) {
                    this._nextY += speedY * INERTIA_MULTIPLIER * stepModifier;
                }
            } else {
                // Ease-out formula: y = FALLOFF_NUMERATOR / (x + FALLOFF_OFFSET) - FALLOFF_SUBTRACTION
                const falloff = Math.abs(FALLOFF_NUMERATOR / (timeProgress + FALLOFF_OFFSET) - FALLOFF_SUBTRACTION);
                if (absSpeedY <= speedXThreshold) {
                    this._nextX += falloff * speedX * INERTIA_MULTIPLIER * stepModifier;
                }
                if (absSpeedY >= speedYThreshold) {
                    this._nextY += falloff * speedY * INERTIA_MULTIPLIER * stepModifier;
                }
            }

            // If we have mixed environment we use the default behavior. i.e. touchscreen + mouse
            this._scrollTo(this._nextX, this._nextY);

            this._touchInertiaAnimID = requestAnimationFrame(inertiaStep);
        };

        // Start inertia and continue it recursively
        this._touchInertiaAnimID = requestAnimationFrame(inertiaStep);
    }

    private calcAxisCoords(target: number, min: number, max: number): number {
        if (target === undefined || target < min) {
            target = min;
        } else if (target > max) {
            target = max;
        }

        return target;
    }

    private _scrollTo(destX: number, destY: number): void {
        // TODO Trigger scrolling event?
        this._scrollToX(destX);
        this._scrollToY(destY);
    }

    private _scrollToX(dest: number): void {
        this.IgxScrollInertiaScrollContainer.scrollLeft = dest;
    }

    private _scrollToY(dest: number): void {
        this.IgxScrollInertiaScrollContainer.scrollTop = dest;
    }
}
