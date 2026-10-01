import {
    AfterContentInit,
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    DoCheck,
    EventEmitter,
    Input,
    OnDestroy,
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
import { fromEvent, noop, Subject, takeUntil } from 'rxjs';
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
export class IgxRadioGroupDirective implements ControlValueAccessor, AfterContentInit, OnDestroy, DoCheck {
    public ngControl = inject(NgControl, { optional: true, self: true });
    private control = NgControlAdapter.from(this.ngControl, inject(Injector));
    private cdr = inject(ChangeDetectorRef);
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

    // Derived view state, consumed by the host bindings.
    protected readonly _labelBefore = computed(() =>
        this._radioButtons().some((radio) => radio.labelPosition === 'before')
    );
    protected readonly _allDisabled = computed(() =>
        this._radioButtons().every((radio) => radio.disabled)
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

    /**
     * Whether any of the child radio buttons has its label positioned `before`.
     *
     * @hidden
     * @internal
     */
    protected get labelBefore() {
        return this._labelBefore();
    }

    /**
     * Whether all child radio buttons are disabled.
     *
     * @hidden
     * @internal
     */
    protected get disabled() {
        return this._allDisabled();
    }

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

    /**
     * @hidden
     * @internal
     */
    private _onChangeCallback: (_: any) => void = noop;

    /**
     * @hidden
     * @internal
     */
    private _onTouchedCallback: () => void = noop;

    /**
     * @hidden
     * @internal
     */
    private _isInitialized = false;

    /**
     * @hidden
     * @internal
     */
    private destroy$ = new Subject<boolean>();

    /**
     * @hidden
     * @internal
     */
    private queryChange$ = new Subject<void>();

    /**
     * @hidden
     * @internal
     */
    private updateValidityOnBlur() {
        this._onTouchedCallback();

        this._radioButtons().forEach((button) => {
            button.focused = false;

            if (button.invalid) {
                this.invalid = true;
            }
        });
    }

    /**
     * @hidden
     * @internal
     */
    private updateOnKeyUp(event: KeyboardEvent) {
        const checked = this._radioButtons().find(x => x.checked);

        if (event.key === "Tab") {
            this._radioButtons().forEach((radio) => {
                if (radio === checked) {
                    checked.focused = true;
                }
            });
        }
    }

    public ngDoCheck(): void {
        this._updateTabIndex();
    }

    private _updateTabIndex() {
        // Needed so that the keyboard navigation of a radio group
        // placed inside a dialog works properly
        if (this._radioButtons) {
            const checked = this._radioButtons().find(x => x.checked);

            if (checked) {
                this._radioButtons().forEach((button) => {
                    checked.nativeElement.tabIndex = 0;

                    if (button !== checked) {
                        button.nativeElement.tabIndex = -1;
                        button.focused = false;
                    }
                });
            }
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
        this._radioButtons().forEach((button) => button.groupDisabled = isDisabled);
        this.cdr.markForCheck();
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
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

                    // Signal Forms rules can toggle `required` at runtime.
                    if (control.backend === 'signal' && control.hasValidators) {
                        this.required = control.required;
                    }
                });

            if (control.hasValidators) {
                this.required = control.required;
            }
        }
    }

    /**
     * Checks `button` if its value matches the group value.
     *
     * @hidden
     * @internal
     */
    private _checkIfSelected(button: IgxRadioComponent) {
        if (button.value === this._value()) {
            button.checked = true;
            this._selected.set(button);
        }
    }

    /**
     * @hidden
     * @internal
     */
    private _setRadioButtonEvents(button: IgxRadioComponent) {
        button.change.pipe(
            takeUntilDestroyed(button.destroyRef),
            takeUntil(this.destroy$),
            takeUntil(this.queryChange$)
        ).subscribe((ev: IChangeCheckboxEventArgs) => this._selectedRadioButtonChanged(ev));

        button.blurRadio
            .pipe(
                takeUntilDestroyed(button.destroyRef),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.updateValidityOnBlur());

        fromEvent<KeyboardEvent>(button.nativeElement, 'keyup')
            .pipe(
                takeUntilDestroyed(button.destroyRef),
                takeUntil(this.destroy$)
            )
            .subscribe((event: KeyboardEvent) => this.updateOnKeyUp(event));
    }

    /**
     * @hidden
     * @internal
     */
    private _selectedRadioButtonChanged(args: IChangeCheckboxEventArgs) {
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

        if (this._isInitialized) {
            this.change.emit(args);
            this._onChangeCallback(this.value);
        }
    }

    /**
     * @hidden
     * @internal
     */
    private _setRadioButtonNames() {
        if (this._radioButtons) {
            this._radioButtons().forEach((button) => {
                button.name = this._name();
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    private _selectRadioButton() {
        if (this._radioButtons) {
            const value = this._value();

            // no matching button - clear the selection instead of keeping a stale one
            if (value === null || !this._radioButtons().some((button) => button.value === value)) {
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
        }
    }

    /**
     * @hidden
     * @internal
     */
    private _setRadioButtonsRequired() {
        if (this._radioButtons) {
            this._radioButtons().forEach((button) => {
                button.required = this._required();
            });
        }
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
        this._setRadioButtonEvents(radioButton);

        // Apply the current group state right away, so a late button needs no extra pass.
        radioButton.name = this._name();
        radioButton.required = this._required();
        if (this._disabled()) {
            radioButton.groupDisabled = true;
        }
        this._checkIfSelected(radioButton);
    }

    /**
     * Called by a registered radio button when its value changes.
     * @hidden @internal
     */
    public _onButtonValueChange(radioButton: IgxRadioComponent): void {
        if (this._radioButtons().includes(radioButton)) {
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
    }

    /**
     * @hidden
     * @internal
     */
    private _setRadioButtonsInvalid() {
        if (this._radioButtons) {
            this._radioButtons().forEach((button) => {
                button.invalid = this._invalid();
            });
        }
    }
}
