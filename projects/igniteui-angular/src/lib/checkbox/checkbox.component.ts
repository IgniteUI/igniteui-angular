import {
    Component,
    HostBinding,
    Input,
    AfterViewInit,
    booleanAttribute,
} from '@angular/core';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { CheckboxBaseDirective } from './checkbox-base.directive';
import { ControlValueAccessor } from '@angular/forms';
import { EditorProvider, EDITOR_PROVIDER } from '../core/edit-provider';

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
    imports: [IgxRippleDirective],
})
export class IgxCheckboxComponent
    extends CheckboxBaseDirective
    implements AfterViewInit, ControlValueAccessor, EditorProvider {
    /**
     * Returns the class of the checkbox component.
     *
     * @example
     * ```typescript
     * let class = this.checkbox.cssClass;
     * ```
     */
    @HostBinding('class.igx-checkbox')
    public override cssClass = 'igx-checkbox';

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
    public override focused = false;

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
    public override indeterminate = false;

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
    @HostBinding('class.igx-checkbox--disabled')
    @Input({ transform: booleanAttribute })
    public override disabled = false;

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
    public override invalid = false;

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
    public override readonly = false;

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
}
