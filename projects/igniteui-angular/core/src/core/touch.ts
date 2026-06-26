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
    target: EventTarget;
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
    /** Fired on pointer down once the pointer type passes the configured filter. */
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
}

/**
 * Lightweight, zoneless pointer-based gesture manager.
 *
 * Consolidates the pan/swipe/tap recognition logic shared across components
 * (carousel, navigation drawer, list item, time picker) on top of native
 * Pointer Events. It does not depend on `NgZone`; consumers update their own
 * state inside the provided callbacks.
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
    private readonly _pointerTypes: string[];
    private readonly _setPointerCapture: boolean;
    private readonly _tapThreshold: number;
    private readonly _swipeVelocityThreshold: number;

    constructor(
        private target: EventTarget,
        private callbacks: IgxTouchManagerCallbacks,
        options: IgxTouchManagerOptions = {}
    ) {
        this._pointerTypes = options.pointerTypes ?? ['touch', 'pen'];
        this._setPointerCapture = options.setPointerCapture ?? true;
        this._tapThreshold = options.tapThreshold ?? 0;
        this._swipeVelocityThreshold = options.swipeVelocityThreshold ?? 0.3;

        this.target.addEventListener('pointerdown', this._onPointerDown);
        this.target.addEventListener('pointermove', this._onPointerMove);
        this.target.addEventListener('pointerup', this._onPointerUp);
        this.target.addEventListener('pointercancel', this._onPointerCancel);
    }

    /** Detaches all listeners and stops tracking. */
    public destroy(): void {
        this.target.removeEventListener('pointerdown', this._onPointerDown);
        this.target.removeEventListener('pointermove', this._onPointerMove);
        this.target.removeEventListener('pointerup', this._onPointerUp);
        this.target.removeEventListener('pointercancel', this._onPointerCancel);
        this._tracking = false;
    }

    private _accepts(pointerType: string): boolean {
        return this._pointerTypes.includes(pointerType);
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
            target: event.target,
            originalEvent: event,
            preventDefault: () => event.preventDefault(),
            resetOrigin: () => {
                this._startX = event.clientX;
                this._startY = event.clientY;
                this._startTime = Date.now();
            }
        };
    }

    private _onPointerDown = (event: PointerEvent) => {
        if (!this._accepts(event.pointerType)) {
            return;
        }
        this._startX = event.clientX;
        this._startY = event.clientY;
        this._startTime = Date.now();
        this._tracking = true;

        if (this._setPointerCapture && typeof (this.target as Element).setPointerCapture === 'function') {
            try {
                (this.target as Element).setPointerCapture(event.pointerId);
            } catch {
                // `setPointerCapture` can throw a `NotFoundError` when the pointer is no longer active
                // (e.g. for synthetic events). Capturing is a best-effort enhancement, so ignore it.
            }
        }

        this.callbacks.panStart?.(this._createEvent(event));
    };

    private _onPointerMove = (event: PointerEvent) => {
        if (!this._tracking || !this._accepts(event.pointerType)) {
            return;
        }
        this.callbacks.panMove?.(this._createEvent(event));
    };

    private _onPointerUp = (event: PointerEvent) => {
        if (!this._tracking || !this._accepts(event.pointerType)) {
            return;
        }
        this._tracking = false;
        const gesture = this._createEvent(event);

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
    };

    private _onPointerCancel = (event: PointerEvent) => {
        if (!this._tracking) {
            return;
        }
        this._tracking = false;
        this.callbacks.panCancel?.(this._createEvent(event));
    };
}
