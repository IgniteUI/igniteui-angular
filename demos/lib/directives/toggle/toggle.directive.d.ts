import { AnimationBuilder } from "@angular/animations";
import { ChangeDetectorRef, ElementRef, EventEmitter, OnDestroy, OnInit } from "@angular/core";
import { IgxNavigationService, IToggleView } from "../../core/navigation";
export declare class IgxToggleDirective implements IToggleView, OnInit, OnDestroy {
    private elementRef;
    private builder;
    private cdr;
    private navigationService;
    onOpen: EventEmitter<{}>;
    onClose: EventEmitter<{}>;
    collapsed: boolean;
    id: string;
    readonly element: any;
    readonly hiddenClass: boolean;
    readonly defaultClass: boolean;
    private _id;
    constructor(elementRef: ElementRef, builder: AnimationBuilder, cdr: ChangeDetectorRef, navigationService: IgxNavigationService);
    open(fireEvents?: boolean, handler?: any): void;
    close(fireEvents?: boolean, handler?: any): void;
    toggle(fireEvents?: boolean): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    private animationActivation();
    private openingAnimation();
    private closingAnimation();
}
export declare class IgxToggleActionDirective implements OnDestroy, OnInit {
    private element;
    private navigationService;
    closeOnOutsideClick: boolean;
    target: any;
    private _handler;
    private _target;
    constructor(element: ElementRef, navigationService: IgxNavigationService);
    ngOnDestroy(): void;
    ngOnInit(): void;
    onClick(): void;
}
export declare class IgxToggleModule {
}
