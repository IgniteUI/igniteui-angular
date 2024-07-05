import {
    Directive,
    ElementRef,
    Input,
    NgZone,
    Output,
    OnInit,
    inject,
    DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { Subject, fromEvent } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxResizer]',
    standalone: true
})
export class IgxColumnResizerDirective implements OnInit {

    private _ref: ElementRef<HTMLElement> = inject(ElementRef);
    private document = inject(DOCUMENT);
    private zone = inject(NgZone);
    private destroyRef = inject(DestroyRef);

    private _left: number;

    protected get element() {
        return this._ref.nativeElement;
    }

    @Input()
    public restrictHResizeMin: number = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictHResizeMax: number = Number.MAX_SAFE_INTEGER;

    @Input()
    public restrictResizerTop: number;

    @Output()
    public resizeEnd = new Subject<PointerEvent>();

    @Output()
    public resizeStart = new Subject<PointerEvent>();

    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public resize = new Subject<PointerEvent>();

    constructor() {
        this.resizeStart.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((event) => event.clientX),
            switchMap((offset) => this.resize
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    takeUntil<PointerEvent>(this.resizeEnd),
                    map((event) => event.clientX - offset),
                ))
        )
            .subscribe((pos) => this.setMaxLeft(pos))
    }

    private setMaxLeft(value: number) {
        const left = this._left + value;
        const minLeft = this._left - this.restrictHResizeMin;
        const maxLeft = this._left + this.restrictHResizeMax;

        this.setLeft(Math.max(minLeft, Math.min(left, maxLeft)))
    }

    public ngOnInit() {
        this.zone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView, 'pointermove')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event: PointerEvent) => this.onPointerMove(event));

            fromEvent(this.document.defaultView, 'pointerup')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event: PointerEvent) => this.onPointerUp(event));
        });
    }

    protected setLeft(value: number) {
        requestAnimationFrame(() => Object.assign(this.element.style, { left: `${value}px` }));
    }

    protected setTop(value: number) {
        const top = this.restrictResizerTop ?? value;
        requestAnimationFrame(() => Object.assign(this.element.style, { top: `${top}px` }));
    }

    protected onPointerUp(event: PointerEvent) {
        this.resizeEnd.next(event);
        this.resizeEnd.complete();
    }

    protected onPointerDown(event: PointerEvent) {
        event.preventDefault();
        const parent = this.element.parentElement.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const targetRect = (event.target as Element).getBoundingClientRect();

        const left = event.clientX - parentRect.left;

        this._left = left;
        this.setLeft(left);
        this.setTop(targetRect.top - parentRect.top);

        this.resizeStart.next(event);
    }

    protected onPointerMove(event: PointerEvent) {
        this.resize.next(event);
    }
}
