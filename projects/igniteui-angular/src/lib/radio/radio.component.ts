import {
    AfterViewInit,
    Component,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    booleanAttribute
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { EditorProvider, EDITOR_PROVIDER } from '../core/edit-provider';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { CheckboxBaseDirective } from '../checkbox/checkbox-base.directive';

/**
 * **Ignite UI for Angular Radio Button** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio_button.html)
 *
 * The Ignite UI Radio Button allows the user to select a single option from an available set of options that are listed side by side.
 *
 * Example:
 * ```html
 * <igx-radio>
 *   Simple radio button
 * </igx-radio>
 * ```
 */
@Component({
    selector: 'igx-radio',
    providers: [{
            provide: EDITOR_PROVIDER,
            useExisting: IgxRadioComponent,
            multi: true
        }],
    templateUrl: 'radio.component.html',
    imports: [IgxRippleDirective]
})
export class IgxRadioComponent
    extends CheckboxBaseDirective
    implements AfterViewInit, ControlValueAccessor, EditorProvider {
    /** @hidden @internal */
    public blurRadio = new EventEmitter();

    /**
     * Returns the class of the radio component.
     * ```typescript
     * let radioClass = this.radio.cssClass;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio')
    public override cssClass = 'igx-radio';

    /**
     * Sets/gets  the `checked` attribute.
     * Default value is `false`.
     * ```html
     * <igx-radio [checked]="true"></igx-radio>
     * ```
     * ```typescript
     * let isChecked =  this.radio.checked;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--checked')
    @Input({ transform: booleanAttribute })
    public override set checked(value: boolean) {
        this._checked = value;
    }
    public override get checked() {
        return this._checked;
    }

    /**
     * Sets/gets  the `disabled` attribute.
     * Default value is `false`.
     * ```html
     * <igx-radio disabled></igx-radio>
     * ```
     * ```typescript
     * let isDisabled =  this.radio.disabled;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--disabled')
    @Input({ transform: booleanAttribute })
    public override disabled = false;

    /**
     * Sets/gets whether the radio button is invalid.
     * Default value is `false`.
     * ```html
     * <igx-radio invalid></igx-radio>
     * ```
     * ```typescript
     * let isInvalid =  this.radio.invalid;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--invalid')
    @Input({ transform: booleanAttribute })
    public override invalid = false;

    /**
     * Sets/gets whether the radio component is on focus.
     * Default value is `false`.
     * ```typescript
     * this.radio.focus = true;
     * ```
     * ```typescript
     * let isFocused =  this.radio.focused;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--focused')
    public override focused = false;

    /**
     * @hidden
     * @internal
     */
    @HostListener('change', ['$event'])
    public _changed(event: Event) {
        if (event instanceof Event) {
            event.preventDefault();
        }
    }

    /**
     * @hidden
     */
    @HostListener('click')
    public override _onCheckboxClick() {
        this.select();
    }

    /**
     * Selects the current radio button.
     * ```typescript
     * this.radio.select();
     * ```
     *
     * @memberof IgxRadioComponent
     */
    public select() {
        if (!this.checked) {
            this.checked = true;
            this.change.emit({
                value: this.value,
                owner: this,
                checked: this.checked,
            });
            this._onChangeCallback(this.value);
        }
    }

    /**
     * Deselects the current radio button.
     * ```typescript
     * this.radio.deselect();
     * ```
     *
     * @memberof IgxRadioComponent
     */
    public deselect() {
        this.checked = false;
        this.focused = false;
        this.cdr.markForCheck();
    }

    /**
     * Checks whether the provided value is consistent to the current radio button.
     * If it is, the checked attribute will have value `true`;
     * ```typescript
     * this.radio.writeValue('radioButtonValue');
     * ```
     */
    public override writeValue(value: any) {
        this.value = this.value ?? value;

        if (value === this.value) {
            if (!this.checked) {
                this.checked = true;
            }
        } else {
            this.deselect();
        }
    }

    /**
     * @hidden
     */
    @HostListener('blur')
    public override onBlur() {
        super.onBlur();
        this.blurRadio.emit();
    }
}
