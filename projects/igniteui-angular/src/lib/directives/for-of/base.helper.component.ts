import {
    EventEmitter,
    Output,
    HostListener,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy
} from '@angular/core';

export abstract class VirtualHelperBase implements OnDestroy {
    @Output()
    public onScrollEvent = new EventEmitter<Event>();

    public scrollAmount = 0;

    public _size = 0;

    public destroyed;

    @HostListener('scroll', ['$event'])
    onScroll(event) {
        this.scrollAmount = event.target.scrollTop || event.target.scrollLeft;
        this.onScrollEvent.emit(event);
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
        this.cdr.detectChanges();
    }

    public get size() {
        return this._size;
    }
}
