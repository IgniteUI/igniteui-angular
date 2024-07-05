import { Directive, HostBinding, Input, TemplateRef, booleanAttribute } from '@angular/core';

@Directive({
    selector: '[igxDrawerItem]',
    exportAs: 'igxDrawerItem',
    standalone: true
})
export class IgxNavDrawerItemDirective {

    /**
     * @hidden
     */
    @Input({ alias: 'active', transform: booleanAttribute }) public active = false;

    /**
     * @hidden
     */
    @Input({ alias: 'disabled', transform: booleanAttribute }) public disabled = false;

    /**
     * @hidden
     */
    @Input({ alias: 'isHeader', transform: booleanAttribute }) public isHeader = false;

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
