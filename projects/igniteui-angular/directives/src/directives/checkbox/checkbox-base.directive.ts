import { Directive, EventEmitter, Input, Output, ViewChild, ElementRef, ChangeDetectorRef, booleanAttribute, inject, AfterViewInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, Validators } from '@angular/forms';
import { IBaseEventArgs } from 'igniteui-angular/core';
import { noop } from 'rxjs';

export const LabelPosition = {
    BEFORE: 'before',
    AFTER: 'after'
} as const;
export type LabelPosition = typeof LabelPosition[keyof typeof LabelPosition];

export interface IChangeCheckboxEventArgs extends IBaseEventArgs {
    checked: boolean;
    value?: any;
}

let nextId = 0;

@Directive({
    host: {
        '[attr.id]': '_id()',
        '(keyup)': 'onKeyUp($event)',
        '(click)': '_onCheckboxClick($event)',
        '(blur)': 'onBlur()',
    }
})
export class CheckboxBaseDirective implements AfterViewInit {
    protected cdr = inject(ChangeDetectorRef);

    /**
     * @hidden
     * @internal
     */
    public destroyRef = inject(DestroyRef);

    public ngControl = inject(NgControl, { optional: true, self: true });

    // Internal state.
    // `_labelId` and `_ariaLabelledBy` snapshot `id`/`labelId` once on
    // initialization - deliberately not derived, so that a later write to `id`
    // never clobbers a caller-provided `labelId`.
    protected readonly _id = signal(`igx-checkbox-${nextId++}`);
    protected readonly _labelId = signal(`${this.id}-label`);
    protected readonly _ariaLabelledBy = signal(this.labelId);
    protected readonly _ariaLabel = signal<string | null>(null);
    protected readonly _checked = signal(false);
    protected readonly _required = signal(false);
    protected readonly _disabled = signal(false);
    protected readonly _readonly = signal(false);
    protected readonly _indeterminate = signal(false);
    protected readonly _focused = signal(false);
    protected readonly _invalid = signal(false);
    protected readonly _value = signal<any>(undefined);
    protected readonly _name = signal<string>(undefined!);
    protected readonly _tabindex = signal<number>(null!);
    protected readonly _labelPosition = signal<LabelPosition | string>(LabelPosition.AFTER);
    protected readonly _disableRipple = signal(false);

    // Derived view state, consumed by the templates.
    protected readonly _ariaChecked = computed(() =>
        this._indeterminate() ? 'mixed' : this._checked()
    );

    // `cssClass` is a per-subclass constant rather than a signal, so it is read
    // once and memoized. That is safe only because the first read happens while
    // rendering, after the subclass field initializer has assigned it.
    protected readonly _labelClass = computed(() =>
        this._labelPosition() === LabelPosition.BEFORE
            ? `${this.cssClass}__label ${this.cssClass}__label--before`
            : `${this.cssClass}__label`
    );

    /**
     * An event that is emitted after the checkbox state is changed.
     * Provides references to the checkbox and the `checked` property as event arguments.
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly change: EventEmitter<IChangeCheckboxEventArgs> =
        new EventEmitter<IChangeCheckboxEventArgs>();

    /**
     * Returns reference to the native checkbox element.
     *
     * @example
     * ```typescript
     * let checkboxElement =  this.component.checkboxElement;
     * ```
     */
    @ViewChild('checkbox', { static: true })
    public nativeInput!: ElementRef;

    /**
     * Returns reference to the native label element.
     * ```typescript
     *
     * @example
     * let labelElement =  this.component.nativeLabel;
     * ```
     */
    @ViewChild('label', { static: true })
    public nativeLabel!: ElementRef;

    public cssClass!: string;

    public get disabled(): boolean {
        return this._disabled();
    }
    public set disabled(value: boolean) {
        this._disabled.set(value);
    }

    public get readonly(): boolean {
        return this._readonly();
    }
    public set readonly(value: boolean) {
        this._readonly.set(value);
    }

    public get indeterminate(): boolean {
        return this._indeterminate();
    }
    public set indeterminate(value: boolean) {
        this._indeterminate.set(value);
    }

    public get focused(): boolean {
        return this._focused();
    }
    public set focused(value: boolean) {
        this._focused.set(value);
    }

