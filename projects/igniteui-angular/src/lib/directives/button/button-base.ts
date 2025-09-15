import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    Output,
    booleanAttribute, inject,
    inject,
    afterRenderEffect,
} from '@angular/core';
import { PlatformUtil } from '../../core/utils';

export const IgxBaseButtonType = {
    Flat: 'flat',
    Contained: 'contained',
    Outlined: 'outlined'
} as const;


@Directive()
export abstract class IgxButtonBaseDirective {
    private _platformUtil = inject(PlatformUtil);
    public element = inject(ElementRef);
    
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
        this.focused = false;
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('blur')
    protected onBlur() {
        this.focused = false;
    }

    /**
     * Sets/gets whether the button component is on focus.
     * Default value is `false`.
     * ```typescript
     * this.button.focus = true;
     * ```
     * ```typescript
     * let isFocused =  this.button.focused;
     * ```
     */
    @HostBinding('class.igx-button--focused')
    protected focused = false;

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

    protected constructor() {
        // In browser, set via native API for immediate effect (no-op on server).
        // In SSR there is no paint, so there’s no visual rendering or transitions to suppress.
        // Fix style flickering https://github.com/IgniteUI/igniteui-angular/issues/14759
        if (this._platformUtil.isBrowser) {
            afterRenderEffect({
                write: () => {
                    this.element.nativeElement.style.setProperty('--_init-transition', '0s');
                },
                read: () => {
                    requestAnimationFrame(() => {
                        this.element.nativeElement.style.removeProperty('--_init-transition');
                    });
                }
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('keyup', ['$event'])
    protected updateOnKeyUp(event: KeyboardEvent) {
        if (event.key === "Tab") {
            this.focused = true;
        }
    }

    /**
     * Returns the underlying DOM element.
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }
}
