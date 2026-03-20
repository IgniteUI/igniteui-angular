import {
    Component,
    HostBinding,
    Input,
    AfterViewInit,
    booleanAttribute,
} from '@angular/core';
import { CheckboxBaseDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { ControlValueAccessor } from '@angular/forms';
import { EditorProvider, EDITOR_PROVIDER } from 'igniteui-angular/core';

/**
 * Allows users to make a binary choice for a certain condition.
 *
 * @remarks
 * The Ignite UI Checkbox is a selection control that allows users to make a binary choice for a certain condition.It behaves similarly
 * to the native browser checkbox.
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
     */
    @HostBinding('class.igx-checkbox')
    public override cssClass = 'igx-checkbox';

    /**
     * Returns if the component is of type `material`.
     */
    @HostBinding('class.igx-checkbox--material')
    protected get material() {
        return this.theme === 'material';
    }

    /**
     * Returns if the component is of type `indigo`.
     */
    @HostBinding('class.igx-checkbox--indigo')
    protected get indigo() {
        return this.theme === 'indigo';
    }

    /**
     * Returns if the component is of type `bootstrap`.
     */
    @HostBinding('class.igx-checkbox--bootstrap')
    protected get bootstrap() {
        return this.theme === 'bootstrap';
    }

    /**
     * Returns if the component is of type `fluent`.
     */
    @HostBinding('class.igx-checkbox--fluent')
    protected get fluent() {
        return this.theme === 'fluent';
    }

    /**
     * Sets/gets whether the checkbox component is on focus.
     * Default value is `false`.
     */
    @HostBinding('class.igx-checkbox--focused')
    public override focused = false;

    /**
     * Sets/gets the checkbox indeterminate visual state.
     * Default value is `false`;
     */
    @HostBinding('class.igx-checkbox--indeterminate')
    @Input({ transform: booleanAttribute })
    public override indeterminate = false;

    /**
     * Sets/gets whether the checkbox is checked.
     * Default value is `false`.
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
     */
    @HostBinding('class.igx-checkbox--disabled')
    @Input({ transform: booleanAttribute })
    public override disabled = false;

    /**
     * Sets/gets whether the checkbox is invalid.
     * Default value is `false`.
     */
    @HostBinding('class.igx-checkbox--invalid')
    @Input({ transform: booleanAttribute })
    public override invalid = false;

    /**
     * Sets/gets whether the checkbox is readonly.
     * Default value is `false`.
     */
    @Input({ transform: booleanAttribute })
    public override readonly = false;

    /**
     * Sets/gets whether the checkbox should disable all css transitions.
     * Default value is `false`.
     */
    @HostBinding('class.igx-checkbox--plain')
    @Input({ transform: booleanAttribute })
    public disableTransitions = false;
}
