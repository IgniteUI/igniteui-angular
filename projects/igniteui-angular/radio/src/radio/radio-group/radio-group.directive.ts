import {
    AfterContentInit,
    DestroyRef,
    Directive,
    EventEmitter,
    Input,
    Output,
    QueryList,
    booleanAttribute,
    computed,
    signal,
    inject,
    ElementRef,
    Injector
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { IgxRadioComponent } from '../radio.component';
import { isLeftToRight, NgControlAdapter, PlatformUtil } from 'igniteui-angular/core';
import { IChangeCheckboxEventArgs } from 'igniteui-angular/directives';
/**
 * Determines the Radio Group alignment
 */
export const RadioGroupAlignment = {
    horizontal: 'horizontal',
    vertical: 'vertical'
} as const;
export type RadioGroupAlignment = typeof RadioGroupAlignment[keyof typeof RadioGroupAlignment];

let nextId = 0;

/**
 * Whether `other` is rendered after `element` in the same document.
 * Browser only: relies on the global `Node`.
 */
function isRenderedAfter(element: Node, other: Node): boolean {
    const position = element.compareDocumentPosition(other);
    const isSameDocument = !(position & Node.DOCUMENT_POSITION_DISCONNECTED);
    const isFollowing = !!(position & Node.DOCUMENT_POSITION_FOLLOWING);

    return isSameDocument && isFollowing;
}

/**
 * Radio group directive renders set of radio buttons.
 *
 * @igxModule IgxRadioModule
 *
 * @igxTheme igx-radio-theme
 *
 * @igxKeywords radiogroup, radio, button, input
 *
 * @igxGroup Data Entry & Display
 *
 * @remarks
 * The Ignite UI Radio Group allows the user to select a single option from an available set of options that are listed side by side.
 *
 * @example:
 * ```html
 * <igx-radio-group name="radioGroup">
 *   <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}">
 *      {{item}}
 *   </igx-radio>
 * </igx-radio-group>
 * ```
 */
@Directive({
    exportAs: 'igxRadioGroup',
    selector: '[igxRadioGroup],igx-radio-group',
    standalone: true,
    host: {
        'class': 'igx-radio-group',
        '[class.igx-radio-group--vertical]': '_vertical()',
        '[class.igx-radio-group--before]': '_labelBefore()',
        '[class.igx-radio-group--disabled]': '_allDisabled()',
        '(click)': 'handleClick($event)',
        '(keydown)': 'handleKeyDown($event)',
    }
})
export class IgxRadioGroupDirective implements ControlValueAccessor, AfterContentInit {
    public ngControl = inject(NgControl, { optional: true, self: true });
    private control = NgControlAdapter.from(this.ngControl, inject(Injector));
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _platform = inject(PlatformUtil);

    private _radioButtons = signal<IgxRadioComponent[]>([]);
    private _radioButtonsList = new QueryList<IgxRadioComponent>();

    // Internal state.
    private readonly _name = signal(`igx-radio-group-${nextId++}`);
    private readonly _value = signal<any>(null);
    private readonly _selected = signal<IgxRadioComponent | null>(null);
    private readonly _required = signal(false);
    private readonly _invalid = signal(false);
    private readonly _disabled = signal(false);
    protected readonly _vertical = signal(false);

    /**
     * Disabled state of the form control bound to the group.
     *
     * @hidden
     * @internal
     */
    public readonly _formDisabled = this._disabled.asReadonly();

    // Derived view state, consumed by the host bindings
    // Whether any of the child radio buttons has its label positioned `before`.
    protected readonly _labelBefore = computed(() =>
        this._radioButtons().some((radio) => radio.labelPosition === 'before')
    );

    // Whether all of the child radio buttons are disabled.
    protected readonly _allDisabled = computed(() =>
        this._radioButtons().every((radio) => radio.disabled)
    );

    /**
     * The checked, enabled child radio button, if any. Drives the roving tabindex of the buttons.
     * A disabled checked button cannot take focus, so it must not hold the only tab stop of the group.
     *
     * @hidden
     * @internal
     */
    public readonly _checkedButton = computed(() =>
        this._radioButtons().find((radio) => radio.checked && !radio.disabled)
    );

    /**
     * Returns reference to the child radio buttons.
     *
     * @example
     * ```typescript
     * let radioButtons =  this.radioGroup.radioButtons;
     * ```
     */
    public get radioButtons(): QueryList<IgxRadioComponent> {
        this._radioButtonsList.reset(this._radioButtons());
        return this._radioButtonsList;
    }

    /**
     * Sets/gets the value attribute.
     *
     * @example
     * ```html
     * <igx-radio-group [value]="'radioButtonValue'"></igx-radio-group>
     * ```
     */
    @Input()
    public get value(): any {
        return this._value();
    }

    public set value(newValue: any) {
        if (this._value() !== newValue) {
            this._value.set(newValue);
            this._selectRadioButton();
        }
    }

    /**
     * Sets/gets the `name` attribute of the radio group component. All child radio buttons inherits this name.
     *
     * @example
     * ```html
     * <igx-radio-group name = "Radio1"></igx-radio-group>
     *  ```
     */
    @Input()
    public get name(): string {
        return this._name();
    }

    public set name(newValue: string) {
        if (this._name() !== newValue) {
            this._name.set(newValue);
            this._setRadioButtonNames();
        }
    }

    /**
     * Sets/gets whether the radio group is required.
     *
     * @remarks
     * If not set, `required` will have value `false`.
     *
     * @example
     * ```html
     * <igx-radio-group [required] = "true"></igx-radio-group>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get required(): boolean {
        return this._required();
    }

    public set required(value: boolean) {
        this._required.set(value);
        this._setRadioButtonsRequired();
    }

    /**
     * Sets/gets the selected child radio button.
     *
     * @example
     * ```typescript
     * let selectedButton = this.radioGroup.selected;
     * this.radioGroup.selected = selectedButton;
     * ```
     */
    @Input()
    public get selected() {
        return this._selected();
    }

    public set selected(selected: IgxRadioComponent | null) {
        if (this._selected() !== selected) {
            this._selected.set(selected);
            this.value = selected ? selected.value : null;
        }
    }

    /**
     * Sets/gets whether the radio group is invalid.
     *
     * @remarks
     * If not set, `invalid` will have value `false`.
     *
     * @example
     * ```html
     * <igx-radio-group [invalid] = "true"></igx-radio-group>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get invalid(): boolean {
        return this._invalid();
    }

    public set invalid(value: boolean) {
        this._invalid.set(value);
        this._setRadioButtonsInvalid();
    }

    /**
     * An event that is emitted after the radio group value is changed.
     *
     * @remarks
     * Provides references to the selected radio and the value property as event arguments.
     *
     * @example
     * ```html
     * <igx-radio-group (change)="handler($event)"></igx-radio-group>
     * ```
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly change: EventEmitter<IChangeCheckboxEventArgs> = new EventEmitter<IChangeCheckboxEventArgs>();

    protected handleClick(event: MouseEvent) {
        event.stopPropagation();

        if (this.selected) {
            this.selected.nativeElement.focus();
        }
    }

    protected handleKeyDown(event: KeyboardEvent) {
        const { key } = event;
        const buttons = this._radioButtons().filter(radio => !radio.disabled);
        const checked = buttons.find((radio) => radio.checked);

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            let index = checked ? buttons.indexOf(checked) : -1;
            const ltr = isLeftToRight(this._element.nativeElement);

            switch (key) {
                case 'ArrowUp':
                    index += -1;
                    break;
                case 'ArrowLeft':
                    index += ltr ? -1 : 1;
                    break;
                case 'ArrowRight':
                    index += ltr ? 1 : -1;
                    break;
                default:
                    index += 1;
            }

            if (index < 0) index = buttons.length - 1;
            if (index > buttons.length - 1) index = 0;

            buttons.forEach((radio) => {
                radio.deselect();
                radio.nativeElement.blur();
            });

            buttons[index].focused = true;
            buttons[index].nativeElement.focus();
            buttons[index].select();
            event.preventDefault();
        }

        if (event.key === "Tab") {
            buttons.forEach((radio) => {
                if (radio !== checked) {
                    event.stopPropagation();
                }
            });
        }
    }

    /**
     * Returns the alignment of the `igx-radio-group`.
     * ```typescript
     * @ViewChild("MyRadioGroup")
     * public radioGroup: IgxRadioGroupDirective;
     * ngAfterViewInit(){
     *    let radioAlignment = this.radioGroup.alignment;
     * }
     * ```
     */
    @Input()
    public get alignment(): RadioGroupAlignment {
        return this._vertical() ? RadioGroupAlignment.vertical : RadioGroupAlignment.horizontal;
    }
    /**
     * Allows you to set the radio group alignment.
     * Available options are `RadioGroupAlignment.horizontal` (default) and `RadioGroupAlignment.vertical`.
     * ```typescript
     * public alignment = RadioGroupAlignment.vertical;
     * //..
     * ```
     * ```html
     * <igx-radio-group [alignment]="alignment"></igx-radio-group>
     * ```
     */
    public set alignment(value: RadioGroupAlignment) {
        this._vertical.set(value === RadioGroupAlignment.vertical);
    }

    private _onChangeCallback: (_: any) => void = noop;

    private _onTouchedCallback: () => void = noop;

    private _isInitialized = false;

    /**
     * Called by a registered radio button when it is blurred.
     *
     * @hidden
     * @internal
     */
    public _onButtonBlur(radioButton: IgxRadioComponent) {
        if (!this._radioButtons().includes(radioButton)) {
            return;
        }

        this._onTouchedCallback();

        this._radioButtons().forEach((button) => {
            button.focused = false;

            if (button.invalid) {
                this.invalid = true;
            }
        });
    }

    /**
     * Called by a registered radio button on keyup.
     *
     * @hidden
     * @internal
     */
    public _onButtonKeyup(radioButton: IgxRadioComponent, event: KeyboardEvent) {
        if (!this._radioButtons().includes(radioButton)) {
            return;
        }

        // A disabled checked button cannot take focus, so it is never the one Tab moved to.
        const checked = this._checkedButton();

        if (event.key === "Tab") {
            this._radioButtons().forEach((radio) => {
                if (radio === checked) {
                    checked.focused = true;
                }
            });
            this._clearUncheckedFocus();
        }
    }

    /**
     * Only the checked button can be focused, as it is the only one in the tab order.
     */
    private _clearUncheckedFocus() {
        const checked = this._checkedButton();

        if (checked) {
            this._radioButtons().forEach((button) => {
                if (button !== checked) {
                    button.focused = false;
                }
            });
        }
    }

    /**
     * Sets the "checked" property value on the radio input element.
     *
     * @remarks
     * Checks whether the provided value is consistent to the current radio button.
     * If it is, the checked attribute will have value `true` and selected property will contain the selected radio.
     *
     * @example
     * ```typescript
     * this.radioGroup.writeValue('radioButtonValue');
     * ```
     */
    public writeValue(value: any) {
        this.value = value;
    }

    /**
     * Registers a function called when the control value changes.
     *
     * @hidden
     * @internal
     */
    public registerOnChange(fn: (_: any) => void) {
        this._onChangeCallback = fn;
    }

    /**
     * Registers a function called when the control is touched.
     *
     * @hidden
     * @internal
     */
    public registerOnTouched(fn: () => void) {
        // Invoked on child blur, as forms register it before the child radio buttons exist.
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean) {
        this._disabled.set(isDisabled);
    }

    constructor() {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngAfterContentInit(): void {
        this._isInitialized = true;

        const control = this.control;

        if (control) {
            // Signal Forms also emit on touch, so re-evaluate rather than reset the state set on blur.
            control.statusChanges
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe(() => {
                    this.invalid = !control.disabled && control.touchedOrDirty && control.invalid;
                });

            if (control.hasValidators) {
                this.required = control.required;
            }
        }
    }

    /**
     * Checks `button` if its value matches the group value.
     */
    private _checkIfSelected(button: IgxRadioComponent) {
        const value = this._value();

        // `null` clears the group, so it never matches a button with a `null` value.
        if (value !== null && button.value === value) {
            button.checked = true;
            this._selected.set(button);
            this._clearUncheckedFocus();
        }
    }

    /**
     * Called by a registered radio button when the user selects it.
     *
     * @hidden
     * @internal
     */
    public _onButtonSelected(args: IChangeCheckboxEventArgs) {
        if (!this._radioButtons().includes(args.owner)) {
            return;
        }

        this._radioButtons().forEach((button) => {
            button.checked = button.id === args.owner.id;
            if (button.checked && button.ngControl) {
                this.invalid = button.ngControl.invalid!;
            } else if (button.checked) {
                this.invalid = false;
            }
        });

        this._selected.set(args.owner);
        this._value.set(args.value);
        this._clearUncheckedFocus();

        if (this._isInitialized) {
            this.change.emit(args);
            this._onChangeCallback(this.value);
        }
    }

    private _setRadioButtonNames() {
        this._radioButtons().forEach((button) => {
            button.name = this._name();
        });
    }

    private _selectRadioButton() {
        const value = this._value();

        // Clear a selection the value no longer matches. A matching registered button is re-selected
        // below; a matching button that has not registered yet stays selected until it does.
        if (value === null || this._selected()?.value !== value) {
            this._selected.set(null);
        }

        this._radioButtons().forEach((button) => {
            if (value === null) {
                // no value - uncheck all radio buttons
                if (button.checked) {
                    button.checked = false;
                }
            } else {
                if (value === button.value) {
                    // selected button
                    if (this._selected() !== button) {
                        this._selected.set(button);
                    }

                    if (!button.checked) {
                        button.checked = true;
                    }
                } else {
                    // non-selected button
                    if (button.checked) {
                        button.checked = false;
                    }
                }
            }
        });

        this._clearUncheckedFocus();
    }

    private _setRadioButtonsRequired() {
        this._radioButtons().forEach((button) => {
            button.required = this._required();
        });
    }


    /**
     * Registers a radio button with this radio group.
     * This method is called by radio button components when they are created.
     * @hidden @internal
     */
    public _addRadioButton(radioButton: IgxRadioComponent): void {
        if (this._radioButtons().includes(radioButton)) {
            return;
        }

        this._radioButtons.update(buttons => {
            // In the browser, keep DOM order, so keyboard navigation follows the rendered order
            // of buttons inserted in the middle. Elsewhere, keep registration order.
            const index = this._platform.isBrowser
                ? buttons.findIndex((button) => isRenderedAfter(radioButton.nativeElement, button.nativeElement))
                : -1;

            return index < 0
                ? [...buttons, radioButton]
                : [...buttons.slice(0, index), radioButton, ...buttons.slice(index)];
        });

        // Apply the current group state right away, so a late button needs no extra pass.
        radioButton.name = this._name();
        radioButton.required = this._required();

        // `selected` was set before this button registered, possibly before its `value` was bound.
        if (this._selected() === radioButton) {
            this.value = radioButton.value;
        }

        this._checkIfSelected(radioButton);
    }

    /**
     * Called by a registered radio button when its value changes.
     * @hidden @internal
     */
    public _onButtonValueChange(radioButton: IgxRadioComponent): void {
        if (!this._radioButtons().includes(radioButton)) {
            return;
        }

        if (this._selected() === radioButton) {
            // The selected button may no longer have the group value, so sync every button.
            this._selectRadioButton();
        } else {
            this._checkIfSelected(radioButton);
        }
    }

    /**
     * Unregisters a radio button from this radio group.
     * This method is called by radio button components when they are destroyed.
     * @hidden @internal
     */
    public _removeRadioButton(radioButton: IgxRadioComponent): void {
        this._radioButtons.update(buttons =>
            buttons.filter(btn => btn !== radioButton)
        );

        // Keep `value`, so a radio button re-added with the same value is selected again.
        if (this._selected() === radioButton) {
            this._selected.set(null);
        }
    }

    private _setRadioButtonsInvalid() {
        this._radioButtons().forEach((button) => {
            button.invalid = this._invalid();
        });
    }
}
