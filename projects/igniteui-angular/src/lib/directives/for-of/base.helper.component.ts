import {
    EventEmitter,
    Output,
    HostListener,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy,
    Directive,
    AfterViewInit
} from '@angular/core';

@Directive({
    selector: '[igxVirtualHelperBase]'
})
export class VirtualHelperBaseDirective implements OnDestroy, AfterViewInit {
    public scrollAmount = 0;

    public _size = 0;

    public destroyed;

    private _afterViewInit = false;
    private _scrollNativeSize: number;

    ngAfterViewInit() {
        this._afterViewInit = true;
    }

    @HostListener('scroll', ['$event'])
    onScroll(event) {
        this.scrollAmount = event.target.scrollTop || event.target.scrollLeft;
    }
    constructor(public elementRef: ElementRef, public cdr: ChangeDetectorRef) {
        this._scrollNativeSize = this.calculateScrollNativeSize();
     }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    public ngOnDestroy() {
        this.destroyed = true;
        this._observer.disconnect();
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
