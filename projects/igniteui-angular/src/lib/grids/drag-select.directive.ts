import { Directive, Input, Output, EventEmitter, ElementRef, OnDestroy, NgZone, OnInit } from '@angular/core';
import { interval, Observable, Subscription, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

export enum DragScrollDirection {
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


@Directive({
    selector: '[igxGridDragSelect]'
})
export class IgxGridDragSelectDirective implements OnInit, OnDestroy {
    _activeDrag: boolean;

    @Input('igxGridDragSelect')
    get activeDrag(): boolean {
        return this._activeDrag;
    }

    set activeDrag(val: boolean) {
        if (val !== this._activeDrag) {
            this.unsubscribe();
            this._activeDrag = val;
        }
    }

    @Output()
    onDragStop = new EventEmitter<boolean>();

    @Output()
    onDragScroll = new EventEmitter<DragScrollDirection>();

    get nativeElement(): HTMLElement {
        return this.ref.nativeElement;
    }

    get clientRect(): ClientRect {
        return this.nativeElement.getBoundingClientRect();
    }

    protected end$ = new Subject<any>();
    protected lastDirection = DragScrollDirection.NONE;
    protected _interval$: Observable<any>;
    protected _sub: Subscription;

    constructor(private ref: ElementRef, private zone: NgZone) {
        this._interval$ = interval(100).pipe(
            takeUntil(this.end$),
            filter(() => this.activeDrag)
        );
    }

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.addEventListener('pointerover', this.startDragSelection);
            this.nativeElement.addEventListener('pointerleave', this.stopDragSelection);
        });
    }

    ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.removeEventListener('pointerover', this.startDragSelection);
            this.nativeElement.removeEventListener('pointerleave', this.stopDragSelection);
        });
        this.unsubscribe();
        this.end$.complete();
    }


    startDragSelection = (ev: PointerEvent) => {
        if (!this.activeDrag) {
            return;
        }
        const x = ev.clientX;
        const y = ev.clientY;
        const direction = this._measureDimensions(x, y);
        if (direction === this.lastDirection) {
            return;
        }
        this.unsubscribe();
        this._sub = this._interval$.subscribe(() => this.onDragScroll.emit(direction));
        this.lastDirection = direction;
    }

    stopDragSelection = () => {
        if (!this.activeDrag) {
            return;
        }
        this.onDragStop.emit(false);
        this.unsubscribe();
        this.lastDirection = DragScrollDirection.NONE;
    }

    _measureDimensions(x: number, y: number): DragScrollDirection {
        let direction: DragScrollDirection;

        const rect = this.clientRect;
        const RATIO = 0.15;
        const offsetX = Math.trunc(x - rect.left);
        const offsetY = Math.trunc(y - rect.top);

        const left = offsetX <= rect.width * RATIO;
        const right = offsetX >= rect.width * (1 - RATIO);
        const top = offsetY <= rect.height * RATIO;
        const bottom = offsetY >= rect.height * (1 - RATIO);

        if (top && left) {
            direction = DragScrollDirection.TOPLEFT;
        } else if (top && right) {
            direction = DragScrollDirection.TOPRIGHT;
        } else if (bottom && left) {
            direction = DragScrollDirection.BOTTOMLEFT;
        } else if (bottom && right) {
            direction = DragScrollDirection.BOTTOMRIGHT;
        } else if (top) {
            direction = DragScrollDirection.TOP;
        } else if (bottom) {
            direction = DragScrollDirection.BOTTOM;
        } else if (left) {
            direction = DragScrollDirection.LEFT;
        } else if (right) {
            direction = DragScrollDirection.RIGHT;
        } else {
            direction = DragScrollDirection.NONE;
        }

        return direction;

    }

    protected unsubscribe() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
