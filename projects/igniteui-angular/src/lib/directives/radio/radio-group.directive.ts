import { Directive, NgModule, Input, QueryList, Output, EventEmitter, AfterContentInit, ContentChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxRadioComponent, RadioLabelPosition, IChangeRadioEventArgs } from '../../radio/radio.component';
import { IgxRippleModule } from '../ripple/ripple.directive';

const noop = () => { };
let nextId = 0;

@Directive({
    selector: 'igx-radiogroup, [igxRadioGroup]',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxRadioGroupDirective, multi: true }]
})
export class IgxRadioGroupDirective implements AfterContentInit, ControlValueAccessor {
    /**
     * @hidden
     */
    @ContentChildren(IgxRadioComponent) public radioButtons: QueryList<IgxRadioComponent>;

    /**
     * Sets/gets the `value` attribute.
     * ```html
     * <igx-radio [value] = "'radioButtonValue'"></igx-radio>
     * ```
     * ```typescript
     * let value =  this.radio.value;
     * ```
     * @memberof IgxRadioComponent
     */
    @Input()
    get value(): any { return this._value; }
    set value(newValue: any) {
        if (this._value !== newValue) {
            this._value = newValue;
            this._selectRadioButton();
        }
    }

    /**
     * Sets/gets the `name` attribute of the radio component.
     * ```html
     * <igx-radio name = "Radio1"></igx-radio>
     *  ```
     * ```typescript
     * let name =  this.radio.name;
     * ```
     * @memberof IgxRadioComponent
     */
    @Input()
    get name(): string { return this._name; }
    set name(newValue: string) {
        if (this._name !== newValue) {
            this._name = newValue;
            this._setRadioButtonNames();
        }
    }

    /**
     * Sets/gets whether the radio button is required.
     * If not set, `required` will have value `false`.
     * ```html
     * <igx-radio [required] = "true"></igx-radio>
     * ```
     * ```typescript
     * let isRequired =  this.radio.required;
     * ```
     * @memberof IgxRadioComponent
     */
    @Input()
    get required(): boolean { return this._required; }
    set required(newValue: boolean) {
        if (this._required !== newValue) {
            this._required = newValue;
            this._setRadioButtonsRequired();
        }
    }

    /**
     * An @Input property that allows you to disable the `igx-radiogroup` component. By default it's false.
     * ```html
     * <igx-buttongroup [disabled]="true" [multiSelection]="multi" [values]="fontOptions"></igx-buttongroup>
     * ```
     */
    @Input()
    get disabled(): boolean { return this._disabled; }
    set disabled(newValue: boolean) {
        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this._disableRadioButtons();
        }
    }

    /**
     * Sets/gets the position of the `label` in the radio component.
     * If not set, `labelPosition` will have value `"after"`.
     * ```html
     * <igx-radio labelPosition = "before"></igx-radio>
     * ```
     * ```typescript
     * let labelPosition =  this.radio.labelPosition;
     * ```
     * @memberof IgxRadioComponent
     */
    @Input()
    get labelPosition(): RadioLabelPosition | string { return this._labelPosition; }
    set labelPosition(newValue: RadioLabelPosition | string) {
        if (this._labelPosition !== newValue) {
            this._labelPosition = newValue === RadioLabelPosition.BEFORE ? RadioLabelPosition.BEFORE : RadioLabelPosition.AFTER;
            this._setRadioButtonLabelPosition();
        }
    }

    @Input()
    get selected() { return this._selected; }
    set selected(selected: IgxRadioComponent | null) {
        if (this._selected !== selected) {
            this._selected = selected;
            this.value = selected ? selected.value : null;
        }
    }

    /**
     * An event that is emitted after the radio `value` is changed.
     * Provides references to the `IgxRadioComponent` and the `value` property as event arguments.
     * @memberof IgxRadioComponent
     */
    @Output()
    readonly change: EventEmitter<IChangeRadioEventArgs> = new EventEmitter<IChangeRadioEventArgs>();

    /**
     *@hidden
     */
    private _onTouchedCallback: () => void = noop;
    /**
     *@hidden
     */
    private _onChangeCallback: (_: any) => void = noop;
    /**
     *@hidden
     */
    private _name: string = `igx-radio-group-${nextId++}`;
    /**
     *@hidden
     */
    private _value: any = null;
    /**
     *@hidden
     */
    private _selected: IgxRadioComponent | null = null;
    /**
     *@hidden
     */
    private _isInitialized: boolean = false;
    /**
     *@hidden
     */
    private _labelPosition: RadioLabelPosition | string = 'after';
    /**
     *@hidden
     */
    private _disabled: boolean = false;
    /**
     *@hidden
     */
    private _required: boolean = false;

    ngAfterContentInit() {
        // The initial value can possibly be set by NgModel and it is possible that the OnInit of the NgModel occurs after the OnInit of this class.
        this._isInitialized = true;

        setTimeout(() => { this._initRadioButtons(); });
    }

    /**
     * Checks whether the provided value is consistent to the current radio button.
     * If it is, the checked attribute will have value `true`;
     * ```typescript
     * this.radio.writeValue('radioButtonValue');
     * ```
     */
    public writeValue(value: any) {
        // this._value = value;
        // this.checked = (this._value === this.value);
    }

    /**
     *@hidden
     */
    public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }

    /**
     *@hidden
     */
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    private _initRadioButtons() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.name = this._name;
                button.labelPosition = this._labelPosition;
                button.disabled = this._disabled;
                button.required = this._required;

                if (this._value && button.value === this._value) {
                    button.checked = true;
                    this._selected = button;
                }

                button.change.subscribe((ev) => this._selectedRadioButtonChanged(ev));
            });
        }
    }

    private _selectedRadioButtonChanged(args: IChangeRadioEventArgs) {
        if (this._selected !== args.radio) {
            this._selected.checked = false;
            this._selected = args.radio;
        }

        this._value = args.value;

        if (this._isInitialized) {
            this.change.emit(args);
        }
    }

    private _setRadioButtonNames() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.name = this._name;
            });
        }
    }

    private _selectRadioButton() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                if (!this._value) {
                    // no value - uncheck all radio buttons
                    if (button.checked) {
                        button.checked = false;
                    }
                } else {
                    if (this._value === button.value) {
                        // selected button
                        if (this._selected !== button) {
                            this._selected = button;
                        }

                        if (!button.checked) {
                            button.select();
                        }
                    } else {
                        // non-selected button
                        if (button.checked) {
                            button.checked = false;
                        }
                    }
                }
                // TODO: mark for check?
            });
        }
    }

    private _setRadioButtonLabelPosition() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.labelPosition = this._labelPosition;
                // TODO: mark for check?
            });
        }
    }

    private _disableRadioButtons() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.disabled = this._disabled;
                // TODO: mark for check?
            });
        }
    }

    private _setRadioButtonsRequired() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.required = this._required;
                // TODO: mark for check?
            });
        }
    }
}

/**
 *The IgxRadioModule provides the {@link IgxRadioGroupDirective} inside your application.
 */
@NgModule({
    declarations: [IgxRadioGroupDirective, IgxRadioComponent],
    exports: [IgxRadioGroupDirective, IgxRadioComponent],
    imports: [IgxRippleModule]
})
export class IgxRadioModule { }