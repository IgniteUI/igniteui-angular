import { ChangeDetectorRef, ElementRef, EventEmitter, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Subject } from "rxjs";
export interface IgxDropEvent {
    dragData: any;
    dropData: any;
    event: MouseEvent;
}
export declare enum RestrictDrag {
    VERTICALLY = 0,
    HORIZONTALLY = 1,
    NONE = 2,
}
export declare class IgxDragDirective {
    element: ElementRef;
    cdr: ChangeDetectorRef;
    document: any;
    restrictDrag: RestrictDrag;
    restrictHDragMin: number;
    restrictHDragMax: number;
    restrictVDragMin: number;
    restrictVDragMax: number;
    dragEnd: Subject<any>;
    dragStart: Subject<any>;
    drag: Subject<any>;
    private _left;
    private _top;
    constructor(element: ElementRef, cdr: ChangeDetectorRef, document: any);
    left: any;
    top: any;
    onMouseup(event: any): void;
    onMousedown(event: any): void;
    onMousemove(event: any): void;
}
export declare class IgxDraggableDirective implements OnInit, OnDestroy {
    private _elementRef;
    private _renderer;
    data: any;
    dragClass: string;
    effectAllowed: string;
    draggable: boolean;
    constructor(_elementRef: ElementRef, _renderer: Renderer2);
    ngOnInit(): void;
    ngOnDestroy(): void;
    protected onDragStart(event: any): void;
    protected onDragEnd(event: any): void;
}
export declare class IgxDroppableDirective {
    private _elementRef;
    private _renderer;
    data: any;
    dropClass: string;
    dropEffect: string;
    onDrop: EventEmitter<IgxDropEvent>;
    constructor(_elementRef: ElementRef, _renderer: Renderer2);
    protected onDragEnter(event: any): void;
    protected onDragLeave(event: any): void;
    protected onDragOver(event: any): boolean;
    protected onDragDrop(event: any): void;
}
export declare class IgxDragDropModule {
}
