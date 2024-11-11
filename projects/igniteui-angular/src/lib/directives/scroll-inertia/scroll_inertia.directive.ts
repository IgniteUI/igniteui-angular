import { Directive, Input, ElementRef, NgZone, OnInit, OnDestroy } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: '[igxScrollInertia]',
    standalone: true
})
export class IgxScrollInertiaDirective implements OnInit, OnDestroy {

    @Input()
    public IgxScrollInertiaDirection: string;

    @Input()
    public IgxScrollInertiaScrollContainer: any;

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

    private _touchInertiaAnimID;
    private _startX;
    private _startY;
    private _touchStartX;
    private _touchStartY;
    private _lastTouchEnd;
    private _lastTouchX;
    private _lastTouchY;
    private _savedSpeedsX = [];
    private _savedSpeedsY;
    private _totalMovedX;
    private _offsetRecorded;
    private _offsetDirection;
    private _lastMovedX;
    private _lastMovedY;
    private _nextX;
    private _nextY;
    private parentElement;
    private baseDeltaMultiplier = 1 / 120;
    private firefoxDeltaMultiplier = 1 / 30;

    constructor(private element: ElementRef, private _zone: NgZone) { }

    public ngOnInit(): void {
        this._zone.runOutsideAngular(() => {
            this.parentElement = this.element.nativeElement.parentElement || this.element.nativeElement.parentNode;
            if (!this.parentElement) {
                return;
            }
            const targetElem = this.parentElement;
            targetElem.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
            targetElem.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
            targetElem.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
            targetElem.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        });
    }

    public ngOnDestroy() {
        this._zone.runOutsideAngular(() => {
            const targetElem = this.parentElement;
            if (!targetElem) {
                return;
            }
            targetElem.removeEventListener('wheel', this.onWheel);
            targetElem.removeEventListener('touchstart', this.onTouchStart);
            targetElem.removeEventListener('touchmove', this.onTouchMove);
            targetElem.removeEventListener('touchend', this.onTouchEnd);
        });
    }

