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
    get visibleCSS(): boolean {
        return this.tabs.isRightButtonVisible;
    }

    @HostBinding("class.igx-tabs__header-button--hidden")
    get hiddenCSS(): boolean {
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
    get visibleCSS(): boolean {
        return this.tabs.isLeftButtonVisible;
    }

    @HostBinding("class.igx-tabs__header-button--hidden")
    get hiddenCSS(): boolean {
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