    public get invalid(): boolean {
        return this._invalid();
    }
    public set invalid(value: boolean) {
        this._invalid.set(value);
    }

    @Input({ transform: booleanAttribute })
    public get checked() {
        return this._checked();
    }

    public set checked(value: boolean) {
        if (this._checked() !== value) {
            this._checked.set(value);
            this._onChangeCallback(value);
        }
    }

    /**
     * Returns reference to the `nativeElement` of the igx-checkbox/igx-switch.
     *
     * @example
     * ```typescript
     * let nativeElement = this.component.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this.nativeInput.nativeElement;
    }

    /**
     * Returns reference to the label placeholder element.
     * ```typescript
     *
     * @example
     * let labelPlaceholder =  this.component.placeholderLabel;
     * ```
     */
    @ViewChild('placeholderLabel', { static: true })
    public placeholderLabel!: ElementRef;

    /**
     * Sets/gets the `id` of the checkbox component.
     * If not set, the `id` of the first checkbox component will be `"igx-checkbox-0"`.
     *
     * @example
     * ```html
     * <igx-checkbox id="my-first-checkbox"></igx-checkbox>
     * ```
     * ```typescript
     * let checkboxId =  this.checkbox.id;
     * ```
     */
    @Input()
    public get id() {
        return this._id();
    }
    public set id(value: string) {
        this._id.set(value);
    }

    /**
     * Sets/gets the id of the `label` element.
     * If not set, the id of the `label` in the first checkbox component will be `"igx-checkbox-0-label"`.
     *
     * @example
     * ```html
     * <igx-checkbox labelId="Label1"></igx-checkbox>
     * ```
     * ```typescript
     * let labelId =  this.component.labelId;
     * ```
     */
    @Input()
    public get labelId() {
        return this._labelId();
    }
    public set labelId(value: string) {
        this._labelId.set(value);
    }

    /**
     * Sets/gets the `value` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox [value]="'CheckboxValue'"></igx-checkbox>
     * ```
     * ```typescript
     * let value =  this.checkbox.value;
     * ```
     */
    @Input()
    public get value() {
        return this._value();
    }
    public set value(value: any) {
        this._value.set(value);
    }

    /**
     * Sets/gets the `name` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox name="Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let name =  this.checkbox.name;
     * ```
     */
    @Input()
    public get name() {
        return this._name();
    }
    public set name(value: string) {
        this._name.set(value);
    }

    /**
     * Sets/gets the value of the `tabindex` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox [tabindex]="1"></igx-checkbox>
     * ```
     * ```typescript
     * let tabIndex =  this.checkbox.tabindex;
     * ```
     */
    @Input()
    public get tabindex() {
        return this._tabindex();
    }
    public set tabindex(value: number) {
        this._tabindex.set(value);
    }

    /**
     *  Sets/gets the position of the `label`.
     *  If not set, the `labelPosition` will have value `"after"`.
     *
     * @example
     * ```html
     * <igx-checkbox labelPosition="before"></igx-checkbox>
     * ```
     * ```typescript
     * let labelPosition =  this.checkbox.labelPosition;
     * ```
     */
    @Input()
    public get labelPosition() {
        return this._labelPosition();
    }
    public set labelPosition(value: LabelPosition | string) {
        this._labelPosition.set(value);
    }

    /**
     * Enables/Disables the ripple effect.
     * If not set, `disableRipple` will have value `false`.
     *
     * @example
     * ```html
     * <igx-checkbox [disableRipple]="true"></igx-checkbox>
     * ```
     * ```typescript
     * let isRippleDisabled = this.checkbox.desableRipple;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get disableRipple() {
        return this._disableRipple();
    }
    public set disableRipple(value: boolean) {
        this._disableRipple.set(value);
    }

    /**
     * Sets/gets the `aria-labelledby` attribute.
     * If not set, the `aria-labelledby` will be equal to the value of `labelId` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox aria-labelledby="Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let ariaLabelledBy = this.checkbox.ariaLabelledBy;
     * ```
     */
    @Input('aria-labelledby')
    public get ariaLabelledBy() {
        return this._ariaLabelledBy();
    }
    public set ariaLabelledBy(value: string) {
        this._ariaLabelledBy.set(value);
    }

