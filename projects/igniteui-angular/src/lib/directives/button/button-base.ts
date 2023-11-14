import { Directive, EventEmitter, HostBinding, HostListener, Input, Output, booleanAttribute } from '@angular/core';
import { DisplayDensityBase } from '../../core/density';

@Directive()
export abstract class IgxButtonBaseDirective extends DisplayDensityBase {
    /**
     * Called when the button is clicked.
     */
    @Output()
    public buttonClick = new EventEmitter<any>();

    /**
     * Sets/gets the `role` attribute.
     *
     * @example
     * ```typescript
     * this.button.role = 'navbutton';
     * let buttonRole = this.button.role;
     * ```
     */
    @HostBinding('attr.role')
    public role = 'button';

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(ev: MouseEvent) {
        this.buttonClick.emit(ev);
    }

    /**
      * Enables/disables the button.
      *
      * @example
      * ```html
      * <button igxButton="fab" disabled></button>
      * ```
      */
    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-button--disabled')
    public disabled = false;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.disabled')
    public get disabledAttribute() {
        return this.disabled ? this.disabled : null;
    }
}
