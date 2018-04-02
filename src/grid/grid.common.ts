import { DOCUMENT } from "@angular/common";
import { ChangeDetectorRef, Directive, ElementRef, HostListener, Inject, Input, Output, TemplateRef  } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeUntil";
import { Subject } from "rxjs/Subject";
import { IgxGridAPIService } from "./api.service";

@Directive({
    selector: "[igxResizer]"
})
export class IgxColumnResizerDirective {

    @Input()
    public restrictHDragMin: number = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictHDragMax: number = Number.MAX_SAFE_INTEGER;

    @Input()
    public dragEndTimeout = 0;

    @Output()
    public dragEnd = new Subject<any>();

    @Output()
    public dragStart = new Subject<any>();

    @Output()
    public drag = new Subject<any>();

    private _left;

    constructor(public element: ElementRef, @Inject(DOCUMENT) public document) {

        this.dragStart.map((event) => {
            return event.clientX;
        }).switchMap((offset) =>
            this.drag.map((event) => (event.clientX - offset)).takeUntil(this.dragEnd))
        .subscribe((pos) => {
            const left = this._left + pos;

            this.left = left < this.restrictHDragMin ? this.restrictHDragMin + "px" : left + "px";

            if (left > this.restrictHDragMax) {
                this.left = this.restrictHDragMax + "px";
            } else if (left > this.restrictHDragMin) {
                this.left = left + "px";
            }
        });
    }

    public set left(val) {
        this.element.nativeElement.style.left = val;
    }

    @HostListener("document:mouseup", ["$event"])
    onMouseup(event) {
        setTimeout(() => {
            this.dragEnd.next(event);
        }, this.dragEndTimeout);
    }

    @HostListener("document:mousedown", ["$event"])
    onMousedown(event) {
        this.dragStart.next(event);

        const elStyle = this.document.defaultView.getComputedStyle(this.element.nativeElement);
        this._left = Number.isNaN(parseInt(elStyle.left, 10)) ? 0 : parseInt(elStyle.left, 10);
    }

    @HostListener("document:mousemove", ["$event"])
    onMousemove(event) {
        event.preventDefault();
        this.drag.next(event);
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
