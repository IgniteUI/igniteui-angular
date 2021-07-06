import { Directive, Input, Output, EventEmitter, ElementRef, OnDestroy, NgZone, OnInit } from '@angular/core';
import { interval, Observable, Subscription, Subject, animationFrameScheduler } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

enum DragScrollDirection {
    NONE,
    LEFT,
    TOP,
    RIGHT,
    BOTTOM,
    TOPLEFT,
    TOPRIGHT,
    BOTTOMLEFT,
    BOTTOMRIGHT
}

/**
 * An internal directive encapsulating the drag scroll behavior in the grid.
 *
 * @hidden @internal
 */
@Directive({ selector: '[igxGridDragSelect]' })
export class IgxGridDragSelectDirective implements OnInit, OnDestroy {

    @Output()
    public dragStop = new EventEmitter<boolean>();

    @Output()
    public dragScroll = new EventEmitter<{ left: number; top: number }>();

    @Input('igxGridDragSelect')
    public get activeDrag(): boolean {
        return this._activeDrag;
    }

    public set activeDrag(val: boolean) {
        if (val !== this._activeDrag) {
            this.unsubscribe();
            this._activeDrag = val;
        }
    }

    public get nativeElement() {
        return this.ref.nativeElement;
    }

    protected end$ = new Subject<any>();
    protected lastDirection = DragScrollDirection.NONE;
    protected _interval$: Observable<any>;
    protected _sub: Subscription;

    private _activeDrag: boolean;

    constructor(private ref: ElementRef<HTMLElement>, private zone: NgZone) {
        this._interval$ = interval(0, animationFrameScheduler).pipe(
            takeUntil(this.end$),
            filter(() => this.activeDrag)
        );
    }

    public ngOnInit() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.addEventListener('pointerover', this.startDragSelection);
            this.nativeElement.addEventListener('pointerleave', this.stopDragSelection);
        });
    }

    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.removeEventListener('pointerover', this.startDragSelection);
            this.nativeElement.removeEventListener('pointerleave', this.stopDragSelection);
        });
        this.unsubscribe();
        this.end$.complete();
    }


    protected startDragSelection = (ev: PointerEvent) => {
        if (!this.activeDrag) {
            return;
        }

        const x = ev.clientX;
        const y = ev.clientY;
        const { direction, delta } = this._measureDimensions(x, y);

        if (direction === this.lastDirection) {
            return;
        }

        this.unsubscribe();
        this._sub = this._interval$.subscribe(() => this.dragScroll.emit(delta));
        this.lastDirection = direction;
    };

    protected stopDragSelection = () => {
        if (!this.activeDrag) {
            return;
        }

        this.dragStop.emit(false);
        this.unsubscribe();
        this.lastDirection = DragScrollDirection.NONE;
    };

    protected _measureDimensions(x: number, y: number): { direction: DragScrollDirection; delta: { left: number; top: number } } {
        let direction: DragScrollDirection;
        let delta = { left: 0, top: 0 };
        const { left, top, width, height } = this.nativeElement.getBoundingClientRect();
        const RATIO = 0.15;

        const offsetX = Math.trunc(x - left);
        const offsetY = Math.trunc(y - top);

        const leftDirection = offsetX <= width * RATIO;
        const rightDirection = offsetX >= width * (1 - RATIO);
        const topDirection = offsetY <= height * RATIO;
        const bottomDirection = offsetY >= height * (1 - RATIO);

        if (topDirection && leftDirection) {
            direction = DragScrollDirection.TOPLEFT;
            delta = { left: -1, top: -1 };
        } else if (topDirection && rightDirection) {
            direction = DragScrollDirection.TOPRIGHT;
            delta = { left: 1, top: -1 };
        } else if (bottomDirection && leftDirection) {
            direction = DragScrollDirection.BOTTOMLEFT;
            delta = { left: -1, top: 1 };
        } else if (bottomDirection && rightDirection) {
            direction = DragScrollDirection.BOTTOMRIGHT;
            delta = { top: 1, left: 1 };
        } else if (topDirection) {
            direction = DragScrollDirection.TOP;
            delta.top = -1;
        } else if (bottomDirection) {
            direction = DragScrollDirection.BOTTOM;
            delta.top = 1;
        } else if (leftDirection) {
            direction = DragScrollDirection.LEFT;
            delta.left = -1;
        } else if (rightDirection) {
            direction = DragScrollDirection.RIGHT;
            delta.left = 1;
        } else {
            direction = DragScrollDirection.NONE;
        }

        return { direction, delta };

    }

    protected unsubscribe() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
