import { ElementRef, EventEmitter, OnDestroy, OnInit } from "@angular/core";
import { IgxNavigationService, IToggleView } from "../core/navigation";
export declare class IgxDialogComponent implements IToggleView, OnInit, OnDestroy {
    private elementRef;
    private navService;
    private static NEXT_ID;
    private static readonly DIALOG_CLASS;
    id: string;
    title: string;
    message: string;
    leftButtonLabel: string;
    leftButtonType: string;
    leftButtonColor: string;
    leftButtonBackgroundColor: string;
    leftButtonRipple: string;
    rightButtonLabel: string;
    rightButtonType: string;
    rightButtonColor: string;
    rightButtonBackgroundColor: string;
    rightButtonRipple: string;
    closeOnOutsideSelect: boolean;
    onOpen: EventEmitter<IDialogEventArgs>;
    onClose: EventEmitter<IDialogEventArgs>;
    onLeftButtonSelect: EventEmitter<IDialogEventArgs>;
    onRightButtonSelect: EventEmitter<IDialogEventArgs>;
    readonly element: any;
    tabindex: number;
    private _isOpen;
    private _titleId;
    private _state;
    readonly state: string;
    readonly isOpen: boolean;
    readonly role: string;
    readonly titleId: string;
    constructor(elementRef: ElementRef, navService: IgxNavigationService);
    open(): void;
    close(): void;
    toggle(): void;
    onDialogSelected(event: any): void;
    onInternalLeftButtonSelect(event: any): void;
    onInternalRightButtonSelect(event: any): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    private toggleState(state);
}
export interface IDialogEventArgs {
    dialog: IgxDialogComponent;
    event: Event;
}
export declare class IgxDialogModule {
}
