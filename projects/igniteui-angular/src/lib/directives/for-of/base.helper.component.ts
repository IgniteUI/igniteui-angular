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

    ngAfterViewInit() {
        this._afterViewInit = true;
    }

    @HostListener('scroll', ['$event'])
    onScroll(event) {
        this.scrollAmount = event.target.scrollTop || event.target.scrollLeft;
    }
    constructor(public elementRef: ElementRef, public cdr: ChangeDetectorRef) { }

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
}
