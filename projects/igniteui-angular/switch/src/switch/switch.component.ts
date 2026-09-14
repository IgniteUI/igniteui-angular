import {
    Component,
    Input,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { CheckboxBaseDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { EditorProvider, EDITOR_PROVIDER } from 'igniteui-angular/core';

/**
 *
 * The Switch component is a binary choice selection component.
 *
 * @igxModule IgxSwitchModule
 *
 * @igxTheme igx-switch-theme, igx-tooltip-theme
 *
 * @igxKeywords switch, states, tooltip
 *
 * @igxGroup Data Entry & Display
 * @remarks
 *
 * The Ignite UI Switch lets the user toggle between on/off or true/false states.
 *
 * @example
 * ```html
 * <igx-switch [checked]="true">
 *   Simple switch
 * </igx-switch>
 * ```
 */
@Component({
    providers: [{
        provide: EDITOR_PROVIDER,
        useExisting: IgxSwitchComponent,
        multi: true
    }],
    selector: 'igx-switch',
    templateUrl: 'switch.component.html',
    styleUrl: 'switch.component.css',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxRippleDirective],
    host: {
        '[class.igx-switch]': 'cssClass',
        '[class.igx-switch--checked]': 'checked',
        '[class.igx-switch--disabled]': 'disabled',
        '[class.igx-switch--invalid]': 'invalid',
        '[class.igx-switch--focused]': 'focused',
    }
})
export class IgxSwitchComponent
    extends CheckboxBaseDirective
    implements ControlValueAccessor, EditorProvider, AfterViewInit {
    /**
     * Returns the class of the switch component.
     *
     * @example
     * ```typescript
     * let switchClass = this.switch.cssClass;
     * ```
     */
    public override cssClass = 'igx-switch';
    /**
     * Sets/gets whether the switch is on or off.
     * Default value is 'false'.
     *
     * @example
     * ```html
     *  <igx-switch [checked]="true"></igx-switch>
     * ```
     */
    @Input()
    public override set checked(value: boolean) {
        super.checked = value;
    }
    public override get checked() {
        return super.checked;
    }
    /**
     * Sets/gets the `disabled` attribute.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-switch disabled><igx-switch>
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
     * Sets/gets whether the switch component is invalid.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-switch invalid></igx-switch>
     * ```
     * ```typescript
     * let isInvalid = this.switch.invalid;
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
     * Sets/gets whether the switch component is on focus.
     * Default value is `false`.
     *
     * @example
     * ```typescript
     * this.switch.focused = true;
     * ```
     */
    public override get focused() {
        return super.focused;
    }
    public override set focused(value: boolean) {
        super.focused = value;
    }
}
