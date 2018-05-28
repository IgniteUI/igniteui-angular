import { EventEmitter, Provider } from "@angular/core";
import { CheckboxRequiredValidator, ControlValueAccessor } from "@angular/forms";
export declare enum SwitchLabelPosition {
    BEFORE = "before",
    AFTER = "after",
}
export interface IChangeSwitchEventArgs {
    checked: boolean;
    switch: IgxSwitchComponent;
}
export declare class IgxSwitchComponent implements ControlValueAccessor {
    protected _value: any;
    nativeCheckbox: any;
    nativeLabel: any;
    placeholderLabel: any;
    id: string;
    labelId: string;
    value: any;
    name: string;
    tabindex: number;
    labelPosition: SwitchLabelPosition | string;
    disableRipple: boolean;
    required: boolean;
    ariaLabelledBy: string;
    ariaLabel: string | null;
    readonly change: EventEmitter<IChangeSwitchEventArgs>;
    private _onTouchedCallback;
    private _onChangeCallback;
    cssClass: string;
    checked: boolean;
    disabled: boolean;
    focused: boolean;
    inputId: string;
    toggle(): void;
    _onSwitchChange(event: any): void;
    _onSwitchClick(event: any): void;
    _onLabelClick(event: any): void;
    onFocus(event: any): void;
    onBlur(event: any): void;
    writeValue(value: any): void;
    readonly labelClass: string;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
}
export declare const IGX_SWITCH_REQUIRED_VALIDATOR: Provider;
export declare class IgxSwitchRequiredDirective extends CheckboxRequiredValidator {
}
export declare class IgxSwitchModule {
}
