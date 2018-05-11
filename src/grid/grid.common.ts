import { DOCUMENT } from "@angular/common";
import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    HostListener,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef
} from "@angular/core";
import { animationFrameScheduler, fromEvent, interval, Observable, Subject } from "rxjs";
import { map, switchMap, takeUntil, throttle } from "rxjs/operators";
import { IgxGridAPIService } from "./api.service";

@Directive({
    selector: "[igxResizer]"
})
export class IgxColumnResizerDirective implements OnInit, OnDestroy {

    @Input()
    public restrictHResizeMin: number = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictHResizeMax: number = Number.MAX_SAFE_INTEGER;

    @Input()
    public resizeEndTimeout = 0;

    @Output()
    public resizeEnd = new Subject<any>();

    @Output()
    public resizeStart = new Subject<any>();

    @Output()
    public resize = new Subject<any>();

    private _left;
    private _destroy = new Subject<boolean>();

    constructor(public element: ElementRef, @Inject(DOCUMENT) public document, public zone: NgZone) {

        this.resizeStart.pipe(
            map((event) => event.clientX),
            takeUntil(this._destroy),
            switchMap((offset) => this.resize.pipe(
                map((event) => event.clientX - offset),
                takeUntil(this.resizeEnd)
            ))
        ).subscribe((pos) => {
            const left = this._left + pos;

            this.left = left < this.restrictHResizeMin ? this.restrictHResizeMin + "px" : left + "px";

            if (left > this.restrictHResizeMax) {
                this.left = this.restrictHResizeMax + "px";
            } else if (left > this.restrictHResizeMin) {
                this.left = left + "px";
            }
        });

    }

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView, "mousedown").pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onMousedown(res));

            fromEvent(this.document.defaultView, "mousemove").pipe(
                takeUntil(this._destroy),
                throttle(() => interval(0, animationFrameScheduler))
            ).subscribe((res) => this.onMousemove(res));

            fromEvent(this.document.defaultView, "mouseup").pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onMouseup(res));
        });
    }

    ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.unsubscribe();
    }

    public set left(val) {
        requestAnimationFrame(() => this.element.nativeElement.style.left = val);
    }

    onMouseup(event) {
        setTimeout(() => {
            this.resizeEnd.next(event);
            this.resizeEnd.complete();
        }, this.resizeEndTimeout);
    }

    onMousedown(event) {
        this.resizeStart.next(event);
        event.preventDefault();

        const elStyle = this.document.defaultView.getComputedStyle(this.element.nativeElement);
        this._left = Number.isNaN(parseInt(elStyle.left, 10)) ? 0 : parseInt(elStyle.left, 10);
    }

    onMousemove(event) {
        this.resize.next(event);
        event.preventDefault();
    }
}

@Directive({
    selector: "[igxCell]"
})
export class IgxCellTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: "[igxHeader]"
})
export class IgxCellHeaderTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

}

@Directive({
    selector: "[igxFooter]"
})
export class IgxCellFooterTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: "[igxCellEditor]"
})
export class IgxCellEditorTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

export interface IGridBus {
    gridID: string;
    cdr: ChangeDetectorRef;
    gridAPI: IgxGridAPIService;
}

/**
 * Decorates a setter or a method of a component implementing the IGridBus
 * interface triggering change detection in the parent grid when it is called.
 * If `markForCheck` is set to true it will also mark for check the instance
 * containing the setter/method.
 */
export function autoWire(markForCheck = false) {
    return function decorator(target: IGridBus, name: string, descriptor: any) {
        const old = descriptor.value || descriptor.set;

        const wrapped = function(...args) {
            const result = old.apply(this, args);
            if (markForCheck) {
                this.cdr.markForCheck();
            }
            this.gridAPI.notify(this.gridID);
            return result;
        };

        if (descriptor.set) {
            descriptor.set = wrapped;
        } else if (descriptor.value) {
            descriptor.value = wrapped;
        } else {
            throw Error("Can bind only to setter properties and methods");
        }

        return descriptor;
    };
}
