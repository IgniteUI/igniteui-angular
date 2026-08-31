import { NgZone } from '@angular/core';

/**
 * Normalized gesture event emitted by {@link IgxTouchManager}.
 *
 * It intentionally mirrors the small subset of the previous Hammer.js input shape
 * (`deltaX`, `deltaY`, `center`, `distance`, `pointerType`) so existing gesture
 * handlers can consume it without changes.
 *
 * @hidden
 * @internal
 */
export interface IgxGestureEvent {
    /** The type of the pointer that produced the gesture (e.g. `touch`, `pen`, `mouse`). */
    pointerType: string;
    /** Horizontal distance (in px) from the gesture origin to the current pointer position. */
    deltaX: number;
    /** Vertical distance (in px) from the gesture origin to the current pointer position. */
    deltaY: number;
    /** Euclidean distance (in px) from the gesture origin to the current pointer position. */
    distance: number;
    /** Gesture velocity in px/ms, measured from the gesture origin to the current pointer position. */
    velocity: number;
    /** Current pointer position. */
    center: { x: number; y: number };
    /** The original event target. */
    target: EventTarget | null;
    /** The underlying native pointer event. */
    originalEvent: PointerEvent;
    /** Prevents the default action of the underlying native pointer event. */
    preventDefault: () => void;
    /**
     * Resets the gesture origin to the current pointer position so that subsequent
     * `deltaX`/`deltaY`/`distance` values are measured relative to it.
     */
    resetOrigin: () => void;
}

/**
 * Callbacks invoked by {@link IgxTouchManager} for the recognized gestures.
 *
 * @hidden
 * @internal
 */
export interface IgxTouchManagerCallbacks {
    /**
     * Fired on pointer down once the pointer type passes the configured filter, before any movement.
     *
     * Return `false` to veto the gesture (e.g. when the touch does not start in an active zone).
     * The manager then stops tracking immediately and best-effort releases the pointer capture, so
     * normal page/component scrolling is not blocked by the `touchmove` listener.
     */
    pointerDown?: (event: IgxGestureEvent) => boolean | void;
    /** Fired on the first pointer move of a tracked gesture, once movement begins (mirrors Hammer's `panstart`). */
    panStart?: (event: IgxGestureEvent) => void;
    /** Fired on each pointer move while a gesture is tracked. */
    panMove?: (event: IgxGestureEvent) => void;
    /** Fired on pointer up at the end of a tracked gesture. */
    panEnd?: (event: IgxGestureEvent) => void;
    /** Fired on pointer cancel for a tracked gesture. */
    panCancel?: (event: IgxGestureEvent) => void;
    /** Fired on pointer up when the movement stays below `tapThreshold`. Suppresses `panEnd`. */
    tap?: (event: IgxGestureEvent) => void;
    /** Fired on pointer up for a fast, primarily horizontal gesture, before `panEnd`. */
    swipe?: (event: IgxGestureEvent) => void;
}

/**
 * Options controlling how {@link IgxTouchManager} recognizes gestures.
 *
 * @hidden
 * @internal
 */
export interface IgxTouchManagerOptions {
    /** Pointer types to handle. Defaults to `['touch', 'pen']` (mouse excluded). */
    pointerTypes?: string[];
    /** Whether to capture the pointer on the target during a gesture. Defaults to `true`. */
    setPointerCapture?: boolean;
    /** Maximum movement (in px) for a pointer up to be recognized as a tap. Defaults to `0` (disabled). */
    tapThreshold?: number;
    /** Minimum velocity (in px/ms) for a primarily horizontal gesture to be recognized as a swipe. Defaults to `0.3`. */
    swipeVelocityThreshold?: number;
    /**
     * Predicate evaluated on pointer down. When it returns `false` the gesture is not tracked at all,
     * so no pointer capture is taken and the native scrolling of the page is not prevented.
     * Defaults to always tracking.
     */
    canStart?: (event: PointerEvent) => boolean;
    /**
     * When provided, the listeners are attached outside of the Angular zone so that the high frequency
     * `panMove` callback does not trigger change detection. The remaining callbacks are still invoked
     * inside the Angular zone.
     */
    ngZone?: NgZone;
}

