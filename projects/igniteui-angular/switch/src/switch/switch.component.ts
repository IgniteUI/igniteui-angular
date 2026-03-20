import {
    Component,
    HostBinding,
    Input,
    AfterViewInit,
    booleanAttribute
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { CheckboxBaseDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { EditorProvider, EDITOR_PROVIDER } from 'igniteui-angular/core';

/**
 *
 * The Switch component is a binary choice selection component.
 *
 * @remarks
 *
 * The Ignite UI Switch lets the user toggle between on/off or true/false states.
 */
@Component({
    providers: [{
        provide: EDITOR_PROVIDER,
        useExisting: IgxSwitchComponent,
        multi: true
    }],
    selector: 'igx-switch',
    templateUrl: 'switch.component.html',
    imports: [IgxRippleDirective]
})
export class IgxSwitchComponent
    extends CheckboxBaseDirective
    implements ControlValueAccessor, EditorProvider, AfterViewInit {
    /**
     * Returns the class of the switch component.
     */
    @HostBinding('class.igx-switch')
    public override cssClass = 'igx-switch';
    /**
     * Sets/gets whether the switch is on or off.
     * Default value is 'false'.
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
     */
    @HostBinding('class.igx-switch--disabled')
    @Input({ transform: booleanAttribute })
    public override disabled = false;

    /**
     * Sets/gets whether the switch component is invalid.
     * Default value is `false`.
     */
    @HostBinding('class.igx-switch--invalid')
    @Input({ transform: booleanAttribute })
    public override invalid = false;

    /**
     * Sets/gets whether the switch component is on focus.
     * Default value is `false`.
     */
    @HostBinding('class.igx-switch--focused')
    public override focused = false;
}
