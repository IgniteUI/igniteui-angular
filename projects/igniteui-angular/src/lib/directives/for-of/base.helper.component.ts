import {
    HostListener,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy,
    Directive,
    AfterViewInit,
    Inject,
    NgZone
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';
import { resizeObservable, PlatformUtil } from '../../core/utils';

@Directive({
    selector: '[igxVirtualHelperBase]'
})
export class VirtualHelperBaseDirective implements OnDestroy, AfterViewInit {
    public scrollAmount = 0;
    public _size = 0;
    public destroyed;

    protected destroy$ = new Subject<any>();

    private _afterViewInit = false;
    private _scrollNativeSize: number;
    private _detached = false;

    constructor(
        public elementRef: ElementRef<HTMLElement>,
        public cdr: ChangeDetectorRef,
        protected _zone: NgZone,
        @Inject(DOCUMENT) public document: any,
        protected platformUtil: PlatformUtil,
    ) {
        this._scrollNativeSize = this.calculateScrollNativeSize();
    }

    @HostListener('scroll', ['$event'])
    public onScroll(event) {
        this.scrollAmount = event.target.scrollTop || event.target.scrollLeft;
    }


    public ngAfterViewInit() {
        this._afterViewInit = true;
        if (!this.platformUtil.isBrowser) {
            return;
        }
        const delayTime = 0;
        this._zone.runOutsideAngular(() => {
            resizeObservable(this.nativeElement).pipe(
                throttleTime(delayTime),
                takeUntil(this.destroy$)).subscribe((event) => this.handleMutations(event));
        });
    }

    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    public ngOnDestroy() {
        this.destroyed = true;
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public calculateScrollNativeSize() {
        const div = this.document.createElement('div');
        const style = div.style;
        style.width = '100px';
        style.height = '100px';
        style.position = 'absolute';
        style.top = '-10000px';
        style.top = '-10000px';
        style.overflow = 'scroll';
        this.document.body.appendChild(div);
        const scrollWidth = div.offsetWidth - div.clientWidth;
        this.document.body.removeChild(div);
        return scrollWidth ? scrollWidth + 1 : 1;
    }

    public set size(value) {
        if (this.destroyed) {
            return;
        }
        this._size = value;
        if (this._afterViewInit) {
            this.cdr.detectChanges();
        }
    }

    public get size() {
        return this._size;
    }

    public get scrollNativeSize() {
        return this._scrollNativeSize;
    }

    protected get isAttachedToDom(): boolean {
        return this.document.body.contains(this.nativeElement);
    }

    protected handleMutations(event) {
        const hasSize = !(event[0].contentRect.height === 0 && event[0].contentRect.width === 0);
        if (!hasSize && !this.isAttachedToDom) {
            // scroll bar detached from DOM
            this._detached = true;
        } else if (this._detached && hasSize && this.isAttachedToDom) {
            // attached back now.
            this.restoreScroll();
        }
    }

    protected restoreScroll() {}
}
