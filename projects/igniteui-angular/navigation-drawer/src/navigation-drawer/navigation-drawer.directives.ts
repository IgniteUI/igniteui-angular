import { Directive, HostBinding, Input, TemplateRef, booleanAttribute } from '@angular/core';

@Directive({
    selector: '[igxDrawerItem]',
    exportAs: 'igxDrawerItem',
    standalone: true
})
export class IgxNavDrawerItemDirective {

    /**
     * Styles a navigation drawer item as selected.
     * If not set, `active` will have default value `false`.
     *
     * @example
     * ```html
     * <span igxDrawerItem [active]="true">Active Item</span>
     * ```
     */
    @Input({ transform: booleanAttribute }) public active = false;

    /**
     * Disables a navigation drawer item.
     * If not set, `disabled` will have default value `false`.
     *
     * @example
     * ```html
     * <span igxDrawerItem [disabled]="true">Disabled Item</span>
     * ```
     */
    @Input({ transform: booleanAttribute }) public disabled = false;

    /**
     * Styles a navigation drawer item as a group header.
     * If not set, `isHeader` will have default value `false`.
     *
     * @example
     * ```html
     * <span igxDrawerItem [isHeader]="true">Header</span>
     * ```
     */
    @Input({ transform: booleanAttribute }) public isHeader = false;

    /**
     * @hidden
     */
    public readonly activeClass = 'igx-nav-drawer__item--active';

     /**
     * @hidden
     */
     public readonly disabledClass = 'igx-nav-drawer__item--disabled';

    /**
     * @hidden
     */
    @HostBinding('class.igx-nav-drawer__item')
    public get defaultCSS(): boolean {
        return !this.active && !this.isHeader;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-nav-drawer__item--active')
    public get currentCSS(): boolean {
        return this.active && !this.isHeader && !this.disabled;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-nav-drawer__item--header')
    public get headerCSS(): boolean {
        return this.isHeader;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-nav-drawer__item--disabled')
    public get disabledCSS(): boolean {
        return this.disabled;
    }
}

@Directive({
    selector: '[igxDrawer]',
    standalone: true
})
export class IgxNavDrawerTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
}

@Directive({
    selector: '[igxDrawerMini]',
    standalone: true
})
export class IgxNavDrawerMiniTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
}
