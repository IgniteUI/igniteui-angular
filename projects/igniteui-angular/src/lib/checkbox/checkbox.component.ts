import {
    Component,
    EventEmitter,
    HostListener,
    HostBinding,
    Input,
    Output,
    ViewChild,
    ElementRef,
    AfterViewInit,
    ChangeDetectorRef,
    Renderer2,
    Optional,
    Self,
    booleanAttribute,
    inject,
    DestroyRef,
    Inject
} from '@angular/core';
import { ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { IBaseEventArgs, getComponentTheme, mkenum } from '../core/utils';
import { EditorProvider, EDITOR_PROVIDER } from '../core/edit-provider';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxTheme, THEME_TOKEN, ThemeToken } from '../services/theme/theme.token';

export const LabelPosition = /*@__PURE__*/mkenum({
    BEFORE: 'before',
    AFTER: 'after'
});
export type LabelPosition = typeof LabelPosition[keyof typeof LabelPosition];

export interface IChangeCheckboxEventArgs extends IBaseEventArgs {
    checked: boolean;
    value?: any;
}

let nextId = 0;
/**
 * Allows users to make a binary choice for a certain condition.
 *
 * @igxModule IgxCheckboxModule
 *
 * @igxTheme igx-checkbox-theme
 *
 * @igxKeywords checkbox, label
 *
 * @igxGroup Data entry and display
 *
 * @remarks
 * The Ignite UI Checkbox is a selection control that allows users to make a binary choice for a certain condition.It behaves similarly
 * to the native browser checkbox.
 *
 * @example
 * ```html
 * <igx-checkbox [checked]="true">
 *   simple checkbox
 * </igx-checkbox>
 * ```
 */
@Component({
    selector: 'igx-checkbox',
    providers: [{
        provide: EDITOR_PROVIDER,
        useExisting: IgxCheckboxComponent,
        multi: true
    }],
    preserveWhitespaces: false,
    templateUrl: 'checkbox.component.html',
    standalone: true,
    imports: [IgxRippleDirective]
})
export class IgxCheckboxComponent implements EditorProvider, AfterViewInit, ControlValueAccessor {

    /**
     * An event that is emitted after the checkbox state is changed.
     * Provides references to the `IgxCheckboxComponent` and the `checked` property as event arguments.
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly change: EventEmitter<IChangeCheckboxEventArgs> = new EventEmitter<IChangeCheckboxEventArgs>();

    /**
     * @hidden
     * @internal
     */
    public destroy$ = new Subject<boolean>();

    /**
     * Returns reference to the native checkbox element.
     *
     * @example
     * ```typescript
     * let checkboxElement =  this.component.checkboxElement;
     * ```
     */
    @ViewChild('checkbox', { static: true })
    public nativeInput: ElementRef;

