import { EventEmitter } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
export interface IChangeRadioEventArgs {
    value: any;
    radio: IgxRadioComponent;
}
export declare enum RadioLabelPosition {
    BEFORE = "before",
    AFTER = "after",
}
export declare class IgxRadioComponent implements ControlValueAccessor {
    nativeRadio: any;
    nativeLabel: any;
    placeholderLabel: any;
    id: string;
    labelId: string;
    labelPosition: RadioLabelPosition | string;
    value: any;
    name: string;
    tabindex: number;
    disableRipple: boolean;
    required: boolean;
    ariaLabelledBy: string;
    ariaLabel: string | null;
    readonly change: EventEmitter<IChangeRadioEventArgs>;
    cssClass: string;
    checked: boolean;
    disabled: boolean;
    focused: boolean;
    inputId: string;
    protected _value: any;
    constructor();
    private _onTouchedCallback;
    private _onChangeCallback;
    _onRadioChange(event: any): void;
    _onRadioClick(event: any): void;
    _onLabelClick(): void;
    select(): void;
    writeValue(value: any): void;
    readonly labelClass: string;
    onFocus(event: any): void;
    onBlur(event: any): void;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
}
export declare class IgxRadioModule {
}
