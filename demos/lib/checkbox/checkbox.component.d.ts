import { EventEmitter, Provider } from "@angular/core";
import { CheckboxRequiredValidator, ControlValueAccessor } from "@angular/forms";
export declare enum LabelPosition {
    BEFORE = "before",
    AFTER = "after",
}
export interface IChangeCheckboxEventArgs {
    checked: boolean;
    checkbox: IgxCheckboxComponent;
}
export declare class IgxCheckboxComponent implements ControlValueAccessor {
    protected _value: any;
    nativeCheckbox: any;
    nativeLabel: any;
    placeholderLabel: any;
    id: string;
    labelId: string;
    value: any;
    name: string;
    tabindex: number;
    labelPosition: LabelPosition | string;
    disableRipple: boolean;
    required: boolean;
    ariaLabelledBy: string;
    ariaLabel: string | null;
    readonly change: EventEmitter<IChangeCheckboxEventArgs>;
    cssClass: string;
    focused: boolean;
    indeterminate: boolean;
    checked: boolean;
    disabled: boolean;
    inputId: string;
    private _onTouchedCallback;
    private _onChangeCallback;
    toggle(): void;
    _onCheckboxChange(event: any): void;
    _onCheckboxClick(event: any): void;
    _onLabelClick(event: any): void;
    onFocus(event: any): void;
    onBlur(event: any): void;
    writeValue(value: any): void;
    readonly labelClass: string;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
}
export declare const IGX_CHECKBOX_REQUIRED_VALIDATOR: Provider;
export declare class IgxCheckboxRequiredDirective extends CheckboxRequiredValidator {
}
export declare class IgxCheckboxModule {
}
