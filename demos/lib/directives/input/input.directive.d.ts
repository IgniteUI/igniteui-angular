import { AfterViewInit, ChangeDetectorRef, ElementRef, OnDestroy } from "@angular/core";
import { NgModel } from "@angular/forms";
import { IgxInputGroupComponent } from "../../main";
export declare enum IgxInputState {
    INITIAL = 0,
    VALID = 1,
    INVALID = 2,
}
export declare class IgxInputDirective implements AfterViewInit, OnDestroy {
    inputGroup: IgxInputGroupComponent;
    protected ngModel: NgModel;
    protected element: ElementRef;
    protected cdr: ChangeDetectorRef;
    private _valid;
    private _statusChanges$;
    constructor(inputGroup: IgxInputGroupComponent, ngModel: NgModel, element: ElementRef, cdr: ChangeDetectorRef);
    value: any;
    disabled: boolean;
    isInput: boolean;
    isTextArea: boolean;
    onFocus(event: any): void;
    onBlur(event: any): void;
    onInput(event: any): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    focus(): void;
    readonly nativeElement: any;
    protected onStatusChanged(status: string): void;
    readonly required: any;
    readonly hasPlaceholder: any;
    readonly placeholder: any;
    private _hasValidators();
    readonly focused: boolean;
    valid: IgxInputState;
}
