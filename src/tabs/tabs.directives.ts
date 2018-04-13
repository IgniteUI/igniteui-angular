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
        if (this.tabs.applyRightButtonVisibleStyle) {
            this.tabs.applyRightButtonHiddenStyle = false;
            this.tabs.applyRightButtonNotDisplayedStyle = false;
        }

        return this.tabs.applyRightButtonVisibleStyle;
    }

    @HostBinding("class.igx-tabs__header-button--hidden")
    get hiddenCSS(): boolean {
        if (this.tabs.applyRightButtonHiddenStyle) {
            this.tabs.applyRightButtonVisibleStyle = false;
            this.tabs.applyRightButtonNotDisplayedStyle = false;
        }

        return this.tabs.applyRightButtonHiddenStyle;
    }

    @HostBinding("class.igx-tabs__header-button--none")
    get notDisplayedCSS(): boolean {
        if (this.tabs.applyRightButtonNotDisplayedStyle) {
            this.tabs.applyRightButtonVisibleStyle = false;
            this.tabs.applyRightButtonHiddenStyle = false;
        }

        return this.tabs.applyRightButtonNotDisplayedStyle;
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
        if (this.tabs.applyLeftButtonVisibleStyle) {
            this.tabs.applyLeftButtonHiddenStyle = false;
            this.tabs.applyLeftButtonNotDisplayedStyle = false;
        }

        return this.tabs.applyLeftButtonVisibleStyle;
    }

    @HostBinding("class.igx-tabs__header-button--hidden")
    get hiddenCSS(): boolean {
        if (this.tabs.applyLeftButtonHiddenStyle) {
            this.tabs.applyLeftButtonVisibleStyle = false;
            this.tabs.applyLeftButtonNotDisplayedStyle = false;
        }

        return this.tabs.applyLeftButtonHiddenStyle;
    }

    @HostBinding("class.igx-tabs__header-button--none")
    get notDisplayedCSS(): boolean {
        if (this.tabs.applyLeftButtonNotDisplayedStyle) {
            this.tabs.applyLeftButtonVisibleStyle = false;
            this.tabs.applyLeftButtonHiddenStyle = false;
        }

        return this.tabs.applyLeftButtonNotDisplayedStyle;
    }
}

@Directive({
    selector: "[igxTab]"
})
export class IgxTabItemTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
}
