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
import { IgxColumnResizingService } from './resizing.service';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxResizer]'
})
export class IgxColumnResizerDirective implements OnInit, OnDestroy {

    @Input()
    public restrictHResizeMin: number = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictHResizeMax = 250;

    @Output()
    public resizeEnd = new Subject<any>();

    @Output()
    public resizeStart = new Subject<any>();

    @Output()
    public resize = new Subject<any>();

    private _left;
    private _destroy = new Subject<boolean>();

    constructor(public element: ElementRef, @Inject(DOCUMENT) public document, public zone: NgZone,
    private resizingService: IgxColumnResizingService) {

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

            this.left = left < min ? min : left;

            if (left > max) {
                this.left = max;
            }
        });

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

    public set left(val) {
        requestAnimationFrame(() => this.element.nativeElement.style.left = val + 'px');
    }

    public set top(val) {
        requestAnimationFrame(() => this.element.nativeElement.style.top = val + 'px');
    }

    onMouseup(event) {
        this.resizeEnd.next(event);
        this.resizeEnd.complete();
    }

    onMousedown(event) {
        event.preventDefault();
        const parent = this.element.nativeElement.parentElement.parentElement;

        this.left = this._left = event.clientX - parent.getBoundingClientRect().left;
        this.top = event.target.getBoundingClientRect().top - parent.getBoundingClientRect().top;

        this.resizeStart.next(event);
    }

    onMousemove(event) {
        event.preventDefault();
        if (!this.resizingService._resizingCancelled) {
            this.resize.next(event);
        }
    }
}
