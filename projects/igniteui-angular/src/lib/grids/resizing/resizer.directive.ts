import {
    Directive,
    ElementRef,
    Inject,
    Input,
    NgZone,
    Output,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject, fromEvent, animationFrameScheduler, interval } from 'rxjs';
import { map, switchMap, takeUntil, throttle } from 'rxjs/operators';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxResizer]',
    standalone: true
})
export class IgxColumnResizerDirective implements OnInit, OnDestroy {

    @Input()
    public restrictHResizeMin: number = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictHResizeMax: number = Number.MAX_SAFE_INTEGER;

    @Input()
    public restrictResizerTop: number;

    @Output()
    public resizeEnd = new Subject<MouseEvent>();

    @Output()
    public resizeStart = new Subject<MouseEvent>();

    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public resize = new Subject<any>();

    private _left: number;
    private _ratio: number = 1;
    private _destroy = new Subject<boolean>();

    public get ratio(): number {
        return this._ratio;
    }

    constructor(
        public element: ElementRef<HTMLElement>,
        @Inject(DOCUMENT) public document,
        public zone: NgZone
    ) {

        this.resizeStart.pipe(
            takeUntil<MouseEvent>(this._destroy),
            map((event) => event.clientX),
            switchMap((offset) => this.resize
                .pipe(
                    takeUntil(this._destroy),
                    takeUntil<MouseEvent>(this.resizeEnd),
                    map((event) => (event.clientX - offset) / (this._ratio)),
                ))
        )
            .subscribe((pos) => {
                const left = this._left + pos;
                const min = this._left - this.restrictHResizeMin;
                const max = this._left + this.restrictHResizeMax;

                this.left = left < min ? min : left;

                if (left > max) {
                    this.left = max;
                }
            });

    }

    public ngOnInit() {
        this.zone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView, 'mousemove')
                .pipe(
                    takeUntil<MouseEvent>(this._destroy),
                    throttle(() => interval(0, animationFrameScheduler)),
                )
                .subscribe((res) => this.onMousemove(res));

            fromEvent(this.document.defaultView, 'mouseup')
                .pipe(takeUntil<MouseEvent>(this._destroy))
                .subscribe((res) => this.onMouseup(res));
        });
    }

    public ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.complete();
    }

    public set left(val: number) {
        requestAnimationFrame(() => this.element.nativeElement.style.left = val + 'px');
    }

    public set top(val: number) {
        if (this.restrictResizerTop != undefined) {
            requestAnimationFrame(() => this.element.nativeElement.style.top = this.restrictResizerTop + 'px');
        } else {
            requestAnimationFrame(() => this.element.nativeElement.style.top = val + 'px');
        }
    }

    public onMouseup(event: MouseEvent) {
        this.resizeEnd.next(event);
        this.resizeEnd.complete();
    }

    public onMousedown(event: MouseEvent) {
        event.preventDefault();
        const parent = this.element.nativeElement.parentElement.parentElement;
        const parentRectWidth = parent.getBoundingClientRect().width;
        const parentComputedWidth = parseFloat(window.getComputedStyle(parent).width);
        if (Math.abs(parentRectWidth - parentComputedWidth) > 1) {
            this._ratio = parentRectWidth / parentComputedWidth;
        }
        this.left = this._left = (event.clientX - parent.getBoundingClientRect().left) / this._ratio;
        this.top = (event.target as HTMLElement).getBoundingClientRect().top - parent.getBoundingClientRect().top;

        this.resizeStart.next(event);
    }

    public onMousemove(event: MouseEvent) {
        event.preventDefault();
        this.resize.next(event);
    }
}