/**
 * Lightweight, zoneless pointer-based gesture manager.
 *
 * Consolidates the pan/swipe/tap recognition logic shared across components
 * (carousel, navigation drawer, list item, time picker) on top of native
 * Pointer Events. It does not require `NgZone`; consumers update their own
 * state inside the provided callbacks. An `NgZone` can optionally be supplied so
 * that the listeners are attached outside of Angular and only the discrete
 * callbacks re-enter it, keeping continuous dragging free of change detection.
 *
 * Outside of a browser environment (e.g. during server-side rendering) it is a
 * noop: no listeners are attached and no callbacks are invoked, so consumers can
 * construct it unconditionally without additional platform guards.
 *
 * @hidden
 * @internal
 *
 * @example
 * ```ts
 * this._gestures = new IgxTouchManager(this.element.nativeElement, {
 *     panMove: (e) => this.pan(e),
 *     panEnd: (e) => this.onPanEnd(e),
 *     tap: (e) => this.onTap(e)
 * }, { tapThreshold: 5 });
 * // ...
 * this._gestures.destroy();
 * ```
 */
export class IgxTouchManager {
    private _startX = 0;
    private _startY = 0;
    private _startTime = 0;
    private _tracking = false;
    private _panStarted = false;
    private _pointerId: number | null = null;
    private _startTarget: EventTarget | null = null;
    private readonly _supported: boolean;
    private readonly _pointerTypes: string[];
    private readonly _setPointerCapture: boolean;
    private readonly _tapThreshold: number;
    private readonly _swipeVelocityThreshold: number;
    private readonly _canStart: ((event: PointerEvent) => boolean) | null;
    private readonly _ngZone: NgZone | null;

    constructor(
        private target: EventTarget,
        private callbacks: IgxTouchManagerCallbacks,
        options: IgxTouchManagerOptions = {}
    ) {
        this._pointerTypes = options.pointerTypes ?? ['touch', 'pen'];
        this._setPointerCapture = options.setPointerCapture ?? true;
        this._tapThreshold = options.tapThreshold ?? 0;
        this._swipeVelocityThreshold = options.swipeVelocityThreshold ?? 0.3;
        this._canStart = options.canStart ?? null;
        this._ngZone = options.ngZone ?? null;

        // Behave as a noop outside of a browser (e.g. during server-side rendering),
        // mirroring the previous Hammer.js-based manager. Angular's platform-server
        // does not define a global `window`, so pointer events can never occur there
        // and attaching listeners would only add dead weight (or fail on partial DOMs).
        this._supported = typeof window !== 'undefined'
            && !!target
            && typeof (target as EventTarget).addEventListener === 'function';
        if (!this._supported) {
            return;
        }

        this._runOutsideAngular(() => {
            this.target.addEventListener('pointerdown', this._onPointerDown);
            this.target.addEventListener('pointermove', this._onPointerMove);
            this.target.addEventListener('pointerup', this._onPointerUp);
            this.target.addEventListener('pointercancel', this._onPointerCancel);
            // prevents the default scrolling behavior on touch devices while a gesture is tracked
            // necessary on edge pans detected on the body as the browsers cancel the pointer events
            // and trigger a scroll / rubber band effect instead of the pan
            this.target.addEventListener('touchmove', this._onTouchMove, { passive: false });
        });
    }

    /** Detaches all listeners and stops tracking. */
    public destroy(): void {
        if (!this._supported) {
            return;
        }
        this.target.removeEventListener('pointerdown', this._onPointerDown);
        this.target.removeEventListener('pointermove', this._onPointerMove);
        this.target.removeEventListener('pointerup', this._onPointerUp);
        this.target.removeEventListener('pointercancel', this._onPointerCancel);
        this.target.removeEventListener('touchmove', this._onTouchMove);
        this._tracking = false;
    }

    private _accepts(pointerType: string): boolean {
        return this._pointerTypes.includes(pointerType);
    }

    private _runOutsideAngular(fn: () => void): void {
        if (this._ngZone) {
            this._ngZone.runOutsideAngular(fn);
        } else {
            fn();
        }
    }

    /** Invokes a discrete (low frequency) callback back inside the Angular zone, when one is provided. */
    private _runInAngular(fn: () => void): void {
        if (this._ngZone) {
            this._ngZone.run(fn);
        } else {
            fn();
        }
    }

    private _createEvent(event: PointerEvent): IgxGestureEvent {
        const deltaX = event.clientX - this._startX;
        const deltaY = event.clientY - this._startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const elapsed = Date.now() - this._startTime;
        const velocity = elapsed > 0 ? distance / elapsed : 0;

        return {
            pointerType: event.pointerType,
            deltaX,
            deltaY,
            distance,
            velocity,
            center: { x: event.clientX, y: event.clientY },
            // Report the element the gesture started on. Pointer capture retargets
            // subsequent pointer events to the captured host, so `event.target` would
            // otherwise no longer reflect the pressed element (e.g. for taps).
            target: this._startTarget ?? event.target,
            originalEvent: event,
            preventDefault: () => event.preventDefault(),
            resetOrigin: () => {
                this._startX = event.clientX;
                this._startY = event.clientY;
                this._startTime = Date.now();
            }
        };
    }

