import { Directive, HostBinding, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[igxDrawerItem]',
    exportAs: 'igxDrawerItem'
})
export class IgxNavDrawerItemDirective {

    /**
     * @hidden
     */
    @Input('active') public active;;

    /**
     * @hidden
     */
    @Input('isHeader') public isHeader;

    /**
     * @hidden
     */
    public readonly activeClass;

    /**
     * @hidden
     */
    @HostBinding('class.igx-nav-drawer__item')
    get defaultCSS(): boolean {
        return !this.active && !this.isHeader;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-nav-drawer__item--active')
    get currentCSS(): boolean {
        return this.active && !this.isHeader;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-nav-drawer__item--header')
    get headerCSS(): boolean {
        return this.isHeader;
    }
}

@Directive({
    selector: '[igxDrawer]'
})
export class IgxNavDrawerTemplateDirective {

    constructor(public template: TemplateRef<any>) {
     }
}

@Directive({
    selector: '[igxDrawerMini]'
})
export class IgxNavDrawerMiniTemplateDirective {

    constructor(public template: TemplateRef<any>) {
     }
}
