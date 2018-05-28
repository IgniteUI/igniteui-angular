import { ChangeDetectorRef, ElementRef, NgZone, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { Subject } from "rxjs";
import { IgxGridAPIService } from "./api.service";
export declare class IgxColumnResizerDirective implements OnInit, OnDestroy {
    element: ElementRef;
    document: any;
    zone: NgZone;
    restrictHResizeMin: number;
    restrictHResizeMax: number;
    resizeEndTimeout: number;
    resizeEnd: Subject<any>;
    resizeStart: Subject<any>;
    resize: Subject<any>;
    private _left;
    private _destroy;
    constructor(element: ElementRef, document: any, zone: NgZone);
    ngOnInit(): void;
    ngOnDestroy(): void;
    left: any;
    onMouseup(event: any): void;
    onMousedown(event: any): void;
    onMousemove(event: any): void;
}
export declare class IgxCellTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
export declare class IgxCellHeaderTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
export declare class IgxGroupByRowTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
export declare class IgxCellFooterTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
export declare class IgxCellEditorTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
export interface IGridBus {
    gridID: string;
    cdr: ChangeDetectorRef;
    gridAPI: IgxGridAPIService;
}
export declare function autoWire(markForCheck?: boolean): (target: IGridBus, name: string, descriptor: any) => any;