    /**
     * Returns reference to the native label element.
     * ```typescript
     *
     * @example
     * let labelElement =  this.component.nativeLabel;
     * ```
     */
    @ViewChild('label', { static: true })
    public nativeLabel: ElementRef;

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
    public placeholderLabel: ElementRef;

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
    @HostBinding('attr.id')
    @Input()
    public id = `igx-checkbox-${nextId++}`;

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
    @Input() public labelId = `${this.id}-label`;

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
    @Input() public value: any;

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
    @Input() public name: string;

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
    @Input() public tabindex: number = null;

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
    public labelPosition: LabelPosition | string = LabelPosition.AFTER;

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
    public disableRipple = false;

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
        return this._required || this.nativeElement.hasAttribute('required');
    }
    public set required(value: boolean) {
        this._required = value;
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
    public ariaLabelledBy = this.labelId;

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
    public ariaLabel: string | null = null;

    /**
     * Returns the class of the checkbox component.
     *
     * @example
     * ```typescript
     * let class = this.checkbox.cssClass;
     * ```
     */
    @HostBinding('class.igx-checkbox')
    public cssClass = 'igx-checkbox';

    /**
     * Returns if the component is of type `material`.
     *
     * @example
     * ```typescript
     * let checkbox = this.checkbox.material;
     * ```
     */
    @HostBinding('class.igx-checkbox--material')
    protected get material() {
        return this.theme === 'material';
    }

    /**
     * Returns if the component is of type `indigo`.
     *
     * @example
     * ```typescript
     * let checkbox = this.checkbox.indigo;
     * ```
     */
    @HostBinding('class.igx-checkbox--indigo')
    protected get indigo() {
        return this.theme === 'indigo';
    }

    /**
     * Returns if the component is of type `bootstrap`.
     *
     * @example
     * ```typescript
     * let checkbox = this.checkbox.bootstrap;
     * ```
     */
    @HostBinding('class.igx-checkbox--bootstrap')
    protected get bootstrap() {
        return this.theme === 'bootstrap';
    }

    /**
     * Returns if the component is of type `fluent`.
     *
     * @example
     * ```typescript
     * let checkbox = this.checkbox.fluent;
     * ```
     */
    @HostBinding('class.igx-checkbox--fluent')
    protected get fluent() {
        return this.theme === 'fluent';
    }

    /**
     * Sets/gets whether the checkbox component is on focus.
     * Default value is `false`.
     *
     * @example
     * ```typescript
     * this.checkbox.focused =  true;
     * ```
     * ```typescript
     * let isFocused = this.checkbox.focused;
     * ```
     */
    @HostBinding('class.igx-checkbox--focused')
    public focused = false;

    /**
     * Sets/gets the checkbox indeterminate visual state.
     * Default value is `false`;
     *
     * @example
     * ```html
     * <igx-checkbox [indeterminate]="true"></igx-checkbox>
     * ```
     * ```typescript
     * let isIndeterminate = this.checkbox.indeterminate;
     * ```
     */
    @HostBinding('class.igx-checkbox--indeterminate')
    @Input({ transform: booleanAttribute })
    public indeterminate = false;

    /**
     * Sets/gets whether the checkbox is checked.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox [checked]="true"></igx-checkbox>
     * ```
     * ```typescript
     * let isChecked =  this.checkbox.checked;
     * ```
     */
    @HostBinding('class.igx-checkbox--checked')
    @Input({ transform: booleanAttribute })
    public get checked() {
        return this._checked;
    }
    public set checked(value: boolean) {
        if (this._checked !== value) {
            this._checked = value;
            this._onChangeCallback(this._checked);
        }
    }

    /**
     * Sets/gets whether the checkbox is disabled.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox disabled></igx-checkbox>
     * ```
     * ```typescript
     * let isDisabled = this.checkbox.disabled;
     * ```
     */
    @HostBinding('class.igx-checkbox--disabled')
    @Input({ transform: booleanAttribute })
    public disabled = false;

    /**
     * Sets/gets whether the checkbox is invalid.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox invalid></igx-checkbox>
     * ```
     * ```typescript
     * let isInvalid = this.checkbox.invalid;
     * ```
     */
    @HostBinding('class.igx-checkbox--invalid')
    @Input({ transform: booleanAttribute })
    public invalid = false

    /**
     * Sets/gets whether the checkbox is readonly.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox [readonly]="true"></igx-checkbox>
     * ```
     * ```typescript
     * let readonly = this.checkbox.readonly;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public readonly = false;

    /**
     * Sets/gets whether the checkbox should disable all css transitions.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox [disableTransitions]="true"></igx-checkbox>
     * ```
     * ```typescript
     * let disableTransitions = this.checkbox.disableTransitions;
     * ```
     */
    @HostBinding('class.igx-checkbox--plain')
    @Input({ transform: booleanAttribute })
    public disableTransitions = false;

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

    /**
     * @hidden
     * @internal
     */
    protected _checked = false;

    /**
     * @hidden
     * @internal
     */
    protected theme: IgxTheme;

    /**
     * @hidden
     * @internal
     */
    private _required = false;
    private _prefersTokenizedTheme = false;
    private elRef = inject(ElementRef);
    private destroyRef = inject(DestroyRef);

    constructor(
        protected cdr: ChangeDetectorRef,
        protected renderer: Renderer2,
        @Inject(THEME_TOKEN)
        protected themeToken: ThemeToken,
        @Optional() @Self() public ngControl: NgControl,
    ) {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
        const { theme, preferToken } = this.themeToken.getValue();
        this.theme = theme;
        this._prefersTokenizedTheme = preferToken;

        const { unsubscribe } = this.themeToken.subscribe((props) => {
            if (this.theme !== props.theme) {
                this.theme = props.theme;
                this.cdr.detectChanges();
            }
        });

        this.destroyRef.onDestroy(() => unsubscribe);
    }

    private setComponentTheme() {
        if(!this._prefersTokenizedTheme) {
            const theme = getComponentTheme(this.elRef.nativeElement);

            if (theme && theme !== this.theme) {
                this.themeToken.next({theme});
                this.cdr.markForCheck();
            }
        }
    }

    /**
     * @hidden
     * @internal
    */
    public ngAfterViewInit() {
        if (this.ngControl) {
            this.ngControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(this.updateValidityState.bind(this));

            if (this.ngControl.control.validator || this.ngControl.control.asyncValidator) {
                this._required = this.ngControl?.control?.hasValidator(Validators.required);
                this.cdr.detectChanges();
            }
        }

        this.setComponentTheme();
    }

    /** @hidden @internal */
    @HostListener('keyup', ['$event'])
    public onKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        this.focused = true;
    }

    /** @hidden @internal */
    @HostListener('click', ['$event'])
    public _onCheckboxClick(event: PointerEvent | MouseEvent) {
        // Since the original checkbox is hidden and the label
        // is used for styling and to change the checked state of the checkbox,
        // we need to prevent the checkbox click event from bubbling up
        // as it gets triggered on label click
        // NOTE: The above is no longer valid, as the native checkbox is not labeled
        // by the SVG anymore.
        if (this.disabled || this.readonly) {
            // readonly prevents the component from changing state (see toggle() method).
            // However, the native checkbox can still be activated through user interaction (focus + space, label click)
            // Prevent the native change so the input remains in sync
            event.preventDefault();
            return;
        }

        this.nativeInput.nativeElement.focus();

        this.indeterminate = false;
        this.checked = !this.checked;
        this.updateValidityState();

        // K.D. March 23, 2021 Emitting on click and not on the setter because otherwise every component
        // bound on change would have to perform self checks for weather the value has changed because
        // of the initial set on initialization
        this.change.emit({ checked: this.checked, value: this.value, owner: this });
    }

    /**
     * @hidden
     * @internal
     */
    public get ariaChecked() {
        if (this.indeterminate) {
            return 'mixed';
        } else {
            return this.checked;
        }
    }

    /** @hidden @internal */
    public _onCheckboxChange(event: Event) {
        // We have to stop the original checkbox change event
        // from bubbling up since we emit our own change event
        event.stopPropagation();
    }

    /** @hidden @internal */
    @HostListener('blur')
    public onBlur() {
        this.focused = false;
        this._onTouchedCallback();
        this.updateValidityState();
    }

    /** @hidden @internal */
    public writeValue(value: boolean) {
        this._checked = value;
    }

    /** @hidden @internal */
    public get labelClass(): string {
        switch (this.labelPosition) {
            case LabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case LabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
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
        this.disabled = isDisabled;
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
            if (!this.disabled && !this.readonly &&
                (this.ngControl.control.touched || this.ngControl.control.dirty)) {
                // the control is not disabled and is touched or dirty
                this.invalid = this.ngControl.invalid;
            } else {
                //  if the control is untouched, pristine, or disabled, its state is initial. This is when the user did not interact
                //  with the checkbox or when the form/control is reset
                this.invalid = false;
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
        if (!this.disabled && this._required && !this.checked && !this.readonly) {
            this.invalid = true;
        } else {
            this.invalid = false;
        }
    }
}
