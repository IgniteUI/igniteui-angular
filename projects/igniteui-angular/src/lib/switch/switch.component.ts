import {
    Component,
    HostBinding,
    Input,
    AfterViewInit
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { EditorProvider, EDITOR_PROVIDER } from '../core/edit-provider';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';

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
    standalone: true,
    imports: [IgxRippleDirective]
})
export class IgxSwitchComponent extends IgxCheckboxComponent implements ControlValueAccessor, EditorProvider, AfterViewInit {
    /**
     * Returns the class of the switch component.
     *
     * @example
     * ```typescript
     * let switchClass = this.switch.cssClass;
     * ```
     */
    @HostBinding('class.igx-switch')
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
    @HostBinding('class.igx-switch--checked')
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
    @HostBinding('class.igx-switch--disabled')
    @Input()
    public override get disabled(): boolean {
        return super.disabled
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
    @HostBinding('class.igx-switch--invalid')
    @Input()
    public override get invalid(): boolean {
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
    @HostBinding('class.igx-switch--focused')
    public override focused = false;
}