    private _onPointerDown = (event: Event) => {
        if (!(event instanceof PointerEvent)) {
            return;
        }
        if (this._tracking || !this._accepts(event.pointerType) || this._canStart?.(event) === false) {
            return;
        }
        this._startX = event.clientX;
        this._startY = event.clientY;
        this._startTime = Date.now();
        this._startTarget = event.target;
        this._tracking = true;
        this._panStarted = false;
        this._pointerId = event.pointerId;

        if (this._setPointerCapture && typeof (this.target as Element).setPointerCapture === 'function') {
            try {
                (this.target as Element).setPointerCapture(event.pointerId);
            } catch {
                // `setPointerCapture` can throw a `NotFoundError` when the pointer is no longer active
                // (e.g. for synthetic events). Capturing is a best-effort enhancement, so ignore it.
            }
        }

        // Let the consumer veto the gesture (e.g. the touch did not start in an active
        // zone). Returning `false` stops tracking immediately so the `touchmove` listener
        // does not block normal scrolling and other gestures are not interfered with.
        if (this.callbacks.pointerDown) {
            const gesture = this._createEvent(event);
            this._runInAngular(() => {
                if (this.callbacks.pointerDown?.(gesture) === false) {
                    this._stopTracking(event.pointerId);
                }
            });
        }
    };

    private _onPointerMove = (event: Event) => {
        if (!(event instanceof PointerEvent)) {
            return;
        }
        if (!this._tracking || event.pointerId !== this._pointerId || !this._accepts(event.pointerType)) {
            return;
        }
        const gesture = this._createEvent(event);
        // Defer `panStart` until movement actually begins, mirroring Hammer's `panstart`.
        // A press with no movement (a tap) therefore never raises `panStart`.
        if (!this._panStarted) {
            this._panStarted = true;
            if (this.callbacks.panStart) {
                this._runInAngular(() => this.callbacks.panStart?.(gesture));
            }
        }
        // `panMove` is intentionally invoked outside of the Angular zone (when one is provided)
        // as it fires for every pointer move and running change detection for each of them
        // makes continuous dragging lag behind the pointer.
        this.callbacks.panMove?.(gesture);
    };

    private _onPointerUp = (event: Event) => {
        if (!(event instanceof PointerEvent)) {
            return;
        }
        if (!this._tracking || event.pointerId !== this._pointerId || !this._accepts(event.pointerType)) {
            return;
        }
        this._tracking = false;
        this._pointerId = null;
        const gesture = this._createEvent(event);

        this._runInAngular(() => {
            if (this.callbacks.tap && gesture.distance < this._tapThreshold) {
                this.callbacks.tap(gesture);
                return;
            }

            if (this.callbacks.swipe &&
                gesture.velocity > this._swipeVelocityThreshold &&
                Math.abs(gesture.deltaX) > Math.abs(gesture.deltaY)) {
                this.callbacks.swipe(gesture);
            }

            this.callbacks.panEnd?.(gesture);
        });
    };

    private _onPointerCancel = (event: Event) => {
        if (!(event instanceof PointerEvent)) {
            return;
        }
        if (!this._tracking || event.pointerId !== this._pointerId) {
            return;
        }
        this._tracking = false;
        this._pointerId = null;
        if (this.callbacks.panCancel) {
            const gesture = this._createEvent(event);
            this._runInAngular(() => this.callbacks.panCancel?.(gesture));
        }
    };
    
    private _onTouchMove = (event: Event) => {
        if (!(event instanceof TouchEvent)) {
            return;
        }
        // Prevent scrolling only while a gesture is actively tracked.
        if (this._tracking && event.cancelable) {
            event.preventDefault();
        }
    }

    /** Stops tracking the current gesture and best-effort releases the pointer capture. */
    private _stopTracking(pointerId: number): void {
        this._tracking = false;
        this._panStarted = false;
        this._pointerId = null;
        this._startTarget = null;

        if (this._setPointerCapture && typeof (this.target as Element).releasePointerCapture === 'function') {
            try {
                (this.target as Element).releasePointerCapture(pointerId);
            } catch {
                // `releasePointerCapture` can throw when the pointer is no longer captured.
                // Releasing is a best-effort cleanup, so ignore it.
            }
        }
    }
}
