import { Directive, HostBinding, Input } from "@angular/core";

@Directive({
    selector: "[igxDrawerItem]",
    exportAs: "igxDrawerItem"
})
export class IgxNavDrawerItemDirective {

    @Input("active") public active = false;

    @Input("isHeader") public isHeader = false;

    public readonly activeClass = "igx-nav-drawer-item--active";

    private get activeClassBind() {
        return `class.${this.activeClass}`;
    }

    @HostBinding("class.igx-nav-drawer-item")
    get defaultCSS(): boolean {
        return !this.active && !this.isHeader;
    }

    @HostBinding(this.activeClassBind)
    get currentCSS(): boolean {
        return this.active && !this.isHeader;
    }

    @HostBinding("class.igx-nav-drawer-item--header")
    get headerCSS(): boolean {
        return this.isHeader;
    }
}
