import {
    Component,
    Input,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    signal
} from '@angular/core';
import { CheckboxBaseDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { ControlValueAccessor } from '@angular/forms';
import { EditorProvider, EDITOR_PROVIDER } from 'igniteui-angular/core';

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
    providers: [
        {
            provide: EDITOR_PROVIDER,
            useExisting: IgxCheckboxComponent,
            multi: true,
        },
    ],
    preserveWhitespaces: false,
    templateUrl: 'checkbox.component.html',
    styleUrl: 'checkbox.component.css',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxRippleDirective],
    host: {
        '[class.igx-checkbox]': 'cssClass',
        '[class.igx-checkbox--focused]': 'focused',
        '[class.igx-checkbox--indeterminate]': 'indeterminate',
        '[class.igx-checkbox--checked]': 'checked',
        '[class.igx-checkbox--disabled]': 'disabled',
        '[class.igx-checkbox--invalid]': 'invalid',
        '[class.igx-checkbox--plain]': '_disableTransitions()',
    },
})
export class IgxCheckboxComponent
    extends CheckboxBaseDirective
    implements AfterViewInit, ControlValueAccessor, EditorProvider {
    protected readonly _disableTransitions = signal(false);

    /**
     * Returns the class of the checkbox component.
     *
     * @example
     * ```typescript
     * let class = this.checkbox.cssClass;
     * ```
     */
    public override cssClass = 'igx-checkbox';

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
    public override get focused() {
        return super.focused;
    }
    public override set focused(value: boolean) {
        super.focused = value;
    }

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
    @Input({ transform: booleanAttribute })
    public override get indeterminate() {
        return super.indeterminate;
    }
    public override set indeterminate(value: boolean) {
        super.indeterminate = value;
    }

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
    @Input({ transform: booleanAttribute })
    public override set checked(value: boolean) {
        super.checked = value;
    }
    public override get checked() {
        return super.checked;
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
    @Input({ transform: booleanAttribute })
    public override get disabled() {
        return super.disabled;
    }
    public override set disabled(value: boolean) {
        super.disabled = value;
    }

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
    @Input({ transform: booleanAttribute })
    public override get invalid() {
        return super.invalid;
    }
    public override set invalid(value: boolean) {
        super.invalid = value;
    }

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
    public override get readonly() {
        return super.readonly;
    }
    public override set readonly(value: boolean) {
        super.readonly = value;
    }

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
    @Input({ transform: booleanAttribute })
    public get disableTransitions() {
        return this._disableTransitions();
    }
    public set disableTransitions(value: boolean) {
        this._disableTransitions.set(value);
    }
}
