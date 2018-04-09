import {
    Directive,
    forwardRef,
    Host,
    HostBinding,
    Inject,
    TemplateRef
} from "@angular/core";
import { IgxTabsComponent } from "./tabs.component";

@Directive({
    selector: "[igxRightButtonStyle]"
})

export class IgxRightButtonStyleDirective {
    constructor(@Host() @Inject(forwardRef(() => IgxTabsComponent))
    public tabs: IgxTabsComponent) {
    }

    @HostBinding("class.igx-tabs__header-button")
    get defaultCSS(): boolean {
        return true;
    }

    @HostBinding("class.igx-tabs__header-button_visible")
    get visibleCSS(): boolean {
        console.log("right visible " + this.tabs.isRightButtonVisible);
        return this.tabs.isRightButtonVisible;
    }

    @HostBinding("class.igx-tabs__header-button__hidden")
    get hiddenCSS(): boolean {
        console.log("right hidden " + !this.tabs.isRightButtonVisible);
        return !this.tabs.isRightButtonVisible;
    }
}

@Directive({
    selector: "[igxLeftButtonStyle]"
})

export class IgxLeftButtonStyleDirective {
    constructor(@Host() @Inject(forwardRef(() => IgxTabsComponent))
    public tabs: IgxTabsComponent) {
    }

    @HostBinding("class.igx-tabs__header-button")
    get defaultCSS(): boolean {
        return true;
    }

    @HostBinding("class.igx-tabs__header-button_visible")
    get visibleCSS(): boolean {
        console.log("left visible " + this.tabs.isLeftButtonVisible);
        return this.tabs.isLeftButtonVisible;
    }

    @HostBinding("class.igx-tabs__header-button__hidden")
    get hiddenCSS(): boolean {
        console.log("left hidden " + !this.tabs.isLeftButtonVisible);
        return !this.tabs.isLeftButtonVisible;
    }
}

@Directive({
    selector: "[igxTab]"
})
export class IgxTabItemTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
}