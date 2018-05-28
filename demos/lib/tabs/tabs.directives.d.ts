import { TemplateRef } from "@angular/core";
import { IgxTabsComponent } from "./tabs.component";
export declare class IgxRightButtonStyleDirective {
    tabs: IgxTabsComponent;
    constructor(tabs: IgxTabsComponent);
    private getRightButtonStyle();
    readonly visibleCSS: boolean;
    readonly hiddenCSS: boolean;
    readonly notDisplayedCSS: boolean;
}
export declare class IgxLeftButtonStyleDirective {
    tabs: IgxTabsComponent;
    constructor(tabs: IgxTabsComponent);
    private getLeftButtonStyle();
    readonly visibleCSS: boolean;
    readonly hiddenCSS: boolean;
    readonly notDisplayedCSS: boolean;
}
export declare class IgxTabItemTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
