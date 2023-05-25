import { Directive, HostBinding, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[igxDrawerItem]',
    exportAs: 'igxDrawerItem',
    standalone: true
})
export class IgxNavDrawerItemDirective {

    /**
     * @hidden
     */
    @Input('active') public active = false;

    /**
     * @hidden
     */
    @Input('isHeader') public isHeader = false;

    /**
     * @hidden
     */
    public readonly activeClass = 'igx-nav-drawer__item--active';

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
        return this.active && !this.isHeader;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-nav-drawer__item--header')
    public get headerCSS(): boolean {
        return this.isHeader;
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