    /**
     * @hidden
     * Function that is called when scrolling with the mouse wheel or using touchpad
     */
    protected onWheel(evt) {
        // if no scrollbar return
        if (!this.IgxScrollInertiaScrollContainer) {
            return;
        }
        // if ctrl key is pressed and the user want to zoom in/out the page
        if (evt.ctrlKey) {
            return;
        }
        let scrollDeltaX;
        let scrollDeltaY;
        const scrollStep = this.wheelStep;
        const minWheelStep = 1 / this.wheelStep;
        const smoothing = this.smoothingDuration !== 0;

        this._startX = this.IgxScrollInertiaScrollContainer.scrollLeft;
        this._startY = this.IgxScrollInertiaScrollContainer.scrollTop;

        if (evt.wheelDeltaX) {
            /* Option supported on Chrome, Safari, Opera.
            /* 120 is default for mousewheel on these browsers. Other values are for trackpads */
            scrollDeltaX = -evt.wheelDeltaX * this.baseDeltaMultiplier;

            if (-minWheelStep < scrollDeltaX && scrollDeltaX < minWheelStep) {
                scrollDeltaX = Math.sign(scrollDeltaX) * minWheelStep;
            }
        } else if (evt.deltaX) {
            /* For other browsers that don't provide wheelDelta, use the deltaY to determine direction and pass default values. */
            const deltaScaledX = evt.deltaX * (evt.deltaMode === 0 ? this.firefoxDeltaMultiplier : 1);
            scrollDeltaX = this.calcAxisCoords(deltaScaledX, -1, 1);
        }

        /** Get delta for the Y axis */
        if (evt.wheelDeltaY) {
            /* Option supported on Chrome, Safari, Opera.
            /* 120 is default for mousewheel on these browsers. Other values are for trackpads */
            scrollDeltaY = -evt.wheelDeltaY * this.baseDeltaMultiplier;

            if (-minWheelStep < scrollDeltaY && scrollDeltaY < minWheelStep) {
                scrollDeltaY = Math.sign(scrollDeltaY) * minWheelStep;
            }
        } else if (evt.deltaY) {
            /* For other browsers that don't provide wheelDelta, use the deltaY to determine direction and pass default values. */
            const deltaScaledY = evt.deltaY * (evt.deltaMode === 0 ? this.firefoxDeltaMultiplier : 1);
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
            const maxScrollLeft = parseInt(this.IgxScrollInertiaScrollContainer.children[0].style.width, 10);
            if (0 < nextLeft && nextLeft < maxScrollLeft) {
                // Prevent navigating through pages when scrolling on Mac
                evt.preventDefault();
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
    protected preventParentScroll(evt, preventDefault, nextTop = 0) {
        const curScrollTop = nextTop === 0 ? this.IgxScrollInertiaScrollContainer.scrollTop : nextTop;
        const maxScrollTop = this.IgxScrollInertiaScrollContainer.children[0].scrollHeight -
            this.IgxScrollInertiaScrollContainer.offsetHeight;
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
    protected didChildScroll(evt, scrollDeltaX, scrollDeltaY): boolean {
        const path = evt.composedPath();
        let i = 0;
        while (i < path.length && path[i].localName !== 'igx-display-container') {
            const e = path[i++];
            if (e.scrollHeight > e.clientHeight) {
                const overflowY = window.getComputedStyle(e)['overflow-y'];
                if (overflowY === 'auto' || overflowY === 'scroll') {
                    if (scrollDeltaY > 0 && e.scrollHeight - Math.abs(Math.round(e.scrollTop)) !== e.clientHeight) {
                        return true;
                    }
                    if (scrollDeltaY < 0 && e.scrollTop !== 0) {
                        return true;
                    }
                }
            }
            if (e.scrollWidth > e.clientWidth) {
                const overflowX = window.getComputedStyle(e)['overflow-x'];
                if (overflowX === 'auto' || overflowX === 'scroll') {
                    if (scrollDeltaX > 0 && e.scrollWidth - Math.abs(Math.round(e.scrollLeft)) !== e.clientWidth) {
                        return true;
                    }
                    if (scrollDeltaX < 0 && e.scrollLeft !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * @hidden
     * Function that is called the first moment we start interacting with the content on a touch device
     */
    protected onTouchStart(event) {
        if (!this.IgxScrollInertiaScrollContainer) {
            return false;
        }

        // stops any current ongoing inertia
        cancelAnimationFrame(this._touchInertiaAnimID);

        const touch = event.touches[0];

        this._startX = this.IgxScrollInertiaScrollContainer.scrollLeft;

        this._startY = this.IgxScrollInertiaScrollContainer.scrollTop;

        this._touchStartX = touch.pageX;
        this._touchStartY = touch.pageY;

        this._lastTouchEnd = new Date().getTime();
        this._lastTouchX = touch.pageX;
        this._lastTouchY = touch.pageY;
        this._savedSpeedsX = [];
        this._savedSpeedsY = [];

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
    protected onTouchMove(event) {
        if (!this.IgxScrollInertiaScrollContainer) {
            return;
        }

        const touch = event.touches[0];
        const destX = this._startX + (this._touchStartX - touch.pageX) * Math.sign(this.inertiaStep);
        const destY = this._startY + (this._touchStartY - touch.pageY) * Math.sign(this.inertiaStep);

        /* Handle complex touchmoves when swipe stops but the toch doesn't end and then a swipe is initiated again */
        /* **********************************************************/


        const timeFromLastTouch = (new Date().getTime()) - this._lastTouchEnd;
        if (timeFromLastTouch !== 0 && timeFromLastTouch < 100) {
            const speedX = (this._lastTouchX - touch.pageX) / timeFromLastTouch;
            const speedY = (this._lastTouchY - touch.pageY) / timeFromLastTouch;

            // Save the last 5 speeds between two touchmoves on X axis
            if (this._savedSpeedsX.length < 5) {
                this._savedSpeedsX.push(speedX);
            } else {
                this._savedSpeedsX.shift();
                this._savedSpeedsX.push(speedX);
            }

            // Save the last 5 speeds between two touchmoves on Y axis
            if (this._savedSpeedsY.length < 5) {
                this._savedSpeedsY.push(speedY);
            } else {
                this._savedSpeedsY.shift();
                this._savedSpeedsY.push(speedY);
            }
        }
        this._lastTouchEnd = new Date().getTime();
        this._lastMovedX = this._lastTouchX - touch.pageX;
        this._lastMovedY = this._lastTouchY - touch.pageY;
        this._lastTouchX = touch.pageX;
        this._lastTouchY = touch.pageY;

        this._totalMovedX += this._lastMovedX;

        /*	Do not scroll using touch untill out of the swipeToleranceX bounds */
        if (Math.abs(this._totalMovedX) < this.swipeToleranceX && !this._offsetRecorded) {
            this._scrollTo(this._startX, destY);
        } else {
            /*	Record the direction the first time we are out of the swipeToleranceX bounds.
            *	That way we know which direction we apply the offset so it doesn't hickup when moving out of the swipeToleranceX bounds */
            if (!this._offsetRecorded) {
                this._offsetDirection = Math.sign(destX - this._startX);
                this._offsetRecorded = true;
            }

            /*	Scroll with offset ammout of swipeToleranceX in the direction we have exited the bounds and
            don't change it after that ever until touchend and again touchstart */
            this._scrollTo(destX - this._offsetDirection * this.swipeToleranceX, destY);
        }

        // On Safari preventing the touchmove would prevent default page scroll behaviour even if there is the element doesn't have overflow
        if (this.IgxScrollInertiaDirection === 'vertical') {
            this.preventParentScroll(event, true);
        }
    }

    protected onTouchEnd(event) {
        let speedX = 0;
        let speedY = 0;

        // savedSpeedsX and savedSpeedsY have same length
        for (let i = 0; i < this._savedSpeedsX.length; i++) {
            speedX += this._savedSpeedsX[i];
            speedY += this._savedSpeedsY[i];
        }
        speedX = this._savedSpeedsX.length ? speedX / this._savedSpeedsX.length : 0;
        speedY = this._savedSpeedsX.length ? speedY / this._savedSpeedsY.length : 0;

        // Use the lastMovedX and lastMovedY to determine if the swipe stops without lifting the finger so we don't start inertia
        if ((Math.abs(speedX) > 0.1 || Math.abs(speedY) > 0.1) &&
            (Math.abs(this._lastMovedX) > 2 || Math.abs(this._lastMovedY) > 2)) {
            this._inertiaInit(speedX, speedY);
        }
        if (this.IgxScrollInertiaDirection === 'vertical') {
            this.preventParentScroll(event, false);
        }
    }

    protected _smoothWheelScroll(delta) {
        this._nextY = this.IgxScrollInertiaScrollContainer.scrollTop;
        this._nextX = this.IgxScrollInertiaScrollContainer.scrollLeft;
        let x = -1;
        let wheelInertialAnimation = null;
        const inertiaWheelStep = () => {
            if (x > 1) {
                cancelAnimationFrame(wheelInertialAnimation);
                return;
            }
            const nextScroll = ((-3 * x * x + 3) * delta * 2) * this.smoothingStep;
            if (this.IgxScrollInertiaDirection === 'vertical') {
                this._nextY += nextScroll;
                this._scrollToY(this._nextY);
            } else {
                this._nextX += nextScroll;
                this._scrollToX(this._nextX);
            }
            //continue the inertia
            x += 0.08 * (1 / this.smoothingDuration);
            wheelInertialAnimation = requestAnimationFrame(inertiaWheelStep);
        };
        wheelInertialAnimation = requestAnimationFrame(inertiaWheelStep);
    }

    protected _inertiaInit(speedX, speedY) {
        const stepModifer = this.inertiaStep;
        const inertiaDuration = this.inertiaDuration;
        let x = 0;
        this._nextX = this.IgxScrollInertiaScrollContainer.scrollLeft;
        this._nextY = this.IgxScrollInertiaScrollContainer.scrollTop;

        // Sets timeout until executing next movement iteration of the inertia
        const inertiaStep = () => {
            if (x > 6) {
                cancelAnimationFrame(this._touchInertiaAnimID);
                return;
            }

            if (Math.abs(speedX) > Math.abs(speedY)) {
                x += 0.05 / (1 * inertiaDuration);
            } else {
                x += 0.05 / (1 * inertiaDuration);
            }

            if (x <= 1) {
                // We use constant quation to determine the offset without speed falloff befor x reaches 1
                if (Math.abs(speedY) <= Math.abs(speedX) * this.inertiaDeltaY) {
                    this._nextX += 1 * speedX * 15 * stepModifer;
                }
                if (Math.abs(speedY) >= Math.abs(speedX) * this.inertiaDeltaX) {
                    this._nextY += 1 * speedY * 15 * stepModifer;
                }
            } else {
                // We use the quation "y = 2 / (x + 0.55) - 0.3" to determine the offset
                if (Math.abs(speedY) <= Math.abs(speedX) * this.inertiaDeltaY) {
                    this._nextX += Math.abs(2 / (x + 0.55) - 0.3) * speedX * 15 * stepModifer;
                }
                if (Math.abs(speedY) >= Math.abs(speedX) * this.inertiaDeltaX) {
                    this._nextY += Math.abs(2 / (x + 0.55) - 0.3) * speedY * 15 * stepModifer;
                }
            }

            // If we have mixed environment we use the default behaviour. i.e. touchscreen + mouse
            this._scrollTo(this._nextX, this._nextY);

            this._touchInertiaAnimID = requestAnimationFrame(inertiaStep);
        };

        // Start inertia and continue it recursively
        this._touchInertiaAnimID = requestAnimationFrame(inertiaStep);
    }

    private calcAxisCoords(target, min, max) {
        if (target === undefined || target < min) {
            target = min;
        } else if (target > max) {
            target = max;
        }

        return target;
    }

    private _scrollTo(destX, destY) {
        // TODO Trigger scrolling event?
        const scrolledX = this._scrollToX(destX);
        const scrolledY = this._scrollToY(destY);

        return { x: scrolledX, y: scrolledY };
    }
    private _scrollToX(dest) {
        this.IgxScrollInertiaScrollContainer.scrollLeft = dest;
    }
    private _scrollToY(dest) {
        this.IgxScrollInertiaScrollContainer.scrollTop = dest;
    }
}

/**
 * @hidden
 */


