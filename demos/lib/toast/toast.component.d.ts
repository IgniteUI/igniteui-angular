import { ElementRef, EventEmitter, OnDestroy, OnInit } from "@angular/core";
import { IgxNavigationService, IToggleView } from "../core/navigation";
export declare class IgxToastComponent implements IToggleView, OnInit, OnDestroy {
    private elementRef;
    private navService;
    readonly CSS_CLASSES: {
        IGX_TOAST_BOTTOM: string;
        IGX_TOAST_MIDDLE: string;
        IGX_TOAST_TOP: string;
    };
    id: string;
    onShowing: EventEmitter<IgxToastComponent>;
    onShown: EventEmitter<IgxToastComponent>;
    onHiding: EventEmitter<IgxToastComponent>;
    onHidden: EventEmitter<IgxToastComponent>;
    role: string;
    autoHide: boolean;
    displayTime: number;
    isVisible: boolean;
    message: string;
    position: IgxToastPosition;
    readonly element: any;
    private timeoutId;
    constructor(elementRef: ElementRef, navService: IgxNavigationService);
    show(): void;
    hide(): void;
    open(): void;
    close(): void;
    toggle(): void;
    mapPositionToClassName(): any;
    ngOnInit(): void;
    ngOnDestroy(): void;
}
export declare enum IgxToastPosition {
    Bottom = 0,
    Middle = 1,
    Top = 2,
}
export declare class IgxToastModule {
}
