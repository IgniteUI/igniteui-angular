import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef  } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/takeUntil";
import { Observable } from "rxjs/Observable";
import { IgxGridAPIService } from "./api.service";

@Directive({
    selector: "[igxDrag]"
})
export class IgxDragDirective implements OnInit {

    @Output()
    public dragEnd = new EventEmitter<any>();

    @Output()
    public dragStart = new EventEmitter<any>();

    @Output()
    public drag = new EventEmitter<any>();

    private _mousedrag: Observable<number>;

    constructor(public element: ElementRef) {
        this._mousedrag = this.dragStart.map((event) => {
            return event.clientX - this.element.nativeElement.getBoundingClientRect().left;
        }).flatMap((offset) =>
            this.drag.map((event) => (event.clientX - offset)).takeUntil(this.dragEnd)
        );
    }

    ngOnInit() {
        this._mousedrag.subscribe({ next: (pos) =>
            this.element.nativeElement.style.left = pos + "px"
        });
    }

    @HostListener("document:mouseup", ["$event"])
    onMouseup(event) {
        this.dragEnd.emit(event);
    }

    @HostListener("document:mousedown", ["$event"])
    onMousedown(event) {
        this.dragStart.emit(event);
    }

    @HostListener("document:mousemove", ["$event"])
    onMousemove(event) {
        event.preventDefault();
        this.drag.emit(event);
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
