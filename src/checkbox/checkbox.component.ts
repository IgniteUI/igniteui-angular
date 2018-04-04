import {
    Component,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    Output,
    ViewChild
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";

export enum LabelPosition {
    BEFORE = "before",
    AFTER = "after"
}

export interface IChangeCheckboxEventArgs {
    checked: boolean;
    checkbox: IgxCheckboxComponent;
}

const noop = () => { };
let nextId = 0;
/**
 * **Ignite UI for Angular Checkbox**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox.html)
 * The Ignite UI Checkbox is a selection control that allows users to make a binary choice. It behaves similarly
 * to the native browser checkbox.
 *
 * Example:
 * ```html
 * <igx-checkbox checked="true">
 *   simple checkbox
 * </igx-checkbox>
 * ```
 */
@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxCheckboxComponent, multi: true }],
    selector: "igx-checkbox",
    preserveWhitespaces: false,
    templateUrl: "checkbox.component.html"
})
export class IgxCheckboxComponent implements ControlValueAccessor {
    public focused = false;
    protected _value: any;

    @ViewChild("checkbox") public nativeCheckbox;
    @ViewChild("label") public nativeLabel;
    @ViewChild("placeholderLabel") public placeholderLabel;

    @Input() public id = `igx-checkbox-${nextId++}`;
    @Input() public labelId = `${this.id}-label`;
    @Input() public value: any;
    @Input() public name: string;
    @Input() public tabindex: number = null;
    @Input() public labelPosition: LabelPosition | string = LabelPosition.AFTER;
    @Input() public disableRipple = false;

    @Input("aria-labelledby")
    public ariaLabelledBy = this.labelId;

    @Input("aria-label")
    public ariaLabel: string | null = null;

    @Output()
    readonly change: EventEmitter<IChangeCheckboxEventArgs> = new EventEmitter<IChangeCheckboxEventArgs>();

    @HostBinding("class.igx-checkbox")
    public cssClass = "igx-checkbox";

    @HostBinding("class.igx-checkbox--indeterminate")
    @Input() public indeterminate = false;

    @HostBinding("class.igx-checkbox--checked")
    @Input() public checked = false;

    @HostBinding("class.igx-checkbox--disabled")
    @Input() public disabled = false;

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    public toggle() {
        if (this.disabled) {
            return;
        }

        this.indeterminate = false;
        this.checked = !this.checked;

        this.change.emit({ checked: this.checked, checkbox: this });
        this._onChangeCallback(this.checked);
    }

    public _onCheckboxChange(event) {
        // We have to stop the original checkbox change event
        // from bubbling up since we emit our own change event
        event.stopPropagation();
    }

    public _onCheckboxClick(event) {
        // Since the original checkbox is hidden and the label
        // is used for styling and to change the checked state of the checkbox,
        // we need to prevent the checkbox click event from bubbling up
        // as it gets triggered on label click
        event.stopPropagation();
        this.toggle();
    }

    public _onLabelClick(event) {
        // We use a span element as a placeholder label
        // in place of the native label, we need to emit
        // the change event separately here alongside
        // the click event emitted on click
        this.toggle();
    }

    public onFocus(event) {
        this.focused = true;
    }

    public onBlur(event) {
        this.focused = false;
        this._onTouchedCallback();
    }

    public writeValue(value) {
        this._value = value;
        this.checked = !!this._value;
    }

    public get labelClass(): string {
        switch (this.labelPosition) {
            case LabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case LabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
    }

    public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}

@NgModule({
    declarations: [IgxCheckboxComponent],
    exports: [IgxCheckboxComponent],
    imports: [IgxRippleModule]
})
export class IgxCheckboxModule { }
