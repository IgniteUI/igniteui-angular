import { Directive, NgModule, Input, QueryList, Output, EventEmitter, AfterContentInit, ContentChildren, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxRadioComponent, RadioLabelPosition, IChangeRadioEventArgs } from '../../radio/radio.component';
import { IgxRippleModule } from '../ripple/ripple.directive';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

const noop = () => { };
let nextId = 0;

/**
 * **Ignite UI for Angular Radio Group** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio_button.html#radio-group)
 *
 * The Ignite UI Radio Group allows the user to select a single option from an available set of options that are listed side by side.
 *
 * Example:
 * ```html
 * <igx-radio-group name="radioGroup">
 *   <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}">
 *      {{item}}
 *   </igx-radio>
 * </igx-radio-group>
 * ```
 */
@Directive({
    selector: 'igx-radio-group, [igxRadioGroup]',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxRadioGroupDirective, multi: true }]
})
export class IgxRadioGroupDirective implements AfterContentInit, ControlValueAccessor, OnDestroy {
    /**
     * Returns reference to the child radio buttons.
     * ```typescript
     * let radioButtons =  this.radioGroup.radioButtons;
     * ```
     * @memberof IgxRadioGroupDirective
     */
    @ContentChildren(IgxRadioComponent) public radioButtons: QueryList<IgxRadioComponent>;

    /**
     * Sets/gets the `value` attribute.
     * ```html
     * <igx-radio-group [value] = "'radioButtonValue'"></igx-radio-group>
     * ```
     * ```typescript
     * let value =  this.radioGroup.value;
     * ```
     * @memberof IgxRadioGroupDirective
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
     * Sets/gets the `name` attribute of the radio group component. All child radio buttons inherits this name.
     * ```html
     * <igx-radio-group name = "Radio1"></igx-radio-group>
     *  ```
     * ```typescript
     * let name =  this.radioGroup.name;
     * ```
     * @memberof IgxRadioGroupDirective
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
     * Sets/gets whether the radio group is required.
     * If not set, `required` will have value `false`.
     * ```html
     * <igx-radio-group [required] = "true"></igx-radio-group>
     * ```
     * ```typescript
     * let isRequired =  this.radioGroup.required;
     * ```
     * @memberof IgxRadioGroupDirective
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
     * An @Input property that allows you to disable the radio group. By default it's false.
     * ```html
     * <igx-radio-group [disabled]="true"></igx-radio-group>
     * ```
     * @memberof IgxRadioGroupDirective
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
     * Sets/gets the position of the `label` in the child radio buttons.
     * If not set, `labelPosition` will have value `"after"`.
     * ```html
     * <igx-radio-group labelPosition = "before"></igx-radio-group>
     * ```
     * ```typescript
     * let labelPosition =  this.radioGroup.labelPosition;
     * ```
     * @memberof IgxRadioGroupDirective
     */
    @Input()
    get labelPosition(): RadioLabelPosition | string { return this._labelPosition; }
    set labelPosition(newValue: RadioLabelPosition | string) {
        if (this._labelPosition !== newValue) {
            this._labelPosition = newValue === RadioLabelPosition.BEFORE ? RadioLabelPosition.BEFORE : RadioLabelPosition.AFTER;
            this._setRadioButtonLabelPosition();
        }
    }

    /**
     * Sets/gets the selected child radio button.
     * ```typescript
     * let selectedButton = this.radioGroup.selected;
     * this.radioGroup.selected = selectedButton;
     * ```
     * @memberof IgxRadioGroupDirective
     */
    @Input()
    get selected() { return this._selected; }
    set selected(selected: IgxRadioComponent | null) {
        if (this._selected !== selected) {
            this._selected = selected;
            this.value = selected ? selected.value : null;
        }
    }

    /**
     * An event that is emitted after the radio group `value` is changed.
     * Provides references to the selected `IgxRadioComponent` and the `value` property as event arguments.
     * @memberof IgxRadioGroupDirective
     */
    @Output()
    readonly change: EventEmitter<IChangeRadioEventArgs> = new EventEmitter<IChangeRadioEventArgs>();

    /**
     *@hidden
     */
    private _onChangeCallback: (_: any) => void = noop;
    /**
     *@hidden
     */
    private _name = `igx-radio-group-${nextId++}`;
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
    private _isInitialized = false;
    /**
     *@hidden
     */
    private _labelPosition: RadioLabelPosition | string = 'after';
    /**
     *@hidden
     */
    private _disabled = false;
    /**
     *@hidden
     */
    private _required = false;
    /**
     *@hidden
     */
    private destroy$ = new Subject<boolean>();

    ngAfterContentInit() {
        // The initial value can possibly be set by NgModel and it is possible that
        // the OnInit of the NgModel occurs after the OnInit of this class.
        this._isInitialized = true;

        setTimeout(() => { this._initRadioButtons(); });
    }

    /**
     * Checks whether the provided value is consistent to the current radio button.
     * If it is, the checked attribute will have value `true` and selected property will contain the selected `IgxRadioComponent`.
     * ```typescript
     * this.radioGroup.writeValue('radioButtonValue');
     * ```
     */
    public writeValue(value: any) {
        this.value = value;
    }

    /**
     *@hidden
     */
    public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }

    /**
     *@hidden
     */
    public registerOnTouched(fn: () => void) {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.registerOnTouched(fn);
            });
        }
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     *@hidden
     */
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

                button.change.pipe(takeUntil(this.destroy$)).subscribe((ev) => this._selectedRadioButtonChanged(ev));
            });
        }
    }

    /**
     *@hidden
     */
    private _selectedRadioButtonChanged(args: IChangeRadioEventArgs) {
        if (this._selected !== args.radio) {
            if (this._selected) {
                this._selected.checked = false;
            }
            this._selected = args.radio;
        }

        this._value = args.value;

        if (this._isInitialized) {
            this.change.emit(args);
            this._onChangeCallback(this.value);
        }
    }

    /**
     *@hidden
     */
    private _setRadioButtonNames() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.name = this._name;
            });
        }
    }

    /**
     *@hidden
     */
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
            });
        }
    }

    /**
     *@hidden
     */
    private _setRadioButtonLabelPosition() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.labelPosition = this._labelPosition;
            });
        }
    }

    /**
     *@hidden
     */
    private _disableRadioButtons() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.disabled = this._disabled;
            });
        }
    }

    /**
     *@hidden
     */
    private _setRadioButtonsRequired() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.required = this._required;
            });
        }
    }
}

/**
 *The IgxRadioModule provides the {@link IgxRadioGroupDirective} and {@link IgxRadioComponent} inside your application.
 */
@NgModule({
    declarations: [IgxRadioGroupDirective, IgxRadioComponent],
    exports: [IgxRadioGroupDirective, IgxRadioComponent],
    imports: [IgxRippleModule]
})
export class IgxRadioModule { }
