import { Directive, HostBinding, Input } from "@angular/core";

@Directive({
    selector: "[igxDrawerItem]",
    exportAs: "igxDrawerItem"
})
export class IgxNavDrawerItemDirective {

    @Input("active") public active = false;

    @Input("isHeader") public isHeader = false;

    public readonly activeClass = "igx-nav-drawer__item--active";

    @HostBinding("class.igx-nav-drawer__item")
    get defaultCSS(): boolean {
        return !this.active && !this.isHeader;
    }

    @HostBinding("class.igx-nav-drawer__item--active")
    get currentCSS(): boolean {
        return this.active && !this.isHeader;
    }

    @HostBinding("class.igx-nav-drawer__item--header")
    get headerCSS(): boolean {
        return this.isHeader;
    }
}