    /**
     * Sets/gets the value of the `aria-label` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox aria-label="Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let ariaLabel = this.checkbox.ariaLabel;
     * ```
     */
    @Input('aria-label')
    public get ariaLabel() {
        return this._ariaLabel();
    }
    public set ariaLabel(value: string | null) {
        this._ariaLabel.set(value);
    }

    constructor() {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    /**
     * Sets/gets whether the checkbox is required.
     * If not set, `required` will have value `false`.
     *
     * @example
     * ```html
     * <igx-checkbox required></igx-checkbox>
     * ```
     * ```typescript
     * let isRequired = this.checkbox.required;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get required(): boolean {
        return this._required() || this.nativeElement.hasAttribute('required');
    }
    public set required(value: boolean) {
        if (!value) {
            this.nativeElement.removeAttribute('required');
        }
        this._required.set(value);
    }

    /**
     * @hidden
     * @internal
     */
    public ngAfterViewInit() {
        if (this.ngControl) {
            this.ngControl.statusChanges!
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(this.updateValidityState.bind(this));

            if (
                this.ngControl.control!.validator ||
                this.ngControl.control!.asyncValidator
            ) {
                this._required.set(this.ngControl.control!.hasValidator(
                    Validators.required
                ));
                this.cdr.detectChanges();
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    public inputId = `${this.id}-input`;

    /**
     * @hidden
     */
    protected _onChangeCallback: (_: any) => void = noop;

    /**
     * @hidden
     */
    private _onTouchedCallback: () => void = noop;

    /** @hidden @internal */
    public onKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        this._focused.set(true);
    }

    /** @hidden @internal */
    public _onCheckboxClick(event: PointerEvent | MouseEvent) {
        // Since the original checkbox is hidden and the label
        // is used for styling and to change the checked state of the checkbox,
        // we need to prevent the checkbox click event from bubbling up
        // as it gets triggered on label click
        // NOTE: The above is no longer valid, as the native checkbox is not labeled
        // by the SVG anymore.
        if (this._disabled() || this._readonly()) {
            // readonly prevents the component from changing state (see toggle() method).
            // However, the native checkbox can still be activated through user interaction (focus + space, label click)
            // Prevent the native change so the input remains in sync
            event.preventDefault();
            return;
        }

        this.nativeElement.focus();

        this._indeterminate.set(false);
        this.checked = !this._checked();
        this.updateValidityState();

        // K.D. March 23, 2021 Emitting on click and not on the setter because otherwise every component
        // bound on change would have to perform self checks for weather the value has changed because
        // of the initial set on initialization
        this.change.emit({
            checked: this._checked(),
            value: this._value(),
            owner: this,
        });
    }

    /** @hidden @internal */
    public _onCheckboxChange(event: Event) {
        // We have to stop the original checkbox change event
        // from bubbling up since we emit our own change event
        event.stopPropagation();
    }

    /** @hidden @internal */
    public onBlur() {
        this._focused.set(false);
        this._onTouchedCallback();
        this.updateValidityState();
    }

    /** @hidden @internal */
    public writeValue(value: boolean) {
        this._checked.set(value);
    }

    /** @hidden @internal */
    public registerOnChange(fn: (_: any) => void) {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean) {
        this._disabled.set(isDisabled);
    }

    /** @hidden @internal */
    public getEditElement() {
        return this.nativeInput.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    protected updateValidityState() {
        if (this.ngControl) {
            if (
                !this._disabled() &&
                !this._readonly() &&
                (this.ngControl.control!.touched || this.ngControl.control!.dirty)
            ) {
                // the control is not disabled and is touched or dirty
                this._invalid.set(this.ngControl.invalid!);
            } else {
                //  if the control is untouched, pristine, or disabled, its state is initial. This is when the user did not interact
                //  with the checkbox or when the form/control is reset
                this._invalid.set(false);
            }
        } else {
            this.checkNativeValidity();
        }
    }

    /**
     * A function to assign a native validity property of a checkbox.
     * This should be used when there's no ngControl
     *
     * @hidden
     * @internal
     */
    private checkNativeValidity() {
        if (
            !this._disabled() &&
            this._required() &&
            !this._checked() &&
            !this._readonly()
        ) {
            this._invalid.set(true);
        } else {
            this._invalid.set(false);
        }
    }
}
