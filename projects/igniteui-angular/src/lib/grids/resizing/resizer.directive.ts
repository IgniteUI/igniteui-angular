import {
    Directive,
    ElementRef,
    Inject,
    Input,
    HostBinding,
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
    selector: '[igxResizer]'
})
export class IgxColumnResizerDirective implements OnInit, OnDestroy {

    @Input()
    public restrictHResizeMin = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictHResizeMax = Number.MAX_SAFE_INTEGER;

    @Output()
    public resizeEnd = new Subject<any>();

    @Output()
    public resizeStart = new Subject<any>();

    @Output()
    public resize = new Subject<any>();

    private _left: number;
    private _top: number;
    private _destroy = new Subject<boolean>();

    constructor(
        private element: ElementRef<HTMLElement>,
        @Inject(DOCUMENT) private document: Document,
        private zone: NgZone) {

        this.resizeStart.pipe(
            map((event) => event.clientX),
            takeUntil(this._destroy),
            switchMap((offset) => this.resize.pipe(
                map((event) => event.clientX - offset),
                takeUntil(this.resizeEnd),
                takeUntil(this._destroy)
            ))
        ).subscribe((pos) => {

            const left = this._left + pos;

            const min = this._left - this.restrictHResizeMin;
            const max = this._left + this.restrictHResizeMax;

            this._left = left < min ? min : left;

            if (left > max) {
                this._left = max;
            }
        });

    }

    @HostBinding('style.left.px')
    get left() {
        return this._left;
    }

    @HostBinding('style.top.px')
    get top() {
        return this._top;
    }

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView, 'mousemove').pipe(
                throttle(() => interval(0, animationFrameScheduler)),
                takeUntil(this._destroy)
            ).subscribe((res) => this.onMousemove(res));

            fromEvent(this.document.defaultView, 'mouseup').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onMouseup(res));
        });
    }

    ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.complete();
    }

    // public set left(val: number) {
    //     requestAnimationFrame(() => this.element.nativeElement.style.left = `${val}px`);
    // }

    // public set top(val: number) {
    //     requestAnimationFrame(() => this.element.nativeElement.style.top = `${val}px`);
    // }

    onMouseup(event) {
        this.resizeEnd.next(event);
        this.resizeEnd.complete();
    }

    onMousedown(event) {
        event.preventDefault();
        const parent = this.element.nativeElement.parentElement.parentElement;

        this._left = this._left = event.clientX - parent.getBoundingClientRect().left;
        this._top = event.target.getBoundingClientRect().top - parent.getBoundingClientRect().top;

        this.resizeStart.next(event);
    }

    onMousemove(event) {
        event.preventDefault();
        this.resize.next(event);
    }
}
