import {
    EventEmitter,
    Output,
    HostListener,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy,
    Directive,
    AfterViewInit,
    Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import ResizeObserver from 'resize-observer-polyfill';

@Directive({
    selector: '[igxVirtualHelperBase]'
})
export class VirtualHelperBaseDirective implements OnDestroy, AfterViewInit {
    public scrollAmount = 0;

    public _size = 0;

    public destroyed;

    private _afterViewInit = false;
    private _scrollNativeSize: number;
    private _observer: ResizeObserver;
    private _detached = false;

    ngAfterViewInit() {
        this._afterViewInit = true;
    }

    @HostListener('scroll', ['$event'])
    onScroll(event) {
        this.scrollAmount = event.target.scrollTop || event.target.scrollLeft;
    }
    constructor(public elementRef: ElementRef, public cdr: ChangeDetectorRef, @Inject(DOCUMENT) public document) {
        this._scrollNativeSize = this.calculateScrollNativeSize();
        this._observer = new ResizeObserver((event) => this.handleMutations(event));
        this._observer.observe(this.nativeElement);
     }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    public ngOnDestroy() {
        this.destroyed = true;
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

    public calculateScrollNativeSize() {
        const div = document.createElement('div');
        const style = div.style;
        style.width = '100px';
        style.height = '100px';
        style.position = 'absolute';
        style.top = '-10000px';
        style.top = '-10000px';
        style.overflow = 'scroll';
        document.body.appendChild(div);
        const scrollWidth = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
        return scrollWidth ? scrollWidth + 1 : 1;
    }
}
