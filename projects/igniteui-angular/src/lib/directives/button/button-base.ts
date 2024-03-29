import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, Optional, Output, booleanAttribute } from '@angular/core';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../../core/density';
import { mkenum } from '../../core/utils';

export const IgxBaseButtonType = /*@__PURE__*/mkenum({
    Flat: 'flat',
    Contained: 'contained',
    Outlined: 'outlined'
});

@Directive()
export abstract class IgxButtonBaseDirective extends DisplayDensityBase {
    /**
     * Emitted when the button is clicked.
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
        return this.disabled || null;
    }

    constructor(
        public element: ElementRef,
        @Optional() @Inject(DisplayDensityToken)
        protected _displayDensityOptions: IDisplayDensityOptions
    ) {
        super(_displayDensityOptions, element);
    }

    /**
     * Returns the underlying DOM element.
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }
}
